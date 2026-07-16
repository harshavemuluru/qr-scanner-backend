import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("entries")
    .select()
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Only flip checkedin when it's still false, so the QR code can be
  // redeemed exactly once even under concurrent scans of the same code.
  const { data, error } = await supabase
    .from("entries")
    .update({ checkedin: true })
    .eq("id", id)
    .eq("checkedin", false)
    .select()
    .single();

  if (data) {
    return NextResponse.json(data);
  }

  const { data: existing } = await supabase
    .from("entries")
    .select()
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  if (existing.checkedin) {
    return NextResponse.json({ error: "Already checked in", entry: existing }, { status: 409 });
  }

  return NextResponse.json({ error: error?.message ?? "Check-in failed" }, { status: 500 });
}
