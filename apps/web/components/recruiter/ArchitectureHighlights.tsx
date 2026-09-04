import Link from 'next/link';
import { RECRUITER_ARCHITECTURE_HIGHLIGHTS } from '@/lib/recruiter/surface';
import { Card } from '@/components/ui/card';
import { RecruiterPreviewNote } from '@/components/recruiter/PreviewNote';

/** 内部架构笔记。纯 RSC，无写、无分数。不是招聘方产品，也不是面试官工作流。 */
export function ArchitectureHighlights({ compact = false }: { compact?: boolean }) {
  const cards = compact
    ? RECRUITER_ARCHITECTURE_HIGHLIGHTS.filter((card) => card.id === 'scoring')
    : RECRUITER_ARCHITECTURE_HIGHLIGHTS;
  return (
    <section className="space-y-3" aria-labelledby="recruiter-architecture">
      <div>
        <h2 id="recruiter-architecture" className="text-lg font-semibold">
          {compact ? '内部笔记：评分边界' : '内部架构笔记'}
        </h2>
        <RecruiterPreviewNote className="mt-1" />
        <p className="mt-1 text-sm text-muted-foreground">
          {compact
            ? '列表只提醒：证据不够就不给分。完整笔记（进度、核对、分开记账，以及排队边界和检索还没交付的部分）在架构说明页。'
            : '用人话记下这场岗位练习怎么走、骨架上能看见什么。不构成能力认证，也不提供自动筛选、排名、拒绝或录用决定。'}
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
          <Link href="/recruiter/how-it-works" className="text-primary hover:underline">看内部架构笔记：进度、核对、分开记账，以及排队边界和检索还没交付的部分</Link>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          面试排队会轮着领，但押题、诊断、报告仍按账号抽干。不是高峰容量保证。本地核对通过不等于已经对外发布。
        </p>
      )}
    </section>
  );
}
