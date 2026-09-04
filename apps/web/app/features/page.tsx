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

export const metadata = {
  title: '产品功能 · 知面 Meetwise',
  description:
    '知面 Meetwise 的公开预览：围绕真实经历的简历练习、模拟面试与个人复盘；实际开放能力以页面提示为准。',
};

type Feature = { title: string; desc: string; icon: LucideIcon };

const features: Feature[] = [
  {
    title: '简历分析与优化',
    desc: '面向真实经历的简历练习工作流仍在收口数据删除与授权边界，当前不作为公开试用能力提供。',
    icon: FileText,
  },
  {
    title: '训练问题建议',
    desc: '受控题库、岗位路由和检索范围仍在建设。它们完成元数据、隔离和可撤回验证前，不会以公开可用能力展示。',
    icon: Target,
  },
  {
    title: '模拟面试练习',
    desc: '在文字界面中完成分轮练习与反馈。它用于梳理表达，不替代真实面试，也不产生招聘判断。',
    icon: Brain,
  },
  {
    title: '文字练习与预览版语音',
    desc: '文字练习是主路径。预览版语音可在面试页朗读题目并用本机麦克风作答；超时或转写失败会回到文字，不会编造内容。',
    icon: Mic,
  },
  {
    title: '练习反馈与建议',
    desc: '输出逐题反馈和后续练习建议。模型生成内容仅供个人复盘，不是能力认证、排名或录用建议。',
    icon: LineChart,
  },
  {
    title: '明确的能力边界',
    desc: '项目保留输入校验、访问隔离与故障降级等代码基础；云端执行、完整删除、统一模型治理和发布验收仍在进行中。',
    icon: ShieldCheck,
  },
];

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-4xl px-1 py-12 sm:py-16">
      <header className="mb-10 max-w-2xl">
        <Badge variant="secondary" className="mb-3">产品功能</Badge>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">围绕真实经历，完成一次次练习与复盘</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          这是项目预览，不提供录用承诺、支付服务或自动招聘决定。未开放能力不会以已可用的方式展示。
        </p>
      </header>

      <section className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
      </section>

      <Separator className="mt-12" />
      <div className="mt-8 flex flex-wrap gap-4">
        <Button asChild size="lg">
          <Link href="/login">登录开始<ArrowRight /></Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/pricing">查看额度说明</Link>
        </Button>
      </div>
    </main>
  );
}
