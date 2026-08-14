import { Controller, Post, Get, Delete, Param, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { UploadResumeDto, UploadResumeFileDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { ResumeService } from './resume.service';

/**
 * 简历 HTTP 适配层(薄):解析/校验输入 → 调 ResumeService → 映射 HTTP。**不碰 SQL/事务**(修审计 F1)。
 * 全经 principal/RLS,只见自己的简历。
 */
@Controller('resume')
@UseGuards(PrincipalGuard)
export class ResumeController {
  constructor(private readonly resumes: ResumeService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  // 校验由共享契约 UploadResumeDto(text ≥20)在 pipe 完成——契约即真相,不手写 if(修审计 F2)。
  upload(@Req() req: any, @Body(new ZodValidationPipe(UploadResumeDto)) b: UploadResumeDto) {
    return this.resumes.upload(req.principal, b);
  }

  @Post('file')
  @HttpCode(HttpStatus.OK)
  // 文件上传(PDF/Word/图片):服务端提取+清洗→结构化。契约 UploadResumeFileDto 真校验。
  uploadFile(@Req() req: any, @Body(new ZodValidationPipe(UploadResumeFileDto)) b: UploadResumeFileDto) {
    return this.resumes.uploadFile(req.principal, b);
  }

  @Get()
  list(@Req() req: any) {
    return this.resumes.list(req.principal);
  }

  @Post(':id/reparse')
  @HttpCode(HttpStatus.OK)
  reparse(@Param('id') id: string, @Req() req: any) {
    return this.resumes.reparse(req.principal, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.resumes.remove(req.principal, id);
  }

  @Get(':id/profile')
  profile(@Param('id') id: string, @Req() req: any) {
    return this.resumes.profile(req.principal, id);
  }
}
