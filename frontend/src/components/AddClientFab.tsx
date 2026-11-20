"use client"

import { useState } from "react"
import {
  UserPlus,
  User,
  Phone,
  CalendarBlank,
  Buildings,
  MapPin,
  CircleNotch,
  WarningCircle,
} from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
        <DialogTrigger
          render={
            <button className="inline-flex items-center gap-2 h-10 bg-[#F4F4F5] hover:bg-white active:scale-[0.985] transition-all text-[#0C0D0F] font-medium px-4 rounded-lg cursor-pointer whitespace-nowrap" />
          }
        >
          <UserPlus className="w-4 h-4" weight="bold" />
          <span className="text-sm">Adicionar cliente</span>
        </DialogTrigger>
      </Magnet>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-zinc-300" weight="regular" />
            Novo cliente
          </DialogTitle>
          <DialogDescription>
            Cadastre o cliente para incluir na rotina de acompanhamento e reativação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name" className="text-xs text-zinc-300">
              Nome / Razão social *
            </Label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                weight="regular"
              />
              <Input
                id="name"
                name="name"
                placeholder="Ex: Confecções Estilo Ltda"
                className="pl-9"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cnpj" className="text-xs text-zinc-300">
                CNPJ
              </Label>
              <div className="relative">
                <Buildings
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                  weight="regular"
                />
                <Input
                  id="cnpj"
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  className="pl-9 font-mono text-xs"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-xs text-zinc-300">
                WhatsApp / Telefone *
              </Label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                  weight="regular"
                />
                <Input
                  id="phone"
                  name="phone"
                  placeholder="(83) 99999-9999"
                  className="pl-9"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="city" className="text-xs text-zinc-300">
                Cidade
              </Label>
              <div className="relative">
                <MapPin
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                  weight="regular"
                />
                <Input
                  id="city"
                  name="city"
                  placeholder="Ex: João Pessoa"
                  className="pl-9"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="state" className="text-xs text-zinc-300">
                UF
              </Label>
              <Input
                id="state"
                name="state"
                placeholder="PB"
                maxLength={2}
                className="text-center uppercase font-mono"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lastVisit" className="text-xs text-zinc-300">
              Data da última compra
            </Label>
            <div className="relative">
              <CalendarBlank
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none"
                weight="regular"
              />
              <Input
                id="lastVisit"
                name="lastVisit"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="pl-9"
                disabled={loading}
              />
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-zinc-300 hover:bg-white/5 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium active:scale-[0.985] transition-all cursor-pointer"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                  Salvando...
                </span>
              ) : (
                "Salvar cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
