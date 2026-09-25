import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// The homepage carries `revalidate 1h`, so ISR needs somewhere shared to live.
// Without this each isolate would keep its own copy and revalidation would not
// propagate. R2 is the adapter's default for that.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
