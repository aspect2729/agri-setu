/** Human-readable batch codes, e.g. AGS-K7M2QX. */
export const BATCH_CODE_RE = /AGS-[A-Z0-9]{6}/i;

export function normalizeBatchCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function batchTracePath(code: string): string {
  return `/trace/${encodeURIComponent(normalizeBatchCode(code))}`;
}

/** Absolute URL encoded into the printed QR. Phone cameras open this page. */
export function batchTraceUrl(code: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${batchTracePath(code)}`;
}

/**
 * Pull AGS-XXXXXX out of a scanned URL, a pasted code, or loose text.
 * Returns null if nothing looks like an Agri Setu batch.
 */
export function parseBatchCode(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  try {
    const url = new URL(text);
    const parts = url.pathname.split("/").filter(Boolean);
    const traceIdx = parts.findIndex((p) => p.toLowerCase() === "trace");
    if (traceIdx >= 0 && parts[traceIdx + 1]) {
      const fromPath = decodeURIComponent(parts[traceIdx + 1]).toUpperCase();
      const match = fromPath.match(BATCH_CODE_RE);
      if (match) return match[0].toUpperCase();
    }
  } catch {
    // Not a URL — fall through to regex on the raw string.
  }

  const match = normalizeBatchCode(text).match(BATCH_CODE_RE);
  return match ? match[0].toUpperCase() : null;
}

export function codesMatch(a: string, b: string): boolean {
  const left = parseBatchCode(a) ?? normalizeBatchCode(a);
  const right = parseBatchCode(b) ?? normalizeBatchCode(b);
  return Boolean(left && right && left === right);
}

export type BatchLookup = {
  batchCode: string;
  crop: string;
  grade: string | null;
  qualityNotes: string | null;
  quantityKg: number;
  remainingKg: number;
  farmerName: string | null;
  farmerVillage: string | null;
  storeName: string | null;
  storeVillage: string | null;
  paidAt: string | null;
  paidAmount: number | null;
  status: string;
};
