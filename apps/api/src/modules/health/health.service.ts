import { Injectable } from '@nestjs/common';
import { fileURLToPath } from 'node:url';
import { latestMigrationVersion } from '@meetwise/db';
import { DbService } from '../../platform/db.service';
import { parseCriticalEnv } from '../../platform/env-schema';

/**
 * 探针语义必须稳定且最小：liveness（存活）绝不能被数据库、缓存、模型或队列拖成失败；
 * readiness（就绪）才负责确认 API 命令路径所需的数据库可读。
 */

/** API readiness 三态：ok / 数据库不可达 / 迁移版本漂移（账本 max ≠ 目录 max）。 */
export type ApiReadiness = 'ok' | 'db_unreachable' | 'migration_mismatch';

/**
 * 迁移目录唯一真源：与一次性 migrate 服务同一个 `packages/db/migrations` 工件。
 * 默认按本文件模块 URL 上溯到 monorepo 根（apps/api/src/modules/health → 仓库根，dev 与
 * Dockerfile `COPY . .` 同构）；非同构部署用 `MIGRATIONS_DIR` 显式指路。目录缺失/不可读时
 * latestMigrationVersion 抛错 → readiness fail-closed（migration_mismatch），绝不 fail-open。
 */
function migrationsDir(): string {
  return process.env.MIGRATIONS_DIR
    ?? fileURLToPath(new URL('../../../../../packages/db/migrations', import.meta.url));
}

@Injectable()
export class HealthService {
  constructor(private readonly db: DbService) {}

  livez(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /**
   * 连接池已有 `PG_CONN_TIMEOUT_MS`、`PG_STATEMENT_TIMEOUT_MS` 与 `query_timeout`
   * 的有界配置；这里只允许常量只读探针，禁止探针创建数据或借机探测业务表。
   * 审计 #92：readiness 增迁移版本检查——两条有界只读（SELECT 1 + 账本 max(version)），
   * 账本 max(`COLLATE "C"` 字节序) 对比目录侧 latestMigrationVersion（同字节序，@meetwise/db
   * 同一版本源）。不一致=尚未迁移完/迁移漂移 → migration_mismatch（503，原因见 controller）。
   * SELECT 1 失败短路返回 db_unreachable，不追加账本查询（探针查询数有界：≤2）。
   */
  async apiReady(): Promise<ApiReadiness> {
    try {
      await this.db.pool.query('SELECT 1');
    } catch {
      return 'db_unreachable';
    }
    try {
      const ledger = await this.db.pool.query<{ v: string | null }>(
        'SELECT max(version COLLATE "C") AS v FROM schema_migrations',
      );
      const ledgerMax = ledger.rows[0]?.v ?? null;             // 空账本/表缺失(COLLATE 不救 to_regclass 之外情形) → null
      const dirMax = latestMigrationVersion(migrationsDir());  // 目录不可读 → undefined → 不等
      return dirMax !== undefined && ledgerMax === dirMax ? 'ok' : 'migration_mismatch';
    } catch {
      // 账本不可读（schema_migrations 缺失=未迁移目标等）→ 无法证明一致 → fail-closed。
      return 'migration_mismatch';
    }
  }

  /**
   * 审计 #91：readiness 纳入启动配置校验状态。boot 时 assertCriticalEnv 已 fail-fast，
   * 这里每次 readyz 现算同一纯函数（zod parse 微秒级、不缓存）：正常恒 true；
   * 万一仍为 false（理论上不可达，防御 embedder 绕过 createApp 组合）readiness 必须
   * fail-closed 降级。返回布尔——公开探针纪律（controller 注记）禁止泄露键名/拓扑。
   */
  configReady(): boolean {
    return parseCriticalEnv().ok;
  }
}
