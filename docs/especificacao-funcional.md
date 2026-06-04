# Especificação funcional - GKLI Colaborador

## Objetivo

O GKLI Colaborador é a área autenticada para colaboradores acompanharem pagamentos e recibos mensais disponibilizados pelo Flex.

O portal não processa folha, não importa recibos em lote e não altera pagamentos. Ele apenas consulta dados já tratados no Flex e apresenta essas informações de forma simples, segura e responsiva.

## Público

- Colaboradores com usuário ativo no Supabase Auth.
- Colaboradores vinculados ao cadastro `gkli_flex.colaboradores`.

## Escopo atual

### Login

- O colaborador acessa `/login`.
- O login usa Supabase Auth com e-mail e senha.
- Usuários já autenticados são redirecionados para `/`.
- Usuários sem sessão são redirecionados de `/` para `/login`.
- A tela de login usa o ícone oficial em `public/gkit-icon.png`.

### Vínculo com colaborador

Após o login, o portal busca o colaborador em:

```text
gkli_flex.colaboradores.auth_user_id = auth.users.id
```

Somente colaboradores com `status = ativo` acessam o dashboard.

Se o usuário autenticar corretamente, mas não existir colaborador ativo vinculado, o portal mostra a tela de acesso pendente.

### Dashboard

O dashboard mostra:

- nome do colaborador;
- e-mail/matrícula exibida no card de perfil;
- perfil/cargo quando existir em `gkli_flex.perfis`;
- time/unidade quando existir em `gkli_flex.times`;
- total recebido no ano;
- próximo pagamento;
- último recibo;
- lista de pagamentos;
- atalhos operacionais;
- lista de recibos disponíveis.

### Pagamentos

Os pagamentos são lidos de:

```text
gkli_flex.pagamentos
```

Filtro principal:

```text
pagamentos.colaborador_id = colaboradores.id
```

A competência é resolvida em:

```text
gkli_flex.competencias
```

Status exibidos:

- `pago`, `pago_confirmado`, `realizado` -> `Pago`;
- `aprovado`, `em_conferencia` -> `Em conferência`;
- `previsto`, `pendente`, `agendado`, `cancelado` -> `Agendado`.

Quando o colaborador ativo não possui pagamentos, o portal mostra um estado vazio. Ele não exibe dados de demonstração para colaboradores reais.

### Recibos

Os recibos são lidos de:

```text
gkli_flex.recibos_pagamento
```

Filtro principal:

```text
recibos_pagamento.colaborador_id = colaboradores.id
```

Quando houver recibo disponível, o portal mostra o botão `Abrir recibo`.

O acesso ao arquivo passa pela rota protegida:

```text
/recibos/[id]
```

Essa rota valida:

- se existe usuário autenticado;
- se o usuário autenticado tem colaborador ativo;
- se o recibo pertence ao colaborador autenticado.

Se o recibo usa `arquivo_url`, o portal redireciona para essa URL. Se usa Supabase Storage, o portal gera URL assinada temporária.

### Atalhos

Atalhos exibidos atualmente:

- Dados bancários;
- Validar cadastro;
- Abrir chamado;
- Histórico.

Nesta versão, os atalhos são elementos visuais e ainda não possuem fluxo próprio.

## Fora do escopo

- Importação do PDF mensal de folha.
- Separação de recibos por colaborador.
- Cálculo de pagamentos, pró-labore ou comissões.
- Aprovação financeira.
- Edição de cadastro do colaborador.
- Assinatura digital de recibo.
- Upload de recibo pelo colaborador.

Esses fluxos pertencem ao Flex.

## Responsividade e UI/UX

- Interface sem menu lateral.
- Navegação principal por cards e painéis.
- Layout em coluna única no mobile.
- Tipografia discreta, sem títulos grandes demais.
- Pesos de fonte moderados.
- Visual limpo e profissional.
- Cards com bordas leves e sombras suaves.
- Sem elementos decorativos excessivos.

## Estado atual dos dados

Colaboradores ativos sincronizados com Auth:

- Camila Paganini;
- Danielle Lima;
- Edi Neves;
- Fanny Paganini;
- Julio Baia.

Cadastro antigo:

- Marina Gekali está inativa e sem `auth_user_id`.

Pagamentos antigos ainda estão vinculados ao cadastro inativo da Marina e não aparecem para os colaboradores ativos.

## Critérios de aceite

- Usuário sem sessão é redirecionado para `/login`.
- Usuário autenticado sem colaborador ativo vê acesso pendente.
- Usuário autenticado com colaborador ativo vê o dashboard.
- Colaborador só vê pagamentos vinculados ao próprio `colaborador_id`.
- Colaborador só abre recibos vinculados ao próprio `colaborador_id`.
- Colaborador real sem pagamentos vê estado vazio.
- Build e lint passam sem erro.
