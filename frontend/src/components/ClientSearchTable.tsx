"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DispararN8NButton } from "@/components/DispararN8NButton"
import { Clock, MagnifyingGlass, Receipt } from "@phosphor-icons/react"
import { Input } from "@/components/ui/input"
import { RegisterOrderModal } from "@/components/RegisterOrderModal"

interface InactiveClient {
  id: string
  name: string
  phone: string
  last_visit: string
}

export function ClientSearchTable({ initialClients }: { initialClients: InactiveClient[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [orderModalClient, setOrderModalClient] = useState<{ id: string; name: string } | null>(null)

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return initialClients
    const term = searchTerm.toLowerCase().trim()
    return initialClients.filter(client => {
      const nameMatch = client.name?.toLowerCase().includes(term)
      const phoneMatch = client.phone?.includes(term)
      return nameMatch || phoneMatch
    })
  }, [searchTerm, initialClients])

  return (
    <div className="space-y-4">
      <div className="p-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0D0F]/40">
        <div>
          <h3 className="text-sm font-medium text-[#F4F4F5]">Clientes Aguardando Reativação</h3>
          <p className="text-xs text-zinc-400">Clientes sem comprar recentemente. Envie uma mensagem direta com 1 clique.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" weight="regular" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-[#0C0D0F] border-white/12 text-xs h-9 focus-visible:ring-emerald-400/25"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="w-[240px]">Cliente</TableHead>
              <TableHead>Última Compra / Visita</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients && filteredClients.length > 0 ? (
              filteredClients.map((client: any, i: number) => (
                <TableRow key={client.id || i} className="border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <TableCell className="font-medium text-sm text-[#F4F4F5]">
                    {client.name || `Cliente #${client.id || i}`}
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" weight="regular" />
                      {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : 'Desconhecida'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-xs text-zinc-300 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                      +30d sem compra
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DispararN8NButton 
                        clientId={client.id} 
                        clientName={client.name} 
                        phone={client.phone} 
                      />
                      <button
                        type="button"
                        onClick={() => setOrderModalClient({ id: client.id, name: client.name })}
                        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-white/[0.08] bg-transparent text-zinc-300 hover:text-[#F4F4F5] hover:bg-white/[0.06] text-xs font-medium active:scale-[0.98] transition-all cursor-pointer"
                        title="Registrar Venda / Pedido"
                      >
                        <Receipt className="w-3.5 h-3.5" weight="regular" />
                        <span className="hidden sm:inline">Venda</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">
                  {searchTerm 
                    ? `Nenhum cliente encontrado para a busca "${searchTerm}".`
                    : "Nenhum cliente inativo encontrado ou banco não conectado."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {orderModalClient && (
        <RegisterOrderModal
          open={!!orderModalClient}
          onOpenChange={(open) => {
            if (!open) setOrderModalClient(null)
          }}
          clientId={orderModalClient.id}
          clientName={orderModalClient.name}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  )
}
