/** 产品功能:静态服务端组件,纯展示,无业务状态,可被搜索引擎收录。 */
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  FileText,
  Target,
  Brain,
  Users,
  LineChart,
  ShieldCheck,
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
  description: '知面预览版：按真实经历练面试。下一题跟着回答走，进度能留下来，点评只供复盘。',
  alternates: SITE ? { canonical: '/features' } : undefined,
};

const featureIcons: LucideIcon[] = [FileText, Target, Brain, Users, LineChart, ShieldCheck];

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  const diffs = [1, 2, 3, 4, 5, 6].map((i) => ({
    title: t(`diff${i}Title`),
    desc: t(`diff${i}Desc`),
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

      <section id="arch" className="mb-12">
        <div className="text-xs font-medium uppercase tracking-wide text-primary">{t('diffEyebrow')}</div>
        <h2 className="mt-2 max-w-2xl text-2xl font-extrabold tracking-tight">{t('diffH2')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {diffs.map((item) => (
            <Card key={item.title} className="p-5">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
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
