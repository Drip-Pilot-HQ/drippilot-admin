"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebarStore } from "@/store/admin";
import { logoutAction } from "@/app/actions/auth";

import { LayoutDashboard, Users, Briefcase, Gift, LogOut } from "lucide-react";

const NAV = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/referrals", label: "Referrals", icon: Gift },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={close}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-60 bg-white border-r border-neutral-200 z-30
          flex flex-col transition-transform duration-200 shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0 lg:flex
        `}
      >
        {/* Logo */}
        <div className="h-16 mx-auto flex items-center px-6 border-b border-neutral-100">
          <Image
            src="/logo.png"
            alt="Drippilot"
            width={80}
            height={80}
            priority
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                prefetch={true}
                onClick={close}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-medium transition-all duration-300 group
                  ${
                    active
                      ? "bg-orange-50 text-orange-600 shadow-sm ring-1 ring-orange-200/50"
                      : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/80 active:scale-[0.98]"
                  }
                `}
              >
                <span
                  className={`
                    flex items-center justify-center transition-all duration-300
                    ${active ? "text-orange-500 shadow-sm" : "text-neutral-400 group-hover:text-neutral-600 group-hover:scale-110 group-active:scale-95"}
                  `}
                >
                  <Icon className="w-5 h-5 stroke-[2px]" />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-neutral-100 mt-auto">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-medium text-neutral-500 hover:text-red-600 hover:bg-rose-50/80 transition-all duration-300 group active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5 stroke-[2px] transition-transform duration-300 group-hover:-translate-x-1" />
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
