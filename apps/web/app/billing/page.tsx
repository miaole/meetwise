import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: '额度说明 · 知面',
  description: '知面预览环境未开放购买、支付、退款或权益结算。',
};

export default function BillingPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">额度说明</h1>
        <p className="mt-2 text-muted-foreground">公开预览不提供交易、价格、权益结算或自动扣费服务。</p>
      </header>

      <Card className="border-brand-em/40 bg-accent/50">
        <CardHeader><CardTitle className="text-lg">当前不开放</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>购买、支付、退款、发票、权益到账、对账和自动扣费需要独立的服务合同、异常处理与真实环境验证。它们完成前，本站不展示商品、价格或操作入口。</p>
          <p>如某个练习流程因资源不足而无法继续，页面会明确显示不可用状态，不会引导你创建订单。</p>
        </CardContent>
      </Card>

      <p className="mt-8 text-sm"><Link href="/pricing" className="text-muted-foreground hover:text-foreground">← 返回预览说明</Link></p>
    </main>
  );
}
