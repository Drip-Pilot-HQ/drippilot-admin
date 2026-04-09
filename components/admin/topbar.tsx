'use client'

import { useSidebarStore } from '@/store/admin'

type TopbarProps = { adminEmail: string }

export function Topbar({ adminEmail }: TopbarProps) {
  const toggle = useSidebarStore((s) => s.toggle)

  return (
    <header className="h-16 border-b border-neutral-200 bg-white flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={toggle}
        className="lg:hidden p-2 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
        aria-label="Toggle menu"
      >
        ☰
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <span className="text-xs text-neutral-400 hidden sm:block">{adminEmail}</span>
        <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 text-xs font-bold">
          {adminEmail[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
