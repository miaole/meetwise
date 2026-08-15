/**
 * Public indexing is opt-in through this source-controlled manifest. An
 * arbitrary environment variable must never turn an unverified host into a
 * canonical URL, sitemap entry, share QR, or crawlable site.
 *
 * Keep this empty until the published origin, deployment binding, and access
 * boundary have been independently verified. Preview builds stay noindex.
 */
const TRUSTED_PUBLIC_ORIGINS = new Set<string>();

export function resolvePublicSiteUrl(raw: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (
      url.protocol !== 'https:' ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !TRUSTED_PUBLIC_ORIGINS.has(url.origin)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

export function publicSiteHref(raw: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string | null {
  return resolvePublicSiteUrl(raw)?.toString().replace(/\/$/, '') ?? null;
}
