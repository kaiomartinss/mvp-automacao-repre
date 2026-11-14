'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateProfile, updatePassword } from '@/app/actions/auth'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Calendar,
  KeyRound
} from 'lucide-react'
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

export function ProfileClient({ user }: ProfileClientProps) {
  const metadata = user.user_metadata || {}
  const [fullName, setFullName] = useState(metadata.full_name || '')
  const [phone, setPhone] = useState(metadata.phone || '')
  const [role, setRole] = useState(metadata.role || 'representante')

  // Profile update state
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Password update state
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Initials calculation
  const getInitials = (name: string, email?: string) => {
    if (name.trim()) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase()
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
    <div className="space-y-8 max-w-4xl">
      {/* 1. Card Cabeçalho do Perfil */}
      <Card className="border-white/[0.08] bg-[#111215] shadow-none overflow-hidden relative">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-lg bg-[#F4F4F5] text-[#0C0D0F] flex items-center justify-center font-semibold text-xl tracking-tight shrink-0">
              {getInitials(fullName, user.email)}
            </div>

            {/* User Meta */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  {fullName || 'Usuário Sem Nome'}
                </h2>
                
                {/* Role Badge */}
                {role === 'admin' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 text-xs font-semibold w-fit mx-auto sm:mx-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold w-fit mx-auto sm:mx-0">
                    <Briefcase className="w-3.5 h-3.5" />
                    Representante Comercial
                  </span>
                )}
              </div>

              <p className="text-muted-foreground text-sm flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-muted-foreground/70" />
                {user.email}
              </p>

              <p className="text-xs text-muted-foreground/60 flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5" />
                Membro desde {createdDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Integração WhatsApp / Evolution API */}
      <div className="mb-6">
        <WhatsAppStatusCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Formulário de Dados Cadastrais */}
        <Card className="border-white/[0.08] bg-[#111215] shadow-none flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Dados Cadastrais
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Atualize seu nome de exibição, telefone e função no sistema.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form id="profile-form" onSubmit={handleProfileSubmit} className="space-y-4">
                {profileError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}

                {profileSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nome Completo</label>
                  <Input
                    type="text"
                    name="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={profileLoading}
                    className="bg-black/30 border-white/10 text-white focus-visible:border-primary focus-visible:ring-primary/20 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">WhatsApp / Telefone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(00) 90000-0000"
                    disabled={profileLoading}
                    className="bg-black/30 border-white/10 text-white focus-visible:border-primary focus-visible:ring-primary/20 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Função / Perfil</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setRole('representante')}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        role === 'representante'
                          ? 'bg-primary/15 border-primary text-primary shadow-sm'
                          : 'bg-black/20 border-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      Representante
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`p-2.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        role === 'admin'
                          ? 'bg-indigo-500/15 border-indigo-400 text-indigo-300 shadow-sm'
                          : 'bg-black/20 border-white/5 text-muted-foreground hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Administrador
                    </button>
                  </div>
                </div>
              </form>
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <Button
              type="submit"
              form="profile-form"
              disabled={profileLoading}
              className="w-full bg-[#F4F4F5] hover:bg-white text-[#0C0D0F] font-medium active:scale-[0.985] transition-all cursor-pointer"
            >
              {profileLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </div>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </Card>

        {/* 3. Formulário de Segurança (Troca de Senha) */}
        <Card className="border-white/[0.08] bg-[#111215] shadow-none flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-primary" />
                Segurança & Senha
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Atualize sua senha de acesso a qualquer momento.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Nova Senha</label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Mínimo de 6 caracteres"
                    required
                    disabled={passwordLoading}
                    className="bg-black/30 border-white/10 text-white focus-visible:border-primary focus-visible:ring-primary/20 h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Confirmar Nova Senha</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Repita a nova senha"
                    required
                    disabled={passwordLoading}
                    className="bg-black/30 border-white/10 text-white focus-visible:border-primary focus-visible:ring-primary/20 h-10"
                  />
                </div>
              </form>
            </CardContent>
          </div>

          <div className="p-6 pt-0">
            <Button
              type="submit"
              form="password-form"
              disabled={passwordLoading}
              variant="outline"
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold cursor-pointer"
            >
              {passwordLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Atualizando senha...</span>
                </div>
              ) : (
                'Atualizar Senha'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
