export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-ninja-gray" dir="rtl">
      {/* Admin Header Skeleton */}
      <header className="bg-ninja-red shadow-ninja sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥷</span>
            <div>
              <span className="font-black text-white text-lg">NINJA</span>{' '}
              <span className="font-black text-ninja-yellow text-lg">BURGER</span>
            </div>
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Admin Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-5 w-16 rounded-full bg-white/20 animate-pulse hidden sm:block" />
            <div className="h-8 w-8 rounded-lg bg-white/20 animate-pulse" />
            <div className="h-5 w-20 rounded-full bg-white/20 animate-pulse hidden sm:block" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Welcome & Master Tabs Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded-xl bg-ninja-dark/15 animate-pulse" />
            <div className="h-4 w-80 rounded-full bg-ninja-dark/10 animate-pulse" />
          </div>
          <div className="inline-flex p-1 bg-white rounded-2xl border border-gray-200 shadow-sm gap-2">
            <div className="h-10 w-28 rounded-xl bg-ninja-red/30 animate-pulse" />
            <div className="h-10 w-36 rounded-xl bg-ninja-dark/10 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-card space-y-2"
            >
              <div className="h-4 w-20 rounded-full bg-ninja-dark/10 animate-pulse" />
              <div className="h-7 w-14 rounded-lg bg-ninja-red/20 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Status Filters Skeleton */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`h-9 w-24 rounded-xl shrink-0 animate-pulse ${
                i === 0 ? 'bg-ninja-red/30' : 'bg-white border border-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Orders Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-card border border-gray-100 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 rounded-lg bg-ninja-dark/15 animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-ninja-yellow/30 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-40 rounded-full bg-ninja-dark/10 animate-pulse" />
                <div className="h-4 w-32 rounded-full bg-ninja-dark/10 animate-pulse" />
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="h-3.5 w-full rounded-full bg-ninja-dark/10 animate-pulse" />
                <div className="h-3.5 w-2/3 rounded-full bg-ninja-dark/10 animate-pulse" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-24 rounded-lg bg-ninja-red/20 animate-pulse" />
                <div className="h-9 w-28 rounded-xl bg-ninja-dark/10 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
