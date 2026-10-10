/**
 * DBID-1 · post-dual 席2 · API 层 begin 守卫冒烟（子进程执行体）。
 *
 * 由 packages/db/test/db-id-v7.proof.ts P8 spawn（tsx --tsconfig=nest.json：apps/api 源的
 * 参数装饰器需 experimentalDecorators，packages/db 主 tsconfig 不开、也不能把 apps/api
 * 拖进主 tsc 程序——故本文件置于 scripts/（include=["src","test"] 之外）+ 独立转译配置）。
 *
 * 断言（真实 InterviewService.prototype.begin 方法 · 守卫逻辑零改动 · 仅 IO 边界桩）：
 *   S1 v7 形态 resumeId 穿 UUID_RE 守卫抵达 db.asPrincipal 面（席2 真雷正门）
 *   S2 垃圾 resumeId → HttpException invalid_resume_id（负门 fail-closed 保持）
 *   S3 v4 resumeId 仍过门（表内 v4/v7 并存终态回归面）
 * 输出行 `S1 PASS|FAIL ...` / `SMOKE_RESULT failures=N`；EXIT=N（0 才过）。
 */
import { fileURLToPath } from 'node:url';

interface GuardStubDb { asPrincipal: () => Promise<symbol>; }
type AnyRec = Record<string, unknown>;

async function main(): Promise<void> {
  const { InterviewService } = await import(fileURLToPath(new URL('../../../apps/api/src/modules/interview/interview.service.ts', import.meta.url)));
  const { newUuidV7 } = await import(fileURLToPath(new URL('../src/ids.ts', import.meta.url)));

  let failures = 0;
  const S = (name: string, ok: boolean) => { console.log(`S ${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

  const GUARD_PASSED = Symbol('dbid1_guard_passed');
  const svc = Object.create(InterviewService.prototype) as InstanceType<typeof InterviewService>;
  (svc as unknown as AnyRec).denyPublicPreviewWrite = () => undefined;                 // preview 门桩（不在刀面）
  (svc as unknown as AnyRec).db = { asPrincipal: async () => { throw GUARD_PASSED; } } satisfies GuardStubDb;  // IO 边界桩
  const reachesDb = async (resumeId: string): Promise<boolean> => {
    try { await svc.begin('dbid1-owner', 'iv-dbid1-guard', resumeId); return false; }
    catch (e) { return (e as symbol) === GUARD_PASSED; }
  };

  S('S1 v7 resumeId 穿 begin() UUID_RE 守卫抵达 db 面（真实方法）', await reachesDb(newUuidV7()));
  let negCode = '';
  try { await svc.begin('dbid1-owner', 'iv', 'not-a-uuid'); }
  catch (e) { negCode = (e as { getResponse?: () => { error?: string } }).getResponse?.()?.error ?? ''; }
  S('S2 垃圾 resumeId → invalid_resume_id（负门 fail-closed 保持）', negCode === 'invalid_resume_id');
  S('S3 v4 resumeId 仍过门（v4/v7 并存终态回归面）', await reachesDb('017f22e2-79b0-4cc3-98c4-dc0c0c07398f'));

  console.log(`SMOKE_RESULT failures=${failures}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e: unknown) => { console.error('SMOKE_CRASH', e); process.exit(1); });
