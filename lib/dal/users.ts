import "server-only";
import { requireAdmin } from "../auth";
import { createAdminClient } from "../supabase/admin";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  is_banned: boolean;
  workspace_count: number;
};

export type UserDetail = UserRecord & {
  workspaces: { id: string; name: string; created_at: string }[];
  memberships: {
    workspace_id: string;
    workspace_name: string;
    role: string;
    status: string;
  }[];
};

export async function getUsers(): Promise<UserRecord[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  // Fetch public users with workspace count (FK: workspace.owner_id → users.id)
  const { data: publicUsers, error } = await supabase
    .from("users")
    .select("id, email, name, created_at, workspace!owner_id(count)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Fetch auth users for ban status (paginated, handle up to 1000)
  const { data: authData } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  const bannedSet = new Set(
    (authData?.users ?? [])
      .filter((u) => u.banned_until != null)
      .map((u) => u.id),
  );

  type DbUserPublic = {
    id: string;
    email: string;
    name: string | null;
    created_at: string;
    workspace?: { count: number }[] | null;
  };

  return ((publicUsers as unknown as DbUserPublic[]) ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name ?? null,
    created_at: u.created_at,
    is_banned: bannedSet.has(u.id),
    workspace_count: u.workspace?.[0]?.count ?? 0,
  }));
}

export async function getUserDetail(
  userId: string,
): Promise<UserDetail | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data, error }, { data: authData }] = await Promise.all([
    supabase
      .from("users")
      .select(
        `
        id, email, name, created_at,
        workspace!owner_id(id, name, created_at),
        workspace_membership!user_id(workspace_id, role, status, workspace!workspace_id(name))
      `,
      )
      .eq("id", userId)
      .single(),
    supabase.auth.admin.getUserById(userId),
  ]);

  if (error || !data) return null;

  type DbUserDetailWorkspace = { id: string; name: string; created_at: string };
  type DbUserDetailMembership = {
    workspace_id: string;
    role: string;
    status: string;
    workspace?: { name: string } | null;
  };

  const ownedWorkspaces =
    (data.workspace as unknown as DbUserDetailWorkspace[]) ?? [];
  const memberships =
    (data.workspace_membership as unknown as DbUserDetailMembership[]) ?? [];

  return {
    id: data.id,
    email: data.email,
    name: data.name ?? null,
    created_at: data.created_at,
    is_banned: authData?.user?.banned_until != null,
    workspace_count: ownedWorkspaces.length,
    workspaces: ownedWorkspaces.map((w) => ({
      id: w.id,
      name: w.name,
      created_at: w.created_at,
    })),
    memberships: memberships.map((m) => ({
      workspace_id: m.workspace_id,
      workspace_name: m.workspace?.name ?? "—",
      role: m.role,
      status: m.status,
    })),
  };
}

export async function getUserStats(): Promise<{
  total: number;
  banned: number;
  recent_7d: number;
}> {
  await requireAdmin();
  const supabase = createAdminClient();

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [{ count: total }, { count: recent_7d }, { data: authData }] =
    await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
    ]);

  const banned = (authData?.users ?? []).filter(
    (u) => u.banned_until != null,
  ).length;

  return {
    total: total ?? 0,
    banned,
    recent_7d: recent_7d ?? 0,
  };
}

export async function setUserBanned(
  userId: string,
  banned: boolean,
): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    ban_duration: banned ? "876000h" : "none",
  });

  if (error) throw new Error(error.message);
}
