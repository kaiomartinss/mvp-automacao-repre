import { createClient } from "@/lib/supabase/server"
import { AddClientFab } from "@/components/AddClientFab"
import { LineChartClient } from "@/components/LineChartClient"
import { HeatmapClient } from "@/components/HeatmapClient"
import { ClientSearchTable } from "@/components/ClientSearchTable"
import { MotionSection } from "@/components/ui/MotionSection"

export const revalidate = 0

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)
}

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Preparar queries para execução em paralelo
  let inactiveClientsQuery = supabase
    .from("v_inactive_clients")
    .select("*")

  let allInactiveQuery = supabase
    .from("v_inactive_clients")
    .select("last_visit")

  let totalBaseQuery = supabase
    .from("clients")
    .select("*", { count: "exact", head: true })

  if (user) {
    inactiveClientsQuery = inactiveClientsQuery.or(`user_id.eq.${user.id},user_id.is.null`)
    allInactiveQuery = allInactiveQuery.or(`user_id.eq.${user.id},user_id.is.null`)
    totalBaseQuery = totalBaseQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  const [
    inactiveRes,
    allInactiveRes,
    totalBaseRes,
    metricsRes,
    logsRes,
  ] = await Promise.all([
    inactiveClientsQuery.limit(10),
    allInactiveQuery,
    totalBaseQuery,
    supabase.from("v_winback_metrics").select("*").limit(1).single(),
    supabase
      .from("reactivation_logs")
      .select("sent_at")
      .gte("sent_at", new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  let inactiveClients = inactiveRes.data
  const inativosError = inactiveRes.error
  let allInactive = allInactiveRes.data
  const allInactiveError = allInactiveRes.error
  let totalBaseCount = totalBaseRes.count
  const baseCountErr = totalBaseRes.error
  const metrics = metricsRes.data
  const logsData = logsRes.data

  // Fallbacks paralelos caso a view/tabela não tenha user_id
  const fallbacks: Promise<void>[] = []
  if (!inactiveClients && inativosError?.message?.includes("user_id")) {
    fallbacks.push(
      Promise.resolve(supabase.from("v_inactive_clients").select("*").limit(10)).then((r) => {
        inactiveClients = r.data
      })
    )
  }
  if (!allInactive && allInactiveError?.message?.includes("user_id")) {
    fallbacks.push(
      Promise.resolve(supabase.from("v_inactive_clients").select("last_visit")).then((r) => {
        allInactive = r.data
      })
    )
  }
  if (totalBaseCount === null && baseCountErr?.message?.includes("user_id")) {
    fallbacks.push(
      Promise.resolve(supabase.from("clients").select("*", { count: "exact", head: true })).then((r) => {
        totalBaseCount = r.count
      })
    )
  }
  if (fallbacks.length > 0) {
    await Promise.all(fallbacks)
  }

  const totalInativos = allInactive?.length || 0
  const inativos30d =
    allInactive?.filter((c) => {
      const diff = (new Date().getTime() - new Date(c.last_visit).getTime()) / (1000 * 3600 * 24)
      return diff >= 30 && diff < 90
    }).length || 0

  const inativos90d =
    allInactive?.filter((c) => {
      const diff = (new Date().getTime() - new Date(c.last_visit).getTime()) / (1000 * 3600 * 24)
      return diff >= 90
    }).length || 0

  const totalBase = totalBaseCount || 0

  // Sempre gerar os últimos 7 dias reais (sem dados fictícios)
  const lineChartData: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split("T")[0]
    const count = (logsData || []).filter((l: { sent_at?: string | null }) =>
      l.sent_at?.startsWith(dateStr)
    ).length
    lineChartData.push({
      date: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`,
      count,
    })
  }

  const disparos7d = lineChartData.reduce((acc, item) => acc + item.count, 0)

  const m = metrics || {
    total_disparos: 0,
    taxa_resposta: 0,
    taxa_conversao: 0,
    receita_resgatada: 0,
  }

  const activeBase = Math.max(0, totalBase - totalInativos)
  const baseSaudavel = totalBase > 0 ? (activeBase / totalBase) * 100 : 0
  const pctAlerta = totalBase > 0 ? (inativos30d / totalBase) * 100 : 0
  const pctFrios = totalBase > 0 ? (inativos90d / totalBase) * 100 : 0
  const potencialEstimado = (m.receita_resgatada / (m.total_disparos || 1)) * totalInativos

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-[100dvh] space-y-6">
      {/* Cabeçalho */}
      <MotionSection delay={0}>
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#F4F4F5] leading-tight">
              Painel de Recuperação
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Acompanhe clientes sem recompra e conduza abordagens diretas no WhatsApp.
            </p>
          </div>
          <AddClientFab />
        </header>
      </MotionSection>

      {/* Faixa Unificada de Indicadores (Hairline Grid, zero card-soup) */}
      <MotionSection delay={0.04}>
        <section
          aria-label="Indicadores principais"
          className="rounded-xl border border-white/[0.08] bg-[#111215] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]"
        >
          <div className="p-5 flex flex-col justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              Base Total
            </span>
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight text-[#F4F4F5] tabular-nums">
                {totalBase}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
                <span className="text-[#00E676]">{baseSaudavel.toFixed(1)}%</span> comprando regularmente
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              Clientes Inativos
            </span>
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight text-[#F4F4F5] tabular-nums">
                {totalInativos}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
                {inativos30d} alerta · <span className="text-red-400">{inativos90d} críticos</span>
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              Disparos Realizados
            </span>
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight text-[#F4F4F5] tabular-nums">
                {m.total_disparos}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 font-mono tabular-nums">
                Retorno histórico de {m.taxa_conversao}%
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
              Potencial em Aberto
            </span>
            <div>
              <div className="font-mono text-3xl font-semibold tracking-tight text-[#F4F4F5] tabular-nums">
                {formatBRL(potencialEstimado)}
              </div>
              <p className="mt-1.5 text-xs text-zinc-400">
                Estimativa sobre a fila inativa atual
              </p>
            </div>
          </div>
        </section>
      </MotionSection>

      {/* Bento Analítico Assimétrico (7 / 5) */}
      <MotionSection delay={0.08}>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Ritmo 7 dias */}
          <div className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-[#111215] p-5 md:p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-sm font-medium text-[#F4F4F5]">
                  Ritmo de disparos
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Volume diário enviado nos últimos 7 dias
                </p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xl font-semibold text-[#F4F4F5] tabular-nums">
                  {disparos7d}
                </span>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                  Últimos 7d
                </p>
              </div>
            </div>

            <div className="flex-1 min-h-[235px]">
              <LineChartClient data={lineChartData} />
            </div>
          </div>

          {/* Saúde da Carteira + Atividade 120d */}
          <div className="lg:col-span-5 rounded-xl border border-white/[0.08] bg-[#111215] flex flex-col divide-y divide-white/[0.08]">
            {/* Composição proporcional */}
            <div className="p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#F4F4F5]">
                  Composição da carteira
                </h2>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">
                  {totalBase} total
                </span>
              </div>

              {/* Barra proporcional limpa de 6px */}
              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05] gap-[2px]">
                {baseSaudavel > 0 && (
                  <div
                    style={{ width: `${baseSaudavel}%` }}
                    className="h-full bg-[#00E676] rounded-l-full"
                    title={`Ativos: ${activeBase}`}
                  />
                )}
                {pctAlerta > 0 && (
                  <div
                    style={{ width: `${pctAlerta}%` }}
                    className="h-full bg-amber-400"
                    title={`Alerta 30-90d: ${inativos30d}`}
                  />
                )}
                {pctFrios > 0 && (
                  <div
                    style={{ width: `${pctFrios}%` }}
                    className="h-full bg-red-400 rounded-r-full"
                    title={`Críticos +90d: ${inativos90d}`}
                  />
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                    Ativos
                  </div>
                  <div className="mt-1 font-mono text-base font-medium text-[#F4F4F5] tabular-nums">
                    {activeBase}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    30-90d
                  </div>
                  <div className="mt-1 font-mono text-base font-medium text-[#F4F4F5] tabular-nums">
                    {inativos30d}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    +90d
                  </div>
                  <div className="mt-1 font-mono text-base font-medium text-[#F4F4F5] tabular-nums">
                    {inativos90d}
                  </div>
                </div>
              </div>
            </div>

            {/* Heatmap 120d */}
            <div className="p-5 md:p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-zinc-300">
                  Consistência de envios
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
                  17 semanas
                </span>
              </div>
              <HeatmapClient logsData={logsData || []} />
            </div>
          </div>
        </section>
      </MotionSection>

      {/* Fila Prioritária de Reativação */}
      <MotionSection delay={0.12}>
        <section className="rounded-xl border border-white/[0.08] bg-[#111215] overflow-hidden">
          <ClientSearchTable initialClients={inactiveClients || []} />
        </section>
      </MotionSection>
    </div>
  )
}
