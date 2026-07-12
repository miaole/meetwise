import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Database, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { listWindow, withLimitHref } from '@/lib/paginate';

const PAGE = 30;          // 人才库可能很大:封顶首屏渲染行数,"加载更多"递增 ?limit

export const metadata: Metadata = { title: '人才库 · 招聘方 · 知面', description: '跨自有岗位聚合候选人,用同一引擎面试,数据严格隔离。' };

interface Talent {
  id: string; job_id: string; job_title: string; candidate_user_id: string;
  status: string; score: number | null; source: string; created_at: string;
}

const STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'outline' | 'destructive' }> = {
  invited: { text: '已邀请', variant: 'outline' },
  in_progress: { text: '面试中', variant: 'outline' },
  completed: { text: '已完成', variant: 'success' },
  declined: { text: '已婉拒', variant: 'destructive' },
};

/**
 * B 端人才库:跨招聘方**自有所有岗位**聚合候选人(后端 RLS 租户隔离,看不到他人租户)。
 * 服务端排序/筛选(?sort=score&order=desc&status=completed)。RSC,无死胡同(空/失败/各状态都有出口)。
 */
export default async function TalentPoolPage({ searchParams }: { searchParams: Promise<{ sort?: string; order?: string; status?: string; limit?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const sp = await searchParams;
  // 纵深防御:排序/筛选键白名单后再转发后端(即便后端已校验,前端也不把任意串拼进查询,杜绝 ORDER BY 注入面)。
  const qs = new URLSearchParams();
  if (sp.sort === 'score') qs.set('sort', 'score');
  if (sp.order === 'asc' || sp.order === 'desc') qs.set('order', sp.order);
  if (sp.status && ['invited', 'in_progress', 'completed', 'declined'].includes(sp.status)) qs.set('status', sp.status);
  const data = await serverGet<{ talents: Talent[] }>(`/recruiter/talent${qs.toString() ? `?${qs}` : ''}`);
  const talents = data?.talents ?? null;
  const win = talents ? listWindow(talents, sp.limit, PAGE) : null;

  const sortByScore = sp.sort === 'score';
  const filters: { key: string; label: string }[] = [
    { key: '', label: '全部' },
    { key: 'invited', label: '已邀请' },
    { key: 'in_progress', label: '面试中' },
    { key: 'completed', label: '已完成' },
    { key: 'declined', label: '已婉拒' },
  ];
  const hrefWith = (over: Record<string, string>) => {
    const n = new URLSearchParams(qs);
    for (const [k, v] of Object.entries(over)) { if (v) n.set(k, v); else n.delete(k); }
    const s = n.toString();
    return `/recruiter/talent${s ? `?${s}` : ''}`;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm">
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />返回岗位列表</Link>
      </p>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Database className="size-6 text-primary" />人才库</h1>
        <p className="mt-1 text-muted-foreground">跨你所有岗位聚合的候选人,用同一引擎面试。数据严格隔离——只见状态与评分,看不到面试内容,也看不到其他企业的候选人。</p>
      </div>

      {/* 服务端筛选/排序:链接驱动(RSC 重新取数),无客户端状态 */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">状态:</span>
        {filters.map((f) => (
          <Link key={f.key || 'all'} href={hrefWith({ status: f.key })}
            className={`rounded-full border px-3 py-1 transition-colors ${(sp.status ?? '') === f.key ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:border-foreground'}`}>
            {f.label}
          </Link>
        ))}
        <span className="ml-2 text-muted-foreground">排序:</span>
        <Link href={hrefWith({ sort: 'score', order: 'desc' })} className={`rounded-full border px-3 py-1 transition-colors ${sortByScore ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:border-foreground'}`}>评分高→低</Link>
        <Link href={hrefWith({ sort: '', order: '' })} className={`rounded-full border px-3 py-1 transition-colors ${!sortByScore ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:border-foreground'}`}>最新</Link>
      </div>

      <Card>
        <CardContent className="p-4">
          {talents === null ? (
            <p className="py-8 text-center text-sm text-muted-foreground">人才库暂不可用,请稍后重试。</p>
          ) : talents.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Users className="mx-auto mb-2 size-6 opacity-50" />
              还没有候选人。去<Link href="/recruiter/jobs" className="text-primary hover:underline">岗位</Link>邀请候选人,或等候选人主动投递。
            </div>
          ) : (
            <div className="table-wrap overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">候选人</th>
                    <th className="py-2 pr-4 font-medium">岗位</th>
                    <th className="py-2 pr-4 font-medium">来源</th>
                    <th className="py-2 pr-4 font-medium">状态</th>
                    <th className="py-2 font-medium">评分</th>
                  </tr>
                </thead>
                <tbody>
                  {win!.shown.map((t) => {
                    const st = STATUS_LABEL[t.status] ?? { text: t.status, variant: 'outline' as const };
                    return (
                      <tr key={t.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono">{t.candidate_user_id.slice(0, 8)}</td>
                        <td className="py-3 pr-4">
                          <Link href={`/recruiter/jobs/${t.job_id}`} className="text-foreground hover:text-primary hover:underline">{t.job_title}</Link>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{t.source === 'invited' ? '招聘方邀请' : '主动投递'}</td>
                        <td className="py-3 pr-4"><Badge variant={st.variant}>{st.text}</Badge></td>
                        <td className="py-3">
                          {t.score === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={Math.max(0, Math.min(100, t.score))} className="h-1.5 w-24" />
                              <span className="text-xs font-semibold tabular-nums text-primary">{t.score}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {win!.hasMore && (
                <div className="mt-3 text-center">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={withLimitHref('/recruiter/talent', { sort: sp.sort, order: sp.order, status: sp.status }, win!.nextLimit)} scroll={false}>
                      加载更多(还有 {win!.remaining} 人)
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
