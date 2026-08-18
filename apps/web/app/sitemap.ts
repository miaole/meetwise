import type { MetadataRoute } from 'next';
import { publicSiteHref } from '@/lib/public-site';

/** sitemap.xml(SEO):列公开可索引页;受保护页(总览/简历/面试…)不入站点地图。 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = publicSiteHref();
  if (!base) return [];
  const now = new Date();
  const pub = ['', '/features', '/pricing', '/faq', '/legal', '/login'];
  return pub.map((p) => ({ url: base + p, lastModified: now, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.7 }));
}
