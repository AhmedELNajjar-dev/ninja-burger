export default function HomeLoading() {
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
              <div className="h-4 w-20 rounded-full bg-white/20 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-16 rounded-full bg-white/20 animate-pulse" />
            <div className="h-9 w-9 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <div className="bg-ninja-dark text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center space-y-4">
          <div className="h-6 w-40 rounded-full bg-ninja-red/40 animate-pulse" />
          <div className="h-10 sm:h-14 w-64 sm:w-96 rounded-2xl bg-white/10 animate-pulse" />
          <div className="h-4 w-72 sm:w-[28rem] rounded-full bg-white/10 animate-pulse" />
          <div className="h-12 w-44 rounded-full bg-ninja-yellow/30 animate-pulse mt-2" />
        </div>
      </div>

      {/* Menu Section Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center mb-6 space-y-2">
          <div className="h-8 w-48 rounded-xl bg-ninja-dark/10 animate-pulse" />
          <div className="h-4 w-64 rounded-full bg-ninja-dark/5 animate-pulse" />
        </div>

        {/* Category Tabs Skeleton */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-10 w-28 rounded-full shrink-0 animate-pulse ${
                i === 0 ? 'bg-ninja-red/30' : 'bg-white border border-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Menu Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-card border border-gray-100 flex flex-col"
            >
              <div className="h-48 w-full bg-ninja-dark/10 animate-pulse" />
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-3/4 rounded-lg bg-ninja-dark/10 animate-pulse" />
                  <div className="h-3.5 w-full rounded-full bg-ninja-dark/5 animate-pulse" />
                  <div className="h-3.5 w-2/3 rounded-full bg-ninja-dark/5 animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-6 w-20 rounded-lg bg-ninja-red/20 animate-pulse" />
                  <div className="h-9 w-24 rounded-xl bg-ninja-yellow/30 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
