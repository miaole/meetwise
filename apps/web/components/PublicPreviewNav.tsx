import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

/**
 * The ECS public preview never receives a session cookie and only exposes a
 * small display-only route set.  Keeping this navigation independent from
 * `Nav` prevents an accidental login, billing, account, or data-flow link
 * from being rendered into the public surface.
 */
export async function PublicPreviewNav() {
  const t = await getTranslations('publicPreview');
  const links = [
    { href: '/', label: t('home') },
    { href: '/features', label: t('features') },
    { href: '/faq', label: t('faq') },
    { href: '/legal', label: t('legal') },
  ];
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <nav className="mx-auto flex min-h-14 max-w-6xl items-center gap-4 px-4 py-2.5 md:px-6" aria-label={t('previewNavAria')}>
        <Link href="/" className="mr-auto font-serif text-base font-bold tracking-tight">{t('brand')}</Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {links.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
