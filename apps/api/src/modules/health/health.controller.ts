import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { APP_VERSION, APP_REVISION } from '../../version';

/**
 * 公开探针，不读取 principal（主体）也不泄露依赖拓扑。
 * `/livez` 只回答进程存活；`/readyz/api` 才读取数据库。旧 `/health` 保留为
 * readiness（就绪）别名，避免已有编排器把兼容升级误判为可接流量。
 */
@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get('livez')
  livez() {
    return this.health.livez();
  }

  @Get(['readyz/api', 'health'])
  async apiReady() {
    if (await this.health.apiReady()) return { status: 'ok' as const };
    throw new HttpException({ status: 'degraded' }, HttpStatus.SERVICE_UNAVAILABLE);
  }

  /**
   * `/meta` 只回构建与版本标识（无依赖、无 PII、无拓扑），供发布后核对"线上跑的是哪一版"。
   * 版本来源见 ADR-0021：部署注入 `APP_VERSION`/`APP_REVISION`，本地回退 `dev`。
   */
  @Get('meta')
  meta() {
    return { name: 'meetwise-api', version: APP_VERSION, revision: APP_REVISION };
  }
}
