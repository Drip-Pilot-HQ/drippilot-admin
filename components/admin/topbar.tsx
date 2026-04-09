"use client";

import { useSidebarStore } from "@/store/admin";
import { Menu, Bell } from "lucide-react";

type TopbarProps = { adminEmail: string };

export function Topbar({ adminEmail }: TopbarProps) {
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <header className="h-16 border-b border-neutral-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 transition-all duration-300">
      <button
        onClick={toggle}
        className="lg:hidden p-2.5 text-neutral-500 hover:text-neutral-900 rounded-[10px] hover:bg-neutral-100/80 transition-all duration-300 active:scale-95 flex items-center justify-center bg-white border border-neutral-200 shadow-sm"
        aria-label="Toggle menu"
      >
        <Menu className="w-4 h-4 stroke-[2px]" />
      </button>
      <div className="hidden lg:block">
        <h2 className="text-[15px] font-semibold text-neutral-800 tracking-tight">
          Dashboard Overview
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors relative">
          <Bell className="w-5 h-5 stroke-[2px]" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>
        <div className="h-6 w-px bg-neutral-200 hidden sm:block" />
        <div className="flex items-center gap-3 cursor-pointer group px-2 py-1.5 rounded-full hover:bg-neutral-50 transition-colors">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-medium text-neutral-700 leading-none mb-1">
              Admin
            </span>
            <span className="text-[11px] text-neutral-400 leading-none">
              {adminEmail}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-orange-50 border border-orange-200/60 shadow-sm flex items-center justify-center text-orange-600 text-sm font-bold group-hover:scale-105 transition-transform duration-300 ring-2 ring-transparent group-hover:ring-orange-100">
            {adminEmail[0]?.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
