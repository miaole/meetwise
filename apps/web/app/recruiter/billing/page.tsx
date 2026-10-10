/** 招聘方企业充值页(B271 #271 片1·S1-C8)——企业商品 + 线上下单/对公转账 + 开票资料维护 + 开票申请。
 *  仅审核通过的招聘方可用(后端 gateway_require_active_recruiter 门·0155 同门);C 端 pricing/billing 面零触
 *  (预览封闭语义对 C 端不变)。对公转账单停 created,由运营在 /admin 台账人工确认入账(双人分离)。
 *  本页为 B271 片1 EXEC 席 2026-10-10 全新书写(历史隔离档零恢复)。 */
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnterpriseRechargeForms, InvoiceProfileForm, InvoiceRequestForm } from './RechargeForms';

export const metadata = { title: '企业充值 · 知面' };

type Product = { id: string; name: string; amountCents: number; units: number; domain: string };
type InvoiceProfile = { title: string; tax_id: string; address_phone: string | null; bank_account: string | null; email: string } | null;
type InvoiceRequest = { id: string; order_id: string; status: string; invoice_no: string | null; reject_reason: string | null; requested_at: string };

const fail = <p className="text-sm text-amber-600">加载失败或暂不可用</p>;

async function ProductsSection() {
  const data = await serverGet<{ products: Product[] }>('/commerce/enterprise-products');
  const enterprise = data?.products?.filter((p) => p.domain === 'enterprise') ?? null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">企业充值套餐</CardTitle></CardHeader>
      <CardContent>
        {enterprise && enterprise.length > 0 ? (
          <div className="space-y-4">
            {enterprise.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 border-b pb-3 last:border-b-0">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-muted-foreground">¥{(p.amountCents / 100).toFixed(2)} · {p.units} 次面试额度 · 入账至企业额度桶</div>
                </div>
                <EnterpriseRechargeForms productId={p.id} name={p.name} amountCents={p.amountCents} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              线上支付：下单后经支付回调自动入账（幂等，重复回调不重复入账）。对公转账：下单后向下方对公账户转账，
              务必在转账备注中注明订单号，由运营/财务人工确认入账（录入与确认双人分离，预计 1 个工作日内到账）。
            </p>
          </div>
        ) : fail}
      </CardContent>
    </Card>
  );
}

async function OfflineAccountSection() {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">对公收款账户</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
        <p>开户户名：知面（Meetwise）运营主体 · 开户行：请联系运营获取对公账户信息 · 账号：预览环境未公开</p>
        <p className="text-foreground">转账备注必须注明订单号（下单后页面会显示），运营将按订单核对到账金额后人工确认入账。</p>
        <p>金额不符或未注明订单号的汇款将被拒绝入账并转人工处理；逾期未到账的订单会被置为失败。</p>
      </CardContent>
    </Card>
  );
}

async function InvoiceSection() {
  const [profileRes, requestsRes] = await Promise.all([
    serverGet<{ profile: InvoiceProfile }>('/commerce/invoice-profile'),
    serverGet<{ requests: InvoiceRequest[] }>('/commerce/invoice-requests'),
  ]);
  const profile = profileRes?.profile ?? null;
  const requests = requestsRes?.requests ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          开票资料与申请 <span className="text-xs font-normal text-muted-foreground">(仅本人可见 · 申请仅限已支付订单)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <InvoiceProfileForm initial={{ title: profile?.title ?? '', taxId: profile?.tax_id ?? '', addressPhone: profile?.address_phone ?? '', bankAccount: profile?.bank_account ?? '', email: profile?.email ?? '' }} />
        <InvoiceRequestForm />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-muted-foreground"><th className="border-b px-3 py-2">订单号</th><th className="border-b px-3 py-2">状态</th><th className="border-b px-3 py-2">发票号</th><th className="border-b px-3 py-2">申请时间</th></tr></thead>
            <tbody>{(requests ?? []).slice(0, 20).map((r) => (
              <tr key={r.id}>
                <td className="border-b px-3 py-2">{r.order_id}</td>
                <td className="border-b px-3 py-2"><Badge variant={r.status === 'issued' ? 'default' : r.status === 'rejected' ? 'destructive' : 'secondary'}>{r.status}</Badge></td>
                <td className="border-b px-3 py-2">{r.invoice_no ?? '-'}</td>
                <td className="border-b px-3 py-2">{r.requested_at}</td>
              </tr>
            ))}</tbody>
          </table>
          {requests && requests.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">暂无开票申请。</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const box = (label: string) => <p className="text-sm text-muted-foreground">{label}加载中…</p>;

export default async function RecruiterBillingPage() {
  if (!(await getServerToken())) redirect('/login');
  return (
    <main className="mx-auto max-w-3xl space-y-5 py-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">企业充值</h1>
        <p className="mt-1 text-sm text-muted-foreground">企业额度充值与开票（候选人岗位面试由企业额度支付，不消耗候选人个人额度）</p>
      </div>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">企业充值套餐</CardTitle></CardHeader><CardContent>{box('套餐')}</CardContent></Card>}><ProductsSection /></Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">对公收款账户</CardTitle></CardHeader><CardContent>{box('账户')}</CardContent></Card>}><OfflineAccountSection /></Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">开票资料与申请</CardTitle></CardHeader><CardContent>{box('开票')}</CardContent></Card>}><InvoiceSection /></Suspense>
    </main>
  );
}
