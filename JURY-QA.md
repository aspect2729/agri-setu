# Agri Setu — Jury Q&A

Read answers out loud. If you do not remember a file name, say the **flow**, not a guess.

Demo password for all seeded accounts: `agrisetu123`  
Do not read `.env` keys out loud.

---

## 0. If you freeze

Say this and stop:

> I can walk the product flow. The writes go UI → Next.js server action in `lib/actions.ts` → a Postgres row in Supabase. I did not memorise every line.

Never claim: machine learning, blockchain, live UPI, Google Maps, production-grade security, or “we trained a weather model.”

---

## 1. Elevator (they ask first)

### Q. What is Agri Setu in one sentence?

**A.** Agri Setu organises the agricultural market around the farmer: a village **White Store** weighs, grades, and pays on the spot, turns the lot into a **QR batch**, and lets bulk buyers order and verify origin.

### Q. What problem are you solving?

**A.** Small farmers (20–50 kg) cannot reach bulk buyers. Supply is fragmented, quality is verbal, payment is delayed, prices are opaque, and a crate in a city warehouse cannot be tied back to a village. Typical apps still make the **farmer hunt for buyers**. We invert that: the market comes to a collection point the farmer can walk to.

### Q. Why not just put farmers on a marketplace app?

**A.** A buyer who needs 500 kg will not contract 20 kg from an unverified farm 80 km away. Aggregation has to happen **physically** — weigh, grade, pay, hold — then digitally. The White Store is that node. “Setu” means bridge.

### Q. Who are the users?

**A.** Six roles, six portals:

| Role | Login | What they do |
|---|---|---|
| Farmer | `farmer1@agrisetu.demo` | List produce, see payment, track batch |
| Store employee | `employee1@agrisetu.demo` | Weigh, grade, pay, QR, dispatch |
| Store manager | `store1@agrisetu.demo` | Inventory, cash, staff, farmers |
| Buyer | `buyer1@agrisetu.demo` | Browse scored lots, order, scan QR |
| Logistics | `logistics1@agrisetu.demo` | Accept trip, scan pickup/delivery |
| Admin | `admin@agrisetu.demo` | Match demand to store stock, mandi prices |

Plus a **public** page `/trace/AGS-XXXXXX` that any phone camera can open.

### Q. What is a White Store?

**A.** A village collection centre — not a mandi stall and not a full cold warehouse. Trusted counter: weigh, grade, pay, label, hold, dispatch.

### Q. Walk the tomato from farm to buyer (3-minute story)

**A.** Seed leaves it mid-flight.

1. **Employee (Suresh)** — Ramesh’s tomatoes at the counter → weigh 100 kg → Grade A → ₹20/kg → farmer paid ₹2,000 **now** → batch `AGS-…` + QR.
2. **Farmer (Ramesh)** — earnings show ₹2,000, batch on My Produce.
3. **Employee** — Accept + Dispatch FreshMart’s onion order.
4. **Admin** — FreshMart’s 500 kg tomato demand can now be filled from Rampur → **Match supply**.
5. **Logistics** — accept live trips, scan batch at pickup and delivery.
6. **Buyer** — Verify tab: scan or type `AGS-…`, then Confirm receipt.
7. **Manager** — cash ledger and inventory moved with the same orders.

---

## 2. Tech stack

### Q. What is your tech stack?

**A.**

- **Frontend:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4  
- **Backend:** Next.js **server actions** (`lib/actions.ts`) — no separate Express/Spring API  
- **Database + auth:** Supabase (PostgreSQL + Auth)  
- **Hosting:** Vercel (GitHub `main` auto-deploys, HTTPS for camera)  
- **QR generate:** `qrcode`  
- **QR scan:** `html5-qrcode` (in-app camera)  
- **Charts:** Recharts  
- **Weather:** Open-Meteo (live)  
- **Mandi / mock GPS / fake payments:** `mock-data/` folder, badged DEMO

### Q. Why Next.js, not Flutter / Android / Django?

**A.** One codebase for six role UIs and the backend, fast to demo on a laptop and a projector, server rendering for dashboards, client components for the counter and scanner. Native apps are a later wrap; the market logic is the same.

### Q. Why no separate backend server?

**A.** For the prototype, server actions are the API. The browser posts a form; the server checks the logged-in user, writes Postgres, returns success/error. Fewer moving parts on stage. Production can keep the same actions or extract a service — the schema does not change.

### Q. Why Supabase, not Firebase / Mongo / MySQL on a VPS?

**A.** We needed **relational** data (lots, orders, items, deliveries) and **auth** in one place. Postgres fits a supply chain. Supabase gives hosted Postgres, email login, and row-level security hooks. Firebase is document-oriented; we have joins (order → items → submissions).

### Q. Why TypeScript?

**A.** Roles, grades A/B/C, order statuses — wrong strings break the demo. Types catch that before the jury sees a crash.

### Q. Where is the code organised?

**A.**

| Path | Role |
|---|---|
| `app/` | Routes: `/farmer`, `/employee`, `/buyer`, … `/trace/[code]` |
| `lib/actions.ts` | All writes: pay, match, order, lookup batch |
| `lib/qr.ts` | Parse QR URL or typed `AGS-…` |
| `lib/utils.ts` | Haversine, batch codes, 15% sale margin |
| `components/*-app/` | Each portal’s UI |
| `supabase/migrations/` | Schema |
| `scripts/seed.mjs` | `npm run seed` — 3-minute story |
| `mock-data/` | Simulated mandi, GPS, payments |

---

## 3. Architecture & data flow

### Q. Draw the architecture.

**A.**

```
Phone / laptop
    → HTTPS → Next.js on Vercel
                  → Server Actions / Server Components
                        → Supabase Auth (session cookie)
                        → Supabase Postgres
    Camera QR → /trace/AGS-XXXXXX (public)  OR  in-app lookupBatch()
```

### Q. SSR vs client?

**A.** Pages like `/employee` are **server components**: they load the profile and store lots from Postgres, then hydrate a **client** app for tapping Grade A, scanner, etc. Dashboards are fresh from the DB; the counter UI needs interactivity.

### Q. How does a “Pay farmer” click work?

**A.** Employee confirms grade and price → server action `receiveProduce` (or `logCounterProduce` for walk-in) → checks the user is an employee of that store → updates `produce_submissions` (weight, grade, paid amount, status `received`) → generates `batch_code` → inserts a **cash out** row → returns the code for the QR screen.

### Q. How do you keep someone from opening another role’s portal?

**A.** `requireProfile("employee")` on `/employee`, same pattern per route. Session exists, but **role must match**. `proxy.ts` also redirects logged-out users away from `/farmer`, `/store`, `/employee`, `/buyer`, `/logistics`, `/admin`. Public: `/`, `/login`, `/register`, `/trace`.

### Q. What is `proxy.ts`? Is it middleware?

**A.** In this Next.js version the request gate is `proxy.ts`. It reads the auth cookie and redirects. Login/`/trace` skip the slow auth round-trip so the login page does not hang.

---

## 4. Authentication

### Q. How does login work?

**A.** Email + password via Supabase Auth. On success we send them to that role’s home (`ROLE_HOME`). Demo accounts skip email confirmation (turned off in Supabase for the stage).

### Q. JWT? Sessions?

**A.** We do not mint our own JWT. Supabase stores a **session in cookies**. Server code uses `@supabase/ssr`. We prefer `getSession()` (cookie) over a network `getUser()` so a slow Auth API does not look like “logged out” after quality check.

### Q. How are new users created?

**A.** Register page: sign up + `role` in user metadata. A database trigger creates the `profiles` row. Store managers can also create **employee** accounts (server uses the **service role** key so staff can be created without a public sign-up).

### Q. OTP, Aadhaar, eKYC?

**A.** Not in the prototype. Production: Aadhaar-linked payouts / eKYC. Today: email/password so the jury can switch roles in seconds.

### Q. Is the anon key a secret leak?

**A.** No. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is meant for the browser (like a Firebase web key). The dangerous key is `SUPABASE_SERVICE_ROLE_KEY` — **server only** (seed, create employee, public trace lookup). Never commit `.env.local`.

---

## 5. Database

### Q. What are the main tables?

**A.**

- `profiles` — user, role, optional `store_id`, lat/lng  
- `white_stores` — collection centres  
- `produce_submissions` — lots: crop, kg, grade, `batch_code`, paid_amount, remaining_kg, status  
- `demands` — buyer wants X kg of a crop  
- `orders` / `order_items` — which batches filled an order  
- `deliveries` — logistics assignment and status  
- `cash_entries` — store cash in/out (**recorded**, not settled on UPI)  
- `crop_declarations` — farmer’s next-season plan  

### Q. Lot statuses?

**A.** Farmer lists → `submitted`. Employee receives/grades/pays → `received` and QR exists. `remaining_kg` falls when an order allocates that batch.

### Q. Why Postgres, not Excel / JSON?

**A.** Concurrent roles, foreign keys (order item must point at a real lot), and one source of truth for the live demo. Seed script fills it; the UI never invents stock.

### Q. Is there RLS (Row Level Security)?

**A.** RLS is **on**, but policies are **demo-grade**: authenticated users can see marketplace-style data so matching and buyer browse work without fighting the database on stage. Production would lock: farmer → own lots; employee → own store; logistics → assigned trips. We say that openly.

### Q. How do you seed the 3-minute story?

**A.** `npm run seed` (`scripts/seed.mjs`) using the service role. It creates users and leaves Rampur with 400 kg graded tomatoes, Ramesh 100 kg waiting, FreshMart onion order + 500 kg tomato demand.

---

## 6. QR and traceability

### Q. What is inside the QR?

**A.** A **URL**, not the crop data:  
`https://<our-domain>/trace/AGS-K7M2QX`  
The code is the pointer. Grade and farmer live in Postgres.

### Q. How is the batch code made?

**A.** `generateBatchCode()`: `AGS-` plus 6 characters from an alphabet that **drops 0/O/1/I** so staff do not misread labels.

### Q. Phone camera vs in-app scan?

**A.**

- **Any phone camera** → public `/trace/…` (no login).  
- **Buyer Verify / logistics pickup & delivery** → in-app scanner (`html5-qrcode`) calls `lookupBatch()` and **stays in the app**. We do not `router.push(/trace)` for those flows.  
- If camera is blocked: **type** `AGS-XXXXXX`. Camera needs **HTTPS** (Vercel).

### Q. Why not blockchain?

**A.** Blockchain does not weigh the crate or pay the farmer. Trust here is the **White Store gate** plus an append-only Postgres record. A public trace URL is enough for SIH. Ledger/anchoring can be added later without changing the QR format.

### Q. Can someone fake a QR?

**A.** They can print a URL; lookup fails if the code is not in `produce_submissions`. Logistics also checks the scan against **that trip’s** batch. Stolen labels are an operational problem (sealed crates, staff process) — same as any warehouse.

---

## 7. Matching, scoring, price

### Q. How does admin “Match supply” work?

**A.** Function `matchDemand`:

1. Load the open demand.  
2. Load `received` lots of that crop with `remaining_kg > 0`.  
3. Group by **store**.  
4. Pick the store whose **total stock ≥ demand** (largest such store).  
5. Allocate **FIFO** (oldest batch first; last batch may be partial).  
6. Insert `orders`, `order_items`, decrement `remaining_kg`, create a `deliveries` row (`requested`).  
7. If no single store can cover it → error (we do **not** split across stores in this prototype).

### Q. Why single-store fulfilment?

**A.** One pickup, one truck, one scan story. Multi-store pooling is future work.

### Q. How is the buyer match score calculated?

**A.** Explainable 0–100, **not ML**. Across the visible list:

- **Price 35%** — cheaper is better (normalised min–max)  
- **Quality 30%** — Grade A = 1.0, B = 0.65, C = 0.35  
- **Quantity 15%** — larger available kg ranks higher  
- **Distance 20%** — closer (Haversine km); if no GPS, score is reweighted without distance  

Jury line: *“The buyer can open the breakdown — we are not a black-box recommender.”*

### Q. How is distance calculated?

**A.** Haversine formula on lat/lng, Earth radius 6371 km. No Maps SDK, no routing traffic. Good enough to rank “near vs far.”

### Q. Farmer price vs buyer price?

**A.** Farmer is paid `price_per_kg` at the counter. Buyer list price is about **15% higher** (`salePricePerKg`) — White Store margin for handling, grade, hold, dispatch.

### Q. Is payment real UPI?

**A.** **No.** We **record** a cash-out in `cash_entries` so the ledger and farmer earnings move. There is no Razorpay/NPCI. Mock `processPayment` in `mock-data` is for the admin Simulated console only. Production: same ledger, real UPI/escrow.

---

## 8. Mandi prices, weather, logistics GPS

### Q. Are mandi prices live Agmarknet?

**A.** **No.** `getMarketPrices()` returns a **simulated APMC feed** (6 Karnataka markets × 21 days + hourly jitter). UI is badged **SIMULATED MANDI**. Admin → **Market prices**; farmer home tile → same feed vs White Store Grade A ₹/kg. Later: same function, Agmarknet/eNAM behind it.

### Q. Do you predict weather / crop prices with AI?

**A.** **No.** Weather is **Open-Meteo** at the farm’s coordinates (national grid, ~9 km). We score **risk** (LOW / MODERATE / HIGH) from rain and Indian season (Kharif / Rabi / Zaid). We do not train a model. Mandi page is demo data, not a forecast network.

### Q. Is the truck GPS real?

**A.** **Live** trips (created from real orders) are progressed in Postgres. **Overlay** trips and interpolating lat/lng are **simulated** and badged. No Google/Mapbox SDK.

### Q. Logistics scan?

**A.** On a **live** trip, pickup-complete and delivery-complete require scanning (or typing) the batch that belongs to that cargo. Simulated overlay trips skip that gate.

---

## 9. What is real vs demo (say this early)

### Q. What actually hits the database?

**A. Real:** login, list produce, weigh/grade/pay, QR, buyer orders, admin match, live deliveries, cash rows, `/trace`, Open-Meteo weather.

**A. Simulated:** mandi APMC table, mock GMV analytics, fake payment gateway, extra GPS trips, KYC **document labels** (no Aadhaar numbers).

**A. Not built:** live UPI, maps SDK, production RLS, split fulfilment across stores, offline counter.

Line: *“We labelled simulations so we do not fake NPCI or Agmarknet on stage.”*

---

## 10. Hosting, env, demo ops

### Q. How is it deployed?

**A.** GitHub repo → Vercel. Production URL is HTTPS. Env on Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Supabase Auth **Site URL** and Redirect URLs must be that Vercel domain. Turn **Deployment Protection** off or the jury hits a Vercel login wall.

### Q. Camera does not open?

**A.** Must be HTTPS (or localhost). Permission denied → type the batch code. That is a designed fallback.

### Q. Story already “used up”?

**A.** `npm run seed` again (locally) or re-seed against the same Supabase project so Ramesh’s 100 kg and the tomato demand reset.

---

## 11. Security, scale, cost

### Q. Is this production-secure?

**A.** It is a **prototype**. Auth and roles exist; RLS is loose for the demo; service role is server-side. Production: tighten RLS, rotate demo passwords, UPI with proper KYC, rate-limit `/trace`, audit logs.

### Q. How would this scale to a district / state?

**A.** Postgres + indexes on `store_id`, `batch_code`, `status`. Vercel scales the web tier. Camera work is on-device. Bottleneck is **operations** (staff at stores), not the web app at SIH volume. State scale: regional DBs, object storage for crate photos, queue for offline counters.

### Q. Cost model?

**A.** Prototype: Supabase free/pro + Vercel. Production: per-store SaaS or FPO/govt node; take a thin handling margin (we already model ~15% list vs farmer pay) rather than squeezing the farmer after harvest.

### Q. Offline village connectivity?

**A.** Counter today needs network. Future: PWA queue, sync when online. Honest answer — not built.

---

## 12. Novelty, impact, competitors

### Q. How is this different from eNAM / AgriBazaar / farm-to-consumer apps?

**A.** eNAM is auction/mandi infrastructure. Consumer apps skip bulk buyers. We combine: **physical aggregation**, **pay farmer first** (not after the buyer pays), **grade locked to QR**, **explainable score**, **logistics + store cash in the same loop**.

### Q. Social impact?

**A.** Immediate cash reduces distress sales. 20 kg becomes visible through aggregation. Buyers stop discounting “unknown village” risk. White Stores create local jobs (counter, grader, driver). Faster offtake can cut food loss. Fits FPO / collection-centre policy — digital ledger **on** a village node, not instead of it.

### Q. Who pays for the White Store?

**A.** Prototype does not finance capex. In reality: FPO, PACS, private franchise, or state collection centre. Software is the ledger and matching layer.

### Q. MSP / government procurement?

**A.** Crop declarations (what farmers will grow) can later feed planning. Not wired to MSP APIs in this build.

---

## 13. Algorithms they may poke

### Q. Haversine — what is it?

**A.** Great-circle distance between two GPS points. We use it to rank stores/batches by km. It is not driving directions.

### Q. FIFO allocation?

**A.** First in, first out: oldest graded lot is sold first so produce does not sit. Fair to farmers who arrived earlier.

### Q. Why those score weights (35/30/15/20)?

**A.** Buyers care most about **price and grade**; quantity and distance still matter. Weights are **tunable constants**, not learned. We can show the breakdown in the UI.

### Q. Batch code collision?

**A.** 6 chars from a 32-symbol alphabet → large space. If insert hits a unique constraint, we regenerate (`receiveProduce` retries).

---

## 14. Testing & quality

### Q. Automated tests?

**A.** This is an SIH prototype focused on a live path, not a full test suite. Integrity checks exist in `mock-data` (`assertDataset`). Production would add tests on `matchDemand`, `parseBatchCode`, and payment recording.

### Q. How do you avoid double-paying a farmer?

**A.** Receive is a **status transition** on one row (`submitted` → `received`) with paid amount set once. Re-running inspect on an already-received lot is not the happy path; unique `batch_code` and remaining kg keep later orders from inventing stock.

---

## 15. Future work (if they ask “what’s next”)

1. Real UPI / escrow (farmer paid at gate, buyer pays into escrow).  
2. Tighter RLS.  
3. Agmarknet behind `getMarketPrices`.  
4. GPS breadcrumbs on live trips.  
5. Multi-store pooling.  
6. Cold-chain / spoilage on the score.  
7. Offline employee counter.  
8. Crate photos on the batch.

Do **not** promise we already did these.

---

## 16. Trap questions — short answers

| They say | You say |
|---|---|
| “Is this AI?” | Score and weather risk are **rules**, not a trained model. Open-Meteo is the weather source. |
| “ChatGPT in the app?” | No. |
| “Blockchain?” | No. Trusted counter + Postgres + public trace URL. |
| “Show the ML pipeline” | There isn’t one. |
| “Live mandi API?” | Simulated, labelled. Interface is ready to swap. |
| “PCI / UPI certified?” | No. Ledger only. |
| “GDPR / DPDP?” | Prototype; production needs consent, minimisation, no Aadhaar in this DB. |
| “Why web, villages have Jio?” | Works on a phone browser; PWA later. Employee counter is the heavy UI. |
| “What if two buyers order the same kg?” | Matching/orders decrement `remaining_kg` on the server. Last write wins only if we did not check remaining — we **do** check `remaining_kg > 0` and subtract on allocate. |
| “Open source?” | GitHub public repo for the hackathon; say the org/repo if asked. |

---

## 17. Demo logins (memorise)

All passwords: `agrisetu123`

- `employee1@agrisetu.demo` — Suresh, Rampur counter  
- `farmer1@agrisetu.demo` — Ramesh Kumar  
- `buyer1@agrisetu.demo` — FreshMart  
- `logistics1@agrisetu.demo` — Shakti Transport  
- `admin@agrisetu.demo` — matching + market prices  
- `store1@agrisetu.demo` — Rampur manager  

---

## 18. One closing line

> We did not replace the mandi in one hackathon. We showed that if you **pay the farmer at a White Store they can walk to**, lock **grade on a QR batch**, and let a bulk buyer **verify the crate**, 20 kg stops being invisible.

If they ask a code question you cannot answer: repeat section 0, then offer the **tomato walkthrough**.
