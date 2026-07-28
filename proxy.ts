import { type NextRequest, NextResponse } from "next/server";

async function expectedToken(): Promise<string | null> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode("qr_admin_v1"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Everything is admin-gated by default except: the public registration
// page and its create endpoint, the root redirect, and login itself.
const PUBLIC_PAGES = new Set(["/", "/register", "/login"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PAGES.has(pathname)) {
    return NextResponse.next();
  }
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }
  if (pathname === "/api/entries" && request.method === "POST") {
    return NextResponse.next();
  }

  const token = request.cookies.get("qr_admin_session")?.value;
  const expected = await expectedToken();

  if (!expected || token !== expected) {
    // API routes get a 401, pages get redirected to login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match every route except static assets (anything with a file
  // extension) and Next.js internals — everything else goes through
  // the allow/deny logic above.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
