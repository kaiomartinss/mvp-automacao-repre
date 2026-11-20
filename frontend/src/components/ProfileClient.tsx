'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfile, updatePassword } from '@/app/actions/auth'
import {
  User,
  EnvelopeSimple,
  Briefcase,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  CalendarBlank,
  Key,
} from '@phosphor-icons/react'
import { WhatsAppStatusCard } from '@/components/WhatsAppStatusCard'

interface ProfileClientProps {
  user: {
    id: string
    email?: string
    created_at: string
    user_metadata?: {
      full_name?: string
      phone?: string
      role?: string
    }
  }
}

const SPRING_TAB = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 32,
}

export function ProfileClient({ user }: ProfileClientProps) {
  const metadata = user.user_metadata || {}
  const [fullName, setFullName] = useState(metadata.full_name || '')
  const [phone, setPhone] = useState(metadata.phone || '')
  const [role, setRole] = useState(metadata.role || 'representante')
  const shouldReduceMotion = useReducedMotion()

  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const getInitials = (name: string, email?: string) => {
    if (name.trim()) {
      const parts = name.trim().split(/\s+/).filter(Boolean)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return parts[0].slice(0, 2).toUpperCase()
    }
    return (email?.slice(0, 2) || 'US').toUpperCase()
  }

  const createdDate = new Date(user.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileError(null)
    setProfileSuccess(null)
    setProfileLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('role', role)

    const res = await updateProfile(formData)
    setProfileLoading(false)

    if (res.error) {
      setProfileError(res.error)
    } else if (res.success) {
      setProfileSuccess(res.message)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)
    setPasswordLoading(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    const res = await updatePassword(formData)
    setPasswordLoading(false)

    if (res.error) {
      setPasswordError(res.error)
    } else if (res.success) {
      setPasswordSuccess(res.message)
      form.reset()
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Cabeçalho da Conta */}
      <section className="rounded-xl border border-white/[0.08] bg-[#111215] p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-14 h-14 rounded-lg bg-[#F4F4F5] text-[#0C0D0F] flex items-center justify-center font-mono font-semibold text-lg tracking-tight shrink-0">
            {getInitials(fullName, user.email)}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <h2 className="text-xl font-semibold tracking-tight text-[#F4F4F5]">
                {fullName || 'Usuário sem nome'}
              </h2>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-white/12 bg-[#0C0D0F] font-mono text-[11px] text-zinc-300 w-fit mx-auto sm:mx-0">
                {role === 'admin' ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
                    Administrador
                  </>
                ) : (
                  <>
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" weight="regular" />
                    Representante Comercial
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-5 text-xs text-zinc-400 pt-0.5">
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 font-mono">
                <EnvelopeSimple className="w-3.5 h-3.5 text-zinc-500" weight="regular" />
                {user.email}
              </span>
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-zinc-500">
                <CalendarBlank className="w-3.5 h-3.5" weight="regular" />
                Membro desde {createdDate}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Integração WhatsApp */}
      <WhatsAppStatusCard />

      {/* 3. Dados Cadastrais + Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Cadastrais */}
        <section className="rounded-xl border border-white/[0.08] bg-[#111215] flex flex-col justify-between overflow-hidden">
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" weight="regular" />
                Dados cadastrais
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Atualize seu nome de exibição, telefone e perfil de atuação.
              </p>
            </div>

            <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {profileError && (
                  <motion.div
                    key="profile-err"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs"
                  >
                    <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
                    <span>{profileError}</span>
                  </motion.div>
                )}

                {profileSuccess && (
                  <motion.div
                    key="profile-ok"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" weight="regular" />
                    <span>{profileSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-fullname" className="text-xs font-medium text-zinc-300">
                  Nome completo
                </label>
                <Input
                  id="profile-fullname"
                  type="text"
                  name="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={profileLoading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-phone" className="text-xs font-medium text-zinc-300">
                  WhatsApp / Telefone
                </label>
                <Input
                  id="profile-phone"
                  type="tel"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 90000-0000"
                  disabled={profileLoading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-zinc-300">Função no sistema</span>
                <div className="grid grid-cols-2 p-1 rounded-lg bg-[#0C0D0F] border border-white/[0.08]">
                  {[
                    { id: 'representante', label: 'Representante', icon: Briefcase },
                    { id: 'admin', label: 'Administrador', icon: ShieldCheck },
                  ].map((item) => {
                    const active = role === item.id
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`relative z-10 py-2 px-2.5 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          active ? 'text-[#0C0D0F]' : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="profile-role-pill"
                            transition={shouldReduceMotion ? { duration: 0 } : SPRING_TAB}
                            className="absolute inset-0 rounded-md bg-[#F4F4F5] -z-10"
                          />
                        )}
                        <Icon className="w-3.5 h-3.5" weight={active ? 'fill' : 'regular'} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </form>
          </div>

          <div className="px-6 py-4 bg-[#0C0D0F]/55 border-t border-white/[0.08]">
            <Button
              type="submit"
              form="profile-form"
              disabled={profileLoading}
              className="w-full h-10 bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium active:scale-[0.985] transition-all cursor-pointer"
            >
              {profileLoading ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                  Salvando...
                </span>
              ) : (
                'Salvar alterações'
              )}
            </Button>
          </div>
        </section>

        {/* Segurança e Senha */}
        <section className="rounded-xl border border-white/[0.08] bg-[#111215] flex flex-col justify-between overflow-hidden">
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F5] flex items-center gap-2">
                <Key className="w-4 h-4 text-zinc-400" weight="regular" />
                Segurança e senha
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Defina uma nova senha de acesso à sua conta.
              </p>
            </div>

            <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {passwordError && (
                  <motion.div
                    key="pass-err"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs"
                  >
                    <WarningCircle className="w-4 h-4 shrink-0" weight="regular" />
                    <span>{passwordError}</span>
                  </motion.div>
                )}

                {passwordSuccess && (
                  <motion.div
                    key="pass-ok"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0" weight="regular" />
                    <span>{passwordSuccess}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="profile-new-password" className="text-xs font-medium text-zinc-300">
                  Nova senha
                </label>
                <Input
                  id="profile-new-password"
                  type="password"
                  name="password"
                  placeholder="Mínimo de 6 caracteres"
                  required
                  disabled={passwordLoading}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="profile-confirm-password"
                  className="text-xs font-medium text-zinc-300"
                >
                  Confirmar nova senha
                </label>
                <Input
                  id="profile-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Repita a nova senha"
                  required
                  disabled={passwordLoading}
                />
              </div>
            </form>
          </div>

          <div className="px-6 py-4 bg-[#0C0D0F]/55 border-t border-white/[0.08]">
            <Button
              type="submit"
              form="password-form"
              disabled={passwordLoading}
              variant="outline"
              className="w-full h-10 border-white/12 bg-white/[0.03] hover:bg-white/[0.07] text-[#F4F4F5] font-medium active:scale-[0.985] transition-all cursor-pointer"
            >
              {passwordLoading ? (
                <span className="inline-flex items-center gap-2">
                  <CircleNotch className="w-4 h-4 animate-spin" weight="bold" />
                  Atualizando...
                </span>
              ) : (
                'Atualizar senha'
              )}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
