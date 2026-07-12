/** 站内通知页:App Router Server Component。数据服务端拉取并渲染,标记已读走 Server Actions。无死路(空/不可用/未读均有出口)。 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerToken, serverGet } from '../../lib/api/server';
import { markAllReadAction, markReadAction } from './actions';
import { Card, CardContent } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { listWindow, withLimitHref } from '@/lib/paginate';

const PAGE = 20;          // 通知可累积很多:封顶首屏渲染,"加载更多"递增 ?limit

export const metadata = { title: '通知 · 知面' };

type Notification = { id: string; kind: string; payload: Record<string, any>; read: boolean };

const KIND_LABELS: Record<string, string> = {
  report_ready: '面试报告已就绪',
  assessment_ready: '能力评估已就绪',
};
function labelOf(kind: string): string {
  return KIND_LABELS[kind] ?? kind;
}

export default async function NotificationsPage({ searchParams }: { searchParams: Promise<{ limit?: string }> }) {
  if (!(await getServerToken())) redirect('/login');
  const { limit } = await searchParams;

  const data = await serverGet<{ notifications: Notification[] }>('/notifications');
  const count = await serverGet<{ unread: number }>('/notifications/unread-count');

  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 text-xl font-semibold tracking-tight sm:text-2xl">站内通知</h1>
        <Card>
          <CardContent className="py-8 text-center text-destructive">通知暂不可用</CardContent>
        </Card>
      </div>
    );
  }

  const items = data.notifications ?? [];
  const unread = count?.unread ?? 0;
  const { shown, hasMore, remaining, nextLimit } = listWindow(items, limit, PAGE);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">站内通知</h1>
        <span className={cn('text-sm', unread > 0 ? 'font-medium text-primary' : 'text-muted-foreground')}>
          未读: {unread}
        </span>
      </div>

      <form action={markAllReadAction} className="mb-4">
        <SubmitButton variant="outline" size="sm" pendingLabel="处理中…">全部已读</SubmitButton>
      </form>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">暂无通知</CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {shown.map((n) => {
            const score = n.payload?.overallScore ?? n.payload?.score;
            const interviewId = n.payload?.interviewId;
            return (
              <li key={n.id}>
                <Card className={cn(!n.read && 'border-primary border-l-4 bg-primary/5')}>
                  <CardContent className="space-y-2 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className={cn('text-sm', n.read ? 'font-normal text-foreground' : 'font-bold text-foreground')}>
                        {labelOf(n.kind)}
                      </span>
                      <Badge variant={n.read ? 'outline' : 'default'}>{n.read ? '已读' : '未读'}</Badge>
                    </div>
                    {(score != null || (n.kind === 'report_ready' && interviewId)) && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        {score != null && <span>综合评分: {score}</span>}
                        {n.kind === 'report_ready' && interviewId && (
                          <Link href={`/report/${interviewId}`} className="font-medium text-primary hover:underline">
                            查看报告 →
                          </Link>
                        )}
                      </div>
                    )}
                    {!n.read && (
                      <form action={markReadAction.bind(null, n.id)}>
                        <SubmitButton variant="outline" size="sm" pendingLabel="处理中…">标已读</SubmitButton>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
          {hasMore && (
            <li className="text-center">
              <Button asChild variant="ghost" size="sm">
                <Link href={withLimitHref('/notifications', {}, nextLimit)} scroll={false}>加载更多(还有 {remaining} 条)</Link>
              </Button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
