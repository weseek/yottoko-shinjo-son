import { type NextRequest, NextResponse } from "next/server";

// Edge Runtime では node:crypto が使えないため better-auth をインポートできない。
// Cookie の有無で一次チェックし、実際の DB セッション検証は (protected)/layout.tsx（Node.js 環境）で行う。
// HTTPS 環境では Better Auth が `__Secure-` prefix 付きで cookie を発行するため両方を見る。
const SESSION_COOKIE_NAME = "better-auth.session_token";
const SECURE_SESSION_COOKIE_NAME = "__Secure-better-auth.session_token";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith("/api/admin");
  const sessionToken =
    request.cookies.get(SECURE_SESSION_COOKIE_NAME) ??
    request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionToken) {
    if (isApiRoute) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // /admin（トップ）と /admin/login 以外の /admin/* を保護
    "/admin",
    "/admin/((?!login).*)",
    "/api/admin/:path*",
  ],
};
