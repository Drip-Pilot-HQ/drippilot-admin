import Link from "next/link";
import { getUsers } from "@/lib/dal/users";
import { Badge } from "@/components/ui/badge";
import { UserBanButton } from "@/components/admin/user-ban-button";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-neutral-900">Users</h1>
        <p className="text-sm text-neutral-400 mt-1">{users.length} total</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-neutral-500 text-left">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium hidden sm:table-cell">
                Workspaces
              </th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">
                Joined
              </th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-neutral-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/users/${user.id}`}
                    className="font-medium text-neutral-900 hover:text-orange-400 transition-colors"
                  >
                    {user.email}
                  </Link>
                  {user.name && (
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {user.name}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">
                  {user.workspace_count}
                </td>
                <td className="px-4 py-3 text-neutral-400 text-xs hidden md:table-cell">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.is_banned ? "banned" : "active"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <UserBanButton userId={user.id} isBanned={user.is_banned} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-neutral-400 text-sm"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
