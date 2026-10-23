-- Foundation: roles, projects, houses, vendors, audit log, and the RLS predicates.
-- Sheets, items, selections, invoices, payments and messages come in the next migration.
-- See DATABASE.md and ACCESS.md.

create type public.user_role as enum ('staff', 'buyer', 'vendor');

-- ---------------------------------------------------------------------------
-- Shared trigger
-- ---------------------------------------------------------------------------
create function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles: one row per signed-in person, carrying the role.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Roles come from app_metadata, which only the server can write. A user created
-- without a role gets no profile and therefore no access.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_role text := new.raw_app_meta_data ->> 'role';
begin
  if new_role in ('staff', 'buyer', 'vendor') then
    insert into public.profiles (id, role, email, full_name)
    values (new.id, new_role::public.user_role, new.email, new.raw_user_meta_data ->> 'full_name');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Project structure
-- ---------------------------------------------------------------------------
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_statuses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  position integer not null,
  cutoff_date date,
  created_at timestamptz not null default now(),
  unique (project_id, position) deferrable initially deferred
);
create index project_statuses_project_idx on public.project_statuses (project_id);

create table public.models (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, name)
);
create trigger models_set_updated_at before update on public.models
  for each row execute function public.set_updated_at();

create table public.houses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  model_id uuid not null references public.models (id),
  status_id uuid not null references public.project_statuses (id),
  lot text not null,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, lot)
);
create trigger houses_set_updated_at before update on public.houses
  for each row execute function public.set_updated_at();
create index houses_project_idx on public.houses (project_id);
create index houses_model_idx on public.houses (model_id);
create index houses_status_idx on public.houses (status_id);
-- Cursor pagination order.
create index houses_created_idx on public.houses (created_at desc, id desc);

create table public.house_buyers (
  house_id uuid not null references public.houses (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (house_id, user_id)
);
create index house_buyers_user_idx on public.house_buyers (user_id);

-- ---------------------------------------------------------------------------
-- Vendors and trades (set up by trade, not by company)
-- ---------------------------------------------------------------------------
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trade_id uuid not null references public.trades (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger vendors_set_updated_at before update on public.vendors
  for each row execute function public.set_updated_at();
create index vendors_trade_idx on public.vendors (trade_id);

create table public.vendor_users (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (vendor_id, user_id)
);
create index vendor_users_user_idx on public.vendor_users (user_id);

-- Which company covers each trade for a project; a model may use a different one.
create table public.project_vendors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  trade_id uuid not null references public.trades (id),
  vendor_id uuid not null references public.vendors (id),
  model_id uuid references public.models (id) on delete cascade,
  created_at timestamptz not null default now()
);
create unique index project_vendors_scope_idx
  on public.project_vendors (project_id, trade_id, coalesce(model_id, '00000000-0000-0000-0000-000000000000'));
create index project_vendors_vendor_idx on public.project_vendors (vendor_id);

-- ---------------------------------------------------------------------------
-- Audit log: written only by the service role, read by staff.
-- ---------------------------------------------------------------------------
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  house_id uuid references public.houses (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_house_idx on public.audit_log (house_id, created_at desc);
create index audit_log_created_idx on public.audit_log (created_at desc, id desc);

-- ---------------------------------------------------------------------------
-- RLS predicates. One canonical predicate per role; never re-inline these.
-- security definer so policies on other tables can call them without recursion.
-- ---------------------------------------------------------------------------
create function public.current_role_name() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'staff', false)
$$;

create function public.is_house_buyer(p_house_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.house_buyers
    where house_id = p_house_id and user_id = auth.uid()
  )
$$;

create function public.is_project_buyer(p_project_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.houses h
    join public.house_buyers hb on hb.house_id = h.id
    where h.project_id = p_project_id and hb.user_id = auth.uid()
  )
$$;

create function public.is_vendor_member(p_vendor_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.vendor_users
    where vendor_id = p_vendor_id and user_id = auth.uid()
  )
$$;

revoke all on function public.current_role_name(), public.is_staff(),
  public.is_house_buyer(uuid), public.is_project_buyer(uuid), public.is_vendor_member(uuid)
  from public;
grant execute on function public.current_role_name(), public.is_staff(),
  public.is_house_buyer(uuid), public.is_project_buyer(uuid), public.is_vendor_member(uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_statuses enable row level security;
alter table public.models enable row level security;
alter table public.houses enable row level security;
alter table public.house_buyers enable row level security;
alter table public.trades enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_users enable row level security;
alter table public.project_vendors enable row level security;
alter table public.audit_log enable row level security;

-- Staff: full access to everything they manage.
create policy staff_all on public.profiles for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.projects for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.project_statuses for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.models for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.houses for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.house_buyers for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.trades for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.vendors for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.vendor_users for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.project_vendors for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_read on public.audit_log for select to authenticated
  using (public.is_staff());

-- Everyone signed in: their own profile.
create policy self_read on public.profiles for select to authenticated
  using (id = auth.uid());

-- Buyers: only their own house, and the project/model/status it belongs to.
create policy buyer_read on public.houses for select to authenticated
  using (public.is_house_buyer(id));
create policy buyer_read on public.house_buyers for select to authenticated
  using (user_id = auth.uid());
create policy buyer_read on public.projects for select to authenticated
  using (public.is_project_buyer(id));
create policy buyer_read on public.project_statuses for select to authenticated
  using (public.is_project_buyer(project_id));
create policy buyer_read on public.models for select to authenticated
  using (public.is_project_buyer(project_id));

-- Vendors: their own company and its members. Vendor access to houses arrives
-- with sheets and vendor items (next migration): a vendor sees a house only
-- while an item for its trade is open on it.
create policy vendor_read on public.vendors for select to authenticated
  using (public.is_vendor_member(id));
create policy vendor_read on public.vendor_users for select to authenticated
  using (user_id = auth.uid());
create policy vendor_read on public.trades for select to authenticated
  using (exists (
    select 1 from public.vendors v
    where v.trade_id = trades.id and public.is_vendor_member(v.id)
  ));

-- audit_log, and the writes to every table above for non-staff, have no policy
-- by design: the service role writes the audit log, and only staff change data.

-- Realtime: staff dashboards listen for house changes (RLS still applies).
alter publication supabase_realtime add table public.houses;
