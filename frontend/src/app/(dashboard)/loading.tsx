export default function DashboardLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[100dvh]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 mb-8 border-b border-white/[0.08]">
        <div className="space-y-2">
          <div className="h-7 w-64 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-md bg-white/[0.04] animate-pulse" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-white/[0.08] animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 h-64 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="w-8 h-8 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-7 w-4/5 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-4 w-full rounded-md bg-white/[0.04] animate-pulse" />
          <div className="h-4 w-2/3 rounded-md bg-white/[0.04] animate-pulse" />
        </div>

        <div className="lg:col-span-8 h-64 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="h-4 w-44 rounded-md bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-56 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-36 w-full rounded-lg bg-white/[0.03] animate-pulse" />
        </div>

        <div className="lg:col-span-4 h-56 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="h-4 w-32 rounded-md bg-white/[0.05] animate-pulse" />
          <div className="h-8 w-20 rounded-md bg-white/[0.06] animate-pulse" />
          <div className="h-11 w-full rounded-lg bg-white/[0.04] animate-pulse" />
          <div className="h-11 w-full rounded-lg bg-white/[0.04] animate-pulse" />
        </div>

        <div className="lg:col-span-8 h-56 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="h-4 w-40 rounded-md bg-white/[0.05] animate-pulse" />
          <div className="h-32 w-full rounded-lg bg-white/[0.03] animate-pulse" />
        </div>

        <div className="lg:col-span-12 h-72 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-52 rounded-md bg-white/[0.06] animate-pulse" />
            <div className="h-9 w-64 rounded-md bg-white/[0.04] animate-pulse" />
          </div>
          <div className="space-y-3 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 w-full rounded-md bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

