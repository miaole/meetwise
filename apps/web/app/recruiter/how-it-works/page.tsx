import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Compass, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken } from '@/lib/api/server';
import { ArchitectureHighlights } from '@/components/recruiter/ArchitectureHighlights';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '怎么评估 · 招聘方 · 知面',
  description: '招聘方/面试官视角：岗位面试怎么走、为什么现在没有数字分、你能看见什么。',
};

/** B 端架构说明页。只读 RSC，不取申请数据，避免把说明页变成数据面。 */
export default async function RecruiterHowItWorksPage() {
  if (!(await getServerToken())) redirect('/login');
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm">
        <Link href="/recruiter/jobs" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" />返回岗位列表
        </Link>
      </p>
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Compass className="size-6 text-primary" />怎么评估
        </h1>
        <p className="mt-1 text-muted-foreground">
          写给面试官和招聘方。先看清边界，再看岗位和投递。
        </p>
      </div>
      <ArchitectureHighlights />
      <Card>
        <CardContent className="space-y-2 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>本页是产品内说明，不是已经部署的企业招聘系统，也不构成能力认证。</p>
          <p>校准和人工复核工单还没开放。申请状态页只显示必要流程，看不到面试内容。</p>
          <p>
            去<Link href="/recruiter/jobs" className="text-primary hover:underline">岗位</Link>
            或<Link href="/recruiter/talent" className="text-primary hover:underline">人才库</Link>
            查看投递；点「查看状态」只打开最小流程状态，不会出现数值排名，也不是人工审核后台。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
