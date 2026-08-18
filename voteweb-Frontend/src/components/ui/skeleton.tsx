export function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse bg-border rounded-[8px] ${className}`} style={style} />;
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-tertiary flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-border border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-text-secondary">Loading...</p>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-[14px] border border-border p-5 space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-[14px] border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-5 w-1/3" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-[14px] border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-8 w-1/3 mb-1" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function ListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-[14px] border border-border p-4 flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-[12px] shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-[14px] border border-border p-5">
      <Skeleton className="h-5 w-1/3 mb-4" />
      <div className="flex items-end gap-2 h-40">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
