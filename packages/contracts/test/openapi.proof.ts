/**
 * openapi:prove — 证明多端契约层:OpenAPI 文档从 zod 注册表生成、有效、全覆盖。
 * 真断言(非"能跑就行"):版本/路径/安全/请求响应 schema/路径参数/前端可复用同一 schema。
 */
import { z } from 'zod';
import { apiContract, AnswerDto, TurnDto } from '../src/index.ts';
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

// 4. 请求体 schema 从 zod 出(answer)
const ans = doc.paths['/interview/{id}/answer'].post;
const reqSchema = ans.requestBody?.content?.['application/json']?.schema;
ok(reqSchema?.type === 'object' && reqSchema.properties?.answer?.type === 'string', 'answer 请求体 schema 从 zod 生成');
ok(reqSchema.properties.answer.minLength === 1, 'zod min(1) 进 JSON Schema');
// 上下文封顶守护:新加的 .max(8000) 必须进文档 + 真校验(防将来误删封顶不被任何 gate 抓到)。
ok(reqSchema.properties.answer.maxLength === 8000, 'AnswerDto.answer 封顶 maxLength=8000 进文档');
ok(!AnswerDto.safeParse({ answer: 'x'.repeat(8001) }).success, 'AnswerDto 拒超上限(8001)');
const turnReq = doc.paths['/interview/{id}/turn'].post.requestBody?.content?.['application/json']?.schema;
ok(turnReq?.properties?.answer?.maxLength === 8000 && turnReq?.properties?.answer?.minLength === 1, 'TurnDto.answer 1..8000 进文档');
ok(turnReq?.properties?.turn?.type === 'integer', 'TurnDto.turn 为 integer');
ok(!TurnDto.safeParse({ turn: 0, answer: 'x'.repeat(8001) }).success && TurnDto.safeParse({ turn: 0, answer: 'ok' }).success, 'TurnDto 真校验:拒超上限/收合法');
ok(!('$schema' in reqSchema), '剥掉内联 $schema(OpenAPI 合规)');

// 5. 路径参数从 {id} 模板抽出
ok(Array.isArray(ans.parameters) && ans.parameters.some((p: any) => p.name === 'id' && p.in === 'path' && p.required), '路径参数 id 抽出');

// 6. 响应 schema(discriminatedUnion 也能转)
const ansResp = ans.responses['200'].content['application/json'].schema;
ok(!!ansResp && (ansResp.anyOf || ansResp.oneOf), 'answer 响应 union 进文档');

// 7. 前端复用同一 schema 真校验(单一真相验证)
ok(AnswerDto.safeParse({ answer: '我会用令牌桶限流' }).success, '前端用同一契约校验:合法通过');
ok(!AnswerDto.safeParse({ answer: '' }).success, '前端用同一契约校验:空答拒绝');

console.log(`✓ openapi:prove 全部通过(${n} 断言)`);
