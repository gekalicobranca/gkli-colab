import {
  AlertCircle,
  ArrowDownToLine,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Landmark,
  ReceiptText,
  WalletCards
} from "lucide-react";
import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { getColaboradorDashboard } from "@/lib/dashboard-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const moneyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

function statusClass(status: string) {
  if (status === "Pago" || status === "Importado") return "statusSuccess";
  if (status === "Em conferência" || status === "Processando") return "statusWarning";
  return "statusNeutral";
}

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { colaborador, pagamentos, recibos, source, hasColaborador, hasFlexLink } =
    await getColaboradorDashboard(user.id, user.email);

  if (!hasColaborador) {
    return (
      <main className="shell">
        <section className="emptyState">
          <p className="eyebrow">Acesso pendente</p>
          <h1>Cadastro não encontrado</h1>
          <p>Seu usuário entrou corretamente, mas ainda não existe acesso ativo no GKLI Core para o Colab.</p>
          <form action={signOut}>
            <button className="primaryButton" type="submit">
              Sair
            </button>
          </form>
        </section>
      </main>
    );
  }

  const proximoPagamento = pagamentos.find((pagamento) => pagamento.status !== "Pago");
  const totalRecebido = pagamentos
    .filter((pagamento) => pagamento.status === "Pago")
    .reduce((total, pagamento) => total + pagamento.valorLiquido, 0);
  const ultimoRecibo = recibos[0];

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Área do colaborador</p>
          <h1>{colaborador.nome}</h1>
          <p className="subtitle">
            Pagamentos, recibos e comprovantes mensais com identidade autorizada pelo GKLI Core.
          </p>
          <span className={source === "mock" ? "dataSource" : "dataSource live"}>
            {source === "core"
              ? hasFlexLink
                ? "Identidade Core + dados Flex"
                : "Identidade Core aguardando vínculo Flex"
              : source === "supabase"
                ? "Dados conectados ao Supabase"
                : "Exibindo dados de demonstração"}
          </span>
        </div>
        <div className="profileCard" aria-label="Dados do colaborador">
          <span className="avatar">{colaborador.iniciais}</span>
          <div>
            <strong>{colaborador.matriculaFlex}</strong>
            <span>{colaborador.cargo}</span>
          </div>
          <form action={signOut}>
            <button className="logoutButton" type="submit">
              Sair
            </button>
          </form>
        </div>
      </header>

      <section className="cardGrid" aria-label="Resumo">
        <article className="metricCard primary">
          <span className="iconBox">
            <WalletCards size={20} />
          </span>
          <div>
            <p>Recebido no ano</p>
            <strong>{moneyFormatter.format(totalRecebido)}</strong>
            <span>Base Flex atualizada hoje</span>
          </div>
        </article>

        <article className="metricCard">
          <span className="iconBox">
            <CalendarDays size={20} />
          </span>
          <div>
            <p>Próximo pagamento</p>
            <strong>{proximoPagamento?.competencia ?? "Sem pendências"}</strong>
            <span>{proximoPagamento ? moneyFormatter.format(proximoPagamento.valorLiquido) : "Tudo em dia"}</span>
          </div>
        </article>

        <article className="metricCard">
          <span className="iconBox">
            <ReceiptText size={20} />
          </span>
          <div>
            <p>Último recibo</p>
            <strong>{ultimoRecibo?.competencia ?? "Não disponível"}</strong>
            <span>{ultimoRecibo?.arquivo ?? "Aguardando recibos no Flex"}</span>
          </div>
        </article>
      </section>

      <section className="workspace">
        <div className="contentColumn">
          <section className="panel">
            <div className="sectionTitle">
              <div>
                <p className="eyebrow">Pagamentos Flex</p>
                <h2>Acompanhamento mensal</h2>
              </div>
              <button className="iconButton" type="button" aria-label="Baixar extrato">
                <ArrowDownToLine size={18} />
              </button>
            </div>

            <div className="paymentList">
              {pagamentos.length ? (
                pagamentos.map((pagamento) => (
                  <article className="paymentCard" key={pagamento.id}>
                    <div className="paymentMain">
                      <span className="monthBadge">{pagamento.competencia}</span>
                      <div>
                        <strong>{moneyFormatter.format(pagamento.valorLiquido)}</strong>
                        <p>{pagamento.descricao}</p>
                      </div>
                    </div>
                    <div className="paymentMeta">
                      <span className={statusClass(pagamento.status)}>{pagamento.status}</span>
                      <small>{pagamento.dataPrevista}</small>
                    </div>
                  </article>
                ))
              ) : (
                <article className="paymentCard emptyLine">
                  <div className="paymentMain">
                    <span className="monthBadge">Flex</span>
                    <div>
                      <strong>Nenhum pagamento disponível</strong>
                      <p>
                        {hasFlexLink
                          ? "Quando o Flex gerar pagamentos para este colaborador, eles aparecerão aqui."
                          : "O Core autorizou o acesso, mas ainda falta vincular este usuário ao colaborador no Flex."}
                      </p>
                    </div>
                  </div>
                </article>
              )}
            </div>
          </section>

          <section className="panel">
            <div className="sectionTitle">
              <div>
                <p className="eyebrow">Recibo mensal</p>
                <h2>Disponibilização pelo Flex</h2>
              </div>
              <span className={ultimoRecibo ? "statusSuccess" : "statusNeutral"}>
                {ultimoRecibo ? "Disponível" : "Aguardando"}
              </span>
            </div>

            <div className="uploadArea infoArea">
              <span className="uploadIcon">
                <ReceiptText size={26} />
              </span>
              <div>
                <strong>{ultimoRecibo ? ultimoRecibo.arquivo : "Recibos ficam no Flex"}</strong>
                <p>A importação mensal acontece no Flex. Esta área mostra apenas o recibo já vinculado ao colaborador.</p>
              </div>
              {ultimoRecibo?.downloadUrl ? (
                <a className="secondaryButton" href={ultimoRecibo.downloadUrl}>
                  Abrir recibo
                </a>
              ) : null}
            </div>
          </section>
        </div>

        <aside className="sideColumn" aria-label="Atalhos e recibos">
          <section className="panel actionPanel">
            <p className="eyebrow">Atalhos</p>
            <div className="actionGrid">
              <button type="button">
                <Landmark size={18} />
                Dados bancários
              </button>
              <button type="button">
                <BadgeCheck size={18} />
                Validar cadastro
              </button>
              <button type="button">
                <AlertCircle size={18} />
                Abrir chamado
              </button>
              <button type="button">
                <Clock3 size={18} />
                Histórico
              </button>
            </div>
          </section>

          <section className="panel">
            <div className="sectionTitle compact">
              <div>
                <p className="eyebrow">Arquivo</p>
                <h2>Recibos importados</h2>
              </div>
            </div>

            <div className="receiptList">
              {recibos.length ? (
                recibos.map((recibo) => (
                  <article key={recibo.id}>
                    <CheckCircle2 size={18} />
                    <div>
                      <strong>{recibo.competencia}</strong>
                      <span>{recibo.status}</span>
                    </div>
                    <a className="receiptLink" href={recibo.downloadUrl}>
                      Abrir
                    </a>
                  </article>
                ))
              ) : (
                <article>
                  <ReceiptText size={18} />
                  <div>
                    <strong>Nenhum recibo</strong>
                    <span>Sem tabela de recibos no Flex ainda</span>
                  </div>
                  <small>Flex</small>
                </article>
              )}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
