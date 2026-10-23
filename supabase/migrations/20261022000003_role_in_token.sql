-- Put the user's role inside their sign-in token.
-- Supabase calls this hook each time it issues or refreshes a token and adds
-- the claim `user_role` ('staff' | 'buyer' | 'vendor'). The token is signed by
-- Supabase, so the claim cannot be altered. A change to a person's role takes
-- effect when their token next refreshes (jwt_expiry, 1 hour by default).
-- See ACCESS.md.

create function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  claims jsonb := event -> 'claims';
  found_role public.user_role;
begin
  select role into found_role
  from public.profiles
  where id = (event ->> 'user_id')::uuid;

  if found_role is null then
    claims := claims - 'user_role';
  else
    claims := jsonb_set(claims, '{user_role}', to_jsonb(found_role::text));
  end if;
  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- Only the auth service may call the hook; nobody can invoke it from the API.
revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

-- Row-level security now reads the role from the token, with a database lookup
-- as the fallback for tokens issued before the hook was enabled.
create or replace function public.current_role_name() returns public.user_role
language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(auth.jwt() ->> 'user_role', '')::public.user_role,
    (select role from public.profiles where id = auth.uid())
  )
$$;
