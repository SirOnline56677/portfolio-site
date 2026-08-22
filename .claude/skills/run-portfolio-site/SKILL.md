---
name: run-portfolio-site
description: Run, start, smoke-test, or screenshot the portfolio-site Next.js app locally. Use when asked to run the site, verify a change in the real app, take a screenshot of a page, or check that the homepage/case studies still render.
---

# Run portfolio-site

Next.js 16 site (static + SSG, no database). Driven by
`.claude/skills/run-portfolio-site/driver.sh`, which launches `next dev` on a
**dedicated port (3210)**, records the URL it owns, curls the key routes, and
screenshots pages with the installed Google Chrome in headless mode. All paths
below are relative to the repo root.

## Prerequisites

Node via nvm (v24 works) and Google Chrome at
`/Applications/Google Chrome.app` — both already present on this machine.
Then:

```bash
npm install
```

## Run (agent path)

```bash
D=.claude/skills/run-portfolio-site/driver.sh
$D start                       # dev server on :3210, background; idempotent
$D smoke                       # curls /, /exploration, /work/wb-sportsbook
$D shot / out.png "1440,2200"  # headless-Chrome screenshot (path, file, WxH)
$D stop                        # kills only the server this driver started
```

- `start` writes pid/url/log under `.claude/skills/run-portfolio-site/.run/`
  and only reports "already running" for a server it started itself.
- `shot` takes URL path, output file, and window size; it waits ~8s of virtual
  time so fonts/animations settle. Homepage at 1440 wide needs height ≥2200 to
  include the exploration + contact sections.
- Videos on the project cards (sportsbook, bingo ai) autoplay in headless
  Chrome, so a screenshot catches a mid-animation frame — nondeterministic
  pixels there are expected.

## Build / test

```bash
npm run build   # passes; static + SSG output
npm run lint    # KNOWN FAILING: 2 pre-existing react-hooks/refs errors in
                # app/exploration/CanvasGallery.tsx — not a regression signal
```

## Run (human path)

`npm run dev` → http://localhost:3000 in a browser. Fine for a human, but
agents should prefer the driver: port 3000 is contended (see Gotchas).

## Gotchas

- **Port 3000 can be serving a DIFFERENT checkout.** Codex/agent clones of
  this repo live under `~/Documents/Codex/<date>/…/portfolio-site` and run
  their own `next dev` on 3000. Worse, two servers can coexist on 3000 (one
  binds IPv4 127.0.0.1, Next binds IPv6 wildcard) and `localhost:3000` then
  reaches either one depending on the client — curl saw one app, Chrome the
  other. That's why the driver uses port 3210 and never trusts a responding
  port as proof the server is ours. If content looks stale, check
  `lsof -nP -iTCP:3000 -sTCP:LISTEN` and `lsof -p <pid> | grep cwd`.
- **Never `pkill -f "next dev"`** — it kills the other checkouts' servers
  too. `driver.sh stop` kills by saved pid + saved port only.
- **Smoke markers are case-sensitive lowercase-in-HTML**: titles render
  uppercase via CSS but the HTML says `wynnbet (sportsbook)`; the hero says
  `Stephen Aguila`. `/exploration` is a client-rendered canvas with almost no
  static text — match its `<title>` (`Exploration — Stephen Aguila`), not
  page copy.
- **This is not the Next.js you know** (see AGENTS.md): consult
  `node_modules/next/dist/docs/` before writing Next-specific code.

## Troubleshooting

- `start` prints `FAILED to start` → read the log tail it shows
  (`.run/dev.log`); the usual cause is a half-installed `node_modules`
  (`npm install` again).
- `smoke`/`shot` print `no server started by this driver` → run `start`
  first; they refuse to guess a port for the reason above.
