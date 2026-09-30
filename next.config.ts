import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json in the home dir
  // otherwise confuses Turbopack's root inference.
  turbopack: {
    root: path.join(__dirname),
  },
  // The bare domain is canonical. www is attached to the same Worker and
  // bounces here, so there is one address for the site and one set of search
  // results. Kept in the repo rather than as a Cloudflare redirect rule, so it
  // is visible in review and travels with the code.
  async redirects() {
    return [
      // The root needs its own rule. `/:path*` matching zero segments leaves the
      // placeholder uninterpolated, so www.stephenaguila.com/ was redirecting to
      // a literal "/:path*". Deeper paths interpolate fine, so this rule sits
      // first and the wildcard handles everything below it.
      {
        source: "/",
        has: [{ type: "host", value: "www.stephenaguila.com" }],
        destination: "https://stephenaguila.com/",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.stephenaguila.com" }],
        destination: "https://stephenaguila.com/:path*",
        permanent: true,
      },
    ];
  },
};

// Case studies are MDX in content/work/, pulled in by dynamic import from the
// route rather than being pages themselves — so `pageExtensions` stays alone.
const withMDX = createMDX();

export default withMDX(nextConfig);
