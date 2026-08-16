import Link from 'next/link';

/**
 * The ECS public preview never receives a session cookie and only exposes a
 * small display-only route set.  Keeping this navigation independent from
 * `Nav` prevents an accidental login, billing, account, or data-flow link
 * from being rendered into the public surface.
 */
const links = [
  { href: '/', label: '首页' },
  { href: '/features', label: '功能边界' },
  { href: '/faq', label: '常见问题' },
  { href: '/legal', label: '数据边界' },
];

export function PublicPreviewNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <nav className="mx-auto flex min-h-14 max-w-6xl items-center gap-4 px-4 py-2.5 md:px-6" aria-label="预览导航">
        <Link href="/" className="mr-auto font-serif text-base font-bold tracking-tight">知面 Meetwise</Link>
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
