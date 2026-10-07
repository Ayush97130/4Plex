import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const destination = next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, requestUrl.origin));
    return NextResponse.redirect(new URL(`/auth?error=oauth&message=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL("/auth?error=oauth&message=missing_code", requestUrl.origin));
}
