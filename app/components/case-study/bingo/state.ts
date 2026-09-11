import {
  parseAddress,
  parseAvoid,
  parseDaysTime,
  parseMinutes,
  parseName,
  parsePhone,
  parseTransport,
  parseWhy,
  isNo,
  isSkip,
  isYes,
  type Tod,
} from "./parse";
import { extractSkillsLocal, removeSkillFromSpeech, skillFromSpeech, type Skill, MAX_SKILLS } from "./skills";

// One reducer for the whole flow. Voice and typing both land in HEARD /
// SET_ANSWER, so there is exactly one way each answer gets into state, and
// nothing here touches storage: a refresh is a new person.

export type ScreenId =
  | "name" | "00" | "01" | "1a" | "1b" | "2a" | "2b" | "2c"
  | "3a" | "3b" | "3c" | "3d" | "4a" | "4c" | "4b";

/** Play order. The visitor's name comes first; 4c (the optional hello) sits before the payoff on 4b. */
export const SCREEN_ORDER: ScreenId[] = ["name", "00", "01", "1a", "1b", "2a", "2b", "2c", "3a", "3b", "3c", "3d", "4a", "4c", "4b"];

export const STEP_OF: Record<ScreenId, 0 | 1 | 2 | 3 | 4> = {
  name: 0, "00": 0, "01": 0, "1a": 1, "1b": 1, "2a": 2, "2b": 2, "2c": 2, "3a": 3, "3b": 3, "3c": 3, "3d": 3, "4a": 4, "4c": 4, "4b": 4,
};

export type VoiceMode = "unset" | "on" | "off" | "unsupported";
export type VoiceState = "idle" | "reading" | "listening" | "heard" | "done" | "off" | "record";
export type Overlay = null | "permission" | "missed" | "help";

export type Answers = {
  name: string;
  why: boolean[];
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  transport: number | null;
  minutes: number | null;
  workTalk: string;
  skills: Skill[];
  days: boolean[];
  tod: Tod | null;
  avoid: boolean[];
  videoUrl: string | null;
};

export type State = {
  screen: ScreenId;
  voiceMode: VoiceMode;
  voiceState: VoiceState;
  overlay: Overlay;
  muted: boolean;
  readWord: number;
  interim: string;
  heard: string | null;
  answers: Answers;
  reviewLine: number;
  runId: number;
  /** Bumped by RESTART and by "Say again" so effects can re-arm. */
  listenNonce: number;
};

export type Action =
  | { type: "GO"; screen: ScreenId }
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "SET_VOICE_MODE"; mode: VoiceMode }
  | { type: "VOICE"; state: VoiceState }
  | { type: "INTERIM"; text: string }
  | { type: "HEARD"; text: string }
  | { type: "SET_ANSWER"; patch: Partial<Answers> }
  | { type: "OVERLAY"; overlay: Overlay }
  | { type: "READ_WORD"; index: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "REVIEW_LINE"; index: number }
  | { type: "LISTEN_AGAIN" }
  | { type: "RESTART" };

export const initialAnswers = (name: string): Answers => ({
  name,
  why: [false, false, false, false],
  phone: "(123) 456-7890",
  street: "",
  city: "",
  state: "",
  zip: "",
  transport: null,
  minutes: null,
  workTalk: "",
  skills: [],
  days: Array(7).fill(false),
  tod: null,
  avoid: [false, false, false, false],
  videoUrl: null,
});

export const initialState = (name = ""): State => ({
  screen: "name",
  voiceMode: "unset",
  voiceState: "idle",
  overlay: null,
  muted: false,
  readWord: -1,
  interim: "",
  heard: null,
  answers: initialAnswers(name),
  reviewLine: -1,
  runId: 0,
  listenNonce: 0,
});

/** What Bingo says when a screen opens. `{name}` is the preferred name. */
export const PROMPTS: Record<ScreenId, string> = {
  name: "I'm Bingo. What's your name?",
  "00": "Hi {name}. Four quick things and you're set, about three minutes. You can talk or type at every step.",
  "01": "I can read things out loud and listen when you answer. You can always type instead.",
  "1a": "We'll call you {name}. Want something shorter?",
  "1b": "Why are you looking for work, {name}? Pick any that fit, or just say it.",
  "2a": "Is this still the best number? Then tell me where you live, so we find work nearby.",
  "2b": "I heard {address}. Is that right?",
  "2c": "How do you usually get around, and how far is too far?",
  "3a": "What kind of work have you done? Just talk, I'll take notes. A minute is plenty.",
  "3b": "Sounds like these. Tap one to remove it, or say another.",
  "3c": "Which days, and mornings or afternoons? Say it, or tap.",
  "3d": "This one's optional. Anything you'd rather avoid? Say it, tap it, or skip.",
  "4a": "I'll read it back. Tap any line to fix it.",
  "4c": "Optional, but worth it: people who record a quick hello hear back from more employers.",
  "4b": "You're in, {name}. Two near you for Tuesday morning. Want me to read them?",
};

export function addressLine(a: Answers): string {
  return [a.street, [a.city, a.state].filter(Boolean).join(", ") + (a.zip ? " " + a.zip : "")].filter((s) => s.trim()).join(", ");
}

export function promptFor(state: State): string {
  const a = state.answers;
  return PROMPTS[state.screen]
    .replace(/\{name\}/g, a.name)
    .replace("{address}", addressLine(a) || "nothing yet");
}

const go = (s: State, screen: ScreenId): State => ({
  ...s, screen, voiceState: "idle", overlay: null, readWord: -1, interim: "", heard: null, reviewLine: -1,
});

// 01 only asks about the microphone; if it was already granted on the name
// screen the question is moot, so 00 → 1a and 1a → 00 skip over it.
function next(s: State): State {
  if (s.screen === "00" && s.voiceMode === "on") return go(s, "1a");
  const i = SCREEN_ORDER.indexOf(s.screen);
  return i < SCREEN_ORDER.length - 1 ? go(s, SCREEN_ORDER[i + 1]) : s;
}
function back(s: State): State {
  if (s.screen === "1a" && s.voiceMode === "on") return go(s, "00");
  const i = SCREEN_ORDER.indexOf(s.screen);
  return i > 0 ? go(s, SCREEN_ORDER[i - 1]) : s;
}

const toggleAt = (arr: boolean[], i: number, on = true) => arr.map((v, k) => (k === i ? on : v));

/** Apply what was heard on the current screen. Pure. */
function heard(s: State, text: string): State {
  const a = s.answers;
  const base: State = { ...s, heard: text, interim: "", voiceState: "heard" };
  switch (s.screen) {
    case "name":
    case "1a": {
      const name = parseName(text);
      return name ? { ...base, answers: { ...a, name } } : base;
    }
    case "1b": {
      let why = a.why;
      for (const i of parseWhy(text)) why = toggleAt(why, i);
      return { ...base, answers: { ...a, why } };
    }
    case "2a": {
      const addr = parseAddress(text);
      const phone = /\bnumber\b/i.test(text) ? parsePhone(text) : null;
      return { ...base, answers: { ...a, ...addr, ...(phone ? { phone } : {}) } };
    }
    case "2b":
      if (isYes(text)) return next(base);
      if (isNo(text)) return go(base, "2a");
      return base;
    case "2c": {
      const transport = parseTransport(text) ?? a.transport;
      const minutes = parseMinutes(text) ?? a.minutes;
      return { ...base, answers: { ...a, transport, minutes } };
    }
    case "3a":
      return { ...base, voiceState: "listening", answers: { ...a, workTalk: (a.workTalk + " " + text).trim() } };
    case "3b": {
      if (isYes(text) && !/\badd\b/i.test(text)) return next(base);
      const drop = removeSkillFromSpeech(text, a.skills);
      if (drop) return { ...base, answers: { ...a, skills: a.skills.filter((k) => k.label !== drop) } };
      const add = skillFromSpeech(text);
      if (add && !a.skills.some((k) => k.label === add.label)) {
        return { ...base, answers: { ...a, skills: [...a.skills, add].slice(-MAX_SKILLS) } };
      }
      return base;
    }
    case "3c": {
      const { days, tod } = parseDaysTime(text);
      const merged = { ...a, days: days ?? a.days, tod: tod ?? a.tod };
      const done = merged.days.some(Boolean) || merged.tod;
      return { ...base, voiceState: done ? "done" : "heard", answers: merged };
    }
    case "3d": {
      if (isSkip(text)) return next(base);
      let avoid = a.avoid;
      for (const i of parseAvoid(text)) avoid = toggleAt(avoid, i);
      return { ...base, answers: { ...a, avoid } };
    }
    case "4a":
      if (isYes(text)) return next(base);
      if (isNo(text)) return go(base, "2a");
      return base;
    default:
      return base;
  }
}

export function reducer(s: State, action: Action): State {
  switch (action.type) {
    case "GO":
      return go(s, action.screen);
    case "NEXT": {
      // Entering 3b seeds the bubbles from the talk on 3a.
      const n = next(s);
      if (n.screen === "3b" && s.screen === "3a" && n.answers.skills.length === 0) {
        return { ...n, answers: { ...n.answers, skills: extractSkillsLocal(n.answers.workTalk) } };
      }
      return n;
    }
    case "BACK":
      return back(s);
    case "SET_VOICE_MODE":
      return { ...s, voiceMode: action.mode, voiceState: action.mode === "on" ? s.voiceState : "off" };
    case "VOICE":
      return { ...s, voiceState: action.state, ...(action.state === "listening" ? { interim: "", heard: null } : {}) };
    case "INTERIM":
      return { ...s, interim: action.text };
    case "HEARD":
      return heard(s, action.text);
    case "SET_ANSWER":
      return { ...s, answers: { ...s.answers, ...action.patch } };
    case "OVERLAY":
      return { ...s, overlay: action.overlay };
    case "READ_WORD":
      return { ...s, readWord: action.index };
    case "TOGGLE_MUTE":
      return { ...s, muted: !s.muted, readWord: -1, voiceState: s.voiceState === "reading" ? "idle" : s.voiceState };
    case "REVIEW_LINE":
      return { ...s, reviewLine: action.index };
    case "LISTEN_AGAIN":
      return { ...s, overlay: null, listenNonce: s.listenNonce + 1 };
    case "RESTART":
      // A new person: back to the name screen, empty.
      return { ...initialState(), runId: s.runId + 1 };
  }
}
