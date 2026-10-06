-- A release keeps a complete snapshot for laboratory reproducibility. At
-- publication time, however, it may change only its explicit component
-- targets. This function locks production state and composes the new snapshot
-- from the current active release plus the release's changed_definition_ids.

create or replace function public.visual_catalog_definition_target_key(
  p_definition_id uuid
)
returns jsonb
language sql
stable
set search_path = public
as $$
  select jsonb_build_object(
    'slot', definition.slot,
    'layer', definition.layer,
    'attributeId', definition.binding->'attributeId',
    'sourceValueId', coalesce(definition.binding->'sourceValueId', definition.binding->'valueId'),
    'productTemplateIds', coalesce((
      select jsonb_agg(to_jsonb(item.value) order by item.value::bigint)
      from jsonb_array_elements_text(coalesce(definition.binding->'productTemplateIds', '[]'::jsonb)) item(value)
    ), '[]'::jsonb),
    'activationConditions', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'attributeId', condition.value->'attributeId',
          'sourceValueIds', coalesce((
            select jsonb_agg(to_jsonb(source_value.value) order by source_value.value::bigint)
            from jsonb_array_elements_text(coalesce(condition.value->'sourceValueIds', '[]'::jsonb)) source_value(value)
          ), '[]'::jsonb)
        )
        order by (condition.value->>'attributeId')::bigint
      )
      from jsonb_array_elements(coalesce(definition.activation_conditions, '[]'::jsonb)) condition(value)
    ), '[]'::jsonb)
  )
  from public.visual_definition_versions definition
  where definition.id = p_definition_id;
$$;

create or replace function public.visual_catalog_apply_release_changes(
  p_release_id uuid,
  p_actor_email text,
  p_action text
)
returns setof public.visual_catalog_releases
language plpgsql
security definer
set search_path = public
as $$
declare
  target_release public.visual_catalog_releases%rowtype;
  active_release public.visual_catalog_releases%rowtype;
  previous_release_id uuid;
  next_definition_ids jsonb := '[]'::jsonb;
  changed_count integer;
  found_changed_count integer;
  activated_at timestamptz := now();
begin
  if p_action not in ('published', 'restored') then
    raise exception 'Accion de release visual no valida.';
  end if;

  if nullif(trim(p_actor_email), '') is null then
    raise exception 'El actor de la release visual es obligatorio.';
  end if;

  insert into public.visual_catalog_release_state (id, active_release_id, updated_at)
  values ('production', null, activated_at)
  on conflict (id) do nothing;

  select active_release_id into previous_release_id
    from public.visual_catalog_release_state
    where id = 'production'
    for update;

  select * into target_release
    from public.visual_catalog_releases
    where id = p_release_id
    for update;

  if not found then
    raise exception 'La release visual no existe.';
  end if;

  if p_action = 'published' and target_release.status <> 'approved' then
    raise exception 'La release debe estar aprobada antes de publicarse.';
  end if;

  if p_action = 'restored' and target_release.status = 'active'
     and previous_release_id = p_release_id then
    return next target_release;
    return;
  end if;

  if p_action = 'restored' and target_release.status <> 'retired' then
    raise exception 'Solo una release retirada se puede restaurar.';
  end if;

  select * into active_release
    from public.visual_catalog_releases
    where id = previous_release_id;

  select jsonb_array_length(target_release.changed_definition_ids)
    into changed_count;
  select count(*) into found_changed_count
    from jsonb_array_elements_text(target_release.changed_definition_ids) changed(id)
    join public.visual_definition_versions definition on definition.id = changed.id::uuid;

  if changed_count <> found_changed_count then
    raise exception 'La release contiene componentes visuales que ya no existen.';
  end if;

  with changed as (
    select changed.id::uuid as id,
      public.visual_catalog_definition_target_key(changed.id::uuid) as target_key,
      changed.ordinality
    from jsonb_array_elements_text(target_release.changed_definition_ids)
      with ordinality changed(id, ordinality)
  ), active_ids as (
    select active_id.id::uuid as id, active_id.ordinality
    from jsonb_array_elements_text(coalesce(active_release.definition_ids, '[]'::jsonb))
      with ordinality active_id(id, ordinality)
  ), retained as (
    select active_ids.id, active_ids.ordinality
    from active_ids
    where not exists (
      select 1 from changed
      where public.visual_catalog_definition_target_key(active_ids.id) = changed.target_key
    )
  )
  select coalesce((
    select jsonb_agg(to_jsonb(retained.id) order by retained.ordinality)
    from retained
  ), '[]'::jsonb) || coalesce((
    select jsonb_agg(to_jsonb(changed.id) order by changed.ordinality)
    from changed
  ), '[]'::jsonb)
  into next_definition_ids;

  if previous_release_id is not null and previous_release_id <> p_release_id then
    update public.visual_catalog_releases
      set status = 'retired', updated_at = activated_at
      where id = previous_release_id;
  end if;

  update public.visual_catalog_releases
    set definition_ids = next_definition_ids,
        baseline_definition_ids = coalesce(active_release.definition_ids, '[]'::jsonb),
        base_release_id = previous_release_id,
        status = 'active',
        published_by = p_actor_email,
        published_at = coalesce(published_at, activated_at),
        updated_at = activated_at
    where id = p_release_id
    returning * into target_release;

  update public.visual_catalog_release_state
    set active_release_id = p_release_id, updated_at = activated_at
    where id = 'production';

  insert into public.visual_catalog_release_audit (
    id, release_id, action, actor_email, created_at, details
  ) values (
    gen_random_uuid(), p_release_id, p_action, p_actor_email, activated_at,
    jsonb_build_object(
      'previousReleaseId', previous_release_id,
      'changedDefinitionIds', target_release.changed_definition_ids,
      'definitionIds', next_definition_ids
    )
  );

  return next target_release;
end;
$$;

revoke all on function public.visual_catalog_definition_target_key(uuid)
  from public, anon, authenticated;
revoke all on function public.visual_catalog_apply_release_changes(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.visual_catalog_apply_release_changes(uuid, text, text)
  to service_role;
