'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'

type ActionButtonProps = {
  onAction: () => Promise<void>
  label: string
  pendingLabel?: string
  successMessage: string
  errorMessage?: string
  variant?: 'danger' | 'success' | 'primary' | 'default'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  danger:  'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50',
  success: 'bg-cyan-50 border border-cyan-200 text-cyan-700 hover:bg-cyan-100 disabled:opacity-50',
  primary: 'bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50',
  default: 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50',
}

const sizeStyles = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function ActionButton({
  onAction,
  label,
  pendingLabel = 'Processing…',
  successMessage,
  errorMessage = 'Something went wrong. Please try again.',
  variant = 'default',
  size = 'sm',
  className = '',
}: ActionButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await onAction()
        toast.success(successMessage)
      } catch (err) {
        const msg = err instanceof Error ? err.message : errorMessage
        toast.error(msg)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`
        inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors cursor-pointer
        disabled:cursor-not-allowed
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
    >
      {isPending && (
        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {isPending ? pendingLabel : label}
    </button>
  )
}
