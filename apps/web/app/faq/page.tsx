/** 常见问题(FAQ):静态服务端组件,纯展示,无业务状态,可被搜索引擎收录。Accordion 折叠交互。 */
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type QA = { q: string; a: string };

const FAQS: QA[] = [
  {
    q: '我的简历会如何被使用?',
    a: '上传前会要求你确认处理同意。当前代码对已覆盖的存储和展示路径实施输入、访问和脱敏约束；完整日志、缓存、备份与外部处理方的全链治理仍未完成，不能把本预览视为隐私服务承诺。',
  },
  {
    q: '我可以删除或撤回处理同意吗?',
    a: '完整的删除、撤回与跨存储回执流程尚未开放。登录后可申请预览版删除回执（盘点已知 sink，固定未完成）；这不是生产删除完成。在跨存储回执通过完整验证前，请勿将其用于需要删除保证的数据。',
  },
  {
    q: '面试是怎么进行的?',
    a: '当前主路径是文字练习。系统会基于本轮练习提供下一题和反馈。预览版语音可在面试页使用；失败时请改用文字作答。长时会话、岗位路由和检索能力以页面实际入口为准。',
  },
  {
    q: '面试中断了会丢进度吗?',
    a: '当前实现具备持久化与恢复基础，但跨设备恢复、双标签提交、故障接管和完整答题记录仍在专项验证中；请以页面实时状态为准。',
  },
  {
    q: '面试结束后我能得到什么?',
    a: '你可能看到逐题反馈和后续练习建议。它们由模型生成，只用于个人复盘，不代表经校准的能力评定，也不能用于筛选、排名、拒绝、录用或资格判断。',
  },
  {
    q: '可以购买或付费吗?',
    a: '当前为预览环境，不对外提供支付、购买或退款服务。页面中的额度信息仅用于展示，不构成销售要约。',
  },
];

export const metadata = {
  title: '常见问题 · 知面',
  description: '关于项目预览、数据边界、练习流程与当前开放范围的常见问题。',
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-1 py-10 sm:py-12">
      <Badge variant="secondary" className="mb-3">帮助中心</Badge>
      <h1 className="font-serif text-3xl font-bold tracking-tight">常见问题</h1>
      <p className="mt-2 text-muted-foreground">关于项目预览、数据边界、练习流程与当前开放范围的常见问题。</p>

      <Card className="mt-8">
        <CardContent className="px-6 py-1">
          <Accordion type="single" collapsible className="w-full">
            {FAQS.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`} className="last:border-b-0">
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Separator className="mt-9" />
      <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link href="/" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="size-3.5" />返回首页
        </Link>
        <Link href="/features" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
          查看功能介绍<ArrowRight className="size-3.5" />
        </Link>
      </nav>
    </main>
  );
}
