'use server'

import { setUserBanned } from '@/lib/dal/users'
import { revalidatePath } from 'next/cache'

export async function banUserAction(userId: string) {
  await setUserBanned(userId, true)
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}

export async function unbanUserAction(userId: string) {
  await setUserBanned(userId, false)
  revalidatePath('/users')
  revalidatePath(`/users/${userId}`)
}
