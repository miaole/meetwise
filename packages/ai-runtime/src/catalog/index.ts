/**
 * 模型/提示词目录：把"用哪个模型、哪版提示词、区域/成本约束"集中成可版本化的注册表，
 * 业务侧只引服务 key，不散落模型名/温度/版本（易失技术藏在 seam 后，10 年可替换）。
 * 关口内部件：禁外部深链 import。
 *
 * 骨架：当前登记 demo 用的逻辑服务 key；接真模型只在此处加 adapter，不改业务与图。
 */
export interface ModelBinding {
  /** 逻辑服务 key（业务侧只认它，如 'resume-quiz.generate'） */
  service: string;
  /** 物理模型标识（接真模型时替换；境内合规模型在此切换） */
  model: string;
  /** 提示词版本（落 ai_prompt_versions，可回放/可审计） */
  promptVersion: string;
  /** 单次调用 token 预算上限（成本封顶 + 退避） */
  maxOutputTokens: number;
}

const REGISTRY: Record<string, ModelBinding> = {
  'resume-quiz.generate': { service: 'resume-quiz.generate', model: 'stub:deterministic', promptVersion: 'v0', maxOutputTokens: 1024 },
  'mock-interview.evaluate': { service: 'mock-interview.evaluate', model: 'stub:deterministic', promptVersion: 'v0', maxOutputTokens: 1024 },
};

export function resolveBinding(service: string): ModelBinding {
  const b = REGISTRY[service];
  if (!b) throw new Error(`unknown_model_service:${service}`);
  return b;
}
