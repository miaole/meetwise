/** B 端内部笔记条。不是招聘方产品徽章。 */
export function RecruiterPreviewNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`.trim()}>
      <span className="mr-1.5 inline-block rounded border px-1.5 py-0.5 text-xs leading-none">内部笔记</span>
      知面不是「求职者 / 面试官」两套对等产品。这里只是骨架上的架构说明，招聘方产品没有上线，不能用来筛人、排名或决定录用。
    </p>
  );
}
