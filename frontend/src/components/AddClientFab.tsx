"use client"

import { useState } from "react"
import { UserPlus, User, Phone, Calendar, Building2, MapPin, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addClient } from "@/app/actions/clients"

import { Magnet } from "@/components/reactbits/Magnet"

export function AddClientFab() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const res = await addClient(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Magnet strength={0.14}>
        <DialogTrigger render={
          <button className="flex items-center gap-2 bg-[#F4F4F5] hover:bg-white active:scale-[0.985] transition-all text-[#0C0D0F] font-medium px-4 py-2.5 rounded-lg cursor-pointer whitespace-nowrap" />
        }>
          <UserPlus className="w-4 h-4" />
          <span className="text-sm">Adicionar Cliente</span>
        </DialogTrigger>
      </Magnet>

      <DialogContent className="sm:max-w-[500px] border-white/[0.1] bg-[#111215] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo Cliente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-muted-foreground">Nome / Razão Social *</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name"
                name="name" 
                placeholder="Ex: Confecções Estilo Ltda" 
                className="pl-9 bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cnpj" className="text-xs text-muted-foreground">CNPJ</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="cnpj"
                  name="cnpj" 
                  placeholder="00.000.000/0000-00" 
                  className="pl-9 bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 font-mono text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-muted-foreground">WhatsApp / Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone"
                  name="phone" 
                  placeholder="(83) 99999-9999" 
                  className="pl-9 bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="city" className="text-xs text-muted-foreground">Cidade</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="city"
                  name="city" 
                  placeholder="Ex: João Pessoa" 
                  className="pl-9 bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="state" className="text-xs text-muted-foreground">Estado (UF)</Label>
              <Input 
                id="state"
                name="state" 
                placeholder="Ex: PB" 
                maxLength={2}
                className="bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10 text-center"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastVisit" className="text-xs text-muted-foreground">Data da Última Compra</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="lastVisit" 
                name="lastVisit"
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="pl-9 bg-black/50 border-white/10 text-white focus-visible:ring-primary h-10"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)} 
              disabled={loading}
              className="hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-primary text-black hover:bg-primary/90 font-semibold"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                "Salvar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
