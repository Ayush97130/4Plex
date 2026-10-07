"use client";
export default function ErrorState({ reset, message = "Something went wrong." }: { reset?: () => void; message?: string }) {
  return (
    <div role="alert" className="grid place-items-center gap-4 px-4 py-24 text-center">
      <p className="text-xl font-bold">{message}</p>
      <p className="max-w-sm text-sm text-mute">We couldn’t load this. Check your connection or API keys, then try again.</p>
      {reset && <button type="button" onClick={reset} className="rounded-lg bg-ember px-6 py-3 font-bold text-ink hover:brightness-110">Try Again</button>}
    </div>
  );
}
