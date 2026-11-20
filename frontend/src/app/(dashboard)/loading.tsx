export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[100dvh] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="h-7 w-60 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-white/[0.04] animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-white/[0.08] animate-pulse" />
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111215] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 space-y-3">
            <div className="h-3 w-24 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-8 w-20 rounded bg-white/[0.07] animate-pulse" />
            <div className="h-3.5 w-36 rounded bg-white/[0.04] animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 h-80 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="h-4 w-36 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-56 w-full rounded-lg bg-white/[0.03] animate-pulse" />
        </div>
        <div className="lg:col-span-5 h-80 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-5">
          <div className="h-4 w-40 rounded bg-white/[0.06] animate-pulse" />
          <div className="h-2 w-full rounded-full bg-white/[0.05] animate-pulse" />
          <div className="h-32 w-full rounded-lg bg-white/[0.03] animate-pulse" />
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-11 w-full rounded-md bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  )
}
