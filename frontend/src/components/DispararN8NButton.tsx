"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { triggerN8NWebhook } from "@/app/actions/n8n"
import { Loader2, MessageCircle, Send, CheckCircle2, Sparkles, AlertCircle } from "lucide-react"

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
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Mensagem Enviada!
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

      <DialogContent className="sm:max-w-[520px] border-white/10 bg-[#0B0E11] text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
            Personalizar & Enviar WhatsApp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
            <div>
              <p className="font-medium text-foreground">{clientName || "Cliente"}</p>
              <p className="text-xs text-muted-foreground">{formattedPhone}</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              Pronto para envio
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Templates Rápidos:
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
                      ? "bg-primary/15 border-primary text-primary font-medium"
                      : "bg-white/5 border-white/5 text-muted-foreground hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Mensagem que será enviada (você pode editar):</p>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#1A2228] p-3 rounded-lg border border-white/10 text-xs leading-relaxed text-zinc-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
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
            className="hover:bg-white/5"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleDisparo}
            disabled={loading || !message.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium gap-2 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando via Robô...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Confirmar e Disparar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
