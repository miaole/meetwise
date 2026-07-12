/**
 * 版本化迁移运行器（生产）：替掉"drop+recreate 引导 DDL + init-scripts 只跑一次"。
 * 铁律:① schema_migrations 追踪已应用版本 ② 只跑待应用、按序、各自事务 ③ advisory 锁(一次一个迁移者,防并发双应用)
 *       ④ checksum 守卫:已应用的迁移内容变了 → 报错(禁止改历史迁移,防漂移) ⑤ 幂等:重跑=已应用跳过。
 * 迁移文件须**增量、非破坏**(CREATE TABLE IF NOT EXISTS / ALTER ... ADD COLUMN IF NOT EXISTS),绝不 DROP 丢数据。
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import type { Pool } from 'pg';

export interface Migration { version: string; sql: string }

export async function runMigrations(pool: Pool, migrations: Migration[]): Promise<{ applied: string[]; skipped: string[] }> {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['meetwise_migrations']);   // 串行化迁移者
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())');
    const done = new Map<string, string>((await client.query('SELECT version, checksum FROM schema_migrations')).rows.map((r) => [r.version, r.checksum]));
    const applied: string[] = [], skipped: string[] = [];
    for (const m of [...migrations].sort((a, b) => a.version.localeCompare(b.version))) {
      const checksum = createHash('sha256').update(m.sql).digest('hex');
      const prev = done.get(m.version);
      if (prev !== undefined) {
        if (prev !== checksum) throw new Error(`migration_drift:${m.version} 已应用但内容已改(checksum 不符)——禁止改历史迁移`);
        skipped.push(m.version);
        continue;                                                                            // 幂等:已应用跳过
      }
      await client.query('BEGIN');
      try {
        await client.query(m.sql);                                                           // 迁移与记录同一事务 → 要么全成要么全回滚
        await client.query('INSERT INTO schema_migrations(version, checksum) VALUES ($1,$2)', [m.version, checksum]);
        await client.query('COMMIT');
        applied.push(m.version);
      } catch (e) { await client.query('ROLLBACK'); throw e; }
    }
    return { applied, skipped };
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['meetwise_migrations']);
    client.release();
  }
}

/** 从目录读增量迁移文件(版本=文件名)。生产启动时 runMigrations(pool, loadMigrations(dir))。 */
export function loadMigrations(dir: string): Migration[] {
  return readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().map((f) => ({ version: f.replace(/\.sql$/, ''), sql: readFileSync(`${dir}/${f}`, 'utf8') }));
}
