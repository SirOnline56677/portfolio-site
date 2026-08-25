---
name: portfolio-dev
description: >
  Feature and content work on the portfolio-site Next.js app — adding
  integrations or scripts (analytics, embeds), editing case studies and MDX,
  changing components or styles, and verifying the result in the running app.
  Use for any portfolio-site coding task that benefits from knowing the
  project's conventions and gotchas up front.
---

You are working on **portfolio-site** (`~/portfolio-site`), Stephen Aguila's
portfolio: Next.js 16 (App Router, Turbopack), Tailwind v4, MDX case studies.

## Non-negotiables

- **This is NOT the Next.js you know.** Read the relevant guide in
  `node_modules/next/dist/docs/` before writing any Next-specific code
  (per AGENTS.md). Heed deprecation notices.
- **Verify in the real app**, not just the build. Use the run skill's driver:
  `.claude/skills/run-portfolio-site/driver.sh start|smoke|shot|stop`
  (dedicated port 3210; never trust whatever squats on port 3000 — stale
  Codex-clone servers live there, and Next 16 allows only ONE dev server per
  project dir, so reuse a running one instead of racing it).
- `npm run build` must pass. `npm run lint` has 2 pre-existing
  `react-hooks/refs` errors in `app/exploration/CanvasGallery.tsx` — those are
  not yours; anything else is.

## Architecture map

- `app/layout.tsx` — fonts via next/font (Koulen display, Paralucent body,
  IvyStyle labels; project-card titles use the system sans stack). Theme is a
  `data-theme` attribute on `<html>` set by a blocking script from
  localStorage; dark mode is the exact color inverse, driven entirely by
  tokens in `app/globals.css` (`@theme` + `[data-theme="dark"]` overrides).
  Third-party scripts belong here — use `next/script` (check the docs above
  for the current API) and respect the existing blocking-script pattern.
- `app/data.ts` — homepage project/exploration data. Cards support optional
  `video` (muted autoplay loop) with `image` as poster.
- `content/work/*.mdx` — case studies. Rendered via
  `app/work/[slug]/page.tsx` + `app/components/case-study/template.tsx`,
  which supplies the component map: `Figure`, `Roadmap` (Bingo ident palette:
  ink #141414, cream #EFEAE0, red #E8472A, blue #2B2A6A — deliberately
  identical in both themes), and styled h2/h3/h4/p/ul/li.
- `docs/design/animations.md` — read before creating ANY animation.
- Design source of truth is the Paper file "Portfolio"; keep it in sync when
  changing homepage visuals (the main session handles Paper access).

## Conventions

- Match existing comment density and idiom; comments state constraints, not
  narration.
- Site chrome inverts with the theme; the work (images, brand cards) does
  not. Never hardcode site colors — use the tokens.
- Prefer small, verifiable steps: build → drive the app → screenshot the
  affected page (desktop 1440 and a narrow width) before declaring done.
