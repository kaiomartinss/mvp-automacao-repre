import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { AddClientFab } from "@/components/AddClientFab"
import { LineChartClient } from "@/components/LineChartClient"
import { HeatmapClient } from "@/components/HeatmapClient"
import { ClientSearchTable } from "@/components/ClientSearchTable"
import { BellRinging } from "@phosphor-icons/react/dist/ssr"

export const revalidate = 0

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Preparar queries para execução em paralelo
  let inactiveClientsQuery = supabase
    .from('v_inactive_clients')
    .select('*')

  let allInactiveQuery = supabase
    .from('v_inactive_clients')
    .select('last_visit')

  let totalBaseQuery = supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

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
    supabase.from('v_winback_metrics').select('*').limit(1).single(),
    supabase
      .from('reactivation_logs')
      .select('sent_at')
      .gte('sent_at', new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()),
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
  if (!inactiveClients && inativosError?.message?.includes('user_id')) {
    fallbacks.push(
      Promise.resolve(supabase.from('v_inactive_clients').select('*').limit(10)).then((r) => {
        inactiveClients = r.data
      })
    )
  }
  if (!allInactive && allInactiveError?.message?.includes('user_id')) {
    fallbacks.push(
      Promise.resolve(supabase.from('v_inactive_clients').select('last_visit')).then((r) => {
        allInactive = r.data
      })
    )
  }
  if (totalBaseCount === null && baseCountErr?.message?.includes('user_id')) {
    fallbacks.push(
      Promise.resolve(supabase.from('clients').select('*', { count: 'exact', head: true })).then((r) => {
        totalBaseCount = r.count
      })
    )
  }
  if (fallbacks.length > 0) {
    await Promise.all(fallbacks)
  }

  const totalInativos = allInactive?.length || 0
  const inativos30d = allInactive?.filter(c => {
    const diff = (new Date().getTime() - new Date(c.last_visit).getTime()) / (1000 * 3600 * 24)
    return diff >= 30 && diff < 90
  }).length || 0
  
  const inativos90d = allInactive?.filter(c => {
    const diff = (new Date().getTime() - new Date(c.last_visit).getTime()) / (1000 * 3600 * 24)
    return diff >= 90
  }).length || 0

  const totalBase = totalBaseCount || 0

  // Prepara dados para o LineChart (últimos 7 dias)
  const lineChartData = []
  if (logsData && logsData.length > 0) {
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const count = logsData.filter((l: any) => l.sent_at?.startsWith(dateStr)).length
      lineChartData.push({
        date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`,
        count
      })
    }
  }

  // Fallback de métricas
  const m = metrics || {
    total_disparos: 0,
    taxa_resposta: 0,
    taxa_conversao: 0,
    receita_resgatada: 0
  }

  // Insight dinâmico
  const activeBase = totalBase - totalInativos
  const baseSaudavel = totalBase > 0 ? (activeBase / totalBase) * 100 : 0

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-[100dvh]">
      
      {/* Título e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#F4F4F5]">
            Painel de Recuperação
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Acompanhe clientes inativos e conduza reativações pelo WhatsApp.
          </p>
        </div>
        <AddClientFab />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Bloco 1: Resumo de Inativos */}
        <Card className="lg:col-span-4 border-white/[0.08] bg-[#111215] shadow-none">
          <CardHeader className="pb-4">
            <div className="w-8 h-8 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center mb-4">
              <BellRinging className="w-4 h-4 text-[#00E676]" weight="regular" />
            </div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-[#F4F4F5] leading-tight">
              Sua base tem <span className="text-[#00E676] font-mono">{totalInativos}</span> clientes sumidos.
            </CardTitle>
            <CardDescription className="text-zinc-400 mt-2 leading-relaxed">
              Taxa histórica de retorno de <span className="font-mono text-zinc-200">{m.taxa_conversao}%</span>. Um contato hoje pode recuperar cerca de <span className="font-mono text-zinc-200">R$ {((m.receita_resgatada / (m.total_disparos || 1)) * totalInativos).toFixed(2)}</span> em vendas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-4 border-t border-white/[0.08]">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Sem comprar há 30 a 90 dias</span>
                <span className="font-mono text-sm text-zinc-100">{inativos30d}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Mais de 90 dias sem comprar</span>
                <span className="font-mono text-sm text-red-400">{inativos90d}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2: Line Chart */}
        <Card className="lg:col-span-8 border-white/[0.08] bg-[#111215] shadow-none flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
            <div>
              <CardTitle className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-400">
                Ritmo de Mensagens (7 dias)
              </CardTitle>
              <div className="text-3xl font-semibold tracking-tight mt-1.5 text-[#F4F4F5] font-mono">
                {m.total_disparos} <span className="text-base font-sans font-normal text-zinc-400">mensagens enviadas</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px] pt-4">
            <LineChartClient data={lineChartData} />
          </CardContent>
        </Card>

        {/* Bloco 3: Saúde da Base */}
        <Card className="lg:col-span-4 border-white/[0.08] bg-[#111215] shadow-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-400">
              Saúde da Base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-3xl font-semibold font-mono text-[#F4F4F5]">{totalBase}</div>
              <div className="text-xs text-zinc-400 mt-1">Total de clientes cadastrados</div>
            </div>
            <div className="space-y-2.5">
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0C0D0F] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                  <span className="text-sm text-zinc-200">Clientes Ativos</span>
                </div>
                <span className="font-mono text-sm text-zinc-100">{activeBase} ({baseSaudavel.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-[#0C0D0F] border border-white/[0.06]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span className="text-sm text-zinc-200">Clientes Inativos</span>
                </div>
                <span className="font-mono text-sm text-red-400">{totalInativos} ({(100 - baseSaudavel).toFixed(1)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 4: Heatmap */}
        <Card className="lg:col-span-8 border-white/[0.08] bg-[#111215] shadow-none">
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-[0.12em] text-zinc-400">
              Histórico Diário (120 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapClient logsData={logsData || []} />
          </CardContent>
        </Card>

        {/* Bloco 5: Tabela Recentes com Busca */}
        <Card className="lg:col-span-12 border-white/[0.08] bg-[#111215] shadow-none overflow-hidden">
          <ClientSearchTable initialClients={inactiveClients || []} />
        </Card>

      </div>
    </div>
  )
}
