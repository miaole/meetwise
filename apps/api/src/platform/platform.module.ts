import { Global, Module } from '@nestjs/common';
import { DbService } from './db.service';
import { AdminGuard } from './admin.guard';
import { RecruiterGuard } from './recruiter.guard';
import { RateLimitService } from './rate-limit.service';

/** 跨切面基建（全局）：数据访问。守卫/管道按需在各模块声明，连接池单例由此导出。 */
@Global()
@Module({
  providers: [DbService, AdminGuard, RecruiterGuard, RateLimitService],
  exports: [DbService, AdminGuard, RecruiterGuard, RateLimitService],
})
export class PlatformModule {}
