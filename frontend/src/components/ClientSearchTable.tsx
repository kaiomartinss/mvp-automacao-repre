"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

function getDaysSince(dateStr?: string) {
  if (!dateStr) return null
  const diff = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
  return Math.max(0, Math.floor(diff))
}

export function ClientSearchTable({ initialClients }: { initialClients: InactiveClient[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [orderModalClient, setOrderModalClient] = useState<{ id: string; name: string } | null>(null)

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return initialClients
    const term = searchTerm.toLowerCase().trim()
    return initialClients.filter((client) => {
      const nameMatch = client.name?.toLowerCase().includes(term)
      const phoneMatch = client.phone?.includes(term)
      return nameMatch || phoneMatch
    })
  }, [searchTerm, initialClients])

  return (
    <div>
      <div className="px-5 py-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0C0D0F]/35">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-medium text-[#F4F4F5]">
                Fila de reativação
              </h2>
              <span className="font-mono text-[11px] text-zinc-400 bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 rounded-md tabular-nums">
                {filteredClients.length}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Clientes sem compra recente prontos para abordagem no WhatsApp.
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <MagnifyingGlass
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
            weight="regular"
          />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px]">Cliente</TableHead>
            <TableHead>Última compra</TableHead>
            <TableHead>Situação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients && filteredClients.length > 0 ? (
            filteredClients.map((client, i) => {
              const days = getDaysSince(client.last_visit)
              const isCritical = days !== null && days >= 90
              return (
                <TableRow key={client.id || i} className="group/row">
                  <TableCell className="font-medium text-sm text-[#F4F4F5]">
                    {client.name || `Cliente #${client.id || i}`}
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" weight="regular" />
                      {client.last_visit
                        ? new Date(client.last_visit).toLocaleDateString("pt-BR")
                        : "Sem registro"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 text-xs text-zinc-300 font-mono tabular-nums">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCritical ? "bg-red-400" : "bg-amber-400"
                        }`}
                      />
                      {days !== null ? `${days}d sem compra` : "+30d sem compra"}
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
                        title="Registrar venda"
                      >
                        <Receipt className="w-3.5 h-3.5" weight="regular" />
                        <span className="hidden sm:inline">Venda</span>
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={4} className="text-center text-zinc-500 py-12 text-sm">
                {searchTerm
                  ? `Nenhum cliente encontrado para "${searchTerm}".`
                  : "Nenhum cliente aguardando reativação no momento."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
