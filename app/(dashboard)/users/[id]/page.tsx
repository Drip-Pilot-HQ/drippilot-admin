import Link from "next/link";
import { notFound } from "next/navigation";
import { getUserDetail } from "@/lib/dal/users";
import { Badge } from "@/components/ui/badge";
import { UserBanButton } from "@/components/admin/user-ban-button";

type Props = { params: Promise<{ id: string }> };

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/users"
        className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors"
      >
        ← Back to users
      </Link>

      {/* Header */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-neutral-900 font-semibold text-lg">
              {user.email}
            </h1>
            {user.name && (
              <p className="text-neutral-500 text-sm mt-0.5">{user.name}</p>
            )}
            <p className="text-neutral-400 text-xs mt-1">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={user.is_banned ? "banned" : "active"} />
        </div>
        <div className="mt-5 pt-4 border-t border-neutral-100">
          <UserBanButton userId={user.id} isBanned={user.is_banned} size="md" />
        </div>
      </div>

      {/* Owned Workspaces */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
          <h2 className="text-sm font-medium text-neutral-700">
            Owned workspaces ({user.workspace_count})
          </h2>
        </div>
        {user.workspaces.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {user.workspaces.map((ws) => (
                <tr key={ws.id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/workspaces/${ws.id}`}
                      className="text-neutral-900 hover:text-orange-400 transition-colors"
                    >
                      {ws.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-neutral-400 text-xs hidden sm:table-cell">
                    {new Date(ws.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-6 text-sm text-neutral-400">
            No owned workspaces.
          </p>
        )}
      </div>

      {/* Memberships */}
      {user.memberships.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
            <h2 className="text-sm font-medium text-neutral-700">
              Workspace memberships ({user.memberships.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-neutral-500 text-left">
                <th className="px-5 py-3 font-medium">Workspace</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium hidden sm:table-cell">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {user.memberships.map((m) => (
                <tr key={m.workspace_id} className="hover:bg-neutral-50">
                  <td className="px-5 py-3">
                    <Link
                      href={`/workspaces/${m.workspace_id}`}
                      className="text-neutral-900 hover:text-orange-500 transition-colors"
                    >
                      {m.workspace_name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-neutral-500 capitalize">
                    {m.role}
                  </td>
                  <td className="px-5 py-3 text-neutral-400 capitalize hidden sm:table-cell">
                    {m.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
