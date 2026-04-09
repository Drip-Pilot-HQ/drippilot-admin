import { getPlatformStats } from "@/lib/dal/platform";
import { StatCard } from "@/components/ui/stat-card";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Briefcase,
  Gift,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
function fmt(cents: number) {
  return (
    "$" +
    (cents / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default async function OverviewPage() {
  const s = await getPlatformStats();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">Platform at a glance</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Users
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={s.total_users} accent="orange" />
          <StatCard label="New (7 days)" value={s.new_users_7d} accent="cyan" />
          <StatCard label="Banned" value={s.banned_users} accent="orange" />
          <StatCard
            label="Workspaces"
            value={s.total_workspaces}
            accent="cyan"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Billing
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Active Subscriptions"
            value={s.active_subscriptions}
            accent="cyan"
          />
          <StatCard
            label="Pending Commissions"
            value={s.pending_commissions}
            accent="orange"
          />
          <StatCard
            label="Pending Payout"
            value={fmt(s.pending_commission_amount_cents)}
            accent="cyan"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
          Activity
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Total Campaigns"
            value={s.total_campaigns}
            accent="orange"
          />
          <StatCard
            label="Active Campaigns"
            value={s.active_campaigns}
            accent="cyan"
          />
          <StatCard
            label="Total Leads"
            value={s.total_leads.toLocaleString()}
            accent="orange"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Quick Links Card */}
        <div className="relative overflow-hidden bg-white border border-neutral-200/60 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-100/50 rounded-lg text-orange-500">
              <Sparkles className="w-5 h-5 stroke-[2px]" />
            </div>
            <h2 className="text-base font-semibold text-neutral-800 tracking-tight">
              Quick Actions
            </h2>
          </div>

          <div className="grid gap-3">
            <Link
              href="/users"
              prefetch={true}
              className="group/link flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover/link:bg-white flex items-center justify-center text-neutral-500 group-hover/link:text-orange-500 transition-colors shadow-sm">
                  <Users className="w-4 h-4 stroke-[2px]" />
                </div>
                <span className="text-sm font-medium text-neutral-600 group-hover/link:text-neutral-900 transition-colors">
                  Manage users
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover/link:text-orange-500 transition-colors group-hover/link:-translate-x-1" />
            </Link>

            <Link
              href="/workspaces"
              prefetch={true}
              className="group/link flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover/link:bg-white flex items-center justify-center text-neutral-500 group-hover/link:text-cyan-500 transition-colors shadow-sm">
                  <Briefcase className="w-4 h-4 stroke-[2px]" />
                </div>
                <span className="text-sm font-medium text-neutral-600 group-hover/link:text-neutral-900 transition-colors">
                  View workspaces
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover/link:text-cyan-500 transition-colors group-hover/link:-translate-x-1" />
            </Link>

            <Link
              href="/referrals"
              prefetch={true}
              className="group/link flex items-center justify-between p-3 rounded-xl border border-neutral-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover/link:bg-white flex items-center justify-center text-neutral-500 group-hover/link:text-orange-500 transition-colors shadow-sm">
                  <Gift className="w-4 h-4 stroke-[2px]" />
                </div>
                <span className="text-sm font-medium text-neutral-600 group-hover/link:text-neutral-900 transition-colors">
                  Referral commissions
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-300 group-hover/link:text-orange-500 transition-colors group-hover/link:-translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Security Info Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-800 text-white border border-neutral-800 rounded-2xl p-6 shadow-md">
          {/* Subtle background glow effect */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none" />

          <div className="flex flex-col h-full relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-white/10 rounded-lg text-white backdrop-blur-sm shadow-sm ring-1 ring-white/20">
                <ShieldCheck className="w-5 h-5 stroke-[2px]" />
              </div>
              <h2 className="text-base font-semibold tracking-tight text-white">
                Platform Security
              </h2>
            </div>

            <p className="text-[13px] text-neutral-300 leading-relaxed max-w-sm mt-auto mb-4 font-medium">
              All operations use the service role key server-side. Client code
              never has access to privileged credentials.
            </p>

            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">
                Admin Role Enforced
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
