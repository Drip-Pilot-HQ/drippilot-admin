import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorkspaceDetail } from "@/lib/dal/workspaces";
import { getCustomPlansByWorkspace } from "@/lib/dal/custom-plans";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import {
  BillingStatusBadge,
  accountStatusToBadge,
} from "@/components/ui/billing-badge";
import { CustomPlanForm } from "@/components/admin/custom-plan-form";

type Props = { params: Promise<{ id: string }> };

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral-100 last:border-0">
      <span className="text-xs text-neutral-400 shrink-0 w-44">{label}</span>
      <span className="text-sm text-neutral-700 text-right">
        {value ?? <span className="text-neutral-300">—</span>}
      </span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
        <h2 className="text-sm font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function WorkspaceDetailPage({ params }: Props) {
  const { id } = await params;
  const [ws, admin, customPlans] = await Promise.all([
    getWorkspaceDetail(id),
    requireAdmin(),
    getCustomPlansByWorkspace(id),
  ]);
  if (!ws) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/workspaces"
        className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
      >
        ← Back to workspaces
      </Link>

      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-neutral-900 font-semibold text-xl">
              {ws.name}
            </h1>
            <p className="text-neutral-400 text-xs mt-1">
              Created {fmtDate(ws.created_at)} ·{" "}
              <span className="font-mono text-neutral-300">{ws.id}</span>
            </p>
          </div>
          <BillingStatusBadge status={ws.billing?.account_status ?? null} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-neutral-100">
          {[
            {
              label: "Members",
              value: ws.members.length,
              color: "text-orange-400",
            },
            {
              label: "Campaigns",
              value: ws.campaign_count,
              color: "text-orange-500",
            },
            {
              label: "Leads",
              value: ws.lead_count.toLocaleString(),
              color: "text-orange-400",
            },
            {
              label: "Aliases",
              value: ws.email_alias_count + ws.phone_alias_count,
              color: "text-orange-500",
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Owner">
          <InfoRow
            label="Email"
            value={
              <Link
                href={`/users/${ws.owner.id}`}
                className="text-orange-400 hover:text-orange-600 transition-colors"
              >
                {ws.owner.email}
              </Link>
            }
          />
          <InfoRow label="Name" value={ws.owner.name} />
        </Section>

        <Section title="Billing">
          <InfoRow
            label="Account status"
            value={
              ws.billing ? (
                <Badge
                  variant={accountStatusToBadge(ws.billing.account_status)}
                />
              ) : null
            }
          />
          <InfoRow
            label="Plan"
            value={
              ws.billing?.plan_id && ws.billing.plan_id !== "none" ? (
                <span className="text-orange-400 capitalize font-semibold">
                  {ws.billing.plan_id}
                </span>
              ) : (
                "Free"
              )
            }
          />
          <InfoRow
            label="Billing interval"
            value={
              ws.billing?.billing_interval ? (
                <span className="capitalize">
                  {ws.billing.billing_interval}
                </span>
              ) : null
            }
          />
          <InfoRow
            label="Current period"
            value={
              ws.billing?.current_period_start && ws.billing?.current_period_end
                ? `${fmtDate(ws.billing.current_period_start)} – ${fmtDate(ws.billing.current_period_end)}`
                : null
            }
          />
          <InfoRow
            label="Cancel at period end"
            value={
              ws.billing?.cancel_at_period_end ? (
                <span className="text-amber-600 font-medium">Yes</span>
              ) : (
                "No"
              )
            }
          />
          <InfoRow
            label="Stripe subscription"
            value={
              ws.billing?.stripe_subscription_id ? (
                <span className="font-mono text-xs text-neutral-500">
                  {ws.billing.stripe_subscription_id}
                </span>
              ) : null
            }
          />
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Plan limits">
          {ws.limits ? (
            <>
              <InfoRow
                label="Max seats"
                value={ws.limits.max_seats ?? "Unlimited"}
              />
              <InfoRow
                label="Max message credits"
                value={
                  ws.limits.max_message_credits?.toLocaleString() ?? "Unlimited"
                }
              />
              <InfoRow
                label="Max email aliases"
                value={ws.limits.max_email_aliases ?? "Unlimited"}
              />
              <InfoRow
                label="Max phone aliases"
                value={ws.limits.max_phone_aliases ?? "Unlimited"}
              />
              <InfoRow
                label="Max knowledge bases"
                value={ws.limits.max_knowledge_bases ?? "Unlimited"}
              />
              <InfoRow
                label="Whitelabel"
                value={
                  ws.limits.whitelabel_enabled ? (
                    <span className="text-orange-500 font-medium">Enabled</span>
                  ) : (
                    "Disabled"
                  )
                }
              />
            </>
          ) : (
            <p className="py-4 text-sm text-neutral-400">
              No plan limits configured.
            </p>
          )}
        </Section>

        <Section title="Credit usage">
          {ws.usage ? (
            <>
              <InfoRow
                label="Credit balance"
                value={
                  <span className="text-orange-500 font-semibold">
                    {ws.usage.credit_balance.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                }
              />
              <InfoRow
                label="Granted this period"
                value={ws.usage.credits_granted_this_period.toLocaleString(
                  "en-US",
                  { maximumFractionDigits: 2 },
                )}
              />
              <InfoRow
                label="Credit reset at"
                value={fmtDate(ws.usage.credit_reset_at)}
              />
            </>
          ) : (
            <p className="py-4 text-sm text-neutral-400">No usage data.</p>
          )}
          <div className="pt-2 mt-2 border-t border-neutral-100">
            <InfoRow label="Email aliases" value={ws.email_alias_count} />
            <InfoRow label="Phone aliases" value={ws.phone_alias_count} />
          </div>
        </Section>
      </div>

      {/* Custom / Enterprise Plan */}
      <Section title="Custom Plan (Enterprise)">
        <div className="py-2">
          <CustomPlanForm
            workspaceId={ws.id}
            adminEmail={admin.email}
            existingPlans={customPlans}
          />
        </div>
      </Section>

      {/* Members */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50">
          <h2 className="text-sm font-medium text-neutral-700">
            Members ({ws.members.length})
          </h2>
        </div>
        {ws.members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden sm:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {ws.members.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50">
                    <td className="px-5 py-3">
                      {m.user_id ? (
                        <Link
                          href={`/users/${m.user_id}`}
                          className="text-neutral-900 hover:text-orange-400 transition-colors"
                        >
                          {m.email ?? m.invite_email ?? "—"}
                        </Link>
                      ) : (
                        <span className="text-neutral-400">
                          {m.invite_email ?? "—"}
                        </span>
                      )}
                      {m.name && (
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {m.name}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 capitalize text-neutral-600">
                      {m.role}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={m.status === "active" ? "active" : "pending"}
                      />
                    </td>
                    <td className="px-5 py-3 text-neutral-400 text-xs hidden sm:table-cell">
                      {m.joined_at ? (
                        fmtDate(m.joined_at)
                      ) : (
                        <span className="text-neutral-300">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-6 text-sm text-neutral-400">No members.</p>
        )}
      </div>
    </div>
  );
}
