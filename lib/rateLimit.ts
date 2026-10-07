const hits = new Map<string, { n: number; reset: number }>();
export function limited(ip: string, max = 60, windowMs = 60_000) {
  const now = Date.now(); const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + windowMs }); return false; }
  return ++h.n > max;
}
