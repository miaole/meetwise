import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerToken } from '../../../lib/api/server';
import { QuizPanel } from '../../../components/QuizPanel';

export const metadata = { title: '押题 · 知面' };

/** 押题页(RSC 外壳):服务端鉴权门 → 渲染客户端 QuizPanel(SSE 消费业务事件,边到边渲染预测题)。 */
export default async function QuizDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { id } = await params;
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <QuizPanel quizId={id} />
      <p className="mt-8 text-sm">
        <Link href="/quiz" className="text-muted-foreground hover:text-foreground">← 返回押题</Link>
      </p>
    </main>
  );
}
