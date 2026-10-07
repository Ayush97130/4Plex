"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/types/media";
import MediaCard from "./MediaCard";

export default function ContentRow({ title, items }: { title: string; items: Media[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const rail = railRef.current;
      if (!rail) return;
      const nextCanScrollLeft = rail.scrollLeft > 0;
      const nextCanScrollRight = rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 1;
      setCanScrollLeft((current) => current === nextCanScrollLeft ? current : nextCanScrollLeft);
      setCanScrollRight((current) => current === nextCanScrollRight ? current : nextCanScrollRight);
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, items]);

  const scrollRail = (direction: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction === "right" ? rail.clientWidth * 0.8 : -rail.clientWidth * 0.8, behavior: "smooth" });
  };

  if (!items.length) return null;
  return (
    <section aria-label={title} className="mt-14 first:mt-0">
      <div className="mb-3 flex items-end justify-between px-4 md:px-10">
        <div>
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[.28em] text-ember">4PLEX COLLECTION</p>
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h2>
        </div>
        <span className="hidden text-xs font-semibold uppercase tracking-widest text-mute sm:block">{items.length} titles</span>
      </div>
      <div className="relative rail-fade">
        <button
          type="button"
          aria-label={`Scroll ${title} left`}
          onClick={() => scrollRail("left")}
          disabled={!canScrollLeft}
          className="motion-lift absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 p-2 text-bone shadow-lg backdrop-blur-sm transition hover:bg-black/70 disabled:pointer-events-none disabled:opacity-0 md:left-4 md:grid"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div ref={railRef} className="rail flex gap-3 overflow-x-auto px-4 pb-6 pt-2 md:gap-4">
          {items.slice(0, 20).map((m) => <MediaCard key={`${m.type}-${m.id}`} m={m} />)}
        </div>
        <button
          type="button"
          aria-label={`Scroll ${title} right`}
          onClick={() => scrollRail("right")}
          disabled={!canScrollRight}
          className="motion-lift absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/45 p-2 text-bone shadow-lg backdrop-blur-sm transition hover:bg-black/70 disabled:pointer-events-none disabled:opacity-0 md:right-4 md:grid"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  );
}
