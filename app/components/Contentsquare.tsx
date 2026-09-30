import Script from "next/script";

// Contentsquare tag (heatmaps, session replay) for project 989076. The tag id
// is public: it is the filename of the script every visitor downloads, so it
// lives here rather than in an env var that would have to be set on every
// host. Production only, so local sessions never land in the data. Default
// afterInteractive strategy: loads once per visit after hydration, never
// before first-party code, which is the documented fit for analytics.
const TAG_ID = "9f9315faa250e";

// The global queue the tag drains on load. Named here so the opt-out script
// can push to it before the tag arrives, rather than repeating the literal.
export const CS_OPT_OUT = "_uxa";

export default function Contentsquare() {
  if (process.env.NODE_ENV !== "production") return null;
  return <Script src={`https://t.contentsquare.net/uxa/${TAG_ID}.js`} />;
}
