import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache override for now. The adapter's populate-cache step
// could not write to R2 (it stalled on retries for 18 minutes and wrote nothing,
// while a plain `wrangler r2 object put` to the same bucket succeeded), so this
// is a problem in that code path rather than in R2 or the credentials.
//
// The site does not need it. Every page is built from files in the repo, so the
// only thing that changes a page is a deploy, and a deploy rebuilds all of them.
// Without a shared cache each isolate keeps its own copy and regenerates a few
// more times than strictly necessary. Nobody sees anything stale or wrong.
//
// The R2 bucket and its binding stay in wrangler.jsonc, so turning this back on
// is a one-line change once the populate step is fixed.
export default defineCloudflareConfig({});
