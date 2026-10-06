-- A repeated restore request can arrive after the first transaction already
-- made the release active. Treat that exact retry as successful, while still
-- rejecting attempts to restore any unrelated non-retired release.
create or replace function public.visual_catalog_activate_release(
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
  previous_release_id uuid;
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

  if previous_release_id is not null and previous_release_id <> p_release_id then
    update public.visual_catalog_releases
      set status = 'retired', updated_at = activated_at
      where id = previous_release_id;
  end if;

  update public.visual_catalog_releases
    set status = 'active',
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
    jsonb_build_object('previousReleaseId', previous_release_id)
  );

  return next target_release;
end;
$$;

revoke all on function public.visual_catalog_activate_release(uuid, text, text)
  from public, anon, authenticated;
grant execute on function public.visual_catalog_activate_release(uuid, text, text)
  to service_role;
