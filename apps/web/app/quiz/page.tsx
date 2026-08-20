import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { startQuizAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { ResumeList, type ResumeRef as Resume } from '@meetwise/contracts';
import { resumeOptionLabel } from '@/lib/resume/display';

export const metadata = { title: '押题 · 知面' };          // App Router Metadata API(SEO,服务端注入)

/** 押题列表 + 开始押题:服务端鉴权 + 服务端取数(GET /quiz、/resume),Server Action 启动押题。镜像 interviews 页。 */
type Quiz = { id: string; status: string };

const STATUS_LABEL: Record<string, string> = {
  created: '待开始', generating: '生成中', ready: '已完成', failed: '已失败',
};

function statusBadge(status: string) {
  const variant = status === 'failed' ? 'destructive' : status === 'ready' ? 'secondary' : 'default';
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? status}</Badge>;
}

export default async function QuizListPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await getServerToken())) redirect('/login');       // 服务端鉴权门
  const { error } = await searchParams;

  const data = await serverGet<{ quizzes: Quiz[] } | Quiz[]>('/quiz');
  const resumesRaw = await serverGet<unknown>('/resume');

  const quizzes: Quiz[] | null = data
    ? (Array.isArray(data) ? data : data.quizzes ?? [])
    : null;
  const parsedResumes = ResumeList.safeParse(resumesRaw);
  const resumes: Resume[] = parsedResumes.success ? parsedResumes.data.resumes : [];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">押题 · 知面</h1>
        <p className="text-sm text-muted-foreground">据你的简历预测高频训练问题,每题标注考察点与可能的追问——面前先练，面时不慌。</p>
      </header>

      {error === 'create_failed' && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">创建押题失败,请稍后重试;若反复出现请确认额度与网络。</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">开始押题</CardTitle>
          <CardDescription>选择一份简历,AI 据真实经历预测训练问题(接地校验,绝不编造你没写过的经历)。</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有简历。
              <Link href="/resume" className="font-medium text-foreground underline-offset-4 hover:underline">先去上传简历 →</Link>
            </p>
          ) : (
            <form action={startQuizAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="text-sm text-muted-foreground" htmlFor="resumeId">选择简历</label>
              <select
                id="resumeId"
                name="resumeId"
                defaultValue={resumes[0]?.id}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm sm:flex-1"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{resumeOptionLabel(r)}</option>
                ))}
              </select>
              <SubmitButton pendingLabel="启动中…">开始押题</SubmitButton>
            </form>
          )}
        </CardContent>
      </Card>

      <section>
        {quizzes === null ? (
          <p className="text-sm text-destructive">押题列表暂不可用,请确认 API 已启动。</p>
        ) : quizzes.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有押题,上方开始一次。</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
            {quizzes.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center gap-3 p-3">
                <code className="flex-1 truncate text-sm">{it.id.slice(0, 12)}…</code>
                {statusBadge(it.status)}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/quiz/${it.id}`}>查看 →</Link>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-sm">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">← 返回主页</Link>
      </p>
    </main>
  );
}
