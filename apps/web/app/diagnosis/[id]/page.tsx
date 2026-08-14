import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerToken } from '../../../lib/api/server';
import { DiagnosisPanel } from '../../../components/DiagnosisPanel';

export const metadata = { title: '简历诊断 · 知面' };

/** 简历诊断页(RSC 外壳):服务端鉴权门 → 渲染客户端 DiagnosisPanel(SSE 消费业务事件,边到边渲染诊断维度)。 */
export default async function DiagnosisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { id } = await params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DiagnosisPanel diagnosisId={id} />
      <p className="mt-8 text-sm">
        <Link href="/diagnosis" className="text-muted-foreground hover:text-foreground">← 返回诊断</Link>
      </p>
    </main>
  );
}
