import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { publicSiteHref } from '@/lib/public-site';

const SITE = publicSiteHref();

export const metadata: Metadata = {
  description: '知面 Meetwise 项目预览：围绕真实经历进行表达练习与个人复盘；实际开放能力以页面说明为准。',
  alternates: SITE ? { canonical: '/' } : undefined,
};

const jsonLd = SITE ? {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', name: 'Meetwise 知面', url: SITE },
    { '@type': 'WebSite', name: 'Meetwise 知面', url: SITE, inLanguage: 'zh-CN' },
    { '@type': 'SoftwareApplication', name: 'Meetwise 知面', applicationCategory: 'EducationApplication', operatingSystem: 'Web' },
  ],
} : null;

export default async function Home() {
  const t = await getTranslations('home');
  const stats = [
    { n: t('stat1n'), l: t('stat1l'), w: false },
    { n: t('stat2n'), l: t('stat2l'), w: true },
    { n: t('stat3n'), l: t('stat3l'), w: false },
    { n: t('stat4n'), l: t('stat4l'), w: false },
  ];
  const caps = [1, 2, 3, 4, 5, 6].map((i) => ({ mark: t(`cap${i}Mark`), title: t(`cap${i}Title`), desc: t(`cap${i}Desc`) }));
  const bars = [{ l: t('bar1'), w: 62 }, { l: t('bar2'), w: 48 }, { l: t('bar3'), w: 74 }];

  return (
    <main className="space-y-24 pb-8">
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}

      {/* ───── Hero:两栏(左文案 / 右红笔批注报告卡)───── */}
      <section className="grid items-center gap-10 pt-6 md:grid-cols-[1.05fr_.95fr] md:gap-12 md:pt-10">
        <div>
          <Badge variant="outline" className="gap-2 bg-card py-1 pl-2.5 pr-3 text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary" />{t('pill')}
          </Badge>
          <h1 className="mt-5 font-serif text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
            {/* 品牌词写进 h1 的无障碍名(对 SEO / 黄金路径稳定),视觉上保持文案不变 */}
            <span className="sr-only">知面 Meetwise · </span>
            {t('titlePre')}<span className="text-primary underline decoration-primary decoration-wavy underline-offset-[6px]">{t('titleHl')}</span>{t('titlePost')}
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">{t('lead')}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg"><Link href="/features">{t('ctaPrimary')}<ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/legal">{t('ctaSecondary')}</Link></Button>
            <span className="text-xs text-muted-foreground">{t('free')}</span>
          </div>
        </div>

        {/* 签名组件:报告批注卡(品牌母题) */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b bg-secondary px-4 py-3 text-xs text-muted-foreground">
            <span>{t('cardLabel')}</span>
            <Badge variant="success" className="gap-1.5">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />{t('cardLive')}
            </Badge>
          </div>
          <CardContent className="p-5">
            <div className="font-medium leading-relaxed">{t('cardQ')}</div>
            <div className="mt-2 text-sm leading-relaxed text-muted-foreground">{t('cardA')}</div>
            <div className="mt-4 rounded-r-md border-l-2 border-primary bg-accent px-4 py-3 text-[13px] leading-relaxed text-ink2">
              <b className="text-primary">{t('cardNoteLabel')}</b>　{t('cardNote')}
            </div>
            <Separator className="mt-5" />
            <div className="mt-5 flex items-center gap-6">
              <div className="font-serif text-lg font-extrabold tracking-tight text-primary">练习反馈</div>
              <div className="flex-1 space-y-2">
                {bars.map((b) => (
                  <div key={b.l} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="w-16 shrink-0">{b.l}</span>
                    <Progress value={b.w} className="h-1.5 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ───── Stats(发丝线卡片)───── */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.l} className="p-5">
            <div className={`font-serif text-[26px] font-extrabold tracking-tight ${s.w ? 'text-primary' : ''}`}>{s.n}</div>
            <div className="mt-0.5 text-[13px] text-muted-foreground">{s.l}</div>
          </Card>
        ))}
      </div>

      {/* ───── Features ───── */}
      <section>
        <div className="text-xs font-medium uppercase tracking-wide text-primary">{t('featEyebrow')}</div>
        <h2 className="mt-2 max-w-2xl font-serif text-2xl font-extrabold tracking-tight sm:text-3xl">{t('featH2')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {caps.map((c) => (
            <Card key={c.title} className="p-6 transition-colors hover:border-primary">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent font-serif text-sm font-bold text-primary">{c.mark}</span>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ───── Deep statement(墨色块)───── */}
      <section className="grid items-center gap-8 rounded-lg bg-foreground p-8 text-background sm:p-12 md:grid-cols-[1.3fr_1fr]">
        <div>
          <h3 className="font-serif text-2xl font-extrabold leading-snug sm:text-3xl">{t('stmtTitle')}</h3>
          <p className="mt-4 text-[15px] leading-relaxed text-background/70">{t('stmtP')}</p>
        </div>
        <div>
          <Button asChild size="lg" className="w-full"><Link href="/features">{t('stmtCta')}<ArrowRight /></Link></Button>
          <p className="mt-3 text-center text-xs text-background/55">{t('stmtNote')}</p>
        </div>
      </section>

      {/* ───── Footer(分组链接 + 分隔线)───── */}
      <footer className="space-y-6">
        <div className="grid gap-8 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-serif text-base font-bold tracking-tight">{t('footBrand')}</div>
            <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted-foreground">{t('footDesc')}</p>
          </div>
          <FooterCol title={t('footProductTitle')} links={[
            { href: '/features', label: t('footFeatures') },
            { href: '/faq', label: t('footFaq') },
            { href: '/legal', label: t('footLegal') },
          ]} />
          <FooterCol title={t('footSupportTitle')} links={[
            { href: '/legal', label: t('footLegal') },
            { href: '/faq', label: t('footFaq') },
          ]} />
        </div>
        <Separator />
        <div className="flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>{t('footL')}</span>
          <span>{t('footR')}</span>
        </div>
      </footer>
    </main>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">{title}</div>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
