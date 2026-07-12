import Link from 'next/link';
import { LogOut, Menu, Settings, User } from 'lucide-react';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { getServerToken } from '@/lib/api/server';
import { logoutAction } from '@/app/auth-actions';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';

type NavLink = { href: string; label: string };

/** 顶部导航(Server Component:读 cookie 判登录态 + **角色化**(C端求职者 / B端招聘方两套链接)+ i18n + 语言切换)。
 *  营销态在 H5 折叠进 Sheet(汉堡菜单),登录态用 Avatar + DropdownMenu 收纳账户操作。 */
export async function Nav() {
  const ck = await cookies();
  const authed = !!(await getServerToken());
  const isRecruiter = ck.get('mw_role')?.value === 'recruiter';
  const t = await getTranslations('nav');
  const linkCls = 'text-sm text-muted-foreground transition-colors hover:text-foreground';
  const home = isRecruiter ? '/recruiter/jobs' : '/dashboard';

  const appLinks: NavLink[] = isRecruiter
    ? [
        { href: '/recruiter/jobs', label: '岗位' },
        { href: '/recruiter/talent', label: '人才库' },
        { href: '/settings', label: t('settings') },
      ]
    : [
        { href: '/dashboard', label: t('dashboard') },
        { href: '/growth', label: t('growth') },
        { href: '/resume', label: t('resume') },
        { href: '/interviews', label: t('interviews') },
        { href: '/quiz', label: '押题' },
        { href: '/jobs', label: '找工作' },
        { href: '/notifications', label: t('notifications') },
        { href: '/billing', label: t('billing') },
        { href: '/settings', label: t('settings') },
      ];

  const marketingLinks: NavLink[] = [
    { href: '/features', label: t('features') },
    { href: '/pricing', label: t('pricing') },
    { href: '/faq', label: t('faq') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
    <nav className="mx-auto flex min-h-14 max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5 md:px-6">
      <Link href={authed ? home : '/'} className="mr-1 flex items-center gap-1.5 font-serif text-base font-bold tracking-tight">
        {t('brand')}{isRecruiter ? <span className="font-sans text-xs font-normal text-muted-foreground">· 招聘方</span> : null}
      </Link>

      {authed ? (
        <>
          {/* 应用导航链接:始终可见(H5 横向排布/换行),保证可点击 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {appLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls}>{l.label}</Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <LocaleSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" aria-label={t('account')}>
                  <Avatar className="size-8">
                    <AvatarFallback><User className="size-4" /></AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>{t('account')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings"><Settings className="size-4" />{t('settings')}</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                    <button type="submit" className="w-full"><LogOut className="size-4" />{t('logout')}</button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      ) : (
        <>
          {/* 营销链接:PC 内联 */}
          <div className="hidden items-center gap-5 md:flex">
            {marketingLinks.map((l) => (
              <Link key={l.href} href={l.href} className={linkCls}>{l.label}</Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:block"><LocaleSwitcher /></div>
            <Button asChild size="sm"><Link href="/login">{t('login')}</Link></Button>
            {/* H5:汉堡菜单折叠进 Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden" aria-label={t('menu')}>
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{t('brand')}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {marketingLinks.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link href={l.href} className="rounded-md px-2 py-2 text-sm text-foreground transition-colors hover:bg-accent">{l.label}</Link>
                    </SheetClose>
                  ))}
                  <Separator className="my-3" />
                  <SheetClose asChild>
                    <Link href="/login" className="rounded-md px-2 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent">{t('login')}</Link>
                  </SheetClose>
                  <div className="mt-3 px-2"><LocaleSwitcher /></div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </>
      )}
    </nav>
    </header>
  );
}
