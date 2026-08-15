import type { MetadataRoute } from 'next';
import { publicSiteHref } from '@/lib/public-site';

/** robots.txt(SEO):公开页可爬;登录后的私有页(含 PII)禁爬。 */
export default function robots(): MetadataRoute.Robots {
  const base = publicSiteHref();
  if (!base) return { rules: { userAgent: '*', disallow: '/' } };
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/resume', '/interviews', '/interview', '/report', '/settings', '/notifications', '/billing', '/admin', '/privacy', '/roles', '/jobs', '/recruiter'],
    }],
    sitemap: `${base}/sitemap.xml`,
  };
}
