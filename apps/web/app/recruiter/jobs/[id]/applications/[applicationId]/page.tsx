import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ClipboardCheck, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  applicationStatusLabel,
  findOwnedApplication,
  isRecruiterApplicationId,
  recruiterAssessmentLabel,
} from '@/lib/recruiter/surface';

export const metadata: Metadata = {
  title: '申请状态 · 招聘方 · 知面',
  description: '查看岗位申请的必要流程状态。不提供数值评分，也看不到面试内容。',
};

interface Job { id: string; title: string; competencies: string[]; status: string }
interface Candidate { id: string; candidate_user_id: string; status: string; score: number | null; source?: string }

/**
 * B 端申请状态：只消费本岗位候选人列表里的最小投影。
 * 列表 API 已在查询边界把 score 置空；本页不把 score 传入评估文案，避免历史字段回流。
 */
export default async function RecruiterApplicationStatusPage({
  params,
}: {
  params: Promise<{ id: string; applicationId: string }>;
}) {
  if (!(await getServerToken())) redirect('/login');
  const { id, applicationId } = await params;
  if (!isRecruiterApplicationId(applicationId)) notFound();

  const [jobRes, candidatesRes] = await Promise.all([
    serverGet<{ job?: Job } | Job>(`/recruiter/jobs/${id}`),
    serverGet<{ candidates: Candidate[] }>(`/recruiter/jobs/${id}/candidates`),
  ]);
  const job = jobRes && 'job' in jobRes ? jobRes.job : (jobRes as Job | null);
  // 两边都失败：分不清 404 和宕机，不能猜成「没有申请」。
  if (jobRes === null && candidatesRes === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm">
          <Link href={`/recruiter/jobs/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />返回岗位候选人
          </Link>
        </p>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            申请状态暂不可用，请稍后重试。失败不会改写申请状态，也不会补一个分数。
          </CardContent>
        </Card>
      </div>
    );
  }
  // 岗位读失败但列表有响应：按越权/不存在收口，不回 200 装成暂不可用。
  if (jobRes === null || !job) notFound();
  if (candidatesRes === null) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="text-sm">
          <Link href={`/recruiter/jobs/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />返回岗位候选人
          </Link>
        </p>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            申请状态暂不可用，请稍后重试。失败不会改写申请状态，也不会补一个分数。
          </CardContent>
        </Card>
      </div>
    );
  }
  const application = findOwnedApplication(candidatesRes.candidates ?? [], applicationId);
  if (!application) notFound();

  const st = applicationStatusLabel(application.status);
  const assessment = recruiterAssessmentLabel(application.status);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <p className="text-sm">
        <Link href={`/recruiter/jobs/${id}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />返回岗位候选人
        </Link>
      </p>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardCheck className="size-6 text-primary" />申请状态
        </h1>
        <p className="mt-1 text-muted-foreground">
          只显示必要流程状态。看不到面试内容，不提供数值评分，也没有人工审核工单，不能自动拒绝或录用。
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">候选人</dt>
              <dd className="mt-1 font-mono">{application.candidate_user_id.slice(0, 8)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">来源</dt>
              <dd className="mt-1">{application.source === 'invited' ? '招聘方邀请' : '主动投递'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">状态</dt>
              <dd className="mt-1"><Badge variant={st.variant}>{st.text}</Badge></dd>
            </div>
            <div>
              <dt className="text-muted-foreground">评估</dt>
              <dd className="mt-1 text-muted-foreground">{assessment}</dd>
            </div>
          </dl>
          {job.competencies?.length ? (
            <div>
              <div className="text-muted-foreground">岗位目标能力</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {job.competencies.map((skill) => <Badge key={skill} variant="outline">{skill}</Badge>)}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>校准完成前，申请分数不会出现在这里。证据不够就不给分，也不会用 0 分凑数。</p>
          <p>「评分暂不可用」表示没有可比较的校准分，不是已经有人在审、也不是 0 分。</p>
          <p>
            <Link href="/recruiter/how-it-works" className="text-primary hover:underline">怎么评估 · 完整说明</Link>
            {' · '}
            <Link href="/recruiter/talent" className="text-primary hover:underline">返回人才库</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
