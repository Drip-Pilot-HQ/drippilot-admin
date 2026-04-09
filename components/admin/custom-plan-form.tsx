'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createCustomPlanAction, archiveCustomPlanAction } from '@/app/actions/custom-plans'
import type { CustomPlan } from '@/lib/dal/custom-plans'

type Props = {
  workspaceId: string
  adminEmail: string
  existingPlans: CustomPlan[]
}

const DEFAULT_LIMITS = {
  maxSeats: null as number | null,
  maxPhoneAliases: null as number | null,
  maxEmailAliases: null as number | null,
  maxKnowledgeBases: null as number | null,
  maxMessageCredits: null as number | null,
  whitelabelEnabled: true,
}

export function CustomPlanForm({ workspaceId, adminEmail, existingPlans }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [invoicedEmail, setInvoicedEmail] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [priceDollars, setPriceDollars] = useState('')
  const [interval, setInterval] = useState<'monthly' | 'yearly'>('monthly')
  const [limits, setLimits] = useState({ ...DEFAULT_LIMITS })

  function updateLimit(key: keyof typeof DEFAULT_LIMITS, raw: string) {
    if (key === 'whitelabelEnabled') return
    const val = raw === '' ? null : parseInt(raw, 10)
    setLimits((prev) => ({ ...prev, [key]: isNaN(val as number) ? null : val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const priceCents = Math.round(parseFloat(priceDollars) * 100)
    if (!name.trim() || isNaN(priceCents) || priceCents <= 0) {
      toast.error('Name and a valid price are required.')
      return
    }

    startTransition(async () => {
      try {
        const result = await createCustomPlanAction({
          workspaceId,
          name: name.trim(),
          priceCents,
          billingInterval: interval,
          limits,
          adminEmail,
        })
        setInvoicedEmail(result.invoicedEmail)
        setShowForm(false)
        toast.success(`Invoice email sent to ${result.invoicedEmail}`)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create custom plan.')
      }
    })
  }

  function handleArchive(planId: string) {
    startTransition(async () => {
      try {
        await archiveCustomPlanAction(planId, workspaceId)
        toast.success('Plan archived.')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to archive plan.')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Invoice sent confirmation */}
      {invoicedEmail && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-700 mb-0.5">Invoice email sent by Stripe</p>
            <p className="text-xs text-emerald-600">{invoicedEmail}</p>
          </div>
          <span className="text-emerald-500 text-lg">✓</span>
        </div>
      )}

      {/* Existing plans */}
      {existingPlans.length > 0 && (
        <div className="divide-y divide-neutral-100">
          {existingPlans.map((plan) => (
            <div key={plan.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-800">{plan.name}</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  ${(plan.price_cents / 100).toFixed(2)} / {plan.billing_interval} ·{' '}
                  <span className="font-mono text-neutral-300 text-[11px]">{plan.stripe_price_id}</span>
                </p>
              </div>
              <button
                disabled={isPending}
                onClick={() => handleArchive(plan.id)}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors"
              >
                Archive
              </button>
            </div>
          ))}
        </div>
      )}

      {existingPlans.length === 0 && !showForm && (
        <p className="text-sm text-neutral-400 py-2">No active custom plans.</p>
      )}

      {/* Create form */}
      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Name + Price + Interval */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs text-neutral-400 mb-1">Plan name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Growth Plan"
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Price (USD)</label>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                placeholder="299.00"
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Interval</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as 'monthly' | 'yearly')}
                className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          {/* Limits */}
          <div>
            <p className="text-xs font-medium text-neutral-500 mb-2 uppercase tracking-wide">Limits — leave blank for unlimited</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(
                [
                  { key: 'maxSeats', label: 'Seats' },
                  { key: 'maxPhoneAliases', label: 'Phone aliases' },
                  { key: 'maxEmailAliases', label: 'Email aliases' },
                  { key: 'maxKnowledgeBases', label: 'Knowledge bases' },
                  { key: 'maxMessageCredits', label: 'Message credits' },
                ] as const
              ).map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs text-neutral-400 mb-1">{label}</label>
                  <input
                    type="number"
                    min="0"
                    value={limits[key] ?? ''}
                    onChange={(e) => updateLimit(key, e.target.value)}
                    placeholder="Unlimited"
                    className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                  />
                </div>
              ))}
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limits.whitelabelEnabled}
                    onChange={(e) => setLimits((prev) => ({ ...prev, whitelabelEnabled: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500"
                  />
                  Whitelabel
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors font-medium"
            >
              {isPending ? 'Creating…' : 'Create & send invoice'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => { setShowForm(true); setInvoicedEmail(null) }}
          className="text-sm text-orange-500 hover:text-orange-700 font-medium transition-colors"
        >
          + Create custom plan
        </button>
      )}
    </div>
  )
}
