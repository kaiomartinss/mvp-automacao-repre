export default function PerfilLoading() {
  return (
    <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full min-h-[100dvh]">
      <div className="pb-8 mb-8 border-b border-white/[0.08] space-y-2">
        <div className="h-7 w-40 rounded-md bg-white/[0.06] animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-md bg-white/[0.04] animate-pulse" />
      </div>

      <div className="space-y-8 max-w-4xl">
        <div className="h-36 rounded-xl border border-white/[0.08] bg-[#111215] p-6 flex items-center gap-6">
          <div className="w-16 h-16 rounded-lg bg-white/[0.06] animate-pulse shrink-0" />
          <div className="space-y-2.5 flex-1">
            <div className="h-6 w-48 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-64 rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-10 w-full rounded bg-white/[0.04] animate-pulse" />
            <div className="h-10 w-full rounded bg-white/[0.04] animate-pulse" />
          </div>
          <div className="h-80 rounded-xl border border-white/[0.08] bg-[#111215] p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse" />
            <div className="h-10 w-full rounded bg-white/[0.04] animate-pulse" />
            <div className="h-10 w-full rounded bg-white/[0.04] animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

