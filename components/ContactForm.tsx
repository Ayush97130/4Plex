"use client";

import { FormEvent, useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setBusy(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const values = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      website: formData.get("website"),
    };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(values) });
      const body = await response.json() as { message?: string };
      if (!response.ok) throw new Error(body.message || "Unable to send your message.");
      form.reset();
      setStatus(body.message || "Your message was received.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send your message.");
    } finally {
      setBusy(false);
    }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-panel/70 p-6">
    <label className="block text-sm font-semibold">Name<input name="name" required maxLength={100} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-base outline-none focus:border-ember" /></label>
    <label className="block text-sm font-semibold">Email<input name="email" type="email" required maxLength={254} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-base outline-none focus:border-ember" /></label>
    <label className="block text-sm font-semibold">Subject<input name="subject" required maxLength={160} className="mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-ink px-4 py-3 text-base outline-none focus:border-ember" /></label>
    <label className="block text-sm font-semibold">Message<textarea name="message" required maxLength={4000} rows={6} className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-ink px-4 py-3 text-base outline-none focus:border-ember" /></label>
    <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
    <button disabled={busy} className="min-h-11 rounded-lg bg-ember px-6 py-3 font-bold text-ink disabled:opacity-60">{busy ? "Sending..." : "Send message"}</button>
    {status && <p role="status" className="text-sm text-mute">{status}</p>}
  </form>;
}
