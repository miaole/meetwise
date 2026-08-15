import Link from 'next/link';
import { ArrowLeft, CircleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: '额度说明 · 知面',
  description: '知面预览环境的额度展示边界；当前不提供支付、购买或退款服务。',
};

/**
 * The public preview deliberately does not render purchasable products. The
 * commerce implementation remains a separate internal capability; without a
 * deployed payment, refund and evidence chain, displaying prices or a buy CTA
 * would be a sales claim rather than a reliable user-facing contract.
 */
export default function PricingPage() {
  return (
    <main className="mx-auto max-w-2xl px-1 py-10 sm:py-14">
      <header className="text-center">
        <Badge variant="secondary" className="mb-3">预览环境</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight">额度功能说明</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          当前页面只说明项目边界，不提供支付、购买、退款或自动扣费服务。
        </p>
      </header>

      <Card className="mt-8 border-dashed">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
            <CircleAlert className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-lg">暂不开放交易</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>支付、退款、权益结算和对账需要独立的服务合同、异常处理和真实环境验证。它们完成前，预览页不会显示价格、购买按钮或退款保证。</p>
          <p>若你在其他页面看到练习次数或额度字段，它们仅表示界面或开发流程状态，不构成可购买服务、报价或销售要约。</p>
        </CardContent>
      </Card>

      <p className="mt-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />返回首页
        </Link>
      </p>
    </main>
  );
}
