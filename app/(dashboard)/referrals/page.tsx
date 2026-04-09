import { getReferrersSummary } from "@/lib/dal/referrals";
import { MarkPaidButton } from "@/components/admin/mark-paid-button";

function fmt(cents: number) {
  return "$" + (cents / 100).toFixed(2);
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ReferralsPage() {
  const referrers = await getReferrersSummary();

  const totalPending = referrers.reduce(
    (s, r) => s + r.pending_commission_cents,
    0,
  );
  const totalPaid = referrers.reduce((s, r) => s + r.paid_commission_cents, 0);
  const totalSignups = referrers.reduce((s, r) => s + r.signup_count, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Referrals</h1>
        <p className="text-sm text-neutral-400 mt-1">
          Commission tracking per referrer
        </p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Referrers",
            value: referrers.length,
            color: "text-orange-400",
            border: "border-l-orange-400",
          },
          {
            label: "Total Signups",
            value: totalSignups,
            color: "text-orange-500",
            border: "border-l-cyan-400",
          },
          {
            label: "Pending Payout",
            value: fmt(totalPending),
            color: "text-amber-600",
            border: "border-l-amber-400",
          },
          {
            label: "Total Paid",
            value: fmt(totalPaid),
            color: "text-orange-500",
            border: "border-l-cyan-400",
          },
        ].map(({ label, value, color, border }) => (
          <div
            key={label}
            className={`bg-white border border-neutral-200 border-l-4 ${border} rounded-xl p-4 shadow-sm`}
          >
            <p className="text-xs text-neutral-400 uppercase tracking-widest font-medium">
              {label}
            </p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {referrers.length === 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center shadow-sm">
          <p className="text-neutral-400 text-sm">No referral activity yet.</p>
        </div>
      )}

      {/* Per-referrer cards */}
      <div className="space-y-5">
        {referrers.map((referrer) => {
          const pendingCount = referrer.commissions.filter(
            (c) => c.status === "pending",
          ).length;

          return (
            <div
              key={referrer.owner_id}
              className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm"
            >
              {/* ── Referrer header ── */}
              <div className="px-5 py-4 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                    {referrer.owner_email[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm leading-tight">
                      {referrer.owner_email}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="font-mono text-xs bg-orange-50 text-orange-600 border border-orange-100 px-1.5 py-0.5 rounded">
                        {referrer.referral_code}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {referrer.signup_count} signup
                        {referrer.signup_count !== 1 ? "s" : ""}
                      </span>
                      {pendingCount > 0 && (
                        <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                          {pendingCount} pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Summary totals */}
                <div className="flex items-center gap-5 text-right">
                  {referrer.pending_commission_cents > 0 && (
                    <div>
                      <p className="text-xs text-neutral-400 leading-none">
                        Pending
                      </p>
                      <p className="font-bold text-amber-600 text-base mt-0.5">
                        {fmt(referrer.pending_commission_cents)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-neutral-400 leading-none">
                      Total earned
                    </p>
                    <p className="font-bold text-neutral-700 text-base mt-0.5">
                      {fmt(referrer.total_commission_cents)}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Commission list ── */}
              {referrer.commissions.length === 0 ? (
                <p className="px-5 py-5 text-sm text-neutral-400">
                  No commissions yet.
                </p>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {referrer.commissions.map((c, i) => (
                    <div
                      key={c.id}
                      className={`px-5 py-3.5 flex items-center gap-4 flex-wrap transition-colors ${
                        c.status === "pending"
                          ? "hover:bg-amber-50/50"
                          : "hover:bg-neutral-50"
                      }`}
                    >
                      {/* Row index + status dot */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-neutral-300 w-4 text-right tabular-nums">
                          #{i + 1}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${c.status === "paid" ? "bg-cyan-400" : "bg-amber-400"}`}
                        />
                      </div>

                      {/* Workspace + referred user */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">
                          {c.workspace_name}
                        </p>
                        <p className="text-xs text-neutral-400 mt-0.5 truncate">
                          referred: {c.referred_email}
                        </p>
                      </div>

                      {/* Date */}
                      <p className="text-xs text-neutral-400 hidden sm:block shrink-0">
                        {fmtDate(c.created_at)}
                      </p>

                      {/* Invoice amount */}
                      <div className="text-right shrink-0 hidden md:block">
                        <p className="text-xs text-neutral-400 leading-none">
                          Invoice
                        </p>
                        <p className="text-sm text-neutral-600 mt-0.5">
                          {fmt(c.invoice_amount_cents)}
                        </p>
                      </div>

                      {/* Commission amount */}
                      <div className="text-right shrink-0">
                        <p className="text-xs text-neutral-400 leading-none">
                          Commission ({c.commission_rate}%)
                        </p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${c.status === "paid" ? "text-orange-500" : "text-amber-600"}`}
                        >
                          {fmt(c.commission_amount_cents)}
                        </p>
                      </div>

                      {/* Status / action — fixed width so rows align */}
                      <div className="shrink-0 w-28 flex justify-end">
                        {c.status === "paid" ? (
                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.5}
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Paid
                            </span>
                            {c.paid_at && (
                              <p className="text-xs text-neutral-400 mt-1 text-right">
                                {fmtDate(c.paid_at)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <MarkPaidButton commissionId={c.id} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
