# Stephen Aguila — Portfolio

A single-page product-design portfolio built from a Paper design.

- **Framework:** Next.js 16 (App Router, Turbopack) + Tailwind CSS v4
- **Fonts:** Koulen + Istok Web (Google), Paralucent + IvyStyle Sans (self-hosted `woff2`)
- **Lenis** smooth scrolling, a dithered-grain WebGL background and rolling CRT scanlines

## Getting started

```bash
npm install
cp .env.example .env.local   # then paste a GitHub token (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## The interactive pieces

**Project carousel** — at `lg` and above the right pane pins to the viewport and clips
two columns that loop forever. They drift slowly in opposite directions on their own, and
the wheel drives them apart; the page itself never scrolls while the pointer is over that
pane. Hovering a card eases the drift to a stop. Below `lg` it collapses to an ordinary
stacked list with no clipping and no wheel capture.

**Custom cursor** — a 32px circle that expands into a labelled pill over a project,
showing that project's `kind` (`CASE STUDY` or `WEBSITE`). It uses
`mix-blend-mode: difference` with a **pure white** fill, which is deliberate: difference
computes `|B − C|`, and that only equals a true inversion when the fill is white. Because
dark mode is built as the exact negative, the cursor is a literal window onto the opposite
theme. Tinting it would break that in both directions.

**Dark mode** — the photographic negative of light mode: every chrome colour is the exact
inverse (255 − c), swapped under `data-theme` on `<html>`. Images stay true, so the work
still reads as the work. Toggled by the "Negative" control above the name. It deliberately
does **not** follow `prefers-color-scheme` and is **not** persisted — the page always opens
light, which is what removes any need for a blocking inline script and any theme flash.

Two things to know before editing theme code:

- The `[data-theme="dark"]` block in `globals.css` **must stay unlayered**. Tailwind v4
  compiles `@theme` into `@layer theme { :root }`, which has the same specificity — so it's
  being unlayered, not more specific, that makes the override win. Wrapping it in a layer
  silently breaks all of dark mode.
- `data-theme` is stamped on every load, including `"light"`. That stops `thinking-orbs`
  (which defaults to `theme="auto"`) falling through to `prefers-color-scheme` and painting
  light dots onto a light page for visitors with OS dark mode on.

## GitHub contributions heatmap

The heatmap in the left column pulls **live** contribution data for the `SirOnline56677`
account. It needs a GitHub Personal Access Token:

1. Create one at <https://github.com/settings/tokens> (classic or fine-grained; no special
   scopes are required for public contribution data).
2. Add it locally to `.env.local` as `GITHUB_TOKEN=...`
3. Add the same variable to your Vercel project's **Environment Variables** for production.

**Without a token the whole section — heading included — is omitted.** It deliberately does
not substitute placeholder data: this is a portfolio, and inventing a year of GitHub
activity would misrepresent real work.

If the graph looks emptier than expected, the usual cause isn't the token. GitHub excludes
**private** repository activity from the contribution calendar. Enable it under
Settings → Public profile → Contributions → "Include private contributions on my profile".

## Notes

- Design source: the "Desktop Final" artboard in Paper, plus
  `Desktop — Current build (1440 / 1920)` reflecting the shipped build.
- `Paralucent` and `IvyStyle Sans` are commercial typefaces; the `woff2` files under
  `public/fonts/` **must be licensed for web use before public deployment**.
- Project content in `app/data.ts` is still placeholder — six entries sharing one image.
