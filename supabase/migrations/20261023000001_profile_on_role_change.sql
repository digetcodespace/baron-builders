-- Create (or sync) a person's profile whenever their role is set, not only when the account is created.
--
-- Supabase Auth inserts a new user first and attaches `app_metadata` (where the role lives) in a
-- second step, so a trigger that only ran on INSERT never saw the role and no profile was made.
-- The role in `app_metadata` stays the single source of truth; it can only be written by the
-- server. See ACCESS.md.

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  new_role text := new.raw_app_meta_data ->> 'role';
begin
  if new_role in ('staff', 'buyer', 'vendor') then
    insert into public.profiles (id, role, email, full_name)
    values (new.id, new_role::public.user_role, new.email, new.raw_user_meta_data ->> 'full_name')
    on conflict (id) do update
      set role = excluded.role,
          email = excluded.email,
          full_name = coalesce(excluded.full_name, public.profiles.full_name);
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update of raw_app_meta_data, raw_user_meta_data on auth.users
  for each row execute function public.handle_new_user();
