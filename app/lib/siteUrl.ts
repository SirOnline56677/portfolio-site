/**
 * The canonical origin, in one place.
 *
 * robots.ts and sitemap.ts are Route Handlers rather than `metadata` exports, so
 * `metadataBase` does not apply to them and every URL they emit has to be
 * absolute. Without this constant the origin would be written out in several
 * places and drift the first time one of them changed.
 */
export const SITE_URL = "https://stephenaguila.com";
