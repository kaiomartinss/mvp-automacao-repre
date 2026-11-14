'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { checkWhatsAppStatus, disconnectWhatsApp, getWhatsAppQrCode } from '@/app/actions/evolution'
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  Loader2,
  Server
} from 'lucide-react'

export function WhatsAppStatusCard() {
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'offline' | 'idle'>('idle')
  const [instanceName, setInstanceName] = useState('winback')
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setErrorMessage(null)
    const res = await checkWhatsAppStatus()
    setLoading(false)

    setStatus(res.status)
    setInstanceName(res.instanceName)
    setQrcode(res.qrcode || null)
    if (res.error) {
      setErrorMessage(res.error)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleDisconnect = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp desta sessão?')) return
    setDisconnecting(true)
    await disconnectWhatsApp()
    setDisconnecting(false)
    await fetchStatus()
  }

  const handleRefreshQr = async () => {
    setLoading(true)
    const qrRes = await getWhatsAppQrCode()
    if (qrRes.qrcode) {
      setQrcode(qrRes.qrcode)
      setStatus('disconnected')
    } else {
      await fetchStatus()
    }
    setLoading(false)
  }

  return (
    <Card className="border-white/[0.08] bg-[#111215] shadow-none flex flex-col justify-between overflow-hidden relative">
      
      <div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              Conexão WhatsApp (Evolution API)
            </CardTitle>
            
            {status === 'connected' && (
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 gap-1.5 px-2.5 py-0.5 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Conectado
              </Badge>
            )}

            {(status === 'disconnected' || status === 'connecting') && (
              <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 gap-1.5 px-2.5 py-0.5 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Aguardando QR Code
              </Badge>
            )}

            {status === 'offline' && (
              <Badge className="bg-destructive/15 text-destructive border border-destructive/30 gap-1.5 px-2.5 py-0.5 text-xs font-medium">
                <WifiOff className="w-3 h-3" />
                Servidor Offline
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Pareie seu número de WhatsApp para disparar as mensagens de reativação comercial.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {/* Status: Conectado */}
          {status === 'connected' && (
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Instância Ativa: <span className="text-emerald-400 font-mono text-xs">{instanceName}</span></h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    O robô está pronto para disparar mensagens de reativação diretamente pelo painel Web.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status: Desconectado com QR Code */}
          {(status === 'disconnected' || status === 'connecting') && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/15 text-xs text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 font-medium text-amber-400">
                  <QrCode className="w-4 h-4" />
                  <span>Escaneie para conectar:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                  <li>Abra o WhatsApp no seu smartphone</li>
                  <li>Toque em <strong className="text-white">Aparelhos conectados</strong> &gt; <strong className="text-white">Conectar aparelho</strong></li>
                  <li>Aponte a câmera para o QR Code abaixo</li>
                </ol>
              </div>

              {qrcode ? (
                <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner max-w-[240px] mx-auto border-2 border-primary/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={qrcode} 
                    alt="QR Code WhatsApp" 
                    className="w-48 h-48 object-contain"
                  />
                  <span className="text-[10px] text-zinc-600 mt-1 font-mono">Atualize se expirar</span>
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-black/30 border border-white/5 flex flex-col items-center justify-center text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">Gerando QR Code na Evolution API...</p>
                </div>
              )}
            </div>
          )}

          {/* Status: Offline / Servidor Inativo */}
          {status === 'offline' && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
              <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Servidor WhatsApp Inacessível</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                {errorMessage || 'A Evolution API não está respondendo em http://localhost:8080. Inicie o container no Docker via terminal:'}
              </p>
              <div className="bg-black/40 p-2 rounded text-[11px] font-mono text-emerald-400 select-all border border-white/5">
                docker compose up -d
              </div>
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-6 pt-2 flex flex-col sm:flex-row gap-2 border-t border-white/5 mt-4">
        <Button
          type="button"
          onClick={fetchStatus}
          disabled={loading || disconnecting}
          variant="outline"
          size="sm"
          className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs gap-1.5 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          <span>Atualizar Status</span>
        </Button>

        {(status === 'disconnected' || status === 'connecting') && (
          <Button
            type="button"
            onClick={handleRefreshQr}
            disabled={loading}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-semibold text-xs gap-1.5 cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Novo QR Code</span>
          </Button>
        )}

        {status === 'connected' && (
          <Button
            type="button"
            onClick={handleDisconnect}
            disabled={disconnecting}
            variant="destructive"
            size="sm"
            className="text-xs gap-1.5 cursor-pointer"
          >
            {disconnecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Desconectar</span>
          </Button>
        )}
      </div>
    </Card>
  )
}
