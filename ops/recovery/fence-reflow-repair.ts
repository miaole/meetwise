/**
 * FENCE-REFLOW F4（#241 存量修复）—— 一次性围栏回流运维修复工具。
 *
 * 修复对象：隐私围栏（interview_privacy_active=false）且仍处非终态的 C 端面试——
 * 它们在 F1 三过滤落地前会卡死 create()（复用查询把围栏尸当"进行中"→ begin/abandon 全 410）。
 * 本工具对每条命中行做且仅做两件事（§5-3：只释放额度+关终态，物理数据零删）：
 *   ① 释放挂死预留：entitlement_consumption reserved→released + 逐 allocation 扣回
 *      entitlement_bucket.units_reserved（与 commerce.ts sweepExpiredReservations 同形；本文件不改 commerce.ts）。
 *   ② 关终态：interview → 'abandoned'（复用 abandon 既有枚举，无新状态；状态枚举钉
 *      ('created','active','waiting_user')，与 abandonInterviewAndRelease 同枚举 → 二跑 0 行=幂等）。
 *
 * 不做（结构性零触）：零事件写（围栏行写 interview_event 会撞 0059 写护栏/0062 RLS RAISE=毒化，本工具
 * 两分支零 DML 之外对投影表零引用）；零围栏账本触碰（privacy_erasure_request / privacy_checkpoint_target
 * 零 SELECT 零写，围栏判定只经布尔函数 interview_privacy_active 消费）；零围栏解除（全仓无解除路径=立法现状）。
 *
 * 角色面（F4(iv)）：逐 owner `asPrincipal`（SET LOCAL 到应用运行角色 app_role + owner GUC），
 * 与产品运行时同一授权根；任何特权旁路角色零引用零使用（prove 静态断言守此线）。
 *
 * 枚举（诚实登记残留）：owner 候选=六个既有 SECURITY DEFINER 网关 seam 的并集
 * （commerce/interview/quiz/diagnosis/report/job_route 的 gateway_dispatch_owners）
 * ∪ 命令行 `--owner <id>` 显式追加。围栏行若在其所有者的六 seam 中零痕迹（预留已被对账释放、无在途 job）
 * 且未用 --owner 显式给出，则本轮扫描不可达——一次性修复工具 ≠ 全量修复保证，逐轮 dry-run 报告如实呈现覆盖面。
 *
 * 用法（§4-4 命令形）：
 *   dry-run（默认，零写）：  pnpm exec tsx ops/recovery/fence-reflow-repair.ts
 *   实跑（幂等）：          pnpm exec tsx ops/recovery/fence-reflow-repair.ts --apply
 *   追加显式 owner：        --owner <user_id>（可重复）
 *   DATABASE_URL 指向目标库（先隔离库实证再生产）。
 */
import { pathToFileURL } from 'node:url';
import {
  createPool, resolveDatabaseConnectionString, asPrincipal, asGateway, gatewayDispatchOwners,
  type DbPool,
} from '../../packages/db/src/index.ts';

/** 关终态状态枚举钉（F4(iii)）=abandonInterviewAndRelease 同枚举；apply 二跑 0 行。 */
const NON_TERMINAL_STATUSES = "('created','active','waiting_user')";

export interface FenceReflowRepairRow {
  owner: string;
  interviewId: string;
  /** 扫描时点的非终态 status（created/active/waiting_user）。 */
  status: string;
  /** 扫描时点是否存在挂死预留（reserved 的 mock_interview 消费行）。 */
  reservedConsumption: boolean;
  /** dry-run=将释放(计划)；apply=实际释放。 */
  released: boolean;
  /** dry-run=将关终态(计划)；apply=实际关终态。 */
  terminalClosed: boolean;
}

export interface FenceReflowRepairReport {
  mode: 'dry-run' | 'apply';
  /** 本轮枚举到的候选 owner 数（seam 并集 ∪ 显式 --owner）。 */
  ownersScanned: number;
  /** C 端围栏非终态行（application_id IS NULL）——修复目标全集。 */
  cSide: FenceReflowRepairRow[];
  releasedCount: number;
  terminalClosedCount: number;
  /** F4(ii)：B 端围栏行（application_id≠NULL）跳过计数——dry-run/apply 同口径只报数零写。 */
  bSideFencedSkipped: number;
  /** 本轮实际使用的枚举 seam 名（诚实呈现覆盖面）。 */
  enumerationSeams: string[];
  /** 本轮显式追加的 owner。 */
  explicitOwners: string[];
}

const ENUMERATION_SEAMS = ['commerce', 'interview', 'quiz', 'diagnosis', 'report', 'job_route'] as const;

/** owner 候选枚举：六 seam 并集（SECURITY DEFINER 网关函数，非特权旁路）∪ 显式 --owner。单 seam 失败只记日志不拖垮。 */
export async function enumerateCandidateOwners(pool: DbPool, explicitOwners: string[] = []): Promise<{ owners: string[]; seamsUsed: string[] }> {
  const union = new Set<string>(explicitOwners);
  const seamsUsed: string[] = [];
  for (const work of ENUMERATION_SEAMS) {
    try {
      const owners = await gatewayDispatchOwners(pool, work);
      for (const o of owners) union.add(o);
      seamsUsed.push(work);
    } catch (e) {
      console.error(`fence-reflow-repair: enumerate seam ${work} failed (skipped)`, e);
    }
  }
  return { owners: [...union].sort(), seamsUsed };
}

/** 单轮修复（dry-run 零写 / apply 逐 owner 单事务）。围栏判定=布尔函数消费（非 RAISE-able assert）。 */
async function repairOnce(pool: DbPool, mode: 'dry-run' | 'apply', explicitOwners: string[]): Promise<FenceReflowRepairReport> {
  const { owners, seamsUsed } = await enumerateCandidateOwners(pool, explicitOwners);
  const cSide: FenceReflowRepairRow[] = [];
  let bSideFencedSkipped = 0;
  let releasedCount = 0;
  let terminalClosedCount = 0;

  for (const owner of owners) {
    // F4(iv)：逐 owner asPrincipal（app 运行角色 + owner GUC）——禁任何旁路角色；prove 静态断言守此线。
    await asPrincipal(pool, owner, async (c) => {
      // 盘点：本 owner 名下围栏且非终态的面试。interview 表无围栏 RLS（p_owner=owner 谓词），
      // asPrincipal 下可见自己的围栏行；围栏判定走布尔函数 interview_privacy_active（app_role 有 EXECUTE）。
      const rows = await c.query<{ id: string; status: string; application_id: string | null }>(
        `SELECT id, status, application_id FROM interview
          WHERE owner_user_id = current_setting('app.principal_user', true)
            AND status IN ${NON_TERMINAL_STATUSES}
            AND interview_privacy_active(id) = false`);
      for (const row of rows.rows) {
        if (row.application_id !== null) { bSideFencedSkipped++; continue; }   // F4(ii)：B 端围栏行同跳零写，只计数
        // 挂死预留盘点/释放：EXISTS 门强制 interview.application_id IS NULL 谓词（F4(ii) 每条写语句带 C 端谓词）；
        // 释放另钉租约过期（与 sweepExpiredReservations 同判据——活租约=可能仍在飞的会话，不抢）。
        const reserved = await c.query<{ id: string }>(
          `SELECT ec.id FROM entitlement_consumption ec
            WHERE ec.owner_user_id = current_setting('app.principal_user', true)
              AND ec.idempotency_key = $1 AND ec.service_type = 'mock_interview'
              AND ec.status = 'reserved' AND ec.lease_expires_at < now()
              AND EXISTS (SELECT 1 FROM interview i
                           WHERE i.id = ec.idempotency_key AND i.owner_user_id = ec.owner_user_id
                             AND i.application_id IS NULL)`, [row.id]);
        let released = false;
        if (mode === 'apply' && reserved.rowCount! > 0) {
          // ① 释放（与 sweepExpiredReservations 同形：状态翻转 RETURNING → 逐 allocation 扣回额度池）。
          const swept = await c.query<{ id: string; allocations: Array<{ bucket_id: string; units: number }> }>(
            `UPDATE entitlement_consumption SET status='released'
              WHERE owner_user_id = current_setting('app.principal_user', true)
                AND idempotency_key = $1 AND service_type = 'mock_interview' AND status = 'reserved'
                AND lease_expires_at < now()
                AND EXISTS (SELECT 1 FROM interview i
                             WHERE i.id = entitlement_consumption.idempotency_key
                               AND i.owner_user_id = entitlement_consumption.owner_user_id
                               AND i.application_id IS NULL)
              RETURNING id, allocations`, [row.id]);
          for (const cons of swept.rows) {
            for (const a of cons.allocations) {
              const upd = await c.query(
                'UPDATE entitlement_bucket SET units_reserved = units_reserved - $2, version = version + 1 WHERE id=$1',
                [a.bucket_id, Number(a.units)]);
              if (upd.rowCount !== 1) throw Object.assign(new Error('release_bucket_rowcount'), { code: 'release_bucket_rowcount', bucket: a.bucket_id });
            }
          }
          released = swept.rowCount! > 0;
          if (released) releasedCount++;
        }
        // ② 关终态（F4(iii)：owner 谓词 + application_id IS NULL + 枚举钉 → 幂等，二跑 0 行）。
        let terminalClosed = false;
        if (mode === 'apply') {
          const upd = await c.query(
            `UPDATE interview SET status='abandoned', version=version+1
              WHERE id=$1 AND owner_user_id = current_setting('app.principal_user', true)
                AND application_id IS NULL AND status IN ${NON_TERMINAL_STATUSES}`, [row.id]);
          terminalClosed = upd.rowCount === 1;
          if (terminalClosed) terminalClosedCount++;
        }
        cSide.push({ owner, interviewId: row.id, status: row.status, reservedConsumption: reserved.rowCount! > 0, released, terminalClosed });
      }
    });
  }
  return { mode, ownersScanned: owners.length, cSide, releasedCount, terminalClosedCount, bSideFencedSkipped, enumerationSeams: seamsUsed, explicitOwners };
}

/** F4(v)：dry-run（默认形态，零写）——prove 导入方 fence-reflow-repair.proof.ts 直接调用。 */
export async function dryRun(pool: DbPool, explicitOwners: string[] = []): Promise<FenceReflowRepairReport> {
  return repairOnce(pool, 'dry-run', explicitOwners);
}

/** F4(v)：apply（幂等；二跑 0 行）——prove 导入方直接调用。 */
export async function apply(pool: DbPool, explicitOwners: string[] = []): Promise<FenceReflowRepairReport> {
  return repairOnce(pool, 'apply', explicitOwners);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const applyMode = argv.includes('--apply');
  const owners: string[] = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--owner') { const v = argv[i + 1]; if (v) owners.push(v); }
  }
  const pool = createPool({ connectionString: resolveDatabaseConnectionString() });
  try {
    const report = applyMode ? await apply(pool, owners) : await dryRun(pool, owners);
    console.log(JSON.stringify(report, null, 2));
    if (applyMode) console.log('fence-reflow-repair: --apply done（幂等；可再跑一次核对二跑 0 行）');
    else console.log('fence-reflow-repair: dry-run done（零写；加 --apply 实跑）');
  } finally {
    await pool.end();
  }
}

// 仅直接执行时跑 main（prove import dryRun/apply 时不触发）。根 package.json 无 "type":"module"，
// 故不用 top-level await（CJS 输出格式不支持），用 promise-catch 形。
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => { console.error(e); process.exitCode = 1; });
}
