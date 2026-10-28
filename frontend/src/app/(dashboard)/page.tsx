import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/server"
import { AddClientFab } from "@/components/AddClientFab"
import { LineChartClient } from "@/components/LineChartClient"
import { HeatmapClient } from "@/components/HeatmapClient"
import { ClientSearchTable } from "@/components/ClientSearchTable"
import { BellRing } from "lucide-react"

export const revalidate = 0

export default async function Dashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Buscar clientes inativos do usuário logado (tabela da tela, limite 10)
  let inactiveClientsQuery = supabase
    .from('v_inactive_clients')
    .select('*')

  if (user) {
    inactiveClientsQuery = inactiveClientsQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  let { data: inactiveClients, error: inativosError } = await inactiveClientsQuery.limit(10)

  // Fallback se a view não tiver user_id
  if (!inactiveClients && inativosError?.message?.includes('user_id')) {
    const fallback = await supabase.from('v_inactive_clients').select('*').limit(10)
    inactiveClients = fallback.data
    inativosError = fallback.error
  }

  // Contagem real total de inativos e estratificação por dias
  let allInactiveQuery = supabase
    .from('v_inactive_clients')
    .select('last_visit')

  if (user) {
    allInactiveQuery = allInactiveQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  let { data: allInactive, error: allInactiveError } = await allInactiveQuery

  if (!allInactive && allInactiveError?.message?.includes('user_id')) {
    const fallback = await supabase.from('v_inactive_clients').select('last_visit')
    allInactive = fallback.data
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

  // Buscar contagem real total de clientes na base do usuário
  let totalBaseQuery = supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  if (user) {
    totalBaseQuery = totalBaseQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  let { count: totalBaseCount, error: baseCountErr } = await totalBaseQuery

  if (totalBaseCount === null && baseCountErr?.message?.includes('user_id')) {
    const fallback = await supabase.from('clients').select('*', { count: 'exact', head: true })
    totalBaseCount = fallback.count
  }

  const totalBase = totalBaseCount || 0

  // Buscar métricas da v_winback_metrics
  const { data: metrics } = await supabase
    .from('v_winback_metrics')
    .select('*')
    .limit(1)
    .single()

  // Buscar histórico de logs para os gráficos
  const { data: logsData } = await supabase
    .from('reactivation_logs')
    .select('sent_at')
    .gte('sent_at', new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString())

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
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-screen">
      
      {/* Título e Botão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Painel de Recuperação de Clientes</h1>
          <p className="text-muted-foreground text-sm">Acompanhe clientes sumidos e envie mensagens de reativação pelo WhatsApp com 1 clique.</p>
        </div>
        <AddClientFab />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Bloco 1: Insight IA */}
        <Card className="lg:col-span-4 border-white/10 bg-[#12161A] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
          <CardHeader className="pb-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BellRing className="w-4 h-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-primary leading-tight">
              Sua base tem {totalInativos} clientes sumidos.
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              Sua taxa histórica de retorno é de {m.taxa_conversao}%. Um contato hoje pode recuperar cerca de R$ {((m.receita_resgatada / (m.total_disparos || 1)) * totalInativos).toFixed(2)} em vendas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Sem comprar há 30 a 90 dias</span>
                <span className="font-mono text-sm">{inativos30d}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Mais de 90 dias sem comprar</span>
                <span className="font-mono text-sm text-destructive">{inativos90d}</span>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Calculado ao vivo
            </div>
          </CardContent>
        </Card>

        {/* Bloco 2: Line Chart */}
        <Card className="lg:col-span-8 border-white/10 bg-[#12161A] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2 shrink-0">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">Ritmo de Mensagens Enviadas (7 dias)</CardTitle>
              <div className="text-3xl font-bold mt-1 flex items-center gap-2">
                {m.total_disparos} mensagens enviadas
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 min-h-[250px] pt-4">
            <LineChartClient data={lineChartData} />
          </CardContent>
        </Card>

        {/* Bloco 3: Saúde da Base */}
        <Card className="lg:col-span-4 border-white/10 bg-[#12161A]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Saúde da Base de Clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-2xl font-bold">{totalBase}</div>
              <div className="text-xs text-muted-foreground">Total de Clientes Cadastrados</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium">Clientes Comprando (Ativos)</span>
                </div>
                <span className="font-mono text-sm">{activeBase} ({baseSaudavel.toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                  <span className="text-sm font-medium">Clientes Sumidos (Inativos)</span>
                </div>
                <span className="font-mono text-sm text-destructive">{totalInativos} ({(100 - baseSaudavel).toFixed(1)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco 4: Heatmap */}
        <Card className="lg:col-span-8 border-white/10 bg-[#12161A]">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Histórico Diário de Mensagens (Últimos 120 dias)</CardTitle>
          </CardHeader>
          <CardContent>
            <HeatmapClient logsData={logsData || []} />
          </CardContent>
        </Card>

        {/* Bloco 5: Tabela Recentes com Busca */}
        <Card className="lg:col-span-12 border-white/10 bg-[#12161A] overflow-hidden">
          <ClientSearchTable initialClients={inactiveClients || []} />
        </Card>

      </div>
    </div>
  )
}
