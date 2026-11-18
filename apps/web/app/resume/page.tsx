import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getServerToken, serverGet } from '../../lib/api/server';
import { reparseResumeAction, grantConsentAction, withdrawInterviewPersonalizationAction } from './actions';
import { startDiagnosisAction } from '../diagnosis/actions';
import { ResumeUploadForms } from './ResumeUploadForms';
import { DeleteResumeButton } from './DeleteResumeButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { ResumeList, type ResumeRef as Resume } from '@meetwise/contracts';
import { resumeStatusKey } from '@/lib/resume/display';
import { isOcrPreviewEnabled } from '@/lib/ocr-preview';
import { resumeUploadCardDescription, type ResumeUploadCopyLabels } from '@/lib/resume/ocr-preview-ui';

export async function generateMetadata() {
  const t = await getTranslations('resumeMeta');
  return { title: t('title') };
}

/**
 * 简历页(Server Component):服务端取令牌→未登录跳 /login;服务端 GET /resume 渲染列表;
 * 上传/重新解析/删除走 Server Action。删除为 S1 软删受理（202+purgePending）:
 * 即时从列表与一切处理面消失;后台物理清除异步完成,文案如实披露,不宣称「彻底删除」。
 */
export default async function ResumePage() {
  if (!(await getServerToken())) redirect('/login');

  const [data, consent] = await Promise.all([
    serverGet<unknown>('/resume'),
    serverGet<{ consented: boolean }>('/privacy/consent'),
  ]);
  const interviewConsent = await serverGet<{ consented: boolean }>('/privacy/consent?purpose=interview_personalization');
  const parsedResumes = ResumeList.safeParse(data);
  const list: Resume[] | null = data === null ? null : parsedResumes.success ? parsedResumes.data.resumes : null;
  const consented = consent?.consented === true;   // null(取数失败)→ 当未同意,安全默认展示同意门
  const interviewPersonalized = interviewConsent?.consented === true;
  const ocrPreview = isOcrPreviewEnabled();
  const tResumeUpload = await getTranslations('resumeUpload');
  const tPage = await getTranslations('resumePage');
  const tStatus = await getTranslations('resumeStatus');
  const resumeUploadLabels: ResumeUploadCopyLabels = (key) => tResumeUpload(key);

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{tPage('title')}</h1>
        <p className="text-sm text-muted-foreground">{tPage('intro')}</p>
      </header>

      {!consented ? (
        // **PIPL 同意门**(修死胡同:此前无授予同意的 UI,用户永远传不了简历)。同意后即解锁上传。
        // G3(RESUME-GROUNDING rev3)最小用途选择:勾选项独立、默认不勾(同意必须 opt-in);
        // 文案按审计附录 C E 项原文明示「简历要点将发送给模型服务商用于出题」。
        <Card>
          <CardHeader>
            <CardTitle>{tPage('consentTitle')}</CardTitle>
            <CardDescription>{tPage('consentBody')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={grantConsentAction} className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" name="interview_personalization" className="mt-1" />
                <span>{tPage('personalization')}</span>
              </label>
              <SubmitButton pendingLabel={tPage('consentPending')}>{tPage('consentButton')}</SubmitButton>
            </form>
            <p className="text-xs text-muted-foreground">{tPage('consentHint')}<Link href="/privacy" className="underline underline-offset-4">{tPage('privacyLink')}</Link>{tPage('consentHintAfter')}</p>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>{tPage('uploadTitle')}</CardTitle>
          <CardDescription>{resumeUploadCardDescription(ocrPreview, resumeUploadLabels)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ResumeUploadForms ocrPreview={ocrPreview} />
          {/* G3/G4(RESUME-GROUNDING rev3)最小用途状态面:展示面试出题个性化同意态,可撤回(撤回=停止后续使用)。 */}
          <form action={withdrawInterviewPersonalizationAction} className="flex items-center justify-between gap-3 border-t pt-4">
            <span className="text-xs text-muted-foreground">
              {interviewPersonalized ? tPage('personalizationOn') : tPage('personalizationOff')}
            </span>
            {interviewPersonalized && <SubmitButton variant="outline" size="sm" pendingLabel={tPage('withdrawPending')}>{tPage('withdraw')}</SubmitButton>}
          </form>
        </CardContent>
      </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">{tPage('mine')}</h2>
        {list === null ? (
          <p className="text-sm text-destructive">{tPage('listUnavailable')}</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tPage('empty')}</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{r.display_name}</div>
                      <Badge variant="secondary" className="mt-1">{tStatus(resumeStatusKey(r.status))}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {/* 一键据这份简历做诊断(隐藏 resumeId → Server Action startDiagnosisAction)。 */}
                      <form action={startDiagnosisAction}>
                        <input type="hidden" name="resumeId" value={r.id} />
                        <SubmitButton variant="outline" size="sm" pendingLabel={tPage('diagnosePending')}>{tPage('diagnose')}</SubmitButton>
                      </form>
                      <form action={reparseResumeAction.bind(null, r.id)}>
                        <SubmitButton variant="outline" size="sm" pendingLabel={tPage('reparsePending')}>{tPage('reparse')}</SubmitButton>
                      </form>
                      <DeleteResumeButton resumeId={r.id} />
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">{tPage('backHome')}</Link>
      </p>
    </main>
  );
}
