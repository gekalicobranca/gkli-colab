import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { flexSchema } from "@/lib/env";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const sessionClient = await createServerSupabaseClient();
  const {
    data: { user }
  } = await sessionClient.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const adminClient = createAdminSupabaseClient();
  const { data: colaborador, error: colaboradorError } = await adminClient
    .schema(flexSchema)
    .from("colaboradores")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("status", "ativo")
    .maybeSingle();

  if (colaboradorError || !colaborador) {
    return NextResponse.json({ error: "Colaborador não encontrado." }, { status: 403 });
  }

  const { data: recibo, error: reciboError } = await adminClient
    .schema(flexSchema)
    .from("recibos_pagamento")
    .select("id,colaborador_id,arquivo_url,storage_bucket,storage_path")
    .eq("id", id)
    .eq("colaborador_id", colaborador.id)
    .maybeSingle();

  if (reciboError || !recibo) {
    return NextResponse.json({ error: "Recibo não encontrado." }, { status: 404 });
  }

  if (typeof recibo.arquivo_url === "string" && recibo.arquivo_url) {
    redirect(recibo.arquivo_url);
  }

  if (typeof recibo.storage_path !== "string" || !recibo.storage_path) {
    return NextResponse.json({ error: "Arquivo do recibo não disponível." }, { status: 404 });
  }

  const bucket = typeof recibo.storage_bucket === "string" && recibo.storage_bucket ? recibo.storage_bucket : "recibos-pagamento";
  const { data: signedUrl, error: signedUrlError } = await adminClient.storage
    .from(bucket)
    .createSignedUrl(recibo.storage_path, 60);

  if (signedUrlError || !signedUrl?.signedUrl) {
    return NextResponse.json({ error: "Não foi possível gerar o link do recibo." }, { status: 500 });
  }

  redirect(signedUrl.signedUrl);
}
