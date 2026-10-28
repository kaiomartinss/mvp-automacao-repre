'use server'

interface EvolutionStatusResponse {
  connected: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'offline'
  instanceName: string
  qrcode?: string | null
  pairingCode?: string | null
  error?: string | null
}

const getApiConfig = () => {
  const apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080'
  const apiKey = process.env.EVOLUTION_API_KEY || 'ChaveMestra123456'
  const instanceName = process.env.EVOLUTION_INSTANCE_NAME || 'winback'
  return { apiUrl: apiUrl.replace(/\/$/, ''), apiKey, instanceName }
}

export async function checkWhatsAppStatus(): Promise<EvolutionStatusResponse> {
  const { apiUrl, apiKey, instanceName } = getApiConfig()

  try {
    // 1. Tenta verificar o estado de conexão da instância
    const res = await fetch(`${apiUrl}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
      cache: 'no-store',
    })

    if (res.status === 404) {
      // Instância ainda não foi criada, tenta criar
      return await createWhatsAppInstance()
    }

    if (!res.ok) {
      return {
        connected: false,
        status: 'offline',
        instanceName,
        error: `Evolution API retornou status HTTP ${res.status}: ${res.statusText}`,
      }
    }

    const data = await res.json()
    const state = data?.instance?.state || data?.state

    if (state === 'open') {
      return {
        connected: true,
        status: 'connected',
        instanceName,
      }
    }

    // Se estiver fechado ou conectando, busca o QR code para reconectar
    const connectData = await getWhatsAppQrCode()
    return {
      connected: false,
      status: state === 'connecting' ? 'connecting' : 'disconnected',
      instanceName,
      qrcode: connectData.qrcode,
      pairingCode: connectData.pairingCode,
    }
  } catch (error: any) {
    return {
      connected: false,
      status: 'offline',
      instanceName,
      error: `Não foi possível conectar ao servidor WhatsApp (Evolution API em ${apiUrl}). Verifique se o Docker está ativo.`,
    }
  }
}

export async function createWhatsAppInstance(): Promise<EvolutionStatusResponse> {
  const { apiUrl, apiKey, instanceName } = getApiConfig()

  try {
    const res = await fetch(`${apiUrl}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey,
      },
      body: JSON.stringify({
        instanceName,
        token: `${instanceName}-secret-token`,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
      cache: 'no-store',
    })

    if (!res.ok && res.status !== 403) {
      const errJson = await res.json().catch(() => null)
      return {
        connected: false,
        status: 'offline',
        instanceName,
        error: errJson?.response?.message?.[0] || `Erro ao inicializar instância: ${res.statusText}`,
      }
    }

    // Após criar, busca o QR Code
    const qrData = await getWhatsAppQrCode()
    return {
      connected: false,
      status: 'disconnected',
      instanceName,
      qrcode: qrData.qrcode,
      pairingCode: qrData.pairingCode,
    }
  } catch (err: any) {
    return {
      connected: false,
      status: 'offline',
      instanceName,
      error: err.message || 'Falha ao criar instância da Evolution API.',
    }
  }
}

export async function getWhatsAppQrCode(): Promise<{ qrcode?: string | null; pairingCode?: string | null }> {
  const { apiUrl, apiKey, instanceName } = getApiConfig()

  try {
    const res = await fetch(`${apiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return { qrcode: null }
    }

    const data = await res.json()
    // Evolution API pode retornar base64 diretamente ou no campo code
    const rawQr = data?.base64 || data?.qrcode?.base64 || data?.code
    const qrcode = rawQr?.startsWith('data:image') ? rawQr : rawQr ? `data:image/png;base64,${rawQr}` : null

    return {
      qrcode,
      pairingCode: data?.pairingCode || null,
    }
  } catch {
    return { qrcode: null }
  }
}

export async function disconnectWhatsApp(): Promise<{ success: boolean; message?: string; error?: string }> {
  const { apiUrl, apiKey, instanceName } = getApiConfig()

  try {
    const res = await fetch(`${apiUrl}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': apiKey,
      },
    })

    if (!res.ok) {
      return { success: false, error: 'Falha ao desconectar instância no WhatsApp.' }
    }

    return { success: true, message: 'WhatsApp desconectado com sucesso.' }
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao comunicar com a Evolution API.' }
  }
}
