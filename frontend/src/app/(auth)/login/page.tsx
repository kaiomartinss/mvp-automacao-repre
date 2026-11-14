'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Eye,
  EyeSlash,
  WarningCircle,
} from '@phosphor-icons/react'
import { login, signup } from '@/app/actions/auth'
import { DotGrid } from '@/components/reactbits/DotGrid'
import { SplitText } from '@/components/reactbits/SplitText'
import { DecryptedText } from '@/components/reactbits/DecryptedText'
import { Magnet } from '@/components/reactbits/Magnet'

const SPRING_TRANSITION = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

  function switchMode(nextMode: 'login' | 'signup') {
    if (nextMode === mode) return
    setMode(nextMode)
    setError(null)
    setSuccessMessage(null)
  }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      // Redirection in Next.js Server Actions throws NEXT_REDIRECT which shouldn't be caught as error
      if (message.includes('NEXT_REDIRECT')) {
        return
      }
      setError('Ocorreu um erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Stage (Preymaker-inspired monochrome + React Bits DotGrid & SplitText) */}
      <section className="relative hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#0C0D0F]">
        <DotGrid
          dotSize={1.5}
          gap={30}
          baseColor="rgba(244, 244, 245, 0.13)"
          activeColor="rgba(0, 230, 118, 0.72)"
          proximity={140}
        />

        {/* Top Brand Wordmark */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#F4F4F5] text-[#0C0D0F] flex items-center justify-center font-bold text-sm tracking-tighter">
              W
            </div>
            <DecryptedText
              text="WINBACK ENGINE"
              className="font-mono text-xs tracking-[0.2em] text-zinc-300 uppercase"
            />
          </div>
          <span className="font-mono text-xs text-zinc-500">
            Operação Comercial
          </span>
        </header>

        {/* Center Editorial Headline */}
        <div className="relative z-10 max-w-2xl my-auto py-12">
          <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.08] text-[#F4F4F5]">
            <SplitText text="Recupere receita" delay={0.05} />
            <br />
            <span className="italic font-normal text-zinc-300 inline-block pb-1">
              <SplitText text="inativa com precisão." delay={0.22} />
            </span>
          </h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease: EASE_OUT_EXPO }}
            className="mt-6 text-base xl:text-lg text-zinc-400 leading-relaxed max-w-[46ch]"
          >
            Identifique clientes sem compra recente e conduza abordagens no WhatsApp antes que troquem de fornecedor.
          </motion.p>
        </div>

        {/* Bottom Architectural Grid */}
        <footer className="relative z-10 grid grid-cols-2 gap-8 pt-8 border-t border-white/[0.08] max-w-xl">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-500">
              Carteira
            </p>
            <p className="mt-2 text-sm text-zinc-200 leading-snug">
              Classificação automática por ciclo de recompra e inatividade.
            </p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-500">
              Execução
            </p>
            <p className="mt-2 text-sm text-zinc-200 leading-snug">
              Disparos contextualizados conectados ao seu número comercial.
            </p>
          </div>
        </footer>
      </section>

      {/* Right Authentication Column */}
      <main className="lg:col-span-5 flex flex-col justify-between bg-[#111215] lg:border-l border-white/[0.08] px-6 py-8 sm:px-12 lg:px-14 xl:px-16 min-h-[100dvh]">
        {/* Mobile Compact Header */}
        <div className="flex lg:hidden items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#F4F4F5] text-[#0C0D0F] flex items-center justify-center font-bold text-xs">
              W
            </div>
            <span className="font-mono text-xs tracking-[0.18em] text-zinc-200 uppercase">
              Winback Engine
            </span>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto py-8">
          {/* Segmented Mode Switcher (transitions.dev layoutId spring morph) */}
          <div
            role="tablist"
            aria-label="Modo de autenticação"
            className="relative grid grid-cols-2 p-1 rounded-lg bg-[#0C0D0F] border border-white/[0.08] mb-10"
          >
            {(['login', 'signup'] as const).map((tab) => {
              const active = mode === tab
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchMode(tab)}
                  className={`relative z-10 py-2 text-xs font-medium tracking-wide transition-colors cursor-pointer ${
                    active ? 'text-[#0C0D0F]' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="auth-mode-indicator"
                      transition={shouldReduceMotion ? { duration: 0 } : SPRING_TRANSITION}
                      className="absolute inset-0 rounded-md bg-[#F4F4F5] -z-10"
                    />
                  )}
                  {tab === 'login' ? 'Entrar' : 'Criar Conta'}
                </button>
              )
            })}
          </div>

          {/* Animated Heading & Subtitle */}
          <div className="mb-8 min-h-[68px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
              >
                <h2 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">
                  {mode === 'login' ? 'Acesse sua operação' : 'Crie sua conta'}
                </h2>
                <p className="mt-1.5 text-sm text-zinc-400">
                  {mode === 'login'
                    ? 'Entre com suas credenciais para abrir o painel.'
                    : 'Configure seu acesso para iniciar a reativação.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Feedback Banners */}
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="auth-error"
                  role="alert"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={SPRING_TRANSITION}
                  className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-relaxed"
                >
                  <WarningCircle className="w-4 h-4 shrink-0 mt-0.5" weight="regular" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  key="auth-success"
                  role="status"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                  transition={SPRING_TRANSITION}
                  className="flex items-start gap-2.5 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs leading-relaxed"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" weight="regular" />
                  <span>{successMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-email"
                className="text-xs font-medium text-zinc-300"
              >
                E-mail corporativo
              </label>
              <input
                id="auth-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="nome@empresa.com.br"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0C0D0F] border border-white/12 px-3.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 transition-colors duration-200 focus:outline-none focus:border-white/45 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="auth-password"
                className="text-xs font-medium text-zinc-300"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Mínimo de 6 caracteres"
                  required
                  disabled={loading}
                  className="h-11 w-full rounded-lg bg-[#0C0D0F] border border-white/12 px-3.5 pr-11 text-sm text-[#F4F4F5] placeholder:text-zinc-600 transition-colors duration-200 focus:outline-none focus:border-white/45 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={showPassword ? 'hide' : 'show'}
                      initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.14 }}
                      className="flex items-center justify-center"
                    >
                      {showPassword ? (
                        <EyeSlash className="w-4 h-4" weight="regular" />
                      ) : (
                        <Eye className="w-4 h-4" weight="regular" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up mode) */}
            <AnimatePresence initial={false}>
              {mode === 'signup' && (
                <motion.div
                  key="confirm-password-block"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: EASE_OUT_EXPO }}
                  className="flex flex-col gap-2"
                >
                  <label
                    htmlFor="auth-confirm-password"
                    className="text-xs font-medium text-zinc-300"
                  >
                    Confirmar senha
                  </label>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repita sua senha"
                    required
                    disabled={loading}
                    className="h-11 w-full rounded-lg bg-[#0C0D0F] border border-white/12 px-3.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 transition-colors duration-200 focus:outline-none focus:border-white/45 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Primary CTA wrapped in React Bits Magnet */}
            <div className="pt-2">
              <Magnet strength={0.12} disabled={loading} className="w-full">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  transition={SPRING_TRANSITION}
                  className="group relative w-full h-11 rounded-lg bg-[#F4F4F5] text-[#0C0D0F] hover:bg-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'login' ? 'Entrar no Painel' : 'Criar Conta'}
                      </span>
                      <ArrowRight
                        className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                        weight="bold"
                      />
                    </>
                  )}
                </motion.button>
              </Magnet>
            </div>
          </form>
        </div>

        {/* Subtle Architectural Footer */}
        <div className="w-full max-w-sm mx-auto pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
          <span>Winback Engine</span>
          <span>Acesso restrito</span>
        </div>
      </main>
    </div>
  )
}
