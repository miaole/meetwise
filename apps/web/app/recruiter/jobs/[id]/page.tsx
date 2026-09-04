import { redirect } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { InviteCandidateDialog } from '@/components/InviteCandidateDialog';
import { listWindow, withLimitHref } from '@/lib/paginate';
import { applicationStatusLabel, recruiterAssessmentLabel } from '@/lib/recruiter/surface';

const PAGE = 30;          // 单岗位候选人封顶首屏渲染,"加载更多"递增 ?limit

export const metadata: Metadata = { title: '岗位投递 · 内部预览 · 知面', description: '内部预览：查看该岗位投递的流程状态。不是招聘方产品。' };

interface Job { id: string; title: string; competencies: string[]; status: string }
interface Candidate { id: string; candidate_user_id: string; status: string; score: number | null; source?: string }

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
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />返回岗位列表</Link>
      </p>

      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Users className="size-6 text-primary" />{job?.title ?? '岗位候选人'}</h1>
          {job ? <InviteCandidateDialog jobId={id} /> : null}
        </div>
        <p className="mt-1 text-muted-foreground">内部预览：投递/受邀该岗位的最小流程状态。点「查看状态」只打开状态，不是面试官审卷。看不到面试内容，也不提供数值评分。</p>
        {job?.competencies?.length ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {job.competencies.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">候选人{job && candidates ? `（${candidates.length}）` : ''}</CardTitle></CardHeader>
        <CardContent>
          {jobRes === null ? (
            <p className="text-sm text-muted-foreground">岗位不存在、无权查看，或暂时读不到。不会把失败说成「还没有候选人」。</p>
          ) : candidatesRes === null || candidates === null ? (
            <p className="text-sm text-muted-foreground">候选人列表暂不可用，请稍后重试。失败不会改写申请状态。</p>
          ) : candidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有候选人投递这个岗位。</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4 font-medium">候选人</th>
                    <th className="py-2 pr-4 font-medium">来源</th>
                    <th className="py-2 pr-4 font-medium">状态</th>
                    <th className="py-2 font-medium">评估</th>
                    <th className="py-2 font-medium">详情</th>
                  </tr>
                </thead>
                <tbody>
                  {win!.shown.map((c) => {
                    const st = applicationStatusLabel(c.status);
                    return (
                      <tr key={c.id} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-mono">{c.candidate_user_id.slice(0, 8)}</td>
                        <td className="py-3 pr-4 text-xs text-muted-foreground">{c.source === 'invited' ? '招聘方邀请' : '主动投递'}</td>
                        <td className="py-3 pr-4"><Badge variant={st.variant}>{st.text}</Badge></td>
                        <td className="py-3 pr-4 text-muted-foreground">{recruiterAssessmentLabel(c.status, c.score)}</td>
                        <td className="py-3">
                          <Link href={`/recruiter/jobs/${id}/applications/${c.id}`} className="text-primary hover:underline">查看状态</Link>
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
