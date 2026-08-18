import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: '数据处理边界 · 知面',
  description: '知面 Meetwise 预览环境的公开数据处理边界与未开放能力说明。',
};

/**
 * A static boundary page is intentional. It must not render a historical
 * policy payload that promises deletion or retention behaviour the runtime
 * cannot yet fulfill.
 */
export default function LegalPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">预览环境的数据处理边界</h1>
        <p className="mt-1 text-sm text-muted-foreground">公开页面说明 · 非正式服务条款或隐私权利受理入口</p>
      </header>

      <Card className="mb-6 border-brand-em/40 bg-accent/50">
        <CardContent className="py-4 text-sm leading-relaxed text-muted-foreground">
          本预览不面向公众接收真实简历、身份信息、面试回答、录音或访问密钥。请勿提交任何个人或机密内容。
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">当前边界</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>公开预览只用于了解项目界面、能力边界和正在建设的治理机制。</li>
              <li>任何需要处理真实个人数据、模型输出或跨存储数据的流程均不作为公开预览能力提供。</li>
              <li>页面中的练习反馈是界面示例，不是能力认证、招聘排名或录用依据。</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">未开放的事项</CardTitle></CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>完整删除、撤回同意、跨存储删除回执、外部处理方回执和留存周期承诺尚未开放。</li>
              <li>支付、购买、退款、自动扣费和自动招聘决定尚未开放。</li>
              <li>在这些能力完成独立验证前，本站不会受理或伪装完成相关请求。</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">获取最新边界</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              已实现能力、未闭合风险和后续工作包以仓库中的运行时事实文档与公开变更说明为准；本页不替代将来正式上线前所需的条款、授权和验证。
            </p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-sm"><Link href="/" className="text-muted-foreground hover:text-foreground">← 返回首页</Link></p>
    </main>
  );
}
