create unique index if not exists visual_definition_versions_series_version_idx
  on public.visual_definition_versions (series_id, version)
  where version > 0;

create unique index if not exists visual_catalog_single_active_release_idx
  on public.visual_catalog_releases (status)
  where status = 'active';

insert into public.visual_catalog_release_state (
  id,
  active_release_id,
  updated_at
)
values ('production', null, now())
on conflict (id) do nothing;

create sequence if not exists public.visual_catalog_release_number_seq;

do $$
declare
  current_max bigint;
begin
  select coalesce(max(number), 0)
    into current_max
    from public.visual_catalog_releases;

  if current_max = 0 then
    perform setval(
      'public.visual_catalog_release_number_seq'::regclass,
      1,
      false
    );
  else
    perform setval(
      'public.visual_catalog_release_number_seq'::regclass,
      current_max,
      true
    );
  end if;
end;
$$;

create or replace function public.visual_catalog_next_release_number()
returns bigint
language sql
security definer
set search_path = public
as $$
  select nextval('public.visual_catalog_release_number_seq'::regclass);
$$;

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

  insert into public.visual_catalog_release_state (
    id,
    active_release_id,
    updated_at
  )
  values ('production', null, activated_at)
  on conflict (id) do nothing;

  select active_release_id
    into previous_release_id
    from public.visual_catalog_release_state
    where id = 'production'
    for update;

  select *
    into target_release
    from public.visual_catalog_releases
    where id = p_release_id
    for update;

  if not found then
    raise exception 'La release visual no existe.';
  end if;

  if p_action = 'published' and target_release.status <> 'approved' then
    raise exception 'La release debe estar aprobada antes de publicarse.';
  end if;

  if p_action = 'restored' and target_release.status <> 'retired' then
    raise exception 'Solo una release retirada se puede restaurar.';
  end if;

  if previous_release_id is not null
     and previous_release_id <> p_release_id then
    update public.visual_catalog_releases
      set status = 'retired',
          updated_at = activated_at
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
    set active_release_id = p_release_id,
        updated_at = activated_at
    where id = 'production';

  insert into public.visual_catalog_release_audit (
    id,
    release_id,
    action,
    actor_email,
    created_at,
    details
  )
  values (
    gen_random_uuid(),
    p_release_id,
    p_action,
    p_actor_email,
    activated_at,
    jsonb_build_object('previousReleaseId', previous_release_id)
  );

  return next target_release;
end;
$$;

revoke all on function public.visual_catalog_next_release_number()
  from public, anon, authenticated;
revoke all on function public.visual_catalog_activate_release(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.visual_catalog_next_release_number()
  to service_role;
grant execute on function public.visual_catalog_activate_release(uuid, text, text)
  to service_role;

update storage.buckets
  set public = false,
      file_size_limit = 800000,
      allowed_mime_types = array['image/svg+xml']
  where id = 'visual-catalog';
