import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { flexSchema } from "@/lib/env";
import { colaborador as mockColaborador, pagamentos as mockPagamentos, recibos as mockRecibos } from "@/lib/mock-data";
import type { ColaboradorFlex, Pagamento, Recibo } from "@/lib/types";

type DashboardData = {
  colaborador: ColaboradorFlex;
  pagamentos: Pagamento[];
  recibos: Recibo[];
  source: "supabase" | "mock";
  hasColaborador: boolean;
};

type DbRecord = Record<string, unknown>;

function textValue(row: DbRecord | null | undefined, keys: string[], fallback = "") {
  if (!row) return fallback;

  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }

  return fallback;
}

function numberValue(row: DbRecord, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number") return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) return Number(value);
  }

  return 0;
}

function formatCompetencia(value: unknown, fallback?: unknown) {
  if (typeof value !== "string" || !value) return "Sem data";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback && typeof fallback === "string" ? fallback : value;

  const month = new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
  const year = String(date.getUTCFullYear()).slice(-2);

  return `${month.charAt(0).toUpperCase()}${month.slice(1)}/${year}`;
}

function formatDate(value: unknown) {
  if (typeof value !== "string" || !value) return "Sem previsao";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function mapPagamento(row: DbRecord, competenciaReferencia?: string): Pagamento {
  const rawStatus = textValue(row, ["status"], "pendente");
  const statusMap: Record<string, Pagamento["status"]> = {
    pago: "Pago",
    pago_confirmado: "Pago",
    realizado: "Pago",
    aprovado: "Em conferência",
    previsto: "Agendado",
    pendente: "Agendado",
    em_conferencia: "Em conferência",
    agendado: "Agendado",
    cancelado: "Agendado"
  };

  return {
    id: textValue(row, ["id"], crypto.randomUUID()),
    competencia: competenciaReferencia ?? formatCompetencia(row.vencimento),
    descricao: textValue(row, ["descricao"], textValue(row, ["tipo"], "Pagamento Flex")),
    valorLiquido: numberValue(row, ["valor"]),
    dataPrevista: formatDate(row.paid_at ?? row.vencimento),
    status: statusMap[rawStatus] ?? "Em conferência"
  };
}

function mapRecibo(row: DbRecord, competenciaReferencia?: string): Recibo {
  const status = textValue(row, ["status"], "importado");

  return {
    id: textValue(row, ["id"], crypto.randomUUID()),
    competencia: competenciaReferencia ?? formatCompetencia(row.created_at),
    arquivo: textValue(row, ["arquivo_nome"], "Recibo de pagamento"),
    status: status === "processando" ? "Processando" : "Importado",
    importadoEm: formatDate(row.created_at),
    downloadUrl: `/recibos/${textValue(row, ["id"])}`
  };
}

function mapColaborador(
  row: DbRecord | null,
  flexColaboradorId: string,
  time?: DbRecord | null,
  perfil?: DbRecord | null
): ColaboradorFlex {
  const nome = textValue(row, ["nome", "nome_completo", "name"], "Colaborador GKLI");
  const iniciais = nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return {
    idFlex: flexColaboradorId,
    nome,
    iniciais: iniciais || "GK",
    matriculaFlex: textValue(row, ["email", "id"], flexColaboradorId),
    cargo: textValue(perfil, ["nome"], "Colaborador"),
    unidade: textValue(time, ["nome"], "GKLI")
  };
}

async function loadFlexColaboradorByAuthUser(authUserId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .schema(flexSchema)
    .from("colaboradores")
    .select("*")
    .eq("auth_user_id", authUserId)
    .eq("status", "ativo")
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as DbRecord;
}

async function loadLookupById(table: "times" | "perfis", id: unknown) {
  if (typeof id !== "string" || !id) return null;

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.schema(flexSchema).from(table).select("*").eq("id", id).maybeSingle();

  if (error || !data) return null;
  return data as DbRecord;
}

async function loadCompetencias(references: unknown[]) {
  const ids = references.filter((id): id is string => typeof id === "string" && Boolean(id));
  if (!ids.length) return new Map<string, string>();

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.schema(flexSchema).from("competencias").select("id,referencia,inicio").in("id", ids);

  if (error || !data) return new Map<string, string>();

  return new Map(
    data.map((row) => [
      String(row.id),
      typeof row.referencia === "string" && row.referencia ? row.referencia : formatCompetencia(row.inicio)
    ])
  );
}

async function loadPagamentos(flexColaboradorId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .schema(flexSchema)
    .from("pagamentos")
    .select("*")
    .eq("colaborador_id", flexColaboradorId)
    .order("vencimento", { ascending: false })
    .limit(12);

  if (error || !data?.length) return null;

  const competencias = await loadCompetencias(data.map((row) => row.competencia_id));
  return data.map((row) => mapPagamento(row as DbRecord, competencias.get(String(row.competencia_id))));
}

async function loadRecibosFromFlex(flexColaboradorId: string) {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .schema(flexSchema)
    .from("recibos_pagamento")
    .select("*")
    .eq("colaborador_id", flexColaboradorId)
    .order("created_at", { ascending: false })
    .limit(12);

  if (error || !data?.length) return [];

  const competencias = await loadCompetencias(data.map((row) => row.competencia_id));
  return data.map((row) => mapRecibo(row as DbRecord, competencias.get(String(row.competencia_id))));
}

export async function getColaboradorDashboard(authUserId: string): Promise<DashboardData> {
  try {
    const flexColaborador = await loadFlexColaboradorByAuthUser(authUserId);
    if (!flexColaborador) {
      return {
        colaborador: mockColaborador,
        pagamentos: [],
        recibos: [],
        source: "mock",
        hasColaborador: false
      };
    }

    const flexColaboradorId = textValue(flexColaborador, ["id"]);
    const [time, perfil, pagamentos, recibos] = await Promise.all([
      loadLookupById("times", flexColaborador?.time_id),
      loadLookupById("perfis", flexColaborador?.perfil_id),
      loadPagamentos(flexColaboradorId),
      loadRecibosFromFlex(flexColaboradorId)
    ]);

    return {
      colaborador: mapColaborador(flexColaborador, flexColaboradorId, time, perfil),
      pagamentos: pagamentos ?? [],
      recibos,
      source: "supabase",
      hasColaborador: true
    };
  } catch {
    return {
      colaborador: mockColaborador,
      pagamentos: mockPagamentos,
      recibos: mockRecibos,
      source: "mock",
      hasColaborador: false
    };
  }
}
