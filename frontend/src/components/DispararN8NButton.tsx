"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { triggerN8NWebhook } from "@/app/actions/n8n"
import { PaperPlaneTilt, CheckCircle, CircleNotch, WarningCircle, Sparkle } from "@phosphor-icons/react"

export function DispararN8NButton({ 
  clientId, 
  clientName, 
  phone 
}: { 
  clientId: string, 
  clientName: string, 
  phone: string 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Formatação amigável de telefone (ex: +55 (11) 99999-9999)
  const formattedPhone = phone
    ? phone.replace(/^55/, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : "Não informado"

  const templates = [
    {
      label: "Condição Especial",
      text: `Olá, ${clientName || "tudo bem"}! Notamos que faz algum tempo desde o seu último pedido com a gente. Preparamos condições especiais exclusivas para você esta semana. Gostaria de dar uma olhada nas novidades?`
    },
    {
      label: "Reposição de Estoque",
      text: `Olá, ${clientName || "tudo bem"}! Passando para checar como está o seu estoque dos nossos produtos. Precisa de reposição para os próximos dias?`
    },
    {
      label: "Novidades do Catálogo",
      text: `Olá, ${clientName || "tudo bem"}! Acabamos de receber novos itens no catálogo que combinam bastante com a sua região. Posso te enviar o PDF com os lançamentos?`
    }
  ]

  const [message, setMessage] = useState(templates[0].text)

  const handleDisparo = async () => {
    setLoading(true)
    setErrorMessage(null)
    const result = await triggerN8NWebhook(clientId, clientName, phone, message)
    
    if (result.success) {
      setSuccess(true)
      setOpen(false)
      setTimeout(() => setSuccess(false), 5000)
    } else {
      setErrorMessage(result.error || "Não foi possível enviar a mensagem. Verifique a Evolution API e o n8n.")
    }
    setLoading(false)
  }

  if (success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-200 font-medium bg-white/[0.06] px-2.5 py-1 rounded-md border border-white/10">
        <CheckCircle className="w-3.5 h-3.5 text-[#00E676]" weight="fill" />
        Enviada
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val)
      if (val) {
        setErrorMessage(null)
        setMessage(templates[0].text)
      }
    }}>
      <DialogTrigger
        render={
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/12 bg-white/[0.04] text-zinc-100 hover:bg-[#F4F4F5] hover:text-[#0C0D0F] hover:border-transparent text-xs font-medium active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          />
        }
      >
        <PaperPlaneTilt className="w-3.5 h-3.5" weight="regular" />
        <span>Reativar</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] border-white/[0.1] bg-[#111215] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2 text-[#F4F4F5]">
            <PaperPlaneTilt className="w-4 h-4 text-[#00E676]" weight="regular" />
            Personalizar & Enviar WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs">
              <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between items-center bg-[#0C0D0F] p-3.5 rounded-lg border border-white/[0.08] text-sm">
            <div>
              <p className="font-medium text-[#F4F4F5]">{clientName || "Cliente"}</p>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">{formattedPhone}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
              Pronto
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <Sparkle className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
                Templates Rápidos
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(tpl.text)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                    message === tpl.text
                      ? "bg-[#F4F4F5] border-transparent text-[#0C0D0F] font-medium"
                      : "bg-[#0C0D0F] border-white/[0.08] text-zinc-400 hover:text-zinc-100 hover:border-white/20"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-300">Mensagem que será enviada (editável):</p>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#0C0D0F] p-3 rounded-lg border border-white/12 text-xs leading-relaxed text-zinc-200 focus:outline-none focus:border-white/40 focus:ring-2 focus:ring-emerald-400/20 resize-none"
              placeholder="Digite a mensagem personalizada..."
            />
          </div>
        </div>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => setOpen(false)}
            disabled={loading}
            className="hover:bg-white/5 text-zinc-300"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleDisparo}
            disabled={loading || !message.trim()}
            className="bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium gap-2 cursor-pointer active:scale-[0.985] transition-all"
          >
            {loading ? (
              <>
                <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                Enviando...
              </>
            ) : (
              <>
                <PaperPlaneTilt className="w-4 h-4" weight="bold" />
                Confirmar e Disparar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
