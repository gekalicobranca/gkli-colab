# GKLI Colaborador

Área do colaborador para acompanhar pagamentos sincronizados do Flex e recibos mensais disponibilizados pela folha.

## Documentação

- [Especificação funcional](docs/especificacao-funcional.md)
- [Especificação técnica](docs/especificacao-tecnica.md)
- [Análise do recibo de pagamento](docs/recibo-pagamento.md)

## Primeira versão

- Interface sem menu lateral, organizada por cards para mobile e desktop.
- Tela inicial com resumo do colaborador, pagamentos e recibos disponíveis.
- Login com Supabase Auth.
- Vínculo do usuário logado com `gkli_flex.colaboradores.auth_user_id`.
- Pagamentos consultados no schema do Flex.
- Recibos consultados em `gkli_flex.recibos_pagamento`.
- Download de recibo por rota protegida.
- Ícone do app em `public/gkit-icon.png`.

## Rodar localmente

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000`.

## Ambiente

Copie `.env.example` para `.env.local` e preencha as chaves do Supabase.

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GKLI_FLEX_SCHEMA=gkli_flex
```

`SUPABASE_SERVICE_ROLE_KEY` deve ficar somente no servidor.

## Validação

```bash
npm run lint
npm run build
```

## Integracao com GKLI Core

O Colab consulta `GET /api/gkli-core/colab-access` usando `GKLI_CORE_BASE_URL`.
O Core autoriza a entrada no app `gkli_colab`; pagamentos e recibos continuam
vindo do schema do Flex.
