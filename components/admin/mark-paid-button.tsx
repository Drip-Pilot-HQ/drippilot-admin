'use client'

import { ActionButton } from '@/components/ui/action-button'
import { markCommissionPaidAction } from '@/app/actions/referrals'

export function MarkPaidButton({ commissionId }: { commissionId: string }) {
  return (
    <ActionButton
      onAction={() => markCommissionPaidAction(commissionId)}
      label="Mark paid"
      pendingLabel="Saving…"
      successMessage="Commission marked as paid."
      errorMessage="Failed to update commission."
      variant="primary"
      size="sm"
    />
  )
}
