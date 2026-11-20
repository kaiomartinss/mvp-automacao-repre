"use client"

import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface ChartPoint {
  date: string
  count: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  const val = payload[0].value
  return (
    <div className="rounded-lg border border-white/12 bg-[#0C0D0F]/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="font-mono text-[11px] text-zinc-400">{label}</p>
      <p className="mt-0.5 font-mono text-sm font-medium text-[#F4F4F5] tabular-nums">
        {val} {val === 1 ? "disparo" : "disparos"}
      </p>
    </div>
  )
}

export function LineChartClient({ data }: { data: ChartPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="relative h-full w-full min-h-[230px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="winbackAreaFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="date"
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={10}
            style={{ fontFamily: "var(--font-geist-mono)" }}
          />
          <YAxis
            stroke="#71717A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            style={{ fontFamily: "var(--font-geist-mono)" }}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(244, 244, 245, 0.16)", strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#00E676"
            strokeWidth={2}
            fill="url(#winbackAreaFade)"
            dot={false}
            activeDot={{
              r: 4.5,
              fill: "#00E676",
              stroke: "#0C0D0F",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {total === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-6">
          <span className="rounded-md border border-white/[0.08] bg-[#0C0D0F]/90 px-3 py-1.5 font-mono text-[11px] text-zinc-400">
            Nenhum disparo registrado nos últimos 7 dias
          </span>
        </div>
      )}
    </div>
  )
}
