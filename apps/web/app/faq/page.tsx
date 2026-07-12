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
    q: '我的简历安全吗?会被泄露吗?',
    a: '简历原文加密存储,绝不在日志或界面中保留明文 PII(身份证、手机号、邮箱)。我们也绝不帮助伪造或夸大经历——评估只基于你真实提供的信息。',
  },
  {
    q: '你们如何保护我的隐私?',
    a: '遵循《个人信息保护法》(PIPL):你可以随时导出自己的数据、申请删除账户与全部记录,或撤回已授予的处理同意。详见隐私政策。',
  },
  {
    q: '面试是怎么进行的?',
    a: '由自适应面试 agent 主导:它会根据你的简历与上一轮回答动态决定下一题,而非播放固定题库。你可以用文字作答,也可以用语音作答,两种模态等价处理。',
  },
  {
    q: '面试中断了会丢进度吗?',
    a: '不会。会话状态持久化保存,等待你输入时由持久状态表达而非内存连接,因此换设备、断网重连都能从原处继续。',
  },
  {
    q: '面试结束后我能得到什么?',
    a: '一份能力评估报告(分维度打分)、一份针对短板的学习计划,以及可选的职业路径建议。报告作为后台任务生成,即使生成失败也不会影响你的面试记录,并会明确提示而非一直转圈。',
  },
  {
    q: '额度怎么算?如何付费?',
    a: '通过购买面试包获得额度,进入共享额度池,按到期时间先到先扣。开始一次面试时占用额度;若因系统原因失败,会自动退回,绝不重复扣费。',
  },
];

export const metadata = {
  title: '常见问题 · 知面',
  description: '关于数据安全、隐私、面试流程与付费的常见疑问。',
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-1 py-10 sm:py-12">
      <Badge variant="secondary" className="mb-3">帮助中心</Badge>
      <h1 className="font-serif text-3xl font-bold tracking-tight">常见问题</h1>
      <p className="mt-2 text-muted-foreground">关于数据安全、隐私、面试流程与付费的常见疑问。</p>

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
