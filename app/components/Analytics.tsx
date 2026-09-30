import { GoogleAnalytics as GA } from "@next/third-parties/google";

// Google Analytics 4, alongside the Contentsquare tag. The two answer
// different questions and do not replace each other: GA4 counts visits and
// says where they came from, Contentsquare shows what people did on the page.
//
// Like the Contentsquare tag id, the measurement ID is public — it is visible
// in every gtag request the browser makes — so it lives here as a constant
// rather than in an env var that would have to be set on Cloudflare, on
// preview, and on any future host. Empty means "not configured yet": the
// component renders nothing, so main is safe to deploy before the GA4
// property exists.
const MEASUREMENT_ID = "";

export default function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  if (!MEASUREMENT_ID) return null;
  return <GA gaId={MEASUREMENT_ID} />;
}
