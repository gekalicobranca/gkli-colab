import type { ColaboradorFlex, Pagamento, Recibo } from "./types";

export const colaborador: ColaboradorFlex = {
  idFlex: "flex_colab_10293",
  nome: "Mariana Alves",
  iniciais: "MA",
  matriculaFlex: "FLEX-10293",
  cargo: "Assistente Operacional",
  unidade: "GKLI São Paulo"
};

export const pagamentos: Pagamento[] = [
  {
    id: "pgto_2026_05",
    competencia: "Mai/26",
    descricao: "Pagamento mensal importado do Flex",
    valorLiquido: 4820.5,
    dataPrevista: "05/06/2026",
    status: "Em conferência"
  },
  {
    id: "pgto_2026_04",
    competencia: "Abr/26",
    descricao: "Pagamento mensal importado do Flex",
    valorLiquido: 4820.5,
    dataPrevista: "05/05/2026",
    status: "Pago"
  },
  {
    id: "pgto_2026_03",
    competencia: "Mar/26",
    descricao: "Pagamento mensal importado do Flex",
    valorLiquido: 4698.1,
    dataPrevista: "05/04/2026",
    status: "Pago"
  },
  {
    id: "pgto_2026_06",
    competencia: "Jun/26",
    descricao: "Previsão aberta pelo fechamento do Flex",
    valorLiquido: 4820.5,
    dataPrevista: "05/07/2026",
    status: "Agendado"
  }
];

export const recibos: Recibo[] = [
  {
    id: "rec_2026_04",
    competencia: "Abr/26",
    arquivo: "recibo_abril_2026.pdf",
    status: "Importado",
    importadoEm: "07/05/2026"
  },
  {
    id: "rec_2026_03",
    competencia: "Mar/26",
    arquivo: "recibo_marco_2026.pdf",
    status: "Importado",
    importadoEm: "06/04/2026"
  },
  {
    id: "rec_2026_02",
    competencia: "Fev/26",
    arquivo: "recibo_fevereiro_2026.pdf",
    status: "Importado",
    importadoEm: "06/03/2026"
  }
];
