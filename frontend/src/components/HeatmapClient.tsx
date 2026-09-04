"use client"

import { subDays, format } from "date-fns"

export function HeatmapClient({ logsData }: { logsData: any[] }) {
  // Constrói os últimos 120 dias
  const days = Array.from({ length: 120 }).map((_, i) => {
    return format(subDays(new Date(), 119 - i), 'yyyy-MM-dd')
  })

  // Mapeia a quantidade de logs por dia
  const logCounts = logsData.reduce((acc: any, log: any) => {
    if (!log.sent_at) return acc;
    const dateStr = log.sent_at.split('T')[0]
    acc[dateStr] = (acc[dateStr] || 0) + 1
    return acc
  }, {})

  // Encontra o dia com mais disparos para normalizar a intensidade
  const maxDisparos = Math.max(1, ...Object.values(logCounts) as number[])

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 flex-wrap">
        {days.map((dayStr, i) => {
          const count = logCounts[dayStr] || 0
          const intensity = count / maxDisparos

          let bgClass = "bg-white/5"
          if (intensity > 0.8) bgClass = "bg-primary"
          else if (intensity > 0.5) bgClass = "bg-primary/70"
          else if (intensity > 0.2) bgClass = "bg-primary/40"
          else if (intensity > 0) bgClass = "bg-primary/20"
          
          return (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-[2px] ${bgClass} transition-colors hover:ring-1 hover:ring-primary relative group cursor-crosshair`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#12161A] text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap z-10 shadow-xl">
                {count} disparos em {dayStr.split('-').reverse().join('/')}
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Menos</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-white/5 rounded-[2px]"></div>
          <div className="w-3 h-3 bg-primary/20 rounded-[2px]"></div>
          <div className="w-3 h-3 bg-primary/40 rounded-[2px]"></div>
          <div className="w-3 h-3 bg-primary/70 rounded-[2px]"></div>
          <div className="w-3 h-3 bg-primary rounded-[2px]"></div>
        </div>
        <span>Mais</span>
      </div>
    </div>
  )
}
