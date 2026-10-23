/**
 * 采样温度 proof。本地 http 脚本 provider（NODE_ENV=test + MODEL_TEST_TRANSPORT_OVERRIDES=1）
 * + 隔离 PG 全链 invoke。零真实 provider 外呼。
 *
 * 四臂：
 *  A：route-classify 与 resume.vision 请求体温度为 0；interviewer.ask 不写 temperature；
 *    mock-interview.evaluate 在环境变量缺省时为 0.2。
 *  B：直接调用 resolver。非法值抛 model_eval_temperature_invalid；未设置与空串为 0.2；
 *    0 / 0.1 / 2 保持原值。空串按缺省，不再变成 0。
 *  C：SERVICE_TEMPERATURE 恰 5 键；生成性三键不在表内；resolver 恰一处导出；semantic-route 未改。
 *  D：摘要仍写入 temperature。不新造迁移。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool } from '@meetwise/db';
import type { ModelCostPolicy } from '../src/index.ts';

process.env.NODE_ENV = 'test';
process.env.MODEL_TEST_TRANSPORT_OVERRIDES = '1';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const answerSchema = z.object({ answer: z.string().min(1) });
const okBody = '{"choices":[{"message":{"content":"{\\"answer\\":\\"ok\\"}"}}],"usage":{"prompt_tokens":11,"completion_tokens":7}}';
const spreadNeedle = '...(SERVICE_TEMPERATURE[req.service] !== undefined ? { temperature: SERVICE_TEMPERATURE[req.service] } : {}),';
const digestNeedle = 'temperature: SERVICE_TEMPERATURE[req.service] ?? null,';
const exportNeedle = 'export function resolveEvalTemperatureOverride';
const generativeKeys = ['interviewer.ask', 'resume-quiz.generate', 'report.generate'] as const;
const expectedKeys = [
  'mock-interview.evaluate',
  'planner.competencies',
  'resume-diagnosis.generate',
  'job.route-classify.v1',
  'resume.vision',
] as const;

let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);
const count = (src: string, needle: string) => src.split(needle).length - 1;
const git = (args: string[]) => execFileSync('git', ['--no-pager', ...args], { cwd: repoRoot, encoding: 'utf8' });

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

interface ScriptedProvider {
  port: number;
  bodies: Record<string, unknown>[];
  close: () => Promise<void>;
}

function startScriptedProvider(): Promise<ScriptedProvider> {
  const bodies: Record<string, unknown>[] = [];
  const server = http.createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on('data', (chunk: Buffer | string) => {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    });
    request.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      let parsed: Record<string, unknown> = {};
      try {
        const value: unknown = JSON.parse(raw);
        if (isRecord(value)) parsed = value;
      } catch {
        parsed = {};
      }
      bodies.push(parsed);
      response.setHeader('content-type', 'application/json');
      response.writeHead(200);
      response.end(okBody);
    });
  });
  return new Promise((resolveServer) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address !== null && typeof address === 'object' ? address.port : 0;
      resolveServer({
        port,
        bodies,
        close: () => new Promise<void>((done) => {
          server.close(() => done());
        }),
      });
    });
  });
}

function temperatureEnv(raw: string | undefined, present: boolean): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {};
  if (present) env['MODEL_EVAL_TEMPERATURE'] = raw;
  return env;
}

function temperatureMapKeys(src: string): string[] {
  const start = src.indexOf('const SERVICE_TEMPERATURE: Record<string, number> = {');
  const end = start < 0 ? -1 : src.indexOf('\n};', start);
  if (start < 0 || end < 0) return [];
  const block = src.slice(start, end);
  return [...block.matchAll(/^\s*'([^']+)':/gm)].map((match) => match[1] ?? '');
}

async function main(): Promise<number> {
  delete process.env.MODEL_EVAL_TEMPERATURE;
  const { invoke, modelFor, openAICompatibleClient, recordingTracer, setTracer } = await import('../src/index.ts');
  const { resolveEvalTemperatureOverride } = await import('../src/model-client.ts');
  const pool = createPool();
  const tracer = recordingTracer();
  setTracer(tracer);
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const owner = `ag18-owner-${suffix}`;
  const scope = `ag18-scope-${suffix}`;
  const provider = `ag18-provider-${suffix}`;
  const modelName = 'ag18-echo';
  const region = 'cn-proof';
  const revision = 'ag18-r1';
  const policy: ModelCostPolicy = {
    scopeId: scope,
    provider,
    model: modelName,
    region,
    priceRevision: revision,
    maxInputTokens: 1000,
    maxOutputTokens: 500,
    contextWindowTokens: 2000,
    contextEstimator: 'utf8-bytes-v1',
    contextSafetyMarginTokens: 64,
  };
  let echo: ScriptedProvider | undefined;
  try {
    await assertIsolatedTestTarget(pool);
    await pool.query(
      `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
       VALUES($1,$2,$3,$4,1000000,1000000,'https://example.test/ag18',clock_timestamp())`,
      [provider, modelName, region, revision],
    );
    await pool.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,1000000,true)', [scope]);
    echo = await startScriptedProvider();
    const scripted = echo;
    const client = openAICompatibleClient({
      baseUrl: `http://127.0.0.1:${scripted.port}`,
      apiKey: 'test',
      model: modelName,
      costPolicy: policy,
    });
    const send = async (service: string, key: string) => {
      scripted.bodies.length = 0;
      tracer.spans.length = 0;
      const outcome = await invoke({
        idempotencyKey: key,
        operation: { id: 'interview.answer-scoring.v1', businessRevision: `ag18:${key}` },
        schema: answerSchema,
        businessValidate: () => null,
        model: modelFor(client, { service, system: 'sampling proof', userData: 'payload' }),
      }, pool, owner);
      return { outcome, body: scripted.bodies[0] };
    };

    section('A. 请求体温度：约束性为 0，生成性不写键，评价缺省 0.2');
    const route = await send('job.route-classify.v1', `ag18:route:${suffix}`);
    check(`route-classify 成功且 temperature===0（实际 ${String(route.body?.temperature)}）`,
      'value' in route.outcome && route.outcome.value.answer === 'ok' && route.body?.temperature === 0);
    const vision = await send('resume.vision', `ag18:vision:${suffix}`);
    check(`resume.vision 成功且 temperature===0（实际 ${String(vision.body?.temperature)}）`,
      'value' in vision.outcome && vision.outcome.value.answer === 'ok' && vision.body?.temperature === 0);
    const ask = await send('interviewer.ask', `ag18:ask:${suffix}`);
    check('interviewer.ask 成功且 body 没有 temperature 键',
      'value' in ask.outcome && ask.outcome.value.answer === 'ok'
      && ask.body !== undefined && Object.hasOwn(ask.body, 'temperature') === false);
    const evaluated = await send('mock-interview.evaluate', `ag18:eval:${suffix}`);
    check(`mock-interview.evaluate 缺省 temperature===0.2（实际 ${String(evaluated.body?.temperature)}）`,
      'value' in evaluated.outcome && evaluated.outcome.value.answer === 'ok' && evaluated.body?.temperature === 0.2);

    section('B. resolver：非法值失败，缺省 0.2，边界保留原值');
    const throwsInvalid = (raw: string) => {
      try {
        resolveEvalTemperatureOverride(temperatureEnv(raw, true));
        return false;
      } catch (error: unknown) {
        return error instanceof Error && error.message === 'model_eval_temperature_invalid';
      }
    };
    for (const raw of ['abc', 'NaN', 'Infinity', '-1', '3']) {
      check(`'${raw}' 抛 model_eval_temperature_invalid`, throwsInvalid(raw));
    }
    check('undefined 得 0.2', resolveEvalTemperatureOverride(temperatureEnv(undefined, false)) === 0.2
      && resolveEvalTemperatureOverride(temperatureEnv(undefined, true)) === 0.2);
    check('空串得 0.2（按缺省，不再是 0）', resolveEvalTemperatureOverride(temperatureEnv('', true)) === 0.2);
    check("'0' 得 0", resolveEvalTemperatureOverride(temperatureEnv('0', true)) === 0);
    check("'0.1' 得 0.1", resolveEvalTemperatureOverride(temperatureEnv('0.1', true)) === 0.1);
    check("'2' 得 2", resolveEvalTemperatureOverride(temperatureEnv('2', true)) === 2);

    section('C. 温度表恰 5 键，生成性不在表内，resolver 只导出一次，semantic-route 未改');
    const modelSrc = readFileSync(new URL('../src/model-client.ts', import.meta.url), 'utf8');
    const indexSrc = readFileSync(new URL('../src/index.ts', import.meta.url), 'utf8');
    const semanticSrc = readFileSync(new URL('../src/router/semantic-route.ts', import.meta.url), 'utf8');
    const keys = temperatureMapKeys(modelSrc);
    check(`SERVICE_TEMPERATURE 恰 5 键（${keys.join(',')}）`,
      keys.length === 5 && expectedKeys.every((key, index) => keys[index] === key));
    check('生成性三键不在温度表', generativeKeys.every((key) => !keys.includes(key)));
    check('resolver 恰一处导出且入口未再导出',
      count(modelSrc, exportNeedle) === 1 && !indexSrc.includes('resolveEvalTemperatureOverride'));
    check('评价温度走 resolver，规划 0.2 与诊断 0.3 原值仍在',
      modelSrc.includes("'mock-interview.evaluate': resolveEvalTemperatureOverride(process.env),")
      && count(modelSrc, "'planner.competencies': 0.2,") === 1
      && count(modelSrc, "'resume-diagnosis.generate': 0.3,") === 1
      && count(modelSrc, 'Number(process.env.MODEL_EVAL_TEMPERATURE ?? 0.2)') === 0);
    check('展开位全文件恰 2 处且字节未改', count(modelSrc, spreadNeedle) === 2);
    const semanticDiff = git(['diff', '--name-only', 'HEAD', '--', 'packages/ai-runtime/src/router/semantic-route.ts']).trim();
    check('semantic-route.ts 未改',
      semanticDiff === ''
      && !semanticSrc.includes('resolveEvalTemperatureOverride')
      && !semanticSrc.includes('SERVICE_TEMPERATURE'));

    section('D. 摘要仍写入 temperature，且没有新迁移');
    check('digest 仍写入 temperature（?? null 臂恰 1 处）', count(modelSrc, digestNeedle) === 1);
    const porcelain = git(['status', '--porcelain']);
    const migrationLines = porcelain.split('\n').filter((line) => line.includes('.sql') || line.includes('packages/db/migrations/'));
    check('未新造迁移', migrationLines.length === 0);
  } finally {
    if (echo) await echo.close();
    await pool.end();
  }
  console.log(failures === 0
    ? '\n✓ 采样温度四臂全部通过（隔离库·零外呼）'
    : `\n✗ ${failures} 项失败`);
  return failures;
}

main().then((failures) => {
  process.exit(failures === 0 ? 0 : 1);
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'sampling_temperature_proof_failed');
  process.exit(1);
});
