'use server'

import { markCommissionPaid } from '@/lib/dal/referrals'
import { revalidatePath } from 'next/cache'

export async function markCommissionPaidAction(commissionId: string): Promise<void> {
  await markCommissionPaid(commissionId)
  revalidatePath('/referrals')
}
