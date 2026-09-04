"use client";

export function PrintLabelButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-800 print:hidden"
    >
      Print label
    </button>
  );
}
