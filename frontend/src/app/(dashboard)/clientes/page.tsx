import { createClient } from "@/lib/supabase/server"
import { ClientsManagementClient, ClientItem } from "@/components/ClientsManagementClient"
import { MotionSection } from "@/components/ui/MotionSection"

export const revalidate = 0

export default async function ClientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Busca clientes e datas de pedidos em paralelo
  let clientsQuery = supabase
    .from('clients')
    .select('id, name, phone, cnpj, city, state, created_at')
    .order('name', { ascending: true })

  if (user) {
    clientsQuery = clientsQuery.or(`user_id.eq.${user.id},user_id.is.null`)
  }

  const [clientsRes, ordersRes] = await Promise.all([
    clientsQuery,
    supabase
      .from('orders')
      .select('client_id, order_date')
      .order('order_date', { ascending: false }),
  ])

  let rawClients = clientsRes.data
  let clientsError = clientsRes.error
  const ordersData = ordersRes.data

  // Fallback se a coluna user_id ainda não tiver sido criada no Supabase
  if (!rawClients && clientsError?.message?.includes('user_id')) {
    const fallback = await supabase
      .from('clients')
      .select('id, name, phone, cnpj, city, state, created_at')
      .order('name', { ascending: true })
    rawClients = fallback.data
    clientsError = fallback.error
  }

  if (clientsError) {
    console.error('Erro ao buscar clientes:', clientsError)
  }

  // Mapeia a data da última compra por ID de cliente
  const latestOrderMap = new Map<string, string>()
  if (ordersData) {
    ordersData.forEach((order) => {
      if (order.client_id && order.order_date && !latestOrderMap.has(order.client_id)) {
        latestOrderMap.set(order.client_id, order.order_date)
      }
    })
  }

  const clients: ClientItem[] = (rawClients || []).map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    cnpj: c.cnpj || null,
    city: c.city || null,
    state: c.state || null,
    created_at: c.created_at,
    last_visit: latestOrderMap.get(c.id) || null,
  }))

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-[100dvh] space-y-6">
      <MotionSection delay={0}>
        <header className="pb-6 border-b border-white/[0.08]">
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#F4F4F5] leading-tight">
            Carteira de Clientes
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie os clientes da representação, filtre por situação ou estado e registre vendas.
          </p>
        </header>
      </MotionSection>

      <MotionSection delay={0.05}>
        <ClientsManagementClient initialClients={clients} />
      </MotionSection>
    </div>
  )
}
