"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, ROLE_LABELS, type UserRole } from "@/lib/types";
import {
  AuthPhotoShell,
  frostCtaStyle,
  frostField,
  frostInputClass,
} from "@/components/auth-photo-shell";
import type { Lang } from "@/components/farmer-app/translations";

const ROLES: UserRole[] = ["farmer", "store", "buyer", "logistics"];

const COPY = {
  title: { en: "Create your account", kn: "ನಿಮ್ಮ ಖಾತೆ ತೆರೆಯಿರಿ" },
  sub: { en: "Join the Agri Setu network.", kn: "ಅಗ್ರಿ ಸೇತು ಜಾಲಕ್ಕೆ ಸೇರಿ." },
  iAm: { en: "I am a…", kn: "ನಾನು…" },
  fullName: { en: "Full name", kn: "ಪೂರ್ಣ ಹೆಸರು" },
  email: { en: "Email", kn: "ಇಮೇಲ್" },
  password: { en: "Password (min 6 characters)", kn: "ಪಾಸ್‌ವರ್ಡ್ (ಕನಿಷ್ಠ 6 ಅಕ್ಷರ)" },
  phone: { en: "Phone (optional)", kn: "ಫೋನ್ (ಐಚ್ಛಿಕ)" },
  village: { en: "Village / city (optional)", kn: "ಗ್ರಾಮ / ನಗರ (ಐಚ್ಛಿಕ)" },
  creating: { en: "Creating account…", kn: "ಖಾತೆ ತೆರೆಯಲಾಗುತ್ತಿದೆ…" },
  registerAs: { en: "Register as", kn: "ನೋಂದಾಯಿಸಿ" },
  haveAccount: { en: "Already have an account?", kn: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?" },
  signIn: { en: "Sign in", kn: "ಸೈನ್ ಇನ್" },
};

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("farmer");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

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
    <AuthPhotoShell
      lang={lang}
      onLangToggle={() => setLang((l) => (l === "en" ? "kn" : "en"))}
      backHref="/"
      pin="fixed"
    >
      <div>
        <h1 className="text-3xl font-bold leading-tight text-white">{COPY.title[lang]}</h1>
        <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          {COPY.sub[lang]}
        </p>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
          {COPY.iAm[lang]}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="rounded-xl px-3 py-2 text-sm font-medium transition"
              style={
                role === r
                  ? { background: "#1B7A3D", color: "#fff", border: "1.5px solid #1B7A3D" }
                  : {
                      ...frostField,
                      color: "rgba(255,255,255,0.85)",
                    }
              }
            >
              {ROLE_LABELS[r]}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input name="full_name" required placeholder={COPY.fullName[lang]} className={frostInputClass} style={frostField} />
        <input name="email" type="email" required placeholder={COPY.email[lang]} className={frostInputClass} style={frostField} />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder={COPY.password[lang]}
          className={frostInputClass}
          style={frostField}
        />
        <input name="phone" placeholder={COPY.phone[lang]} className={frostInputClass} style={frostField} />
        <input name="village" placeholder={COPY.village[lang]} className={frostInputClass} style={frostField} />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl py-4 text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          style={frostCtaStyle}
        >
          {loading ? COPY.creating[lang] : `${COPY.registerAs[lang]} ${ROLE_LABELS[role]}`}
        </button>
        {error && (
          <p className="rounded-2xl px-4 py-3 text-sm" style={{ background: "rgba(217,79,79,0.25)", color: "#fecaca" }}>
            {error}
          </p>
        )}
      </form>

      <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
        {COPY.haveAccount[lang]}{" "}
        <Link href="/login" className="font-semibold text-white underline-offset-2 hover:underline">
          {COPY.signIn[lang]}
        </Link>
      </p>
    </AuthPhotoShell>
  );
}
