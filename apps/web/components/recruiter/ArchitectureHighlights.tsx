import Link from 'next/link';
import { RECRUITER_ARCHITECTURE_HIGHLIGHTS } from '@/lib/recruiter/surface';
import { Card } from '@/components/ui/card';

/** 招聘方/面试官可读的承重说明。纯 RSC，无写、无分数。 */
export function ArchitectureHighlights({ compact = false }: { compact?: boolean }) {
  const cards = compact
    ? RECRUITER_ARCHITECTURE_HIGHLIGHTS.filter((card) => card.id === 'scoring')
    : RECRUITER_ARCHITECTURE_HIGHLIGHTS;
  return (
    <section className="space-y-3" aria-labelledby="recruiter-architecture">
      <div>
        <h2 id="recruiter-architecture" className="text-lg font-semibold">
          {compact ? '评分边界（摘要）' : '面试官能指望什么'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {compact
            ? '日常列表只提醒：证据不够就不给分。完整说明（进度、核对、分开记账，以及排队和检索还没交付的部分）在「怎么评估」。'
            : '用人话说明这场岗位面试怎么走、你能看见什么。不构成能力认证，也不提供自动筛选、排名、拒绝或录用决定。'}
        </p>
      </div>
      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {cards.map((card) => (
          <Card key={card.id} className="p-4">
            <h3 className="font-medium">{card.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{card.body}</p>
          </Card>
        ))}
      </div>
      {compact ? (
        <p className="text-sm">
          <Link href="/recruiter/how-it-works" className="text-primary hover:underline">看完整说明：进度、核对、分开记账，以及排队和检索还没交付的部分</Link>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          排队公平还没保证：当前仍按账号串行领取。本地核对通过不等于已经对外发布。
        </p>
      )}
    </section>
  );
}
