import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

/** interview 模块缝。DbService 由全局 PlatformModule 提供，这里声明控制器 + 应用服务(修审计 F1:编排进 service)。 */
@Module({
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
