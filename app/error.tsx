"use client";
import ErrorState from "@/components/ErrorState";
export default function Error({ error, reset }: { error: Error & { digest?: string; status?: number }; reset: () => void }) {
  console.error("[app] route error", { name: error.name, message: error.message, status: error.status, digest: error.digest });
  return <div className="pt-24"><ErrorState reset={reset} /></div>;
}
