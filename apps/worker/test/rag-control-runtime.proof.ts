import { initializeRagControlStartup } from '../src/rag-control-runtime.ts';

let failures = 0;
function A(name: string, value: boolean): void {
  console.log(`${value ? 'PASS' : 'FAIL'}  ${name}`);
  if (!value) failures++;
}

type FakePool = { end: () => Promise<void> };

function fakeDeps(events: string[], failAt?: 'identity' | 'ownership') {
  const pool: FakePool = { end: async () => { events.push('end'); } };
  return {
    pool,
    deps: {
      createPool: ({ connectionString }: { connectionString: string }) => {
        events.push(`pool:${connectionString}`);
        return pool as never;
      },
      assertIdentity: async () => {
        events.push('identity');
        if (failAt === 'identity') throw new Error('rag_control_identity_invalid');
      },
      assertDefinerOwnership: async () => {
        events.push('ownership');
        if (failAt === 'ownership') throw new Error('rag_control_definer_ownership_invalid');
      },
    },
  };
}

const absentEvents: string[] = [];
const absent = await initializeRagControlStartup({}, fakeDeps(absentEvents).deps);
A('未挂载通用 RAG control URL 时不创建连接或伪装启用 rebuild worker', absent === undefined && absentEvents.length === 0);

const successEvents: string[] = [];
const successFake = fakeDeps(successEvents);
const started = await initializeRagControlStartup({ RAG_CONTROL_DATABASE_URL: 'postgresql://rag-control.example/rag' }, successFake.deps);
A('挂载 control URL 时先校验低权登录再校验 definer/RLS manifest', started === (successFake.pool as never) && successEvents.join(',') === 'pool:postgresql://rag-control.example/rag,identity,ownership');

const identityEvents: string[] = [];
await initializeRagControlStartup({ RAG_CONTROL_DATABASE_URL: 'postgresql://wrong.example/rag' }, fakeDeps(identityEvents, 'identity').deps)
  .then(() => A('错误 runtime/migration control URL 必须拒绝', false), (error: unknown) =>
    A('错误 runtime/migration control URL 必须拒绝', error instanceof Error && error.message === 'rag_control_identity_invalid' && identityEvents.join(',') === 'pool:postgresql://wrong.example/rag,identity,end'));

const definerEvents: string[] = [];
await initializeRagControlStartup({ RAG_CONTROL_DATABASE_URL: 'postgresql://drift.example/rag' }, fakeDeps(definerEvents, 'ownership').deps)
  .then(() => A('函数所有权或 RLS 漂移必须拒绝并关闭连接', false), (error: unknown) =>
    A('函数所有权或 RLS 漂移必须拒绝并关闭连接', error instanceof Error && error.message === 'rag_control_definer_ownership_invalid' && definerEvents.join(',') === 'pool:postgresql://drift.example/rag,identity,ownership,end'));

console.log(`\n${failures === 0 ? '✓ generic RAG control startup guard proof passed' : `✗ ${failures} failures`}`);
process.exit(failures ? 1 : 0);
