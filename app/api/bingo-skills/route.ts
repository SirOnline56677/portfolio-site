import Anthropic from "@anthropic-ai/sdk";

// Optional upgrade for the Bingo onboarding prototype's "Here's what we
// heard" step: turns a spoken work history into 3–6 skill bubbles. The
// prototype always has a local keyword matcher and falls back to it on any
// non-2xx here, so this route can be absent, rate-limited, or keyless
// without breaking the demo. Nothing is logged or stored.

export const runtime = "nodejs";

const MAX_CHARS = 1500;
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 10;
const KINDS = new Set(["hard", "soft", "trait"]);

const SYSTEM = `You extract job skills from a spoken work history of an older adult looking for part-time work.
Reply with JSON only, no prose, exactly this shape:
{"skills":[{"label":"Waiting tables","kind":"hard"}]}
Rules: 3 to 6 items. Labels are 1 to 3 words in Title Case. "kind" is "hard" for a job or task they have done, "soft" for a people skill, "trait" for a way of working (reliable, patient, on my feet). Ignore anything that is not about work. Never invent details that were not said.`;

const hits = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 1000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
  h.count += 1;
  return h.count > PER_WINDOW;
}

type Skill = { label: string; kind: "hard" | "soft" | "trait" };

function parseSkills(raw: string): Skill[] | null {
  const text = raw.replace(/```(?:json)?/g, "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1)) as { skills?: unknown };
    if (!Array.isArray(obj.skills)) return null;
    const out: Skill[] = [];
    for (const s of obj.skills) {
      if (!s || typeof s !== "object") continue;
      const { label, kind } = s as { label?: unknown; kind?: unknown };
      if (typeof label !== "string" || typeof kind !== "string" || !KINDS.has(kind)) continue;
      const clean = label.trim().slice(0, 24);
      if (clean && !out.some((o) => o.label === clean)) out.push({ label: clean, kind: kind as Skill["kind"] });
      if (out.length >= 6) break;
    }
    return out.length ? out : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return Response.json({ error: "disabled" }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let text: unknown;
  try {
    ({ text } = (await request.json()) as { text?: unknown });
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim() || text.length > MAX_CHARS) {
    return Response.json({ error: "bad_input" }, { status: 400 });
  }

  try {
    const client = new Anthropic();
    const res = await client.messages.create(
      {
        model: "claude-haiku-4-5",
        max_tokens: 200,
        system: SYSTEM,
        messages: [{ role: "user", content: text }],
      },
      { timeout: 3500, maxRetries: 0 },
    );
    const block = res.content.find((b) => b.type === "text");
    const skills = block && block.type === "text" ? parseSkills(block.text) : null;
    if (!skills) return Response.json({ error: "unparseable" }, { status: 502 });
    return Response.json({ skills, source: "api" });
  } catch {
    return Response.json({ error: "upstream" }, { status: 502 });
  }
}
