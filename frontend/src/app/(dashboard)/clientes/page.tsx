import { createClient } from "@/lib/supabase/server"
import { ClientsManagementClient, ClientItem } from "@/components/ClientsManagementClient"

export const revalidate = 0

export default async function ClientesPage() {
  const supabase = await createClient()

  // Busca todos os clientes cadastrados
  const { data: rawClients, error: clientsError } = await supabase
    .from('clients')
    .select('id, name, phone, cnpj, city, state, created_at')
    .order('name', { ascending: true })

  if (clientsError) {
    console.error('Erro ao buscar clientes:', clientsError)
  }

  // Busca datas de pedidos para determinar a última compra de cada cliente
  const { data: ordersData } = await supabase
    .from('orders')
    .select('client_id, order_date')
    .order('order_date', { ascending: false })

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
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Carteira de Clientes</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie todos os clientes da sua representação, localize por cidade/CNPJ e acompanhe o ritmo de compra.
        </p>
      </div>

      <ClientsManagementClient initialClients={clients} />
    </div>
  )
}
