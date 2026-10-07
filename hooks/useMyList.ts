"use client";
import { useCallback, useEffect, useState } from "react";
import type { Media } from "@/types/media";
// Temporary localStorage fallback — swap for an API-backed store when auth lands.
const KEY = "4plex:list";
export function useMyList() {
  const [items, setItems] = useState<Media[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { setItems(JSON.parse(localStorage.getItem(KEY) ?? "[]")); } catch {} setReady(true); }, []);
  const save = (n: Media[]) => { setItems(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {} };
  const has = useCallback((m: Pick<Media, "id" | "type">) => items.some((i) => i.id === m.id && i.type === m.type), [items]);
  const toggle = (m: Media) => save(has(m) ? items.filter((i) => !(i.id === m.id && i.type === m.type)) : [m, ...items]);
  return { items, ready, has, toggle };
}
