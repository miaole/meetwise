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
type MyOrder = { id: string; product_id: string; amount_cents: number; units: number; status: string; channel: string; created_at: string };
type OfflineOrder = { order_id: string; product_id: string; amount_cents: number; order_status: string; remit_status: string | null; entered_at: string | null; confirmed_at: string | null; created_at: string };

const fail = <p className="text-sm text-amber-600">加载失败或暂不可用</p>;

/** B271 片3 P3（裁定②）：企业余额挂件——entitlement 零参调用读并列值 enterpriseAvailableUnits（一次调用双算·响应只增）。
 *  读时快照非实时余额承诺（§7 Non-claims）。落点=h1 区之下、ProductsSection 之上（REQUEST §1 P3）。 */
async function BalanceSection() {
  const data = await serverGet<{ availableUnits: number; enterpriseAvailableUnits: number }>('/commerce/entitlement');
  const units = typeof data?.enterpriseAvailableUnits === 'number' ? data.enterpriseAvailableUnits : null;
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">企业可用额度</CardTitle></CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold">{units === null ? '—' : units}<span className="ml-1 text-sm font-normal text-muted-foreground">次面试</span></p>
        <p className="text-sm text-muted-foreground">候选人岗位面试由企业额度支付（读时快照，非实时余额承诺）。</p>
      </CardContent>
    </Card>
  );
}

/** B271 片3 P2（裁定①）：招聘方自服对公订单台账——0159 受控 DEFINER 本人行读函数·只读无操作口（镜像 admin 卡列式删三按钮）。
 *  三态可视：remit_status NULL=created（未录入）→ entered（已录入待确认）→ confirmed（已入账）·failed=destructive。 */
async function OfflineOrdersSection() {
  const data = await serverGet<{ orders: OfflineOrder[] }>('/commerce/offline-orders');
  const orders = data?.orders ?? null;
  const remitBadge: Record<string, { text: string; variant: 'outline' | 'secondary' | 'success' | 'destructive' }> = {
    created: { text: 'created', variant: 'outline' },
    entered: { text: 'entered', variant: 'secondary' },
    confirmed: { text: 'confirmed', variant: 'success' },
    failed: { text: 'failed', variant: 'destructive' },
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          我的对公订单 <span className="text-xs font-normal text-muted-foreground">(仅本人可见 · 只读台账 · 无操作口)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {orders === null ? (
          <p className="text-sm text-amber-600">加载失败或暂不可用</p>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无对公订单；在上方选择对公转账下单后，此处可查到账进度。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-muted-foreground"><th className="border-b px-3 py-2">订单号</th><th className="border-b px-3 py-2">商品</th><th className="border-b px-3 py-2">金额</th><th className="border-b px-3 py-2">下单时间</th><th className="border-b px-3 py-2">状态</th></tr></thead>
              <tbody>{orders.map((o) => {
                const st = remitBadge[o.remit_status ?? 'created'] ?? { text: o.remit_status ?? 'created', variant: 'outline' as const };
                return (
                  <tr key={o.order_id}>
                    <td className="border-b px-3 py-2 font-mono">{o.order_id}</td>
                    <td className="border-b px-3 py-2">{o.product_id}</td>
                    <td className="border-b px-3 py-2">¥{(o.amount_cents / 100).toFixed(2)}</td>
                    <td className="border-b px-3 py-2">{o.created_at}</td>
                    <td className="border-b px-3 py-2"><Badge variant={st.variant}>{st.text}</Badge></td>
                  </tr>
                );
              })}</tbody>
            </table>
            <p className="px-3 py-2 text-xs text-muted-foreground">状态：created（待转账/未录入）→ entered（运营已录入流水，人工确认中）→ confirmed（已入账企业额度）；failed=置败（金额不符或逾期）。</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

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
  const [profileRes, requestsRes, ordersRes] = await Promise.all([
    serverGet<{ profile: InvoiceProfile }>('/commerce/invoice-profile'),
    serverGet<{ requests: InvoiceRequest[] }>('/commerce/invoice-requests'),
    serverGet<{ orders: MyOrder[] }>('/commerce/orders'),
  ]);
  const profile = profileRes?.profile ?? null;
  const requests = requestsRes?.requests ?? null;
  // B271 片3 P4（裁定③）：开票下拉数据源=本人订单仅 status==='paid' 行（ LIMIT 50 窗口外老 paid 单不可选=如实边界）。
  const paidOrders = ordersRes?.orders?.filter((o) => o.status === 'paid') ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          开票资料与申请 <span className="text-xs font-normal text-muted-foreground">(仅本人可见 · 申请仅限已支付订单)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <InvoiceProfileForm initial={{ title: profile?.title ?? '', taxId: profile?.tax_id ?? '', addressPhone: profile?.address_phone ?? '', bankAccount: profile?.bank_account ?? '', email: profile?.email ?? '' }} />
        <InvoiceRequestForm paidOrders={paidOrders} />
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
      {/* B271 片3 P3：企业余额挂件（首屏·套餐之上）。 */}
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">企业可用额度</CardTitle></CardHeader><CardContent>{box('余额')}</CardContent></Card>}><BalanceSection /></Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">企业充值套餐</CardTitle></CardHeader><CardContent>{box('套餐')}</CardContent></Card>}><ProductsSection /></Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">对公收款账户</CardTitle></CardHeader><CardContent>{box('账户')}</CardContent></Card>}><OfflineAccountSection /></Suspense>
      {/* B271 片3 P2：我的对公订单台账（账户卡之下·开票卡之上）。 */}
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">我的对公订单</CardTitle></CardHeader><CardContent>{box('对公订单')}</CardContent></Card>}><OfflineOrdersSection /></Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">开票资料与申请</CardTitle></CardHeader><CardContent>{box('开票')}</CardContent></Card>}><InvoiceSection /></Suspense>
    </main>
  );
}
