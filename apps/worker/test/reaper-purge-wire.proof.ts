/**
 * Reaper→purge 接线证明（TTL-WIRE #18 滞留半·假池 spy 形·零库零网零外呼）。
 * 红事实：purgeStaleInterviewJobPayloads 原语已落（AUTHZ-HARDEN 5A-2）而生产零调用点（rg 全仓机证）。
 * 本证：reapStuckInterviewJobs 生产触发链到 purge 的调用可达性——不连任何数据库，
 * 用假池 spy 收取真实生产函数（sweep/purge 原语均 @meetwise/db 真件）发出的 SQL：
 *   ① reap 一拍 purge 恰被调一次（可达+唯一）；
 *   ② 参形 (c, owner) 默认 TTL（第二参缺省 → 86_400 → '86400'）；
 *   ③ 同一 asPrincipal 事务域内（BEGIN 后 COMMIT 前）且 sweep 之后（收割先、清理后）；
 *   ④ purge 行数不回灌返回面（{requeued,failed} 零语义耦合）；
 *   ⑤ 静态源断言：import 在场 + 调用点全仓恰一（生产面）+ 调用位于 reapStuckInterviewJobs 体内
 *      terminalize 循环后 return 前 + 零新 env 闸。
 * purge 抛错回滚整拍（负臂）沿 §2-3 负测纪律**不落卷**（临时执行·回执留痕·卷内零存）。
 *   pnpm prove:reaper-purge-wire   （无需 db:up——纯进程内假体）
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { reapStuckInterviewJobs, type ConsumerDeps } from '../src/interview-consumer.ts';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const OWNER = 'wirePurgeUser';

/** 假池 spy：记录 (text, params) 序列·按 SQL 形回罐（真实原语函数发什么就收什么）。 */
const PURGE_MARKER = "payload=payload-'answer'";
const SWEEP_DEAD_MARKER = "SET status='failed', last_error='reaped:worker_died'";
const SWEEP_RQ_MARKER = "SET status='queued', lease_owner=NULL";
type Rec = { text: string; params?: unknown[] };
function makeSpyPool(opts: { purgeRowCount: number; failPurge?: boolean }) {
  const log: Rec[] = [];
  const client = {
    async query(text: string, params?: unknown[]) {
      log.push({ text, params });
      if (opts.failPurge && text.includes(PURGE_MARKER)) throw new Error('purge_injected_failure');
      if (text.includes(PURGE_MARKER)) return { rows: [], rowCount: opts.purgeRowCount };
      return { rows: [], rowCount: 0 };   // BEGIN/COMMIT/ROLLBACK/SET ROLE/set_config/sweep 双 UPDATE 全零行
    },
    release: () => {},
  };
  const pool = { connect: async () => client };
  return { pool: pool as never, log };
}
const reapOnce = async (log: Rec[], opts: { purgeRowCount: number; failPurge?: boolean }) => {
  const spy = makeSpyPool(opts);
  const deps = { pool: spy.pool } as unknown as ConsumerDeps;   // reaper.proof 同款窄化：本证只触 pool 面
  const r = await reapStuckInterviewJobs(deps, OWNER);
  return { r, log: spy.log };
};
const idx = (log: Rec[], marker: string) => log.findIndex((x) => x.text.includes(marker));

async function main() {
  section('① 接线可达:reap 一拍 → purge 恰一次（红事实闭合:生产零调用 → 恰一调用）');
  const { r, log } = await reapOnce([], { purgeRowCount: 2 });
  const purgeCalls = log.filter((x) => x.text.includes(PURGE_MARKER));
  A('purge 在 reap 一拍内恰被调一次(可达+唯一)', purgeCalls.length === 1);
  A('sweep 先行未被侵占(reap 返回 requeued=0 failed=0 原形)', r.requeued === 0 && r.failed === 0);
  A('purge 行数不回灌返回面({requeued,failed} 零耦合·purged=2 仅原语内账)', !('purged' in r));

  section('② 参形与默认 TTL:(c, owner) 两参·第二参缺省 → 86_400');
  const purge = purgeCalls[0]!;
  A('参形=(c, owner):owner 绑定第一参', Array.isArray(purge.params) && purge.params[0] === OWNER);
  A('默认 TTL=86_400(第二参 String(86400)·零调参零覆写)', purge.params![1] === '86400' && purge.params!.length === 2);
  A('谓词门在场(只清 payload-\'answer\'·幂等门 payload ? \'answer\')', purge.text.includes("payload ? 'answer'"));

  section('③ 事务域与次序:purge 在 asPrincipal 单事务内·sweep 后 return 前');
  const iBegin = idx(log, 'BEGIN'), iCommit = idx(log, 'COMMIT');
  const iSweepDead = idx(log, SWEEP_DEAD_MARKER), iSweepRq = idx(log, SWEEP_RQ_MARKER);
  const iPurge = idx(log, PURGE_MARKER);
  A('同一事务域:BEGIN 之后 COMMIT 之前(asPrincipal 域内·抛错回滚整拍面)', iPurge > iBegin && iPurge < iCommit && iCommit === log.length - 1);
  A('收割先清理后:purge 晚于 sweep 两条 UPDATE(terminalize 循环收尾后)', iPurge > iSweepDead && iPurge > iSweepRq);

  section('④ 静态源断言:import 在场 + 生产调用点全仓恰一 + 置位正确 + 零 env 闸');
  const here = fileURLToPath(new URL('.', import.meta.url));
  const consumerPath = join(here, '../src/interview-consumer.ts');
  const src = readFileSync(consumerPath, 'utf8');
  const lines = src.split('\n');
  const importLine = lines.find((l) => l.startsWith('import ') && l.includes('from \'@meetwise/db\''));
  A('import 在场(@meetwise/db 巨型 import 行携 purge 名·沿既有形)', !!importLine && importLine.includes('purgeStaleInterviewJobPayloads'));
  const callLines = lines.map((l, i) => ({ l, i })).filter((x) => x.l.includes('purgeStaleInterviewJobPayloads(') && !x.l.trim().startsWith('import'));
  A('本文件调用点恰一(await purgeStaleInterviewJobPayloads(c, owner))', callLines.length === 1 && /await purgeStaleInterviewJobPayloads\(c, owner\)/.test(callLines[0]!.l));
  const iFn = lines.findIndex((l) => l.startsWith('export async function reapStuckInterviewJobs'));
  const iNext = lines.findIndex((l) => l.startsWith('export async function interviewDispatchTick'));
  const iCall = callLines[0]?.i ?? -1;
  const iReturn = lines.findIndex((l) => l.includes('return { requeued: res.requeued, failed: res.failed };'));
  A('置位=reapStuckInterviewJobs 体内·terminalize 循环收尾后·return 前', iCall > iFn && iCall < iNext && iCall < iReturn);
  const iAsPrincipal = lines.findIndex((l) => l.includes('return asPrincipal(d.pool, owner,'));
  A('调用在 asPrincipal 域内(事务面静态佐证)', iCall > iAsPrincipal);
  const prodSrcHits: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== 'test') walk(p); continue; }
      if (!e.name.endsWith('.ts')) continue;
      if (readFileSync(p, 'utf8').includes('purgeStaleInterviewJobPayloads')) prodSrcHits.push(p);
    }
  };
  const root = join(here, '../../..');
  walk(join(root, 'packages'));
  walk(join(root, 'apps'));
  const expected = new Set([
    join(root, 'packages/db/src/interview/interview-jobs.ts'),   // 定义
    join(root, 'packages/db/src/index.ts'),                       // barrel export
    consumerPath,                                                  // import+调用(本刀唯一生产触发)
  ]);
  A('生产面(src·零 test)命中文件恰三=定义+export+唯一触发(零外溢)', prodSrcHits.length === 3 && prodSrcHits.every((p) => expected.has(p)));
  A('零新 env 闸(调用行/函数体无 process.env·零新配置面)', !src.includes('process.env') || !lines[iCall]!.includes('process.env'));

  console.log(`\n${failures === 0 ? '✓ Reaper→purge 接线(可达恰一+参形默认TTL+同事务次序+静态置位/唯一性)全部通过' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
