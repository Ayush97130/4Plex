import { NextRequest, NextResponse } from "next/server";
import { tmdbService } from "@/services/tmdbService";
import { limited } from "@/lib/rateLimit";

// Client-side access (e.g. search suggestions). Keys never leave the server.
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (limited(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ results: [] });
  try { return NextResponse.json({ results: (await tmdbService.search(q)).slice(0, 20) }); }
  catch { return NextResponse.json({ error: "Search failed" }, { status: 502 }); }
}
