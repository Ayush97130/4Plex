import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/redirect";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/auth" || pathname.startsWith("/auth/");
  const isPublicRoute = pathname === "/" || ["/movies", "/tv", "/trending", "/genres", "/search", "/about", "/contact", "/privacy", "/terms", "/sitemap.xml", "/robots.txt", "/api/contact", "/api/tmdb", "/api/stream"].includes(pathname) || pathname.startsWith("/title/") || pathname.startsWith("/watch/");
  const isProtectedRoute = pathname === "/my-list" || pathname === "/profile" || pathname.startsWith("/settings/") || pathname.startsWith("/history/");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (isAuthRoute || isPublicRoute || !isProtectedRoute) return response;
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("error", "config");
    const nextPath = getSafeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
    if (nextPath) loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/auth", request.url);
    const nextPath = getSafeNextPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
    if (nextPath) loginUrl.searchParams.set("next", nextPath);
    const redirectResponse = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)"],
};
