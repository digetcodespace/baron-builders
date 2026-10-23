-- Selection sheets, items, buyer selections, signatures, and vendor items.
-- Builds on 20261022000001_foundation.sql. See DATABASE.md and ACCESS.md.
-- Invoices, payments, messages, and documents come in the next migration.

create type public.item_kind as enum ('choice', 'addon', 'quantity', 'vendor');

create type public.vendor_stage as enum (
  'not_started',
  'contacted_buyer',
  'met_with_buyer',
  'finalized',
  'confirmed_by_office'
);

-- Contact details a buyer sees for the vendor covering their house.
alter table public.vendors
  add column email text,
  add column phone text;

-- ---------------------------------------------------------------------------
-- Sheets: one per model per status ("a model can have as many sheets as there
-- are statuses, and a status can have no sheet at all"). Copying a sheet to
-- another model or project is a service function that duplicates these rows.
-- ---------------------------------------------------------------------------
create table public.sheets (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models (id) on delete cascade,
  status_id uuid not null references public.project_statuses (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_id, status_id)
);
create trigger sheets_set_updated_at before update on public.sheets
  for each row execute function public.set_updated_at();
create index sheets_status_idx on public.sheets (status_id);

-- A sheet's model and status must belong to the same project.
create function public.check_sheet_scope() returns trigger
language plpgsql as $$
begin
  if (select project_id from public.models where id = new.model_id)
     is distinct from (select project_id from public.project_statuses where id = new.status_id) then
    raise exception 'sheet model and status must belong to the same project';
  end if;
  return new;
end;
$$;
create trigger sheets_check_scope before insert or update on public.sheets
  for each row execute function public.check_sheet_scope();

create table public.sheet_sections (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.sheets (id) on delete cascade,
  name text not null,
  position integer not null,
  created_at timestamptz not null default now()
);
create index sheet_sections_sheet_idx on public.sheet_sections (sheet_id, position);

-- ---------------------------------------------------------------------------
-- Items: four kinds. Prices are integer cents. Vendor items carry no price, so
-- a vendor who can read the row never sees one.
-- ---------------------------------------------------------------------------
create table public.sheet_items (
  id uuid primary key default gen_random_uuid(),
  sheet_id uuid not null references public.sheets (id) on delete cascade,
  section_id uuid references public.sheet_sections (id) on delete set null,
  kind public.item_kind not null,
  name text not null,
  description text,
  position integer not null,
  required boolean not null default true,
  -- addon: the add-on price. quantity: the price each. choice/vendor: null.
  base_price_cents integer,
  min_quantity integer,
  max_quantity integer,
  -- vendor items: the trade whose vendor fills this in.
  trade_id uuid references public.trades (id),
  -- Rule: show this item only when this option is chosen.
  visible_when_option_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sheet_items_kind_shape check (
    case kind
      when 'choice' then base_price_cents is null and min_quantity is null and max_quantity is null and trade_id is null
      when 'addon' then base_price_cents >= 0 and min_quantity is null and max_quantity is null and trade_id is null
      when 'quantity' then base_price_cents >= 0 and min_quantity >= 0
                           and (max_quantity is null or max_quantity >= min_quantity) and trade_id is null
      when 'vendor' then base_price_cents is null and min_quantity is null and max_quantity is null and trade_id is not null
    end
  )
);
create trigger sheet_items_set_updated_at before update on public.sheet_items
  for each row execute function public.set_updated_at();
create index sheet_items_sheet_idx on public.sheet_items (sheet_id, position);
create index sheet_items_section_idx on public.sheet_items (section_id);
create index sheet_items_trade_idx on public.sheet_items (trade_id);

-- Choice items: the options to pick from.
create table public.item_options (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.sheet_items (id) on delete cascade,
  name text not null,
  price_cents integer not null default 0 check (price_cents >= 0),
  position integer not null,
  -- Rule: show this option only when another option is chosen.
  visible_when_option_id uuid references public.item_options (id) on delete set null,
  created_at timestamptz not null default now()
);
create index item_options_item_idx on public.item_options (item_id, position);
create index item_options_visible_when_idx on public.item_options (visible_when_option_id);

alter table public.sheet_items
  add constraint sheet_items_visible_when_fk
  foreign key (visible_when_option_id) references public.item_options (id) on delete set null;
create index sheet_items_visible_when_idx on public.sheet_items (visible_when_option_id);

-- Rule: an option's (or an add-on/quantity item's) price depends on another choice.
create table public.price_rules (
  id uuid primary key default gen_random_uuid(),
  option_id uuid references public.item_options (id) on delete cascade,
  item_id uuid references public.sheet_items (id) on delete cascade,
  when_option_id uuid not null references public.item_options (id) on delete cascade,
  price_cents integer not null check (price_cents >= 0),
  created_at timestamptz not null default now(),
  constraint price_rules_one_target check ((option_id is null) <> (item_id is null))
);
create index price_rules_option_idx on public.price_rules (option_id);
create index price_rules_item_idx on public.price_rules (item_id);
create index price_rules_when_idx on public.price_rules (when_option_id);

-- What a vendor must enter for a vendor item (floor tile, wall tile, grout color, a PDF).
create table public.vendor_item_fields (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.sheet_items (id) on delete cascade,
  label text not null,
  field_type text not null check (field_type in ('text', 'file')),
  required boolean not null default true,
  position integer not null,
  created_at timestamptz not null default now()
);
create index vendor_item_fields_item_idx on public.vendor_item_fields (item_id, position);

-- ---------------------------------------------------------------------------
-- Buyer selections: one row per house per item.
-- ---------------------------------------------------------------------------
create table public.selections (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  item_id uuid not null references public.sheet_items (id) on delete cascade,
  -- choice: the chosen option. addon: is_selected. quantity: quantity.
  option_id uuid references public.item_options (id) on delete restrict,
  is_selected boolean,
  quantity integer check (quantity >= 0),
  -- Set once, at signing, by sign_sheet(): the price this buyer agreed to.
  unit_price_cents integer,
  selected_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (house_id, item_id),
  constraint selections_one_value check (
    (option_id is not null)::int + (is_selected is not null)::int + (quantity is not null)::int <= 1
  )
);
create trigger selections_set_updated_at before update on public.selections
  for each row execute function public.set_updated_at();
create index selections_item_idx on public.selections (item_id);
create index selections_option_idx on public.selections (option_id);
create index selections_house_idx on public.selections (house_id);
create index selections_selected_by_idx on public.selections (selected_by);

-- Each sheet is signed on its own. Written only through sign_sheet(), so the
-- total cannot be forged from the browser.
create table public.sheet_signatures (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  sheet_id uuid not null references public.sheets (id) on delete restrict,
  signed_by uuid references public.profiles (id) on delete set null,
  total_cents integer not null check (total_cents >= 0),
  signed_at timestamptz not null default now(),
  unique (house_id, sheet_id)
);
create index sheet_signatures_sheet_idx on public.sheet_signatures (sheet_id);
create index sheet_signatures_signed_by_idx on public.sheet_signatures (signed_by);

-- ---------------------------------------------------------------------------
-- Vendor item progress. A row exists for each (house, vendor item) once the
-- house reaches the sheet's status; the vendor is resolved from project_vendors
-- at that moment (service function).
-- ---------------------------------------------------------------------------
create table public.vendor_item_progress (
  id uuid primary key default gen_random_uuid(),
  house_id uuid not null references public.houses (id) on delete cascade,
  item_id uuid not null references public.sheet_items (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id),
  stage public.vendor_stage not null default 'not_started',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (house_id, item_id)
);
create trigger vendor_item_progress_set_updated_at before update on public.vendor_item_progress
  for each row execute function public.set_updated_at();
create index vendor_item_progress_vendor_idx on public.vendor_item_progress (vendor_id);
create index vendor_item_progress_item_idx on public.vendor_item_progress (item_id);
create index vendor_item_progress_created_idx on public.vendor_item_progress (created_at desc, id desc);

-- Every stage change with its date and optional note ("Appointment Tue 3pm").
create table public.vendor_item_events (
  id uuid primary key default gen_random_uuid(),
  progress_id uuid not null references public.vendor_item_progress (id) on delete cascade,
  stage public.vendor_stage not null,
  occurred_on date not null default current_date,
  note text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index vendor_item_events_progress_idx on public.vendor_item_events (progress_id, created_at desc);
create index vendor_item_events_actor_idx on public.vendor_item_events (actor_id);

-- What the vendor entered. A file value is a storage path (server-only; never sent to the browser).
create table public.vendor_item_values (
  id uuid primary key default gen_random_uuid(),
  progress_id uuid not null references public.vendor_item_progress (id) on delete cascade,
  field_id uuid not null references public.vendor_item_fields (id) on delete cascade,
  text_value text,
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (progress_id, field_id)
);
create trigger vendor_item_values_set_updated_at before update on public.vendor_item_values
  for each row execute function public.set_updated_at();
create index vendor_item_values_field_idx on public.vendor_item_values (field_id);

-- ---------------------------------------------------------------------------
-- Predicates. security definer so policies can ask without recursing into RLS.
-- ---------------------------------------------------------------------------
create function public.item_sheet_id(p_item_id uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select sheet_id from public.sheet_items where id = p_item_id
$$;

create function public.option_sheet_id(p_option_id uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select i.sheet_id
  from public.item_options o join public.sheet_items i on i.id = o.item_id
  where o.id = p_option_id
$$;

-- A buyer sees a sheet once their house has reached its status, and keeps seeing it after.
create function public.buyer_can_see_sheet(p_sheet_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.sheets s
    join public.project_statuses sheet_status on sheet_status.id = s.status_id
    join public.houses h on h.model_id = s.model_id
    join public.project_statuses current_status on current_status.id = h.status_id
    join public.house_buyers hb on hb.house_id = h.id
    where s.id = p_sheet_id
      and hb.user_id = auth.uid()
      and sheet_status.position <= current_status.position
  )
$$;

-- A vendor sees a house while an item for its trade is open on it.
create function public.is_house_vendor(p_house_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.vendor_item_progress p
    join public.vendor_users vu on vu.vendor_id = p.vendor_id
    where p.house_id = p_house_id
      and vu.user_id = auth.uid()
      and p.stage <> 'confirmed_by_office'
  )
$$;

create function public.is_vendor_progress(p_progress_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.vendor_item_progress p
    join public.vendor_users vu on vu.vendor_id = p.vendor_id
    where p.id = p_progress_id
      and vu.user_id = auth.uid()
      and p.stage <> 'confirmed_by_office'
  )
$$;

create function public.is_vendor_item(p_item_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.vendor_item_progress p
    join public.vendor_users vu on vu.vendor_id = p.vendor_id
    where p.item_id = p_item_id
      and vu.user_id = auth.uid()
      and p.stage <> 'confirmed_by_office'
  )
$$;

create function public.is_vendor_status(p_status_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.houses h
    where h.status_id = p_status_id and public.is_house_vendor(h.id)
  )
$$;

-- A vendor may see the contact details of the buyers on houses it can see.
create function public.vendor_can_see_buyer(p_user_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.house_buyers hb
    where hb.user_id = p_user_id and public.is_house_vendor(hb.house_id)
  )
$$;

-- A buyer may see the vendors covering their house.
create function public.buyer_sees_vendor(p_vendor_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.vendor_item_progress p
    join public.house_buyers hb on hb.house_id = p.house_id
    where p.vendor_id = p_vendor_id and hb.user_id = auth.uid()
  )
$$;

create function public.buyer_sees_progress(p_progress_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.vendor_item_progress p
    join public.house_buyers hb on hb.house_id = p.house_id
    where p.id = p_progress_id and hb.user_id = auth.uid()
  )
$$;

create function public.sheet_is_signed(p_house_id uuid, p_sheet_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.sheet_signatures
    where house_id = p_house_id and sheet_id = p_sheet_id
  )
$$;

revoke all on function
  public.item_sheet_id(uuid), public.option_sheet_id(uuid), public.buyer_can_see_sheet(uuid),
  public.is_house_vendor(uuid), public.is_vendor_progress(uuid), public.is_vendor_item(uuid),
  public.is_vendor_status(uuid), public.vendor_can_see_buyer(uuid), public.buyer_sees_vendor(uuid),
  public.buyer_sees_progress(uuid), public.sheet_is_signed(uuid, uuid)
  from public;
grant execute on function
  public.item_sheet_id(uuid), public.option_sheet_id(uuid), public.buyer_can_see_sheet(uuid),
  public.is_house_vendor(uuid), public.is_vendor_progress(uuid), public.is_vendor_item(uuid),
  public.is_vendor_status(uuid), public.vendor_can_see_buyer(uuid), public.buyer_sees_vendor(uuid),
  public.buyer_sees_progress(uuid), public.sheet_is_signed(uuid, uuid)
  to authenticated;

-- ---------------------------------------------------------------------------
-- Guards
-- ---------------------------------------------------------------------------

-- Signed sheets are locked. A change after signing is a new revision, never an
-- edit in place, so nobody (staff included) may touch a signed selection.
create function public.guard_signed_selection() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  target_house uuid := coalesce(new.house_id, old.house_id);
  target_item uuid := coalesce(new.item_id, old.item_id);
begin
  if public.sheet_is_signed(target_house, public.item_sheet_id(target_item)) then
    raise exception 'this sheet is signed; selections are locked' using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;
create trigger selections_guard_signed before insert or update or delete on public.selections
  for each row execute function public.guard_signed_selection();

create function public.vendor_stage_rank(s public.vendor_stage) returns integer
language sql immutable as $$
  select case s
    when 'not_started' then 0
    when 'contacted_buyer' then 1
    when 'met_with_buyer' then 2
    when 'finalized' then 3
    when 'confirmed_by_office' then 4
  end
$$;

-- Vendors move an item forward through Contacted, Met, Finalized. Only staff
-- confirm, correct a stage, or reassign.
create function public.guard_vendor_progress() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return new;
  end if;
  if new.house_id <> old.house_id or new.item_id <> old.item_id or new.vendor_id <> old.vendor_id then
    raise exception 'only staff may reassign a vendor item' using errcode = '42501';
  end if;
  if new.stage = 'confirmed_by_office'
     or public.vendor_stage_rank(new.stage) < public.vendor_stage_rank(old.stage) then
    raise exception 'only staff may confirm or move a stage backwards' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger vendor_item_progress_guard before update on public.vendor_item_progress
  for each row execute function public.guard_vendor_progress();

-- Stage history is append-only for everyone but staff.
create function public.guard_vendor_event() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if public.is_staff() or auth.uid() is null then
    return coalesce(new, old);
  end if;
  if tg_op <> 'INSERT' then
    raise exception 'stage history is append-only' using errcode = '42501';
  end if;
  if new.stage = 'confirmed_by_office' then
    raise exception 'only staff may confirm' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger vendor_item_events_guard before insert or update or delete on public.vendor_item_events
  for each row execute function public.guard_vendor_event();

-- ---------------------------------------------------------------------------
-- sign_sheet(): the only way a sheet gets signed. Called by the service role
-- after the application computes the total (price math has one home, in
-- TypeScript). Snapshots each selection's price, then writes the signature, in
-- one transaction. Prices lock for that buyer from this moment.
--   p_prices: [{"item_id": "...", "unit_price_cents": 123}, ...]
-- ---------------------------------------------------------------------------
create function public.sign_sheet(
  p_house_id uuid,
  p_sheet_id uuid,
  p_signed_by uuid,
  p_total_cents integer,
  p_prices jsonb
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  signature_id uuid;
  price jsonb;
begin
  if public.sheet_is_signed(p_house_id, p_sheet_id) then
    raise exception 'this sheet is already signed' using errcode = '23505';
  end if;

  for price in select * from jsonb_array_elements(p_prices) loop
    update public.selections
       set unit_price_cents = (price ->> 'unit_price_cents')::integer
     where house_id = p_house_id
       and item_id = (price ->> 'item_id')::uuid
       and public.item_sheet_id(item_id) = p_sheet_id;
  end loop;

  insert into public.sheet_signatures (house_id, sheet_id, signed_by, total_cents)
  values (p_house_id, p_sheet_id, p_signed_by, p_total_cents)
  returning id into signature_id;
  return signature_id;
end;
$$;
revoke all on function public.sign_sheet(uuid, uuid, uuid, integer, jsonb) from public, authenticated;
grant execute on function public.sign_sheet(uuid, uuid, uuid, integer, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------
alter table public.sheets enable row level security;
alter table public.sheet_sections enable row level security;
alter table public.sheet_items enable row level security;
alter table public.item_options enable row level security;
alter table public.price_rules enable row level security;
alter table public.vendor_item_fields enable row level security;
alter table public.selections enable row level security;
alter table public.sheet_signatures enable row level security;
alter table public.vendor_item_progress enable row level security;
alter table public.vendor_item_events enable row level security;
alter table public.vendor_item_values enable row level security;

-- Staff: everything. (sheet_signatures is read-only for staff too: written by sign_sheet().)
create policy staff_all on public.sheets for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.sheet_sections for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.sheet_items for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.item_options for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.price_rules for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.vendor_item_fields for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.selections for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_read on public.sheet_signatures for select to authenticated
  using (public.is_staff());
create policy staff_all on public.vendor_item_progress for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.vendor_item_events for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
create policy staff_all on public.vendor_item_values for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- Buyers: read the sheets their house has reached, and pick on their own house.
create policy buyer_read on public.sheets for select to authenticated
  using (public.buyer_can_see_sheet(id));
create policy buyer_read on public.sheet_sections for select to authenticated
  using (public.buyer_can_see_sheet(sheet_id));
create policy buyer_read on public.sheet_items for select to authenticated
  using (public.buyer_can_see_sheet(sheet_id));
create policy buyer_read on public.item_options for select to authenticated
  using (public.buyer_can_see_sheet(public.item_sheet_id(item_id)));
create policy buyer_read on public.price_rules for select to authenticated
  using (public.buyer_can_see_sheet(
    coalesce(public.item_sheet_id(item_id), public.option_sheet_id(option_id))
  ));
create policy buyer_read on public.vendor_item_fields for select to authenticated
  using (public.buyer_can_see_sheet(public.item_sheet_id(item_id)));

create policy buyer_read on public.selections for select to authenticated
  using (public.is_house_buyer(house_id));
create policy buyer_insert on public.selections for insert to authenticated
  with check (
    public.is_house_buyer(house_id)
    and public.buyer_can_see_sheet(public.item_sheet_id(item_id))
    and selected_by = auth.uid()
    and unit_price_cents is null
  );
create policy buyer_update on public.selections for update to authenticated
  using (public.is_house_buyer(house_id))
  with check (
    public.is_house_buyer(house_id)
    and public.buyer_can_see_sheet(public.item_sheet_id(item_id))
    and unit_price_cents is null
  );
create policy buyer_delete on public.selections for delete to authenticated
  using (public.is_house_buyer(house_id));

create policy buyer_read on public.sheet_signatures for select to authenticated
  using (public.is_house_buyer(house_id));

-- Buyers: how far along each vendor item is, and who the vendor is.
create policy buyer_read on public.vendor_item_progress for select to authenticated
  using (public.is_house_buyer(house_id));
create policy buyer_read on public.vendor_item_events for select to authenticated
  using (public.buyer_sees_progress(progress_id));
create policy buyer_read on public.vendor_item_values for select to authenticated
  using (public.buyer_sees_progress(progress_id));
create policy buyer_read on public.vendors for select to authenticated
  using (public.buyer_sees_vendor(id));

-- Vendors: only what their own open items need. No prices, invoices, or other choices.
create policy vendor_read on public.houses for select to authenticated
  using (public.is_house_vendor(id));
create policy vendor_read on public.house_buyers for select to authenticated
  using (public.is_house_vendor(house_id));
create policy vendor_read on public.profiles for select to authenticated
  using (public.vendor_can_see_buyer(id));
create policy vendor_read on public.project_statuses for select to authenticated
  using (public.is_vendor_status(id));
create policy vendor_read on public.sheet_items for select to authenticated
  using (kind = 'vendor' and public.is_vendor_item(id));
create policy vendor_read on public.vendor_item_fields for select to authenticated
  using (public.is_vendor_item(item_id));

create policy vendor_read on public.vendor_item_progress for select to authenticated
  using (public.is_vendor_progress(id));
create policy vendor_update on public.vendor_item_progress for update to authenticated
  using (public.is_vendor_progress(id))
  with check (public.is_vendor_progress(id));
create policy vendor_read on public.vendor_item_events for select to authenticated
  using (public.is_vendor_progress(progress_id));
create policy vendor_insert on public.vendor_item_events for insert to authenticated
  with check (public.is_vendor_progress(progress_id) and actor_id = auth.uid());
create policy vendor_read on public.vendor_item_values for select to authenticated
  using (public.is_vendor_progress(progress_id));
create policy vendor_insert on public.vendor_item_values for insert to authenticated
  with check (public.is_vendor_progress(progress_id));
create policy vendor_update on public.vendor_item_values for update to authenticated
  using (public.is_vendor_progress(progress_id))
  with check (public.is_vendor_progress(progress_id));

-- sheet_signatures has no authenticated write policy by design: sign_sheet() is
-- the only writer, and it is granted to the service role alone.

-- Realtime: dashboards and portals update live (RLS still applies).
alter publication supabase_realtime add table public.selections;
alter publication supabase_realtime add table public.vendor_item_progress;
alter publication supabase_realtime add table public.sheet_signatures;
