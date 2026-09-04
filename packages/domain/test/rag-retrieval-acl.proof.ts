/**
 * RAG-FUNNEL-01A retrieval ACL proof（纯域，确定性，无 DB、无模型）。
 * pnpm -C packages/domain prove:rag-retrieval-acl
 *
 * 七类：正/异/特/逃/并/复/刁。隔离与缺 ACL 必须能单独失败。
 */
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RAG_RETRIEVAL_ACL_CODES,
  decideRagRetrievalAcl,
  assertRagRetrievalAcl,
} from '../src/index.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

let fail = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) fail++; };
const throwsCode = (fn: () => unknown, code: string) => {
  try { fn(); return false; } catch (error) { return error instanceof Error && error.message === code; }
};

const ownerA = 'tenant-a';
const ownerB = 'tenant-b';
const sessionA = 'interview-a-session';
const sessionB = 'interview-b-session';

A('编号：本切片占用 0124_rag_retrieval_acl_fail_closed，不抢 0125、不存在 0124_memory_vector_chunk_erasure',
  existsSync(resolve(root, 'packages/db/migrations/0124_rag_retrieval_acl_fail_closed.sql'))
  && !existsSync(resolve(root, 'packages/db/migrations/0124_memory_vector_chunk_erasure.sql'))
  && !existsSync(resolve(root, 'packages/db/migrations/0125_rag_retrieval_acl_fail_closed.sql')));

A('ACL 错误码枚举冻结（域合同，非 SQL 全量抛码）',
  JSON.stringify([...RAG_RETRIEVAL_ACL_CODES]) === JSON.stringify([
    'rag_acl_principal_missing',
    'rag_acl_binding_owner_mismatch',
    'rag_acl_binding_session_mismatch',
    'rag_acl_private_owner_mismatch',
    'rag_acl_provenance_missing',
    'rag_acl_visibility_unknown',
  ]));

/* 正：同租户 + 同会话 + 私有属主匹配 / 全局已批准 provenance */
A('正：私有行属主=principal 且 binding 同属主同会话 → allow',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    bindingOwnerUserId: ownerA,
    bindingSessionId: sessionA,
    requestSessionId: sessionA,
    visibility: 'private',
    privateOwnerUserId: ownerA,
  }).allow === true);
A('正：全局行已批准 provenance → allow',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    bindingOwnerUserId: ownerA,
    visibility: 'global',
    globalProvenanceApproved: true,
  }).allow === true);
A('正：仅解析 binding（无 visibility）且 principal 齐全 → allow',
  decideRagRetrievalAcl({ principalUserId: ownerA, bindingOwnerUserId: ownerA }).allow === true);
A('正：assertRagRetrievalAcl 在合法输入上不抛且 decide.allow=true',
  decideRagRetrievalAcl({ principalUserId: ownerA }).allow === true
  && throwsCode(() => assertRagRetrievalAcl({ principalUserId: ownerA }), 'rag_acl_principal_missing') === false);

/* 异：失败必须停检索，不得变成无范围 hits */
A('异：缺 principal → rag_acl_principal_missing（fail-closed，不检索）',
  decideRagRetrievalAcl({ principalUserId: '', visibility: 'global', globalProvenanceApproved: true }).allow === false
  && decideRagRetrievalAcl({ principalUserId: '' }).code === 'rag_acl_principal_missing');
A('异：assert 缺 principal 抛 rag_acl_principal_missing',
  throwsCode(() => assertRagRetrievalAcl({ principalUserId: null }), 'rag_acl_principal_missing'));
A('异：null/undefined 输入 → rag_acl_principal_missing',
  decideRagRetrievalAcl(null).code === 'rag_acl_principal_missing'
  && decideRagRetrievalAcl(undefined).code === 'rag_acl_principal_missing');

/* 特：空/空白/首次 */
A('特：空白 principal（空格/制表）→ rag_acl_principal_missing',
  decideRagRetrievalAcl({ principalUserId: '   ' }).code === 'rag_acl_principal_missing'
  && decideRagRetrievalAcl({ principalUserId: '\t' }).code === 'rag_acl_principal_missing');
A('特：binding 属主空白 → rag_acl_binding_owner_mismatch',
  decideRagRetrievalAcl({ principalUserId: ownerA, bindingOwnerUserId: '  ' }).code === 'rag_acl_binding_owner_mismatch');

/* 逃：依赖/provenance 缺失必须 fail-closed，不得降级成全库 */
A('逃：global 无批准 provenance（false/null/缺省）→ rag_acl_provenance_missing',
  decideRagRetrievalAcl({ principalUserId: ownerA, visibility: 'global', globalProvenanceApproved: false }).code === 'rag_acl_provenance_missing'
  && decideRagRetrievalAcl({ principalUserId: ownerA, visibility: 'global', globalProvenanceApproved: null }).code === 'rag_acl_provenance_missing'
  && decideRagRetrievalAcl({ principalUserId: ownerA, visibility: 'global' }).code === 'rag_acl_provenance_missing');
A('逃：未知 visibility 不按 private/global 猜 → rag_acl_visibility_unknown',
  decideRagRetrievalAcl({ principalUserId: ownerA, visibility: 'shared' }).code === 'rag_acl_visibility_unknown'
  && decideRagRetrievalAcl({ principalUserId: ownerA, visibility: '' }).code === 'rag_acl_visibility_unknown');

/* 并：跨会话 replay 与跨租户 binding 必须互斥（确定性，无竞态窗口） */
A('并：同租户换会话 replay binding → rag_acl_binding_session_mismatch',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    bindingOwnerUserId: ownerA,
    bindingSessionId: sessionA,
    requestSessionId: sessionB,
  }).code === 'rag_acl_binding_session_mismatch');
A('并：会话双方都给出且一致才过；单侧给出不发明匹配',
  decideRagRetrievalAcl({ principalUserId: ownerA, bindingSessionId: sessionA }).allow === true
  && decideRagRetrievalAcl({
    principalUserId: ownerA,
    bindingSessionId: sessionA,
    requestSessionId: sessionA,
  }).allow === true);

/* 复：跨聚合 — binding 属主与私有行属主必须同时对齐，缺一面即拒 */
A('复：binding 属主对齐但私有行属主是 B → rag_acl_private_owner_mismatch',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    bindingOwnerUserId: ownerA,
    visibility: 'private',
    privateOwnerUserId: ownerB,
  }).code === 'rag_acl_private_owner_mismatch');
A('复：私有行缺 owner → rag_acl_private_owner_mismatch（不把空属主当本人）',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    visibility: 'private',
    privateOwnerUserId: null,
  }).code === 'rag_acl_private_owner_mismatch');

/* 刁：租户隔离 / 绑定盗窃 / 对抗 visibility */
A('刁：租户 B 使用 A 的 binding → rag_acl_binding_owner_mismatch',
  decideRagRetrievalAcl({
    principalUserId: ownerB,
    bindingOwnerUserId: ownerA,
    bindingSessionId: sessionA,
    requestSessionId: sessionA,
  }).code === 'rag_acl_binding_owner_mismatch');
A('刁：租户 A 读 B 的私有行 → rag_acl_private_owner_mismatch',
  decideRagRetrievalAcl({
    principalUserId: ownerA,
    visibility: 'private',
    privateOwnerUserId: ownerB,
  }).code === 'rag_acl_private_owner_mismatch');
A('刁：assert 跨租户 binding 抛且不返回 allow',
  throwsCode(() => assertRagRetrievalAcl({
    principalUserId: ownerB,
    bindingOwnerUserId: ownerA,
  }), 'rag_acl_binding_owner_mismatch'));
A('刁：principal 带首尾空白仍按 trim 后身份对齐（不因空白绕过）',
  decideRagRetrievalAcl({
    principalUserId: ` ${ownerA} `,
    bindingOwnerUserId: ownerA,
    visibility: 'private',
    privateOwnerUserId: ownerA,
  }).allow === true);

console.log(fail === 0 ? '\n✓ rag retrieval ACL proof passed' : `\n✗ ${fail} failures`);
process.exit(fail === 0 ? 0 : 1);
