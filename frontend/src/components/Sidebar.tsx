'use client'

import { Home, Users, MessageSquare, BarChart2, LogOut, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logout } from "@/app/actions/auth"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* 1. Menu Lateral para Computador / Tablet (Desktop) */}
      <aside className="hidden md:flex w-16 flex-shrink-0 border-r border-white/5 bg-[#0B0E11] flex-col items-center py-6 h-screen sticky top-0 z-40">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
          <span className="font-bold text-primary text-sm">W</span>
        </div>

        <nav className="flex flex-col space-y-4 flex-1 w-full items-center">
          {/* Início / Dashboard */}
          <Link 
            href="/" 
            className={`p-3 rounded-xl transition-all hover:scale-105 ${
              isActive('/') 
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,230,118,0.15)]' 
                : 'text-muted-foreground/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Painel Principal"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Clientes */}
          <Link 
            href="/clientes" 
            className={`p-3 rounded-xl transition-all hover:scale-105 ${
              isActive('/clientes') 
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,230,118,0.15)]' 
                : 'text-muted-foreground/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Carteira de Clientes"
          >
            <Users className="w-5 h-5" />
          </Link>

          {/* Relatórios (Em breve) */}
          <div 
            className="p-3 rounded-xl text-muted-foreground/30 cursor-not-allowed border border-transparent" 
            title="Relatórios (Em breve)"
          >
            <BarChart2 className="w-5 h-5" />
          </div>
        </nav>

        {/* Rodapé Desktop: Perfil e Logout */}
        <div className="mt-auto pt-4 border-t border-white/5 w-full flex flex-col items-center space-y-1">
          <Link 
            href="/perfil" 
            className={`p-3 rounded-xl transition-all hover:scale-105 ${
              isActive('/perfil') 
                ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_12px_rgba(0,230,118,0.15)]' 
                : 'text-muted-foreground/60 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
            title="Meu Perfil"
          >
            <User className="w-5 h-5" />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="p-3 rounded-xl text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer border border-transparent"
              title="Sair da Conta"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </aside>

      {/* 2. Barra de Navegação Inferior estilo App Mobile (apenas no Celular) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-t border-white/10 px-4 py-2.5 flex justify-around items-center shadow-2xl">
        <Link 
          href="/" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Início</span>
        </Link>

        <Link 
          href="/clientes" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/clientes') ? 'text-primary' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Clientes</span>
        </Link>

        <div className="flex flex-col items-center gap-1 text-muted-foreground/30 cursor-not-allowed">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Envios</span>
        </div>

        <Link 
          href="/perfil" 
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/perfil') ? 'text-primary' : 'text-muted-foreground hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Perfil</span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1 text-muted-foreground/60 hover:text-destructive transition-colors cursor-pointer"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium tracking-tight">Sair</span>
          </button>
        </form>
      </nav>
    </>
  )
}
