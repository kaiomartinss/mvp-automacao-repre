'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import {
  House,
  Users,
  ChartBar,
  User,
  SignOut,
  ChatCircle,
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
    { href: '/', label: 'Painel Principal', shortLabel: 'Início', icon: House },
    { href: '/clientes', label: 'Carteira de Clientes', shortLabel: 'Clientes', icon: Users },
  ]

  return (
    <>
      {/* Desktop Architectural Rail */}
      <aside className="hidden md:flex w-16 flex-shrink-0 border-r border-white/[0.08] bg-[#0C0D0F] flex-col items-center py-6 h-[100dvh] sticky top-0 z-40">
        <Link
          href="/"
          title="Winback Engine"
          className="w-8 h-8 rounded-md bg-[#F4F4F5] text-[#0C0D0F] flex items-center justify-center mb-10 font-bold text-sm tracking-tighter transition-transform duration-200 hover:scale-105 active:scale-95"
        >
          W
        </Link>

        <nav className="flex flex-col gap-2 flex-1 w-full items-center px-2">
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                aria-current={active ? 'page' : undefined}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                  active
                    ? 'text-[#0C0D0F]'
                    : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-desktop"
                    transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                    className="absolute inset-0 rounded-lg bg-[#F4F4F5] -z-10"
                  />
                )}
                <Icon className="w-[18px] h-[18px]" weight={active ? 'fill' : 'regular'} />
              </Link>
            )
          })}

          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-700 cursor-not-allowed"
            title="Relatórios (Em breve)"
          >
            <ChartBar className="w-[18px] h-[18px]" weight="regular" />
          </div>
        </nav>

        {/* Desktop Footer: Profile & Logout */}
        <div className="mt-auto pt-4 border-t border-white/[0.08] w-full flex flex-col items-center gap-2 px-2">
          <Link
            href="/perfil"
            title="Meu Perfil"
            aria-current={isActive('/perfil') ? 'page' : undefined}
            className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              isActive('/perfil')
                ? 'text-[#0C0D0F]'
                : 'text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.04]'
            }`}
          >
            {isActive('/perfil') && (
              <motion.span
                layoutId="sidebar-active-desktop"
                transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                className="absolute inset-0 rounded-lg bg-[#F4F4F5] -z-10"
              />
            )}
            <User className="w-[18px] h-[18px]" weight={isActive('/perfil') ? 'fill' : 'regular'} />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <SignOut className="w-[18px] h-[18px]" weight="regular" />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0C0D0F]/95 backdrop-blur-md border-t border-white/[0.08] px-4 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${
                active ? 'text-[#F4F4F5]' : 'text-zinc-500 hover:text-zinc-200'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active-mobile"
                  transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
                  className="absolute -top-2 w-6 h-0.5 rounded-full bg-[#F4F4F5]"
                />
              )}
              <Icon className="w-5 h-5" weight={active ? 'fill' : 'regular'} />
              <span className="text-[10px] font-medium tracking-tight">{item.shortLabel}</span>
            </Link>
          )
        })}

        <div className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-700 cursor-not-allowed">
          <ChatCircle className="w-5 h-5" weight="regular" />
          <span className="text-[10px] font-medium tracking-tight">Envios</span>
        </div>

        <Link
          href="/perfil"
          className={`relative flex flex-col items-center gap-1 px-3 py-1 rounded-md transition-colors ${
            isActive('/perfil') ? 'text-[#F4F4F5]' : 'text-zinc-500 hover:text-zinc-200'
          }`}
        >
          {isActive('/perfil') && (
            <motion.span
              layoutId="sidebar-active-mobile"
              transition={shouldReduceMotion ? { duration: 0 } : SPRING_NAV}
              className="absolute -top-2 w-6 h-0.5 rounded-full bg-[#F4F4F5]"
            />
          )}
          <User className="w-5 h-5" weight={isActive('/perfil') ? 'fill' : 'regular'} />
          <span className="text-[10px] font-medium tracking-tight">Perfil</span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="flex flex-col items-center gap-1 px-3 py-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
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
