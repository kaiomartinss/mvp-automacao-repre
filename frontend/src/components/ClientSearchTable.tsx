"use client"

import { useState, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DispararN8NButton } from "@/components/DispararN8NButton"
import { Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface InactiveClient {
  id: string
  name: string
  phone: string
  last_visit: string
}

export function ClientSearchTable({ initialClients }: { initialClients: InactiveClient[] }) {
  const [searchTerm, setSearchTerm] = useState("")

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
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.01]">
        <div>
          <h3 className="text-sm font-medium text-foreground">Clientes Aguardando Reativação</h3>
          <p className="text-xs text-muted-foreground">Clientes sem comprar recentemente. Envie uma mensagem direta com 1 clique.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-black/40 border-white/10 text-xs h-9 focus-visible:ring-primary"
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
                <TableRow key={client.id || i} className="border-white/5 hover:bg-white/5 transition-colors">
                  <TableCell className="font-medium text-sm">
                    {client.name || `Cliente #${client.id || i}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {client.last_visit ? new Date(client.last_visit).toLocaleDateString('pt-BR') : 'Desconhecida'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/10 font-normal rounded-md text-xs">
                      Sem comprar há +30 dias
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DispararN8NButton 
                      clientId={client.id} 
                      clientName={client.name} 
                      phone={client.phone} 
                    />
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
    </div>
  )
}
