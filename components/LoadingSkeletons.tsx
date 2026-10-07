function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-raised/60 ${className}`} />;
}

export function MovieCardSkeleton() {
  return (
    <div className="w-36 shrink-0 sm:w-44 md:w-48" aria-hidden="true">
      <Skeleton className="aspect-[2/3] rounded-xl" />
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}

export function MovieGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-8 min-[360px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }, (_, index) => <MovieCardSkeleton key={index} />)}
    </div>
  );
}

export function MovieRowSkeleton({ title = true }: { title?: boolean }) {
  return (
    <section className="mt-14 first:mt-0" aria-hidden="true">
      {title && (
        <div className="mb-3 px-4 md:px-10">
          <Skeleton className="mb-2 h-3 w-28" />
          <Skeleton className="h-7 w-48" />
        </div>
      )}
      <div className="rail flex gap-3 overflow-hidden px-4 pb-6 pt-2 md:gap-4">
        {Array.from({ length: 6 }, (_, index) => <MovieCardSkeleton key={index} />)}
      </div>
    </section>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative h-[72vh] min-h-[500px] w-full overflow-hidden" aria-busy="true" aria-label="Loading featured titles">
      <Skeleton className="absolute inset-0 rounded-none bg-raised/40" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-20 md:px-10">
        <Skeleton className="mb-4 h-5 w-56" />
        <Skeleton className="h-12 w-4/5 max-w-2xl md:h-16" />
        <Skeleton className="mt-4 h-16 w-full max-w-2xl" />
        <div className="mt-7 flex gap-3">
          <Skeleton className="h-11 w-32" />
          <Skeleton className="h-11 w-28" />
        </div>
      </div>
    </section>
  );
}

export function HomeSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading 4PLEX">
      <HeroSkeleton />
      <div className="relative z-10 -mt-10">
        <MovieRowSkeleton title={false} />
        {Array.from({ length: 5 }, (_, index) => <MovieRowSkeleton key={index} />)}
      </div>
    </main>
  );
}

export function BrowseSkeleton({ title = "Loading catalog" }: { title?: string }) {
  return (
    <main className="mx-auto min-h-[60vh] max-w-[1500px] px-4 pb-20 pt-24 md:px-10" aria-busy="true" aria-label={`Loading ${title}`}>
      <Skeleton className="h-10 w-56" />
      {Array.from({ length: 3 }, (_, index) => <MovieRowSkeleton key={index} />)}
    </main>
  );
}

export function DetailPageSkeleton() {
  return (
    <main aria-busy="true" aria-label="Loading title details">
      <div className="relative h-[42vh] min-h-[260px] md:h-[52vh] md:min-h-[320px]">
        <Skeleton className="absolute inset-0 rounded-none bg-raised/50" />
      </div>
      <div className="relative z-10 mx-auto -mt-24 flex max-w-[1500px] flex-col gap-6 px-4 md:-mt-40 md:flex-row md:gap-8 md:px-10">
        <Skeleton className="mx-auto h-[216px] w-36 shrink-0 rounded-xl sm:h-[264px] sm:w-44 md:mx-0 md:h-[390px] md:w-64" />
        <div className="flex-1">
          <Skeleton className="h-10 w-4/5 max-w-xl md:h-14" />
          <Skeleton className="mt-3 h-4 w-48" />
          <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
          <Skeleton className="mt-2 h-5 w-3/4 max-w-2xl" />
          <Skeleton className="mt-2 h-5 w-2/3 max-w-2xl" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-11 w-32" />
            <Skeleton className="h-11 w-24" />
          </div>
        </div>
      </div>
      <div className="mt-12"><MovieRowSkeleton /></div>
    </main>
  );
}

export function WatchPageSkeleton() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-24 md:px-10" aria-busy="true" aria-label="Loading player">
      <Skeleton className="mb-5 h-5 w-36" />
      <Skeleton className="aspect-video rounded-xl bg-black/70" />
      <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
      <div className="mt-10"><MovieRowSkeleton /></div>
    </main>
  );
}
