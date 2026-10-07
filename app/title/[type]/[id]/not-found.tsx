import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 pt-24 text-center">
      <div>
        <p className="text-ember">404</p>
        <h1 className="mt-2 text-3xl font-extrabold">Title not found</h1>
        <p className="mt-3 text-mute">This movie or show is not available on TMDB.</p>
        <Link href="/" className="mt-6 inline-block rounded-lg bg-ember px-6 py-3 font-bold text-ink">Back home</Link>
      </div>
    </main>
  );
}
