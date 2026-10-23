-- save_project: create or update a project and its ordered stages in one transaction.
--
-- Stages are sent as a JSON array in display order: [{ "id"?: uuid, "name": text, "cutoff_date"?: date }].
-- A stage with an id is renamed and moved to its new place; one without is added; any existing stage
-- not in the list is removed (the foreign key refuses if a house is still in it). Positions are
-- renumbered 1..n. `unique (project_id, position)` is deferred, so a swap never collides mid-save.
--
-- SECURITY INVOKER: staff_all RLS decides who may write, exactly as for a direct insert.

create function public.save_project(p_project_id uuid, p_name text, p_stages jsonb)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid := p_project_id;
  v_stage jsonb;
  v_index integer := 0;
  v_stage_id uuid;
  v_keep uuid[] := '{}';
begin
  if v_id is null then
    insert into projects (name) values (p_name) returning id into v_id;
  else
    update projects set name = p_name where id = v_id;
    if not found then
      raise exception 'project not found' using errcode = 'P0002';
    end if;
  end if;

  for v_stage in select * from jsonb_array_elements(coalesce(p_stages, '[]'::jsonb)) loop
    v_index := v_index + 1;
    v_stage_id := nullif(v_stage ->> 'id', '')::uuid;
    if v_stage_id is not null then
      update project_statuses
         set name = v_stage ->> 'name',
             position = v_index,
             cutoff_date = nullif(v_stage ->> 'cutoff_date', '')::date
       where id = v_stage_id and project_id = v_id;
      if not found then
        raise exception 'stage not found' using errcode = 'P0002';
      end if;
    else
      insert into project_statuses (project_id, name, position, cutoff_date)
      values (v_id, v_stage ->> 'name', v_index, nullif(v_stage ->> 'cutoff_date', '')::date)
      returning id into v_stage_id;
    end if;
    v_keep := v_keep || v_stage_id;
  end loop;

  delete from project_statuses where project_id = v_id and not (id = any (v_keep));
  return v_id;
end;
$$;

revoke all on function public.save_project(uuid, text, jsonb) from public;
grant execute on function public.save_project(uuid, text, jsonb) to authenticated;
