"use client";

import { useEffect } from "react";

export default function PerformanceMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("PerformanceObserver" in window)) return;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const interaction = entry as PerformanceEventTiming;
        if (interaction.duration >= 40) {
          console.info("[web-vitals] INP interaction", {
            duration: Math.round(interaction.duration),
            name: interaction.name,
          });
        }
      }
    });
    try {
      const options: PerformanceObserverInit & { durationThreshold?: number } = {
        type: "event",
        buffered: true,
        durationThreshold: 40,
      };
      observer.observe(options);
    } catch {
      observer.disconnect();
    }
    return () => observer.disconnect();
  }, []);

  return null;
}
