/**
 * GODFN-1d · AppError 统一错误分类面（设计 godfn-decompose.md §2.4 · REQUEST rev2 @86627721 唯一蓝本）。
 *
 * 形态：`AppError extends Error { code }` —— 现行 `Object.assign(new Error(msg), { code })`
 * producer 惯例的类型化收口。语义零变纪律：
 *  - `message` 默认取 code 串本体（message 轨既有判定对 AppError 恒同结果——错误码字符串本体零变·只换判定通道）；
 *  - `errCode(e)` ≡ 现行 `e?.code ===` 字面判定（任意输入逐点等价：无 code / 非 string code / 原始值 → undefined，
 *    与 `any` 可选链在 `===`/`!==` 判定下不可区分）；
 *  - `asErr(e)` ≡ `any` 值的属性读取视图（非对象 → undefined，与 `e?.prop` 同效）——收据
 *    ai-docs/delivery/receipts/godfn-decompose/1d-consumers.md §1/§5 逐位点对账。
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
