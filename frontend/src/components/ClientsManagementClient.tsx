'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DispararN8NButton } from '@/components/DispararN8NButton'
import { addClient, updateClient, deleteClient } from '@/app/actions/clients'
import { 
  Search, 
  UserPlus, 
  MapPin, 
  Building2, 
  Phone, 
  Calendar, 
  Edit2, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Loader2,
  Users,
  Filter,
  ExternalLink
} from 'lucide-react'

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

export function ClientsManagementClient({ initialClients }: { initialClients: ClientItem[] }) {
  const [clients, setClients] = useState<ClientItem[]>(initialClients)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'alert' | 'inactive'>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Format CNPJ helper: 00.000.000/0000-00
  const formatCNPJ = (val?: string | null) => {
    if (!val) return null
    const clean = val.replace(/\D/g, '')
    if (clean.length === 14) {
      return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }
    return val
  }

  // Format Phone helper: (00) 00000-0000
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

  // Calculate days since last visit
  const getDaysSinceLastVisit = (lastVisit?: string | null) => {
    if (!lastVisit) return null
    const diff = (new Date().getTime() - new Date(lastVisit).getTime()) / (1000 * 3600 * 24)
    return Math.floor(diff)
  }

  // Available unique states for filter
  const availableStates = useMemo(() => {
    const states = new Set<string>()
    clients.forEach(c => {
      if (c.state && c.state.trim()) {
        states.add(c.state.trim().toUpperCase())
      }
    })
    return Array.from(states).sort()
  }, [clients])

  // Metrics summary
  const metrics = useMemo(() => {
    const total = clients.length
    let active = 0
    let alert = 0
    let inactive = 0

    clients.forEach(c => {
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

  // Filtered clients list
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // Search term
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term || 
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.includes(term)) ||
        (c.cnpj && c.cnpj.includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term))

      if (!matchesSearch) return false

      // State filter
      if (stateFilter !== 'all') {
        if (c.state?.toUpperCase() !== stateFilter) return false
      }

      // Status filter
      const days = getDaysSinceLastVisit(c.last_visit)
      if (statusFilter === 'active') {
        return days !== null && days < 30
      }
      if (statusFilter === 'alert') {
        return days !== null && days >= 30 && days < 90
      }
      if (statusFilter === 'inactive') {
        return days === null || days >= 90
      }

      return true
    })
  }, [clients, searchTerm, statusFilter, stateFilter])

  // Handle Add Client
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

  // Handle Edit Client
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

  // Handle Delete Client
  async function handleDelete(clientId: string, clientName: string) {
    if (confirm(`Tem certeza que deseja remover "${clientName}" da base?`)) {
      const res = await deleteClient(clientId)
      if (res.error) {
        alert(res.error)
      } else {
        setClients(prev => prev.filter(c => c.id !== clientId))
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Indicadores da Carteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/10 bg-[#12161A] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Total na Carteira</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mt-2">{metrics.total}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Clientes cadastrados na base</p>
        </Card>

        <Card className="border-white/10 bg-[#12161A] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Clientes Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-2">{metrics.active}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Comprando há menos de 30 dias</p>
        </Card>

        <Card className="border-white/10 bg-[#12161A] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Em Alerta (30-90d)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-2">{metrics.alert}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Janela ideal para reativação rápida</p>
        </Card>

        <Card className="border-white/10 bg-[#12161A] p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">Inativos (+90d)</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">{metrics.inactive}</div>
          <p className="text-[11px] text-muted-foreground mt-1">Clientes frios aguardando contato</p>
        </Card>
      </div>

      {/* 2. Barra de Busca, Filtros e Botão Novo Cliente */}
      <Card className="border-white/10 bg-[#12161A] p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Busca */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por Nome, Telefone, CNPJ ou Cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-black/40 border-white/10 text-xs h-10 focus-visible:ring-primary text-white"
            />
          </div>

          {/* Filtros e Ação */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Tabs */}
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-primary text-black font-semibold'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Todos ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === 'active'
                    ? 'bg-primary text-black font-semibold'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Ativos ({metrics.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('alert')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === 'alert'
                    ? 'bg-amber-400 text-black font-semibold'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Alerta ({metrics.alert})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  statusFilter === 'inactive'
                    ? 'bg-rose-500 text-white font-semibold'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                Inativos ({metrics.inactive})
              </button>
            </div>

            {/* State Filter Dropdown */}
            {availableStates.length > 0 && (
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="bg-black/40 border border-white/10 text-xs text-white rounded-lg px-3 py-2 outline-none focus:border-primary"
              >
                <option value="all">Todos os Estados</option>
                {availableStates.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            )}

            {/* Novo Cliente Button */}
            <Button
              onClick={() => {
                setFormError(null)
                setIsAddOpen(true)
              }}
              className="bg-primary hover:bg-primary/90 text-black font-semibold gap-1.5 h-10 shadow-[0_0_15px_rgba(0,230,118,0.2)] cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Novo Cliente</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. Tabela de Clientes */}
      <Card className="border-white/10 bg-[#12161A] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-[260px]">Cliente / Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Telefone / WhatsApp</TableHead>
                <TableHead>Última Compra</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const days = getDaysSinceLastVisit(client.last_visit)
                  const cnpjFormatted = formatCNPJ(client.cnpj)

                  return (
                    <TableRow key={client.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      {/* Cliente Name */}
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-semibold leading-snug">{client.name}</p>
                            <span className="text-[11px] text-muted-foreground font-mono">ID: {client.id.slice(0, 8)}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* CNPJ */}
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {cnpjFormatted ? (
                          <span className="text-zinc-300">{cnpjFormatted}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>

                      {/* Localização */}
                      <TableCell className="text-xs text-muted-foreground">
                        {client.city || client.state ? (
                          <div className="flex items-center gap-1.5 text-zinc-300">
                            <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span>
                              {client.city ? client.city : ''}
                              {client.city && client.state ? ' - ' : ''}
                              {client.state ? client.state : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>

                      {/* Telefone */}
                      <TableCell className="text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-300">{formatPhone(client.phone)}</span>
                          {client.phone && (
                            <a
                              href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Abrir no WhatsApp Web"
                              className="text-muted-foreground/50 hover:text-emerald-400 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </TableCell>

                      {/* Última Compra e Status */}
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs flex items-center gap-1.5 text-zinc-300">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {client.last_visit 
                              ? new Date(client.last_visit).toLocaleDateString('pt-BR')
                              : 'Sem registro'}
                          </div>

                          {days === null ? (
                            <Badge variant="outline" className="text-zinc-400 border-white/10 bg-white/5 text-[10px] py-0">
                              Novo / Sem compra
                            </Badge>
                          ) : days < 30 ? (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/20 bg-emerald-500/10 text-[10px] py-0">
                              Ativo ({days}d)
                            </Badge>
                          ) : days < 90 ? (
                            <Badge variant="outline" className="text-amber-400 border-amber-400/20 bg-amber-400/10 text-[10px] py-0">
                              Alerta ({days}d)
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-rose-400 border-rose-500/20 bg-rose-500/10 text-[10px] py-0">
                              Inativo ({days}d)
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reativar WhatsApp */}
                          <DispararN8NButton
                            clientId={client.id}
                            clientName={client.name}
                            phone={client.phone}
                          />

                          {/* Editar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingClient(client)
                              setFormError(null)
                              setIsEditOpen(true)
                            }}
                            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                            title="Editar Cliente"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>

                          {/* Deletar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(client.id, client.name)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Excluir Cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12 text-sm">
                    {searchTerm || statusFilter !== 'all' || stateFilter !== 'all'
                      ? 'Nenhum cliente encontrado com os filtros selecionados.'
                      : 'Nenhum cliente cadastrado na base ainda.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* 4. Modal de Adicionar Cliente (Completo com CNPJ, Cidade, Estado) */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Novo Cliente
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            {formError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Nome / Razão Social *</Label>
              <Input
                name="name"
                placeholder="Ex: Confecções Estilo Ltda"
                required
                disabled={formLoading}
                className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">CNPJ</Label>
                <Input
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  disabled={formLoading}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">WhatsApp / Telefone *</Label>
                <Input
                  name="phone"
                  placeholder="(83) 99999-9999"
                  required
                  disabled={formLoading}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs text-muted-foreground">Cidade</Label>
                <Input
                  name="city"
                  placeholder="Ex: João Pessoa"
                  disabled={formLoading}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Estado (UF)</Label>
                <Input
                  name="state"
                  placeholder="PB"
                  maxLength={2}
                  disabled={formLoading}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 uppercase text-center font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Data da Última Compra</Label>
              <Input
                type="date"
                name="lastVisit"
                defaultValue={new Date().toISOString().split('T')[0]}
                disabled={formLoading}
                className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                disabled={formLoading}
                className="hover:bg-white/5"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-primary text-black hover:bg-primary/90 font-semibold"
              >
                {formLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </div>
                ) : (
                  'Cadastrar Cliente'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 5. Modal de Editar Cliente */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-primary" />
              Editar Cliente
            </DialogTitle>
          </DialogHeader>

          {editingClient && (
            <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Nome / Razão Social *</Label>
                <Input
                  name="name"
                  defaultValue={editingClient.name}
                  required
                  disabled={formLoading}
                  className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">CNPJ</Label>
                  <Input
                    name="cnpj"
                    defaultValue={editingClient.cnpj || ''}
                    placeholder="00.000.000/0000-00"
                    disabled={formLoading}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 font-mono text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">WhatsApp / Telefone *</Label>
                  <Input
                    name="phone"
                    defaultValue={editingClient.phone}
                    required
                    disabled={formLoading}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cidade</Label>
                  <Input
                    name="city"
                    defaultValue={editingClient.city || ''}
                    disabled={formLoading}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Estado (UF)</Label>
                  <Input
                    name="state"
                    defaultValue={editingClient.state || ''}
                    maxLength={2}
                    disabled={formLoading}
                    className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 uppercase text-center font-bold"
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsEditOpen(false)}
                  disabled={formLoading}
                  className="hover:bg-white/5"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-primary text-black hover:bg-primary/90 font-semibold"
                >
                  {formLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    'Atualizar Dados'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
