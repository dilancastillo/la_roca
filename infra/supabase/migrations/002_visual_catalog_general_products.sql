alter table public.visual_definition_versions
  add column if not exists layer text not null default 'component';

alter table public.visual_definition_versions
  drop constraint if exists visual_definition_versions_layer_check;

alter table public.visual_definition_versions
  add constraint visual_definition_versions_layer_check
  check (layer in ('structure', 'component', 'detail', 'accent'));

alter table public.visual_definition_versions
  add column if not exists activation_conditions jsonb not null default '[]'::jsonb;
