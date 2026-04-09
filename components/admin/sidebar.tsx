'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSidebarStore } from '@/store/admin'
import { logoutAction } from '@/app/actions/auth'

const NAV = [
  { href: '/', label: 'Overview', icon: '▦' },
  { href: '/users', label: 'Users', icon: '◈' },
  { href: '/workspaces', label: 'Workspaces', icon: '⬡' },
  { href: '/referrals', label: 'Referrals', icon: '◎' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useSidebarStore()

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={close} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-neutral-200 z-30
          flex flex-col transition-transform duration-200 shadow-sm
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="h-16 mx-auto flex items-center px-6 border-b border-neutral-100">
          <Image src="/logo.png" alt="Drippilot" width={80} height={80} priority />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                  }
                `}
              >
                <span className={`text-base ${active ? 'text-orange-500' : 'text-neutral-400'}`}>{icon}</span>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-neutral-100">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
