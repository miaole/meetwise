import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerToken, serverGet } from '../../lib/api/server';
import { uploadResumeAction, uploadResumeFileAction, deleteResumeAction, reparseResumeAction, grantConsentAction } from './actions';
import { startDiagnosisAction } from '../diagnosis/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: '简历 · 知面' };

type Resume = { id: string; status?: string };

/**
 * 简历页(Server Component):服务端取令牌→未登录跳 /login;服务端 GET /resume 渲染列表;
 * 上传/删除/重新解析全部走 Server Action(无客户端 JS)。原文加密存储、只提结构化事实、不伪造经历。
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
          简历原文加密存储,仅提取结构化事实,绝不伪造经历。上传前需先同意隐私政策(PIPL)。
        </p>
      </header>

      {!consented ? (
        // **PIPL 同意门**(修死胡同:此前无授予同意的 UI,用户永远传不了简历)。同意后即解锁上传。
        <Card>
          <CardHeader>
            <CardTitle>先同意隐私政策(PIPL)</CardTitle>
            <CardDescription>上传简历会处理个人信息。请阅读并同意后再上传——原文加密存储、只提结构化事实、绝不伪造经历,你可随时导出或删除。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form action={grantConsentAction}>
              <SubmitButton pendingLabel="记录中…">我已阅读并同意隐私政策(PIPL)</SubmitButton>
            </form>
            <p className="text-xs text-muted-foreground">同意即启用简历上传;可在<Link href="/privacy" className="underline underline-offset-4">隐私中心</Link>导出或删除你的数据。</p>
          </CardContent>
        </Card>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>上传简历</CardTitle>
          <CardDescription>上传 PDF / Word / 图片文件,或直接粘贴文本——服务端自动提取并清洗。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 文件上传(PDF/Word/图片):Server Action 直收 File → 服务端提取+清洗 */}
          <form action={uploadResumeFileAction} className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed bg-secondary/40 p-4">
            <input
              type="file" name="file" accept=".pdf,.doc,.docx,image/*" required
              className="text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium" />
            <SubmitButton variant="outline" size="sm" pendingLabel="上传中…">提取并上传</SubmitButton>
            <span className="w-full text-xs text-muted-foreground sm:w-auto">支持 PDF / Word(.docx)/ 图片(OCR 接线中,先用 PDF/Word)· ≤ 8MB</span>
          </form>

          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />或粘贴文本<span className="h-px flex-1 bg-border" /></div>

          <form action={uploadResumeAction} className="space-y-4">
            <Textarea
              name="text"
              required
              minLength={20}
              placeholder="在此粘贴简历原文(至少 20 字)…"
              className="min-h-36"
            />
            <SubmitButton pendingLabel="上传中…">上传简历</SubmitButton>
          </form>
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
                      <form action={deleteResumeAction.bind(null, r.id)}>
                        <SubmitButton variant="outline" size="sm" className="text-destructive hover:text-destructive" pendingLabel="删除中…">删除</SubmitButton>
                      </form>
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
