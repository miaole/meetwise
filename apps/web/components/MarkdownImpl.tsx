'use client';
import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

/** 重型渲染实现:react-markdown + remark-gfm + rehype-highlight + highlight.js。
 *  这一整条依赖链(~115 kB gzip 前)被 `Markdown.tsx` 用 React.lazy 切成独立 async chunk,
 *  **不进任何路由的首屏 JS**——只有真正渲染 Markdown(进入面试/押题/诊断面板)时才按需拉取。
 *  性能保持原策略:① highlight.js 只在内容**真含代码围栏(```)** 时挂载;② 关 `detect`(语言穷举最慢),
 *  只高亮显式标了语言的围栏,未标语言代码块按普通等宽渲染,仍可读。*/
export default memo(function MarkdownImpl({ children }: { children: string }) {
  const hasCode = children.includes('```');
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={hasCode ? [[rehypeHighlight, { detect: false, ignoreMissing: true }]] : []}
    >
      {children}
    </ReactMarkdown>
  );
});
