-- Configuración global independiente del historial de los componentes.
create table if not exists public.visual_catalog_settings (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null
);
alter table public.visual_catalog_settings enable row level security;
revoke all on public.visual_catalog_settings from anon, authenticated;
grant all on public.visual_catalog_settings to service_role;
