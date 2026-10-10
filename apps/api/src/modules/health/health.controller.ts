import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { APP_VERSION, APP_REVISION } from '../../version';

/**
 * 公开探针，不读取 principal（主体）也不泄露依赖拓扑。
 * `/livez` 只回答进程存活；`/readyz/api` 读取数据库可达性 + 启动配置校验状态
 * （审计 #91：`config.envSchema` 布尔位，不携带键名/缺失明细），二者任一失败即 503。
 * 旧 `/health` 保留为 readiness（就绪）别名，避免已有编排器把兼容升级误判为可接流量。
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
    // 审计 #91：readiness 纳入配置校验状态（config.envSchema 布尔位）。键名/缺失明细
    // 只进 boot 日志（env_schema_invalid），公开探针体不泄露配置拓扑（本类注记纪律）。
    // 降级体保持最小（status + config，无 error 字段——validate.ts 降级体契约）。
    const config = this.health.configReady();
    const database = await this.health.apiReady();
    if (config && database) return { status: 'ok' as const, config: { envSchema: 'ok' as const } };
    throw new HttpException(
      { status: 'degraded' as const, config: { envSchema: config ? 'ok' as const : 'invalid' as const } },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  /**
   * `/meta` 只回构建与版本标识（无依赖、无 PII、无拓扑）。版本来源见 ADR-0022：
   * 读部署注入的 `APP_VERSION`/`APP_REVISION`，本地回退 `dev`；当前管线尚未注入，故恒为 dev。
   */
  @Get('meta')
  meta() {
    return { name: 'meetwise-api', version: APP_VERSION, revision: APP_REVISION };
  }
}
