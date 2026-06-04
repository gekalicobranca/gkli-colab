-- Bridge inicial entre GKLI Colab e GKLI Core.
-- Mantém o acesso atual por Supabase Auth e adiciona referência opcional ao usuário central.

alter table colaborador_area.colaborador_vinculo
  add column if not exists core_usuario_id uuid,
  add column if not exists core_tipo_acesso_id uuid,
  add column if not exists core_synced_at timestamptz;

create index if not exists idx_colaborador_area_vinculo_core_usuario_id
  on colaborador_area.colaborador_vinculo(core_usuario_id);

create table if not exists colaborador_area.core_app_acessos (
  core_usuario_id uuid not null,
  email_acesso text not null,
  app_namespace text not null default 'gkli_colab',
  tipo_acesso text not null,
  status text not null default 'ativo',
  synced_at timestamptz not null default now(),
  primary key (core_usuario_id, app_namespace)
);

alter table colaborador_area.core_app_acessos enable row level security;
