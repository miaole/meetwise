import { Module } from '@nestjs/common';
import { DiagnosisController } from './diagnosis.controller';
import { DiagnosisService } from './diagnosis.service';

/** 简历诊断(resume-diagnosis)模块缝。DbService 由全局 PlatformModule 提供;声明控制器 + 应用服务(编排进 service,controller 薄)。 */
@Module({
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
