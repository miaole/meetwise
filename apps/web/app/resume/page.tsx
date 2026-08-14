import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerToken, serverGet } from '../../lib/api/server';
import { reparseResumeAction, grantConsentAction } from './actions';
import { startDiagnosisAction } from '../diagnosis/actions';
import { ResumeUploadForms } from './ResumeUploadForms';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: '简历 · 知面' };

type Resume = { id: string; status?: string };

/**
 * 简历页(Server Component):服务端取令牌→未登录跳 /login;服务端 GET /resume 渲染列表;
 * 上传与重新解析走 Server Action。完整删除仍未闭环，因此页面不提供会误导用户的删除操作。
 */
export default async function ResumePage() {
  if (!(await getServerToken())) redirect('/login');

  const [data, consent] = await Promise.all([
    serverGet<{ resumes: Resume[] } | Resume[]>('/resume'),
    serverGet<{ consented: boolean }>('/privacy/consent'),
  ]);
  const list: Resume[] | null = data === null
    ? null
    : Array.isArray(data) ? data : (data.resumes ?? []);
  const consented = consent?.consented === true;   // null(取数失败)→ 当未同意,安全默认展示同意门

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">简历 · 知面</h1>
        <p className="text-sm text-muted-foreground">
          用于练习的简历内容会经过当前已覆盖的存储与访问约束；只提取必要结构化事实，不编造经历。完整删除与撤回流程尚未开放。
        </p>
      </header>

      {!consented ? (
        // **PIPL 同意门**(修死胡同:此前无授予同意的 UI,用户永远传不了简历)。同意后即解锁上传。
        <Card>
          <CardHeader>
            <CardTitle>先同意隐私政策(PIPL)</CardTitle>
            <CardDescription>上传简历会处理个人信息。请阅读并同意后再上传——系统只用于练习所需的结构化提取，不编造经历。完整删除、撤回与跨存储回执流程尚未开放。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={grantConsentAction}>
              <SubmitButton pendingLabel="记录中…">我已阅读并同意隐私政策(PIPL)</SubmitButton>
            </form>
            <p className="text-xs text-muted-foreground">同意后可启用简历上传；<Link href="/privacy" className="underline underline-offset-4">数据边界说明</Link>会标明当前可用范围与未开放流程。</p>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>上传简历</CardTitle>
          <CardDescription>上传 PDF / Word / 图片文件,或直接粘贴文本——服务端自动提取并清洗。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <ResumeUploadForms />
        </CardContent>
      </Card>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">我的简历</h2>
        {list === null ? (
          <p className="text-sm text-destructive">简历列表暂不可用。</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有简历,粘贴上传。</p>
        ) : (
          <ul className="space-y-3">
            {list.map((r) => (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <code title={r.id} className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {String(r.id).slice(0, 8)}
                      </code>
                      <Badge variant="secondary">状态:{r.status ?? '未知'}</Badge>
                    </div>
                    <div className="flex gap-2">
                      {/* 一键据这份简历做诊断(隐藏 resumeId → Server Action startDiagnosisAction)。 */}
                      <form action={startDiagnosisAction}>
                        <input type="hidden" name="resumeId" value={r.id} />
                        <SubmitButton variant="outline" size="sm" pendingLabel="启动中…">诊断</SubmitButton>
                      </form>
                      <form action={reparseResumeAction.bind(null, r.id)}>
                        <SubmitButton variant="outline" size="sm" pendingLabel="解析中…">重新解析</SubmitButton>
                      </form>
                      <button type="button" disabled title="完整删除与跨存储回执流程尚未开放" className="rounded-md border border-destructive/30 px-3 py-1.5 text-sm text-destructive/60 disabled:cursor-not-allowed">
                        删除功能暂未开放
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">← 返回首页</Link>
      </p>
    </main>
  );
}
