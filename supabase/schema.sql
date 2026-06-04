create schema if not exists colaborador_area;

create table if not exists colaborador_area.colaborador_vinculo (
  id uuid primary key default gen_random_uuid(),
  flex_colaborador_id text not null unique,
  email_acesso text not null unique,
  status text not null default 'ativo' check (status in ('ativo', 'bloqueado', 'inativo')),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists colaborador_area.preferencia_colaborador (
  id uuid primary key default gen_random_uuid(),
  flex_colaborador_id text not null unique,
  notificar_pagamento boolean not null default true,
  notificar_recibo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table colaborador_area.colaborador_vinculo enable row level security;
alter table colaborador_area.preferencia_colaborador enable row level security;

-- O cadastro oficial, pagamentos e recibos ficam no Flex.
-- Este schema guarda apenas o vínculo de acesso e preferências da área do colaborador.
