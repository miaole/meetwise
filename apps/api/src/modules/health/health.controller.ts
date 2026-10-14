import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { APP_VERSION, APP_REVISION } from '../../version';
import { getSseRegistry } from '../../platform/sse-registry';

/**
 * 公开探针，不读取 principal（主体）也不泄露依赖拓扑。
 * `/livez` 只回答进程存活；`/readyz/api` 读取三面（任一失败即 503）：
 * ①数据库可达（SELECT 1）②启动配置校验状态（审计 #91：`config.envSchema` 布尔位）
 * ③迁移版本一致（审计 #92：账本 max(version) = 迁移目录 max——`schema.migration` 位，
 * 未迁移完/漂移即 503）。`schema.migration` 位实发恰 ok/mismatch/unknown 三值固定枚举
 * （invalid 仅属 `config.envSchema` 配置域，不混入本位）。位面不携带键名、版本号字符串或
 * 拓扑（本类注记纪律）。旧 `/health` 保留为 readiness（就绪）别名，避免已有编排器把兼容
 * 升级误判为可接流量。
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
    // 审计 #91/#92：readiness = config 位 + database 可达 + 迁移版本位。降级体保持最小
    // （status + config + schema 固定枚举位，无 error/明细字段——validate.ts 降级体契约）；
    // db_unreachable 时迁移位只能回答 unknown（账本读不到≠已证一致，fail-closed）。
    const config = this.health.configReady();
    const database = await this.health.apiReady();
    const migration = database === 'ok' ? 'ok' as const
      : database === 'migration_mismatch' ? 'mismatch' as const
      : 'unknown' as const;
    if (config && database === 'ok') {
      return { status: 'ok' as const, config: { envSchema: 'ok' as const }, schema: { migration: 'ok' as const } };
    }
    throw new HttpException(
      {
        status: 'degraded' as const,
        config: { envSchema: config ? 'ok' as const : 'invalid' as const },
        schema: { migration },
      },
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
