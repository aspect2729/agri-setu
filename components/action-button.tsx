"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions";

/**
 * Button that runs a pre-bound server action and surfaces the result inline.
 */
export function ActionButton({
  action,
  label,
  variant = "primary",
}: {
  action: () => Promise<ActionResult>;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const styles =
    variant === "primary"
      ? "bg-green-primary text-white hover:bg-green-dark"
      : "border border-border bg-white text-green-primary hover:bg-green-light";

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await action();
            if (result?.error) setError(result.error);
          })
        }
        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${styles}`}
      >
        {pending ? "Working…" : label}
      </button>
      {error && <span className="max-w-60 text-xs text-red-600">{error}</span>}
    </span>
  );
}
