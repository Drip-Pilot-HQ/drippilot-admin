import "server-only";
import { requireAdmin } from "../auth";
import { createAdminClient } from "../supabase/admin";

export type WorkspaceRecord = {
  id: string;
  name: string;
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
  account_status: string | null;
  plan_id: string | null;
  billing_interval: string | null;
  member_count: number;
  campaign_count: number;
  created_at: string;
};

export type WorkspaceDetail = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  // Owner
  owner: { id: string; email: string; name: string | null };
  // Billing
  billing: {
    account_status: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    billing_interval: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
  // Plan limits
  limits: {
    max_seats: number | null;
    max_message_credits: number | null;
    max_email_aliases: number | null;
    max_phone_aliases: number | null;
    max_knowledge_bases: number | null;
    whitelabel_enabled: boolean;
  } | null;
  // Usage
  usage: {
    credit_balance: number;
    credits_granted_this_period: number;
    credit_reset_at: string | null;
  } | null;
  // Members
  members: {
    id: string;
    user_id: string | null;
    email: string | null;
    name: string | null;
    role: string;
    status: string;
    member_name: string | null;
    invite_email: string | null;
    joined_at: string | null;
  }[];
  // Counts
  campaign_count: number;
  lead_count: number;
  email_alias_count: number;
  phone_alias_count: number;
};

export async function getWorkspaces(): Promise<WorkspaceRecord[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("workspace")
    .select(
      `
      id, name, owner_id, created_at,
      users!owner_id(email, name),
      workspace_billing!workspace_id(account_status, plan_id, billing_interval),
      workspace_membership!workspace_id(count),
      campaigns!workspace_id(count)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  type DbWorkspaceRecordList = {
    id: string;
    name: string;
    owner_id: string;
    created_at: string;
    users?: { email: string; name: string | null } | null;
    workspace_billing?:
      | {
          account_status: string | null;
          plan_id: string | null;
          billing_interval: string | null;
        }[]
      | null;
    workspace_membership?: { count: number }[] | null;
    campaigns?: { count: number }[] | null;
  };

  return ((data as unknown as DbWorkspaceRecordList[]) ?? []).map((w) => ({
    id: w.id,
    name: w.name,
    owner_id: w.owner_id,
    owner_email: w.users?.email ?? "—",
    owner_name: w.users?.name ?? null,
    // PostgREST returns one-to-many embeds as arrays even with unique constraints
    account_status: w.workspace_billing?.[0]?.account_status ?? null,
    plan_id: w.workspace_billing?.[0]?.plan_id ?? null,
    billing_interval: w.workspace_billing?.[0]?.billing_interval ?? null,
    member_count: w.workspace_membership?.[0]?.count ?? 0,
    campaign_count: w.campaigns?.[0]?.count ?? 0,
    created_at: w.created_at,
  }));
}

export async function getWorkspaceDetail(
  workspaceId: string,
): Promise<WorkspaceDetail | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ data, error }, countResults] = await Promise.all([
    supabase
      .from("workspace")
      .select(
        `
        id, name, created_at, updated_at, owner_id,
        users!owner_id(id, email, name),
        workspace_billing!workspace_id(
          account_status, plan_id, stripe_subscription_id, billing_interval,
          current_period_start, current_period_end, cancel_at_period_end
        ),
        workspace_plan_limits!workspace_id(
          max_seats, max_message_credits, max_email_aliases,
          max_phone_aliases, max_knowledge_bases, whitelabel_enabled
        ),
        workspace_plan_usage!workspace_id(
          credit_balance, credits_granted_this_period, credit_reset_at
        ),
        workspace_membership!workspace_id(
          id, user_id, role, status, member_name, invite_email, joined_at,
          users!user_id(email, name)
        )
      `,
      )
      .eq("id", workspaceId)
      .single(),
    // Separate count queries — cleaner than deeply nested selects
    Promise.all([
      supabase
        .from("campaigns")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),
      supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),
      supabase
        .from("email_alias")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),
      supabase
        .from("phone_alias")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId),
    ]),
  ]);

  if (error || !data) return null;

  const [
    { count: campaignCount },
    { count: leadCount },
    { count: emailCount },
    { count: phoneCount },
  ] = countResults;

  type DbWorkspaceBilling = {
    account_status: string;
    plan_id: string;
    stripe_subscription_id: string | null;
    billing_interval: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  };

  type DbWorkspaceLimits = {
    max_seats: number | null;
    max_message_credits: number | null;
    max_email_aliases: number | null;
    max_phone_aliases: number | null;
    max_knowledge_bases: number | null;
    whitelabel_enabled: boolean;
  };

  type DbWorkspaceUsage = {
    credit_balance: number;
    credits_granted_this_period: number;
    credit_reset_at: string | null;
  };

  type DbWorkspaceMember = {
    id: string;
    user_id: string | null;
    role: string;
    status: string;
    member_name: string | null;
    invite_email: string | null;
    joined_at: string | null;
    users?: { email: string; name: string | null } | null;
  };

  type DbWorkspaceOwner = {
    id: string;
    email: string;
    name: string | null;
  };

  // PostgREST returns one-to-many embeds as arrays even with unique constraints
  const billing =
    (data.workspace_billing as unknown as DbWorkspaceBilling[])?.[0] ?? null;
  const limits =
    (data.workspace_plan_limits as unknown as DbWorkspaceLimits[])?.[0] ?? null;
  const usage =
    (data.workspace_plan_usage as unknown as DbWorkspaceUsage[])?.[0] ?? null;
  const members =
    (data.workspace_membership as unknown as DbWorkspaceMember[]) ?? [];
  const owner = data.users as unknown as DbWorkspaceOwner | null;

  return {
    id: data.id,
    name: data.name,
    created_at: data.created_at,
    updated_at: data.updated_at,
    owner: {
      id: owner?.id ?? data.owner_id,
      email: owner?.email ?? "—",
      name: owner?.name ?? null,
    },
    billing: billing
      ? {
          account_status: billing.account_status,
          plan_id: billing.plan_id,
          stripe_subscription_id: billing.stripe_subscription_id,
          billing_interval: billing.billing_interval,
          current_period_start: billing.current_period_start,
          current_period_end: billing.current_period_end,
          cancel_at_period_end: billing.cancel_at_period_end,
        }
      : null,
    limits: limits
      ? {
          max_seats: limits.max_seats,
          max_message_credits: limits.max_message_credits,
          max_email_aliases: limits.max_email_aliases,
          max_phone_aliases: limits.max_phone_aliases,
          max_knowledge_bases: limits.max_knowledge_bases,
          whitelabel_enabled: limits.whitelabel_enabled,
        }
      : null,
    usage: usage
      ? {
          credit_balance: Number(usage.credit_balance),
          credits_granted_this_period: Number(
            usage.credits_granted_this_period,
          ),
          credit_reset_at: usage.credit_reset_at,
        }
      : null,
    members: members.map((m) => ({
      id: m.id,
      user_id: m.user_id,
      email: m.users?.email ?? m.invite_email ?? null,
      name: m.users?.name ?? m.member_name ?? null,
      role: m.role,
      status: m.status,
      member_name: m.member_name,
      invite_email: m.invite_email,
      joined_at: m.joined_at,
    })),
    campaign_count: campaignCount ?? 0,
    lead_count: leadCount ?? 0,
    email_alias_count: emailCount ?? 0,
    phone_alias_count: phoneCount ?? 0,
  };
}

export async function getWorkspaceStats(): Promise<{
  total: number;
  active_subscriptions: number;
}> {
  await requireAdmin();
  const supabase = createAdminClient();

  const [{ count: total }, { count: active_subscriptions }] = await Promise.all(
    [
      supabase.from("workspace").select("*", { count: "exact", head: true }),
      supabase
        .from("workspace_billing")
        .select("*", { count: "exact", head: true })
        .eq("account_status", "active"),
    ],
  );

  return { total: total ?? 0, active_subscriptions: active_subscriptions ?? 0 };
}
