import { getPlatformStats } from "@/lib/dal/platform";
import { StatCard } from "@/components/ui/stat-card";

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-neutral-700 mb-4">
            Quick links
          </h2>
          <div className="space-y-2 text-sm">
            <a
              href="/users"
              className="flex items-center gap-2 text-neutral-500 hover:text-orange-400 transition-colors"
            >
              <span className="text-orange-400">→</span> Manage users
            </a>
            <a
              href="/workspaces"
              className="flex items-center gap-2 text-neutral-500 hover:text-orange-500 transition-colors"
            >
              <span className="text-cyan-500">→</span> View workspaces
            </a>
            <a
              href="/referrals"
              className="flex items-center gap-2 text-neutral-500 hover:text-orange-400 transition-colors"
            >
              <span className="text-orange-400">→</span> Referral commissions
            </a>
          </div>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-neutral-700 mb-2">
            Security
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All operations use the service role key server-side. Client code
            never has access to privileged credentials. Admin role is enforced
            at both the proxy and DAL layer on every request.
          </p>
        </div>
      </div>
    </div>
  );
}
