export interface Adult {
  name: string;
}

export interface Kid {
  name: string;
  age: number;
}

export function cleanAdults(raw: unknown): Adult[] | string {
  if (!Array.isArray(raw)) return "Adults must be a list";
  const cleaned = raw
    .map((a) => (a && typeof a === "object" ? String((a as { name?: unknown }).name ?? "").trim() : ""))
    .filter((name) => name.length > 0)
    .map((name) => ({ name }));
  if (cleaned.length === 0) return "At least one adult is required";
  if (cleaned.length > 2) return "A maximum of 2 adults is allowed per registration";
  return cleaned;
}

export function cleanKids(raw: unknown): Kid[] | string {
  if (!Array.isArray(raw)) return "Kids must be a list";
  const cleaned: Kid[] = [];
  for (const item of raw) {
    const name = item && typeof item === "object" ? String((item as { name?: unknown }).name ?? "").trim() : "";
    if (!name) continue;
    const ageNum = Number((item as { age?: unknown }).age);
    if (!Number.isInteger(ageNum) || ageNum < 0) {
      return `Enter a valid age for ${name}`;
    }
    cleaned.push({ name, age: ageNum });
  }
  if (cleaned.length === 0) return "At least one kid is required";
  if (cleaned.length > 3) {
    return "A maximum of 3 kids is allowed per registration — please contact the admin to register more";
  }
  return cleaned;
}
