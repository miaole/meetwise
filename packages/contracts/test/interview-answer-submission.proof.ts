/**
 * contracts prove:interview-answer-submission — INT-TRANSCRIPT-00 提交/回执合同冻结。
 *
 * 本包只冻结 future InterviewAnswerSubmission / receipt 行为形状，不登记进 apiContract，
 * 也不授权任何新的 01 canonical raw-answer HTTP 写入路径。同键同体是回放形状；同键异体
 * 冲突由服务端账本判定，契约层只保证两份回执都不能携带正文明文。
 */
import { randomUUID } from 'node:crypto';
import {
  InterviewAnswerSubmitResult, InterviewAnswerSubmissionReceipt, InterviewAnswerSubmissionStatus,
  apiContract,
} from '../src/index.ts';
import { buildOpenApiDocument } from '../src/openapi.ts';

let n = 0;
function ok(cond: boolean, msg: string) { if (!cond) { console.error('✗', msg); process.exit(1); } n++; }

const hmacA = 'a'.repeat(64);
const hmacB = 'b'.repeat(64);
const key = 'client-submission-key-1';
const interviewId = 'iv-1';
const questionId = 'q-v1-t0-c0';

const accepted = {
  interviewId,
  questionId,
  stateVersion: 1,
  clientSubmissionKey: key,
  canonicalBodyHmac: hmacA,
  privacyEpoch: 3,
  status: 'accepted_unscored' as const,
  replayed: false,
};
ok(InterviewAnswerSubmitResult.safeParse(accepted).success, '合法首次提交回执全过');
ok(InterviewAnswerSubmitResult.safeParse({ ...accepted, replayed: true }).success, '同键同体回放形状合法');
ok(!InterviewAnswerSubmitResult.safeParse({ ...accepted, status: 'scored' }).success, '首包禁止 scored 状态');
ok(!InterviewAnswerSubmitResult.safeParse({ ...accepted, answer: 'plaintext' }).success, '提交结果 strict 拒绝明文答案');
ok(!InterviewAnswerSubmitResult.safeParse({ ...accepted, canonicalBodyHmac: 'not-hex' }).success, 'body HMAC 非 64-hex 拒绝');
ok(!InterviewAnswerSubmitResult.safeParse({ ...accepted, clientSubmissionKey: '' }).success, '空 submission key 拒绝');

const receipt = {
  submissionId: randomUUID(),
  clientSubmissionKey: key,
  canonicalBodyHmac: hmacA,
  privacyEpoch: 3,
  status: 'accepted_unscored' as const,
  artifactId: randomUUID(),
};
ok(InterviewAnswerSubmissionReceipt.safeParse(receipt).success, '合法持久 receipt 全过');
ok(InterviewAnswerSubmissionReceipt.safeParse({ ...receipt, status: 'fenced' }).success, '删除围栏后 receipt 可为 fenced');
ok(!InterviewAnswerSubmissionReceipt.safeParse({ ...receipt, status: 'completed' }).success, 'receipt 禁止伪称 completed');
ok(!InterviewAnswerSubmissionReceipt.safeParse({ ...receipt, answer: 'plaintext', ciphertext: 'x' }).success,
  '持久 receipt 拒绝原文/密文键');
ok(InterviewAnswerSubmissionStatus.options.join(',') === 'accepted_unscored,fenced', 'submission 状态机仅 accepted_unscored|fenced');

const conflicting = { ...receipt, canonicalBodyHmac: hmacB };
ok(InterviewAnswerSubmissionReceipt.safeParse(conflicting).success,
  '同键异体在契约层仍是合法形状——冲突由服务端账本判定，不靠放宽 schema 吞掉');

const doc: any = buildOpenApiDocument();
ok(!apiContract.some((r) =>
  r.path.includes('/answers')
  || r.path.includes('submission')
  || r.id.toLowerCase().includes('canonical')
  || r.request === InterviewAnswerSubmitResult
  || r.response === InterviewAnswerSubmitResult
  || r.response === InterviewAnswerSubmissionReceipt),
  'submission/receipt 合同不登记进 apiContract');
ok(doc.paths['/interview/{id}/answers'] === undefined
  && doc.paths['/interview/{id}/submission'] === undefined
  && doc.paths['/interview/{id}/answer-artifact'] === undefined,
  '公开 OpenAPI 无 01 canonical raw write 路径');
ok(doc.paths['/interview/{id}/turn']?.post !== undefined, 'legacy /turn 仍是公开作答路径（INT-P0-RAW-QUEUE）');

console.log(`✓ contracts interview-answer-submission 全部通过(${n} 断言)`);
