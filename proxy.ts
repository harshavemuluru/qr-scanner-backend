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

export async function proxy(request: NextRequest) {
  // POST /api/entries is the public registration endpoint — anyone can
  // create an entry. Listing entries (GET) stays admin-only.
  if (request.nextUrl.pathname === "/api/entries" && request.method === "POST") {
    return NextResponse.next();
  }

  const token = request.cookies.get("qr_admin_session")?.value;
  const expected = await expectedToken();

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
