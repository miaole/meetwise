/**
 * TOKSTREAM 阶段1 · 生成进度视图（前端共享归约面 · EXEC @REQUEST a31a7bbe）。
 * 裁定语义：断线重放 = **幂等覆盖写**（同 attemptKey 数值字段取 max——旧帧重复到达不回退计数）+ **业务事件清除**
 * （任何非 generation_* 事件到达即清进度态，防止重放历史进度把已完成题重新显示"生成中"）。
 * 红线：进度帧**不改 phase / 不触发 reconnecting/degraded**（进度不是健康信号）；缺帧/乱序/重复 = 回段级兜底，不死等。
 * R-B 思考隐私缺省：只显示段名/计数/时长文案，**不传输、不渲染思考原文**。
 */

/** 进度态视图（interview/quiz 两视图共用形状）。 */
export interface GenerationProgressView {
  attemptKey: string;
  stage?: string;
  segments?: string[];
  tokensSoFar?: number;
  elapsedMs?: number;
  firstTokenMs?: number;
}

/** 段名 → 用户可见标签（未知段名回退原文,绝不因未知段名丢进度）。 */
export const GENERATION_STAGE_LABELS: Record<string, string> = {
  retrieve: '检索素材',
  generate: '模型生成',
  validate: '接地校验',
};

/** 进度 → 一行用户可见文案（R-B：无思考原文、无生成内容；只有段名/时长/token 计数）。 */
export function generationProgressLabel(p: GenerationProgressView | undefined): string {
  if (!p) return '';
  const parts: string[] = ['AI 生成中'];
  const stageLabel = GENERATION_STAGE_LABELS[p.stage ?? ''];
  if (stageLabel) parts.push(stageLabel);
  else if (p.stage) parts.push(p.stage);
  if (typeof p.elapsedMs === 'number' && Number.isFinite(p.elapsedMs)) {
    parts.push(`已 ${Math.max(0, Math.round(p.elapsedMs / 1000))} 秒`);
  }
  if (typeof p.tokensSoFar === 'number' && Number.isFinite(p.tokensSoFar)) {
    parts.push(`${p.tokensSoFar} tokens`);
  }
  return parts.join(' · ');
}

/** 数值字段取 max（幂等覆盖写：旧帧重复到达不回退计数）。 */
function maxDefined(a: number | undefined, b: number | undefined): number | undefined {
  if (a === undefined) return b;
  if (b === undefined) return a;
  return Math.max(a, b);
}

export type GenerationProgressEvent =
  | { event: 'generation_started'; data: { attemptKey: string; segments?: string[] } }
  | { event: 'model_first_token'; data: { attemptKey: string; firstTokenMs?: number; tokensSoFar?: number } }
  | { event: 'generation_progress'; data: { attemptKey: string; stage?: string; tokensSoFar?: number; elapsedMs?: number } };

/** 三类进度事件 → 进度态（幂等覆盖写核心）。 */
export function applyGenerationProgress(
  current: GenerationProgressView | undefined, e: GenerationProgressEvent,
): GenerationProgressView {
  switch (e.event) {
  case 'generation_started':
    // 新生成段开始：直接替换（不同 attemptKey = 新一轮生成）。
    return { attemptKey: e.data.attemptKey, segments: e.data.segments, stage: e.data.segments?.[0] };
  case 'model_first_token':
    return {
      ...(current && current.attemptKey === e.data.attemptKey ? current : { attemptKey: e.data.attemptKey }),
      attemptKey: e.data.attemptKey,
      firstTokenMs: e.data.firstTokenMs,
      tokensSoFar: maxDefined(current?.tokensSoFar, e.data.tokensSoFar),
    };
  case 'generation_progress': {
    const same = current !== undefined && current.attemptKey === e.data.attemptKey;
    return {
      attemptKey: e.data.attemptKey,
      stage: e.data.stage ?? (same ? current!.stage : undefined),
      segments: same ? current!.segments : undefined,
      tokensSoFar: maxDefined(same ? current!.tokensSoFar : undefined, e.data.tokensSoFar),
      elapsedMs: maxDefined(same ? current!.elapsedMs : undefined, e.data.elapsedMs),
      firstTokenMs: same ? current!.firstTokenMs : undefined,
    };
  }
  }
}
