/** 定价页(Server Component / 只读):服务端拉取额度包,登录用户额外渲染当前剩余额度。
 *  购买跳转 /billing(未登录跳 /login)。取数失败优雅降级,无死路。公开页,无鉴权跳转。 */
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { serverGet, getServerToken } from '../../lib/api/server';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type Product = { id: string; name: string; amountCents: number; units: number };

export const metadata = { title: '定价 · 知面' };

const PERKS = ['自适应模拟面试', '逐题点评成长报告', '能力评估与学习计划', '失败自动退额度,绝不重复扣费'];

export default async function PricingPage() {
  const token = await getServerToken();
  const loggedIn = !!token;

  const prods = await serverGet<{ products: Product[] }>('/commerce/products');
  const products = prods?.products ?? null;

  let balance: number | null = null;
  if (loggedIn) {
    const ent = await serverGet<{ availableUnits: number }>('/commerce/entitlement');
    if (ent) balance = ent.availableUnits;
  }

  // 中间档(或第二档)作为「最受欢迎」高亮
  const featuredIdx = products && products.length > 1 ? Math.min(1, products.length - 1) : 0;

  return (
    <main className="mx-auto max-w-4xl px-1 py-8">
      <header className="mb-8 text-center">
        <Badge variant="secondary" className="mb-3">面试额度</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight">选择适合你的额度包</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">按次购买面试额度包,额度进入共享额度池,可用于自适应模拟面试与能力评估。</p>
        {loggedIn && balance !== null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
            <Badge variant="success">剩余额度</Badge>
            <span className="font-semibold">{balance} 次可用</span>
          </div>
        )}
      </header>

      {products === null ? (
        <Card><CardContent className="py-10 text-center text-destructive">暂时无法加载定价,请稍后重试。</CardContent></Card>
      ) : products.length === 0 ? (
        <Card><CardContent className="py-10 text-center text-muted-foreground">暂无可购买的额度包。</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => {
            const featured = i === featuredIdx;
            return (
              <Card key={p.id} className={`relative flex flex-col ${featured ? 'border-primary shadow-[0_1px_0_rgba(26,26,26,.03),0_16px_40px_-22px_rgba(181,101,29,.5)]' : ''}`}>
                {featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">最受欢迎</Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <CardDescription>{p.units} 次面试包</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-4xl font-extrabold tracking-tight">¥{(p.amountCents / 100).toFixed(0)}</span>
                    <span className="text-sm text-muted-foreground">/ {p.units} 次</span>
                  </div>
                  <Separator className="my-4" />
                  <ul className="space-y-2.5">
                    {PERKS.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />{perk}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={featured ? 'default' : 'outline'}>
                    <Link href={loggedIn ? '/billing' : '/login'}>{loggedIn ? '购买' : '登录后购买'}</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!loggedIn && (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          已有账号?<Link href="/login" className="font-medium text-primary hover:underline">登录</Link> 后可查看剩余额度并直接购买。
        </p>
      )}

      <Separator className="mt-10" />
      <p className="mt-6">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />返回总览
        </Link>
      </p>
    </main>
  );
}
