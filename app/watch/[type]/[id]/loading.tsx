export default function Loading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pt-24 md:px-10" aria-busy="true">
      <div className="mb-5 h-5 w-36 animate-pulse rounded bg-raised/60" />
      <div className="aspect-video animate-pulse rounded-xl bg-black shadow-2xl" />
    </section>
  );
}
