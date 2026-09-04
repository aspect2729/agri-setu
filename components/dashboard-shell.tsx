import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/lib/actions";
import { ROLE_LABELS, type Profile } from "@/lib/types";
import { BrandLogo } from "@/components/brand-logo";

export function DashboardShell({
  profile,
  title,
  subtitle,
  children,
}: {
  profile: Profile;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-off-white">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center">
            <BrandLogo size={40} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-text-primary">{profile.full_name}</p>
              <p className="text-xs text-green-primary">{ROLE_LABELS[profile.role]}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-green-light"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  );
}
