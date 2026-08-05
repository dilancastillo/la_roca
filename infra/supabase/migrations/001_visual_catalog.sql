create table if not exists public.visual_definition_versions (
  id uuid primary key,
  series_id uuid not null,
  version integer not null default 0 check (version >= 0),
  display_name text not null,
  slot text not null check (slot in ('neck', 'lower_pocket', 'boot')),
  layer text not null default 'component' check (
    layer in ('structure', 'component', 'detail', 'accent')
  ),
  status text not null check (
    status in ('draft', 'review', 'published', 'archived')
  ),
  binding jsonb not null,
  activation_conditions jsonb not null default '[]'::jsonb,
  selected_element_ids jsonb not null default '[]'::jsonb,
  element_paints jsonb not null default '{}'::jsonb,
  placement jsonb not null,
  reference_asset_src text not null,
  original_asset_key text not null,
  normalized_asset_key text not null,
  runtime_asset_key text not null,
  created_by text not null,
  approved_by text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  submitted_at timestamptz,
  published_at timestamptz
);

create index if not exists visual_definition_versions_series_idx
  on public.visual_definition_versions (series_id, version desc);

create index if not exists visual_definition_versions_status_idx
  on public.visual_definition_versions (status, slot);

create index if not exists visual_definition_versions_binding_idx
  on public.visual_definition_versions using gin (binding);

create table if not exists public.visual_catalog_audit_events (
  id uuid primary key,
  definition_id uuid not null
    references public.visual_definition_versions (id) on delete cascade,
  action text not null check (
    action in ('created', 'updated', 'submitted', 'published', 'archived', 'cloned')
  ),
  actor_email text not null,
  created_at timestamptz not null,
  details jsonb not null default '{}'::jsonb
);

create index if not exists visual_catalog_audit_definition_idx
  on public.visual_catalog_audit_events (definition_id, created_at desc);

alter table public.visual_definition_versions enable row level security;
alter table public.visual_catalog_audit_events enable row level security;

insert into storage.buckets (id, name, public)
values ('visual-catalog', 'visual-catalog', false)
on conflict (id) do nothing;
