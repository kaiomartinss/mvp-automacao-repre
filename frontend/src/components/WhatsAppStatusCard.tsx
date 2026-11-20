'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { checkWhatsAppStatus, disconnectWhatsApp, getWhatsAppQrCode } from '@/app/actions/evolution'
import {
  DeviceMobile,
  ArrowsClockwise,
  QrCode,
  CheckCircle,
  Warning,
  SignOut,
  CircleNotch,
} from '@phosphor-icons/react'

export function WhatsAppStatusCard() {
  const [loading, setLoading] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
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
    setDisconnecting(true)
    await disconnectWhatsApp()
    setDisconnecting(false)
    setConfirmDisconnect(false)
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
    <section className="rounded-xl border border-white/[0.08] bg-[#111215] overflow-hidden">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg border border-white/[0.08] bg-[#0C0D0F] flex items-center justify-center shrink-0">
              <DeviceMobile className="w-4 h-4 text-zinc-300" weight="regular" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">
                Conexão WhatsApp (Evolution API)
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Pareie seu número comercial para disparar mensagens de reativação pelo painel.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {status === 'connected' && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                Conectado
              </span>
            )}
            {(status === 'disconnected' || status === 'connecting') && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Aguardando QR
              </span>
            )}
            {status === 'offline' && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Servidor offline
              </span>
            )}
            {status === 'idle' && (
              <span className="inline-flex items-center gap-2 font-mono text-xs text-zinc-500">
                <CircleNotch className="w-3.5 h-3.5 animate-spin" weight="bold" />
                Verificando
              </span>
            )}
          </div>
        </div>

        {/* Status: Conectado */}
        {status === 'connected' && (
          <div className="p-4 rounded-lg bg-[#0C0D0F] border border-white/[0.08] border-l-2 border-l-[#00E676] flex items-start gap-3">
            <CheckCircle className="w-4 h-4 text-[#00E676] shrink-0 mt-0.5" weight="fill" />
            <div>
              <p className="text-sm font-medium text-[#F4F4F5]">
                Instância ativa:{' '}
                <span className="font-mono text-xs text-zinc-300">{instanceName}</span>
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                Sessão autenticada e pronta para realizar disparos diretamente pela fila de reativação.
              </p>
            </div>
          </div>
        )}

        {/* Status: Desconectado com QR Code */}
        {(status === 'disconnected' || status === 'connecting') && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 p-4 rounded-lg bg-[#0C0D0F] border border-white/[0.08] border-l-2 border-l-amber-400 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#F4F4F5]">
                <QrCode className="w-4 h-4 text-amber-400" weight="regular" />
                <span>Escaneie o código para conectar</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-zinc-400 text-xs leading-relaxed">
                <li>Abra o WhatsApp no seu celular</li>
                <li>
                  Acesse <strong className="text-zinc-200 font-medium">Aparelhos conectados</strong> &gt;{' '}
                  <strong className="text-zinc-200 font-medium">Conectar aparelho</strong>
                </li>
                <li>Aponte a câmera para o QR Code ao lado</li>
              </ol>
            </div>

            <div className="md:col-span-5 flex justify-center">
              {qrcode ? (
                <div className="flex flex-col items-center p-3.5 bg-white rounded-lg border border-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrcode}
                    alt="QR Code de pareamento do WhatsApp"
                    className="w-44 h-44 object-contain"
                  />
                  <span className="text-[10px] text-zinc-600 mt-1.5 font-mono">
                    Atualize se expirar
                  </span>
                </div>
              ) : (
                <div className="w-full p-6 rounded-lg bg-[#0C0D0F] border border-white/[0.08] flex flex-col items-center justify-center text-center gap-2">
                  <CircleNotch className="w-5 h-5 animate-spin text-zinc-400" weight="bold" />
                  <p className="text-xs text-zinc-400">Gerando QR Code na Evolution API...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status: Offline */}
        {status === 'offline' && (
          <div className="p-4 rounded-lg bg-[#0C0D0F] border border-white/[0.08] border-l-2 border-l-red-400 space-y-2.5">
            <div className="flex items-center gap-2 text-red-400 font-medium text-xs">
              <Warning className="w-4 h-4 shrink-0" weight="regular" />
              <span>Servidor WhatsApp inacessível</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {errorMessage ||
                'A Evolution API não respondeu em http://localhost:8080. Inicie o container via terminal:'}
            </p>
            <div className="bg-[#111215] px-3 py-2 rounded-md text-xs font-mono text-zinc-200 select-all border border-white/[0.08]">
              docker compose up -d
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-[#0C0D0F]/55 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2.5">
        <Button
          type="button"
          onClick={fetchStatus}
          disabled={loading || disconnecting}
          variant="outline"
          size="sm"
          className="border-white/12 bg-white/[0.03] hover:bg-white/[0.07] text-zinc-200 text-xs gap-1.5 cursor-pointer"
        >
          {loading ? (
            <CircleNotch className="w-3.5 h-3.5 animate-spin" weight="bold" />
          ) : (
            <ArrowsClockwise className="w-3.5 h-3.5" weight="regular" />
          )}
          <span>Atualizar status</span>
        </Button>

        <div className="flex items-center gap-2">
          {(status === 'disconnected' || status === 'connecting') && (
            <Button
              type="button"
              onClick={handleRefreshQr}
              disabled={loading}
              size="sm"
              className="bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium text-xs gap-1.5 active:scale-[0.985] transition-all cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" weight="bold" />
              <span>Novo QR Code</span>
            </Button>
          )}

          {status === 'connected' && !confirmDisconnect && (
            <Button
              type="button"
              onClick={() => setConfirmDisconnect(true)}
              disabled={disconnecting}
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 gap-1.5 cursor-pointer"
            >
              <SignOut className="w-3.5 h-3.5" weight="regular" />
              <span>Desconectar</span>
            </Button>
          )}

          {status === 'connected' && confirmDisconnect && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Encerrar sessão?</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDisconnect(false)}
                disabled={disconnecting}
                className="text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                size="sm"
                className="bg-red-500/90 hover:bg-red-500 text-white text-xs gap-1.5 cursor-pointer"
              >
                {disconnecting ? (
                  <CircleNotch className="w-3.5 h-3.5 animate-spin" weight="bold" />
                ) : (
                  <SignOut className="w-3.5 h-3.5" weight="bold" />
                )}
                <span>Confirmar</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
