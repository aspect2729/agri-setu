-- Krishi Share schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).

-- ---------- Enums ----------
create type user_role as enum ('farmer', 'store', 'buyer', 'logistics', 'admin');
create type submission_status as enum ('submitted', 'received', 'matched', 'dispatched', 'delivered', 'paid');
create type demand_status as enum ('open', 'matched', 'fulfilled');
create type order_status as enum ('matched', 'pickup_scheduled', 'in_transit', 'delivered', 'completed');
create type delivery_status as enum ('requested', 'accepted', 'picked_up', 'in_transit', 'delivered');

-- ---------- Tables ----------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  village text,
  role user_role not null default 'farmer',
  created_at timestamptz not null default now()
);

create table white_stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  village text not null,
  address text,
  operator_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table produce_submissions (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid not null references profiles (id) on delete cascade,
  store_id uuid not null references white_stores (id) on delete cascade,
  crop text not null,
  quantity_kg numeric not null check (quantity_kg > 0),
  expected_price numeric check (expected_price >= 0),
  status submission_status not null default 'submitted',
  created_at timestamptz not null default now()
);

create table demands (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles (id) on delete cascade,
  crop text not null,
  quantity_kg numeric not null check (quantity_kg > 0),
  offered_price numeric check (offered_price >= 0),
  needed_by date,
  location text,
  status demand_status not null default 'open',
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  demand_id uuid not null references demands (id) on delete cascade,
  store_id uuid not null references white_stores (id) on delete cascade,
  crop text not null,
  quantity_kg numeric not null,
  agreed_price numeric not null,
  status order_status not null default 'matched',
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  submission_id uuid not null references produce_submissions (id) on delete cascade,
  quantity_kg numeric not null,
  amount numeric not null
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  logistics_id uuid references profiles (id) on delete set null,
  pickup_location text not null,
  dropoff_location text not null,
  status delivery_status not null default 'requested',
  created_at timestamptz not null default now()
);

-- ---------- Auto-create profile on signup ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, village, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'User'),
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'village',
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'farmer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row Level Security ----------
-- Prototype-grade policies: any authenticated user can read everything
-- (the platform is a shared marketplace); writes are open to authenticated
-- users so every role dashboard works. Tighten per-role for production.
alter table profiles enable row level security;
alter table white_stores enable row level security;
alter table produce_submissions enable row level security;
alter table demands enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table deliveries enable row level security;

create policy "read all" on profiles for select to authenticated using (true);
create policy "update own profile" on profiles for update to authenticated using (id = auth.uid());

create policy "read all" on white_stores for select to authenticated using (true);
create policy "write all" on white_stores for all to authenticated using (true) with check (true);

create policy "read all" on produce_submissions for select to authenticated using (true);
create policy "write all" on produce_submissions for all to authenticated using (true) with check (true);

create policy "read all" on demands for select to authenticated using (true);
create policy "write all" on demands for all to authenticated using (true) with check (true);

create policy "read all" on orders for select to authenticated using (true);
create policy "write all" on orders for all to authenticated using (true) with check (true);

create policy "read all" on order_items for select to authenticated using (true);
create policy "write all" on order_items for all to authenticated using (true) with check (true);

create policy "read all" on deliveries for select to authenticated using (true);
create policy "write all" on deliveries for all to authenticated using (true) with check (true);
