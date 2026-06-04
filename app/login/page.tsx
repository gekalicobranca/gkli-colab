import Image from "next/image";
import { redirect } from "next/navigation";
import { signIn } from "@/app/auth/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="loginShell">
      <section className="loginPanel" aria-label="Acesso do colaborador">
        <div className="loginBrand">
          <span className="loginLogo">
            <Image src="/gkit-icon.png" alt="" width={52} height={52} priority />
          </span>
          <div>
            <p className="eyebrow">GKLI Colaborador</p>
            <h1>Acesse seus pagamentos</h1>
          </div>
        </div>

        <form className="loginForm" action={signIn}>
          <label>
            E-mail
            <input name="email" type="email" autoComplete="email" required />
          </label>

          <label>
            Senha
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          {error ? <p className="formError">{error}</p> : null}

          <button className="primaryButton" type="submit">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
