import { Home, Users, MessageSquare, BarChart2 } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  return (
    <>
      {/* 1. Menu Lateral para Computador / Tablet (Desktop) */}
      <aside className="hidden md:flex w-16 flex-shrink-0 border-r border-white/5 bg-[#0B0E11] flex-col items-center py-6 h-screen sticky top-0 z-40">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,230,118,0.2)]">
          <span className="font-bold text-primary text-sm">W</span>
        </div>

        <nav className="flex flex-col space-y-4 flex-1 w-full items-center">
          <Link 
            href="/" 
            className="p-3 rounded-xl bg-primary/15 text-primary border border-primary/20 transition-all hover:scale-105" 
            title="Painel Principal"
          >
            <Home className="w-5 h-5" />
          </Link>
          <div 
            className="p-3 rounded-xl text-muted-foreground/40 cursor-not-allowed" 
            title="Clientes (Em breve)"
          >
            <Users className="w-5 h-5" />
          </div>
          <div 
            className="p-3 rounded-xl text-muted-foreground/40 cursor-not-allowed" 
            title="Relatórios (Em breve)"
          >
            <BarChart2 className="w-5 h-5" />
          </div>
        </nav>
      </aside>

      {/* 2. Barra de Navegação Inferior estilo App Mobile (apenas no Celular) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-t border-white/10 px-6 py-2.5 flex justify-around items-center shadow-2xl">
        <Link 
          href="/" 
          className="flex flex-col items-center gap-1 text-primary"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Início</span>
        </Link>
        <div className="flex flex-col items-center gap-1 text-muted-foreground/40 cursor-not-allowed">
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Clientes</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-muted-foreground/40 cursor-not-allowed">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Envios</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-muted-foreground/40 cursor-not-allowed">
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Métricas</span>
        </div>
      </nav>
    </>
  )
}

