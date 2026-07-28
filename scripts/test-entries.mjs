import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error("Missing env vars.");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

async function assertTableExists() {
  const { error } = await supabase.from("entries").select("id").limit(1);

  if (error) {
    if (error.message?.includes("Could not find the table 'public.entries'")) {
      console.error("Table public.entries does not exist in your Supabase project.");
      console.error("Run scripts/setup_entries.sql in the Supabase SQL Editor, then retry.");
      process.exit(1);
    }

    console.error("Failed while checking table access:", error.message);
    process.exit(1);
  }
}

async function run() {
  await assertTableExists();

  const now = Date.now();
  const sample = [
    {
      adults: [{ name: `Test Adult ${now}-1` }],
      kids: [{ name: `Test Kid ${now}-1`, age: 7 }],
      number: `+1 555 ${now.toString().slice(-6)}1`,
    },
    {
      adults: [{ name: `Test Adult ${now}-2a` }, { name: `Test Adult ${now}-2b` }],
      kids: [{ name: `Test Kid ${now}-2`, age: 9 }],
      number: `+1 555 ${now.toString().slice(-6)}2`,
    },
  ];

  const { data: inserted, error: insertError } = await supabase
    .from("entries")
    .insert(sample)
    .select();

  if (insertError) {
    console.error("Insert failed:", insertError.message);
    process.exit(1);
  }

  const firstId = inserted?.[0]?.id;
  if (!firstId) {
    console.error("Insert succeeded but no id returned.");
    process.exit(1);
  }

  const { data: updated, error: updateError } = await supabase
    .from("entries")
    .update({ checkedin: true })
    .eq("id", firstId)
    .select()
    .single();

  if (updateError) {
    console.error("Update failed:", updateError.message);
    process.exit(1);
  }

  const { data: latest, error: selectError } = await supabase
    .from("entries")
    .select("id,adults,kids,number,checkedin,created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (selectError) {
    console.error("Select failed:", selectError.message);
    process.exit(1);
  }

  console.log("Entries test passed.");
  console.log("Inserted rows:", inserted.length);
  console.log("Updated row id:", updated.id, "checkedin:", updated.checkedin);
  console.log("Latest rows snapshot:");
  console.table(latest);
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});