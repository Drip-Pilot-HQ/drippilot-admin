import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CustomPlanLimits {
  maxSeats: number | null;
  maxPhoneAliases: number | null;
  maxEmailAliases: number | null;
  maxKnowledgeBases: number | null;
  maxMessageCredits: number | null;
  whitelabelEnabled: boolean;
}

export interface CustomPlan {
  id: string;
  name: string;
  stripe_price_id: string;
  stripe_product_id: string;
  billing_interval: "monthly" | "yearly";
  price_cents: number;
  limits: CustomPlanLimits;
  target_workspace_id: string | null;
  created_by: string;
  archived_at: string | null;
  created_at: string;
}

export const getCustomPlanByPriceId = cache(
  async (stripePriceId: string): Promise<CustomPlan | null> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("custom_plans")
      .select("*")
      .eq("stripe_price_id", stripePriceId)
      .single();

    if (error || !data) return null;
    return data as CustomPlan;
  },
);

export const getCustomPlansByWorkspace = cache(
  async (workspaceId: string): Promise<CustomPlan[]> => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("custom_plans")
      .select("*")
      .eq("target_workspace_id", workspaceId)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as CustomPlan[];
  },
);
