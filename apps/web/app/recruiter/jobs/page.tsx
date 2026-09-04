import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Building2, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { JobCreateForm } from './JobCreateForm';
import { ArchitectureHighlights } from '@/components/recruiter/ArchitectureHighlights';

export const metadata: Metadata = { title: '招聘方 · 岗位 · 知面', description: '招聘方发布岗位并按目标能力组织面试。' };

interface Job { id: string; title: string; description: string; competencies: string[]; status: string; created_at: string }

/** B 端(招聘方)岗位页。多租户:RLS 只见自己的岗位。RSC + Server Action 发岗位。 */
export default async function RecruiterJobsPage() {
  if (!(await getServerToken())) redirect('/login');
  const data = await serverGet<{ jobs: Job[] }>('/recruiter/jobs');
  const jobs = data?.jobs ?? [];
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><Building2 className="size-6 text-primary" />招聘方 · 岗位</h1>
        <p className="mt-1 text-muted-foreground">发布岗位、定义目标能力。候选人面试顺着回答往下问；你只能看到自己的岗位，看不到练习原文。</p>
      </div>

      <ArchitectureHighlights compact />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">发布新岗位</CardTitle>
          <CardDescription>填岗位名 + 目标能力(逗号分隔)。</CardDescription>
        </CardHeader>
        <CardContent>
          <JobCreateForm />
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">我的岗位({jobs.length})</h2>
        {data === null ? (
          <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">岗位列表暂不可用,请稍后重试。</CardContent></Card>
        ) : jobs.length === 0 ? (
          <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">还没有岗位,用上方表单发布第一个。</CardContent></Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {jobs.map((jb) => (
              <Link key={jb.id} href={`/recruiter/jobs/${jb.id}`} className="group block">
                <Card className="h-full transition-colors hover:border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium group-hover:text-primary">{jb.title}</span>
                      <Badge variant={jb.status === 'open' ? 'success' : 'outline'}>{jb.status === 'open' ? '招聘中' : '已关闭'}</Badge>
                    </div>
                    {jb.competencies?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">{jb.competencies.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                    )}
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">查看候选人 <ArrowRight className="size-3" /></span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <p className="text-sm">
        <Link href="/recruiter/how-it-works" className="text-muted-foreground hover:text-foreground">怎么评估</Link>
        {' · '}
        <Link href="/recruiter/talent" className="text-muted-foreground hover:text-foreground">人才库</Link>
      </p>
    </div>
  );
}
