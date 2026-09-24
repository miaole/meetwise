/**
 * G7 FreeTierOnly re-prove — INTEGRATION through openAICompatibleClient
 * (real client entry), mocked HTTP transport. No network. No live spend.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openAICompatibleClient } from '../src/model-client.ts';
import {
  isG7FreetierReproveEnabled,
  readG7SharedLedger,
} from '../src/g7-freetier-reprove-guard.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` :: ${detail}` : ''}`);
  if (!ok) failures += 1;
};
const errorOf = async (action: () => Promise<unknown>): Promise<string> => {
  try {
    await action();
    return 'no_error';
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
};

const MUTATED = [
  'NODE_ENV',
  'MODEL_TEST_TRANSPORT_OVERRIDES',
  'MODEL_COST_ENFORCEMENT',
  'MODEL_API_KEY',
  'MODEL_NAME',
  'MODEL_ENDPOINT_PROFILE',
  'G7_FREETIER_REPROVE',
  'G7_PAID_FALLBACK_ENABLED',
  'G7_RUN_COST_LEDGER_PATH',
  'G7_RUN_COST_CAP_CNY',
  'ALLOW_DEEPSEEK_V4_PRO_TEST',
] as const;

async function main() {
  const originalFetch = globalThis.fetch;
  const initial = new Map<string, string | undefined>(MUTATED.map((name) => [name, process.env[name]]));
  const ledgerDir = join(tmpdir(), `g7-ledger-${process.pid}`);
  mkdirSync(ledgerDir, { recursive: true });
  const ledgerPath = join(ledgerDir, 'run.ndjson');

  try {
    process.env.NODE_ENV = 'test';
    delete process.env.MODEL_TEST_TRANSPORT_OVERRIDES;
    delete process.env.MODEL_COST_ENFORCEMENT;
    process.env.MODEL_API_KEY = 'proof-g7-key';
    process.env.MODEL_ENDPOINT_PROFILE = 'dashscope-cn-beijing';
    process.env.G7_FREETIER_REPROVE = '1';
    process.env.G7_PAID_FALLBACK_ENABLED = '1';
    process.env.G7_RUN_COST_LEDGER_PATH = ledgerPath;
    process.env.G7_RUN_COST_CAP_CNY = '5';
    delete process.env.ALLOW_DEEPSEEK_V4_PRO_TEST;

    A('G7 flag enabled', isG7FreetierReproveEnabled(process.env));

    process.env.MODEL_NAME = 'deepseek-v4-pro';
    {
      const client = openAICompatibleClient();
      const msg = await errorOf(() => client.complete(
        { service: 'smoke', system: 'sys', userData: 'ping' },
        1,
      ));
      A('pro refused through openAICompatibleClient', msg.includes('g7_model_banned_without_approval'), msg);
    }

    process.env.MODEL_NAME = 'gpt-4o-mini';
    {
      const client = openAICompatibleClient();
      const msg = await errorOf(() => client.complete(
        { service: 'smoke', system: 'sys', userData: 'ping' },
        1,
      ));
      A('undeclared refused through openAICompatibleClient', msg.includes('g7_model_undeclared'), msg);
    }

    process.env.MODEL_NAME = 'qwen3.8-flash';
    writeFileSync(ledgerPath, '');
    let seenModelInBody: string | undefined;
    globalThis.fetch = (async (_input: Parameters<typeof fetch>[0] | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
      seenModelInBody = body.model;
      return new Response(JSON.stringify({
        model: 'qwen3.8-flash',
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 10, completion_tokens: 5 },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    {
      const client = openAICompatibleClient();
      const res = await client.complete({ service: 'smoke', system: 'sys', userData: 'ping' }, 1);
      A('free model dispatch ok', res.ok === true);
      A('request body used free model', seenModelInBody === 'qwen3.8-flash', String(seenModelInBody));
      A('actualModel on ModelResult', res.ok === true && (res as { actualModel?: string }).actualModel === 'qwen3.8-flash');
      const snap = readG7SharedLedger(process.env);
      A('ledger recorded one call', snap.calls.length === 1 && snap.calls[0]?.actualModel === 'qwen3.8-flash');
    }

    writeFileSync(ledgerPath, '');
    let calls = 0;
    globalThis.fetch = (async (_input: Parameters<typeof fetch>[0] | URL, init?: RequestInit) => {
      calls += 1;
      const body = JSON.parse(String(init?.body ?? '{}')) as { model?: string };
      if (calls === 1) {
        return new Response(JSON.stringify({
          code: 'AllocationQuota.FreeTierOnly',
          message: 'FreeTierOnly',
        }), { status: 403, headers: { 'content-type': 'application/json' } });
      }
      return new Response(JSON.stringify({
        model: body.model,
        choices: [{ message: { content: '{"ok":true}' } }],
        usage: { prompt_tokens: 11, completion_tokens: 6 },
      }), { status: 200, headers: { 'content-type': 'application/json' } });
    }) as typeof fetch;

    {
      const client = openAICompatibleClient();
      const res = await client.complete({ service: 'smoke', system: 'sys', userData: 'ping' }, 1);
      A('fallback dispatch ok', res.ok === true, res.ok ? '' : JSON.stringify(res));
      A('fallback actualModel is paid allowlist', res.ok === true && (res as { actualModel?: string }).actualModel === 'qwen-plus');
      const snap = readG7SharedLedger(process.env);
      const fb = snap.calls[0]?.fallback;
      A(
        'fallback reason recorded',
        fb?.triggerErrorClass === 'FreeTierOnly' && fb.fromModel === 'qwen3.8-flash' && fb.toModel === 'qwen-plus',
        JSON.stringify(fb),
      );
    }

    writeFileSync(ledgerPath, '');
    process.env.G7_RUN_COST_CAP_CNY = '0.0000001';
    process.env.MODEL_NAME = 'qwen-plus';
    globalThis.fetch = (async () => new Response(JSON.stringify({
      model: 'qwen-plus',
      choices: [{ message: { content: '{"ok":true}' } }],
      usage: { prompt_tokens: 1_000_000, completion_tokens: 1_000_000 },
    }), { status: 200, headers: { 'content-type': 'application/json' } })) as typeof fetch;
    {
      const client = openAICompatibleClient();
      const msg = await errorOf(() => client.complete(
        { service: 'smoke', system: 'sys', userData: 'ping' },
        1,
      ));
      A('cost cap stops through openAICompatibleClient', msg.includes('COST_CAP') || msg.includes('g7_cost_cap_exceeded'), msg);
    }
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of MUTATED) {
      const value = initial.get(name);
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    try { rmSync(ledgerDir, { recursive: true, force: true }); } catch { /* ignore */ }
  }

  console.log(failures === 0 ? '\nOK g7-freetier-reprove-client integration (mocked transport)' : `\nFAIL ${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

void main();
