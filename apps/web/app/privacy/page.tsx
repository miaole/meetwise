import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { PrivacyPreviewList, PrivacyPreviewReceipt } from '@meetwise/contracts';
import { getServerToken, serverGet } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PreviewErasureForm } from './PreviewErasureForm';

export const metadata: Metadata = {
  title: '隐私与数据边界 · 知面',
  description: '知面预览版删除回执：请求、sink 盘点与诚实未完成态，不替代生产删除 SLO。',
};

export default async function PrivacyPage() {
  if (!(await getServerToken())) redirect('/login');
  const listed = PrivacyPreviewList.safeParse(await serverGet('/privacy/erasure-preview'));
  const items = listed.success && listed.data.productionSloClaimed === false ? listed.data.items : [];
  const latestId = items[0]?.requestId;
  const latestRaw = latestId
    ? PrivacyPreviewReceipt.safeParse(await serverGet(`/privacy/erasure-preview/${latestId}`))
    : null;
  const latest = latestRaw?.success && latestRaw.data.productionSloClaimed === false
    && latestRaw.data.completeness === 'preview_incomplete'
    ? latestRaw.data
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6 sm:px-6">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <ShieldCheck className="size-6 text-primary" />
          隐私与数据边界
        </h1>
        <p className="mt-1 text-muted-foreground">预览环境当前可导出结构化记录，并受理预览版删除回执。这不替代完整数据权利或跨存储生产删除。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">当前可用的数据导出</CardTitle>
          <CardDescription>可尝试导出当前接口提供的结构化记录。该导出不代表完整数据副本，也不证明所有存储位置均已覆盖。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline"><a href="/api/privacy/export"><Download className="size-4" />导出我的数据(JSON)</a></Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2 text-lg text-destructive">
            删除预览回执
            <Badge variant="outline">预览版</Badge>
          </CardTitle>
          <CardDescription>
            请求会盘点已知 sink。面试范围会启动 0096 投影围栏（不含队列载荷 redact）；账户范围会启动 0125 向量块 sweep。回执固定为未完成，不宣称 OSS、Redis、Langfuse 或备份已删除。生产 `DELETE /privacy/*` 仍关闭。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PreviewErasureForm initialReceipt={latest} />
          {items.length > 1 ? (
            <p className="text-xs text-muted-foreground">
              另有 {items.length - 1} 份历史预览回执。它们同样不是生产完成态。
            </p>
          ) : null}
        </CardContent>
      </Card>

      <p className="text-sm">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">← 返回设置</Link>
      </p>
    </div>
  );
}
