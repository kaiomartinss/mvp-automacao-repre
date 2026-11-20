'use client'

import { useState, useMemo } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { DispararN8NButton } from '@/components/DispararN8NButton'
import { addClient, updateClient, deleteClient } from '@/app/actions/clients'
import {
  MagnifyingGlass,
  UserPlus,
  MapPin,
  PencilSimple,
  Trash,
  Clock,
  WarningCircle,
  CircleNotch,
  ArrowSquareOut,
  FileCsv,
  Receipt,
} from '@phosphor-icons/react'
import { RegisterOrderModal } from '@/components/RegisterOrderModal'
import { ImportClientsModal } from '@/components/ImportClientsModal'

export interface ClientItem {
  id: string
  name: string
  phone: string
  cnpj?: string | null
  city?: string | null
  state?: string | null
  created_at?: string
  last_visit?: string | null
}

const SPRING_TAB = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
}

export function ClientsManagementClient({ initialClients }: { initialClients: ClientItem[] }) {
  const [clients, setClients] = useState<ClientItem[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'alert' | 'inactive'>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')
  const shouldReduceMotion = useReducedMotion()

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null)
  const [deletingClient, setDeletingClient] = useState<ClientItem | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [orderModalClient, setOrderModalClient] = useState<{ id: string; name: string } | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const formatCNPJ = (val?: string | null) => {
    if (!val) return null
    const clean = val.replace(/\D/g, '')
    if (clean.length === 14) {
      return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return val
  }

  const formatPhone = (phone?: string) => {
    if (!phone) return 'Não informado'
    const clean = phone.replace(/^55/, '').replace(/\D/g, '')
    if (clean.length === 11) {
      return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    }
    if (clean.length === 10) {
      return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
    }
    return phone
  }

  const getDaysSinceLastVisit = (lastVisit?: string | null) => {
    if (!lastVisit) return null
    const diff = (new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 3600 * 24)
    return Math.floor(diff)
  }

  const availableStates = useMemo(() => {
    const states = new Set<string>()
    clients.forEach((c) => {
      if (c.state && c.state.trim()) {
        states.add(c.state.trim().toUpperCase())
      }
    })
    return Array.from(states).sort()
  }, [clients])

  const metrics = useMemo(() => {
    const total = clients.length
    let active = 0
    let alert = 0
    let inactive = 0

    clients.forEach((c) => {
      const days = getDaysSinceLastVisit(c.last_visit)
      if (days === null || days >= 90) {
        inactive++
      } else if (days >= 30) {
        alert++
      } else {
        active++
      }
    })

    return { total, active, alert, inactive }
  }, [clients])

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.cnpj && c.cnpj.includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term))

      if (!matchesSearch) return false

      if (stateFilter !== 'all') {
        if (c.state?.toUpperCase() !== stateFilter) return false
      }

      const days = getDaysSinceLastVisit(c.last_visit)
      if (statusFilter === 'active') return days !== null && days < 30
      if (statusFilter === 'alert') return days !== null && days >= 30 && days < 90
      if (statusFilter === 'inactive') return days === null || days >= 90

      return true
    })
  }, [clients, searchTerm, statusFilter, stateFilter])

  async function handleAddSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await addClient(formData)
    setFormLoading(false)

    if (res.error) {
      setFormError(res.error)
    } else {
      setIsAddOpen(false)
      window.location.reload()
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingClient) return

    setFormError(null)
    setFormLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('id', editingClient.id)

    const res = await updateClient(formData)
    setFormLoading(false)

    if (res.error) {
      setFormError(res.error)
    } else {
      setIsEditOpen(false)
      setEditingClient(null)
      window.location.reload()
    }
  }

  async function confirmDelete() {
    if (!deletingClient) return
    setDeleteLoading(true)
    setDeleteError(null)
    const res = await deleteClient(deletingClient.id)
    setDeleteLoading(false)

    if (res.error) {
      setDeleteError(res.error)
    } else {
      setClients((prev) => prev.filter((c) => c.id !== deletingClient.id))
      setDeletingClient(null)
    }
  }

  const filterTabs: Array<{
    id: 'all' | 'active' | 'alert' | 'inactive'
    label: string
    count: number
    dot?: string
  }> = [
    { id: 'all', label: 'Todos', count: metrics.total },
    { id: 'active', label: 'Ativos', count: metrics.active, dot: 'bg-[#00E676]' },
    { id: 'alert', label: 'Alerta', count: metrics.alert, dot: 'bg-amber-400' },
    { id: 'inactive', label: 'Inativos', count: metrics.inactive, dot: 'bg-red-400' },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Faixa Unificada de Indicadores (Hairline Grid) */}
      <section
        aria-label="Resumo da carteira"
        className="rounded-xl border border-white/[0.08] bg-[#111215] grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]"
      >
        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500">
            Total na carteira
          </span>
          <div>
            <div className="font-mono text-2xl md:text-3xl font-semibold text-[#F4F4F5] tabular-nums">
              {metrics.total}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Clientes cadastrados</p>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
            Ativos
          </span>
          <div>
            <div className="font-mono text-2xl md:text-3xl font-semibold text-[#F4F4F5] tabular-nums">
              {metrics.active}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Compra há menos de 30d</p>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Em alerta
          </span>
          <div>
            <div className="font-mono text-2xl md:text-3xl font-semibold text-[#F4F4F5] tabular-nums">
              {metrics.alert}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Entre 30 e 90 dias</p>
          </div>
        </div>

        <div className="p-5 flex flex-col justify-between gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Inativos
          </span>
          <div>
            <div className="font-mono text-2xl md:text-3xl font-semibold text-[#F4F4F5] tabular-nums">
              {metrics.inactive}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Mais de 90d ou sem compra</p>
          </div>
        </div>
      </section>

      {/* 2. Tabela com Barra de Filtros Integrada */}
      <section className="rounded-xl border border-white/[0.08] bg-[#111215] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 md:px-5 border-b border-white/[0.08] bg-[#0C0D0F]/35 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Busca + Filtro UF */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            <div className="relative flex-1 max-w-sm">
              <MagnifyingGlass
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                weight="regular"
              />
              <Input
                placeholder="Buscar por nome, telefone, CNPJ ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Segmented Filter Control (transitions.dev layoutId spring) */}
            <div
              role="tablist"
              aria-label="Filtrar por situação"
              className="inline-flex items-center p-1 rounded-lg bg-[#0C0D0F] border border-white/[0.08] overflow-x-auto"
            >
              {filterTabs.map((tab) => {
                const active = statusFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`relative z-10 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-1.5 ${
                      active ? 'text-[#0C0D0F]' : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="clients-filter-pill"
                        transition={shouldReduceMotion ? { duration: 0 } : SPRING_TAB}
                        className="absolute inset-0 rounded-md bg-[#F4F4F5] -z-10"
                      />
                    )}
                    {tab.dot && !active && (
                      <span className={`w-1.5 h-1.5 rounded-full ${tab.dot}`} />
                    )}
                    <span>{tab.label}</span>
                    <span
                      className={`font-mono text-[10px] tabular-nums ${
                        active ? 'text-[#0C0D0F]/70' : 'text-zinc-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
            {availableStates.length > 0 && (
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                aria-label="Filtrar por estado"
                className="h-9 bg-[#0C0D0F] border border-white/12 text-xs text-zinc-200 rounded-lg px-3 outline-none focus:border-white/40 cursor-pointer"
              >
                <option value="all">Todas as UFs</option>
                {availableStates.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/12 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-200 text-xs font-medium active:scale-[0.985] transition-all cursor-pointer"
            >
              <FileCsv className="w-4 h-4 text-zinc-400" weight="regular" />
              <span>Importar CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError(null)
                setIsAddOpen(true)
              }}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] text-xs font-medium active:scale-[0.985] transition-all cursor-pointer whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" weight="bold" />
              <span>Novo Cliente</span>
            </button>
          </div>
        </div>

        {/* Tabela */}
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[260px]">Cliente</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Localização</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Última compra</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                const days = getDaysSinceLastVisit(client.last_visit)
                const cnpjFormatted = formatCNPJ(client.cnpj)

                return (
                  <TableRow key={client.id} className="group/row">
                    {/* Cliente */}
                    <TableCell className="font-medium text-sm">
                      <div>
                        <p className="text-[#F4F4F5] font-medium leading-snug">{client.name}</p>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          #{client.id.slice(0, 8)}
                        </span>
                      </div>
                    </TableCell>

                    {/* CNPJ */}
                    <TableCell className="text-xs text-zinc-400 font-mono tabular-nums">
                      {cnpjFormatted ? (
                        <span className="text-zinc-300">{cnpjFormatted}</span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>

                    {/* Localização */}
                    <TableCell className="text-xs text-zinc-400">
                      {client.city || client.state ? (
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" weight="regular" />
                          <span>
                            {client.city ? client.city : ''}
                            {client.city && client.state ? ' - ' : ''}
                            {client.state ? client.state : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </TableCell>

                    {/* Telefone */}
                    <TableCell className="text-xs font-mono tabular-nums">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-300">{formatPhone(client.phone)}</span>
                        {client.phone && (
                          <a
                            href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Abrir no WhatsApp Web"
                            className="text-zinc-500 hover:text-[#F4F4F5] transition-colors"
                          >
                            <ArrowSquareOut className="w-3.5 h-3.5" weight="regular" />
                          </a>
                        )}
                      </div>
                    </TableCell>

                    {/* Última compra & situação */}
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs flex items-center gap-1.5 text-zinc-300 font-mono tabular-nums">
                          <Clock className="w-3 h-3 text-zinc-500" weight="regular" />
                          {client.last_visit
                            ? new Date(client.last_visit).toLocaleDateString('pt-BR')
                            : 'Sem registro'}
                        </div>

                        {days === null ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                            Sem compra
                          </span>
                        ) : days < 30 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono tabular-nums">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                            Ativo · {days}d
                          </span>
                        ) : days < 90 ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono tabular-nums">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Alerta · {days}d
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] text-zinc-300 font-mono tabular-nums">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Inativo · {days}d
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
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
                          <span className="hidden xl:inline">Venda</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingClient(client)
                            setFormError(null)
                            setIsEditOpen(true)
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-500 hover:text-[#F4F4F5] hover:bg-white/[0.06] transition-colors cursor-pointer"
                          title="Editar cliente"
                        >
                          <PencilSimple className="w-4 h-4" weight="regular" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteError(null)
                            setDeletingClient(client)
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                          title="Excluir cliente"
                        >
                          <Trash className="w-4 h-4" weight="regular" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="text-center text-zinc-500 py-14 text-sm">
                  {searchTerm || statusFilter !== 'all' || stateFilter !== 'all'
                    ? 'Nenhum cliente encontrado com os filtros aplicados.'
                    : 'Nenhum cliente cadastrado na carteira.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      {/* Modal: Adicionar Cliente */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-zinc-300" weight="regular" />
              Novo cliente
            </DialogTitle>
            <DialogDescription>
              Cadastre os dados comerciais para acompanhar o ciclo de recompra.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
                <span>{formError}</span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-300">Nome / Razão social *</Label>
              <Input
                name="name"
                placeholder="Ex: Confecções Estilo Ltda"
                required
                disabled={formLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-300">CNPJ</Label>
                <Input
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  disabled={formLoading}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-300">WhatsApp / Telefone *</Label>
                <Input
                  name="phone"
                  placeholder="(83) 99999-9999"
                  required
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-300">Cidade</Label>
                <Input name="city" placeholder="Ex: João Pessoa" disabled={formLoading} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-300">UF</Label>
                <Input
                  name="state"
                  placeholder="PB"
                  maxLength={2}
                  disabled={formLoading}
                  className="uppercase text-center font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-300">Data da última compra</Label>
              <Input
                type="date"
                name="lastVisit"
                defaultValue={new Date().toISOString().split('T')[0]}
                disabled={formLoading}
              />
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={formLoading}
                className="text-zinc-300 hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-[#F4F4F5] text-[#0C0D0F] hover:bg-white font-medium active:scale-[0.985] transition-all cursor-pointer"
              >
                {formLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                    Salvando...
                  </span>
                ) : (
                  'Cadastrar cliente'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Cliente */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PencilSimple className="w-4 h-4 text-zinc-300" weight="regular" />
              Editar cliente
            </DialogTitle>
            <DialogDescription>
              Atualize as informações de contato ou localização deste registro.
            </DialogDescription>
          </DialogHeader>

          {editingClient && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
                  <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-300">Nome / Razão social *</Label>
                <Input
                  name="name"
                  defaultValue={editingClient.name}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-300">CNPJ</Label>
                  <Input
                    name="cnpj"
                    defaultValue={editingClient.cnpj || ''}
                    placeholder="00.000.000/0000-00"
                    disabled={formLoading}
                    className="font-mono text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-300">WhatsApp / Telefone *</Label>
                  <Input
                    name="phone"
                    defaultValue={editingClient.phone}
                    required
                    disabled={formLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-300">Cidade</Label>
                  <Input
                    name="city"
                    defaultValue={editingClient.city || ''}
                    disabled={formLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-300">UF</Label>
                  <Input
                    name="state"
                    defaultValue={editingClient.state || ''}
                    maxLength={2}
                    disabled={formLoading}
                    className="uppercase text-center font-mono"
                  />
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditOpen(false)}
                  disabled={formLoading}
                  className="text-zinc-300 hover:bg-white/5 cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-[#F4F4F5] text-[#0C0D0F] hover:bg-white font-medium active:scale-[0.985] transition-all cursor-pointer"
                >
                  {formLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                      Salvando...
                    </span>
                  ) : (
                    'Atualizar dados'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmação de Exclusão (sem window.confirm) */}
      <Dialog
        open={!!deletingClient}
        onOpenChange={(open) => {
          if (!open) setDeletingClient(null)
        }}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Remover cliente da base</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{' '}
              <span className="text-zinc-200 font-medium">{deletingClient?.name}</span>? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {deleteError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
              <span>{deleteError}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeletingClient(null)}
              disabled={deleteLoading}
              className="text-zinc-300 hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={confirmDelete}
              disabled={deleteLoading}
              className="bg-red-500/90 hover:bg-red-500 text-white font-medium cursor-pointer"
            >
              {deleteLoading ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                  Removendo...
                </span>
              ) : (
                'Excluir cliente'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImportClientsModal
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onSuccess={() => window.location.reload()}
      />

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
