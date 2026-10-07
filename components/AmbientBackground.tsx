"use client";

import { useEffect, useState } from "react";

type AmbientDetail = { image: string; color?: string };
const DEFAULT_COLOR = "rgba(233, 162, 59, .16)";
const colorCache = new Map<string, string>();

function readAccent(image: string) {
  const cached = colorCache.get(image);
  if (cached) return cached;
  if (typeof document === "undefined") return DEFAULT_COLOR;

  const source = new Image();
  source.crossOrigin = "anonymous";
  source.src = image;
  source.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) return;
    try {
      context.drawImage(source, 0, 0, 1, 1);
      const [red, green, blue] = context.getImageData(0, 0, 1, 1).data;
      colorCache.set(image, `rgba(${Math.round(red * .35)}, ${Math.round(green * .35)}, ${Math.round(blue * .35)}, .2)`);
      window.dispatchEvent(new CustomEvent("4plex:ambient-color", { detail: { image } }));
    } catch {
      colorCache.set(image, DEFAULT_COLOR);
    }
  };
  return DEFAULT_COLOR;
}

export default function AmbientBackground() {
  const [current, setCurrent] = useState<AmbientDetail | null>(null);
  const [previous, setPrevious] = useState<AmbientDetail | null>(null);

  useEffect(() => {
    const update = (event: Event) => {
      const detail = (event as CustomEvent<AmbientDetail>).detail;
      if (!detail?.image) {
        setPrevious(current);
        setCurrent(null);
        window.setTimeout(() => setPrevious(null), 1200);
        return;
      }
      if (detail.image === current?.image) return;
      const previousValue = current;
      setPrevious(previousValue);
      setCurrent({ ...detail, color: detail.color ?? readAccent(detail.image) });
      window.setTimeout(() => setPrevious((value) => value?.image === previousValue?.image ? null : value), 1200);
    };
    const refreshColor = (event: Event) => {
      const image = (event as CustomEvent<{ image: string }>).detail?.image;
      if (image && image === current?.image) setCurrent((value) => value ? { ...value, color: colorCache.get(image) ?? value.color } : value);
    };
    window.addEventListener("4plex:ambient", update);
    window.addEventListener("4plex:ambient-color", refreshColor);
    return () => {
      window.removeEventListener("4plex:ambient", update);
      window.removeEventListener("4plex:ambient-color", refreshColor);
    };
  }, [current]);

  return (
    <div className="ambient-layer" aria-hidden="true">
      {previous && <div className="ambient-art ambient-art-previous" style={{ backgroundImage: `url("${previous.image}")` }} />}
      {current && <div className="ambient-art ambient-art-current" style={{ backgroundImage: `url("${current.image}")`, ["--ambient-accent" as string]: current.color ?? DEFAULT_COLOR }} />}
      <div className="ambient-overlay" />
    </div>
  );
}
