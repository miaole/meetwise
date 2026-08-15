import { Injectable } from '@nestjs/common';
import { DbService } from '../../platform/db.service';

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
}
