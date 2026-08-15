/**
 * 从 `apiContract` 注册表生成 OpenAPI 3.1 文档——用 zod4 原生 `z.toJSONSchema`(零外部依赖)。
 * OpenAPI 3.1 的 schema 对象就是 JSON Schema 2020-12,与 z.toJSONSchema 输出对齐(剥掉内联 $schema 即可)。
 * 这份生成物是**多端正式契约**:异构端(原生/小程序)据此 codegen;永不漂移(从同一 zod 编出)。
 */
import { z } from 'zod';
import { apiContract, type ContractRoute } from './index.ts';

function jsonSchema(s: z.ZodType): Record<string, unknown> {
  const js = z.toJSONSchema(s) as Record<string, unknown>;
  delete js.$schema;                       // OpenAPI 不要内联 $schema
  return js;
}

function operation(r: ContractRoute): Record<string, unknown> {
  const op: Record<string, unknown> = { operationId: r.id, summary: r.summary, tags: r.tags };
  if (r.auth) op.security = [{ bearerAuth: [] }];
  // 路径参数(从 {id} 模板抽)
  const params = [...r.path.matchAll(/\{(\w+)\}/g)].map((m) => ({ name: m[1], in: 'path', required: true, schema: { type: 'string' } }));
  if (params.length) op.parameters = params;
  if (r.request) op.requestBody = { required: true, content: { 'application/json': { schema: jsonSchema(r.request) } } };
  op.responses = r.response
    ? { '200': { description: 'ok', content: { 'application/json': { schema: jsonSchema(r.response) } } } }
    : { '200': { description: 'ok' } };
  return op;
}

export function buildOpenApiDocument(opts?: { version?: string; servers?: string[] }): Record<string, unknown> {
  const paths: Record<string, Record<string, unknown>> = {};
  for (const r of apiContract) {
    (paths[r.path] ??= {})[r.method] = operation(r);
  }
  return {
    openapi: '3.1.0',
    info: { title: 'Meetwise API', version: opts?.version ?? '0.1.0', description: 'Meetwise 知面 多端契约(zod 生成)。' },
    servers: (opts?.servers ?? ['/']).map((url) => ({ url })),
    tags: [...new Set(apiContract.flatMap((r) => r.tags))].map((name) => ({ name })),
    components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer' } } },
    paths,
  };
}
