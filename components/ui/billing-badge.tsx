import { Badge } from './badge'

type BadgeVariant = 'active' | 'banned' | 'admin' | 'pending' | 'suspended'

const STATUS_MAP: Record<string, BadgeVariant> = {
  active:              'active',
  pending:             'pending',
  past_due:            'suspended',
  canceled_pending:    'suspended',
  suspended_dunning:   'suspended',
  terminated:          'banned',
  restricted_overage:  'suspended',
}

export function accountStatusToBadge(status: string): BadgeVariant {
  return STATUS_MAP[status] ?? 'pending'
}

export function BillingStatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-400 text-xs">No billing</span>
  return <Badge variant={accountStatusToBadge(status)} />
}
