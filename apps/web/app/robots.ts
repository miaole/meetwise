import type { MetadataRoute } from 'next';

/** robots.txt(SEO):公开页可爬;登录后的私有页(含 PII)禁爬。 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meetwise.example';
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/resume', '/interviews', '/interview', '/report', '/settings', '/notifications', '/billing', '/admin', '/privacy', '/roles', '/jobs', '/recruiter'],
    }],
    sitemap: `${base}/sitemap.xml`,
  };
}
