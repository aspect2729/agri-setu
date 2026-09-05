"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ROLE_HOME, type UserRole } from "@/lib/types";
import {
  AuthPhotoShell,
  frostCtaStyle,
  frostField,
  frostInputClass,
} from "@/components/auth-photo-shell";
import { IconShield } from "@/components/farmer-app/icons";
import type { Lang } from "@/components/farmer-app/translations";

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

const COPY = {
  welcomeTo: { en: "Welcome to", kn: "ಸ್ವಾಗತ" },
  welcomeBack: { en: "Welcome back", kn: "ಮತ್ತೆ ಸ್ವಾಗತ" },
  sub: {
    en: "Sign in with your email to continue.",
    kn: "ಮುಂದುವರಿಯಲು ನಿಮ್ಮ ಇಮೇಲ್ ಬಳಸಿ ಸೈನ್ ಇನ್ ಮಾಡಿ.",
  },
  email: { en: "Email", kn: "ಇಮೇಲ್" },
  password: { en: "Password", kn: "ಪಾಸ್‌ವರ್ಡ್" },
  signIn: { en: "Sign in", kn: "ಸೈನ್ ಇನ್" },
  signingIn: { en: "Signing in…", kn: "ಸೈನ್ ಇನ್ ಆಗುತ್ತಿದೆ…" },
  shield: {
    en: "Demo accounts use email and password — not OTP — so the jury can sign in instantly.",
    kn: "ಡೆಮೋ ಖಾತೆಗಳು ಇಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಬಳಸುತ್ತವೆ — OTP ಅಲ್ಲ — ತಕ್ಷಣ ಸೈನ್ ಇನ್ ಮಾಡಲು.",
  },
  newHere: { en: "New to Agri Setu?", kn: "ಅಗ್ರಿ ಸೇತುಗೆ ಹೊಸದೇ?" },
  create: { en: "Create an account", kn: "ಖಾತೆ ತೆರೆಯಿರಿ" },
};

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

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
    <AuthPhotoShell
      lang={lang}
      onLangToggle={() => setLang((l) => (l === "en" ? "kn" : "en"))}
      backHref="/"
      pin="fixed"
    >
      <div>
        <p className="mb-1 text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
          {COPY.welcomeTo[lang]}
        </p>
        <h1 className="text-3xl font-bold leading-tight text-white">{COPY.welcomeBack[lang]}</h1>
        <p className="mt-1.5 text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          {COPY.sub[lang]}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="block">
          <span className="mb-2 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            {COPY.email[lang]}
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="farmer1@agrisetu.demo"
            className={frostInputClass}
            style={frostField}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            {COPY.password[lang]}
          </span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className={frostInputClass}
            style={frostField}
          />
        </label>

        <div
          className="flex items-start gap-2.5 rounded-2xl p-3.5"
          style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
        >
          <IconShield size={18} color="rgba(255,255,255,0.8)" />
          <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
            {COPY.shield[lang]}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl py-4 text-base font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
          style={frostCtaStyle}
        >
          {loading ? COPY.signingIn[lang] : COPY.signIn[lang]}
        </button>
        {error && (
          <p className="rounded-2xl px-4 py-3 text-sm" style={{ background: "rgba(217,79,79,0.25)", color: "#fecaca" }}>
            {error}
          </p>
        )}
      </form>

      <p className="text-center text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
        {COPY.newHere[lang]}{" "}
        <Link href="/register" className="font-semibold text-white underline-offset-2 hover:underline">
          {COPY.create[lang]}
        </Link>
      </p>
      <p className="text-center text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
        Demo: <span className="font-mono">employee1@agrisetu.demo</span> /{" "}
        <span className="font-mono">agrisetu123</span>
      </p>
    </AuthPhotoShell>
  );
}
