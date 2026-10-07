export default function Loading() {
  return (
    <main className="mx-auto min-h-[60vh] max-w-[1500px] px-4 pb-20 pt-24 md:px-10" aria-busy="true">
      <div className="h-10 w-56 animate-pulse rounded bg-raised/60" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="aspect-[2/3] animate-pulse rounded-xl bg-raised/50" />
        ))}
      </div>
    </main>
  );
}
