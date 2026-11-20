'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import {
  House,
  Users,
  UserCircle,
  SignOut,
} from '@phosphor-icons/react'
import { logout } from '@/app/actions/auth'

const SPRING_NAV = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
}

export function Sidebar() {
  const pathname = usePathname()
  const shouldReduceMotion = useReducedMotion()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const navItems = [
    { href: '/', label: 'Painel', shortLabel: 'Painel', icon: House },
    { href: '/clientes', label: 'Carteira', shortLabel: 'Carteira', icon: Users },
    { href: '/perfil', label: 'Perfil', shortLabel: 'Perfil', icon: UserCircle },
  ]

  return (
    <>
      {/* Desktop / Tablet Architectural Sidebar */}
      <aside className="hidden md:flex md:w-16 lg:w-56 flex-shrink-0 border-r border-white/[0.08] bg-[#0C0D0F] flex-col py-6 h-[100dvh] sticky top-0 z-40">
        {/* Brand Header */}
        <div className="px-3 lg:px-5 mb-8 flex items-center justify-center">
          <Link
            href="/"
            title="Winback Engine"
            className="text-center transition-opacity duration-150 hover:opacity-80"
          >
            <span className="hidden lg:inline font-mono text-[11px] font-medium tracking-[0.22em] text-[#F4F4F5] uppercase">
              Winback Engine
            </span>
            <span className="lg:hidden font-mono text-xs font-semibold tracking-[0.16em] text-[#F4F4F5] uppercase">
              WB
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Navegação principal" className="flex flex-col gap-1 flex-1 px-2.5 lg:px-3">
          <span className="hidden lg:block px-2.5 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">
            Operação
          </span>
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={`relative h-10 lg:h-9 px-2.5 rounded-lg flex items-center justify-center lg:justify-start gap-2.5 text-sm transition-colors duration-150 ${
                  active
                    ? 'text-[#F4F4F5] font-medium'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-desktop"
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                    className="absolute inset-0 rounded-lg bg-white/[0.07] border border-white/[0.08] -z-10"
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                    className="hidden lg:block absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[#F4F4F5]"
                  />
                )}
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-[#F4F4F5]' : 'text-zinc-500'}`}
                  weight={active ? 'fill' : 'regular'}
                />
                <span className="hidden lg:inline truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Session Controls */}
        <div className="mt-auto pt-4 border-t border-white/[0.08] px-2.5 lg:px-3">
          <form action={logout}>
            <button
              type="submit"
              className="w-full h-10 lg:h-9 px-2.5 rounded-lg flex items-center justify-center lg:justify-start gap-2.5 text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <SignOut className="w-[18px] h-[18px] shrink-0" weight="regular" />
              <span className="hidden lg:inline">Sair</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        aria-label="Navegação mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0C0D0F]/95 backdrop-blur-md border-t border-white/[0.08] px-3 py-2 flex justify-around items-center"
      >
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-1 px-4 py-1 rounded-md transition-colors ${
                active ? 'text-[#F4F4F5]' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-mobile"
                  transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                  className="absolute -top-2 w-7 h-0.5 rounded-full bg-[#F4F4F5]"
                />
              )}
              <Icon className="w-5 h-5" weight={active ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium tracking-tight">{item.shortLabel}</span>
            </Link>
          )
        })}

        <form action={logout}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1 px-4 py-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
            title="Sair"
          >
            <SignOut className="w-5 h-5" weight="regular" />
            <span className="text-[10px] font-medium tracking-tight">Sair</span>
          </button>
        </form>
      </nav>
    </>
  )
}
