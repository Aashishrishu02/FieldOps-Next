export function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-16 bg-gray-200 rounded" />
        <div className="w-8 h-8 rounded-lg bg-gray-100" />
      </div>
      <div className="h-6 w-24 bg-gray-200 rounded mt-3" />
      <div className="h-2.5 w-28 bg-gray-100 rounded mt-2" />
    </div>
  );
}

export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-sm animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-48 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="p-5 space-y-3">
        <div className="h-8 bg-gray-100 rounded w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-10 bg-gray-50 rounded w-full flex items-center px-4 gap-4"
          >
            <div className="h-3 w-1/4 bg-gray-200 rounded" />
            <div className="h-3 w-1/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm animate-pulse space-y-4">
      <div className="space-y-1.5 border-b border-gray-100 pb-3">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-3 w-44 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-100 rounded w-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-9 bg-gray-100 rounded w-full" />
        </div>
      </div>
      <div className="h-8 w-28 bg-gray-200 rounded mt-4" />
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex w-60 h-screen sticky top-0 self-start flex-col bg-white border-r border-gray-200 shrink-0 z-20 animate-pulse">
      <div className="px-5 py-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gray-200 shrink-0" />
          <div className="space-y-1">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-2.5 w-24 bg-gray-100 rounded" />
          </div>
        </div>
      </div>
      <div className="flex-1 px-3 py-3 space-y-2 overflow-y-auto min-h-0">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-9 bg-gray-50 rounded-lg w-full flex items-center px-3 gap-2.5"
          >
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-3.5 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 p-4 shrink-0 bg-white space-y-2">
        <div className="h-3.5 w-24 bg-gray-200 rounded" />
        <div className="h-2.5 w-32 bg-gray-100 rounded" />
        <div className="h-2.5 w-16 bg-gray-100 rounded" />
        <div className="h-7 w-full bg-gray-100 rounded mt-2" />
      </div>
    </aside>
  );
}

export function MobileNavSkeleton() {
  return (
    <div className="md:hidden border-b border-gray-200 bg-white sticky top-0 z-40 h-14 px-4 flex items-center justify-between animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-gray-200 shrink-0" />
        <div className="h-4 w-20 bg-gray-200 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-7 w-14 bg-gray-100 rounded" />
        <div className="w-7 h-7 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <section className="min-w-0 animate-pulse">
      <header className="bg-white border-b border-gray-200 shrink-0">
        <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between min-h-[3.75rem]">
          <div className="space-y-1.5">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3.5 w-20 bg-gray-200 rounded ml-auto" />
            <div className="h-2.5 w-14 bg-gray-100 rounded ml-auto" />
          </div>
        </div>
      </header>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-gray-200 rounded" />
          <div className="h-3.5 w-72 bg-gray-100 rounded" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        <div className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-sm space-y-4">
          <div className="space-y-1.5 border-b border-gray-100 pb-3">
            <div className="h-4 w-28 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-100 rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-lg p-4 space-y-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-100" />
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3 w-36 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FullDashboardLayoutSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full">
      <SidebarSkeleton />
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <MobileNavSkeleton />
        <main className="flex-1 min-w-0 w-full">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
