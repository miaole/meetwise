import { redirect } from 'next/navigation';
import { Target, Briefcase } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet, serverFetch } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: '岗位匹配 · 知面', description: '据你的简历匹配适合的岗位方向。' };

interface Role { id: string; title: string; skills: string[] }
interface Match { id: string; title: string; score: number }
interface ResumeRef { id: string; status: string }

/** 岗位匹配页(C 端:据简历推荐岗位方向)。RSC + searchParam:选简历(GET 表单)→ 服务端 POST /roles/match → 渲染结果。无 client。 */
export default async function RolesPage({ searchParams }: { searchParams: Promise<{ resumeId?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { resumeId } = await searchParams;

  const [rolesRes, resumesRes] = await Promise.all([
    serverGet<{ roles: Role[] }>('/roles'),
    serverGet<{ resumes: ResumeRef[] } | ResumeRef[]>('/resume'),
  ]);
  const roles = rolesRes?.roles ?? [];
  const resumes = Array.isArray(resumesRes) ? resumesRes : (resumesRes?.resumes ?? []);

  // 选了简历 → 服务端匹配
  let matches: Match[] | null = null;
  let matchError = '';
  if (resumeId) {
    const r = await serverFetch('/roles/match', { method: 'POST', body: JSON.stringify({ resumeId }) });
    if (r.ok) matches = ((await r.json().catch(() => ({}))) as { matches?: Match[] }).matches ?? [];
    else matchError = r.status === 404 ? '该简历不存在或无权限' : '匹配失败,请重试';
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Target className="size-6 text-primary" />岗位匹配</h1>
        <p className="mt-1 text-muted-foreground">据你简历的结构化技能,匹配适合的岗位方向(技能词重叠打分)。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">选择简历</CardTitle>
          <CardDescription>挑一份已上传的简历来匹配岗位。</CardDescription>
        </CardHeader>
        <CardContent>
          {resumes.length === 0 ? (
            <p className="text-sm text-muted-foreground">还没有简历。<a href="/resume" className="text-primary hover:underline">先去上传 →</a></p>
          ) : (
            <form method="get" className="flex flex-wrap items-center gap-2">
              <select name="resumeId" defaultValue={resumeId ?? ''} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option value="" disabled>选择简历…</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.id.slice(0, 8)}（{r.status}）</option>)}
              </select>
              <Button type="submit">匹配岗位</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {matchError && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{matchError}</p>}

      {matches && (
        <Card>
          <CardHeader><CardTitle className="text-lg">匹配结果</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {matches.length === 0 ? (
              <p className="text-sm text-muted-foreground">未匹配到明显岗位——简历技能信息可能偏少,试试补充经历再匹配。</p>
            ) : matches.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
                <span className="flex items-center gap-2 font-medium"><Briefcase className="size-4 text-muted-foreground" />{m.title}</span>
                <Badge variant="success">匹配度 {m.score}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg">岗位库</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="rounded-lg border p-3">
              <div className="font-medium">{role.title}</div>
              <div className="mt-1 flex flex-wrap gap-1">{role.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="text-sm"><a href="/dashboard" className="text-muted-foreground hover:text-foreground">← 返回总览</a></p>
    </div>
  );
}
