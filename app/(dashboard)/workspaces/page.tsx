import Link from "next/link";
import { getWorkspaces } from "@/lib/dal/workspaces";
import { Badge } from "@/components/ui/badge";
import { accountStatusToBadge } from "@/components/ui/billing-badge";

export default async function WorkspacesPage() {
  const workspaces = await getWorkspaces();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Workspaces</h1>
        <p className="text-sm text-neutral-400 mt-1">
          {workspaces.length} total
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-neutral-500 text-left">
                <th className="px-4 py-3 font-medium">Workspace</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Owner
                </th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Plan
                </th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">
                  Billing
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell text-center">
                  Members
                </th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell text-center">
                  Campaigns
                </th>
                <th className="px-4 py-3 font-medium hidden xl:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {workspaces.map((ws) => (
                <tr
                  key={ws.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/workspaces/${ws.id}`}
                      className="font-medium text-neutral-900 hover:text-orange-400 transition-colors"
                    >
                      {ws.name}
                    </Link>
                    {ws.billing_interval && (
                      <p className="text-xs text-neutral-400 mt-0.5 capitalize">
                        {ws.billing_interval}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-neutral-700 text-xs">
                      {ws.owner_email}
                    </span>
                    {ws.owner_name && (
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {ws.owner_name}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {ws.plan_id && ws.plan_id !== "none" ? (
                      <span className="text-orange-400 capitalize text-xs font-semibold">
                        {ws.plan_id}
                      </span>
                    ) : (
                      <span className="text-neutral-400 text-xs">Free</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {ws.account_status ? (
                      <Badge
                        variant={accountStatusToBadge(ws.account_status)}
                      />
                    ) : (
                      <span className="text-neutral-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center text-neutral-500">
                    {ws.member_count}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center text-neutral-500">
                    {ws.campaign_count}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-neutral-400 text-xs">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {workspaces.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-neutral-400 text-sm"
                  >
                    No workspaces found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
