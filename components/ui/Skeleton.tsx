// components/ui/Skeleton.tsx

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-800 rounded-xl ${className}`}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}

export function LeaseCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4 items-start w-full">
          <Skeleton className="w-14 h-14 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-6 w-24 flex-shrink-0" />
      </div>
      <div className="grid grid-cols-4 gap-3 mt-4">
        {[1,2,3,4].map((i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    </div>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[1,2,3].map((i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <Skeleton className="h-3 w-24 mb-3" />
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>
  );
}

export function LeaseDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <Skeleton className="h-4 w-24 mb-6" />
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1,2,3,4,5,6].map((i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </div>
  );
}