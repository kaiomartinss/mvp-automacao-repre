"use client"

import { useState } from "react"
import { UserPlus, User, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function AddClientFab() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    lastVisit: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Formatador de Telefone: Remove tudo que não for número
      let cleanPhone = formData.phone.replace(/\D/g, '')
      // Se tiver 11 ou 10 dígitos (DDD + Número), adiciona o '55' do Brasil
      if (cleanPhone.length === 11 || cleanPhone.length === 10) {
        cleanPhone = '55' + cleanPhone
      }

      const supabase = createClient()
      const { data: newClient, error: clientError } = await supabase.from('clients').insert([
        { 
          name: formData.name, 
          phone: cleanPhone
        }
      ]).select('id').single()
      
      if (clientError) throw clientError

      // Insere um pedido fictício para registrar a 'última visita' com o valor 0
      if (newClient && formData.lastVisit) {
        const { error: orderError } = await supabase.from('orders').insert([
          {
            client_id: newClient.id,
            total_amount: 0,
            order_date: new Date(formData.lastVisit).toISOString()
          }
        ])
        
        if (orderError) throw orderError
      }
      
      setOpen(false)
      window.location.reload()
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err)
      alert("Erro ao adicionar cliente. Verifique se as tabelas 'clients' e 'orders' existem.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-all text-primary-foreground font-semibold px-5 py-2.5 rounded-md shadow-sm" />}>
        <UserPlus className="w-4 h-4" />
        <span className="text-sm">Adicionar Cliente</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium tracking-tight">Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground text-xs">Nome do Cliente</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="name" 
                placeholder="Ex: Loja do João" 
                className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground text-xs">WhatsApp / Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="phone" 
                placeholder="Ex: 11999999999" 
                className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastVisit" className="text-muted-foreground text-xs">Data da Última Visita</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                id="lastVisit" 
                type="date"
                className="pl-9 bg-black/50 border-white/10 focus-visible:ring-primary text-foreground"
                value={formData.lastVisit}
                onChange={e => setFormData({...formData, lastVisit: e.target.value})}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5 hover:text-foreground">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium">
              {loading ? "Salvando..." : "Salvar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
