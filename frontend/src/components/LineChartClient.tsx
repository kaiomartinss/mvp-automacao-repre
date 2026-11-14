"use client"

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export function LineChartClient({ data }: { data: any[] }) {
  // Se não houver dados, mostramos um gráfico fictício suave para não ficar vazio
  const chartData = data && data.length > 0 ? data : [
    { date: '10/08', count: 12 },
    { date: '11/08', count: 18 },
    { date: '12/08', count: 15 },
    { date: '13/08', count: 25 },
    { date: '14/08', count: 22 },
    { date: '15/08', count: 30 },
    { date: '16/08', count: 42 },
  ]

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis 
          dataKey="date" 
          stroke="#94A3B8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
          dy={10}
        />
        <YAxis 
          stroke="#94A3B8" 
          fontSize={10} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111215', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
          itemStyle={{ color: '#00E676' }}
          labelStyle={{ color: '#A1A1AA', marginBottom: '4px' }}
        />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#00E676" 
          strokeWidth={2.5} 
          dot={false}
          activeDot={{ r: 5, fill: "#00E676", stroke: "#111215", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
