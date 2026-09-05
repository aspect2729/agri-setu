# Previous demo data (stashed 2026-09-05)

Snapshots taken before the richer v2 seed.

| File | What it was |
|---|---|
| `seed-v1.ts.bak` | In-memory marketplace / logistics / mandi dataset (`buildDataset`) |
| `../../scripts/archive/seed-v1.mjs.bak` | Live Supabase demo accounts, White Store lots, cash, demand |

Restore by copying the `.bak` over `mock-data/seed.ts` or `scripts/seed.mjs` and restarting `npm run dev` (or `npm run seed` for Supabase).

Do not import these files from the app — they are archives only.
