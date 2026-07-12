/** 额度与购买(Server Component):展示剩余面试额度 + 套餐,通过 Server Action 创建演示订单(幂等)。
 *  真实支付由支付方验签回调入账,此处仅创建订单(演示),不接真支付、不收集任何支付信息。 */
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { BuyButton } from './BuyButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: '额度与购买 · 知面' };

type Product = { id: string; name: string; amountCents: number; units: number };

const yuan = (cents: number) => (cents / 100).toFixed(2);

const NEED_LABEL: Record<string, string> = { interview: '开始模拟面试', quiz: '生成押题', diagnosis: '做简历诊断' };

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ need?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { need } = await searchParams;   // 从 begin 402 跳来时带上,用于情境提示("你需要额度才能开始 X")

  const bal = await serverGet<{ availableUnits: number }>('/commerce/entitlement');
  const prods = await serverGet<{ products: Product[] }>('/commerce/products');

  const products = prods?.products ?? [];
  const out = (bal?.availableUnits ?? 0) <= 0;

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">额度与购买</h1>
        <p className="mt-1 text-muted-foreground">购买面试额度,按次消耗。</p>
      </header>

      {/* 从某功能因额度不足被引导过来:明确告诉用户"为啥在这 + 买完能继续什么",不让用户一脸懵(无死胡同) */}
      {need && out && (
        <div className="mb-6 rounded-lg border border-brand-em/50 bg-accent/60 p-4 text-sm leading-relaxed text-ink2">
          <strong className="text-brand-deep">额度不足,无法{NEED_LABEL[need] ?? '使用该功能'}</strong>
          <p className="mt-1 text-muted-foreground">你当前剩余额度为 0。下面选个套餐购买,支付到账后回去即可继续——你的进度不会丢。</p>
        </div>
      )}

      <Card className="mb-8 border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-1 py-6">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">剩余额度</Badge>
            <span className="text-sm text-muted-foreground">当前剩余面试额度</span>
          </div>
          <div className="text-5xl font-extrabold leading-none text-primary">
            {bal ? bal.availableUnits : '暂不可用'}
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">选择套餐</h2>
      {!prods ? (
        <p className="text-muted-foreground">暂不可用。</p>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground">暂无可购买套餐。</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-base">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-1">
                <div className="text-3xl font-bold tracking-tight">¥{yuan(p.amountCents)}</div>
                <div className="text-sm text-muted-foreground">含 {p.units} 次面试额度</div>
                <div className="mt-auto pt-4">
                  <BuyButton productId={p.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-8 bg-muted/40">
        <CardContent className="py-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">支付安全说明:</strong> 本页<strong className="text-foreground">不收集任何银行卡 / 支付信息</strong>。
            真实支付由支付方验签回调入账,此处仅创建订单(演示)。
          </p>
          <p className="mt-2">
            <strong className="text-foreground">订单创建幂等:</strong> 每次「购买」会带上唯一的 idempotency-key;
            重复点击同一幂等键不双扣,不会重复下单或重复扣费。
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
