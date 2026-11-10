/**
 * G1 · 上一版库升级到当前清单（旧账本 → tip）证明。
 *
 * 背景（审查 P0-1，tip 189c0054a）：DBDDL-HARDEN R2 新增的 `0000_admin_provision_primitives`
 * 字节序排在 `0001_baseline` 之前，任何按 0001.. 建好的旧库账本都不再是清单的连续前缀，
 * runner（migrate.ts 的 contiguous-prefix 校验）以 `migration_ledger_not_contiguous_prefix`
 * fail-closed，发布被阻断。`migrate:prove` / `dbhy1:prove` 都从空库起跑，覆盖不到这条路径。
 * 修复：原语改号到链尾 `0230_admin_provision_primitives`（文件字节不变，checksum 不变）。
 *
 * 本证明在隔离一次性 PG 上逐臂建库（每臂独立 database，跑完即删；0001 baseline 的
 * DROP ROLE 是 cluster 级，所以三臂串行、前一臂的库删掉后再起下一臂）：
 *   R234 臂：用 #234（9d1d5e95d，0001..0227 共 225 个）的迁移集建库 → 升级到当前清单，必须成功；
 *   R235/R236 臂：用 main@7f7a91d41（#235，0000+0001..0227 共 226 个）/ main@9c9809446（#236，
 *            再加 0229 共 227 个）建库 → 当前清单先 fail-closed（unknown_version，未执行任何 DDL），
 *            按修复说明一次性退役 0000 账本行（限定同 checksum）后升级成功；
 *   GIT 臂 ：从 git 取“上一版 main”的真实迁移文件（默认 origin/main；HEAD 即 origin/main 时取
 *            HEAD^1；可用 MIGRATE_UPGRADE_FROM_REF 覆盖）建库 → 升级到当前清单，必须成功。
 *            取不到 git ref 时为 SKIP；MIGRATE_UPGRADE_REQUIRE_GIT_ARM=1（CI 设置）时 SKIP 记为失败。
 * 本地绿 ≠ HA · releaseEvidence=false。
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool, loadMigrations, runMigrations, type DbPool, type Migration } from '../src/index.ts';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const PRIMITIVES_OLD = '0000_admin_provision_primitives';
const PRIMITIVES_NEW = '0230_admin_provision_primitives';
const R234_LAST = '0227_auth_user_session_owner_rls';
const R236_EXTRA = '0229_admin_qbank_owner_grants';
/** 由 git 实测钉值（2026-11-10）：version:sha256(sql) 按字节序逐行拼接后的 sha256。 */
const PIN_R234 = { count: 225, digest: '1490b489d539025d2dbf9fa4872d6cad2112fe5fdeedd5393d65be2f681e86eb' };
const PIN_R236 = { count: 227, digest: 'dbb55b208b84ee9aa6930089f6b14223f4e8fde21171681699c9cfc7c0509f07' };
const PIN_R235 = { count: 226, digest: '8bfe9da62fbc90597d6171739fceba7b602336c209c6f5c7cf6b8e7ed1b4da7f' };
/** 0000/0230 原语文件 sha256（改号前后字节不变）。 */
const PRIMITIVES_CHECKSUM = '50b47580229fb51aebdb6c7b15f28ebf534e077d6abd9be295c1ceeb0bf6c14f';
/**
 * 已知的一次性账本处置（限定 version + checksum 同时匹配）。main@7f7a91d41（#235）与
 * main@9c9809446（#236）两版把原语放在 0000；用这两版迁移过的库升级前需执行一次：
 *   DELETE FROM schema_migrations WHERE version='0000_admin_provision_primitives' AND checksum='<PRIMITIVES_CHECKSUM>';
 * 之后 runner 会把 0229（#235 库缺）与 0230 按序追加；0230 全是 CREATE OR REPLACE + REVOKE，重放幂等。
 * 只改名为 0230 不够：#235 库没有 0229，改名后账本仍不是连续前缀。
 */
const KNOWN_RETIRED_LEDGER_ROWS: ReadonlyArray<readonly [string, string]> = [[PRIMITIVES_OLD, PRIMITIVES_CHECKSUM]];

let failures = 0; let assertions = 0;
const A = (name: string, ok: boolean, detail = '') => {
  assertions++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? `  — ${detail}` : ''}`);
  if (!ok) failures++;
};
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
const byteCmp = (a: string, b: string) => Buffer.compare(Buffer.from(a), Buffer.from(b));
const sorted = (ms: Migration[]) => [...ms].sort((a, b) => byteCmp(a.version, b.version));
const manifestDigest = (ms: Migration[]) => sha256(sorted(ms).map((m) => `${m.version}:${sha256(m.sql)}`).join('\n') + '\n');
const errCode = (e: unknown) => String((e as { code?: unknown })?.code ?? (e as Error)?.message ?? e);

async function freshDb(admin: DbPool, name: string): Promise<DbPool> {
  await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
  await admin.query(`CREATE DATABASE ${name}`);
  return createPool({ purpose: 'migrate_upgrade_probe', database: name, max: 2 });
}
async function dropDb(admin: DbPool, db: DbPool | undefined, name: string): Promise<void> {
  await db?.end().catch(() => undefined);
  await admin.query(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`).catch(() => undefined);
}
async function ledger(db: DbPool): Promise<Array<{ version: string; checksum: string }>> {
  return (await db.query<{ version: string; checksum: string }>('SELECT version, checksum FROM schema_migrations ORDER BY version COLLATE "C"')).rows;
}
async function retireKnownLedgerRows(db: DbPool): Promise<number> {
  let retired = 0;
  for (const [version, checksum] of KNOWN_RETIRED_LEDGER_ROWS) {
    const r = await db.query('DELETE FROM schema_migrations WHERE version=$1 AND checksum=$2', [version, checksum]);
    retired += r.rowCount ?? 0;
  }
  return retired;
}
/** 升级后的共同终态断言：账本 = 当前清单（同版本同 checksum、同字节序），重放全 skipped。 */
async function assertUpgradedToCurrent(arm: string, db: DbPool): Promise<void> {
  const rows = await ledger(db);
  const want = sorted(current);
  A(`${arm}升级后账本 = 当前清单（${want.length} 个，版本与 checksum 逐一相等）`,
    rows.length === want.length && want.every((m, i) => rows[i]?.version === m.version && rows[i]?.checksum === sha256(m.sql)),
    `ledger=${rows.length} manifest=${want.length}`);
  const fn = await db.query("SELECT to_regprocedure('mw_admin_create_login(text,text)') IS NOT NULL AS present, has_function_privilege('public', 'mw_admin_create_login(text,text)', 'EXECUTE') AS public_exec");
  A(`${arm}provision 原语在位（mw_admin_create_login），PUBLIC 无 EXECUTE（0073 默认权限覆盖）`,
    fn.rows[0]?.present === true && fn.rows[0]?.public_exec === false, JSON.stringify(fn.rows[0]));
  const again = await runMigrations(db, current);
  A(`${arm}再跑一次当前清单：全部 skipped、零 applied`, again.applied.length === 0 && again.skipped.length === current.length);
}

function resolvePreviousRef(): string | null {
  const git = (...args: string[]) => execFileSync('git', ['-C', ROOT, ...args], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  const verify = (ref: string) => { try { return git('rev-parse', '--verify', '-q', `${ref}^{commit}`); } catch { return null; } };
  const override = process.env.MIGRATE_UPGRADE_FROM_REF?.trim();
  if (override) return verify(override);
  const head = verify('HEAD');
  const main = verify('origin/main');
  if (!head || !main) return null;
  return head === main ? verify('HEAD^1') : main;
}
function loadMigrationsAtRef(ref: string): { migrations: Migration[]; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), 'mw-mig-prev-'));
  const files = execFileSync('git', ['-C', ROOT, 'ls-tree', '--name-only', ref, 'packages/db/migrations/']).toString().split('\n').filter((f) => f.endsWith('.sql'));
  for (const f of files) writeFileSync(join(dir, f.replace(/^.*\//, '')), execFileSync('git', ['-C', ROOT, 'show', `${ref}:${f}`], { maxBuffer: 64 * 1024 * 1024 }));
  return { migrations: loadMigrations(dir), dir };
}

const current = loadMigrations(MIG_DIR);

async function main() {
  const admin = createPool({ purpose: 'migrate_upgrade_admin', max: 2 });
  await assertIsolatedTestTarget(admin);

  // ── 静态臂：当前清单形状 + 两个历史版本的迁移集可由当前文件字节精确重建 ──
  const ordered = sorted(current);
  A('当前清单链首是 0001_baseline，没有任何迁移排在它前面', ordered[0]?.version === '0001_baseline' && !ordered.some((m) => byteCmp(m.version, '0001_baseline') < 0));
  const primitives = current.find((m) => m.version === PRIMITIVES_NEW);
  A(`provision 原语已改号到链尾 ${PRIMITIVES_NEW}，${PRIMITIVES_OLD} 不再存在`, primitives !== undefined && !current.some((m) => m.version === PRIMITIVES_OLD));
  const r234 = current.filter((m) => byteCmp(m.version, R234_LAST) <= 0);
  A(`R234 迁移集（≤${R234_LAST}）= #234 实测 ${PIN_R234.count} 个且字节摘要一致`, r234.length === PIN_R234.count && manifestDigest(r234) === PIN_R234.digest, `count=${r234.length} digest=${manifestDigest(r234)}`);
  A('0230 原语文件 sha256 = 改号前 0000 的 sha256（字节未改，历史 checksum 可对账）', primitives !== undefined && sha256(primitives.sql) === PRIMITIVES_CHECKSUM);
  const r229 = current.find((m) => m.version === R236_EXTRA);
  const legacy0000: Migration[] = primitives ? [{ ...primitives, version: PRIMITIVES_OLD }] : [];
  const r235: Migration[] = primitives ? [...r234, ...legacy0000] : [];
  const r236: Migration[] = primitives && r229 ? [...r234, r229, ...legacy0000] : [];
  A(`R235 迁移集（main@7f7a91d41：0000+0001..0227）= 实测 ${PIN_R235.count} 个且字节摘要一致`, r235.length === PIN_R235.count && manifestDigest(r235) === PIN_R235.digest, `count=${r235.length} digest=${manifestDigest(r235)}`);
  A(`R236 迁移集（main@9c9809446：0000+0001..0227+0229）= 实测 ${PIN_R236.count} 个且字节摘要一致`, r236.length === PIN_R236.count && manifestDigest(r236) === PIN_R236.digest, `count=${r236.length} digest=${manifestDigest(r236)}`);
  A('R234 迁移集是当前清单的连续字节序前缀（runner 升级的充要形状）', sorted(r234).every((m, i) => ordered[i]?.version === m.version));
  if (failures) throw new Error('migrate_upgrade_manifest_invalid');

  // ── R234 臂：#234 库（无 0000）→ 当前清单，不需要任何人工处置 ──
  {
    const name = 'mw_upgrade_r234';
    let db: DbPool | undefined;
    try {
      db = await freshDb(admin, name);
      const built = await runMigrations(db, r234);
      A('R234 臂：#234 的 225 个迁移从空库建成', built.applied.length === PIN_R234.count);
      let upgraded: Awaited<ReturnType<typeof runMigrations>> | undefined; let error = '';
      try { upgraded = await runMigrations(db, current); } catch (e) { error = errCode(e); }
      const expectApplied = ordered.slice(r234.length).map((m) => m.version);
      A('R234 臂：升级到当前清单成功（无 migration_ledger_not_contiguous_prefix）', upgraded !== undefined, error);
      A(`R234 臂：只追加应用 ${expectApplied.join(',')}`, JSON.stringify(upgraded?.applied ?? []) === JSON.stringify(expectApplied), JSON.stringify(upgraded?.applied));
      await assertUpgradedToCurrent('R234 臂：', db);
    } finally { await dropDb(admin, db, name); }
  }

  // ── R235 / R236 臂：账本含 0000 的两版 main → 当前清单：先 fail-closed，一次性退役 0000 行后升级成功 ──
  for (const arm of [
    { label: 'R235 臂（main@7f7a91d41·#235）', name: 'mw_upgrade_r235', set: r235, pin: PIN_R235 },
    { label: 'R236 臂（main@9c9809446·#236）', name: 'mw_upgrade_r236', set: r236, pin: PIN_R236 },
  ]) {
    let db: DbPool | undefined;
    try {
      db = await freshDb(admin, arm.name);
      const built = await runMigrations(db, arm.set);
      A(`${arm.label}：${arm.pin.count} 个迁移从空库建成（0000 在链首）`, built.applied.length === arm.pin.count && built.applied[0] === PRIMITIVES_OLD);
      let error = '';
      try { await runMigrations(db, current); } catch (e) { error = errCode(e); }
      const afterRefuse = await ledger(db);
      A(`${arm.label}：未处置时当前清单 fail-closed（migration_ledger_unknown_version:${PRIMITIVES_OLD}），账本未动`,
        error === `migration_ledger_unknown_version:${PRIMITIVES_OLD}` && afterRefuse.length === arm.pin.count, error);
      const retired = await retireKnownLedgerRows(db);
      A(`${arm.label}：一次性退役 ${PRIMITIVES_OLD} 账本行（限定同 checksum）恰好命中 1 行`, retired === 1);
      let upgraded: Awaited<ReturnType<typeof runMigrations>> | undefined; error = '';
      try { upgraded = await runMigrations(db, current); } catch (e) { error = errCode(e); }
      const builtSet = new Set(arm.set.map((m) => m.version));
      const expectApplied = ordered.filter((m) => !builtSet.has(m.version)).map((m) => m.version);
      A(`${arm.label}：退役后升级成功，只追加应用 ${expectApplied.join(',')}（0230 与旧 0000 同字节·CREATE OR REPLACE 幂等）`,
        upgraded !== undefined && JSON.stringify(upgraded.applied) === JSON.stringify(expectApplied), error || JSON.stringify(upgraded?.applied));
      await assertUpgradedToCurrent(`${arm.label}：`, db);
    } finally { await dropDb(admin, db, arm.name); }
  }

  // ── GIT 臂：真实“上一版 main”迁移文件 → 当前清单 ──
  {
    const ref = resolvePreviousRef();
    if (!ref) {
      const required = process.env.MIGRATE_UPGRADE_REQUIRE_GIT_ARM === '1';
      console.log(`${required ? 'FAIL' : 'SKIP'}  GIT 臂：取不到上一版 git ref（origin/main / HEAD^1 / MIGRATE_UPGRADE_FROM_REF）`);
      if (required) { assertions++; failures++; }
    } else {
      const name = 'mw_upgrade_git';
      let db: DbPool | undefined; let dir = '';
      try {
        const prev = loadMigrationsAtRef(ref); dir = prev.dir;
        console.log(`INFO  GIT 臂：上一版 ref=${ref.slice(0, 12)}，迁移 ${prev.migrations.length} 个`);
        db = await freshDb(admin, name);
        const built = await runMigrations(db, prev.migrations);
        A('GIT 臂：上一版迁移集从空库建成', built.applied.length === prev.migrations.length);
        const retired = await retireKnownLedgerRows(db);
        if (retired) console.log(`INFO  GIT 臂：上一版账本含已知退役项 ${PRIMITIVES_OLD}，已按修复说明处置 ${retired} 行`);
        let upgraded: Awaited<ReturnType<typeof runMigrations>> | undefined; let error = '';
        try { upgraded = await runMigrations(db, current); } catch (e) { error = errCode(e); }
        A('GIT 臂：升级到当前清单成功', upgraded !== undefined, error);
        await assertUpgradedToCurrent('GIT 臂：', db);
      } finally {
        await dropDb(admin, db, name);
        if (dir) rmSync(dir, { recursive: true, force: true });
      }
    }
  }

  await admin.end().catch(() => undefined);
  console.log(`\n${failures === 0 ? `✓ migrate-upgrade:prove: ${assertions} 条断言全绿` : `✗ migrate-upgrade:prove: ${failures}/${assertions} 失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error('✗ migrate-upgrade:prove 异常:', errCode(e)); process.exit(1); });
