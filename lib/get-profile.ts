import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveAuthUser } from "@/lib/supabase/auth-user";
import { ROLE_HOME, type Profile, type UserRole } from "@/lib/types";

/**
 * Loads the signed-in user's profile and enforces that they are on the
 * dashboard for their own role (admins may view everything).
 */
export async function requireProfile(expectedRole: UserRole): Promise<Profile> {
  const supabase = await createClient();
  const user = await resolveAuthUser(supabase);
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  if (profile.role !== expectedRole && profile.role !== "admin") {
    redirect(ROLE_HOME[profile.role as UserRole]);
  }

  return profile as Profile;
}
