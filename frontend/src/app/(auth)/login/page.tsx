'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login, signup } from '@/app/actions/auth'
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    if (mode === 'signup') {
      const confirmPassword = formData.get('confirmPassword') as string
      if (password !== confirmPassword) {
        setError('As senhas não coincidem.')
        return
      }
      if (password.length < 6) {
        setError('A senha deve conter no mínimo 6 caracteres.')
        return
      }
    }

    setLoading(true)

    try {
      if (mode === 'login') {
        const res = await login(formData)
        if (res?.error) {
          setError(res.error)
          setLoading(false)
        }
      } else {
        const res = await signup(formData)
        if (res?.error) {
          setError(res.error)
          setLoading(false)
        } else if (res?.success) {
          setSuccessMessage(res.message || 'Conta criada com sucesso!')
          setLoading(false)
        }
      }
    } catch (err: any) {
      // Redirection in Next.js Server Actions throws NEXT_REDIRECT which shouldn't be caught as error
      if (err?.message?.includes('NEXT_REDIRECT')) {
        return
      }
      setError('Ocorreu um erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <Card className="border-white/10 bg-[#12161A]/90 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/80 via-primary to-emerald-400" />

      <CardHeader className="text-center pt-8 pb-4">
        {/* Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,230,118,0.2)]">
          <span className="font-extrabold text-primary text-xl">W</span>
        </div>

        <CardTitle className="text-2xl font-bold tracking-tight text-white">
          Winback Engine
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm mt-1">
          {mode === 'login'
            ? 'Acesse seu painel de reativação comercial'
            : 'Crie sua conta para começar a recuperar clientes'}
        </CardDescription>

        {/* Mode Switcher Buttons */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 mt-6">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setError(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-primary text-black shadow-sm font-bold'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setError(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-primary text-black shadow-sm font-bold'
                : 'text-muted-foreground hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>
      </CardHeader>

      <CardContent className="pb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Feedback Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs leading-relaxed animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              E-mail
            </label>
            <Input
              type="email"
              name="email"
              placeholder="seu@empresa.com"
              required
              disabled={loading}
              className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20 h-10"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Senha
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20 h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up mode only) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Confirmar Senha
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                required
                disabled={loading}
                className="bg-black/30 border-white/10 text-white placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-primary/20 h-10"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-black font-semibold shadow-[0_0_15px_rgba(0,230,118,0.25)] transition-all cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </div>
            ) : mode === 'login' ? (
              'Entrar no Painel'
            ) : (
              'Criar Minha Conta'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            Ambiente Seguro • Criptografia ponta a ponta
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
