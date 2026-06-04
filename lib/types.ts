export type ColaboradorFlex = {
  idFlex: string;
  nome: string;
  iniciais: string;
  matriculaFlex: string;
  cargo: string;
  unidade: string;
};

export type Pagamento = {
  id: string;
  competencia: string;
  descricao: string;
  valorLiquido: number;
  dataPrevista: string;
  status: "Pago" | "Em conferência" | "Agendado";
};

export type Recibo = {
  id: string;
  competencia: string;
  arquivo: string;
  status: "Importado" | "Processando";
  importadoEm: string;
  downloadUrl?: string;
};
