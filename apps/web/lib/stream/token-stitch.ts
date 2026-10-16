/**
 * TOKSTREAM S4b/R6 · 拼接一致性 web 半（§E-⑦「终态到达时归一化全等对照」的对照器本体）。
 * 归一化定义与 ai-runtime `gradeStitchIdentity` T0（model-client.ts `normalizeForStitchCompare`）
 * 逐字同源："normalized equality (trim + whitespace collapse)"——web 零 @meetwise/ai-runtime 依赖
 * （服务端包禁入前端 bundle），故本地镜像 T0 面；T1 锚/T2 长度带与 T3 定性器（裸前缀重叠启发式·Ban
 * 入运行时）不在 web 半（T3 禁令 §E-⑦ 原文承接）。
 * 语义铁律：对照**绝不改写任何一侧文本**——不匹配=telemetry（InterviewView.tokenStitch 承载）+
 * 仍用终态权威（缓冲即弃）。
 */

/** T0 归一化（grading.T0.definition 逐字："normalized equality (trim + whitespace collapse)"）。 */
export function normalizeForStitchCompareWeb(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export interface TokenStitchVerdict {
  /** 归一化全等判定（T0）。 */
  pass: boolean;
  /** |lenA-lenB|/max(lenA,lenB)（与 gradeStitchIdentity normalized.lengthRatio 同式·0 长安全）。 */
  lengthRatio: number;
}

/** Σdelta 缓冲（stitched）vs 终态权威全文（authoritative）T0 对照。纯函数·三态由调用面区分：
 *  全等（pass=true）/失配（pass=false·telemetry 不阻断）/缓冲空跳过（调用面 buffer 空则不调本器）。 */
export function gradeTokenStitchIdentityWeb(stitched: string, authoritative: string): TokenStitchVerdict {
  const lenA = stitched.length;
  const lenB = authoritative.length;
  const longest = Math.max(lenA, lenB);
  const lengthRatio = longest === 0 ? 0 : Math.abs(lenA - lenB) / longest;
  return {
    pass: normalizeForStitchCompareWeb(stitched) === normalizeForStitchCompareWeb(authoritative),
    lengthRatio,
  };
}
