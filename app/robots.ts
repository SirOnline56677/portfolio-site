import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/siteUrl";

/**
 * Crawlers are welcome, including the AI ones.
 *
 * The AI group is named explicitly rather than left to the wildcard. The
 * wildcard already permits them, but several of these crawlers look for their
 * own user-agent before deciding, and naming them states the intent plainly to
 * anyone who reads the file.
 *
 * Worth knowing: this file cannot unblock a crawler that Cloudflare refuses at
 * the edge. AI crawler blocking is a zone setting, and while it is on, GPTBot
 * and ClaudeBot receive a 403 before the request ever reaches this Worker.
 *
 * /api/ is disallowed because both routes there are Bingo prototype endpoints,
 * not content worth indexing.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
