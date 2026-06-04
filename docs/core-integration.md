# Integração GKLI Core -> Colab

O Colab agora consulta o GKLI Core como fonte de identidade e permissão de entrada.

## Contrato

- Core expõe `GET /api/gkli-core/colab-access`.
- Colab consome essa rota via `GKLI_CORE_BASE_URL`.
- Se o Core autorizar o usuário pelo e-mail, a área do colaborador abre mesmo que o vínculo operacional com o Flex ainda esteja pendente.
- Pagamentos e recibos continuam vindo do schema `gkli_flex`.

## Pontos alterados no Colab

- `lib/core-access.ts`: adaptador do contrato do Core.
- `lib/dashboard-data.ts`: usa identidade Core como primeira camada e Flex como origem operacional.
- `app/page.tsx`: mostra status "Identidade Core + dados Flex" ou "Identidade Core aguardando vínculo Flex".
- `supabase/core-bridge.sql`: ponte não destrutiva para persistir referência ao usuário do Core.

## Limite desta etapa

O Core ainda usa dados mockados. A próxima etapa é persistir `gkli_core.usuarios`, `usuario_apps` e permissões reais, depois sincronizar `colaborador_area.colaborador_vinculo.core_usuario_id`.
