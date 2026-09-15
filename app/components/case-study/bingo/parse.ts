// Pure parsers for what a person says (or types) at each onboarding step.
// Deliberately small and forgiving: a senior speaking to a phone, transcribed
// by the browser, will not produce clean input. Everything here is
// deterministic and runs offline; nothing leaves the browser.

const WORD_NUM: Record<string, string> = {
  zero: "0", oh: "0", o: "0", one: "1", two: "2", to: "2", too: "2", three: "3", four: "4", for: "4",
  five: "5", six: "6", seven: "7", eight: "8", ate: "8", nine: "9",
};

/** "one two three" / "double five" / "1-2-3" → a digit string. */
export function spokenDigits(text: string): string {
  const out: string[] = [];
  let repeat = 1;
  for (const raw of text.toLowerCase().split(/[\s,.-]+/)) {
    const w = raw.replace(/[^a-z0-9]/g, "");
    if (!w) continue;
    if (w === "double") { repeat = 2; continue; }
    if (w === "triple") { repeat = 3; continue; }
    const d = /^\d+$/.test(w) ? w : WORD_NUM[w];
    if (d != null) { out.push(d.repeat(repeat)); }
    repeat = 1;
  }
  return out.join("");
}

/** Last 10 digits heard, formatted (123) 456-7890; null if fewer. */
export function parsePhone(text: string): string | null {
  const d = spokenDigits(text).replace(/^1(?=\d{10}$)/, "");
  if (d.length < 10) return null;
  const n = d.slice(-10);
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

export function formatPhone(digits: string): string {
  const n = digits.replace(/\D/g, "").slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 6) return `(${n.slice(0, 3)}) ${n.slice(3)}`;
  return `(${n.slice(0, 3)}) ${n.slice(3, 6)}-${n.slice(6)}`;
}

const STATES: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA", colorado: "CO",
  connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA", hawaii: "HI", idaho: "ID",
  illinois: "IL", indiana: "IN", iowa: "IA", kansas: "KS", kentucky: "KY", louisiana: "LA",
  maine: "ME", maryland: "MD", massachusetts: "MA", michigan: "MI", minnesota: "MN",
  mississippi: "MS", missouri: "MO", montana: "MT", nebraska: "NE", nevada: "NV",
  "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
  "north carolina": "NC", "north dakota": "ND", ohio: "OH", oklahoma: "OK", oregon: "OR",
  pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD",
  tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
};
const STATE_ABBRS = new Set(Object.values(STATES));

const STREET_TYPES =
  "street|st|avenue|ave|road|rd|boulevard|blvd|lane|ln|drive|dr|place|pl|court|ct|way|terrace|parkway|pkwy";

export type Address = { street?: string; city?: string; state?: string; zip?: string };

const title = (s: string) =>
  s.trim().split(/\s+/).map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w)).join(" ");

/** Partial on purpose: 2a fills line by line while the person is still talking. */
export function parseAddress(text: string): Address {
  const out: Address = {};
  // Leading spoken number ("fourteen" is beyond WORD_NUM; digits and "one four" both work).
  let t = text.trim().replace(/^(i live at|i'm at|my address is|it's|at)\s+/i, "");
  const lead = t.match(/^((?:\d+|zero|one|two|three|four|five|six|seven|eight|nine)(?:[\s-](?:zero|one|two|three|four|five|six|seven|eight|nine))*)\s+/i);
  if (lead) {
    const num = /^\d+$/.test(lead[1]) ? lead[1] : spokenDigits(lead[1]);
    t = num + " " + t.slice(lead[0].length);
  }
  const street = t.match(new RegExp(`^(\\d+[a-z]?)\\s+(.+?)\\s+(${STREET_TYPES})\\b\\.?`, "i"));
  let rest = t;
  if (street) {
    const type = street[3].toLowerCase();
    const full: Record<string, string> = { st: "Street", ave: "Avenue", rd: "Road", blvd: "Boulevard", ln: "Lane", dr: "Drive", pl: "Place", ct: "Court", pkwy: "Parkway" };
    out.street = `${street[1]} ${title(street[2])} ${full[type] ?? title(type)}`;
    rest = t.slice(street[0].length);
  }
  const zip = rest.match(/\b(\d{5})\b/) ?? (spokenDigits(rest).match(/(\d{5})$/) as RegExpMatchArray | null);
  if (zip) { out.zip = zip[1]; rest = rest.replace(zip[0], " "); }
  const low = rest.toLowerCase();
  for (const [name, abbr] of Object.entries(STATES)) {
    const re = new RegExp(`\\b${name}\\b`);
    if (re.test(low)) { out.state = abbr; rest = rest.replace(new RegExp(`\\b${name}\\b`, "i"), " "); break; }
  }
  if (!out.state) {
    const ab = rest.match(/\b([A-Z]{2})\b/);
    if (ab && STATE_ABBRS.has(ab[1])) { out.state = ab[1]; rest = rest.replace(ab[0], " "); }
  }
  const city = rest.replace(/\b(in|and|comma|zip|zip code)\b/gi, " ").replace(/[,.]/g, " ").replace(/\d+/g, " ").trim();
  if (city) out.city = title(city.split(/\s+/).slice(0, 3).join(" "));
  return out;
}

/** "Steve is fine" / "call me Steve" / "Stephen" → "Steve". */
export function parseName(text: string): string | null {
  const t = text.trim().replace(/[.!,]/g, "");
  const m = t.match(/(?:call me|it's|its|i'm|i am|name is|go by|just)\s+([a-z]+)/i);
  const word = m ? m[1] : t.split(/\s+/)[0];
  if (!word || /^(yes|no|fine|ok|okay|that's|thats)$/i.test(word)) return null;
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export const WHY = ["A bit of extra income", "Stay active", "Get out and meet people", "Try something new"];
export function parseWhy(text: string): number[] {
  const t = text.toLowerCase();
  const hits: number[] = [];
  if (/\b(money|income|cash|pay|paycheck|bills|extra|dollar)/.test(t)) hits.push(0);
  if (/\b(active|moving|busy|bored|routine|exercise)/.test(t)) hits.push(1);
  if (/\b(people|out of the house|social|meet|lonely|company|friends)/.test(t)) hits.push(2);
  if (/\b(new|different|learn|try|change)/.test(t)) hits.push(3);
  return hits;
}

export const TRANSPORT = ["I walk", "Bus or train", "I drive", "Someone drives me"];
export function parseTransport(text: string): number | null {
  const t = text.toLowerCase();
  if (/\b(drives me|someone|my (son|daughter|wife|husband|friend)|a ride|lift|get a ride)/.test(t)) return 3;
  if (/\b(bus|train|subway|transit|metro)/.test(t)) return 1;
  if (/\b(drive|car|driving)/.test(t)) return 2;
  if (/\b(walk|foot|walking)/.test(t)) return 0;
  return null;
}

export const MINUTES = [15, 30, 45, 60];
export function parseMinutes(text: string): number | null {
  const t = text.toLowerCase();
  if (/\b(three quarters|forty[- ]?five)/.test(t)) return 45;
  if (/\b(quarter|fifteen)/.test(t)) return 15;
  if (/\b(half|thirty)/.test(t)) return 30;
  if (/\b(an hour|one hour|hour|sixty)/.test(t)) return 60;
  const n = t.match(/\b(\d{1,3})\s*(min|minutes)?/);
  if (n) {
    const v = Number(n[1]);
    return MINUTES.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
  }
  return null;
}

export const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_RE = [/\bsun/, /\bmon/, /\btue/, /\bwed/, /\bthu/, /\bfri/, /\bsat/];
export type Tod = "morning" | "midday" | "evening";
export const TOD_LABEL: Record<Tod, string> = { morning: "Morning", midday: "Mid-day", evening: "Evening" };

export function parseDaysTime(text: string): { days?: boolean[]; tod?: Tod } {
  const t = text.toLowerCase();
  const out: { days?: boolean[]; tod?: Tod } = {};
  let days: boolean[] | null = null;
  const set = (i: number) => { (days ??= Array(7).fill(false))[i] = true; };
  if (/\bweekdays?\b/.test(t)) [1, 2, 3, 4, 5].forEach(set);
  if (/\bweekends?\b/.test(t)) [0, 6].forEach(set);
  if (/\b(every ?day|any ?day|all week)\b/.test(t)) [0, 1, 2, 3, 4, 5, 6].forEach(set);
  const range = t.match(/\b(sun|mon|tue|wed|thu|fri|sat)\w*\s+(?:through|to|thru)\s+(sun|mon|tue|wed|thu|fri|sat)/);
  if (range) {
    const a = DAY_RE.findIndex((r) => r.test(range[1])), b = DAY_RE.findIndex((r) => r.test(range[2]));
    if (a >= 0 && b >= 0) for (let i = a; ; i = (i + 1) % 7) { set(i); if (i === b) break; }
  } else {
    DAY_RE.forEach((r, i) => { if (r.test(t)) set(i); });
  }
  if (days) out.days = days;
  if (/\b(morning|mornings|early|a\.?m\b)/.test(t)) out.tod = "morning";
  else if (/\b(noon|midday|mid-day|lunch|afternoon|afternoons)/.test(t)) out.tod = "midday";
  else if (/\b(evening|evenings|night|nights|late|p\.?m\b)/.test(t)) out.tod = "evening";
  return out;
}

/** "Tuesdays and Thursdays, mornings" — the Done row on 3c. */
export function describeWeek(days: boolean[], tod: Tod | null): string | null {
  const picked = days.map((on, i) => (on ? i : -1)).filter((i) => i >= 0);
  if (!picked.length && !tod) return null;
  let d = "";
  if (picked.length === 7) d = "Every day";
  else if (picked.length === 5 && picked.every((i) => i >= 1 && i <= 5)) d = "Weekdays";
  else if (picked.length) {
    const names = picked.map((i) => DAY_NAMES[i] + "s");
    d = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0];
  }
  const tl = tod ? (tod === "midday" ? "mid-day" : tod + "s") : "";
  return [d, tl].filter(Boolean).join(", ");
}

export const AVOID = ["Standing for a long time", "Heavy lifting", "Stairs", "Working alone"];
export function parseAvoid(text: string): number[] {
  const t = text.toLowerCase();
  const hits: number[] = [];
  if (/\b(stand|standing|on my feet)/.test(t)) hits.push(0);
  if (/\b(lift|lifting|heavy|carry)/.test(t)) hits.push(1);
  if (/\b(stairs|steps|climb)/.test(t)) hits.push(2);
  if (/\b(alone|by myself|on my own)/.test(t)) hits.push(3);
  return hits;
}

export const isYes = (t: string) => /\b(yes|yeah|yep|yup|right|correct|that's right|looks good|looks right|good|sure|confirm|keep going)\b/i.test(t);
export const isNo = (t: string) => /\b(no|nope|wrong|not right|change|fix|again)\b/i.test(t);
export const isSkip = (t: string) => /\b(skip|nothing|none|no thanks|all good|i'm fine|im fine)\b/i.test(t);
export const isLater = (t: string) => /\b(later|not now|no thanks|skip)\b/i.test(t);
export const isReadThem = (t: string) => /\b(read|yes|sure|go ahead|please)\b/i.test(t);
