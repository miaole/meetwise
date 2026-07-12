/** 产品功能:静态服务端组件,纯展示,无业务状态,可被搜索引擎收录。 */
import Link from 'next/link';
import {
  FileText,
  Target,
  Brain,
  Mic,
  LineChart,
  ShieldCheck,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const metadata = {
  title: '产品功能 · 知面 Meetwise',
  description:
    'AI 驱动的面试准备平台:简历分析、真题接地押题、自适应模拟面试、文字/语音面试,以及评估、计划、路径与成长报告闭环。',
};

type Feature = { title: string; desc: string; icon: LucideIcon; tag?: { label: string; tip: string } };

const features: Feature[] = [
  {
    title: '简历分析与优化',
    desc: '上传即加密存储,结构化提取教育 / 项目 / 技能等字段;只做润色与查漏补缺,绝不为你伪造经历或编造证书。',
    icon: FileText,
  },
  {
    title: '真题接地押题',
    desc: '面向本地共享题库检索,自纠不足时自主探索补充;每道题都标注来源、按你的岗位改写,不照搬原题。',
    icon: Target,
    tag: { label: 'CRAG', tip: 'Corrective RAG · 自纠式检索增强:检索质量不足时自动触发再检索 / 自主探索,避免「想当然」答案。' },
  },
  {
    title: '自适应模拟面试',
    desc: '先规划目标考察能力,再据简历个性化出题;答得弱则追问深挖、答得强则换题提难,全程动态调难度并反思自检。',
    icon: Brain,
  },
  {
    title: '文字 / 语音面试',
    desc: '支持纯文字与实时语音两种模式,流式 ASR / TTS 低延迟交互,可随时打断(barge-in),贴近真实面试节奏。',
    icon: Mic,
  },
  {
    title: '评估 · 计划 · 路径 · 报告',
    desc: '面试后输出能力评估、针对性学习计划与职业路径建议,并汇总为可追溯的成长报告,持续看见进步。',
    icon: LineChart,
  },
  {
    title: '生产级可靠',
    desc: '依赖故障时优雅降级而非空转,全链路持久化不丢数据;隐私合规遵循 PIPL,敏感信息不外泄、不滥用。',
    icon: ShieldCheck,
  },
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-4xl px-1 py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <Badge variant="secondary" className="mb-3">产品功能</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">从简历到 offer,一套引擎陪你走完全程</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          AI 驱动的面试准备平台:简历诊断、真题接地押题、自适应模拟面试,再到能复盘的成长报告闭环。
        </p>
      </header>

      <TooltipProvider delayDuration={150}>
        <section className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
                    {f.title}
                    {f.tag && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="cursor-help border-dashed font-mono text-[10px]">{f.tag.label}</Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">{f.tag.tip}</TooltipContent>
                      </Tooltip>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>
      </TooltipProvider>

      <Separator className="mt-12" />
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/login">登录开始<ArrowRight /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">查看定价</Link>
        </Button>
      </div>
    </main>
  );
}
