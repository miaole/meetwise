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
import { RecruiterPreviewNote } from '@/components/recruiter/PreviewNote';
import { BQualitativeProjection } from '@meetwise/contracts';

export const metadata: Metadata = {
  title: '申请状态 · 内部预览 · 知面',
  description: '内部预览：查看岗位申请的必要流程状态。不是招聘方产品，不提供数值评分，也看不到面试内容。',
};

interface Job { id: string; title: string; competencies: string[]; status: string }
interface Candidate { id: string; candidate_user_id: string; status: string; score: number | null; terminalKind?: 'held' | 'failed' | null; source?: string }

/** I2 W2 档位徽（rubric disposition 三值映射 Ban 自造档位·不出数字）：强/中/弱/证据不足。 */
const TIER_BADGE: Record<string, { text: string; variant: 'success' | 'outline' | 'secondary' | 'destructive' }> = {
  strong: { text: '强', variant: 'success' },
  mid: { text: '中', variant: 'secondary' },
  weak: { text: '弱', variant: 'outline' },
  insufficient: { text: '证据不足', variant: 'outline' },
};

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

  // I2 W2（裁定③落点 A）：定性投影——仅 assessment_unavailable 终态申请读取（held/failed 两源）。
  // 契约 zod 校验（BQualitativeProjection）；读取失败/形状不符 → 中性「暂不可用」，Ban 假定性输出。
  const isAssessmentUnavailable = application.status === 'assessment_unavailable';
  const qualRes = isAssessmentUnavailable
    ? await serverGet<unknown>(`/recruiter/jobs/${id}/applications/${applicationId}/qualitative`)
    : null;
  const qualParsed = qualRes !== null ? BQualitativeProjection.safeParse(qualRes) : null;
  const qual = qualParsed?.success ? qualParsed.data : null;

  // I2 W1（裁定⑤）：状态徽/评估行按 terminalKind 两态分流。候选列表不携带两态信号
  // （interview 为候选人私有·RLS 隔离墙 by-design）→ 信号经 0160 受控函数承接；
  // 无信号（非终态/读取失败）保持原样 fail-closed，不臆测终态。
  const terminalKind = application.terminalKind ?? qual?.terminalKind ?? null;
  const st = applicationStatusLabel(application.status, terminalKind);
  const assessment = recruiterAssessmentLabel(application.status, undefined, terminalKind);

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
        <RecruiterPreviewNote className="mt-1" />
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
          {/* I2 W2（裁定③落点 A）：最小定性反馈区——能力维度 + 强/中/弱/证据不足档位（不出数字）。
              三态如实：未同意（E6 门·函数内 fail-closed）/暂无可复核的评估记录/档位徽；
              Ban 假定性输出·Ban 排序比较（fix-roadmap:117 承接注记）。证据摘录面默认不出（W3 门后预留）。 */}
          {isAssessmentUnavailable && (
            <div>
              <div className="text-muted-foreground">能力概要（定性 · 不含数字评分）</div>
              {qual === null ? (
                <p className="mt-2 text-muted-foreground">能力概要暂不可用，请稍后重试。失败不会改写申请状态，也不会补一个分数。</p>
              ) : !qual.disclosed ? (
                <p className="mt-2 text-muted-foreground">候选人未同意披露能力概要。候选人同意后，这里显示能力维度与强/中/弱/证据不足档位。</p>
              ) : qual.dimensions.length === 0 ? (
                <p className="mt-2 text-muted-foreground">暂无可复核的评估记录。</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {qual.dimensions.map((d) => (
                    <div key={d.competency} className="flex flex-wrap items-center gap-1">
                      <span>{d.competency}</span>
                      {d.tiers.map((t) => {
                        const badge = TIER_BADGE[t] ?? { text: t, variant: 'outline' as const };
                        return <Badge key={t} variant={badge.variant}>{badge.text}</Badge>;
                      })}
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">单申请人评估事实投影：不可用于候选人之间排序比较，不含数字评分、答题内容与证据摘录原文。</p>
                </div>
              )}
            </div>
          )}
          {/* B271 片3 P1-b（裁定⑤语义批·文案与 RX-1 断言逐字绑定）：企业支付静态知情行+充值指引——
              非状态位·零查询（失败 start 事务整体回滚无持久信号，卡片不假装知道实时余额）。
              既有 dl 四行（候选人/来源/状态/评估）零字节锚。 */}
          <p className="text-muted-foreground">
            候选人开始本场面试由贵司企业额度支付；额度不足时候选人将无法开始。
            <Link href="/recruiter/billing" className="ml-1 text-primary hover:underline">企业额度不足，请充值</Link>
          </p>
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
          {/* W3④（免责卡分流·主句零改）：第二行按两态分流——held=待校准语义 / failed=失败语义；
              无派生信号保持原句。B271 片3 既有主句「证据不够就不给分」零字节。 */}
          <p>校准完成前，申请分数不会出现在这里。证据不够就不给分，也不会用 0 分凑数。</p>
          <p>
            {terminalKind === 'held'
              ? '「已面完 · 待校准」表示这场面试已完成、还没有可比较的校准分，不是已经有人在审、也不是 0 分；校准完成后与结果一起提供。'
              : terminalKind === 'failed'
                ? '「面试失败」表示这场面试因系统原因未完成评估；候选人可重试，已预留的额度已释放。'
                : '「评分暂不可用」表示没有可比较的校准分，不是已经有人在审、也不是 0 分。'}
          </p>
          <p>
            <Link href="/recruiter/how-it-works" className="text-primary hover:underline">怎么评估 · 完整说明</Link>
            {' · '}
            <Link href="/recruiter/talent" className="text-primary hover:underline">返回投递列表</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
