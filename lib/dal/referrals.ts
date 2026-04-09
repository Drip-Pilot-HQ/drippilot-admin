import "server-only";
import { requireAdmin } from "../auth";
import { createAdminClient } from "../supabase/admin";

export type CommissionDetail = {
  id: string;
  workspace_name: string;
  referred_email: string;
  invoice_amount_cents: number;
  commission_amount_cents: number;
  commission_rate: number;
  status: "pending" | "paid";
  paid_at: string | null;
  created_at: string;
};

export type ReferrerSummary = {
  owner_id: string;
  owner_email: string;
  owner_name: string | null;
  referral_code: string;
  signup_count: number;
  total_commission_cents: number;
  pending_commission_cents: number;
  paid_commission_cents: number;
  commissions: CommissionDetail[];
};

export async function getReferrersSummary(): Promise<ReferrerSummary[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("referral_codes")
    .select(
      `
      id, code, owner_id, created_at,
      users!owner_id(email, name),
      referral_signups!referral_code_id(
        id,
        users!referred_user_id(email),
        referral_commissions!referral_signup_id(
          id, invoice_amount_cents, commission_amount_cents,
          commission_rate, status, paid_at, created_at, workspace_id,
          workspace!workspace_id(name)
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  type DbReferralCommission = {
    id: string;
    invoice_amount_cents: number;
    commission_amount_cents: number;
    commission_rate: number;
    status: "pending" | "paid";
    paid_at: string | null;
    created_at: string;
    workspace?: { name: string } | null;
  };

  type DbReferralSignup = {
    users?: { email: string } | null;
    referral_commissions?: DbReferralCommission[] | null;
  };

  type DbReferralCode = {
    owner_id: string;
    code: string;
    users?: { email: string; name?: string | null } | null;
    referral_signups?: DbReferralSignup[] | null;
  };

  return ((data as unknown as DbReferralCode[]) ?? [])
    .map((rc) => {
      const signups = rc.referral_signups ?? [];
      const allCommissions: CommissionDetail[] = signups.flatMap((s) =>
        (s.referral_commissions ?? []).map((c) => ({
          id: c.id,
          workspace_name: c.workspace?.name ?? "—",
          referred_email: s.users?.email ?? "—",
          invoice_amount_cents: c.invoice_amount_cents,
          commission_amount_cents: c.commission_amount_cents,
          commission_rate: c.commission_rate,
          status: c.status,
          paid_at: c.paid_at,
          created_at: c.created_at,
        })),
      );

      // Sort newest first
      allCommissions.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      return {
        owner_id: rc.owner_id,
        owner_email: rc.users?.email ?? "—",
        owner_name: rc.users?.name ?? null,
        referral_code: rc.code,
        signup_count: signups.length,
        total_commission_cents: allCommissions.reduce(
          (s, c) => s + c.commission_amount_cents,
          0,
        ),
        pending_commission_cents: allCommissions
          .filter((c) => c.status === "pending")
          .reduce((s, c) => s + c.commission_amount_cents, 0),
        paid_commission_cents: allCommissions
          .filter((c) => c.status === "paid")
          .reduce((s, c) => s + c.commission_amount_cents, 0),
        commissions: allCommissions,
      };
    })
    .filter((r) => r.commissions.length > 0 || r.signup_count > 0);
}

export async function markCommissionPaid(commissionId: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("referral_commissions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", commissionId)
    .eq("status", "pending"); // Idempotency guard

  if (error) throw new Error(error.message);
}
