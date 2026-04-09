'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/actions/auth'

export function LoginForm({ urlError }: { urlError?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined)
  const error = state?.error ?? (urlError === 'unauthorized' ? 'Access denied. Admin accounts only.' : undefined)

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-1.5" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2 flex items-center justify-center gap-2"
      >
        {pending && (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
