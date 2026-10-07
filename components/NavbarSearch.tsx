"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { scheduleRecordEvent } from "@/lib/recommendations";

export default function NavbarSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => setValue(new URLSearchParams(window.location.search).get("q") ?? "");
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [mobileOpen]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = value.trim();
    if (next) scheduleRecordEvent({ type: "search", query: next });
    router.push(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
    setMobileOpen(false);
  }

  const input = (
    <input
      ref={inputRef}
      type="search"
      aria-label="Search movies and TV shows"
      inputMode="search"
      autoComplete="off"
      enterKeyHint="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setMobileOpen(false);
          mobileButtonRef.current?.focus();
        }
      }}
      placeholder="Search titles"
      className="min-h-10 w-full rounded-full border-0 bg-transparent px-4 py-2 text-base text-bone outline-none transition-colors duration-200 placeholder:text-mute focus:outline-none focus:ring-0 md:text-sm"
    />
  );

  return (
    <form onSubmit={submit} className={`relative flex min-w-0 items-center rounded-full ${mobileOpen ? "md:rounded-full" : ""}`}>
      <div className={`rounded-full border border-white/10 bg-ink/[.98] transition-[border-color,background-color,box-shadow] duration-200 focus-within:border-ember/70 focus-within:bg-white/[.1] focus-within:shadow-[0_0_0_3px_rgba(233,162,59,0.12)] ${mobileOpen ? "absolute right-0 top-[calc(100%+.5rem)] z-50 block w-[min(calc(100vw-2rem),18rem)]" : "hidden"} md:static md:z-auto md:block md:w-40`}>
        {input}
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="hidden h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.04] text-mute transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white md:ml-1 md:grid"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </button>
      <button
        ref={mobileButtonRef}
        type="button"
        aria-label={mobileOpen ? "Close search" : "Open search"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((open) => !open)}
        className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.04] text-mute transition-all hover:border-white/20 hover:bg-white/10 hover:text-white md:hidden"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      </button>
    </form>
  );
}
