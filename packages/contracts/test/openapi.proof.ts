/**
 * openapi:prove — 证明多端契约层:OpenAPI 文档从 zod 注册表生成、有效、全覆盖。
 * 真断言(非"能跑就行"):版本/路径/安全/请求响应 schema/路径参数/前端可复用同一 schema。
 */
import { z } from 'zod';
import { createHash, randomUUID } from 'node:crypto';
import { apiContract, AnswerDto, TurnDto, TranscribeDto, TranscribeResult, VOICE_CAPTURE_POLICY_VERSION, StartApplicationDto, FinalizeApplicationDto } from '../src/index.ts';
import { buildOpenApiDocument } from '../src/openapi.ts';

let n = 0;
function ok(cond: boolean, msg: string) { if (!cond) { console.error('✗', msg); process.exit(1); } n++; }

const doc: any = buildOpenApiDocument({ servers: ['http://localhost:8787'] });

// 1. 有效 OpenAPI 3.1 骨架
ok(doc.openapi === '3.1.0', 'openapi 版本 3.1.0');
ok(typeof doc.info?.title === 'string' && doc.info.version, 'info.title+version');
ok(doc.components?.securitySchemes?.bearerAuth?.scheme === 'bearer', 'bearer 安全方案');

// 2. 全覆盖:注册表每条都进 paths
for (const r of apiContract) {
  ok(!!doc.paths[r.path]?.[r.method], `路由进文档: ${r.method.toUpperCase()} ${r.path}`);
}
ok(Object.keys(doc.paths).length >= 10, 'paths 数量合理(≥10)');

// 3. auth 路由带 security,公开路由不带
const profile = doc.paths['/profile'].get;
ok(Array.isArray(profile.security) && profile.security[0].bearerAuth, '/profile 需 Bearer');
const products = doc.paths['/commerce/products'].get;
ok(!products.security, '/commerce/products 公开(无 security)');

// 4. 旧 /answer 不能以 OpenAPI 契约或通用 AnswerDto 重新进入生产路径。
ok(doc.paths['/interview/{id}/answer'] === undefined, 'legacy /answer 不在公开 OpenAPI；生产作答仅 /turn');
ok(!AnswerDto.safeParse({ answer: 'x'.repeat(8001) }).success, '历史 fixture AnswerDto 仍拒超上限(8001)');
const turnReq = doc.paths['/interview/{id}/turn'].post.requestBody?.content?.['application/json']?.schema;
ok(turnReq?.properties?.answer?.maxLength === 8000 && turnReq?.properties?.answer?.minLength === 1, 'TurnDto.answer 1..8000 进文档');
ok(turnReq?.properties?.turn?.type === 'integer', 'TurnDto.turn 为 integer');
ok(turnReq?.properties?.stateVersion?.type === 'integer', 'TurnDto.stateVersion 为 integer');
const validTurn = { questionId: 'q-v1-t0-c0', stateVersion: 1, answerId: randomUUID(), answer: 'ok', answerHash: createHash('sha256').update('ok').digest('hex'), turn: 0 };
ok(!TurnDto.safeParse({ ...validTurn, answer: 'x'.repeat(8001) }).success && TurnDto.safeParse(validTurn).success, 'TurnDto 真校验:拒超上限/收合法');
ok(!TurnDto.safeParse({ ...validTurn, answerHash: 'not-a-sha256' }).success, 'TurnDto 拒绝非 SHA-256 格式；正文一致性由服务端复算');
ok(!('$schema' in turnReq), '剥掉内联 $schema(OpenAPI 合规)');

// C→B P0：岗位申请的 start 需要真实 resume snapshot；finalize 不接收 client-controlled interviewId。
const appStartReq = doc.paths['/applications/{id}/start'].post.requestBody?.content?.['application/json']?.schema;
ok(appStartReq?.properties?.resumeId?.format === 'uuid', '岗位面试 start 必须携带 UUID resumeId');
ok(StartApplicationDto.safeParse({ resumeId: randomUUID() }).success && !StartApplicationDto.safeParse({ resumeId: 'history-interview' }).success, 'StartApplicationDto 拒绝把任意字符串当简历快照');
const appFinalizeReq = doc.paths['/applications/{id}/finalize'].post.requestBody?.content?.['application/json']?.schema;
ok(appFinalizeReq?.additionalProperties === false && FinalizeApplicationDto.safeParse({}).success, 'finalize 只接受空命令体，由服务端反查绑定');
ok(!FinalizeApplicationDto.safeParse({ interviewId: 'iv_historical_training' }).success, 'finalize 拒绝客户端注入历史 interviewId');

// 4b. 语音安全边界：当前产品只允许用户明确同意的“本机单轨”片段转写。
// 不允许调用方伪称双人电话、远端轨或已完成说话人分离；这些能力尚未接入时必须在契约层 fail-closed。
const transcribeReq = doc.paths['/interview/{id}/transcribe'].post.requestBody?.content?.['application/json']?.schema;
const validSingleTrack = {
  audioBase64: 'AAAA',
  mimeType: 'audio/webm',
  capture: { mode: 'single_local_microphone', consent: true, policyVersion: VOICE_CAPTURE_POLICY_VERSION },
};
ok(transcribeReq?.properties?.capture?.properties?.mode?.const === 'single_local_microphone', '转写契约仅公开 single_local_microphone，不把本机麦克风伪装为电话/双轨');
ok(TranscribeDto.safeParse(validSingleTrack).success, '显式同意的单人本机录音可转写');
ok(!TranscribeDto.safeParse({ ...validSingleTrack, capture: { ...validSingleTrack.capture, consent: false } }).success, '未同意录音 → 契约拒绝（fail-closed）');
ok(!TranscribeDto.safeParse({ ...validSingleTrack, capture: { ...validSingleTrack.capture, mode: 'two_participant_call' } }).success, '双人电话/远端轨声明 → 契约拒绝（能力未接入不得降级伪称支持）');
ok(!TranscribeDto.safeParse({ ...validSingleTrack, audioBase64: 'not base64!' }).success, '畸形 base64 在模型调用前被拒');
ok(!TranscribeDto.safeParse({ ...validSingleTrack, mimeType: 'audio/x-untrusted' }).success, '未知音频 MIME 在模型调用前被拒');
ok(TranscribeResult.safeParse({
  text: '仅有一段本机麦克风转写',
  capture: { mode: 'single_local_microphone', speakerAttribution: 'not_diarized', wordTimestamps: 'not_available' },
}).success, '转写响应明确标注无说话人分离/逐词时间戳，避免消费端作出错误归因');

// 5. /turn 路径参数从 {id} 模板抽出，且前端只能复用该正式契约。
ok(Array.isArray(doc.paths['/interview/{id}/turn'].post.parameters)
  && doc.paths['/interview/{id}/turn'].post.parameters.some((p: any) => p.name === 'id' && p.in === 'path' && p.required), 'turn 路径参数 id 抽出');
ok(TurnDto.safeParse(validTurn).success, '前端用同一 TurnDto 契约校验:合法通过');
ok(!TurnDto.safeParse({ ...validTurn, answer: '' }).success, '前端用同一 TurnDto 契约校验:空答拒绝');

console.log(`✓ openapi:prove 全部通过(${n} 断言)`);
