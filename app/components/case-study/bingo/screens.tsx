"use client";

import { useEffect, useRef, useState, type Dispatch, type ReactNode } from "react";
import { GROUND, H, INK, PH, RED, SEC, W, WHITE } from "./tokens";
import { AVOID, DAY_LETTERS, DAY_NAMES, MINUTES, TOD_LABEL, TRANSPORT, WHY, describeWeek, formatPhone, type Tod } from "./parse";
import { addressLine, promptFor, STEP_OF, type Action, type State } from "./state";
import type { useCamera } from "./useCamera";
import {
  BUBBLE_COLORS, Btn, Buttons, Card, Check, Content, Day, Done, Field, Group, Help, HomeIndicator, LargeTitle, Lead, Lens, Nav, Num, Pill,
  Progress, Radio, Row, Said, Segments, Sp, Spacer, StatusBar, TabBar, TransportIcon, TRANSPORT_KEYS, VoiceBlock, VoiceOff, Wave,
} from "./ui";

// One component per screen. Layout only: state comes in, actions go out.
// Copy and line breaks follow the approved board / Figma section 79:2.

export type Ctx = {
  s: State;
  d: Dispatch<Action>;
  voiceOn: boolean;
  /** Toggle listening (or stop). */
  onMic: () => void;
  onTurnOnVoice: () => void;
  /** Name screen only: ask for the mic (permission prompt) and start listening. */
  askMicThenListen: () => void;
  /** Re-read the prompt aloud. */
  read: () => void;
  next: () => void;
  back: () => void;
  restart: () => void;
  cam: ReturnType<typeof useCamera>;
  /** Lets iOS speak on the first tap. */
  unlock: () => void;
};

const STEP_LABEL = ["", "Step 1 of 4", "Step 2 of 4", "Step 3 of 4", "Step 4 of 4"];

function Shell({ ctx, title, children, back = true, step, right, pad }: { ctx: Ctx; title: string; children: ReactNode; back?: boolean; step?: string; right?: ReactNode; pad?: number }) {
  const { s } = ctx;
  const stepNo = STEP_OF[s.screen];
  return (
    <div
      role="group"
      aria-labelledby="bg-title"
      className="relative flex flex-col"
      style={{ width: W, height: H, background: GROUND, color: INK, fontFamily: "Inter, -apple-system, system-ui, sans-serif" }}
      inert={s.overlay ? true : undefined}
    >
      <ScreenHeader ctx={ctx} title={title} back={back} step={step ?? STEP_LABEL[stepNo]} right={right} />
      <Content style={pad != null ? { paddingBottom: pad } : undefined}>
        {stepNo > 0 && s.screen !== "4b" && s.screen !== "4c" ? <Progress pct={stepNo / 4} /> : null}
        {children}
      </Content>
      <HomeIndicator />
      <span className="sr-only" aria-live="polite">{liveText(s)}</span>
    </div>
  );
}

function liveText(s: State) {
  if (s.voiceState === "listening") return "Listening";
  if (s.voiceState === "reading") return "Reading aloud";
  if (s.heard) return `Heard: ${s.heard}`;
  return "";
}

function ScreenHeader({ ctx, title, back, step, right }: { ctx: Ctx; title: string; back: boolean; step: string; right?: ReactNode }) {
  const { s, d } = ctx;
  return (
    <>
      <StatusBarSlot />
      <Nav
        step={step}
        onBack={back ? ctx.back : undefined}
        onHelp={() => d({ type: "OVERLAY", overlay: "help" })}
        muted={s.muted}
        onMute={() => d({ type: "TOGGLE_MUTE" })}
        right={right}
      />
      <LargeTitle id="bg-title">{title}</LargeTitle>
    </>
  );
}

const StatusBarSlot = () => <StatusBar />;

/** The prompt with karaoke when Bingo is reading. */
function Prompt({ ctx }: { ctx: Ctx }) {
  const { s } = ctx;
  return <Lead text={promptFor(s)} reading={s.voiceState === "reading"} readWord={s.readWord} />;
}

/** Mic or the voice-off link, with the right caption for the moment. */
function Voice({ ctx, idle, listening, onTap }: { ctx: Ctx; idle: string; listening?: string; onTap?: () => void }) {
  const { s, voiceOn } = ctx;
  if (!voiceOn) {
    const note = s.voiceMode === "unsupported" ? "Voice isn't available in this browser. Tap any field to type." : "Voice is off. Tap any field to type.";
    return <VoiceOff onTurnOn={s.voiceMode === "unsupported" ? undefined : ctx.onTurnOnVoice} note={note} />;
  }
  const st = s.voiceState;
  const caption =
    st === "reading" ? "Reading… tap the mic to answer"
    : st === "listening" ? (listening ?? "Listening… tap to stop")
    : st === "heard" ? "Got it. Tap to say more"
    : st === "done" ? "Got it. Tap the mic to change it"
    : idle;
  return <VoiceBlock state={st} caption={caption} onTap={onTap ?? ctx.onMic} />;
}

function PlayBack({ ctx, label = "Play back" }: { ctx: Ctx; label?: string }) {
  return <Btn kind="tint" w={150} onClick={ctx.read}>▶&nbsp;&nbsp;{label}</Btn>;
}

/* ================= name ================= */
export function ScreenName({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const name = s.answers.name;
  const unsupported = s.voiceMode === "unsupported";
  const st = s.voiceState;
  const caption = st === "listening" ? "Listening… tap to stop" : st === "heard" ? "Got it. Tap to try again" : "Tap and say your name";
  return (
    <Shell ctx={ctx} title="Hello" back={false} step="">
      <Prompt ctx={ctx} />
      <Group label="Your name">
        <Card>
          <Row first>
            <Field value={name} placeholder="Your first name" ariaLabel="Your first name" onChange={(v) => d({ type: "SET_ANSWER", patch: { name: v } })} onEnter={() => { if (name.trim()) ctx.next(); }} />
            {st === "listening" ? <Wave /> : null}
          </Row>
        </Card>
        <Help>{unsupported ? "Voice isn't available in this browser. Type your name to start." : "Type it, or tap the mic and say it."}</Help>
      </Group>
      {s.heard ? <Said text={s.heard} /> : s.interim ? <Said text={s.interim + "…"} /> : null}
      <Spacer />
      {unsupported ? (
        <VoiceBlock state="off" caption="Voice isn't available in this browser" />
      ) : (
        <VoiceBlock state={st === "listening" ? "listening" : st === "heard" ? "heard" : "idle"} caption={caption} onTap={st === "listening" ? ctx.onMic : ctx.askMicThenListen} label="Tap and say your name" />
      )}
      <Buttons>
        <Btn kind="tint" w={150} onClick={() => { ctx.unlock(); ctx.read(); }}>▶&nbsp;&nbsp;Read aloud</Btn>
        <Btn onClick={() => { ctx.unlock(); ctx.next(); }} disabled={!name.trim()}>That&apos;s me</Btn>
      </Buttons>
    </Shell>
  );
}

/* ================= 00 ================= */
export function Screen00({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  return (
    <Shell ctx={ctx} title={`Hi, ${s.answers.name}`} step="">
      <Prompt ctx={ctx} />
      <Group label="What we'll ask">
        <Card>
          {["What to call you", "Where you live,\nand how far you'll go", "What you've done,\nand when you can work", "A quick check,\nthen your first matches"].map((t, i) => (
            <Row key={t} first={i === 0}><Num n={i + 1} /><span style={{ whiteSpace: "pre-line" }}>{t}</span></Row>
          ))}
        </Card>
      </Group>
      <Spacer />
      <VoiceBlock state="idle" caption="Tap and talk, any time you see this" />
      <Buttons>
        <Btn kind="tint" w={150} onClick={() => { ctx.unlock(); ctx.read(); }}>▶&nbsp;&nbsp;Read aloud</Btn>
        <Btn onClick={() => { ctx.unlock(); d({ type: "NEXT" }); }}>Let&apos;s go</Btn>
      </Buttons>
    </Shell>
  );
}

/* ================= 01 ================= */
export function Screen01({ ctx, onChoose }: { ctx: Ctx; onChoose: (talk: boolean) => void }) {
  const { s } = ctx;
  const [talk, setTalk] = useState(s.voiceMode !== "unsupported");
  const unsupported = s.voiceMode === "unsupported";
  return (
    <Shell ctx={ctx} title="Talk with Bingo?" step="">
      <Prompt ctx={ctx} />
      <Group label="How you'd like to answer">
        <Card role="radiogroup" ariaLabel="How you'd like to answer">
          <Row first role="radio" ariaChecked={talk} onClick={() => !unsupported && setTalk(true)} style={{ minHeight: 64, opacity: unsupported ? 0.5 : 1 }}>
            <Radio on={talk} />
            <span className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontWeight: talk ? 600 : 400 }}>Yes, talk with me</span>
              <span style={{ fontSize: 14, color: SEC }}>{unsupported ? "Not available in this browser." : "Recommended. Hands free, bigger text."}</span>
            </span>
          </Row>
          <Row role="radio" ariaChecked={!talk} onClick={() => setTalk(false)} style={{ minHeight: 64 }}>
            <Radio on={!talk} />
            <span className="flex flex-col" style={{ gap: 2 }}>
              <span style={{ fontWeight: !talk ? 600 : 400 }}>Just text</span>
              <span style={{ fontSize: 14, color: SEC }}>I&apos;ll type and read on my own.</span>
            </span>
          </Row>
        </Card>
      </Group>
      <Help>We don&apos;t keep your recordings. Your words become text and the audio is gone.</Help>
      <Spacer />
      <Buttons><Btn onClick={() => onChoose(talk && !unsupported)}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 1a ================= */
export function Screen1a({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const [editing, setEditing] = useState(false);
  return (
    <Shell ctx={ctx} title="About you">
      <Prompt ctx={ctx} />
      <Group label="Preferred name">
        <Card>
          <Row first>
            {editing || !ctx.voiceOn ? (
              <Field value={s.answers.name} placeholder="Your name" ariaLabel="Preferred name" autoFocus={editing} onChange={(v) => d({ type: "SET_ANSWER", patch: { name: v } })} onEnter={ctx.next} />
            ) : (
              <><span style={{ fontWeight: 600 }}>{s.answers.name}</span><Sp /><button type="button" onClick={() => setEditing(true)} style={{ color: RED, fontSize: 15, fontWeight: 500 }}>Change</button></>
            )}
          </Row>
        </Card>
        <Help>Prefer typing? Tap the name to use the keyboard.</Help>
      </Group>
      {s.heard ? <Said text={s.heard} /> : s.interim ? <Said text={s.interim + "…"} /> : null}
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" />
      <Buttons><PlayBack ctx={ctx} label="Play again" /><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 1b ================= */
export function Screen1b({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const why = s.answers.why;
  return (
    <Shell ctx={ctx} title="About you">
      <Prompt ctx={ctx} />
      <Card>
        {WHY.map((t, i) => (
          <Row key={t} first={i === 0} role="checkbox" ariaChecked={why[i]} onClick={() => d({ type: "SET_ANSWER", patch: { why: why.map((v, k) => (k === i ? !v : v)) } })}>
            <Check on={why[i]} /><span style={{ fontWeight: why[i] ? 600 : 400 }}>{t}</span>
          </Row>
        ))}
      </Card>
      {s.heard ? <Said text={s.heard} /> : s.interim ? <Said text={s.interim + "…"} /> : null}
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" />
      <Buttons><PlayBack ctx={ctx} /><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 2a ================= */
export function Screen2a({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const a = s.answers;
  const [phoneEdit, setPhoneEdit] = useState(false);
  const live = s.voiceState === "listening";
  const set = (patch: Partial<typeof a>) => d({ type: "SET_ANSWER", patch });
  const red = live && !!s.interim;
  return (
    <Shell ctx={ctx} title="Your details">
      <Prompt ctx={ctx} />
      <Group label="Phone number">
        <Card>
          <Row first>
            {phoneEdit ? (
              <Field value={a.phone} placeholder="(123) 456-7890" inputMode="tel" ariaLabel="Phone number" autoFocus onChange={(v) => set({ phone: formatPhone(v) })} onEnter={() => setPhoneEdit(false)} />
            ) : (
              <><span style={{ fontWeight: 600 }}>{a.phone}</span><Sp /><Done /><button type="button" onClick={() => setPhoneEdit(true)} style={{ color: RED, fontSize: 15, fontWeight: 500 }}>Change</button></>
            )}
          </Row>
        </Card>
      </Group>
      <Group label="Home address">
        <Card>
          <Row first>
            <Field value={a.street} placeholder="Street address" ariaLabel="Street address" red={red} onChange={(v) => set({ street: v })} />
            {live ? <Wave /> : null}
          </Row>
          <Row><Field value={a.city} placeholder="City" ariaLabel="City" red={red} onChange={(v) => set({ city: v })} /></Row>
          <Row>
            <Field value={a.state} placeholder="State" ariaLabel="State" red={red} onChange={(v) => set({ state: v.toUpperCase().slice(0, 2) })} />
            <Field value={a.zip} placeholder="ZIP" inputMode="numeric" ariaLabel="ZIP" red={red} onChange={(v) => set({ zip: v.replace(/\D/g, "").slice(0, 5) })} style={{ textAlign: "right", flex: "0 0 90px" }} onEnter={ctx.next} />
          </Row>
        </Card>
        <Help>Prefer typing? Tap any field to use the keyboard.</Help>
      </Group>
      {s.interim && live ? <Said text={s.interim + "…"} /> : null}
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" />
      <Buttons><PlayBack ctx={ctx} /><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 2b ================= */
export function Screen2b({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const a = s.answers;
  const lines: [string, string][] = [
    [a.phone, "Phone"],
    [a.street || "—", "Street"],
    [[a.city, a.state].filter(Boolean).join(", ") + (a.zip ? " " + a.zip : "") || "—", "City, state, ZIP"],
  ];
  return (
    <Shell ctx={ctx} title="Did I get that right?">
      <Prompt ctx={ctx} />
      <Group label="What I heard">
        <Card>
          {lines.map(([v, sub], i) => (
            <Row key={sub} first={i === 0}>
              <span className="flex flex-col" style={{ gap: 2 }}><span style={{ fontWeight: 600 }}>{v}</span><span style={{ fontSize: 14, color: SEC }}>{sub}</span></span>
              <Sp />
              <button type="button" onClick={() => d({ type: "GO", screen: "2a" })} style={{ color: RED, fontSize: 15, fontWeight: 500 }}>Say again</button>
            </Row>
          ))}
        </Card>
        <Help>Tap &quot;Say again&quot; on one line to redo just that line.</Help>
      </Group>
      <Spacer />
      <Voice ctx={ctx} idle={`Say "yes", or "no, it's…"`} />
      <Buttons col>
        <Btn onClick={ctx.next}>Yes, that&apos;s right</Btn>
        <Btn kind="ghost" onClick={() => d({ type: "GO", screen: "2a" })}>Fix by hand</Btn>
      </Buttons>
    </Shell>
  );
}

/* ================= 2c ================= */
export function Screen2c({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const a = s.answers;
  return (
    <Shell ctx={ctx} title="Getting there">
      <Prompt ctx={ctx} />
      <Group label="Getting around">
        <Card role="radiogroup" ariaLabel="Getting around">
          {TRANSPORT.map((t, i) => (
            <Row key={t} first={i === 0} role="radio" ariaChecked={a.transport === i} onClick={() => d({ type: "SET_ANSWER", patch: { transport: i } })}>
              <TransportIcon k={TRANSPORT_KEYS[i]} /><span style={{ fontWeight: a.transport === i ? 600 : 400 }}>{t}</span><Sp /><Radio on={a.transport === i} />
            </Row>
          ))}
        </Card>
      </Group>
      <Group label="How far">
        <Card>
          <Segments ariaLabel="How far">
            {MINUTES.map((m) => <Pill key={m} label={m === 60 ? "1 hour" : `${m} min`} on={a.minutes === m} onClick={() => d({ type: "SET_ANSWER", patch: { minutes: m } })} />)}
          </Segments>
        </Card>
      </Group>
      {s.heard ? <Said text={s.heard} /> : null}
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" />
      <Buttons><PlayBack ctx={ctx} /><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 3a ================= */
export function Screen3a({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const live = s.voiceState === "listening";
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t0 = Date.now() - secs * 1000;
    const id = window.setInterval(() => setSecs(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live]);
  const text = (s.answers.workTalk + (s.interim ? " " + s.interim : "")).trim();
  return (
    <Shell ctx={ctx} title="Your work">
      <Prompt ctx={ctx} />
      <Card style={{ minHeight: 200, display: "flex", flexDirection: "column" }}>
        <div data-lenis-prevent aria-live="polite" className="flex-1 overflow-y-auto overscroll-contain" style={{ padding: "14px 16px 6px", fontSize: 17, lineHeight: "26px", maxHeight: 300 }}>
          {ctx.voiceOn ? (
            text ? <>{text}{live ? <b style={{ color: RED, fontWeight: 700 }}> |</b> : null}</> : <span style={{ color: PH }}>Your words show up here as you talk.</span>
          ) : (
            <textarea
              value={s.answers.workTalk}
              onChange={(e) => d({ type: "SET_ANSWER", patch: { workTalk: e.target.value } })}
              placeholder="Type a few lines about the work you've done."
              aria-label="Your work"
              className="w-full resize-none bg-transparent outline-none"
              style={{ fontFamily: "inherit", fontSize: 17, lineHeight: "26px", minHeight: 160, color: INK }}
            />
          )}
        </div>
        <p style={{ margin: 0, textAlign: "right", padding: "0 16px 10px", fontSize: 13, color: SEC, fontVariantNumeric: "tabular-nums" }}>
          {`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}
        </p>
      </Card>
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" listening="Listening… tap when you're done" />
      <Buttons>
        {ctx.voiceOn ? <Btn kind="tint" w={150} onClick={ctx.onMic}>{live ? "Pause" : "Keep going"}</Btn> : null}
        <Btn onClick={ctx.next}>I&apos;m done</Btn>
      </Buttons>
    </Shell>
  );
}

/* ================= 3b ================= */
const SLOTS = [
  { l: 14, t: 18, d: 104 }, { l: 128, t: 8, d: 84 }, { l: 222, t: 40, d: 118 },
  { l: 36, t: 132, d: 92 }, { l: 140, t: 120, d: 76 }, { l: 226, t: 168, d: 70 },
];

export function Screen3b({ ctx, pending }: { ctx: Ctx; pending: boolean }) {
  const { s, d } = ctx;
  const skills = s.answers.skills;
  const [adding, setAdding] = useState("");
  const add = () => {
    const label = adding.trim();
    if (!label) return;
    d({ type: "HEARD", text: `add ${label}` });
    setAdding("");
  };
  return (
    <Shell ctx={ctx} title="Your skills">
      <Prompt ctx={ctx} />
      <Card style={{ paddingBottom: 8 }}>
        <div className="relative" style={{ height: 250 }} aria-label="Your skills" role="group">
          {skills.length === 0 ? (
            <p style={{ margin: 0, padding: "24px 16px", color: PH, fontSize: 17, lineHeight: "24px" }}>{pending ? "Listening back to what you said…" : "Nothing yet. Say a job you've done, or type one below."}</p>
          ) : null}
          {skills.slice(0, SLOTS.length).map((k, i) => {
            const slot = SLOTS[i];
            const bg = k.fresh ? WHITE : BUBBLE_COLORS[k.kind];
            return (
              <button
                key={k.label}
                type="button"
                onClick={() => d({ type: "SET_ANSWER", patch: { skills: skills.filter((x) => x.label !== k.label) } })}
                aria-label={`Remove ${k.label}`}
                className="absolute flex items-center justify-center rounded-full text-center"
                style={{
                  left: slot.l, top: slot.t, width: slot.d, height: slot.d, background: bg,
                  border: k.fresh ? `2px dashed ${RED}` : "none", color: k.fresh ? RED : WHITE,
                  fontWeight: 600, fontSize: slot.d < 80 ? 13 : 15, lineHeight: 1.15, padding: 6,
                  animation: pending ? "bg-float 1.4s ease-in-out infinite alternate" : undefined,
                }}
              >
                {k.label}
              </button>
            );
          })}
        </div>
        <div className="flex" style={{ gap: 14, padding: "0 16px", fontSize: 12, color: SEC }}>
          {(["soft", "hard", "trait"] as const).map((k) => (
            <span key={k} className="flex items-center" style={{ gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 5, background: BUBBLE_COLORS[k] }} />{k === "soft" ? "Soft" : k === "hard" ? "Hard" : "Trait"}</span>
          ))}
          <span className="flex items-center" style={{ gap: 5 }}><i style={{ width: 10, height: 10, borderRadius: 5, border: `1.5px dashed ${RED}` }} />Just added</span>
        </div>
      </Card>
      {s.heard ? <Said text={s.heard} /> : (
        <Card><Row first><Field value={adding} placeholder="Add a skill" ariaLabel="Add a skill" onChange={setAdding} onEnter={add} /><button type="button" onClick={add} style={{ color: RED, fontSize: 15, fontWeight: 500 }}>Add</button></Row></Card>
      )}
      <Spacer />
      <Voice ctx={ctx} idle={`Say "add cashier", or "looks right"`} />
      <Buttons><PlayBack ctx={ctx} /><Btn onClick={ctx.next}>Looks right</Btn></Buttons>
    </Shell>
  );
}

/* ================= 3c ================= */
export function Screen3c({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const a = s.answers;
  const summary = describeWeek(a.days, a.tod);
  return (
    <Shell ctx={ctx} title="Your week">
      <Prompt ctx={ctx} />
      <Group label="Days">
        <Card>
          <div className="flex justify-between" style={{ padding: "12px 14px" }} role="group" aria-label="Days">
            {DAY_LETTERS.map((l, i) => (
              <Day key={i} letter={l} name={DAY_NAMES[i]} on={a.days[i]} onClick={() => d({ type: "SET_ANSWER", patch: { days: a.days.map((v, k) => (k === i ? !v : v)) } })} />
            ))}
          </div>
        </Card>
      </Group>
      <Group label="Time of day">
        <Card>
          <Segments ariaLabel="Time of day">
            {(Object.keys(TOD_LABEL) as Tod[]).map((t) => <Pill key={t} label={TOD_LABEL[t]} on={a.tod === t} onClick={() => d({ type: "SET_ANSWER", patch: { tod: t } })} />)}
          </Segments>
        </Card>
      </Group>
      {summary ? <Card><Row first><Done /><span style={{ fontWeight: 600 }}>{summary}</span></Row></Card> : null}
      <Spacer />
      <Voice ctx={ctx} idle="Tap and talk" />
      <Buttons><PlayBack ctx={ctx} /><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 3d ================= */
export function Screen3d({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const a = s.answers;
  return (
    <Shell ctx={ctx} title="Good to know">
      <Prompt ctx={ctx} />
      <Group label="I'd rather avoid" optional>
        <Card>
          {AVOID.map((t, i) => (
            <Row key={t} first={i === 0} role="checkbox" ariaChecked={a.avoid[i]} onClick={() => d({ type: "SET_ANSWER", patch: { avoid: a.avoid.map((v, k) => (k === i ? !v : v)) } })}>
              <Check on={a.avoid[i]} /><span style={{ fontWeight: a.avoid[i] ? 600 : 400 }}>{t}</span>
            </Row>
          ))}
        </Card>
        <Help>This only hides jobs from your list. It never shows on your profile.</Help>
      </Group>
      <Spacer />
      <Voice ctx={ctx} idle={`Tap and talk, or say "skip"`} />
      <Buttons><Btn kind="ghost" w={150} onClick={ctx.next}>Skip this</Btn><Btn onClick={ctx.next}>Continue</Btn></Buttons>
    </Shell>
  );
}

/* ================= 4a ================= */
export function reviewLines(a: State["answers"]): { sub: string; v: string; screen: "1a" | "2a" | "2c" | "3c" | "3b" | "3d" }[] {
  const week = describeWeek(a.days, a.tod) ?? "—";
  return [
    { sub: "Name", v: a.name, screen: "1a" },
    { sub: "Phone", v: a.phone, screen: "2a" },
    { sub: "Home", v: [addressLine(a) || "—", a.transport != null ? `${TRANSPORT[a.transport].replace("I ", "").toLowerCase()}${a.minutes ? `, up to ${a.minutes} min` : ""}` : ""].filter(Boolean).join(" · "), screen: "2c" },
    { sub: "Days", v: week, screen: "3c" },
    { sub: "Skills", v: a.skills.length ? a.skills.slice(0, 2).map((k) => k.label).join(", ") + (a.skills.length > 2 ? `, +${a.skills.length - 2}` : "") : "—", screen: "3b" },
    { sub: "Avoid", v: AVOID.filter((_, i) => a.avoid[i]).join(", ") || "Nothing", screen: "3d" },
  ];
}

export function Screen4a({ ctx }: { ctx: Ctx }) {
  const { s, d } = ctx;
  const lines = reviewLines(s.answers);
  return (
    <Shell ctx={ctx} title="Check it over">
      <Prompt ctx={ctx} />
      <Group label="Your answers">
        <Card>
          {lines.map((l, i) => (
            <Row key={l.sub} first={i === 0} onClick={() => d({ type: "GO", screen: l.screen })} ariaLabel={`${l.sub}: ${l.v}. Change`} style={{ padding: "10px 16px" }}>
              <span className="flex flex-col" style={{ gap: 1 }}><span style={{ fontSize: 13, color: SEC }}>{l.sub}</span><span style={{ fontWeight: 600, color: s.reviewLine === i ? RED : INK }}>{l.v}</span></span>
              <Sp /><span style={{ color: PH, fontSize: 20 }}>›</span>
            </Row>
          ))}
        </Card>
      </Group>
      <Spacer />
      <Voice ctx={ctx} idle={`Say "yes" when it's right`} />
      <Buttons><PlayBack ctx={ctx} label="Read again" /><Btn onClick={ctx.next}>Confirm</Btn></Buttons>
    </Shell>
  );
}

/* ================= 4c ================= */
export function Screen4c({ ctx }: { ctx: Ctx }) {
  const { cam } = ctx;
  const st = cam.status;
  const videoEl = useRef<HTMLVideoElement>(null);
  const { attach } = cam;
  useEffect(() => {
    attach(videoEl.current);
    return () => attach(null);
  }, [attach, st]);
  const caption = st === "recording" ? "Recording… tap to stop" : st === "preview" ? "Tap to start recording" : st === "done" ? "Nice. Keep it, or redo" : st === "denied" ? "Camera is off" : "Tap to turn on the camera";
  const onTap = st === "recording" ? cam.finish : st === "preview" ? cam.record : st === "idle" ? cam.open : undefined;
  return (
    <Shell ctx={ctx} title="Say hello" step="Optional">
      <Prompt ctx={ctx} />
      <div className="relative overflow-hidden" style={{ height: 200, borderRadius: 14, background: "radial-gradient(ellipse at 50% 40%, #5b564c, #2b2924 70%)" }}>
        {st === "done" && cam.url ? (
          <video src={cam.url} controls playsInline className="h-full w-full" style={{ objectFit: "cover" }} aria-label="Your hello, ready to play" />
        ) : (
          <>
            <video ref={videoEl} muted playsInline autoPlay className="h-full w-full" style={{ objectFit: "cover", transform: "scaleX(-1)", display: st === "preview" || st === "recording" ? "block" : "none" }} aria-label="Camera preview" />
            {st !== "preview" && st !== "recording" ? <span aria-hidden className="absolute" style={{ left: 132, top: 40, width: 96, height: 120, borderRadius: "48px 48px 40px 40px", background: "#8d867a", opacity: 0.7 }} /> : null}
          </>
        )}
        <span className="absolute" style={{ right: 12, top: 10, background: "rgba(0,0,0,.55)", color: WHITE, fontSize: 13, padding: "3px 8px", borderRadius: 8, fontVariantNumeric: "tabular-nums" }}>
          {st === "recording" ? `0:${String(40 - cam.seconds).padStart(2, "0")}` : "0:40"}
        </span>
      </div>
      {st === "denied" || st === "unavailable" ? (
        <Help>{st === "denied" ? "Camera is off. You can do this later from your Profile." : "No camera here. You can do this later from your Profile."}</Help>
      ) : (
        <div className="flex" style={{ gap: 10, background: WHITE, borderRadius: 14, padding: "12px 16px", fontSize: 15, lineHeight: "21px" }}>
          <Num n="i" />
          <span>Say your name, what you&apos;ve done, and what you&apos;d like to do. Forty seconds is plenty. <b style={{ color: RED, fontWeight: 600 }}>You can redo it as many times as you like.</b></span>
        </div>
      )}
      <Help>You can always do this later from your Profile. Nothing is uploaded.</Help>
      <Spacer />
      <VoiceBlock state={st === "recording" ? "record" : st === "done" ? "done" : st === "denied" || st === "unavailable" ? "off" : "record"} caption={caption} onTap={onTap} label="Record" />
      <Buttons>
        {st === "done" ? (
          <><Btn kind="ghost" w={150} onClick={cam.reset}>Redo</Btn><Btn onClick={() => { cam.reset(); ctx.next(); }}>Keep it</Btn></>
        ) : (
          <><Btn kind="ghost" w={150} onClick={() => { cam.reset(); ctx.next(); }}>Do it later</Btn><Btn onClick={onTap ?? ctx.next} disabled={st === "denied" || st === "unavailable"}>{st === "recording" ? "Stop" : st === "preview" ? "Record" : "Turn on camera"}</Btn></>
        )}
      </Buttons>
    </Shell>
  );
}

/* ================= 4b ================= */
const MATCHES = [
  { t: "Host · Corner Diner", l1: "Astoria · 12 min by bus", l2: "Tue & Thu mornings · $18/hr", pct: "92%" },
  { t: "Greeter · Home Depot", l1: "Long Island City · 25 min by bus", l2: "Tue mornings · $17/hr", pct: "88%" },
];

export function Screen4b({ ctx, onReadMatches }: { ctx: Ctx; onReadMatches: () => void }) {
  const { s } = ctx;
  return (
    <Shell ctx={ctx} title={`You're in, ${s.answers.name}`} back={false} step="" pad={100}>
      <Prompt ctx={ctx} />
      <Group label="Your first matches">
        <Card>
          {MATCHES.map((m, i) => (
            <Row key={m.t} first={i === 0} style={{ minHeight: 88 }}>
              <span className="flex flex-col" style={{ gap: 2 }}>
                <span style={{ fontWeight: 600 }}>{m.t}</span>
                <span style={{ fontSize: 14, color: SEC }}>{m.l1}</span>
                <span style={{ fontSize: 14, color: SEC }}>{m.l2}</span>
              </span>
              <Sp /><Lens pct={m.pct} />
            </Row>
          ))}
        </Card>
      </Group>
      <Spacer />
      <Voice ctx={ctx} idle={`Say "read them" or "again"`} />
      <Buttons>
        <Btn kind="tint" w={150} onClick={onReadMatches}>Read them</Btn>
        <Btn onClick={ctx.restart}>Play again</Btn>
      </Buttons>
      <TabBar active="Home" />
    </Shell>
  );
}
