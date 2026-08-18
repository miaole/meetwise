/**
 * 轮换残留校验原语（BAILIAN-03/07 fail-closed 的机械面）。
 *
 * 目的：轮换一个供应商 Key 之后，旧 Key 是否还挂在某个 secret store / 环境变量里，
 * 过去只能靠人工核对（fail-open）。这里给出三个**纯函数**原语，让启动断言可以在
 * 不打印、不落盘 Key 明文的前提下机械证明「正在使用的 Key 就是我刚下发的那把」，
 * 并且能显式拒绝已知被吊销的旧 Key。
 *
 * 指纹不是认证材料，也不是加密：SHA-256 前 16 个十六进制字符（64 bit）在「同值必同
 * 指纹、不同值几乎必不同指纹」的意义上够用作启动期一致性校验；碰撞只会在人工已经把
 * 指纹写错时被放大为一次失败启动，不会产生静默错发（安全上宁可多失败一次，不可错放行）。
 * 绝不能用指纹反推或鉴权 Key；真实鉴权仍只依赖 Bearer Key 本身。
 */
import { createHash } from 'node:crypto';

/** SHA-256 前 16 个十六进制字符（64 bit）。足够做启动期一致性/撤销清单匹配，无法反推明文。 */
export function keyFingerprint(secret: string): string {
  return createHash('sha256').update(secret, 'utf8').digest('hex').slice(0, 16);
}

/**
 * 解析「已吊销 Key 指纹」清单（逗号分隔）。大小写归一、去空、去重。空串/缺省 = 空集，
 * 表示未启用撤销清单——这不是弱化，而是「没有旧 Key 记录」与「没有旧 Key」是两回事：
 * 一旦轮换过，就必须把旧指纹填进来，否则旧 Key 残留不会被机械拦截（部署契约见 deploy-check）。
 */
export function parseRevokedFingerprints(value: string | undefined): Set<string> {
  if (!value || !value.trim()) return new Set();
  const parts = value.split(',').map((part) => part.trim().toLowerCase()).filter(Boolean);
  // L2 fix: 撤销清单项必须是 16 位十六进制指纹。过去 typo/贴错长度会静默 fail-open（例如把
  // `deadbeefdeadbeef` 贴成 8 位 `deadbeef`），旧 Key 残留因此不被机械拦截。这里非空即校验格式，
  // 畸形直接抛 revoked_fingerprint_malformed（fail-closed），宁可启动失败也不静默放行旧 Key。
  for (const part of parts) {
    if (!/^[0-9a-f]{16}$/.test(part)) throw new Error('revoked_fingerprint_malformed');
  }
  return new Set(parts);
}

export interface KeyFingerprintAssertion {
  /** 已挂载的 Key 明文（仅在本函数内参与哈希，绝不返回/打印/落盘）。 */
  key?: string;
  /** 期望指纹（可选）。填写即启用「挂载 Key 必须匹配该指纹」的启动校验。 */
  fingerprint?: string;
  /** 已吊销指纹集合（可选）。命中即拒绝启动，与 fingerprint 独立生效。 */
  revoked?: ReadonlySet<string>;
  /** 错误码前缀（例如 model_api_key / dashscope_asr_api_key），只进错误信息，不进日志值。 */
  name: string;
}

/**
 * 启动期断言：Key 存在时——
 *   1. 命中撤销清单 → 抛 `<name>_revoked`（旧 Key 残留，绝不静默复用）；
 *   2. 配置了期望指纹且不一致 → 抛 `<name>_fingerprint_mismatch`（挂错 Key / 换 Key 未换指纹）。
 * Key 不存在时直接返回（未配置由各调用方以 `*_not_configured` 语义处理，本函数不越权）。
 * 两个校验互相独立：撤销清单哪怕没配指纹也必须拦；指纹一致也不代表不在撤销清单里。
 */
export function assertKeyFingerprint({ key, fingerprint, revoked, name }: KeyFingerprintAssertion): void {
  if (!key) return;
  const actual = keyFingerprint(key);
  if (revoked?.has(actual)) throw new Error(`${name}_revoked`);
  const expected = fingerprint?.trim().toLowerCase();
  if (expected && actual !== expected) throw new Error(`${name}_fingerprint_mismatch`);
}
