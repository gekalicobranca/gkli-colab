# Recibo de pagamento mensal

Arquivo analisado: `Recibo de Pagamento_Empregados.pdf`

## Formato observado

- PDF com 4 páginas.
- Cada página representa 1 colaborador.
- Cada página contém 2 vias do mesmo recibo, por isso os valores aparecem duplicados.
- Competência do arquivo: Abril de 2026.
- Empresa: GEKALI COBRANCA LTDA.
- CNPJ: 53.477.547/0001-49.

## Colaboradores encontrados

| Código | Nome | Cargo | Líquido | Vencimentos | Descontos |
| --- | --- | --- | ---: | ---: | ---: |
| 9 | CAMILA MOTA PAGANINI | ASSISTENTE ADMINISTRATIVO | 1.558,00 | 1.804,85 | 246,85 |
| 7 | EDIVANIA NEVES SOUZA | GERENTE DE COBRANCA | 2.047,00 | 2.909,18 | 862,18 |
| 3 | ESTEFANIA MOTA PAGANINI | AUXILIAR ADMINISTRATIVO | 1.979,00 | 2.300,15 | 321,15 |
| 10 | MARIA DANIELLE SOUSA LIMA | ANALISTA DE COBRANCA | 1.625,00 | 1.872,02 | 247,02 |

## Campos importantes para importação

- `codigo`: código do colaborador no recibo/Flex.
- `nome`: nome do colaborador.
- `competencia`: mês e ano da folha.
- `cargo`: cargo exibido no recibo.
- `salario_base`.
- `salario_contribuicao_inss`.
- `base_fgts`.
- `base_irrf`.
- `fgts_mes`.
- `total_vencimentos`.
- `total_descontos`.
- `valor_liquido`.
- `eventos`: linhas de vencimentos e descontos, como dias normais, INSS, vale transporte e troco.

## Decisão de arquitetura

Este arquivo deve ser tratado no Flex, não na área do colaborador.

Motivo:

- O recibo/pagamento é dado de folha.
- O PDF mensal é uma importação em lote, com recibos de vários colaboradores.
- A separação por colaborador, validação de competência e conciliação com folha devem acontecer no Flex.
- A área do colaborador deve apenas consultar e exibir o recibo/pagamento já processado pelo Flex.

Fluxo correto:

1. Flex importa o PDF mensal de recibos.
2. Flex separa os recibos por `codigo`/colaborador.
3. Flex grava pagamentos, recibos e metadados.
4. Área do colaborador consulta o schema `gkli_flex` e mostra apenas os dados do colaborador logado.
