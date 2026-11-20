"use client"

import { subDays, format } from "date-fns"

interface LogEntry {
  sent_at?: string | null
}

export function HeatmapClient({ logsData }: { logsData: LogEntry[] }) {
  // 17 full weeks (119 days) aligned into a crisp 7-row contribution matrix
  const totalDays = 119
  const days = Array.from({ length: totalDays }).map((_, i) => {
    const date = subDays(new Date(), totalDays - 1 - i)
    return {
      iso: format(date, "yyyy-MM-dd"),
      label: format(date, "dd/MM/yyyy"),
    }
  })

  const logCounts = logsData.reduce<Record<string, number>>((acc, log) => {
    if (!log.sent_at) return acc
    const dateStr = log.sent_at.split("T")[0]
    acc[dateStr] = (acc[dateStr] || 0) + 1
    return acc
  }, {})

  const totalInWindow = days.reduce((sum, d) => sum + (logCounts[d.iso] || 0), 0)
  const maxDisparos = Math.max(1, ...Object.values(logCounts))

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto pb-1">
        <div className="inline-grid grid-flow-col grid-rows-7 gap-[3px]">
          {days.map((day) => {
            const count = logCounts[day.iso] || 0
            const intensity = count / maxDisparos

            let bgClass = "bg-white/[0.045]"
            if (intensity > 0.75) bgClass = "bg-[#00E676]"
            else if (intensity > 0.45) bgClass = "bg-[#00E676]/65"
            else if (intensity > 0.2) bgClass = "bg-[#00E676]/40"
            else if (intensity > 0) bgClass = "bg-[#00E676]/22"

            return (
              <div
                key={day.iso}
                title={`${count} ${count === 1 ? "disparo" : "disparos"} em ${day.label}`}
                className={`w-[11px] h-[11px] rounded-[2px] ${bgClass} transition-colors duration-150 hover:ring-1 hover:ring-white/60`}
              />
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span className="font-mono tabular-nums">
          {totalInWindow} {totalInWindow === 1 ? "disparo" : "disparos"} em 120d
        </span>
        <div className="flex items-center gap-1.5">
          <span>Menos</span>
          <div className="flex gap-[3px]">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.045]" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00E676]/22" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00E676]/40" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00E676]/65" />
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#00E676]" />
          </div>
          <span>Mais</span>
        </div>
      </div>
    </div>
  )
}
