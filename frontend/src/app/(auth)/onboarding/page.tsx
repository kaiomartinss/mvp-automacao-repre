'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { completeOnboarding } from '@/app/actions/auth'
import { Briefcase, ShieldCheck, User, Phone, Loader2, AlertCircle, ArrowRight } from 'lucide-react'

export default function OnboardingPage() {
  const [role, setRole] = useState<'representante' | 'admin'>('representante')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('role', role)

    try {
      const res = await completeOnboarding(formData)
      if (res?.error) {
        setError(res.error)
        setLoading(false)
      }
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return
      }
      setError('Ocorreu um erro ao salvar seu perfil. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <Card className="border-white/10 bg-[#12161A]/95 backdrop-blur-xl shadow-2xl relative overflow-hidden max-w-lg mx-auto">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />

      <CardHeader className="text-center pt-8 pb-4">
        {/* Step Badge */}
        <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold mb-3 tracking-wide uppercase">
          <span>Configuração Inicial • Etapa 2 de 2</span>
        </div>

        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Bem-vindo ao Winback Engine!
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1 max-w-sm mx-auto">
          Personalize sua conta para adaptarmos sua experiência no painel de reativação.
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* User Details */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Seu Nome Completo
              </label>
              <Input
                type="text"
                name="fullName"
                placeholder="Ex: Carlos Eduardo Martins"
                required
                disabled={loading}
                className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-primary" />
                WhatsApp de Contato (Opcional)
              </label>
              <Input
                type="tel"
                name="phone"
                placeholder="(00) 90000-0000"
                disabled={loading}
                className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20 h-10"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground block">
              Como você atuará no sistema?
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option: Representante */}
              <div
                onClick={() => setRole('representante')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  role === 'representante'
                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(0,230,118,0.15)] ring-1 ring-primary'
                    : 'bg-black/20 border-white/5 hover:border-white/20 text-muted-foreground hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    {role === 'representante' && (
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white">Representante</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Gerencio carteiras, disparo reativações e contato direto com clientes.
                  </p>
                </div>
              </div>

              {/* Option: Administrador */}
              <div
                onClick={() => setRole('admin')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  role === 'admin'
                    ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-indigo-400'
                    : 'bg-black/20 border-white/5 hover:border-white/20 text-muted-foreground hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    {role === 'admin' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-white">Administrador</h4>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    Acesso a relatórios executivos, métricas globais e configurações gerais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-4 bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_20px_rgba(0,230,118,0.25)] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Configurando sua conta...</span>
              </>
            ) : (
              <>
                <span>Concluir e Acessar o Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
