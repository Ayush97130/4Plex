export default function Loading() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 pt-24 md:px-10" aria-busy="true">
      <div className="h-[45vh] min-h-[280px] animate-pulse rounded-xl bg-raised/60" />
      <div className="mt-8 h-10 w-2/3 animate-pulse rounded bg-raised/60" />
      <div className="mt-4 h-24 max-w-3xl animate-pulse rounded bg-raised/40" />
    </div>
  );
}
