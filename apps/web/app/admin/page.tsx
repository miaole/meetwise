/** 运营管理后台(知面 · admin)—— Next.js App Router **Server Component**(只读,无写操作)。
 *  令牌取自 httpOnly cookie(服务端),数据在服务端拉、HTML 服务端渲染:首屏快、少客户端 JS、可流式。
 *  仅运营管理员可见;后端 admin 接口对非管理员返回 403(serverGet 返回 null)。
 *  设计:逐区独立降级——任一区加载失败只在该区提示,不拖垮其它区;审计日志 append-only/不可篡改。
 *  各区用 async 子组件 + <Suspense> 流式渲染,慢区不阻塞快区首屏。 */
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: '运营 Admin · 知面' };

type Stats = { users: number; orders: number; paidCents: number };
type U = { id: string; email: string; status: string; is_admin: boolean; created_at: string };
type O = { id: string; owner_user_id: string; product_id: string; amount_cents: number; status: string };
type Fb = { up: number; down: number; total: number; downRate: number };
type Au = { actor: string; action: string; target: string; detail?: string };

const th = 'border-b px-3 py-2 text-left font-medium text-muted-foreground';
const td = 'border-b px-3 py-2';
const fail = <p className="text-sm text-amber-600">无权限或加载失败</p>;
const loadingBox = (label: string) => <p className="text-sm text-muted-foreground">{label}加载中…</p>;

async function StatsSection() {
  const stats = await serverGet<Stats>('/admin/stats');
  return (
    <>
      {!stats && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4">
            <p className="font-medium text-destructive">需要运营管理员权限</p>
            <p className="mt-2 text-sm text-muted-foreground">当前账号无权访问该页面。如需开通请联系超级管理员。</p>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">核心指标</CardTitle>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-3 gap-4">
              <div><div className="text-2xl font-bold">{stats.users}</div><div className="text-xs text-muted-foreground">用户数</div></div>
              <div><div className="text-2xl font-bold">{stats.orders}</div><div className="text-xs text-muted-foreground">订单数</div></div>
              <div><div className="text-2xl font-bold">¥{(stats.paidCents / 100).toFixed(2)}</div><div className="text-xs text-muted-foreground">已付总额</div></div>
            </div>
          ) : fail}
        </CardContent>
      </Card>
    </>
  );
}

async function UsersSection() {
  const data = await serverGet<{ users: U[] }>('/admin/users');
  const users = data?.users ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">用户列表 {users && <span className="text-xs font-normal text-muted-foreground">(显示前 {Math.min(users.length, 50)} 条)</span>}</CardTitle>
      </CardHeader>
      <CardContent>
        {users ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className={th}>邮箱</th><th className={th}>状态</th><th className={th}>管理员</th><th className={th}>注册时间</th></tr></thead>
              <tbody>{users.slice(0, 50).map((x) => (
                <tr key={x.id}><td className={td}>{x.email}</td><td className={td}><Badge variant="secondary">{x.status}</Badge></td><td className={td}><Badge variant={x.is_admin ? 'default' : 'outline'}>{x.is_admin ? '是' : '否'}</Badge></td><td className={td}>{x.created_at}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : fail}
      </CardContent>
    </Card>
  );
}

async function OrdersSection() {
  const data = await serverGet<{ orders: O[] }>('/admin/orders');
  const orders = data?.orders ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">订单列表</CardTitle>
      </CardHeader>
      <CardContent>
        {orders ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className={th}>订单号</th><th className={th}>用户</th><th className={th}>商品</th><th className={th}>金额</th><th className={th}>状态</th></tr></thead>
              <tbody>{orders.slice(0, 50).map((x) => (
                <tr key={x.id}><td className={td}>{x.id}</td><td className={td}>{x.owner_user_id}</td><td className={td}>{x.product_id}</td><td className={td}>¥{(x.amount_cents / 100).toFixed(2)}</td><td className={td}><Badge variant="secondary">{x.status}</Badge></td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : fail}
      </CardContent>
    </Card>
  );
}

async function FeedbackSection() {
  const fb = await serverGet<Fb>('/admin/question-feedback');
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI 出题质量</CardTitle>
      </CardHeader>
      <CardContent>
        {fb ? (
          <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
            <span className="text-xl font-bold text-green-600">👍 {fb.up}</span>
            <span className="text-xl font-bold text-red-600">👎 {fb.down}</span>
            <span className="text-sm text-muted-foreground">共 {fb.total} 次 · 踩率 {(fb.downRate * 100).toFixed(1)}%</span>
            <span className="text-xs text-muted-foreground">运营据此复盘 prompt / 模型质量</span>
          </div>
        ) : fail}
      </CardContent>
    </Card>
  );
}

async function AuditSection() {
  const data = await serverGet<{ audit: Au[] }>('/admin/audit');
  const audit = data?.audit ?? null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">审计日志 <span className="text-xs font-normal text-muted-foreground">(append-only · 不可篡改)</span></CardTitle>
      </CardHeader>
      <CardContent>
        {audit ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr><th className={th}>操作人</th><th className={th}>动作</th><th className={th}>对象</th><th className={th}>详情</th></tr></thead>
              <tbody>{audit.slice(0, 50).map((x, i) => (
                <tr key={i}><td className={td}>{x.actor}</td><td className={td}>{x.action}</td><td className={td}>{x.target}</td><td className={td}>{x.detail ?? '-'}</td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : fail}
      </CardContent>
    </Card>
  );
}

export default async function AdminPage() {
  if (!(await getServerToken())) redirect('/login');

  return (
    <main className="mx-auto max-w-5xl space-y-5 py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">运营管理后台</h1>
        <p className="mt-1 text-sm text-muted-foreground">知面 · 仅运营管理员可见</p>
      </div>

      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">核心指标</CardTitle></CardHeader><CardContent>{loadingBox('指标')}</CardContent></Card>}>
        <StatsSection />
      </Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">用户列表</CardTitle></CardHeader><CardContent>{loadingBox('用户')}</CardContent></Card>}>
        <UsersSection />
      </Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">订单列表</CardTitle></CardHeader><CardContent>{loadingBox('订单')}</CardContent></Card>}>
        <OrdersSection />
      </Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">AI 出题质量</CardTitle></CardHeader><CardContent>{loadingBox('反馈')}</CardContent></Card>}>
        <FeedbackSection />
      </Suspense>
      <Suspense fallback={<Card><CardHeader><CardTitle className="text-base">审计日志</CardTitle></CardHeader><CardContent>{loadingBox('审计')}</CardContent></Card>}>
        <AuditSection />
      </Suspense>
    </main>
  );
}
