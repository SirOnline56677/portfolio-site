import { GoogleAnalytics as GA } from "@next/third-parties/google";
import AnalyticsEvents from "./AnalyticsEvents";

// Google Analytics 4, alongside the Contentsquare tag. The two answer
// different questions and do not replace each other: GA4 counts visits and
// says where they came from, Contentsquare shows what people did on the page.
//
// Like the Contentsquare tag id, the measurement ID is public — it is visible
// in every gtag request the browser makes — so it lives here as a constant
// rather than in an env var that would have to be set on Cloudflare, on
// preview, and on any future host. Empty would mean "not configured yet",
// and the component would render nothing.
//
// This is the existing "Potential Clients or Employers" property under the
// "Personal Site (StephenAguila.com)" account, the same one the Webflow site
// reported into. Reusing it rather than making a new property keeps the
// history from before the Cloudflare move in one place.
export const MEASUREMENT_ID = "G-MYJ82WREWE";

export default function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  if (!MEASUREMENT_ID) return null;
  return (
    <>
      <GA gaId={MEASUREMENT_ID} />
      <AnalyticsEvents />
    </>
  );
}
