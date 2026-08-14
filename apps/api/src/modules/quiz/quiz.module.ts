import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

/** 押题(resume-quiz)模块缝。DbService 由全局 PlatformModule 提供;声明控制器 + 应用服务(编排进 service,controller 薄)。 */
@Module({
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
