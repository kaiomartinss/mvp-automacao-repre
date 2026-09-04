"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function triggerN8NWebhook(clientId: string, clientName: string, phone: string) {
  const WEBHOOK_URL = "https://egging-hangout-acclaim.ngrok-free.dev/webhook/evolution-messages"

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
        message_sent: "Disparo via painel Web",
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
