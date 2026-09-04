/**
 * 隐私删除授权签发器（纯密码学，零 IO、零模型、零 db）。
 *
 * 这是 INT-TRANSCRIPT-00 的共享 P0 原语，同时解锁评分前置(INT-TRANSCRIPT-01→SCOR)
 * 与记忆治理(MEM-00)。它与模型网关的 `AuthorizationSnapshot`（Ed25519，
 * iss=meetwise-authz-v1 / aud=meetwise-model-gateway）采用**刻意分离**的算法与
 * issuer/audience，避免密钥复用与跨用途混淆（隐私删除授权根 vs 模型命令授权根）：
 *
 *   - 本模块用 **ECDSA P-256 / ES256**（JWS 紧凑序列化，RFC 7518 §3.4 的原始 R||S
 *     64 字节签名，Node 用 `dsaEncoding:'ieee-p1363'`），取阿里云 KMS/HSM 原生支持、
 *     接入成本最低（见 meetwise-model-op-decisions）。
 *   - iss=meetwise-privacy-authz-v1 / aud=meetwise-deletion-worker。
 *   - 私钥只存在于签发器进程（本模块 sign* 的调用方），绝不进 SQL、worker、浏览器
 *     或 AUTH_SECRET。数据库只存公钥无关的**账本行**（jti/状态/owner/digest），验签
 *     靠本模块的 verify* + 传入的 JWKS resolver。
 *
 * 防伪造：调用方不能自报 owner/scope/epoch/target/issuer/key —— 这些全部由签名绑定，
 * deleter 只信任“验签通过 + DB 行”。防重放：单次 jti（DB 原子 CAS 消费）+ 短时 exp +
 * 精确 target-set digest（钉死 sink 集，增删任一 target 即 digest 漂移而拒绝）。
 *
 * 轮换模型（kid 版本化，如 `privacy-del-2026-01`，**进程内原语**）：JWKS 按 kid 轮换；
 * 旧 kid 仅保留验签、直到其签发快照的 `expiresAt` 窗口全部关闭后从 JWKS 移除；未知/已
 * 吊销 kid 一律 fail-closed（返回 null）。「签发只走 active kid」目前只是调用方约定，
 * 注册表并不拦截用 retired kid 调 sign；kid 注册表持久化 / JWKS 对外发布 / 该约定的强制，
 * 属于未来 issuer 服务接线的启动门禁（本任务明确不落地），不能据此宣称「两套身份根」
 * 已在网关侧闭环运行。
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomUUID,
  sign as cryptoSign,
  verify as cryptoVerify,
  type KeyObject,
} from 'node:crypto';
import { MEMORY_AUTHZ_SINK_KINDS } from './memory-governance.ts';
import { CONVERSATION_EVENT_SINKS } from './ctx03-event-source.ts';
import { COMPRESSION_DELETION_SINKS } from './ctx06-deletion-closure.ts';
import { MEMORY_VECTOR_CHUNK_DELETION_SINKS } from './memory-vector-chunk-deletion.ts';

// iss/aud/purpose/kid/digest 在 contracts 与 domain 各自手写一份，SQL(0091) 还有 issuer_id 的
// 第三份拷贝。这些常量漂移不会被运行期自动拒绝（签名只绑定 JWS 载荷，不比对 contracts 侧
// 常量）；兜底 = 跨侧 test pin（domain proof M6，逐值比对 contracts↔domain）+ SQL 侧 consume/
// claim 的 issuer_id='meetwise-privacy-authz-v1' 校验。
export const PRIVACY_AUTHZ_ISSUER = 'meetwise-privacy-authz-v1';
export const PRIVACY_AUTHZ_AUDIENCE = 'meetwise-deletion-worker';

/** 允许的最大快照寿命（秒）。短时单次 jti：寿命过长会放大“已签发未消费”窗口。 */
export const MAX_PRIVACY_AUTHZ_TTL_SEC = 3600;

/**
 * 删除目标 kind 与 DB `privacy_deletion_target.sink` 枚举一一对应。sign 必须在此枚举内，
 * 否则 TS digest 与 SQL live-digest（`string_agg(sink||':'||resource_hmac,...)` 用 sink 列）
 * 会因枚举漂移而不等，弱化第二道防线（H1）。
 */
export const PRIVACY_AUTHZ_SINK_KINDS = [
  'checkpoint_rows', 'interview_job_payload', 'event', 'report', 'vector', 'redis', 'oss', 'langfuse',
  // INT-TRANSCRIPT-00 新增：答案事实根（加密答案正文 artifact 的删除目标）。这是 INT 域
  // 自己的 sink registry（与 MEM 的 MEMORY_AUTHZ_SINK_KINDS 不相交）；issuer 的 sign 只
  // 保证 kind 属于某个已登记 registry，不判断域归属，故新增本枚举即可让 TS 侧
  // canonicalTargetSetDigest 与 SQL 侧 live-digest（string_agg）逐字节一致。DB 侧
  // privacy_deletion_target.sink CHECK 由 0092/0093 迁移同步扩展（跨侧 pin 由 proof 兜底）。
  'interview_answer_artifact',
  // INT-TRANSCRIPT-01 新增：ai_graph_run（访谈作用域 graph run，thread_id=interview id）。
  // 0059 已为它挂写 guard（BEFORE INSERT 触发器 + RLS），但 0096 之前无删除 target/resolver
  // （M1 缺口）。与 interview_answer_artifact 同源：TS 侧本 registry 与 SQL 侧
  // privacy_deletion_target.sink CHECK（0096 扩展）必须同步，否则 canonicalTargetSetDigest
  // 与 live-digest 因枚举漂移而不等、claim 重验必失败。
  'ai_graph_run',
] as const;

/**
 * 签发侧合法的全部 sink kind = INT-TRANSCRIPT sink 与 MEM sink 的**并集**。
 *
 * 这是共享 issuer 支持两条独立轨道（INT-TRANSCRIPT-00 与 MEM-00）的唯一扩展点：sign 只
 * 负责保证 kind 属于「某个已登记的 sink registry」（避免 TS digest 与 SQL live-digest 因
 * 枚举漂移而不等），**不判断 kind 属于哪个域**。域归属（MEM sink 只能被 account_data 域
 * claim、INT sink 只能被 interview_data 域 claim）由各域的 claim/解析 SQL 函数强制，见
 * 0093 的 privacy_authorization_claim_memory_target（MEM）与 0091 的 claim（INT）。
 * 新增第三条轨道 = 再往本并集追加其 sink registry 即可，不触碰签/验密码学。
 */
const ALL_PRIVACY_AUTHZ_SINK_KINDS: ReadonlySet<string> = new Set([
  ...PRIVACY_AUTHZ_SINK_KINDS,
  ...MEMORY_AUTHZ_SINK_KINDS,
  ...CONVERSATION_EVENT_SINKS,
  ...COMPRESSION_DELETION_SINKS,
  ...MEMORY_VECTOR_CHUNK_DELETION_SINKS,
]);

/** kid 格式：与 contracts 契约 keyId 正则逐值一致（两份手写真相）。漂移不会被运行期自动
 * 拒绝，仅由跨侧 test pin（domain proof M6）在 CI 显式比对兜底。 */
export const PRIVACY_AUTHZ_KID_RE = /^[A-Za-z0-9_-]{1,64}$/;
/** resource/digest 必须是 64-hex（无 ':' 无 '\n'），否则 canonical digest 的分隔符产生歧义
 * 碰撞。与 contracts 的 PRIVACY_AUTHZ_DIGEST_RE 逐值一致（跨侧 test pin 兜底）。 */
export const PRIVACY_AUTHZ_DIGEST_RE = /^[a-f0-9]{64}$/;
/** 验签允许的时钟偏移上限（秒）：签发方时钟略超前于验签方时仍可验签，超出则 fail-closed。 */
const MAX_CLOCK_SKEW_SEC = 300;

/** 统一失败出口：错误名即 `code`（全称 `privacy_authorization_*` snake_case），上层按 code 分支。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

/** 删除授权目的。00 只实现 interview_data_erasure；其余为 MEM-00/后续复用预留枚举。 */
export const PRIVACY_AUTHZ_PURPOSES = ['interview_data_erasure', 'resume_data_erasure', 'account_data_erasure'] as const;
export type PrivacyAuthzPurpose = (typeof PRIVACY_AUTHZ_PURPOSES)[number];

/** 单一删除目标（kind=DB sink 枚举值，resource=opaque HMAC 定位符，绝不落明文定位）。 */
export interface PrivacyAuthzTarget { kind: string; resource: string }

/** 一张 JWS 快照的声明载荷（payload）。iat/exp 为秒级 unix，字段名沿用 JWT 注册名。 */
export interface PrivacyAuthorizationClaims {
  iss: string;               // = PRIVACY_AUTHZ_ISSUER
  aud: string;               // = PRIVACY_AUTHZ_AUDIENCE
  jti: string;               // 单次 UUID，DB 原子 CAS 消费
  iat: number;               // 签发时刻（秒）
  exp: number;               // 过期时刻（秒）
  issuerId: string;          // 显式 issuerId（与 iss 同值，满足契约要求可独立审计）
  keyId: string;             // 签发所用 kid（与 JWS header.kid 一致，双重绑定）
  actor: string;             // 发起身份（审计；owner 是数据主体）
  owner: string;             // 数据主体（owner 由签名绑定，deleter 不信任调用方自报）
  interview: string;         // 目标面试 id（subject）
  purpose: PrivacyAuthzPurpose;
  privacyEpoch: number;      // 隐私代次
  targetSetDigest: string;   // 精确 target-set digest（64 hex，钉死 sink 集）
}

/** 验签通过后的类型化结果。iat/exp 换算成毫秒，方便调用方与 DB timestamptz 对齐。 */
export interface VerifiedPrivacyAuthorization {
  jti: string;
  issuerId: string;
  keyId: string;
  actor: string;
  owner: string;
  interview: string;
  purpose: PrivacyAuthzPurpose;
  privacyEpoch: number;
  targetSetDigest: string;
  issuedAtMs: number;
  expiresAtMs: number;
}

/** P-256 JWK（用于 JWKS 发布与验签公钥重建）。x/y 为 base64url，无 padding。 */
export interface EcJwk { kty: 'EC'; crv: 'P-256'; x: string; y: string }

/** JWKS 中的单个公钥条目。 */
export interface PrivacyAuthzPublicKey { kty: 'EC'; crv: 'P-256'; use: 'sig'; alg: 'ES256'; kid: string; x: string; y: string }

/** 签/验共用的密钥材料。privateKeyPem 只在签发器；公钥才进 JWKS/验签侧。 */
export interface PrivacyAuthzKeyMaterial {
  kid: string;
  publicJwk: EcJwk;
  privateKeyPem: string; // PKCS#8 PEM（私钥绝不序列化进任何共享结构）
}

// B64URL 同时接受字节（签名 R||S）与 UTF-8 字符串（header/payload JSON）。string 分支先
// 显式 UTF-8 编码，避免把“字符串当字节”的歧义交给 Buffer.from 重载推断（新 @types/node
// 把 Buffer.from(string) 收紧为 WithImplicitCoercion，且 string 不能静默当 Uint8Array 用）。
const B64URL = (buf: Buffer | Uint8Array | string) =>
  (typeof buf === 'string' ? Buffer.from(buf, 'utf8') : Buffer.from(buf)).toString('base64url');
const FROM_B64URL = (s: string) => Buffer.from(s, 'base64url');

/**
 * 精确 target-set digest：先按 (kind, resource) 排序，再逐行 `kind:resource` 用 '\n'
 * 连接后 sha256。排序让 digest 与插入顺序无关；':' 与 '\n' 作为分隔符要求 kind/resource
 * 不含这两者——kind 由 sign 校验在 PRIVACY_AUTHZ_SINK_KINDS 内，resource 由 sign 校验为
 * 64-hex（无 ':' 无 '\n'），避免“a:b:c”与“a:b / c”这类分隔符歧义碰撞（M8）。
 * DB 侧 claim 函数用同构 SQL `string_agg(sink||':'||resource_hmac, E'\n' ORDER BY sink, resource_hmac)`
 * 重算比对，形成第二道防线（SQL 与 TS 两处同一定义，漂移=拒绝）。
 */
export function canonicalTargetSetDigest(targets: PrivacyAuthzTarget[]): string {
  const ordered = [...targets].sort((a, b) => (a.kind === b.kind ? (a.resource < b.resource ? -1 : a.resource > b.resource ? 1 : 0) : a.kind < b.kind ? -1 : 1));
  const body = ordered.map((t) => `${t.kind}:${t.resource}`).join('\n');
  return createHash('sha256').update(body).digest('hex');
}

/** 生成一对 P-256 密钥（签发器用）。返回 kid + JWK + PEM 私钥。 */
export function generatePrivacyAuthzKeyPair(kid: string): PrivacyAuthzKeyMaterial {
  const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  const raw = publicKey.export({ format: 'jwk' });
  // 只保留验签所需的最小字段，剥离 Node 额外附加的 key_ops 等噪声。
  const publicJwk: EcJwk = { kty: 'EC', crv: 'P-256', x: String(raw.x), y: String(raw.y) };
  return { kid, publicJwk, privateKeyPem: String(privateKey.export({ type: 'pkcs8', format: 'pem' })) };
}

/** 由 JWK 重建 Node 公钥对象（验签用）。kty/crv 不符或 x/y 非法会抛 → 上层 fail-closed。 */
export function publicKeyFromJwk(jwk: EcJwk): KeyObject {
  return createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y }, format: 'jwk' });
}

export interface SignPrivacyAuthorizationInput {
  privateKeyPem: string;
  kid: string;
  actor: string;
  owner: string;
  interview: string;
  purpose: PrivacyAuthzPurpose;
  privacyEpoch: number;
  /** 要钉死的目标集；digest 由此计算并写进快照，调用方需把同一 digest 落到 request 账本。 */
  targets: PrivacyAuthzTarget[];
  jti?: string;      // 缺省随机 UUID（单次）
  nowSec: number;    // 注入便于 gate 确定性
  ttlSec: number;    // 0 < ttlSec <= MAX_PRIVACY_AUTHZ_TTL_SEC
}

export interface SignedPrivacyAuthorization {
  jws: string;
  jti: string;
  targetSetDigest: string;
  issuedAtMs: number;
  expiresAtMs: number;
}

/** ES256 JWS 头（kid 版本化，alg 固定 ES256）。 */
function buildHeader(kid: string): string {
  return B64URL(JSON.stringify({ alg: 'ES256', kid }));
}

/**
 * 签发 AuthorizationSnapshot（JWS 紧凑序列化：header.payload.signature）。
 * 私钥只在签发器内存；所有防伪造字段（owner/scope/epoch/target/issuer/key）进入签名载荷，
 * deleter 只能验签后读取，不能自报。ttlSec 越界/epoch 非法直接抛，绝不静默签弱快照。
 */
export function signPrivacyAuthorizationSnapshot(input: SignPrivacyAuthorizationInput): SignedPrivacyAuthorization {
  const { privateKeyPem, kid, actor, owner, interview, purpose, privacyEpoch, targets, nowSec, ttlSec } = input;
  // 失败即抛（fail-closed）：宁可拒签也不签发弱/可伪造快照；code 统一 `privacy_authorization_*`（M10）。
  if (!Number.isInteger(privacyEpoch) || privacyEpoch < 1) fail('privacy_authorization_epoch_invalid');
  if (!Number.isInteger(ttlSec) || ttlSec < 1 || ttlSec > MAX_PRIVACY_AUTHZ_TTL_SEC) fail('privacy_authorization_ttl_invalid');
  if (!Number.isSafeInteger(nowSec) || nowSec <= 0) fail('privacy_authorization_iat_invalid');
  // kid 同时进 header.kid 与 payload.keyId，格式/长度必须与契约 keyId 一致（M7）。
  if (typeof kid !== 'string' || !PRIVACY_AUTHZ_KID_RE.test(kid)) fail('privacy_authorization_kid_invalid');
  // actor/owner/interview 长度上限与契约对齐（≤128），杜绝契约/domain 两份手写真相漂移（M6/M7）。
  if (typeof actor !== 'string' || typeof owner !== 'string' || typeof interview !== 'string'
    || actor.length === 0 || owner.length === 0 || interview.length === 0
    || actor.length > 128 || owner.length > 128 || interview.length > 128) fail('privacy_authorization_claims_invalid');
  if (!(PRIVACY_AUTHZ_PURPOSES as readonly string[]).includes(purpose)) fail('privacy_authorization_purpose_invalid');
  // H1：targets 非空；每个 target 的 kind ∈ sink 枚举、resource 严格 64-hex（禁 ':'/'\n'），
  // 否则 TS digest 与 SQL live-digest 会因分隔符歧义/枚举漂移而不等，弱化第二道防线。
  if (!Array.isArray(targets) || targets.length === 0) fail('privacy_authorization_targets_empty');
  for (const t of targets) {
    if (!t || typeof t !== 'object') fail('privacy_authorization_target_invalid');
    if (!ALL_PRIVACY_AUTHZ_SINK_KINDS.has(t.kind)) fail('privacy_authorization_target_kind_invalid');
    if (typeof t.resource !== 'string' || !PRIVACY_AUTHZ_DIGEST_RE.test(t.resource)) fail('privacy_authorization_target_resource_invalid');
  }
  const jti = input.jti ?? randomUUID();
  const iat = nowSec;
  const exp = nowSec + ttlSec;
  const targetSetDigest = canonicalTargetSetDigest(targets);
  const claims: PrivacyAuthorizationClaims = {
    iss: PRIVACY_AUTHZ_ISSUER,
    aud: PRIVACY_AUTHZ_AUDIENCE,
    jti,
    iat,
    exp,
    issuerId: PRIVACY_AUTHZ_ISSUER,
    keyId: kid,
    actor,
    owner,
    interview,
    purpose,
    privacyEpoch,
    targetSetDigest,
  };
  const header = buildHeader(kid);
  const payload = B64URL(JSON.stringify(claims));
  const signingInput = `${header}.${payload}`;
  const privateKey = createPrivateKey(privateKeyPem);
  // ieee-p1363 输出原始 R||S（P-256 各 32 字节，共 64 字节），即 RFC 7518 规定的 ES256 签名。
  const sig = cryptoSign('sha256', Buffer.from(signingInput), { key: privateKey, dsaEncoding: 'ieee-p1363' });
  return { jws: `${signingInput}.${B64URL(sig)}`, jti, targetSetDigest, issuedAtMs: iat * 1000, expiresAtMs: exp * 1000 };
}

export interface VerifyPrivacyAuthorizationInput {
  jws: string;
  /**
   * kid → 公钥 resolver（fail-closed）：未知/已吊销/窗口已关闭的 kid 必须返回 null。
   * 由调用方注入（如 PrivacyAuthzKeyRegistry.resolve），使验签与密钥存储解耦。
   * `nowMs` 为毫秒（与注册表的 retainUntilMs 同单位；验签内部由 nowSec 换算）。
   */
  resolveJwk: (kid: string, nowMs: number) => EcJwk | null;
  nowSec: number;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 验签 AuthorizationSnapshot。任何一处不符都返回 null（fail-closed），绝不抛半校验结果：
 * 畸形 JWS / 非 ES256 / kid 缺失或未知或已吊销或窗口关闭 / 签名不符 / iss/aud/issuerId/keyId
 * 不符 / 过期 / 寿命超上限 / 缺 claim / epoch 非法 / digest 非 64-hex 全部拒绝。
 */
export function verifyPrivacyAuthorizationSnapshot(input: VerifyPrivacyAuthorizationInput): VerifiedPrivacyAuthorization | null {
  const { jws, resolveJwk, nowSec } = input;
  if (typeof jws !== 'string') return null;
  const parts = jws.split('.');
  if (parts.length !== 3 || parts.some((p) => p.length === 0)) return null;
  // `parts.length === 3` 已保证三段存在；`!` 仅消解 noUncheckedIndexedAccess 的
  // string|undefined 悬垂类型，不改变运行时语义（缺失已在上面返回 null）。
  const headerB64 = parts[0]!;
  const payloadB64 = parts[1]!;
  const sigB64 = parts[2]!;

  let header: { alg?: unknown; kid?: unknown };
  try { header = JSON.parse(FROM_B64URL(headerB64).toString('utf8')); } catch { return null; }
  if (header?.alg !== 'ES256' || typeof header.kid !== 'string' || header.kid.length === 0) return null;
  const kid = header.kid;

  const jwk = resolveJwk(kid, nowSec * 1000);
  if (!jwk) return null; // unknown / revoked / retired-window-closed

  const signingInput = `${headerB64}.${payloadB64}`;
  let sigBuf: Buffer;
  try { sigBuf = FROM_B64URL(sigB64); } catch { return null; }
  let signatureOk = false;
  try {
    signatureOk = cryptoVerify('sha256', Buffer.from(signingInput), { key: publicKeyFromJwk(jwk), dsaEncoding: 'ieee-p1363' }, sigBuf);
  } catch { return null; }
  if (!signatureOk) return null;

  let claims: Partial<PrivacyAuthorizationClaims>;
  try { claims = JSON.parse(FROM_B64URL(payloadB64).toString('utf8')); } catch { return null; }
  if (typeof claims !== 'object' || claims === null) return null;   // payload=null/标量 → fail-closed，不抛 TypeError（M5）
  if (
    claims.iss !== PRIVACY_AUTHZ_ISSUER
    || claims.aud !== PRIVACY_AUTHZ_AUDIENCE
    || claims.issuerId !== PRIVACY_AUTHZ_ISSUER
    || claims.keyId !== kid                       // header.kid 与 payload.keyId 必须一致（双重绑定）
    || typeof claims.jti !== 'string' || !UUID.test(claims.jti)
    || typeof claims.actor !== 'string' || claims.actor.length === 0
    || typeof claims.owner !== 'string' || claims.owner.length === 0
    || typeof claims.interview !== 'string' || claims.interview.length === 0
    || typeof claims.purpose !== 'string' || !(PRIVACY_AUTHZ_PURPOSES as readonly string[]).includes(claims.purpose)
    || typeof claims.privacyEpoch !== 'number' || !Number.isInteger(claims.privacyEpoch) || claims.privacyEpoch < 1
    || typeof claims.targetSetDigest !== 'string' || !PRIVACY_AUTHZ_DIGEST_RE.test(claims.targetSetDigest)
    || typeof claims.iat !== 'number' || !Number.isInteger(claims.iat)
    || typeof claims.exp !== 'number' || !Number.isInteger(claims.exp)
  ) return null;
  if (claims.iat <= 0) return null;                                       // iat 必须为正（L1）
  if (claims.exp <= claims.iat) return null;                              // exp 必须严格晚于 iat（L1）
  if (claims.iat > nowSec + MAX_CLOCK_SKEW_SEC) return null;              // future-iat：签发方时钟不能超前验签方超过允许偏移（L1）
  if (claims.exp <= nowSec) return null;                                  // 已过期（与 DB consume 的 `<= now()` 对齐，exp==now 即视为过期，fail-closed，L2）
  if (claims.exp - claims.iat > MAX_PRIVACY_AUTHZ_TTL_SEC) return null;   // 寿命超上限（防弱/错配快照无限有效）

  return {
    jti: claims.jti,
    issuerId: claims.issuerId,
    keyId: claims.keyId,
    actor: claims.actor,
    owner: claims.owner,
    interview: claims.interview,
    purpose: claims.purpose as PrivacyAuthzPurpose,
    privacyEpoch: claims.privacyEpoch,
    targetSetDigest: claims.targetSetDigest,
    issuedAtMs: claims.iat * 1000,
    expiresAtMs: claims.exp * 1000,
  };
}

type PrivacyAuthzKeyState = 'active' | 'retired' | 'revoked';

interface PrivacyAuthzRegistryEntry { kid: string; jwk: EcJwk | null; state: PrivacyAuthzKeyState; retainUntilMs: number | null }

/**
 * kid 版本化的密钥注册表（签发器的轮换真相，验签侧持有只读投影）。
 * - activate：新 kid 上线为 active（同 kid 覆盖视为显式轮换）。
 * - retire(kid, retainUntilMs)：旧 kid 降为 retired，仅在 retainUntilMs 前可验签（覆盖其
 *   已签发快照的 expiresAt 窗口），之后 resolve 返回 null（从 JWKS 移除）。
 * - revoke：立即 fail-closed（密钥泄露应急），resolve 与 toJwks 都不再返回它。
 */
export class PrivacyAuthzKeyRegistry {
  private entries = new Map<string, PrivacyAuthzRegistryEntry>();

  activate(kid: string, jwk: EcJwk): void {
    this.entries.set(kid, { kid, jwk, state: 'active', retainUntilMs: null });
  }

  retire(kid: string, retainUntilMs: number): void {
    const existing = this.entries.get(kid);
    if (!existing) return;
    existing.state = 'retired';
    existing.retainUntilMs = retainUntilMs;
  }

  revoke(kid: string): void {
    const existing = this.entries.get(kid);
    // 未知 kid 也要登记为 revoked（防“先验签后注册”的窗口把已泄露 kid 当 active），jwk 允许为 null（M9）。
    if (!existing) { this.entries.set(kid, { kid, jwk: null, state: 'revoked', retainUntilMs: null }); return; }
    existing.state = 'revoked';
    existing.retainUntilMs = null;
  }

  /** fail-closed resolver：active/未过窗 retired → jwk；未知/已过窗 retired/revoked → null。 */
  resolve(kid: string, nowMs: number): EcJwk | null {
    const entry = this.entries.get(kid);
    if (!entry || entry.state === 'revoked') return null;
    if (entry.state === 'active') return entry.jwk;
    return entry.retainUntilMs !== null && nowMs <= entry.retainUntilMs ? entry.jwk : null;
  }

  activeKid(): string | null {
    for (const [kid, entry] of this.entries) if (entry.state === 'active') return kid;
    return null;
  }

  /** JWKS 发布：仅 active + 未过窗 retired（验签所需），排除 revoked 与已过窗 retired。 */
  toJwks(nowMs: number): { keys: PrivacyAuthzPublicKey[] } {
    const keys: PrivacyAuthzPublicKey[] = [];
    for (const entry of this.entries.values()) {
      if (entry.state === 'revoked') continue;
      if (entry.state === 'retired' && (entry.retainUntilMs === null || nowMs > entry.retainUntilMs)) continue;
      if (!entry.jwk) continue;   // 仅 active/未过窗 retired 才有 jwk；此为 jwk 可空后的类型收窄防御
      keys.push({ kty: 'EC', crv: 'P-256', use: 'sig', alg: 'ES256', kid: entry.kid, x: entry.jwk.x, y: entry.jwk.y });
    }
    return { keys };
  }
}
