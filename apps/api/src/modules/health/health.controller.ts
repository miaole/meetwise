import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { APP_VERSION, APP_REVISION } from '../../version';

/**
 * 公开探针，不读取 principal（主体）也不泄露依赖拓扑。
 * `/livez` 只回答进程存活；`/readyz/api` 读取三面（任一失败即 503）：
 * ①数据库可达（SELECT 1）②启动配置校验状态（审计 #91：`config.envSchema` 布尔位）
 * ③迁移版本一致（审计 #92：账本 max(version) = 迁移目录 max——`schema.migration` 位，
 * 未迁移完/漂移即 503）。位值只有 ok/invalid/mismatch/unknown 固定枚举，
 * 不携带键名、版本号字符串或拓扑（本类注记纪律）。旧 `/health` 保留为 readiness（就绪）
 * 别名，避免已有编排器把兼容升级误判为可接流量。
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
