export default function ClientesLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[100dvh]">
      <div className="pb-8 mb-8 border-b border-white/[0.08] space-y-2">
        <div className="h-7 w-56 rounded-md bg-white/[0.06] animate-pulse" />
        <div className="h-4 w-96 max-w-full rounded-md bg-white/[0.04] animate-pulse" />
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-white/[0.08] bg-[#111215] p-5 space-y-3">
              <div className="h-3.5 w-28 rounded bg-white/[0.05] animate-pulse" />
              <div className="h-7 w-16 rounded bg-white/[0.07] animate-pulse" />
            </div>
          ))}
        </div>

        <div className="h-16 rounded-xl border border-white/[0.08] bg-[#111215] p-4 flex items-center justify-between gap-4">
          <div className="h-9 w-80 max-w-full rounded-md bg-white/[0.04] animate-pulse" />
          <div className="h-9 w-36 rounded-md bg-white/[0.07] animate-pulse" />
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#111215] p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 w-full rounded-md bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

