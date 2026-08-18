import { redirect } from 'next/navigation';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: '隐私与数据边界 · 知面', description: '知面预览环境中的当前数据处理范围与未开放权利流程。' };

/** 隐私/数据页(PIPL 用户权利):数据可携(导出)+ 删除权(删简历 PII)。RSC + Server Action + 同源导出路由。 */
export default async function PrivacyPage() {
  if (!(await getServerToken())) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="size-6 text-primary" />隐私与数据边界</h1>
        <p className="mt-1 text-muted-foreground">这里说明预览环境当前可用范围，不替代隐私服务承诺或完整数据权利流程。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">当前可用的数据导出</CardTitle>
          <CardDescription>可尝试导出当前接口提供的结构化记录。该导出不代表完整数据副本，也不证明所有存储位置均已覆盖。</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 导出走同源路由:服务端读 cookie 加 Bearer → 以附件返回 JSON */}
          <Button asChild variant="outline"><a href="/api/privacy/export"><Download className="size-4" />导出我的数据(JSON)</a></Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">删除与撤回流程暂未开放</CardTitle>
          <CardDescription>完整删除、撤回同意、外部处理方回执和跨存储验证尚未完成。当前不会受理或伪装完成删除请求。</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" disabled><Trash2 className="size-4" />删除功能暂未开放</Button>
        </CardContent>
      </Card>

      <p className="text-sm"><a href="/settings" className="text-muted-foreground hover:text-foreground">← 返回设置</a></p>
    </div>
  );
}
