/**
 * 记忆向量块删除 sink 的无库 pin：域 registry、签发并集、迁移 CHECK、盘点文档、公开 503。
 * 不连 PostgreSQL，不自称完整删除或发布证据。
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MEMORY_VECTOR_CHUNK_DELETION_SINKS,
  MEMORY_AUTHZ_SINK_KINDS,
  PRIVACY_AUTHZ_SINK_KINDS,
  CONVERSATION_EVENT_SINKS,
  COMPRESSION_DELETION_SINKS,
  signPrivacyAuthorizationSnapshot,
  generatePrivacyAuthzKeyPair,
} from '../src/index.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const read = (rel: string) => readFileSync(resolve(root, rel), 'utf8');

A('域: 只登记 memory_vector_chunk，不并入 MEMORY_AUTHZ_SINK_KINDS 七值',
  MEMORY_VECTOR_CHUNK_DELETION_SINKS.join(',') === 'memory_vector_chunk'
  && !MEMORY_AUTHZ_SINK_KINDS.includes('memory_vector_chunk' as (typeof MEMORY_AUTHZ_SINK_KINDS)[number])
  && MEMORY_AUTHZ_SINK_KINDS.length === 7);

const key = generatePrivacyAuthzKeyPair('privacy-del-vchunk-01');
const signed = signPrivacyAuthorizationSnapshot({
  privateKeyPem: key.privateKeyPem, kid: key.kid, actor: 'owner-a', owner: 'owner-a',
  interview: 'owner-a', purpose: 'account_data_erasure', privacyEpoch: 1,
  targets: [{ kind: 'memory_vector_chunk', resource: 'a'.repeat(64) }],
  nowSec: 1_700_000_000, ttlSec: 600,
});
A('签发并集接受 memory_vector_chunk（账户轨道 kind）', typeof signed.jws === 'string' && signed.jws.split('.').length === 3);

let unknownRejected = false;
try {
  signPrivacyAuthorizationSnapshot({
    privateKeyPem: key.privateKeyPem, kid: key.kid, actor: 'owner-a', owner: 'owner-a',
    interview: 'owner-a', purpose: 'account_data_erasure', privacyEpoch: 1,
    targets: [{ kind: 'vector_chunk', resource: 'b'.repeat(64) }],
    nowSec: 1_700_000_000, ttlSec: 600,
  });
} catch (e) {
  unknownRejected = (e as { code?: string }).code === 'privacy_authorization_target_kind_invalid';
}
A('表名 vector_chunk 不是合法 sink kind（必须用 memory_vector_chunk）', unknownRejected);

A('0124 RAG ACL 已在 main，本 sink 只新增 0125',
  existsSync(resolve(root, 'packages/db/migrations/0124_rag_retrieval_acl_fail_closed.sql'))
  && existsSync(resolve(root, 'packages/db/migrations/0125_memory_vector_chunk_erasure.sql'))
  && !existsSync(resolve(root, 'packages/db/migrations/0124_memory_vector_chunk_erasure.sql')));

const migration = read('packages/db/migrations/0125_memory_vector_chunk_erasure.sql');
A('0125 CHECK 含 memory_vector_chunk 且 purge/RLS 只认 kind=memory',
  migration.includes("'memory_vector_chunk'")
  && migration.includes("'memory_embedding'")
  && migration.includes("'context_compression_dispatch'")
  && migration.includes("DELETE FROM vector_chunk")
  && migration.includes("WHERE owner_user_id = principal AND kind = 'memory'")
  && migration.includes("AND kind = 'memory'"));

const memGov = read('packages/db/migrations/0093_memory_governance.sql');
A('0093 仍只枚举三 sink，不把 vector_chunk 写进 begin 数组',
  memGov.includes("ARRAY['memory_fact','memory_embedding','memory_context_snapshot']")
  && !memGov.includes('memory_vector_chunk'));

const inventory = read('ai-docs/architecture/ai/privacy-deletion-sink-inventory.md');
A('盘点文档与代码同 sink 名，并诚实保留 user_memory / ai_invocation_trace 缺口',
  inventory.includes('memory_vector_chunk')
  && inventory.includes('vector_chunk')
  && inventory.includes('user_memory')
  && inventory.includes('ai_invocation_trace')
  && inventory.includes('fail-closed')
  && inventory.includes('privacy_deletion_target')
  && inventory.includes('0125')
  && inventory.includes('0124_rag_retrieval_acl_fail_closed.sql')
  && inventory.includes('MEMORY_VECTOR_CHUNK_DELETION_SINKS')
  && inventory.includes('context_compression_dispatch')
  && inventory.includes('无撤销函数')
  && inventory.includes('不绑定')
  && !inventory.includes('完整删除已完成'));

const checkBody = migration.match(/CHECK \(sink IN \(([\s\S]*?)\)\)/)?.[1] ?? '';
const checkSinks = [...checkBody.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
const domainUnion = [...new Set([
  ...PRIVACY_AUTHZ_SINK_KINDS,
  ...MEMORY_AUTHZ_SINK_KINDS,
  ...CONVERSATION_EVENT_SINKS,
  ...COMPRESSION_DELETION_SINKS,
  ...MEMORY_VECTOR_CHUNK_DELETION_SINKS,
])].sort();
A('0125 CHECK 与五套域 registry 并集逐值相等',
  checkSinks.join(',') === domainUnion.join(',')
  && checkSinks.includes('memory_vector_chunk'));
A('盘点列出 0125 CHECK 每一个 sink（文档与迁移枚举同步）',
  checkSinks.length > 0 && checkSinks.every((s) => inventory.includes(s)));

const runtimeTruth = read('ai-docs/architecture/current-runtime-truth.md');
A('运行时真相与 0125 同 sink，不把账户删除写成完成',
  runtimeTruth.includes('memory_vector_chunk')
  && runtimeTruth.includes('0125')
  && runtimeTruth.includes('user_memory')
  && runtimeTruth.includes('ai_invocation_trace')
  && runtimeTruth.includes('privacy-deletion-sink-inventory.md'));

const register = read('ai-docs/delivery/production-readiness-remediation-register.md');
A('登记册 PRD-TEST-015 写明 0125 已进回执且 user_memory 仍开',
  register.includes('memory_vector_chunk')
  && register.includes('0125')
  && register.includes('仍未进回执：`user_memory`')
  && register.includes('公开 DELETE 保持 503')
  && !register.includes('未覆盖 vector_chunk'));

const useCase = read('ai-docs/requirements/use-cases/privacy-deletion-sink-inventory.md');
A('用例 E6 与 purge 一致：completed 后再 purge 拒，不是再删 0 行',
  useCase.includes('memory_vector_chunk_target_request_not_active')
  && !useCase.includes('已 erased 再 purge 返回 0 删除'));

const privacy = read('apps/api/src/modules/privacy/privacy.service.ts');
A('公开删除入口仍 fail-closed（503 错误码未改）',
  privacy.includes("error: 'interview_erasure_authorization_not_available'")
  && privacy.includes("error: 'resume_erasure_migration_in_progress'")
  && privacy.includes('HttpStatus.SERVICE_UNAVAILABLE'));

console.log(fail === 0
  ? '\n✓ memory_vector_chunk 域/文档/公开入口 pin 通过（无库，releaseEvidence=false）'
  : `\n✗ ${fail} 个断言失败`);
process.exit(fail === 0 ? 0 : 1);
