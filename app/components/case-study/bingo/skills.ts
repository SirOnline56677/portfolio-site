// Skill extraction for 3b "Here's what we heard". The local matcher always
// runs and always answers; the API route is an optional upgrade that
// replaces the bubbles if it comes back in time. Nothing here persists.

export type SkillKind = "hard" | "soft" | "trait";
export type Skill = { label: string; kind: SkillKind; fresh?: boolean };

const DICT: { re: RegExp; label: string; kind: SkillKind }[] = [
  { re: /\b(wait(ed|ing|er|ress)?|server|serving|tables|diner|restaurant)\b/i, label: "Waiting tables", kind: "hard" },
  { re: /\b(sold|sales|selling|salesman|saleswoman|dealership)\b/i, label: "Sales", kind: "hard" },
  { re: /\b(cashier|register|checkout)\b/i, label: "Cashier", kind: "hard" },
  { re: /\b(teach|teacher|taught|tutor|classroom)\b/i, label: "Teaching", kind: "hard" },
  { re: /\b(drove|driver|driving|delivery|deliveries|truck)\b/i, label: "Driving", kind: "hard" },
  { re: /\b(cook|cooking|kitchen|chef|baking|baker)\b/i, label: "Cooking", kind: "hard" },
  { re: /\b(nurse|nursing|caregiver|caregiving|cared for|home care|aide)\b/i, label: "Caregiving", kind: "hard" },
  { re: /\b(office|admin|clerk|filing|receptionist|secretary|bookkeeping)\b/i, label: "Admin", kind: "hard" },
  { re: /\b(retail|store|shop|stock|shelves)\b/i, label: "Retail", kind: "hard" },
  { re: /\b(people|customers|talking|talk to|chat|friendly)\b/i, label: "Communication", kind: "soft" },
  { re: /\b(customer service|help(ing|ed)? people|service)\b/i, label: "Customer service", kind: "soft" },
  { re: /\b(team|together|coworkers|crew)\b/i, label: "Teamwork", kind: "soft" },
  { re: /\b(on my feet|standing|active|moving around)\b/i, label: "On my feet", kind: "trait" },
  { re: /\b(patient|patience|calm)\b/i, label: "Patience", kind: "trait" },
  { re: /\b(organi[sz]ed|tidy|neat)\b/i, label: "Organised", kind: "trait" },
  { re: /\b(reliable|on time|never late|dependable)\b/i, label: "Reliable", kind: "trait" },
  { re: /\b(quick learner|fast learner|pick things up|learn fast)\b/i, label: "Quick learner", kind: "trait" },
];

export const MAX_SKILLS = 6;

export function extractSkillsLocal(text: string): Skill[] {
  const out: Skill[] = [];
  for (const d of DICT) {
    if (d.re.test(text) && !out.some((s) => s.label === d.label)) out.push({ label: d.label, kind: d.kind });
    if (out.length >= MAX_SKILLS) break;
  }
  return out;
}

/** "add cashier" / "also driving" → a skill; unknown words become a fresh hard skill. */
export function skillFromSpeech(text: string): Skill | null {
  const m = text.match(/\b(?:add|also|and|put|include)\s+(.+)$/i);
  const phrase = (m ? m[1] : text).replace(/[.!,]/g, "").trim();
  if (!phrase) return null;
  const hit = DICT.find((d) => d.re.test(phrase));
  if (hit) return { label: hit.label, kind: hit.kind, fresh: true };
  const words = phrase.split(/\s+/).slice(0, 3);
  const label = words.map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  return { label, kind: "hard", fresh: true };
}

export function removeSkillFromSpeech(text: string, skills: Skill[]): string | null {
  const m = text.match(/\b(?:remove|take off|take out|drop|not|delete)\s+(.+)$/i);
  if (!m) return null;
  const want = m[1].toLowerCase();
  const hit = skills.find((s) => want.includes(s.label.toLowerCase()) || s.label.toLowerCase().includes(want.split(" ")[0]));
  return hit ? hit.label : null;
}

const KINDS = new Set<SkillKind>(["hard", "soft", "trait"]);

/** Optional server upgrade. Resolves null on ANY failure so the caller keeps the local list. */
export async function fetchSkills(text: string, signal?: AbortSignal): Promise<Skill[] | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 4000);
  signal?.addEventListener("abort", () => ctrl.abort());
  try {
    const res = await fetch("/api/bingo-skills", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    const list = (data as { skills?: unknown })?.skills;
    if (!Array.isArray(list)) return null;
    const clean = list
      .filter((s): s is Skill => !!s && typeof s.label === "string" && KINDS.has((s as Skill).kind))
      .map((s) => ({ label: s.label.slice(0, 24), kind: s.kind }))
      .slice(0, MAX_SKILLS);
    return clean.length ? clean : null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}
