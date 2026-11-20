'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addOrder } from '@/app/actions/clients'
import {
  Receipt,
  CurrencyDollar,
  CalendarBlank,
  CircleNotch,
  WarningCircle,
  CheckCircle,
} from '@phosphor-icons/react'

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
      setSuccess(res.message || 'Venda registrada com sucesso.')
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(null)
        if (onSuccess) onSuccess()
      }, 1400)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-zinc-300" weight="regular" />
            Registrar venda
          </DialogTitle>
          <DialogDescription>
            O cliente retorna automaticamente para o status ativo na carteira.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" weight="fill" />
              <span>{success}</span>
            </div>
          )}

          <div className="bg-[#0C0D0F] p-3.5 rounded-lg border border-white/[0.08]">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-zinc-500">
              Cliente
            </p>
            <p className="font-medium text-sm text-[#F4F4F5] mt-1">{clientName}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount" className="text-xs text-zinc-300 flex items-center gap-1.5">
              <CurrencyDollar className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
              Valor da venda (R$) *
            </Label>
            <Input
              id="amount"
              name="amount"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 1500,00"
              required
              disabled={loading || !!success}
              className="font-mono tabular-nums"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="orderDate" className="text-xs text-zinc-300 flex items-center gap-1.5">
              <CalendarBlank className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
              Data do pedido
            </Label>
            <Input
              id="orderDate"
              name="orderDate"
              type="date"
              defaultValue={todayStr}
              required
              disabled={loading || !!success}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-zinc-300 hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !!success}
              className="bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium cursor-pointer active:scale-[0.985] transition-all"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                  Salvando...
                </span>
              ) : (
                'Confirmar venda'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
