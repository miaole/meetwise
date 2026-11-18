/**
 * 云前删除签发作业：复用 P-256 签验。不连数据库，不把请求标完成。
 * 运行：pnpm -C packages/domain exec tsx test/privacy-signer-job.proof.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  authorizeLiveDeletion,
  canonicalTargetSetDigest,
  generatePrivacyAuthzKeyPair,
  type LiveDeletionRequest,
  type SignerJobPorts,
  type VerifiedPrivacyAuthorization,
} from '../src/index.ts';

const ROOT = resolve(import.meta.dirname, '../../..');
const read = (rel: string) => readFileSync(resolve(ROOT, rel), 'utf8');

let fail = 0;
const A = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) fail += 1;
};

const hex = 'ab'.repeat(32);
const targets = [
  { sink: 'event', resourceHmac: hex },
  { sink: 'oss', resourceHmac: 'cd'.repeat(32) },
  { sink: 'redis', resourceHmac: 'ef'.repeat(32) },
  { sink: 'langfuse', resourceHmac: '01'.repeat(32) },
];
const digest = canonicalTargetSetDigest(targets.map((t) => ({ kind: t.sink, resource: t.resourceHmac })));
const nowSec = 1_700_000_000;
const keys = generatePrivacyAuthzKeyPair('local-signer-1');

function live(over: Partial<LiveDeletionRequest> = {}): LiveDeletionRequest {
  return {
    requestId: '11111111-1111-4111-8111-111111111111',
    owner: 'owner-a',
    subjectId: 'interview-1',
    scope: 'interview_data',
    privacyEpoch: 1,
    targetSetDigest: digest,
    targets,
    ...over,
  };
}

function ports(row: LiveDeletionRequest | null): { api: SignerJobPorts; issued: () => number; consumed: () => number } {
  const state = { issued: 0, consumed: 0, seen: new Set<string>() };
  return {
    issued: () => state.issued,
    consumed: () => state.consumed,
    api: {
      async load() { return row; },
      async issue(input) {
        if (state.seen.has(input.jti)) throw Object.assign(new Error('replay'), { code: 'privacy_authorization_snapshot_already_consumed' });
        state.seen.add(input.jti);
        state.issued += 1;
      },
      async consume(verified: VerifiedPrivacyAuthorization) {
        if (!state.seen.has(verified.jti)) throw Object.assign(new Error('missing'), { code: 'privacy_authorization_snapshot_not_found' });
        state.consumed += 1;
      },
    },
  };
}

const okPorts = ports(live());
const ok = await authorizeLiveDeletion(keys, live().requestId, okPorts.api, nowSec);
A('正常：活 digest 签发并消费，completed 恒假，外部仍 pending',
  ok.ok === true && ok.completed === false && ok.externalPending === true && okPorts.issued() === 1 && okPorts.consumed() === 1);

const driftPorts = ports(live({ targetSetDigest: '00'.repeat(32) }));
const drift = await authorizeLiveDeletion(keys, live().requestId, driftPorts.api, nowSec);
A('异常：目标集漂移不签发', drift.ok === false && drift.error === 'target_set_drift' && drift.completed === false && driftPorts.issued() === 0);

const barePorts = ports(live({ targets: [{ sink: 'event', resourceHmac: hex }], targetSetDigest: canonicalTargetSetDigest([{ kind: 'event', resource: hex }]) }));
const bare = await authorizeLiveDeletion(keys, live().requestId, barePorts.api, nowSec);
A('异常：没挂外部目标不签发', bare.error === 'external_targets_missing' && barePorts.issued() === 0 && bare.completed === false);

const noKey = await authorizeLiveDeletion(null, live().requestId, ports(live()).api, nowSec);
A('异常：无钥可重试且不完成', noKey.error === 'signer_key_unavailable' && noKey.retryable === true && noKey.completed === false);

const other = generatePrivacyAuthzKeyPair('other-kid-1');
const mismatchPorts = ports(live());
const mismatch = await authorizeLiveDeletion(
  { kid: keys.kid, privateKeyPem: other.privateKeyPem, publicJwk: keys.publicJwk },
  live().requestId,
  mismatchPorts.api,
  nowSec,
);
A('异常：公钥对不上私钥时不落账', mismatch.error === 'signer_verify_failed' && mismatchPorts.issued() === 0 && mismatch.completed === false);

const expired = await authorizeLiveDeletion(keys, live().requestId, ports(live()).api, nowSec, 0);
A('异常：超窗 ttl 拒签', expired.ok === false && expired.completed === false);

const cross = ports(live({ owner: 'owner-b' }));
const crossed = await authorizeLiveDeletion(keys, live().requestId, cross.api, nowSec);
A('异常：账本 owner 与调用方无关，仍按账本签，且不标完成', crossed.ok === true && crossed.completed === false);

const replayPorts = ports(live());
await authorizeLiveDeletion(keys, live().requestId, replayPorts.api, nowSec);
let replayThrew = false;
try {
  await replayPorts.api.consume({ jti: '00000000-0000-4000-8000-000000000099' } as VerifiedPrivacyAuthorization, 'privacy-signer');
} catch { replayThrew = true; }
A('异常：未知 jti 不能消费', replayThrew);

const jobSrc = read('packages/domain/src/privacy-signer-job.ts');
const verifyAt = jobSrc.indexOf('verifyPrivacyAuthorizationSnapshot');
const issueAt = jobSrc.indexOf('ports.issue');
const consumeAt = jobSrc.indexOf('ports.consume');
A('变异：去掉验签再落账会让源序断言变假', verifyAt >= 0 && issueAt > verifyAt && consumeAt > issueAt);
const stripped = jobSrc.replaceAll('verifyPrivacyAuthorizationSnapshot', 'skippedVerify');
A('变异：源码摘掉验签后同形断言为假', stripped.indexOf('verifyPrivacyAuthorizationSnapshot') < 0 && jobSrc.includes('verifyPrivacyAuthorizationSnapshot'));

const worker = read('apps/worker/src/privacy-erasure-worker.ts');
A('变异：worker 自行签发必须红', !worker.includes('signPrivacyAuthorizationSnapshot') && !worker.includes('PRIVACY_AUTHZ_PRIVATE_KEY'));
const api = read('apps/api/src/modules/profile/profile.service.ts');
const client = read('apps/api/src/modules/profile/deletion-signer-client.ts');
A('API 与客户端不持签发私钥', !api.includes('signPrivacyAuthorizationSnapshot') && !api.includes('PRIVACY_AUTHZ_PRIVATE_KEY') && !client.includes('PRIVACY_AUTHZ_PRIVATE_KEY'));
A('客户端失败也不标完成', client.includes('completed: false'));
const privacy = read('apps/api/src/modules/privacy/privacy.service.ts');
A('公开面试删除仍是 503', privacy.includes("error: 'interview_erasure_authorization_not_available'") && privacy.includes('SERVICE_UNAVAILABLE'));
const serve = read('scripts/privacy-signer-serve.ts');
A('签发进程只切 privacy_issuer，不切 worker', serve.includes('asPrivacyIssuer') && serve.includes('consumeAuthorizationSnapshotBound') && !serve.includes('SET LOCAL ROLE privacy_worker_executor') && !serve.includes('purgeInterviewProjectionTarget'));

const ok2 = fail === 0;
console.log(ok2 ? 'privacy-signer-job proof passed' : `failed ${fail}`);
process.exit(ok2 ? 0 : 1);
