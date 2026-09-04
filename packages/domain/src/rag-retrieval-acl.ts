/**
 * RAG-FUNNEL-01A retrieval ACL predicate（纯域合同）。
 *
 * 零 IO。本模块给调用方一个 fail-closed 判定面；**不是** PostgreSQL 的第二套
 * 授权根，也尚未被 API/Worker 接线。
 *
 * SQL（`0124_rag_retrieval_acl_fail_closed.sql` / 0073）真实语义只有这些：
 * 编号：本切片保持 0124；并行未合入的 `memory_vector_chunk` 擦除占用 0125，不得改号。
 *  - 空或空白 `app.principal_user` → 抛 `rag_acl_principal_missing`（42501）
 *  - 跨租户 binding → `rag_binding_unavailable`（不是本枚举）
 *  - 私有行越权 / global 无批准 provenance → 0 行（不是本枚举抛错）
 *  `binding_session_mismatch` 仅在调用方同时提供两侧 session 时由本谓词拒绝；
 *  SQL binding 表没有 session 列，不得把本码写成已落地的数据面隔离。
 */
export const RAG_RETRIEVAL_ACL_CODES = [
  'rag_acl_principal_missing',
  'rag_acl_binding_owner_mismatch',
  'rag_acl_binding_session_mismatch',
  'rag_acl_private_owner_mismatch',
  'rag_acl_provenance_missing',
  'rag_acl_visibility_unknown',
] as const;

export type RagRetrievalAclCode = (typeof RAG_RETRIEVAL_ACL_CODES)[number];
export type RagRetrievalVisibility = 'private' | 'global';

export interface RagRetrievalAclInput {
  principalUserId?: string | null;
  bindingOwnerUserId?: string | null;
  bindingSessionId?: string | null;
  requestSessionId?: string | null;
  visibility?: string | null;
  privateOwnerUserId?: string | null;
  globalProvenanceApproved?: boolean | null;
}

export type RagRetrievalAclDecision =
  | { allow: true }
  | { allow: false; code: RagRetrievalAclCode };

const blank = (value: string | null | undefined): boolean =>
  value == null || typeof value !== 'string' || value.trim() === '';

/**
 * Fail-closed ACL decision.
 * Binding-only checks omit `visibility`. Row checks must pass visibility;
 * omitting it is not a row-level allow.
 */
export function decideRagRetrievalAcl(input: RagRetrievalAclInput | null | undefined): RagRetrievalAclDecision {
  if (!input || typeof input !== 'object') return { allow: false, code: 'rag_acl_principal_missing' };
  if (blank(input.principalUserId)) return { allow: false, code: 'rag_acl_principal_missing' };
  const principal = input.principalUserId!.trim();

  if (input.bindingOwnerUserId !== undefined && input.bindingOwnerUserId !== null) {
    if (blank(input.bindingOwnerUserId) || input.bindingOwnerUserId.trim() !== principal) {
      return { allow: false, code: 'rag_acl_binding_owner_mismatch' };
    }
  }

  const sessionBound = input.bindingSessionId !== undefined && input.bindingSessionId !== null
    && input.requestSessionId !== undefined && input.requestSessionId !== null;
  if (sessionBound) {
    if (blank(input.bindingSessionId) || blank(input.requestSessionId)
      || input.bindingSessionId!.trim() !== input.requestSessionId!.trim()) {
      return { allow: false, code: 'rag_acl_binding_session_mismatch' };
    }
  }

  if (input.visibility === undefined || input.visibility === null) return { allow: true };
  if (input.visibility !== 'private' && input.visibility !== 'global') {
    return { allow: false, code: 'rag_acl_visibility_unknown' };
  }
  if (input.visibility === 'private') {
    if (blank(input.privateOwnerUserId) || input.privateOwnerUserId!.trim() !== principal) {
      return { allow: false, code: 'rag_acl_private_owner_mismatch' };
    }
    return { allow: true };
  }
  if (input.globalProvenanceApproved !== true) return { allow: false, code: 'rag_acl_provenance_missing' };
  return { allow: true };
}

/** Throw the fail-closed ACL code. Callers must not catch-and-search. */
export function assertRagRetrievalAcl(input: RagRetrievalAclInput | null | undefined): void {
  const decision = decideRagRetrievalAcl(input);
  if (!decision.allow) throw new Error(decision.code);
}
