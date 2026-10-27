export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-ninja-gray">
      {/* Navbar Skeleton */}
      <header className="sticky top-0 z-50 w-full bg-ninja-red text-white py-4 shadow-md">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-2xl font-black tracking-tight">
              <span>NINJA</span>
              <span className="text-ninja-yellow">BURGER</span>
              <span className="text-2xl">🥷</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="h-4 w-16 rounded-full bg-white/20 animate-pulse" />
              <div className="h-4 w-20 rounded-full bg-ninja-yellow/40 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-full bg-white/20 animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Orders List Skeleton */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-8 w-44 rounded-xl bg-ninja-dark/15 animate-pulse" />
            <div className="h-4 w-64 rounded-full bg-ninja-dark/10 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-full bg-ninja-red/15 animate-pulse" />
        </div>

        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 sm:p-6 shadow-card border border-gray-100 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 rounded-lg bg-ninja-dark/15 animate-pulse" />
                  <div className="h-3.5 w-40 rounded-full bg-ninja-dark/10 animate-pulse" />
                </div>
                <div className="h-7 w-24 rounded-full bg-ninja-yellow/30 animate-pulse" />
              </div>

              {/* Status Progress Bar Skeleton */}
              <div className="grid grid-cols-4 gap-2 py-2">
                {Array.from({ length: 4 }).map((__, stepIdx) => (
                  <div key={stepIdx} className="flex flex-col items-center gap-2">
                    <div
                      className={`h-9 w-9 rounded-full animate-pulse ${
                        stepIdx === 0 ? 'bg-ninja-red/30' : 'bg-ninja-dark/10'
                      }`}
                    />
                    <div className="h-3 w-14 rounded-full bg-ninja-dark/10 animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Order Items & Total Skeleton */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="h-4 w-3/4 rounded-full bg-ninja-dark/10 animate-pulse" />
                <div className="h-4 w-1/2 rounded-full bg-ninja-dark/10 animate-pulse" />
                <div className="flex items-center justify-between pt-3">
                  <div className="h-5 w-28 rounded-lg bg-ninja-dark/10 animate-pulse" />
                  <div className="h-6 w-24 rounded-lg bg-ninja-red/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
