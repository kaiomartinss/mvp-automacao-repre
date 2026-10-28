"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function triggerN8NWebhook(
  clientId: string, 
  clientName: string, 
  phone: string,
  customMessage?: string
) {
  const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL

  if (!WEBHOOK_URL) {
    console.error("N8N_WEBHOOK_URL não está configurada nas variáveis de ambiente.")
    return { 
      success: false, 
      error: "URL do webhook do n8n não está configurada (N8N_WEBHOOK_URL ausente no .env)." 
    }
  }

  const messageToSend = customMessage?.trim() || `Olá, ${clientName || "tudo bem"}! Notamos que faz algum tempo desde o seu último pedido com a gente. Preparamos condições especiais exclusivas para você esta semana. Gostaria de dar uma olhada nas novidades?`

  try {
    // 1. Enviar requisição para o N8N
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId,
        name: clientName,
        phone,
        message: messageToSend,
        action: "winback_campaign"
      }),
    })

    if (!response.ok) {
      throw new Error(`Falha no N8N: ${response.statusText}`)
    }

    // 2. Gravar o disparo no Supabase (reactivation_logs)
    const supabase = await createClient()
    const { error: dbError } = await supabase.from('reactivation_logs').insert([
      {
        client_id: clientId,
        message_sent: messageToSend,
        sent_at: new Date().toISOString(),
        status: "enviado"
      }
    ])

    if (dbError) {
      console.error("Erro ao gravar log no Supabase:", dbError)
      // Mesmo se falhar o log, o disparo ocorreu, então podemos não travar o processo.
    }

    revalidatePath("/") // Atualiza os dados da Dashboard
    return { success: true }
  } catch (error: any) {
    console.error("Erro na ação de disparo N8N:", error)
    return { success: false, error: error.message }
  }
}
