"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthPhotoShell, frostCtaStyle } from "@/components/auth-photo-shell";
import type { Lang } from "@/components/farmer-app/translations";

const COPY = {
  tagline: {
    en: "Sell your produce. Get paid instantly.",
    kn: "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಮಾರಿ. ತಕ್ಷಣ ಹಣ ಪಡೆಯಿರಿ.",
  },
  sub: {
    en: "List your harvest and drop it at your nearest White Store.",
    kn: "ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಪಟ್ಟಿ ಮಾಡಿ ಮತ್ತು ಹತ್ತಿರದ ವೈಟ್ ಸ್ಟೋರ್‌ನಲ್ಲಿ ತಂದು ಬಿಡಿ.",
  },
  getStarted: { en: "Get Started", kn: "ಪ್ರಾರಂಭಿಸಿ" },
  haveAccount: { en: "I already have an account", kn: "ನನಗೆ ಈಗಾಗಲೇ ಖಾತೆ ಇದೆ" },
};

export function LandingHero() {
  const [lang, setLang] = useState<Lang>("en");

  return (
    <AuthPhotoShell lang={lang} onLangToggle={() => setLang((l) => (l === "en" ? "kn" : "en"))}>
      <div>
        <h1 className="mb-2 text-2xl font-bold leading-snug text-white md:text-3xl">
          {COPY.tagline[lang]}
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
          {COPY.sub[lang]}
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/register"
          className="block w-full rounded-2xl py-4 text-center text-base font-semibold transition-all active:scale-[0.98]"
          style={frostCtaStyle}
        >
          {COPY.getStarted[lang]}
        </Link>
        <Link
          href="/login"
          className="block w-full rounded-2xl py-3.5 text-center text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          {COPY.haveAccount[lang]}
        </Link>
      </div>
    </AuthPhotoShell>
  );
}
