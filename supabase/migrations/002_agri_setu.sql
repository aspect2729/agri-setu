-- Agri Setu upgrade: employee role, quality grading, batches + QR,
-- instant farmer payment, cash ledger, crop declarations, direct buyer orders.
-- Run this AFTER 001_schema.sql in the Supabase SQL editor.

-- ---------- Enum additions ----------
alter type user_role add value if not exists 'employee';
alter type order_status add value if not exists 'pending';
alter type order_status add value if not exists 'accepted';

-- ---------- Profiles: employees belong to a store, coordinates for distance ----------
alter table profiles
  add column if not exists store_id uuid references white_stores (id) on delete set null,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- ---------- White Stores: coordinates for nearest-store suggestion ----------
alter table white_stores
  add column if not exists lat double precision,
  add column if not exists lng double precision;

-- ---------- Produce submissions become graded, paid batches ----------
alter table produce_submissions
  add column if not exists actual_weight_kg numeric,
  add column if not exists remaining_kg numeric,
  add column if not exists quality_grade text check (quality_grade in ('A', 'B', 'C')),
  add column if not exists quality_notes text,
  add column if not exists price_per_kg numeric,
  add column if not exists paid_amount numeric,
  add column if not exists paid_at timestamptz,
  add column if not exists batch_code text unique,
  add column if not exists received_by uuid references profiles (id) on delete set null;

-- ---------- Orders: direct buyer orders (demand becomes optional) ----------
alter table orders alter column demand_id drop not null;
alter table orders
  add column if not exists buyer_id uuid references profiles (id) on delete set null,
  add column if not exists delivery_location text;

-- ---------- Cash ledger per White Store ----------
create table if not exists cash_entries (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references white_stores (id) on delete cascade,
  direction text not null check (direction in ('in', 'out')),
  amount numeric not null check (amount > 0),
  description text not null,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Upcoming crop declarations by farmers ----------
create table if not exists crop_declarations (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references profiles (id) on delete cascade,
  crop text not null,
  season text not null,
  expected_quantity_kg numeric check (expected_quantity_kg > 0),
  expected_harvest date,
  notes text,
  created_at timestamptz not null default now()
);

-- ---------- Trigger: carry store_id and coordinates from signup metadata ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, village, role, store_id, lat, lng)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'village',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'farmer'),
    nullif(new.raw_user_meta_data ->> 'store_id', '')::uuid,
    nullif(new.raw_user_meta_data ->> 'lat', '')::double precision,
    nullif(new.raw_user_meta_data ->> 'lng', '')::double precision
  );
  return new;
end;
$$;

-- ---------- RLS for the new tables (prototype-grade, same as 001) ----------
alter table cash_entries enable row level security;
alter table crop_declarations enable row level security;

create policy "read all" on cash_entries for select to authenticated using (true);
create policy "write all" on cash_entries for all to authenticated using (true) with check (true);

create policy "read all" on crop_declarations for select to authenticated using (true);
create policy "write all" on crop_declarations for all to authenticated using (true) with check (true);
