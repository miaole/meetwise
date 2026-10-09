import { Injectable } from '@nestjs/common';
import { DbService } from '../../platform/db.service';
import { parseCriticalEnv } from '../../platform/env-schema';

/**
 * 探针语义必须稳定且最小：liveness（存活）绝不能被数据库、缓存、模型或队列拖成失败；
 * readiness（就绪）才负责确认 API 命令路径所需的数据库可读。
 */
@Injectable()
export class HealthService {
  constructor(private readonly db: DbService) {}

  livez(): { status: 'ok' } {
    return { status: 'ok' };
  }

  /**
   * 连接池已有 `PG_CONN_TIMEOUT_MS`、`PG_STATEMENT_TIMEOUT_MS` 与 `query_timeout`
   * 的有界配置；这里只允许一个常量只读探针，禁止探针创建数据或借机探测业务表。
   */
  async apiReady(): Promise<boolean> {
    try {
      await this.db.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
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
