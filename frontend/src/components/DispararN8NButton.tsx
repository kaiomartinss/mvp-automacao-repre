"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { triggerN8NWebhook } from "@/app/actions/n8n"
import { Loader2, MessageCircle, Send, CheckCircle2 } from "lucide-react"

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

  // Formatação amigável de telefone (ex: +55 (11) 99999-9999)
  const formattedPhone = phone
    ? phone.replace(/^55/, "").replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : "Não informado"

  const previewMessage = `Olá, ${clientName || "tudo bem"}! Notamos que faz algum tempo desde o seu último pedido com a gente. Preparamos condições especiais exclusivas para você esta semana. Gostaria de dar uma olhada nas novidades?`

  const handleDisparo = async () => {
    setLoading(true)
    const result = await triggerN8NWebhook(clientId, clientName, phone)
    
    if (result.success) {
      setSuccess(true)
      setOpen(false)
      setTimeout(() => setSuccess(false), 5000)
    } else {
      alert(`Não foi possível enviar a mensagem: ${result.error || "Verifique se o robô está ligado no seu computador."}`)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Mensagem Enviada!
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-medium transition-all"
          />
        }
      >
        <MessageCircle className="w-4 h-4" />
        Reativar no WhatsApp
      </DialogTrigger>

      <DialogContent className="sm:max-w-[460px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            Confirmar Envio pelo WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
            <div>
              <p className="font-medium text-foreground">{clientName || "Cliente"}</p>
              <p className="text-xs text-muted-foreground">{formattedPhone}</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Pronto para envio
            </span>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Mensagem que será enviada:</p>
            <div className="bg-[#1A2228] p-3.5 rounded-lg border border-white/10 text-xs leading-relaxed text-zinc-200 relative">
              <div className="absolute -top-1.5 left-4 w-3 h-3 bg-[#1A2228] border-t border-l border-white/10 rotate-45" />
              {previewMessage}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4 gap-2 sm:gap-0">
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
            type="button" 
            onClick={handleDisparo}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Confirmar e Enviar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
