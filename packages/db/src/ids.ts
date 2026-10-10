/**
 * @meetwise/db · 实体 ID 工厂（DBID-1 · B 级统一）。
 *
 * 规范（ai-docs/architecture/backend/id-convention.md · C 级冻结）：
 *   - 业务可读键（text 主键）：`<prefix>_<32hex>`——尾巴为 UUIDv7（RFC 9562）去连字符，
 *     时间有序（同 ms 进程内计数器单调 → 字典序 = 生成序）。
 *   - uuid 代理键列的显式 id：newUuidV7()（连字符形态，与现行格式完全一致）。
 *   - 前缀注册表制（fail-closed）：未登记前缀 throw；新前缀须先登记（域前缀注册表）。
 *
 * 排除面（登记于 harness §3.4，本工厂不接管）：qgen-/rgen-/rrun-/qrecipe-/rrecipe- 等
 * 已被 SQL CHECK + domain 正则冻结的连字符 36 形态；裸 uuid→text 存量 6 点（C 级裁决）；
 * 一次性 token/请求关联 randomUUID()（非持久实体主键）。
 *
 * 存量行为：本工厂只影响**新生成**的 id；存量 `prefix_v4` 行与 v4 行 append-only 原样保留。
 */
import { randomBytes } from 'node:crypto';

/**
 * 域前缀注册表（SSOT = ai-docs/architecture/backend/id-convention.md）。
 * key = 域语义名（调用方使用）；value = 落库前缀字面量（分隔符沿用各表现行形态：
 * 多数 `_`，qbank 负结果/溯源为 `-`）。**新前缀须先在此登记 + 文档登记**，未登记即 throw。
 */
export const ENTITY_PREFIXES = {
  job: 'job_',    // job_posting（recruiter.ts）
  app: 'app_',    // job_application（recruiter.ts）
  iv: 'iv_',      // interview（recruiter.ts / interview.service.ts）
  rd: 'rd_',      // job_route_decision（job-route-decision.ts）
  cprd: 'cprd_',  // candidate_profile_route_decision（candidate-route.ts）
  nr: 'nr-',      // qbank_route_scope_negative_result（qbank-route-scope-cache.ts）
  qip: 'qip-',    // question_issue_provenance（qbank-miss.ts）
  ftd: 'ftd_',    // free_text_route_decision（free-text-route-decision.ts）
  ord: 'ord_',    // payment_order（commerce.service.ts）
  qz: 'qz_',      // resume_quiz（quiz.service.ts）
  dg: 'dg_',      // resume_diagnosis（diagnosis.service.ts）
} as const;

export type EntityPrefix = keyof typeof ENTITY_PREFIXES;

/** 单调状态：同 ms 内 rand_a 作 12bit 计数器（随机种子起步）；时钟回拨钳制到 lastMs。 */
let lastMs = 0;
let lastRandA = 0;

/** UUIDv7 去连字符 32hex（unix_ms(48)|7|rand_a(12)|var10|rand_b(62)）。字典序 = 生成序。 */
function uuidV7Hex(): string {
  let ms = Date.now();
  if (ms < lastMs) ms = lastMs; // 回拨钳制：单调优先于绝对准确（漂移以 ms 计，可忽略）
  if (ms === lastMs) {
    lastRandA = (lastRandA + 1) & 0xfff;
    if (lastRandA === 0) {
      // 计数器回绕（同 ms 第 4097 次）：自旋到下一毫秒，保严格单调。
      while ((ms = Date.now()) <= lastMs) { /* spin */ }
      lastRandA = randomBytes(2).readUInt16BE(0) & 0xfff;
    }
  } else {
    lastRandA = randomBytes(2).readUInt16BE(0) & 0xfff;
  }
  lastMs = ms;
  const randB = randomBytes(8).readBigUInt64BE() & 0x3f_ff_ff_ff_ff_ff_ff_ffn; // 62bit
  const hi = (BigInt(ms) << 16n) | 0x7000n | BigInt(lastRandA);                // ts|ver|rand_a
  const lo = 0x80_00_00_00_00_00_00_00n | randB;                               // var=10|rand_b
  return hi.toString(16).padStart(16, '0') + lo.toString(16).padStart(16, '0');
}

/**
 * 生成业务可读实体 id：`<prefix>_<32hex>`（prefix 为注册表字面量）。
 * fail-closed：未登记前缀 throw `entity_prefix_not_registered`。
 */
export function newEntityId(prefix: string): string {
  const lit = (ENTITY_PREFIXES as Record<string, string>)[prefix];
  if (lit === undefined) {
    throw Object.assign(new Error(`entity_prefix_not_registered:${prefix}`), { code: 'entity_prefix_not_registered' });
  }
  return `${lit}${uuidV7Hex()}`;
}

/** 生成连字符形态 UUIDv7（uuid 代理键列的显式 id 用；格式与现行 v4 完全同形）。 */
export function newUuidV7(): string {
  const h = uuidV7Hex();
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/**
 * 时间戳解码 helper（D6）：接受 `<prefix>_<32hex>` / `<prefix>-<32hex>` / 裸（去连字符后
 * 32hex 的）UUIDv7，返回 unix_ms；**非 v7 或形状不符 → null**（v4 无时间语义，不猜）。
 */
export function idUnixMs(id: string): number | null {
  if (typeof id !== 'string') return null;
  let hex: string | null = null;
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)) {
    hex = id.replaceAll('-', '');
  } else {
    const m = /^([A-Za-z][A-Za-z0-9]*)[-_]([0-9a-f]{32})$/.exec(id);
    if (m) hex = m[2] ?? null;
  }
  if (hex === null || hex.length !== 32 || hex[12] !== '7') return null; // 仅 ver=0111 可解码
  const ms = Number.parseInt(hex.slice(0, 12), 16);
  return Number.isSafeInteger(ms) && ms >= 0 ? ms : null;
}
