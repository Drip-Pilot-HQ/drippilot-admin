import 'server-only'
import { requireAdmin } from '../auth'
import { createAdminClient } from '../supabase/admin'

export type PlatformStats = {
  total_users: number
  banned_users: number
  new_users_7d: number
  total_workspaces: number
  active_subscriptions: number
  total_campaigns: number
  active_campaigns: number
  total_leads: number
  pending_commissions: number
  pending_commission_amount_cents: number
}

export async function getPlatformStats(): Promise<PlatformStats> {
  await requireAdmin()
  const supabase = createAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: total_users },
    { count: new_users_7d },
    { count: total_workspaces },
    { count: active_subscriptions },
    { count: total_campaigns },
    { count: active_campaigns },
    { count: total_leads },
    { data: commissions },
    { data: authData },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    supabase.from('workspace').select('*', { count: 'exact', head: true }),
    supabase.from('workspace_billing').select('*', { count: 'exact', head: true }).eq('account_status', 'active'),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }),
    supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('referral_commissions').select('commission_amount_cents').eq('status', 'pending'),
    supabase.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const banned_users = (authData?.users ?? []).filter((u) => u.banned_until != null).length
  const pending_commissions = commissions?.length ?? 0
  const pending_commission_amount_cents = (commissions ?? []).reduce(
    (sum, c) => sum + (c.commission_amount_cents ?? 0),
    0
  )

  return {
    total_users: total_users ?? 0,
    banned_users,
    new_users_7d: new_users_7d ?? 0,
    total_workspaces: total_workspaces ?? 0,
    active_subscriptions: active_subscriptions ?? 0,
    total_campaigns: total_campaigns ?? 0,
    active_campaigns: active_campaigns ?? 0,
    total_leads: total_leads ?? 0,
    pending_commissions,
    pending_commission_amount_cents,
  }
}
