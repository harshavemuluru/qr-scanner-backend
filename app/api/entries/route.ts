import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { cleanAdults, cleanKids, type Adult, type Kid } from "@/utils/validate-entry";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const body = await request.json();

  const { adults, kids, number } = body;

  const cleanedAdults = cleanAdults(adults);
  if (typeof cleanedAdults === "string") {
    return NextResponse.json({ error: cleanedAdults }, { status: 400 });
  }
  const cleanedKids = cleanKids(kids);
  if (typeof cleanedKids === "string") {
    return NextResponse.json({ error: cleanedKids }, { status: 400 });
  }
  if (!number?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      adults: cleanedAdults,
      kids: cleanedKids,
      number: number.trim(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This phone number is already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("entries")
    .select()
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();
  if (!q) {
    return NextResponse.json(data);
  }

  const matches = (data ?? []).filter((entry) => {
    const haystack = [
      entry.number,
      entry.name,
      entry.child_name,
      ...((entry.adults ?? []) as Adult[]).map((a) => a.name),
      ...((entry.kids ?? []) as Kid[]).map((k) => k.name),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });

  return NextResponse.json(matches);
}
