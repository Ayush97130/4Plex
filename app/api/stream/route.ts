import { NextRequest, NextResponse } from "next/server";
import { nexstreamService } from "@/services/nexstreamService";
import { limited } from "@/lib/rateLimit";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (limited(ip, 30)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const p = req.nextUrl.searchParams;
  const type = p.get("type"); const tmdbId = Number(p.get("id"));
  if ((type !== "movie" && type !== "tv") || !Number.isInteger(tmdbId) || tmdbId <= 0)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  try {
    const src = await nexstreamService.getPlayback({ type, tmdbId, season: Number(p.get("s")) || undefined, episode: Number(p.get("e")) || undefined });
    return NextResponse.json(src);
  } catch { return NextResponse.json({ error: "Playback unavailable" }, { status: 502 }); }
}
