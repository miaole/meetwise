/** 隐私政策(Server Component / 只读):服务端拉取并渲染策略。取数失败显式降级,不留死路。公开页。 */
import Link from 'next/link';
import { serverGet } from '../../lib/api/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Policy = {
  version: string;
  title: string;
  purposes: Array<{ id: string; desc: string }>;
  dataRights: string[];
  retentionDays: number;
  pii: string;
};

export const metadata = {
  title: '隐私政策 · 知面',
  description: '知面 Meetwise 隐私政策:采集目的、你的数据权利、数据留存期限与个人信息(PII)声明。',
};

export default async function LegalPage() {
  const policy = await serverGet<Policy>('/legal/policy');

  if (!policy) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
        <Card>
          <CardContent className="space-y-4 py-8 text-center">
            <p className="text-destructive">加载隐私政策失败,请稍后重试</p>
            <Button asChild variant="outline">
              <Link href="/">← 返回首页</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{policy.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">版本 {policy.version}</p>
      </header>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">采集目的</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {policy.purposes.map((p) => (
                <li key={p.id}>{p.desc}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">你的数据权利</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {policy.dataRights.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">数据留存</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              我们最长保留你的相关数据 {policy.retentionDays} 天,到期或经你申请后删除。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">个人信息(PII)声明</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{policy.pii}</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
