import type { User } from "@supabase/supabase-js";

type AuthClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: User | null };
      error: { message?: string; status?: number } | null;
    }>;
    getSession: () => Promise<{
      data: { session: { user: User } | null };
    }>;
  };
};

function authUnreachable(error: { message?: string; status?: number } | null | undefined) {
  if (!error) return false;
  const msg = (error.message ?? "").toLowerCase();
  return (
    error.status === 0 ||
    msg.includes("fetch") ||
    msg.includes("network") ||
    msg.includes("timeout")
  );
}

/**
 * Prefer the cookie session. `getUser()` hits Supabase Auth over the network;
 * when that times out the client used to treat it as logged-out and bounce to /login
 * (including right after quality inspection).
 */
export async function resolveAuthUser(supabase: AuthClient): Promise<User | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) return sessionData.session.user;
  } catch {
    // fall through to getUser
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    if (data.user) return data.user;
    if (authUnreachable(error)) return null;
    return null;
  } catch {
    return null;
  }
}
