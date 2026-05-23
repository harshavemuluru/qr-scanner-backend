import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { sendQREmail } from "@/utils/send-qr-email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const body = await request.json();

  const { name, email, number } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (!number?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({ name: name.trim(), email: email.trim(), number: number.trim() })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send QR pass email — non-blocking, entry is already saved if this fails
  try {
    await sendQREmail(data);
  } catch (emailErr) {
    console.error("QR email send failed:", emailErr);
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("entries")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
