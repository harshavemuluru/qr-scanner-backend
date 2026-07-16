import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const body = await request.json();

  const { name, childName, age, number } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!childName?.trim()) {
    return NextResponse.json({ error: "Child's name is required" }, { status: 400 });
  }
  const ageNum = Number(age);
  if (!Number.isInteger(ageNum) || ageNum < 0) {
    return NextResponse.json({ error: "Age must be a valid non-negative number" }, { status: 400 });
  }
  if (!number?.trim()) {
    return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("entries")
    .insert({
      name: name.trim(),
      child_name: childName.trim(),
      age: ageNum,
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
