import { Home, Users, BarChart2, Settings, User } from "lucide-react"
import Link from "next/link"

export function Sidebar() {
  return (
    <aside className="w-16 flex-shrink-0 border-r border-white/5 bg-background flex flex-col items-center py-6 h-screen sticky top-0">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(0,230,118,0.3)]">
        <span className="font-bold text-primary-foreground text-xs">W</span>
      </div>

      <nav className="flex flex-col space-y-6 flex-1 w-full items-center">
        <Link href="/" className="p-3 rounded-xl bg-white/5 text-primary" title="Dashboard">
          <Home className="w-5 h-5" />
        </Link>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/5 w-full flex justify-center">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
          <User className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </aside>
  )
}
