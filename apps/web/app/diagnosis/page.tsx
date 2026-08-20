import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { startDiagnosisAction } from './actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ResumeList, type ResumeRef as Resume } from '@meetwise/contracts';
import { resumeOptionLabel } from '@/lib/resume/display';

export const metadata = { title: '简历诊断 · 知面' };          // App Router Metadata API(SEO,服务端注入)

/** 简历诊断列表 + 开始诊断:服务端鉴权 + 服务端取数(GET /diagnosis、/resume),Server Action 启动诊断。镜像 quiz 页。 */
type Diagnosis = { id: string; status: string };

const STATUS_LABEL: Record<string, string> = {
  created: '待开始', generating: '诊断中', ready: '已完成', failed: '已失败',
};

function statusBadge(status: string) {
  const variant = status === 'failed' ? 'destructive' : status === 'ready' ? 'secondary' : 'default';
  return <Badge variant={variant}>{STATUS_LABEL[status] ?? status}</Badge>;
}

export default async function DiagnosisListPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!(await getServerToken())) redirect('/login');       // 服务端鉴权门
  const { error } = await searchParams;

  const data = await serverGet<{ diagnoses: Diagnosis[] } | Diagnosis[]>('/diagnosis');
  const resumesRaw = await serverGet<unknown>('/resume');

  const diagnoses: Diagnosis[] | null = data
    ? (Array.isArray(data) ? data : data.diagnoses ?? [])
    : null;
  const parsedResumes = ResumeList.safeParse(resumesRaw);
  const resumes: Resume[] = parsedResumes.success ? parsedResumes.data.resumes : [];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6">
      <header className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">简历诊断 · 知面</h1>
        <p className="text-sm text-muted-foreground">据你的简历给出结构、亮点、风险与岗位匹配度诊断,并提供可改写建议——只优化表达,绝不为你编造经历。</p>
      </header>

      {error === 'create_failed' && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">创建诊断失败,请稍后重试;若反复出现请确认额度与网络。</p>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">开始诊断</CardTitle>
          <CardDescription>选择一份简历(可选填目标岗位,用于评估匹配度),AI 据真实经历逐维度诊断并给出接地改写建议。</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              还没有简历。
              <Link href="/resume" className="font-medium text-foreground underline-offset-4 hover:underline">先去上传简历 →</Link>
            </p>
          ) : (
            <form action={startDiagnosisAction} className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm text-muted-foreground sm:w-20" htmlFor="resumeId">选择简历</label>
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
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <label className="text-sm text-muted-foreground sm:w-20" htmlFor="targetRole">目标岗位</label>
                <Input id="targetRole" name="targetRole" placeholder="可选,如:后端工程师(用于评估岗位匹配度)" className="sm:flex-1" maxLength={100} />
              </div>
              <div className="flex justify-end"><SubmitButton pendingLabel="启动中…">开始诊断</SubmitButton></div>
            </form>
          )}
        </CardContent>
      </Card>

      <section>
        {diagnoses === null ? (
          <p className="text-sm text-destructive">诊断列表暂不可用,请确认 API 已启动。</p>
        ) : diagnoses.length === 0 ? (
          <p className="text-sm text-muted-foreground">还没有诊断,上方开始一次。</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-lg border bg-card">
            {diagnoses.map((it) => (
              <li key={it.id} className="flex flex-wrap items-center gap-3 p-3">
                <code className="flex-1 truncate text-sm">{it.id.slice(0, 12)}…</code>
                {statusBadge(it.status)}
                <Button asChild variant="outline" size="sm">
                  <Link href={`/diagnosis/${it.id}`}>查看 →</Link>
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
