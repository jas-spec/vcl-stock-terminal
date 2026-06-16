export function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 animate-fade-in"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="skeleton w-14 h-6 rounded-lg" />
      </div>
      <div className="skeleton w-24 h-8 rounded-lg mb-2" />
      <div className="skeleton w-20 h-4 rounded-lg mb-4" />
      <div className="skeleton w-full h-1 rounded-full" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-2xl p-5 animate-fade-in"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}>
      <div className="skeleton w-40 h-5 rounded-lg mb-1" />
      <div className="skeleton w-56 h-3.5 rounded-lg mb-4" />
      <div className="skeleton w-full h-64 rounded-xl" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="rounded-2xl overflow-hidden animate-fade-in"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
      }}>
      <div className="flex items-center justify-between p-5"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div>
          <div className="skeleton w-28 h-5 rounded-lg mb-1.5" />
          <div className="skeleton w-20 h-3.5 rounded-lg" />
        </div>
        <div className="skeleton w-48 h-9 rounded-xl" />
      </div>
      <div className="p-5 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton w-full h-10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable />
    </div>
  );
}
