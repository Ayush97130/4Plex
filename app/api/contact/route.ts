import { NextRequest, NextResponse } from "next/server";
import { limited } from "@/lib/rateLimit";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) => typeof value === "string" ? value.replace(/[<>]/g, "").trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(`contact:${ip}`, 5, 60 * 60_000)) return NextResponse.json({ message: "Too many messages. Please try again later." }, { status: 429 });
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20_000) return NextResponse.json({ message: "Message is too large." }, { status: 413 });
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; } catch { return NextResponse.json({ message: "Invalid request." }, { status: 400 }); }
  if (clean(body.website, 100)) return NextResponse.json({ message: "Message received." });
  const name = clean(body.name, 100);
  const email = clean(body.email, 254);
  const subject = clean(body.subject, 160);
  const message = clean(body.message, 4000);
  if (!name || !emailPattern.test(email) || !subject || !message) return NextResponse.json({ message: "Please provide a valid name, email, subject, and message." }, { status: 400 });
  if (!process.env.CONTACT_EMAIL) return NextResponse.json({ message: "Contact delivery is not configured yet. Please set CONTACT_EMAIL for the site administrator." }, { status: 503 });
  console.info("[contact] validated message", { name, emailDomain: email.split("@")[1], subject });
  return NextResponse.json({ message: "Your message was received. We will get back to you soon." });
}
