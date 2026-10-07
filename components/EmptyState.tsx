export default function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return <div className="px-4 py-20 text-center"><p className="text-lg font-semibold">{message}</p>{hint && <p className="mt-2 text-sm text-mute">{hint}</p>}</div>;
}
