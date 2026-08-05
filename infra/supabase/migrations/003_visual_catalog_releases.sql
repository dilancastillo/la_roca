alter table public.visual_definition_versions
  drop constraint if exists visual_definition_versions_status_check;

alter table public.visual_definition_versions
  add constraint visual_definition_versions_status_check
  check (status in ('draft', 'review', 'approved', 'published', 'archived'));

alter table public.visual_catalog_audit_events
  drop constraint if exists visual_catalog_audit_events_action_check;

alter table public.visual_catalog_audit_events
  add constraint visual_catalog_audit_events_action_check
  check (
    action in (
      'created',
      'updated',
      'submitted',
      'approved',
      'published',
      'archived',
      'cloned'
    )
  );

create table if not exists public.visual_catalog_releases (
  id uuid primary key,
  number integer not null unique check (number > 0),
  display_name text not null,
  notes text not null default '',
  status text not null check (
    status in ('candidate', 'review', 'approved', 'active', 'retired')
  ),
  definition_ids jsonb not null default '[]'::jsonb,
  changed_definition_ids jsonb not null default '[]'::jsonb,
  baseline_definition_ids jsonb not null default '[]'::jsonb,
  base_release_id uuid references public.visual_catalog_releases (id),
  checklist jsonb not null default '{}'::jsonb,
  created_by text not null,
  approved_by text,
  published_by text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  submitted_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz
);

create index if not exists visual_catalog_releases_status_idx
  on public.visual_catalog_releases (status, number desc);

create table if not exists public.visual_catalog_release_state (
  id text primary key,
  active_release_id uuid references public.visual_catalog_releases (id),
  updated_at timestamptz not null default now()
);

create table if not exists public.visual_catalog_release_scenarios (
  id uuid primary key,
  release_id uuid not null
    references public.visual_catalog_releases (id) on delete cascade,
  sale_order_line_id integer not null check (sale_order_line_id > 0),
  display_name text not null,
  selected_value_ids jsonb not null default '{}'::jsonb,
  custom_values_by_value_id jsonb not null default '{}'::jsonb,
  created_by text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (release_id, sale_order_line_id, display_name)
);

create index if not exists visual_catalog_release_scenarios_release_idx
  on public.visual_catalog_release_scenarios (release_id, updated_at desc);

create table if not exists public.visual_catalog_release_audit (
  id uuid primary key,
  release_id uuid not null
    references public.visual_catalog_releases (id) on delete cascade,
  action text not null check (
    action in (
      'created',
      'checklist_updated',
      'submitted',
      'approved',
      'published',
      'restored',
      'scenario_saved'
    )
  ),
  actor_email text not null,
  created_at timestamptz not null,
  details jsonb not null default '{}'::jsonb
);

create index if not exists visual_catalog_release_audit_release_idx
  on public.visual_catalog_release_audit (release_id, created_at desc);

create table if not exists public.visual_catalog_line_release_pins (
  sale_order_line_id integer primary key check (sale_order_line_id > 0),
  release_id uuid not null
    references public.visual_catalog_releases (id),
  created_at timestamptz not null
);

alter table public.visual_catalog_releases enable row level security;
alter table public.visual_catalog_release_state enable row level security;
alter table public.visual_catalog_release_scenarios enable row level security;
alter table public.visual_catalog_release_audit enable row level security;
alter table public.visual_catalog_line_release_pins enable row level security;
