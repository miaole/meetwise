/**
 * RAG-FUNNEL-06 / route-scope 缓存 + provenance + 撤销的 domain 形状。
 *
 * 零 IO、零模型、零 db —— 只做：
 *  - `RouteScopeCacheFacets`：把「某 snapshot 的 route scope」钉成 cache 身份所需的
 *    七面绑定（routeScopeDigest / leaf / taxonomy / generationId / recipeId /
 *    privacyEpoch / aclDigest）。**任何一面变化 → digest 变化 → 结构上不可能跨桶 replay**
 *    （旧 key 与旧值在身份上分离，水合阶段再重验 live 值）。
 *  - `deriveServingAclDigest`：把服务用途/同意修订也钉进身份，伪造 cache identity
 *    = 0 evidence（UC-RAG-FUNNEL-06 验收）。
 *  - `deriveRouteScopeCacheDigest`：七面绑定的 canonical cache 身份（retrieval-result /
 *    singleflight / negative-result 三者共用同一身份，各自落到不同存储面，无碰撞）。
 *  - `validateRouteScopeCacheFacets`：服务端形状校验（复用 RAG-03/04 的 leaf/taxonomy/
 *    generation/recipe/digest 形状正则，避免本层发明新枚举）。
 *
 * 真实缓存命中/重验/撤销由 `packages/db/src/qbank-route-scope-cache.ts` 派发；本模块只冻结形状。
 */
import { createHash } from 'node:crypto';

/** RAG-06 冻结的 route-scope cache 策略版本。改此值 = 改 cache 身份/重验语义，必须升版本。 */
export const ROUTE_SCOPE_CACHE_POLICY_VERSION = 'rag06-route-scope-cache:v1';

/** negative-result cache 状态机（显式 enum；CAS active→superseded，sticky 终态）。 */
export const NEGATIVE_RESULT_STATUSES = ['active', 'superseded'] as const;
export type NegativeResultStatus = (typeof NEGATIVE_RESULT_STATUSES)[number];

/** 唯一可达的负结果判定（对齐 RAG-04 干净无题终态 no_eligible_in_scope）。 */
export const NEGATIVE_RESULT_VERDICTS = ['no_eligible_in_scope'] as const;
export type NegativeResultVerdict = (typeof NEGATIVE_RESULT_VERDICTS)[number];

/** qbank 系统语料的服务用途（非 user 上传内容；首期只有 retrieval 一种用途）。 */
export const SERVING_PURPOSE = 'interview.qbank.retrieval' as const;
/** 服务同意修订（qbank 系统语料是系统批准，非候选人/招聘方同意；冻结为 v1）。 */
export const SERVING_CONSENT_REVISION = 'system_approved:v1' as const;

const ROUTE_SCOPE_DIGEST = /^[0-9a-f]{64}$/;
const LEAF = /^[a-z][a-z0-9_]*(\/[a-z][a-z0-9_]*){0,3}$/;
const TAXONOMY_VERSION = /^v[1-9][0-9]{0,15}$/;
const GENERATION_ID = /^qgen-[0-9a-f-]{36}$/;
const RECIPE_ID = /^qrecipe-[0-9a-f]{32}$/;
const DIGEST64 = /^[0-9a-f]{64}$/;

/** 服务 ACL 输入：把「谁能、为谁、以何用途/同意」读这份语料钉进身份。 */
export interface ServingAclInput {
  servingScopeId: string;
  taxonomyVersion: string;
  purpose: string;
  consentRevision: string;
}

/** 服务 ACL digest：伪造 cache identity（错 purpose/consent/scope）= 0 evidence 的承重身份。 */
export function deriveServingAclDigest(input: ServingAclInput): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'serving-acl:v1',
    servingScopeId: input.servingScopeId,
    taxonomyVersion: input.taxonomyVersion,
    purpose: input.purpose,
    consentRevision: input.consentRevision,
  })).digest('hex');
}

/**
 * RAG-06 的七面 route-scope cache 绑定。`routeScopeDigest` 来自 RAG-04
 * deriveRouteScopeDigest（routeDigest + leaf + taxonomy）；`privacyEpoch` 是面试冻结的
 * resume privacy fence；`aclDigest` 来自 deriveServingAclDigest。
 */
export interface RouteScopeCacheFacets {
  routeScopeDigest: string;
  leafTrackId: string;
  taxonomyVersion: string;
  generationId: string;
  recipeId: string;
  privacyEpoch: number;
  aclDigest: string;
}

/** 七面绑定的 canonical cache 身份（retrieval-result / singleflight / negative-result 共用）。 */
export function deriveRouteScopeCacheDigest(facets: RouteScopeCacheFacets): string {
  return createHash('sha256').update(JSON.stringify({
    v: 'route-scope-cache:v1',
    routeScopeDigest: facets.routeScopeDigest,
    leafTrackId: facets.leafTrackId,
    taxonomyVersion: facets.taxonomyVersion,
    generationId: facets.generationId,
    recipeId: facets.recipeId,
    privacyEpoch: facets.privacyEpoch,
    aclDigest: facets.aclDigest,
  })).digest('hex');
}

export type ValidateRouteScopeCacheFacetsResult = { ok: true } | { ok: false; reason: string };

/** 服务端形状校验：七面全部合法（形状复用 RAG-03/04 正则；不发明新枚举）。 */
export function validateRouteScopeCacheFacets(facets: RouteScopeCacheFacets): ValidateRouteScopeCacheFacetsResult {
  if (!facets || typeof facets !== 'object') return { ok: false, reason: 'invalid_schema' };
  if (typeof facets.routeScopeDigest !== 'string' || !ROUTE_SCOPE_DIGEST.test(facets.routeScopeDigest)) return { ok: false, reason: 'route_scope_digest_invalid' };
  if (typeof facets.leafTrackId !== 'string' || !LEAF.test(facets.leafTrackId)) return { ok: false, reason: 'leaf_invalid' };
  if (typeof facets.taxonomyVersion !== 'string' || !TAXONOMY_VERSION.test(facets.taxonomyVersion)) return { ok: false, reason: 'taxonomy_invalid' };
  if (typeof facets.generationId !== 'string' || !GENERATION_ID.test(facets.generationId)) return { ok: false, reason: 'generation_id_invalid' };
  if (typeof facets.recipeId !== 'string' || !RECIPE_ID.test(facets.recipeId)) return { ok: false, reason: 'recipe_id_invalid' };
  if (!Number.isInteger(facets.privacyEpoch) || facets.privacyEpoch < 0) return { ok: false, reason: 'privacy_epoch_invalid' };
  if (typeof facets.aclDigest !== 'string' || !DIGEST64.test(facets.aclDigest)) return { ok: false, reason: 'acl_digest_invalid' };
  return { ok: true };
}
