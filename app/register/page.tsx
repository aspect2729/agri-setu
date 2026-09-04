"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, ROLE_LABELS, type UserRole } from "@/lib/types";
import { inputClass } from "@/components/action-form";

const ROLES: UserRole[] = ["farmer", "store", "buyer", "logistics"];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email: String(form.get("email")),
      password: String(form.get("password")),
      options: {
        data: {
          full_name: String(form.get("full_name")),
          phone: String(form.get("phone") ?? ""),
          village: String(form.get("village") ?? ""),
          role,
        },
      },
    });

    if (authError || !data.user) {
      setError(authError?.message ?? "Registration failed.");
      setLoading(false);
      return;
    }

    router.push(ROLE_HOME[role]);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white px-4 py-8">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-primary text-xl">
            🌾
          </span>
          <span className="text-2xl font-bold text-text-primary">Agri Setu</span>
        </Link>

        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-xl font-bold text-text-primary">Create your account</h1>
          <p className="mb-5 text-sm text-text-muted">Join the Agri Setu network.</p>

          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-text-secondary">I am a…</p>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    role === r
                      ? "border-green-primary bg-green-light text-green-dark"
                      : "border-border text-text-secondary hover:bg-off-white"
                  }`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input name="full_name" required placeholder="Full name" className={inputClass} />
            <input name="email" type="email" required placeholder="Email" className={inputClass} />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              className={inputClass}
            />
            <input name="phone" placeholder="Phone (optional)" className={inputClass} />
            <input name="village" placeholder="Village / city (optional)" className={inputClass} />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-50"
            >
              {loading ? "Creating account…" : `Register as ${ROLE_LABELS[role]}`}
            </button>
            {error && (
              <p className="rounded-lg bg-error-light px-3 py-2 text-sm text-error">{error}</p>
            )}
          </form>

          <p className="mt-4 text-center text-sm text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-green-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
