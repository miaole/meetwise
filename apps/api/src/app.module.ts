import { Module } from '@nestjs/common';
import { PlatformModule } from './platform/platform.module';
import { InterviewModule } from './modules/interview/interview.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { DiagnosisModule } from './modules/diagnosis/diagnosis.module';
import { HealthController } from './modules/health/health.controller';
import { HealthService } from './modules/health/health.service';
import { AuthController } from './modules/auth/auth.controller';
import { ResumeController } from './modules/resume/resume.controller';
import { ResumeService, OCR_VISION_CLIENT } from './modules/resume/resume.service';
import { type ModelClient } from '@meetwise/ai-runtime';
import { createOcrVisionClient } from './modules/resume/ocr-model-client.ts';
import { CommerceController } from './modules/commerce/commerce.controller';
import { CommerceWebhookController } from './modules/commerce/commerce-webhook.controller';
import { CommerceService } from './modules/commerce/commerce.service';
import { PrivacyController } from './modules/privacy/privacy.controller';
import { NotificationController } from './modules/notification/notification.controller';
import { NotificationService } from './modules/notification/notification.service';
import { ProfileController } from './modules/profile/profile.controller';
import { ProfileService } from './modules/profile/profile.service';
import { LegalController } from './modules/legal/legal.controller';
import { AdminController } from './modules/admin/admin.controller';
import { AdminService } from './modules/admin/admin.service';
import { AuthService } from './modules/auth/auth.service';
import { PrivacyService } from './modules/privacy/privacy.service';
import { RolesService } from './modules/roles/roles.service';
import { RecruiterController } from './modules/recruiter/recruiter.controller';
import { RecruiterService } from './modules/recruiter/recruiter.service';
import { JobsController } from './modules/jobs/jobs.controller';
import { JobsService } from './modules/jobs/jobs.service';
import { ApplicationsController } from './modules/jobs/applications.controller';
import { ApplicationsService } from './modules/jobs/applications.service';
import { RolesController } from './modules/roles/roles.controller';
import { MetricsController } from './modules/metrics/metrics.controller';

@Module({
  imports: [PlatformModule, InterviewModule, QuizModule, DiagnosisModule],
  controllers: [HealthController, AuthController, ResumeController, CommerceController, CommerceWebhookController, PrivacyController, NotificationController, ProfileController, LegalController, AdminController, RolesController, RecruiterController, JobsController, ApplicationsController, MetricsController],
  providers: [
    ResumeService,
    // OCR 预览双旗（OCR_ENABLED=1 且 OCR_PREVIEW=1）可派发；生产/enforce/
    // 公开只读预览仍拒绝装配。createOcrVisionClient 读进程 env。
    { provide: OCR_VISION_CLIENT, useFactory: (): ModelClient => createOcrVisionClient() },
    AuthService, CommerceService, ProfileService, NotificationService, AdminService, PrivacyService, RolesService, RecruiterService, JobsService, ApplicationsService, HealthService],   // 应用服务层(controller→service→db 仓储,修审计 F1)
})
export class AppModule {}
