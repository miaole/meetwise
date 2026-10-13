/**
 * @meetwise/errors · 通用错误分类面叶子包（#174 下沉·5E 批量清理刀 2026-10-12）。
 *
 * 实现体自 @meetwise/db（packages/db/src/errors.ts）**逐字节搬迁**（GODFN-1d 原文零改）——
 * 搬迁动机=blueprint :419 修法列：通用错误类原置 @meetwise/db，ai-runtime 多处（circuit-breaker/
 * invoke/native-response-guard/tools/voice）因此新增对 db 的耦合；本叶子包（零依赖）解出该耦合面。
 * 兼容铁律：@meetwise/db 主入口**继续原样再导出**四符号（db/src/errors.ts=再导出 shim），
 * 既有 29 处消费点（apps/api/apps/worker/packages/db 内部相对引用）零迁移零行为变更。
 */

/** 携带稳定分类码的错误。code 即分类面；message 默认与 code 同串（零变兼容 message 轨读者）。 */
export class AppError extends Error {
  readonly code: string;
  constructor(code: string, message: string = code) {
    super(message);
    this.name = 'AppError';
    this.code = code;
  }
}

/** `any` 收窄后的结构读取视图（只读属性访问面 · 禁作 rethrow 载体——rethrow 必须用原 catch 值保错误身份）。 */
export type ErrLike = { code?: unknown; message?: unknown; reason?: unknown; status?: unknown } & Record<string, unknown>;

/** `e?.prop` 可选链的对象视图：非对象（含 null/原始值）→ undefined，对象 → 同一引用的只读视图。 */
export function asErr(e: unknown): ErrLike | undefined {
  return typeof e === 'object' && e !== null ? (e as ErrLike) : undefined;
}

/** 单一错误分类码探测：AppError.code（instanceof 轨）∪ 结构 .code（PG 23505 / Object.assign 惯例 · string 才取）。 */
export function errCode(e: unknown): string | undefined {
  const v = asErr(e)?.code;
  return typeof v === 'string' ? v : undefined;
}
