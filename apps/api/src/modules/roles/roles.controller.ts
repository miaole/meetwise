import { Controller, Get, Post, Body, Req, UseGuards, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { PrincipalGuard } from '../../platform/principal.guard';
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
  match(@Req() req: any, @Body() b: { resumeId?: string }) {
    if (!b?.resumeId) throw new HttpException({ error: 'missing_resume_id' }, HttpStatus.BAD_REQUEST);
    return this.roles.match(req.principal, b.resumeId);
  }
}
