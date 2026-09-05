import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileClient } from "@/components/ProfileClient"

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
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full relative min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-white">Meu Perfil</h1>
        <p className="text-muted-foreground text-sm">
          Gerencie suas informações cadastrais, atuação no sistema e credenciais de segurança.
        </p>
      </div>

      <ProfileClient user={user} />
    </div>
  )
}
