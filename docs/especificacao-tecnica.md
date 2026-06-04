# Especificação técnica - GKLI Colaborador

## Stack

- Next.js 16
- React 19
- TypeScript
- Supabase Auth
- Supabase JS
- Supabase SSR
- Lucide React
- ESLint

## Estrutura principal

```text
app/
  auth/actions.ts
  login/page.tsx
  page.tsx
  recibos/[id]/route.ts
  layout.tsx
  globals.css
lib/
  dashboard-data.ts
  env.ts
  mock-data.ts
  types.ts
  supabase/admin.ts
  supabase/browser.ts
  supabase/server.ts
public/
  gkit-icon.png
scripts/
  sync-auth-colaboradores.mjs
supabase/
  flex-recibos.sql
  schema.sql
  sync-auth-colaboradores.sql
```

## Variáveis de ambiente

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
GKLI_FLEX_SCHEMA
```

`SUPABASE_SERVICE_ROLE_KEY` deve ser usada somente em código server-side.

## Autenticação

### Login

Arquivo:

```text
app/auth/actions.ts
```

O login usa:

```ts
supabase.auth.signInWithPassword({ email, password })
```

O logout usa:

```ts
supabase.auth.signOut()
```

### Sessão server-side

Arquivo:

```text
lib/supabase/server.ts
```

Usa `@supabase/ssr` com cookies do Next.

### Proxy de sessão

Arquivo:

```text
proxy.ts
```

Mantém a sessão atualizada para rotas server-rendered.

## Clientes Supabase

### Browser

Arquivo:

```text
lib/supabase/browser.ts
```

Usa a publishable key e deve ser usado apenas em componentes client-side.

### Server

Arquivo:

```text
lib/supabase/server.ts
```

Usa a sessão do usuário autenticado.

### Admin

Arquivo:

```text
lib/supabase/admin.ts
```

Usa `SUPABASE_SERVICE_ROLE_KEY`.

É usado para consultas server-side ao Flex e para rotas protegidas que precisam validar acesso.

## Camada de dados

Arquivo:

```text
lib/dashboard-data.ts
```

Função principal:

```ts
getColaboradorDashboard(authUserId: string)
```

Fluxo:

1. Busca colaborador ativo em `gkli_flex.colaboradores` por `auth_user_id`.
2. Busca `time_id` em `gkli_flex.times`.
3. Busca `perfil_id` em `gkli_flex.perfis`.
4. Busca pagamentos em `gkli_flex.pagamentos`.
5. Resolve competências em `gkli_flex.competencias`.
6. Busca recibos em `gkli_flex.recibos_pagamento`.
7. Retorna dados normalizados para a interface.

## Tabelas consumidas

### `gkli_flex.colaboradores`

Campos usados:

- `id`
- `nome`
- `email`
- `time_id`
- `perfil_id`
- `auth_user_id`
- `status`

Regra:

```text
auth_user_id = user.id
status = ativo
```

### `gkli_flex.pagamentos`

Campos usados:

- `id`
- `competencia_id`
- `colaborador_id`
- `descricao`
- `vencimento`
- `valor`
- `status`
- `paid_at`

Regra:

```text
colaborador_id = colaborador.id
```

### `gkli_flex.competencias`

Campos usados:

- `id`
- `referencia`
- `inicio`

### `gkli_flex.recibos_pagamento`

Criada em:

```text
supabase/flex-recibos.sql
```

Campos principais:

- `id`
- `competencia_id`
- `colaborador_id`
- `pagamento_id`
- `importacao_id`
- `arquivo_nome`
- `storage_bucket`
- `storage_path`
- `arquivo_url`
- `mime_type`
- `tamanho_bytes`
- `status`
- `assinado`
- `payload`
- `processed_at`
- `created_at`
- `updated_at`

Regra:

```text
colaborador_id = colaborador.id
```

## Rota de recibos

Arquivo:

```text
app/recibos/[id]/route.ts
```

Método:

```text
GET /recibos/[id]
```

Fluxo:

1. Obtém usuário autenticado.
2. Redireciona para `/login` se não houver sessão.
3. Busca colaborador ativo pelo `auth_user_id`.
4. Busca recibo pelo `id` e pelo `colaborador_id`.
5. Se houver `arquivo_url`, redireciona para a URL.
6. Se houver `storage_path`, cria signed URL no Supabase Storage.
7. Retorna erro se o recibo não existir ou não pertencer ao colaborador.

## Segurança

- A página principal exige sessão.
- O dashboard usa o `auth_user_id` da sessão para resolver o colaborador.
- O download de recibo valida propriedade do recibo antes de liberar URL.
- A chave `service_role` fica restrita ao servidor.
- `.env.local` está no `.gitignore`.

## Scripts

### Sincronizar colaboradores com Auth

```bash
npm run sync:colaboradores
```

Arquivo:

```text
scripts/sync-auth-colaboradores.mjs
```

O script:

- lista usuários do Supabase Auth;
- gera nome a partir do e-mail quando necessário;
- faz upsert em `gkli_flex.colaboradores` por e-mail;
- preenche `auth_user_id`;
- mantém colaboradores como `ativo`.

### SQL alternativo

```text
supabase/sync-auth-colaboradores.sql
```

## Assets

Ícone principal:

```text
public/gkit-icon.png
```

Usado em:

- metadata do app;
- favicon;
- ícone visual da tela de login.

## Comandos de validação

```bash
npm run lint
npm run build
```

Última validação conhecida:

- lint sem erros;
- build sem erros.

## Observações técnicas

- O portal não deve consultar nem exibir dados de demonstração para um colaborador real sem pagamentos.
- Dados mockados são fallback apenas para falha geral ou ambiente sem vínculo.
- Pagamentos e recibos antigos vinculados a colaboradores inativos não aparecem para colaboradores ativos.
- Recibos só ficam visíveis quando o Flex alimentar `gkli_flex.recibos_pagamento`.
