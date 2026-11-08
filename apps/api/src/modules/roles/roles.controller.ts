import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { RoleMatchDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { RolesService } from './roles.service';

/**
 * 岗位库 + 简历岗位匹配 HTTP 适配层(薄):解析/校验 → 调 RolesService。不碰 SQL(修审计 F1)。
 */
@Controller('roles')
@UseGuards(PrincipalGuard)
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  list() { return this.roles.list(); }

  @Post('match')
  @HttpCode(HttpStatus.OK)
  // #84/API-HARDEN-A:裸 @Body 收编 RoleMatchDto(pipe 只收类型+64 帽;缺字段仍由下方具名词
  // missing_resume_id 裁决零漂移;非 UUID 字符串仍由 service UUID_RE 门回 404 语义表,不进 pipe)。
  match(@Req() req: any, @Body(new ZodValidationPipe(RoleMatchDto)) b: RoleMatchDto) {
    if (!b?.resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    return this.roles.match(req.principal, b.resumeId);
  }
}
