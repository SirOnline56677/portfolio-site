# Stephen Aguila — Portfolio

A single-page product-design portfolio built from a Paper design.

- **Framework:** Next.js 16 (App Router, Turbopack) + Tailwind CSS v4
- **Fonts:** Koulen + Istok Web (Google), Paralucent + IvyStyle Sans (self-hosted `woff2`)
- **Live GitHub contributions** heatmap via the GitHub GraphQL API
- **Lenis** smooth scrolling and a subtle dithered-grain background

## Getting started

```bash
npm install
cp .env.example .env.local   # then paste a GitHub token (see below)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## GitHub contributions heatmap

The heatmap in the left column pulls **live** contribution data for the
`SirOnline56677` account. It needs a GitHub Personal Access Token:

1. Create one at <https://github.com/settings/tokens> (classic or fine-grained;
   no special scopes are required for public contribution data).
2. Add it locally to `.env.local` as `GITHUB_TOKEN=...`
3. Add the same variable to your Vercel project's **Environment Variables**
   for production.

Without a token the heatmap falls back to a sample calendar so the UI still
renders.

## Notes

- Design source: the "Desktop Final" artboard in Paper.
- `Paralucent` and `IvyStyle Sans` are commercial typefaces; the `woff2` files
  under `public/fonts/` must be licensed for web use before public deployment.
