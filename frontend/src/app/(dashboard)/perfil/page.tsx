import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileClient } from "@/components/ProfileClient"
import { MotionSection } from "@/components/ui/MotionSection"

export const revalidate = 0

export default async function PerfilPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-[100dvh] space-y-6">
      <MotionSection delay={0}>
        <header className="pb-6 border-b border-white/[0.08]">
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#F4F4F5] leading-tight">
            Meu Perfil
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Gerencie seus dados cadastrais, conexão com WhatsApp e credenciais de acesso.
          </p>
        </header>
      </MotionSection>

      <MotionSection delay={0.05}>
        <ProfileClient user={user} />
      </MotionSection>
    </div>
  )
}
