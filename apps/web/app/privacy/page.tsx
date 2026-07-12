import { redirect } from 'next/navigation';
import { Download, ShieldCheck, Trash2 } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerToken } from '@/lib/api/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { deleteResumeDataAction } from './actions';

export const metadata: Metadata = { title: '隐私与数据 · 知面', description: 'PIPL 数据权利:导出与删除你的数据。' };

/** 隐私/数据页(PIPL 用户权利):数据可携(导出)+ 删除权(删简历 PII)。RSC + Server Action + 同源导出路由。 */
export default async function PrivacyPage() {
  if (!(await getServerToken())) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><ShieldCheck className="size-6 text-primary" />隐私与数据</h1>
        <p className="mt-1 text-muted-foreground">依据 PIPL,你对自己的数据拥有完整权利。简历原文加密存储,结构化档案永不含明文 PII。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据可携(导出)</CardTitle>
          <CardDescription>导出你的结构化数据(简历状态、面试、评估、同意记录),不含加密原文与明文 PII。</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 导出走同源路由:服务端读 cookie 加 Bearer → 以附件返回 JSON */}
          <Button asChild variant="outline"><a href="/api/privacy/export"><Download className="size-4" />导出我的数据(JSON)</a></Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">删除权(危险操作)</CardTitle>
          <CardDescription>删除你的全部简历数据:加密原文 + 结构化档案 + 简历记录。此操作不可撤销。</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={deleteResumeDataAction}>
            <SubmitButton variant="destructive" pendingLabel="删除中…"><Trash2 className="size-4" />删除我的简历数据</SubmitButton>
          </form>
        </CardContent>
      </Card>

      <p className="text-sm"><a href="/settings" className="text-muted-foreground hover:text-foreground">← 返回设置</a></p>
    </div>
  );
}
