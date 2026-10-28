'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addOrder } from '@/app/actions/clients'
import { ShoppingBag, DollarSign, Calendar, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

interface RegisterOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  onSuccess?: () => void
}

export function RegisterOrderModal({
  open,
  onOpenChange,
  clientId,
  clientName,
  onSuccess,
}: RegisterOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('clientId', clientId)

    const res = await addOrder(formData)
    setLoading(false)

    if (res.error) {
      setError(res.error)
    } else {
      setSuccess(res.message || 'Venda registrada com sucesso!')
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(null)
        if (onSuccess) onSuccess()
      }, 1500)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            Registrar Nova Venda / Pedido
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
            <p className="text-xs text-muted-foreground">Cliente Reativado:</p>
            <p className="font-semibold text-white mt-0.5">{clientName}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              Valor da Venda (R$) *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 1500,00"
              required
              disabled={loading || !!success}
              className="bg-black/30 border-white/10 text-white font-mono focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="orderDate" className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Data do Pedido
            </Label>
            <Input
              id="orderDate"
              name="orderDate"
              type="date"
              defaultValue={todayStr}
              required
              disabled={loading || !!success}
              className="bg-black/30 border-white/10 text-white focus-visible:border-emerald-400 focus-visible:ring-emerald-400/20 h-10"
            />
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
            * Ao registrar a venda, este cliente é automaticamente marcado como <strong>ativo</strong> e a receita soma nas métricas de conversão do painel.
          </p>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="hover:bg-white/5"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !!success}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando venda...</span>
                </div>
              ) : (
                'Confirmar Venda'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
