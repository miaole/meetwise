/** B 端预览诚实条。不是招聘工作流徽章。 */
export function RecruiterPreviewNote({ className = '' }: { className?: string }) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`.trim()}>
      <span className="mr-1.5 inline-block rounded border px-1.5 py-0.5 text-xs leading-none">预览版</span>
      不是已上线的招聘或面试官工作流，不能用来筛人、排名或决定录用。
    </p>
  );
}
