import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { DbService } from '../../platform/db.service';

/** 健康检查（容器 / LB 探活）。公开端点（无 principal 守卫）。DB 不通 → 503,供编排重启/摘流。 */
@Controller('health')
export class HealthController {
  constructor(private readonly db: DbService) {}

  @Get()
  async health() {
    try {
      await this.db.pool.query('SELECT 1');
      return { status: 'ok', db: 'up' };
    } catch {
      throw new HttpException({ status: 'degraded', db: 'down' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
