/**
 * contracts prove:privacy-authorization — M6：契约 schema 对合法/非法 claims 的真断言。
 *
 * `PrivacyAuthorizationSnapshot` 是删除授权快照(JWS payload)线上形状的单一真相；domain
 * 的 sign/verify 与这里共用同一份字段名/类型/长度/枚举契约。本 proof 把这些约束逐条钉死
 * （合法全过、非法全拒），防“契约/domain 两份手写真相”漂移——任一约束在契约侧被放宽/
 * 收紧，都会在这里显式失败（fail-closed），而不是等生产端才暴露。
 */
import { randomUUID } from 'node:crypto';
import {
  PrivacyAuthorizationSnapshot, PrivacyAuthzPurpose, PRIVACY_AUTHZ_ISSUER, PRIVACY_AUTHZ_AUDIENCE,
} from '../src/index.ts';

let n = 0;
function ok(cond: boolean, msg: string) { if (!cond) { console.error('✗', msg); process.exit(1); } n++; }

const NOW = Math.floor(Date.now() / 1000);
const legal = {
  iss: PRIVACY_AUTHZ_ISSUER,
  aud: PRIVACY_AUTHZ_AUDIENCE,
  jti: randomUUID(),
  iat: NOW,
  exp: NOW + 600,
  issuerId: PRIVACY_AUTHZ_ISSUER,
  keyId: 'privacy-del-2026-01',
  actor: 'user-1',
  owner: 'user-1',
  interview: 'iv-1',
  purpose: 'interview_data_erasure',
  privacyEpoch: 3,
  targetSetDigest: '1'.repeat(64),
};

// 合法 claims 全过（字段名/类型/长度/枚举与 domain claims 形状一一对应）。
ok(PrivacyAuthorizationSnapshot.safeParse(legal).success, '合法 claims 全过');

// 非法 claims 全拒（fail-closed，逐字段 pin 死）。
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, iss: 'forged-iss' }).success, 'iss 漂移拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, aud: 'forged-aud' }).success, 'aud 漂移拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, issuerId: 'forged-issuer' }).success, 'issuerId 漂移拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, jti: 'not-a-uuid' }).success, 'jti 非 uuid 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, keyId: 'bad key!' }).success, '非法 keyId 格式拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, actor: '' }).success, '空 actor 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, actor: 'x'.repeat(129) }).success, '超长 actor(129>128) 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, purpose: 'forged_purpose' }).success, '非法 purpose 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, privacyEpoch: 0 }).success, 'privacyEpoch<=0 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, privacyEpoch: 1.5 }).success, 'privacyEpoch 非整数拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, targetSetDigest: 'not-hex' }).success, 'targetSetDigest 非 64-hex 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, iat: 0 }).success, 'iat<=0 拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, exp: 1.5 }).success, 'exp 非整数拒绝');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, extra: true }).success, 'strict 拒绝额外键');
ok(!PrivacyAuthorizationSnapshot.safeParse({ ...legal, purpose: undefined }).success, '缺 purpose 拒绝');

// purpose 三枚举完整（当前 DB 只签发 interview_data_erasure，其余为 MEM-00/后续复用预留）。
ok(PrivacyAuthzPurpose.safeParse('interview_data_erasure').success
  && PrivacyAuthzPurpose.safeParse('resume_data_erasure').success
  && PrivacyAuthzPurpose.safeParse('account_data_erasure').success
  && !PrivacyAuthzPurpose.safeParse('resume_quiz').success, 'purpose 三枚举自洽、第四值拒绝');

console.log(`✓ contracts privacy-authorization 全部通过(${n} 断言)`);
