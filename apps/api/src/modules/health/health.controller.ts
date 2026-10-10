import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { APP_VERSION, APP_REVISION } from '../../version';
import { getSseRegistry } from '../../platform/sse-registry';

/**
 * 公开探针，不读取 principal（主体）也不泄露依赖拓扑。
 * `/livez` 只回答进程存活；`/readyz/api` 读取数据库可达性 + 启动配置校验状态
 * （审计 #91：`config.envSchema` 布尔位，不携带键名/缺失明细），二者任一失败即 503。
 * 旧 `/health` 保留为 readiness（就绪）别名，避免已有编排器把兼容升级误判为可接流量。
 *
 * HA-2（R-18 排水链·C4）：SIGTERM 排水期 `/readyz/api` 与 `/health`（同 handler 天然
 * 同翻）读进程级排水旗翻 503——这是编排方摘流量的既有依据（compose healthcheck 即读
 * `/readyz/api`）；`/livez` 零改恒 200（进程还活着）。摘流量靠 readiness 翻脸、拒客靠
 * onRequest 503 门（main.ts），两信号分工不混。
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
    // HA-2 C4：排水期最先翻脸（先于 DB 探测——排水期池可能已在收尾，旗是确定性信号）。
    if (getSseRegistry().isDraining()) {
      throw new HttpException({ status: 'draining' as const }, HttpStatus.SERVICE_UNAVAILABLE);
    }
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
