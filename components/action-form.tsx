"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { ActionResult } from "@/lib/actions";

/**
 * Generic wrapper that runs a form-based server action and shows the result.
 */
export function ActionForm({
  action,
  submitLabel,
  children,
}: {
  action: (formData: FormData) => Promise<ActionResult>;
  submitLabel: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult | null, formData: FormData) => {
      const result = await action(formData);
      if (result?.success) router.refresh();
      return result;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-3">
      {children}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-green-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-dark disabled:opacity-50"
      >
        {pending ? "Working…" : submitLabel}
      </button>
      {state?.error && (
        <p className="rounded-lg bg-error-light px-3 py-2 text-sm text-error">{state.error}</p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-green-light px-3 py-2 text-sm text-green-dark">{state.success}</p>
      )}
    </form>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition focus:border-green-primary focus:ring-2 focus:ring-green-light";
