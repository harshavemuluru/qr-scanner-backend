import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const COOKIE = "qr_admin_session";

function makeToken(secret: string): string {
  return createHmac("sha256", secret).update("qr_admin_v1").digest("hex");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const passcode: unknown = body?.passcode;
  const adminSecret = process.env.ADMIN_SECRET;

  if (!adminSecret || typeof passcode !== "string" || !passcode) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Constant-time comparison to prevent timing attacks
  const inputBuf = Buffer.from(passcode);
  const secretBuf = Buffer.from(adminSecret);
  const match =
    inputBuf.length === secretBuf.length &&
    timingSafeEqual(inputBuf, secretBuf);

  if (!match) {
    return NextResponse.json({ error: "Invalid passcode" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE, makeToken(adminSecret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE);
  return response;
}
