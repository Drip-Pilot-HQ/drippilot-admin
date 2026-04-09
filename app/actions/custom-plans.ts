'use server'

import Stripe from 'stripe'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import type { CustomPlanLimits } from '@/lib/dal/custom-plans'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-03-31.basil' })

export interface CreateCustomPlanInput {
  workspaceId: string
  name: string
  priceCents: number
  billingInterval: 'monthly' | 'yearly'
  limits: CustomPlanLimits
  adminEmail: string
}

export interface CreateCustomPlanResult {
  invoicedEmail: string
  customPlanId: string
  stripePriceId: string
  stripeSubscriptionId: string
}

/**
 * Creates a Stripe product + recurring price for the custom plan, records it in
 * custom_plans, then creates a subscription with collection_method=send_invoice so
 * Stripe emails the workspace owner an invoice to pay. Once paid, and on every
 * subsequent billing cycle, Stripe fires invoice.payment_succeeded which the backend
 * webhook handles to activate limits and grant credits.
 */
export async function createCustomPlanAction(
  input: CreateCustomPlanInput
): Promise<CreateCustomPlanResult> {
  const supabase = createAdminClient()

  const { data: workspace, error: wsError } = await supabase
    .from('workspace')
    .select('id, name, owner_id, users!owner_id(email)')
    .eq('id', input.workspaceId)
    .single()

  if (wsError || !workspace) throw new Error('Workspace not found')

  const ownerEmail = (workspace.users as unknown as { email: string } | null)?.email
  if (!ownerEmail) throw new Error('Workspace owner has no email address')

  const { data: billing } = await supabase
    .from('workspace_billing')
    .select('stripe_customer_id')
    .eq('workspace_id', input.workspaceId)
    .single()

  let stripeCustomerId: string | undefined = billing?.stripe_customer_id ?? undefined

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: workspace.name,
      email: ownerEmail,
      metadata: { workspaceId: input.workspaceId },
    })
    stripeCustomerId = customer.id

    await supabase.from('workspace_billing').upsert(
      {
        workspace_id: input.workspaceId,
        stripe_customer_id: stripeCustomerId,
        plan_id: 'enterprise',
        account_status: 'pending',
        cancel_at_period_end: false,
      },
      { onConflict: 'workspace_id' }
    )
  } else {
    // Ensure the Stripe customer has the owner's current email so the invoice
    // is delivered to the right address.
    await stripe.customers.update(stripeCustomerId, { email: ownerEmail })
  }

  const product = await stripe.products.create({
    name: input.name,
    metadata: { workspaceId: input.workspaceId, planType: 'custom_enterprise' },
  })

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: input.priceCents,
    currency: 'usd',
    recurring: {
      interval: input.billingInterval === 'monthly' ? 'month' : 'year',
    },
    metadata: { workspaceId: input.workspaceId, planType: 'custom_enterprise' },
  })

  const { data: customPlan, error: insertError } = await supabase
    .from('custom_plans')
    .insert({
      name: input.name,
      stripe_price_id: price.id,
      stripe_product_id: product.id,
      billing_interval: input.billingInterval,
      price_cents: input.priceCents,
      limits: input.limits,
      target_workspace_id: input.workspaceId,
      created_by: input.adminEmail,
    })
    .select('id')
    .single()

  if (insertError || !customPlan) {
    await stripe.prices.update(price.id, { active: false })
    await stripe.products.update(product.id, { active: false })
    throw new Error('Failed to save custom plan: ' + insertError?.message)
  }

  // Create the subscription. Stripe will immediately send an invoice email to the
  // customer. On payment (and every subsequent billing cycle), invoice.payment_succeeded
  // fires — the backend webhook activates limits and grants credits.
  let subscription: Stripe.Subscription
  try {
    subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: price.id }],
      collection_method: 'send_invoice',
      days_until_due: 7,
      metadata: {
        workspaceId: input.workspaceId,
        planId: 'enterprise',
        interval: input.billingInterval,
      },
    })
  } catch (err) {
    // Roll back DB + Stripe objects on subscription creation failure.
    await supabase.from('custom_plans').delete().eq('id', customPlan.id as string)
    await stripe.prices.update(price.id, { active: false })
    await stripe.products.update(product.id, { active: false })
    throw err
  }

  revalidatePath(`/workspaces/${input.workspaceId}`)

  return {
    invoicedEmail: ownerEmail,
    customPlanId: customPlan.id as string,
    stripePriceId: price.id,
    stripeSubscriptionId: subscription.id,
  }
}

/**
 * Archives a custom plan (soft delete). Does not cancel the Stripe subscription —
 * the workspace's existing subscription continues until it ends or is canceled separately.
 */
export async function archiveCustomPlanAction(customPlanId: string, workspaceId: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('custom_plans')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', customPlanId)
    .is('archived_at', null)

  if (error) throw new Error('Failed to archive custom plan')
  revalidatePath(`/workspaces/${workspaceId}`)
}
