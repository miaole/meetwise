import { redirect } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { InviteCandidateDialog } from '@/components/InviteCandidateDialog';
import { listWindow, withLimitHref } from '@/lib/paginate';

const PAGE = 30;          // 单岗位候选人封顶首屏渲染,"加载更多"递增 ?limit

export const metadata: Metadata = { title: '岗位候选人 · 招聘方 · 知面', description: '查看投递该岗位的候选人及其评估状态。' };

interface Job { id: string; title: string; competencies: string[]; status: string }
interface Candidate { id: string; candidate_user_id: string; status: string; score: number | null; source?: string }

/** 申请状态 → 中文标签 + Badge 变体(无死胡同:每个状态都有出口文案)。 */
const STATUS_LABEL: Record<string, { text: string; variant: 'success' | 'outline' | 'destructive' }> = {
  invited: { text: '已邀请', variant: 'outline' },
  in_progress: { text: '面试中', variant: 'outline' },
  completed: { text: '已完成', variant: 'success' },
  declined: { text: '已婉拒', variant: 'destructive' },
};

/** B 端(招聘方)岗位详情:看本岗位的候选人列表(多租户 RLS 只见自己岗位)。RSC,await params 取 id,Promise.all 并行取数。 */
export default async function RecruiterJobCandidatesPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ limit?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { id } = await params;
  const { limit } = await searchParams;

  const [jobRes, candidatesRes] = await Promise.all([
    serverGet<{ job?: Job } | Job>(`/recruiter/jobs/${id}`),
    serverGet<{ candidates: Candidate[] }>(`/recruiter/jobs/${id}/candidates`),
  ]);
  const job = jobRes && 'job' in jobRes ? jobRes.job : (jobRes as Job | null);
  const candidates = candidatesRes?.candidates ?? null;
  const win = candidates ? listWindow(candidates, limit, PAGE) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm">
        <a href="/recruiter/jobs" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />返回岗位列表</a>
      </p>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="size-6 text-primary" />{job?.title ?? '岗位候选人'}</h1>
          {job ? <InviteCandidateDialog jobId={id} /> : null}
        </div>
        <p className="mt-1 text-muted-foreground">投递/受邀该岗位的候选人及其面试评估状态。用同一引擎面试,数据严格隔离——你只见状态与评分,看不到面试内容。</p>
        {job?.competencies?.length ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.competencies.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">候选人{candidates ? `（${candidates.length}）` : ''}</CardTitle></CardHeader>
        <CardContent>
          {candidates === null ? (
            <p className="text-sm text-muted-foreground">无候选人或加载失败</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有候选人投递这个岗位。</p>
          ) : (
            <div className="table-wrap overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">候选人</th>
                    <th className="py-2 pr-4 font-medium">来源</th>
                    <th className="py-2 pr-4 font-medium">状态</th>
                    <th className="py-2 font-medium">评分</th>
                  </tr>
                </thead>
                <tbody>
                  {win!.shown.map((c) => {
                    const st = STATUS_LABEL[c.status] ?? { text: c.status, variant: 'outline' as const };
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono">{c.candidate_user_id.slice(0, 8)}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{c.source === 'invited' ? '招聘方邀请' : '主动投递'}</td>
                        <td className="py-3 pr-4"><Badge variant={st.variant}>{st.text}</Badge></td>
                        <td className="py-3">
                          {c.score === null ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Progress value={Math.max(0, Math.min(100, c.score))} className="h-1.5 w-24" />
                              <span className="text-xs font-semibold tabular-nums text-primary">{c.score}</span>
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
                    <Link href={withLimitHref(`/recruiter/jobs/${id}`, {}, win!.nextLimit)} scroll={false}>加载更多(还有 {win!.remaining} 人)</Link>
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
