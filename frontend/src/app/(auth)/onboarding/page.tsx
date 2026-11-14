'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Briefcase,
  CircleNotch,
  ShieldCheck,
  WarningCircle,
} from '@phosphor-icons/react'
import { completeOnboarding } from '@/app/actions/auth'
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

export default function OnboardingPage() {
  const [role, setRole] = useState<'representante' | 'admin'>('representante')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const shouldReduceMotion = useReducedMotion()

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ''
      if (message.includes('NEXT_REDIRECT')) {
        return
      }
      setError('Ocorreu um erro ao salvar seu perfil. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] w-full grid grid-cols-1 lg:grid-cols-12">
      {/* Left Architectural Stage */}
      <section className="relative hidden lg:flex lg:col-span-6 flex-col justify-between p-12 xl:p-16 overflow-hidden bg-[#0C0D0F]">
        <DotGrid
          dotSize={1.5}
          gap={30}
          baseColor="rgba(244, 244, 245, 0.13)"
          activeColor="rgba(0, 230, 118, 0.72)"
          proximity={140}
        />

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
            Configuração Inicial
          </span>
        </header>

        <div className="relative z-10 max-w-xl my-auto py-12">
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.08] text-[#F4F4F5]">
            <SplitText text="Defina seu perfil" delay={0.05} />
            <br />
            <span className="italic font-normal text-zinc-300 inline-block pb-1">
              <SplitText text="de operação." delay={0.22} />
            </span>
          </h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4, ease: EASE_OUT_EXPO }}
            className="mt-6 text-base text-zinc-400 leading-relaxed max-w-[44ch]"
          >
            Ajustamos o painel, os filtros de carteira e os fluxos de contato de acordo com o seu papel comercial.
          </motion.p>
        </div>

        <footer className="relative z-10 pt-8 border-t border-white/[0.08] text-xs text-zinc-500 flex items-center justify-between max-w-xl">
          <span>Winback Engine</span>
          <span>Você pode alterar esses dados depois em Perfil</span>
        </footer>
      </section>

      {/* Right Onboarding Form Column */}
      <main className="lg:col-span-6 flex flex-col justify-between bg-[#111215] lg:border-l border-white/[0.08] px-6 py-8 sm:px-12 lg:px-14 xl:px-16 min-h-[100dvh]">
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

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-[#F4F4F5]">
              Complete seu cadastro
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Informe seus dados de contato e selecione como atuará no painel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <AnimatePresence initial={false}>
              {error && (
                <motion.div
                  key="onboarding-error"
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
            </AnimatePresence>

            <div className="flex flex-col gap-2">
              <label htmlFor="onb-fullname" className="text-xs font-medium text-zinc-300">
                Nome completo
              </label>
              <input
                id="onb-fullname"
                type="text"
                name="fullName"
                placeholder="Ex: Carlos Eduardo Martins"
                required
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0C0D0F] border border-white/12 px-3.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 transition-colors duration-200 focus:outline-none focus:border-white/45 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="onb-phone" className="text-xs font-medium text-zinc-300">
                WhatsApp de contato (opcional)
              </label>
              <input
                id="onb-phone"
                type="tel"
                name="phone"
                placeholder="(00) 90000-0000"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#0C0D0F] border border-white/12 px-3.5 text-sm text-[#F4F4F5] placeholder:text-zinc-600 transition-colors duration-200 focus:outline-none focus:border-white/45 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
              />
            </div>

            {/* Role Selector with layoutId spring indicator */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-zinc-300">
                Como você atuará no sistema?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'representante' as const,
                    title: 'Representante',
                    desc: 'Gerencio carteiras, disparo reativações e contato direto com clientes.',
                    icon: Briefcase,
                  },
                  {
                    id: 'admin' as const,
                    title: 'Administrador',
                    desc: 'Acesso a relatórios executivos, métricas globais e configurações.',
                    icon: ShieldCheck,
                  },
                ].map((item) => {
                  const active = role === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`relative text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'border-[#F4F4F5]/40 text-[#F4F4F5]'
                          : 'border-white/[0.08] bg-[#0C0D0F]/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="onboarding-role-indicator"
                          transition={shouldReduceMotion ? { duration: 0 } : SPRING_TRANSITION}
                          className="absolute inset-0 rounded-lg bg-white/[0.05] -z-10"
                        />
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <Icon
                          className={`w-5 h-5 ${active ? 'text-[#00E676]' : 'text-zinc-500'}`}
                          weight={active ? 'fill' : 'regular'}
                        />
                      </div>
                      <div className="text-sm font-medium text-[#F4F4F5]">{item.title}</div>
                      <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-2">
              <Magnet strength={0.12} disabled={loading} className="w-full">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                  transition={SPRING_TRANSITION}
                  className="group w-full h-11 rounded-lg bg-[#F4F4F5] text-[#0C0D0F] hover:bg-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                      <span>Configurando conta...</span>
                    </>
                  ) : (
                    <>
                      <span>Concluir e Acessar o Painel</span>
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

        <div className="w-full max-w-md mx-auto pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
          <span>Winback Engine</span>
          <span>Configuração inicial</span>
        </div>
      </main>
    </div>
  )
}
