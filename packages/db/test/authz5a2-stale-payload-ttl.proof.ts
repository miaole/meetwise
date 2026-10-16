/**
 * authz5a2-stale-payload-ttl.proof.ts — AUTHZ-HARDEN 5A-2 #18 滞留半证明(db prove·假时钟三臂)。
 *
 * 假时钟形(沿 reaper.proof 先例):不做真实等待——created_at/lease_expires_at 直接 SQL 回拨,即时间旅行注入。
 *   臂① 超 TTL 滞留 queued job → purge 后 payload-'answer' 落账(明文清零·身份/状态保留·version+1);
 *   臂② 活跃 running(租约内)零触 + 未超龄 queued 零触 + 租约刚过期未超 TTL running 零触(边界臂);
 *   臂③ 收割函数 sweepStuckInterviewJobs requeued/failed 计数零回归(sweep 语义零改·旁路函数不侵占)。
 * 运行:pnpm -C packages/db prove:authz5a2-stale-payload-ttl(隔离库·run-e2e-isolated 包装)。
 * est live=0:零模型外呼·零生产操作。
 */
import {
  asPrincipal, createPool, runMigrations, loadMigrations, assertIsolatedTestTarget,
  createResumeWithBlob, completeIngestion, transitionResume, enqueueInterviewJob,
  sweepStuckInterviewJobs, purgeStaleInterviewJobPayloads,
  MAX_INTERVIEW_JOB_ATTEMPTS, INTERVIEW_STUCK_PAYLOAD_TTL_SECONDS, type DbPool,
} from '../src/index.ts';
import { ingestResume } from '@meetwise/domain';
import { fileURLToPath } from 'node:url';

const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));

let db: DbPool;
let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const OWNER = 'stalePurgeUser';
const IID = 'sp-' + Date.now();

const jobRows = (ids: string[]) => asPrincipal(db, OWNER, (c) => c.query(
  `SELECT id, status, payload ? 'answer' AS has_answer, version, attempts FROM interview_job WHERE id = ANY($1::uuid[]) ORDER BY created_at`, [ids],
)).then((r) => r.rows);

async function main() {
  // 单容器单库(沿 authz5a-email-normalization 先例):fresh 库+全量迁移链(0001 的 DROP ROLE 系 cluster 级)。
  const admin = createPool({ purpose: 'authz5a2_probe_admin' });
  await assertIsolatedTestTarget(admin);
  const manifest = loadMigrations(MIG_DIR);
  await admin.query(`DROP DATABASE IF EXISTS authz5a2_ttl WITH (FORCE)`);
  await admin.query(`CREATE DATABASE authz5a2_ttl`);
  db = createPool({ purpose: 'authz5a2_probe', database: 'authz5a2_ttl' });
  const migrations = await runMigrations(db, manifest);
  A('迁移链全量应用(全链恰一次)', migrations.applied.length === manifest.length);

  A('假时钟前提: TTL 默认常量在位(裁决项⑥缺省值)', INTERVIEW_STUCK_PAYLOAD_TTL_SECONDS === 86_400);

  // ── fixture:resume+interview+start(0064 v64 闸)+四枚 answer job(明文 payload 经旁路 UPDATE 注入·与入队等价落库态)──
  const resumeId = await asPrincipal(db, OWNER, async (c) => {
    const upload = await createResumeWithBlob(c, OWNER, '经历：负责分布式限流与订单系统可靠性');
    await transitionResume(c, OWNER, upload.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER, upload.resumeId, ingestResume('经历：负责分布式限流与订单系统可靠性'));
    return upload.resumeId;
  });
  A('fixture: resume 摄取落库(resumeId 在位)', typeof resumeId === 'string' && resumeId.length > 0);
  const epochRow = await asPrincipal(db, OWNER, async (c) => {
    const r = await c.query('SELECT privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2', [resumeId, OWNER]);
    return r.rows[0] as { privacy_epoch: number } | undefined;
  });
  A('fixture: privacy_epoch 行在位(completeIngestion 生效)', !!epochRow);
  const resumeEpoch = Number(epochRow!.privacy_epoch);
  await asPrincipal(db, OWNER, (c) => c.query(
    `INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'active',$3,$4)`,
    [IID, OWNER, resumeId, resumeEpoch]));
  // v64 引用闸:answer job 须同面试存在 v64 start job(0064 触发器)——先落 start 再落四枚 answer。
  await asPrincipal(db, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'start', {}, 0));
  const jStale = await asPrincipal(db, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', {}, 1));
  const jActive = await asPrincipal(db, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', {}, 2));
  const jFresh = await asPrincipal(db, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', {}, 3));
  const jRunning = await asPrincipal(db, OWNER, (c) => enqueueInterviewJob(c, OWNER, IID, 'answer', {}, 4));
  await asPrincipal(db, OWNER, (c) => c.query(
    `UPDATE interview_job SET payload = payload || jsonb_build_object('answer', '明文答案-' || seq::text) WHERE interview_id=$1 AND kind='answer'`, [IID]));
  // 假时钟:stale queued 回拨 25h(>TTL 24h);fresh queued 不动;running 租约拨到 3h 前(>TTL)与 5min 前(刚过期<TTL)各一。
  await asPrincipal(db, OWNER, (c) => c.query(`UPDATE interview_job SET created_at = now() - interval '25 hours' WHERE id=$1`, [jStale]));
  await asPrincipal(db, OWNER, (c) => c.query(
    `UPDATE interview_job SET status='running', lease_owner='live-worker#1', lease_expires_at = now() + interval '2 minutes' WHERE id=$1`, [jActive]));
  await asPrincipal(db, OWNER, (c) => c.query(
    `UPDATE interview_job SET status='running', lease_owner='dead-worker#9', lease_expires_at = now() - interval '5 minutes', attempts=1 WHERE id=$1`, [jFresh]));
  await asPrincipal(db, OWNER, (c) => c.query(
    `UPDATE interview_job SET status='running', lease_owner='dead-worker#2', lease_expires_at = now() - interval '30 hours', attempts=1 WHERE id=$1`, [jRunning]));
  const ids = [jStale, jActive, jFresh, jRunning];

  section('① 超 TTL 滞留 → payload 明文清零(queued 25h + running 租约过期 30h)');
  const before = await jobRows(ids);
  A('臂①前置: 四枚 job 均携明文 answer', before.every((x) => x.has_answer === true));
  const { purged } = await asPrincipal(db, OWNER, (c) => purgeStaleInterviewJobPayloads(c, OWNER));
  A('臂①: purge 恰清 2 行(超龄 queued 1 + 超龄过期租约 running 1·实际 purged=' + purged + ')', purged === 2);
  const after = await jobRows(ids);
  const byId = (id: string) => after.find((x) => x.id === id)!;
  A('臂①: 超龄 queued 明文清零(payload-answer 落账)', byId(jStale).has_answer === false);
  A('臂①: 超龄过期租约 running 明文清零(兜底臂)', byId(jRunning).has_answer === false);
  A('臂①: 身份/状态/追踪保留(status 不翻·非无界清 payload)', byId(jStale).status === 'queued' && byId(jRunning).status === 'running');
  A('臂①: version 随清账自增(落账可审计)', byId(jStale).version === before.find((x) => x.id === jStale)!.version + 1);

  section('② 活跃/未超龄 零触(Ban 无界清 payload 边界)');
  A('臂②: 活跃 running(租约内)明文保留', byId(jActive).has_answer === true);
  A('臂②: 租约刚过期未超 TTL running(5min<TTL)零触(边界·reaper 管辖面不侵占)', byId(jFresh).has_answer === true && byId(jFresh).status === 'running');

  section('③ 收割函数 sweepStuckInterviewJobs 计数零回归(语义零改)');
  // sweep 只看 running+lease 过期:此刻仅 jFresh(5min 过期·attempts=1<MAX)符合 → requeued=1,failed=0;
  // 被 purge 清过 payload 的 jRunning(running·租约过期 30h)仍在 sweep 域 → requeue(语义未因 purge 改变)。
  const sweep = await asPrincipal(db, OWNER, (c) => sweepStuckInterviewJobs(c, OWNER, MAX_INTERVIEW_JOB_ATTEMPTS));
  A('臂③: requeued=2(刚过期 jFresh + 超龄租约过期 jRunning·sweep 语义与 purge 正交)', sweep.requeued === 2);
  A('臂③: failed=0(attempts 均未达上限)', sweep.failed === 0);
  const postSweep = await jobRows(ids);
  const byId2 = (id: string) => postSweep.find((x) => x.id === id)!;
  A('臂③: sweep 翻状态不改明文零回归(jFresh 重 queued 后仍无 answer=先前 purge 账目·非 sweep 清)', byId2(jFresh).status === 'queued');
  A('臂③: purge 不改 attempts(sweep 判据不受旁路函数扰动)', byId2(jStale).attempts === byId(jStale).attempts);

  // 幂等:二次 purge 零新清(已清行不再计数)
  const second = await asPrincipal(db, OWNER, (c) => purgeStaleInterviewJobPayloads(c, OWNER));
  A('幂等: 二次 purge purged=0(payload ? answer 谓词门·不重复计账)', second.purged === 0);

  console.log(`\n${failures === 0 ? '✓' : '✗'} authz5a2:stale-payload-ttl — 假时钟 db prove 完成(失败 ${failures})`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
