'use client';
import { Component, lazy, memo, Suspense, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Markdown 渲染入口(GFM 表格/列表 + 代码块 highlight.js)。技术面试题/答/点评含代码块,必须真渲染。
 *
 *  **极端场景:首屏 bundle**。react-markdown + remark-gfm + rehype-highlight + highlight.js 是最重的客户端依赖
 *  (实测使 /interview /quiz /diagnosis 三条路由首屏 JS 从 ~118 kB 涨到 ~233 kB)。这里用 `React.lazy` 把重型实现
 *  (`MarkdownImpl`)切成**独立 async chunk**,移出首屏路由 JS——进入面板、首次真渲染 Markdown 时才拉取。
 *
 *  **降级链(无死胡同)**:加载期 `Suspense` 先以纯文本(whitespace-pre-wrap)渲染同一份 `children`,内容立即可读、
 *  宽度一致,重型链就绪后原地升级为富文本。**chunk 加载失败**(部署后旧 hash chunk 被清理 / 弱网 / CDN 抖动)会在渲染期
 *  throw,而 `Suspense` 只接管 pending、不接管 rejected;故再包一层 `ErrorBoundary`,失败时**继续显示同一份纯文本**——
 *  绝不让一次瞬时网络抖动把整个面试/押题/诊断面板掀进路由错误页。
 *
 *  **CLS**:首个触发 import 的实例会有一次"源文本→富文本"回流;`lazy()` 缓存已解析模块,故本会话后续实例直接渲染富文本、
 *  无再次抖动。注意:这三个消费方的 Markdown 内容来自 SSE(仅客户端),SSR 首帧并无 Markdown 节点,故与 SEO/爬虫无关,
 *  也不存在 hydration mismatch(全是 hydration 之后的客户端首次挂载,而非对 server HTML 的 hydrate)。
 *
 *  **memo by children**:历史轮次内容不变 → 不重渲染、不重新触发 lazy 边界。*/
export const Markdown = memo(function Markdown({ children, className }: { children: string; className?: string }) {
  const plain = <div className="whitespace-pre-wrap break-words">{children}</div>;
  return (
    <div className={cn('prose-mw', className)}>
      <MarkdownBoundary fallback={plain}>
        <Suspense fallback={plain}>
          <MarkdownImpl>{children}</MarkdownImpl>
        </Suspense>
      </MarkdownBoundary>
    </div>
  );
});

const MarkdownImpl = lazy(() => import('./MarkdownImpl'));

/** 兜底重型 Markdown chunk 的**加载失败**:渲染期 throw → 显示纯文本回退(降级而非崩溃)。key 不绑 children,
 *  失败态对后续不同内容仍生效——本会话 chunk 不可用时所有 Markdown 一律走纯文本,避免反复 throw 抖动。 */
class MarkdownBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }
  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
