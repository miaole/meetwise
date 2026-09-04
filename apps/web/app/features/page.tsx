/** 产品功能:静态服务端组件,纯展示,无业务状态,可被搜索引擎收录。 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  FileText,
  Target,
  Brain,
  Mic,
  LineChart,
  ShieldCheck,
  Route,
  Database,
  BadgeCheck,
  Scale,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { publicSiteHref } from '@/lib/public-site';

const SITE = publicSiteHref();

export const metadata: Metadata = {
  title: '产品功能 · 知面 Meetwise',
  description:
    '知面 Meetwise：真实经历 → 自适应面试 → 可复盘成长。公开预览不提供支付或自动招聘决定；未开放能力不以已可用方式展示。',
  alternates: SITE ? { canonical: '/features' } : undefined,
};

const featureIcons: LucideIcon[] = [FileText, Target, Brain, Mic, LineChart, ShieldCheck];
const diffIcons: LucideIcon[] = [Route, Database, BadgeCheck, Scale];

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  const diffs = [1, 2, 3, 4].map((i) => ({
    title: t(`diff${i}Title`),
    desc: t(`diff${i}Desc`),
    icon: diffIcons[i - 1],
  }));
  const features = [1, 2, 3, 4, 5, 6].map((i) => ({
    title: t(`f${i}Title`),
    desc: t(`f${i}Desc`),
    icon: featureIcons[i - 1],
  }));

  return (
    <main className="mx-auto max-w-4xl px-1 py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <Badge variant="secondary" className="mb-3">{t('badge')}</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t('title')}</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t('lead')}</p>
      </header>

      <section className="mb-12">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">{t('diffEyebrow')}</div>
        <h2 className="mt-2 max-w-2xl font-serif text-2xl font-extrabold tracking-tight">{t('diffH2')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {diffs.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="p-5">
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-4" aria-hidden />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="transition-colors hover:border-primary">
              <CardHeader>
                <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <Separator className="mt-12" />
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/">{t('ctaHome')}<ArrowRight /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">{t('ctaPricing')}</Link>
        </Button>
      </div>
    </main>
  );
}
