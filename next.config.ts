import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray package-lock.json in the home dir
  // otherwise confuses Turbopack's root inference.
  turbopack: {
    root: path.join(__dirname),
  },
};

// Case studies are MDX in content/work/, pulled in by dynamic import from the
// route rather than being pages themselves — so `pageExtensions` stays alone.
const withMDX = createMDX();

export default withMDX(nextConfig);
