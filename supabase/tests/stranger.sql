-- The stranger test (ACCESS.md). Run against a real database; it rolls back, leaving nothing behind.
--   npx supabase db query --linked -f supabase/tests/stranger.sql
-- Every row in the result must have passed = true.

begin;

create temp table results (n serial, check_name text, expected text, actual text, passed boolean);
grant all on results to public;
grant usage on sequence results_n_seq to public;

-- Helpers run as the calling role, so RLS applies exactly as in production.
create function public.t_count(q text) returns bigint language plpgsql as $$
declare c bigint; begin execute 'select count(*) from (' || q || ') s' into c; return c; end $$;

create function public.t_try(q text) returns text language plpgsql as $$
begin execute q; return 'ok'; exception when others then return 'blocked'; end $$;

grant execute on function public.t_count(text), public.t_try(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures (as the table owner)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_app_meta_data) values
  ('a0000000-0000-0000-0000-000000000001', 'staff@test.invalid', '{"role":"staff"}'),
  ('b0000000-0000-0000-0000-000000000001', 'buyer1@test.invalid', '{"role":"buyer"}'),
  ('b0000000-0000-0000-0000-000000000002', 'buyer2@test.invalid', '{"role":"buyer"}'),
  ('c0000000-0000-0000-0000-000000000001', 'tile@test.invalid', '{"role":"vendor"}'),
  ('c0000000-0000-0000-0000-000000000002', 'electric@test.invalid', '{"role":"vendor"}'),
  ('d0000000-0000-0000-0000-000000000001', 'noprofile@test.invalid', '{}');

insert into public.projects (id, name) values ('10000000-0000-0000-0000-000000000001', 'Test Crossing');
insert into public.project_statuses (id, project_id, name, position) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Contract signed', 1),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Finishes', 2);
insert into public.models (id, project_id, name) values ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'A-34');
insert into public.houses (id, project_id, model_id, status_id, lot) values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '1'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '2');
insert into public.house_buyers (house_id, user_id) values
  ('40000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002');

insert into public.trades (id, name) values
  ('50000000-0000-0000-0000-000000000001', 'tile'),
  ('50000000-0000-0000-0000-000000000002', 'electric');
insert into public.vendors (id, name, trade_id) values
  ('60000000-0000-0000-0000-000000000001', 'Tile Co', '50000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'Electric Co', '50000000-0000-0000-0000-000000000002');
insert into public.vendor_users (vendor_id, user_id) values
  ('60000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002');

insert into public.sheets (id, model_id, status_id, name) values
  ('70000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Structural');
insert into public.sheet_items (id, sheet_id, kind, name, position, trade_id) values
  ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001', 'vendor', 'Tile', 1, '50000000-0000-0000-0000-000000000001');
insert into public.sheet_items (id, sheet_id, kind, name, position) values
  ('80000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001', 'choice', 'Doors', 2);
insert into public.item_options (id, item_id, name, price_cents, position) values
  ('90000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000002', 'Oak', 50000, 1);
-- Tile Co has an open item on house 1 only; Electric Co has none.
insert into public.vendor_item_progress (id, house_id, item_id, vendor_id) values
  ('a1000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- Checks. Each block impersonates one person.
-- ---------------------------------------------------------------------------
create function pg_temp.as_user(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', uid, true);
  perform set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
end $$;

-- Staff
set local role authenticated;
select pg_temp.as_user('a0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'staff sees every house', '2', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 2;
insert into results (check_name, expected, actual, passed)
  select 'staff reads the audit log', 'ok', public.t_try('select 1 from public.audit_log'), public.t_try('select 1 from public.audit_log') = 'ok';
reset role;

-- Buyer 1
set local role authenticated;
select pg_temp.as_user('b0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 sees only their own house', '1', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 1;
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot open buyer 2''s house by id', '0',
    public.t_count('select 1 from public.houses where id = ''40000000-0000-0000-0000-000000000002''')::text,
    public.t_count('select 1 from public.houses where id = ''40000000-0000-0000-0000-000000000002''') = 0;
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot read the audit log', '0', public.t_count('select 1 from public.audit_log')::text, public.t_count('select 1 from public.audit_log') = 0;
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot create a project', 'blocked',
    public.t_try('insert into public.projects (name) values (''x'')'),
    public.t_try('insert into public.projects (name) values (''x'')') = 'blocked';
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 can pick on their own house', 'ok',
    public.t_try('insert into public.selections (house_id, item_id, option_id, selected_by) values (''40000000-0000-0000-0000-000000000001'', ''80000000-0000-0000-0000-000000000002'', ''90000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'')'),
    true;
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot pick on buyer 2''s house', 'blocked',
    public.t_try('insert into public.selections (house_id, item_id, option_id, selected_by) values (''40000000-0000-0000-0000-000000000002'', ''80000000-0000-0000-0000-000000000002'', ''90000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'')'),
    true;
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot forge a signature', 'blocked',
    public.t_try('insert into public.sheet_signatures (house_id, sheet_id, signed_by, total_cents) values (''40000000-0000-0000-0000-000000000001'', ''70000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'', 1)'),
    public.t_try('insert into public.sheet_signatures (house_id, sheet_id, signed_by, total_cents) values (''40000000-0000-0000-0000-000000000001'', ''70000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'', 1)') = 'blocked';
insert into results (check_name, expected, actual, passed)
  select 'buyer 1 cannot call sign_sheet', 'blocked',
    public.t_try('select public.sign_sheet(''40000000-0000-0000-0000-000000000001'', ''70000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'', 1, ''[]''::jsonb)'),
    public.t_try('select public.sign_sheet(''40000000-0000-0000-0000-000000000001'', ''70000000-0000-0000-0000-000000000001'', ''b0000000-0000-0000-0000-000000000001'', 1, ''[]''::jsonb)') = 'blocked';
reset role;

-- Buyer 2
set local role authenticated;
select pg_temp.as_user('b0000000-0000-0000-0000-000000000002');
insert into results (check_name, expected, actual, passed)
  select 'buyer 2 sees only their own house', '1', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 1;
insert into results (check_name, expected, actual, passed)
  select 'buyer 2 cannot see buyer 1''s selection', '0', public.t_count('select 1 from public.selections')::text, public.t_count('select 1 from public.selections') = 0;
reset role;

-- Vendor: Tile Co
set local role authenticated;
select pg_temp.as_user('c0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'tile vendor sees only the house with its open item', '1', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 1;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor sees only its own item, not the buyer''s choice item', '1', public.t_count('select 1 from public.sheet_items')::text, public.t_count('select 1 from public.sheet_items') = 1;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor cannot see any selections', '0', public.t_count('select 1 from public.selections')::text, public.t_count('select 1 from public.selections') = 0;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor cannot see option prices', '0', public.t_count('select 1 from public.item_options')::text, public.t_count('select 1 from public.item_options') = 0;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor sees the buyer on its house, not the other buyer', '2',
    public.t_count('select 1 from public.profiles')::text, -- its own profile + buyer 1
    public.t_count('select 1 from public.profiles') = 2;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor can move its item to contacted_buyer', 'ok',
    public.t_try('update public.vendor_item_progress set stage = ''contacted_buyer'''),
    public.t_count('select 1 from public.vendor_item_progress where stage = ''contacted_buyer''') = 1;
insert into results (check_name, expected, actual, passed)
  select 'tile vendor cannot confirm its own item', 'blocked',
    public.t_try('update public.vendor_item_progress set stage = ''confirmed_by_office'''),
    public.t_try('update public.vendor_item_progress set stage = ''confirmed_by_office''') = 'blocked';
insert into results (check_name, expected, actual, passed)
  select 'tile vendor cannot move a stage backwards', 'blocked',
    public.t_try('update public.vendor_item_progress set stage = ''not_started'''),
    public.t_try('update public.vendor_item_progress set stage = ''not_started''') = 'blocked';
reset role;

-- Vendor: Electric Co (a different trade)
set local role authenticated;
select pg_temp.as_user('c0000000-0000-0000-0000-000000000002');
insert into results (check_name, expected, actual, passed)
  select 'electric vendor sees no houses', '0', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 0;
insert into results (check_name, expected, actual, passed)
  select 'electric vendor cannot see tile''s progress', '0', public.t_count('select 1 from public.vendor_item_progress')::text, public.t_count('select 1 from public.vendor_item_progress') = 0;
reset role;

-- A user with no profile
set local role authenticated;
select pg_temp.as_user('d0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'a user with no profile sees no houses', '0', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 0;
reset role;

-- Signing locks the sheet. sign_sheet is the service role's alone.
select public.sign_sheet(
  '40000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001', 50000,
  '[{"item_id":"80000000-0000-0000-0000-000000000002","unit_price_cents":50000}]'::jsonb);
insert into results (check_name, expected, actual, passed)
  select 'signing snapshots the price', '50000',
    (select unit_price_cents::text from public.selections where house_id = '40000000-0000-0000-0000-000000000001'),
    (select unit_price_cents from public.selections where house_id = '40000000-0000-0000-0000-000000000001') = 50000;

set local role authenticated;
select pg_temp.as_user('b0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'buyer cannot change a signed selection', 'blocked',
    public.t_try('update public.selections set option_id = null'),
    public.t_try('update public.selections set option_id = null') = 'blocked';
reset role;
set local role authenticated;
select pg_temp.as_user('a0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'even staff cannot change a signed selection', 'blocked',
    public.t_try('update public.selections set option_id = null'),
    public.t_try('update public.selections set option_id = null') = 'blocked';
reset role;


-- ---------------------------------------------------------------------------
-- Role in the token (custom access token hook)
-- ---------------------------------------------------------------------------
insert into results (check_name, expected, actual, passed)
  select 'hook adds user_role=buyer to a buyer''s token', 'buyer',
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'b0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role'),
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'b0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role') = 'buyer';
insert into results (check_name, expected, actual, passed)
  select 'hook adds user_role=vendor to a vendor''s token', 'vendor',
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'c0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role'),
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'c0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role') = 'vendor';
insert into results (check_name, expected, actual, passed)
  select 'hook adds no role for a user with no profile', 'null',
    coalesce(public.custom_access_token_hook(jsonb_build_object('user_id', 'd0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role', 'null'),
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'd0000000-0000-0000-0000-000000000001', 'claims', '{}'::jsonb)) -> 'claims' ->> 'user_role') is null;
insert into results (check_name, expected, actual, passed)
  select 'hook keeps the rest of the token intact', 'x',
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'b0000000-0000-0000-0000-000000000001', 'claims', '{"aal":"x"}'::jsonb)) -> 'claims' ->> 'aal'),
    (public.custom_access_token_hook(jsonb_build_object('user_id', 'b0000000-0000-0000-0000-000000000001', 'claims', '{"aal":"x"}'::jsonb)) -> 'claims' ->> 'aal') = 'x';

set local role authenticated;
select pg_temp.as_user('b0000000-0000-0000-0000-000000000001');
insert into results (check_name, expected, actual, passed)
  select 'nobody can call the hook from the API', 'blocked',
    public.t_try('select public.custom_access_token_hook(''{}''::jsonb)'),
    public.t_try('select public.custom_access_token_hook(''{}''::jsonb)') = 'blocked';
reset role;

-- A token carrying user_role works for the rules (no profile lookup needed).
set local role authenticated;
select set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', json_build_object('sub', 'a0000000-0000-0000-0000-000000000001', 'role', 'authenticated', 'user_role', 'staff')::text, true);
insert into results (check_name, expected, actual, passed)
  select 'a staff token sees every house', '2', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 2;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', 'b0000000-0000-0000-0000-000000000002', true);
select set_config('request.jwt.claims', json_build_object('sub', 'b0000000-0000-0000-0000-000000000002', 'role', 'authenticated', 'user_role', 'buyer')::text, true);
insert into results (check_name, expected, actual, passed)
  select 'a buyer token still sees only its own house', '1', public.t_count('select 1 from public.houses')::text, public.t_count('select 1 from public.houses') = 1;
insert into results (check_name, expected, actual, passed)
  select 'a buyer token cannot create a project', 'blocked',
    public.t_try('insert into public.projects (name) values (''x'')'),
    public.t_try('insert into public.projects (name) values (''x'')') = 'blocked';
reset role;


-- ---------------------------------------------------------------------------
-- Supabase Auth creates an account first and attaches the role afterwards.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_app_meta_data)
  values ('f0000000-0000-0000-0000-000000000001', 'late-role@test.invalid', '{}');
insert into results (check_name, expected, actual, passed)
  select 'an account with no role has no profile', '0',
    (select count(*) from public.profiles where id = 'f0000000-0000-0000-0000-000000000001')::text,
    (select count(*) from public.profiles where id = 'f0000000-0000-0000-0000-000000000001') = 0;
update auth.users set raw_app_meta_data = '{"role":"buyer"}' where id = 'f0000000-0000-0000-0000-000000000001';
insert into results (check_name, expected, actual, passed)
  select 'the profile appears the moment a role is attached', 'buyer',
    (select role::text from public.profiles where id = 'f0000000-0000-0000-0000-000000000001'),
    (select role::text from public.profiles where id = 'f0000000-0000-0000-0000-000000000001') = 'buyer';

select n, check_name, expected, actual, passed from results order by n;

rollback;
