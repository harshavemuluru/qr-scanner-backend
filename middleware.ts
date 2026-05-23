import { type NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

function expectedToken(): string | null {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  return createHmac("sha256", secret).update("qr_admin_v1").digest("hex");
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("qr_admin_session")?.value;
  const expected = expectedToken();

  if (!expected || token !== expected) {
    // API routes get a 401, pages get redirected to login
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Protect onboard page and the entries collection endpoint.
  // /api/entries/[id] (verify + check-in) stays public.
  matcher: ["/onboard", "/api/entries"],
};
