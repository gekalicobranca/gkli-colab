create table if not exists gkli_flex.recibos_pagamento (
  id uuid primary key default gen_random_uuid(),
  competencia_id uuid not null references gkli_flex.competencias(id),
  colaborador_id uuid not null references gkli_flex.colaboradores(id),
  pagamento_id uuid references gkli_flex.pagamentos(id),
  importacao_id uuid references gkli_flex.importacoes(id),
  arquivo_nome text not null,
  storage_bucket text not null default 'recibos-pagamento',
  storage_path text,
  arquivo_url text,
  mime_type text not null default 'application/pdf',
  tamanho_bytes bigint,
  status text not null default 'importado' check (
    status in ('importado', 'processando', 'disponivel', 'rejeitado')
  ),
  assinado boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recibos_pagamento_arquivo_check check (
    arquivo_url is not null or storage_path is not null
  )
);

create unique index if not exists recibos_pagamento_colaborador_competencia_idx
  on gkli_flex.recibos_pagamento (colaborador_id, competencia_id);

create index if not exists recibos_pagamento_pagamento_idx
  on gkli_flex.recibos_pagamento (pagamento_id);

create index if not exists recibos_pagamento_importacao_idx
  on gkli_flex.recibos_pagamento (importacao_id);

alter table gkli_flex.recibos_pagamento enable row level security;

-- A área do colaborador acessa recibos pela rota protegida do app.
-- O processamento/importação do PDF mensal continua pertencendo ao Flex.
