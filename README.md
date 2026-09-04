# Agri Setu

**Smart India Hackathon prototype** — a centralized agricultural marketplace connecting farmers, White Store collection centers, and bulk buyers in one system.

> Don't make the farmer search for the market. Organize the market around the farmer's supply.

## How it works

```
FARMER → WHITE STORE (weigh · grade · pay instantly · QR batch) → BUYERS (browse · score · order) 
                                                                 ↑
                                                            LOGISTICS
```

Farmers bring produce to their nearest White Store (suggested automatically). Store employees weigh it, assign a quality grade, and pay the farmer on the spot — creating a unique QR-coded batch. Buyers browse batches ranked by a score (price, quality, quantity, distance), order directly, and verify any package by scanning its QR code.

## Feature map

- **Farmer** — registration, list produce (nearest store suggested), instant payment at receiving, upcoming crop declaration, batch/QR view
- **Store employee** — register farmers, record walk-in produce, weighing, quality grading, immediate farmer payment, batch + QR creation, order accept/dispatch, inventory
- **Store manager** — dashboard (sales, purchases, inventory, orders, cash balance), farmer records, transaction records, cash in/out ledger, employee accounts
- **Buyer** — registration, browse produce with scoring + filters (price, grade, quantity, distance), batch details, direct ordering, order tracking, QR verification, delivery confirmation, order history
- **Admin** — network overview, bulk matching, **Market prices** (demo APMC / mandi feed), plus a **Simulated data** console (mock GMV, verification labels, payments, GPS)
- **Logistics** — accept and progress live deliveries; board also overlays centralized mock trips / GPS / earnings
- **Public** — `/trace/AGS-XXXXXX` batch verification page (what the QR opens)

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS 4)
- **Supabase** (Postgres + Auth)
- **qrcode** for batch QR generation

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a free project.

### 2. Run the schema

Open the **SQL Editor** in your Supabase dashboard and run, in order:

1. [`supabase/migrations/001_schema.sql`](supabase/migrations/001_schema.sql)
2. [`supabase/migrations/002_agri_setu.sql`](supabase/migrations/002_agri_setu.sql)

(If you already ran 001 previously, just run 002.)

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in from **Project Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # seed script, staff account creation, trace page
```

Also disable email confirmation for the demo: **Authentication → Sign In / Up → Email → turn off "Confirm email"** (so registrations work instantly on stage).

### 4. Install and seed

```bash
npm install
npm run seed     # creates demo accounts + data
npm run dev      # http://localhost:3000
```

## Demo accounts

All passwords: `agrisetu123`

| Email | Role | Notes |
|---|---|---|
| `admin@agrisetu.demo` | Admin | Runs bulk supply-demand matching |
| `farmer1@agrisetu.demo` | Farmer | Ramesh Kumar — 100 kg tomatoes waiting at the counter |
| `farmer2@agrisetu.demo` | Farmer | Sita Devi — already paid for 2 batches |
| `farmer3@agrisetu.demo` | Farmer | Mahesh Patil — already paid for 2 batches |
| `store1@agrisetu.demo` | Store manager | Rampur White Store |
| `store2@agrisetu.demo` | Store manager | Lakshmipur White Store |
| `employee1@agrisetu.demo` | Store employee | Suresh Yadav — Rampur counter |
| `employee2@agrisetu.demo` | Store employee | Kavita Sharma — Lakshmipur counter |
| `buyer1@agrisetu.demo` | Buyer | FreshMart — pending onion order + open 500 kg tomato demand |
| `logistics1@agrisetu.demo` | Logistics | Shakti Transport |

## The 3-minute stage demo

The seed leaves the story mid-flight: 400 kg of graded tomatoes at Rampur White Store, Ramesh's 100 kg waiting at the counter, a pending 100 kg onion order from FreshMart, and FreshMart's open 500 kg tomato demand.

1. **Employee** (`employee1`) — weigh Ramesh's 100 kg, grade it **A**, set ₹20/kg → farmer paid ₹2,000 instantly, QR batch created. Open **View QR** to show the printable verification page.
2. **Farmer** (`farmer1`) — earnings show ₹2,000, batch code visible on his produce.
3. **Employee** (`employee1`) — **Accept** then **Dispatch** FreshMart's onion order.
4. **Admin** (`admin`) — the 500 kg tomato demand now has 500 kg available at one store. Click **Match supply**.
5. **Logistics** (`logistics1`) — accept both deliveries, progress to delivered.
6. **Buyer** (`buyer1`) — scan the crate QR in **Verify** (or type the batch code), then **Confirm receipt** on delivered orders.
7. **Manager** (`store1`) — show sales, purchases, inventory, farmer records and the cash in/out ledger updating through all of it.

## Project structure

```
app/
  page.tsx            Landing page (the pitch)
  login/ register/    Auth with role selection
  farmer/             List produce, declare crops, track batches & earnings
  employee/           Counter: register farmers, weigh/grade/pay, batches, orders
  store/              Manager: stats, farmer records, transactions, cash, staff
  buyer/              Browse scored batches, filters, direct orders, QR verify
  logistics/          Accept and progress deliveries
  admin/              Network overview + bulk supply-demand matching
  trace/[code]/       Public QR verification page for any batch
lib/
  actions.ts          All server actions (receiving, payments, orders, matching)
  utils.ts            Haversine distance, pricing, batch codes, grade weights
  supabase/           Supabase clients (browser / server / service-role admin)
mock-data/            Central mock marketplace dataset + services (see mock-data/README.md)
supabase/migrations/  Database schema (run in Supabase SQL editor)
scripts/seed.mjs      Demo data seeder
```

## Prototype scope

Intentionally split per the SIH prototype: **real** path is White Store receiving, QR batches, buyer orders, and matching on Supabase. **Simulated** path (logistics overlay, GPS, mandi prices, verification labels, mock payment/logistics APIs, derived analytics) lives in [`mock-data/`](mock-data/README.md) and is badged in the UI. No live payment gateway or maps SDK. RLS policies are demo-grade (authenticated users share marketplace visibility).
