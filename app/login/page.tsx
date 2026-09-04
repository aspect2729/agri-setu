"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, type UserRole } from "@/lib/types";
import { inputClass } from "@/components/action-form";

function authMessage(err: unknown): string {
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: string }).message)
      : String(err ?? "");
  const status =
    err && typeof err === "object" && "status" in err
      ? Number((err as { status?: number }).status)
      : undefined;
  if (
    !message ||
    message === "Failed to fetch" ||
    message.toLowerCase().includes("fetch") ||
    status === 0
  ) {
    return "Could not reach Agri Setu auth. Check that this device is online, then try again.";
  }
  return message;
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: String(form.get("email")).trim(),
        password: String(form.get("password")),
      });

      if (authError || !data.user) {
        setError(authMessage(authError));
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      // Full navigation so the session cookie is sent on the next document request.
      window.location.assign(ROLE_HOME[(profile?.role as UserRole) ?? "farmer"]);
    } catch (err) {
      setError(authMessage(err));
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center gap-2 justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-primary text-xl">
            🌾
          </span>
          <span className="text-2xl font-bold text-text-primary">Agri Setu</span>
        </Link>

        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-bold text-text-primary">Welcome back</h1>
          <p className="mb-5 text-sm text-text-muted">
            Sign in to your Agri Setu account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              className={inputClass}
            />
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            {error && (
              <p className="rounded-lg bg-error-light px-3 py-2 text-sm text-error">{error}</p>
            )}
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            New to Agri Setu?{" "}
            <Link href="/register" className="font-semibold text-green-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-text-muted">
            Demo: <span className="font-mono">employee1@agrisetu.demo</span> /{" "}
            <span className="font-mono">agrisetu123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
