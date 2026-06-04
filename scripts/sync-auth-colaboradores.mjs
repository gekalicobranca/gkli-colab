import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const file = path.join(process.cwd(), ".env.local");
  const content = fs.readFileSync(file, "utf8");

  return content
    .split(/\r?\n/)
    .filter(Boolean)
    .reduce((acc, line) => {
      const index = line.indexOf("=");
      if (index > -1) acc[line.slice(0, index)] = line.slice(index + 1);
      return acc;
    }, {});
}

function nameFromEmail(email) {
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

async function main() {
  const env = loadEnv();
  const schema = env.GKLI_FLEX_SCHEMA || "gkli_flex";

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000
  });

  if (authError) throw authError;

  const users = (authData.users ?? []).filter((user) => user.email);
  if (!users.length) {
    console.log("Nenhum usuário Auth encontrado.");
    return;
  }

  const emails = users.map((user) => user.email);
  const { data: existing, error: existingError } = await supabase
    .schema(schema)
    .from("colaboradores")
    .select("id,email")
    .in("email", emails);

  if (existingError) throw existingError;

  const existingByEmail = new Map((existing ?? []).map((row) => [row.email, row]));
  const now = new Date().toISOString();

  const rows = users.map((user) => {
    const current = existingByEmail.get(user.email);

    return {
      id: current?.id ?? randomUUID(),
      nome: user.user_metadata?.nome || user.user_metadata?.name || nameFromEmail(user.email),
      email: user.email,
      auth_user_id: user.id,
      status: "ativo",
      updated_at: now,
      created_at: now
    };
  });

  const { data, error } = await supabase
    .schema(schema)
    .from("colaboradores")
    .upsert(rows, {
      onConflict: "email"
    })
    .select("id,nome,email,auth_user_id,status");

  if (error) throw error;

  console.log(JSON.stringify({ sincronizados: data.length, colaboradores: data }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
