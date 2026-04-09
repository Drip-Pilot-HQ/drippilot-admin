import "server-only";
import { cache } from "react";
import { createClient } from "./supabase/server";
import { redirect } from "next/navigation";

export type AdminUser = {
  id: string;
  email: string;
  role: "admin";
};

/**
 * Returns the current admin user, or null if not authenticated / not an admin.
 * Cached per-request so multiple DAL functions can call it without extra DB hits.
 */
export const getCurrentAdmin = cache(async (): Promise<AdminUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  // Role is stored in app_metadata (only writable via service role — users cannot self-assign)
  const role = user.app_metadata?.role;
  if (role !== "admin") return null;

  return {
    id: user.id,
    email: user.email!,
    role: "admin",
  };
});

/**
 * Guards server components / actions. Redirects to /login if not an admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");
  return admin;
}
