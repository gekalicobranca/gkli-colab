export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const flexSchema = process.env.GKLI_FLEX_SCHEMA ?? "gkli_flex";
export const defaultFlexColaboradorId = process.env.GKLI_DEFAULT_FLEX_COLABORADOR_ID;

export function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}
