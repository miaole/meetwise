/**
 * 流式安全 Markdown:渲染**未完成**的 Markdown(打字/token 流中途)时,补全未闭合结构,
 * 否则未闭合的 ``` 会把后面整段吞成代码块、未闭合行内 `code` 也会乱。渲染用,不改原文。
 */
export function streamSafeMarkdown(text: string): string {
  let t = text ?? '';
  // 1) 未闭合代码围栏(奇数个 ```)→ 临时补闭合
  const fences = (t.match(/```/g) || []).length;
  if (fences % 2 === 1) t = t + '\n```';
  // 2) 未闭合行内 code(剥掉已配对围栏后,奇数个单反引号)→ 补
  const stripped = t.replace(/```[\s\S]*?```/g, '');
  const inline = (stripped.match(/`/g) || []).length;
  if (inline % 2 === 1) t = t + '`';
  return t;
}
