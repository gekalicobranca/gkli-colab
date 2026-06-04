import "server-only";

import { coreBaseUrl } from "@/lib/env";

export type CoreColabUser = {
  id: string;
  nome: string;
  email: string;
  status: string;
  tipoAcesso: string;
  apps: string[];
  carteiras: string[];
  canOpenColab: boolean;
};

export type CoreColabRole = {
  id: string;
  nome: string;
  descricao: string;
  nivel: string;
  usuarios: number;
  permissions: string[];
};

export type CoreColabAccessPayload = {
  source: "gkli_core";
  app: {
    id: string;
    nome: string;
    namespace: "gkli_colab";
    status: string;
  };
  users: CoreColabUser[];
  roles: CoreColabRole[];
};

const localCoreAccessSnapshot: CoreColabAccessPayload = {
  source: "gkli_core",
  app: {
    id: "gkli_colab",
    nome: "GKLI Colab",
    namespace: "gkli_colab",
    status: "Ativo"
  },
  users: [
    {
      id: "usr_001",
      nome: "Mariana Lopes",
      email: "mariana.lopes@gkli.com.br",
      status: "Ativo",
      tipoAcesso: "Administrador",
      apps: ["COB", "Flex", "Core", "Colab"],
      carteiras: ["Administradora Modelo", "Condomínios RJ"],
      canOpenColab: true
    },
    {
      id: "usr_002",
      nome: "Rafael Nunes",
      email: "rafael.nunes@gkli.com.br",
      status: "Ativo",
      tipoAcesso: "Operação",
      apps: ["COB", "Core", "Colab"],
      carteiras: ["Condomínios SP"],
      canOpenColab: true
    }
  ],
  roles: [
    {
      id: "admin",
      nome: "Administrador",
      descricao: "Pode gerenciar usuários, apps, carteiras e permissões globais.",
      nivel: "Global",
      usuarios: 1,
      permissions: ["gkli_colab.admin"]
    },
    {
      id: "operacao",
      nome: "Operação",
      descricao: "Acesso operacional aos apps habilitados e às carteiras vinculadas.",
      nivel: "Carteira",
      usuarios: 1,
      permissions: ["gkli_colab.dashboard.read", "gkli_colab.recibos.read"]
    },
    {
      id: "financeiro",
      nome: "Financeiro",
      descricao: "Permite rotinas financeiras dentro dos apps autorizados.",
      nivel: "Carteira",
      usuarios: 0,
      permissions: ["gkli_colab.dashboard.read", "gkli_colab.pagamentos.read", "gkli_colab.recibos.read"]
    }
  ]
};

export async function getCoreColabAccess(): Promise<CoreColabAccessPayload> {
  if (!coreBaseUrl) {
    return localCoreAccessSnapshot;
  }

  try {
    const response = await fetch(`${coreBaseUrl}/api/gkli-core/colab-access`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return localCoreAccessSnapshot;
    }

    return (await response.json()) as CoreColabAccessPayload;
  } catch {
    return localCoreAccessSnapshot;
  }
}

export async function findCoreColabUserByEmail(email: string | undefined | null) {
  if (!email) return null;

  const access = await getCoreColabAccess();
  const normalizedEmail = email.trim().toLowerCase();
  const user = access.users.find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user || !user.canOpenColab || user.status !== "Ativo") {
    return null;
  }

  return {
    ...user,
    app: access.app,
    role: access.roles.find((role) => role.nome === user.tipoAcesso) ?? null
  };
}
