import { Controller, Get, Patch, Post, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { updateSettingsSchema, type UpdateSettingsDto } from '@meetwise/contracts';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';
import { ProfileService } from './profile.service';

/**
 * 用户资料/设置 HTTP 适配层(薄):解析/校验输入 → 调 ProfileService → 映射 HTTP。**不碰 SQL/事务**(修审计 F1)。
 * principal=user_account.id。
 */
@Controller('profile')
@UseGuards(PrincipalGuard)
export class ProfileController {
  constructor(private readonly profiles: ProfileService) {}

  @Get()
  me(@Req() req: any) {
    return this.profiles.me(req.principal);
  }

  @Get('overview')
  overview(@Req() req: any) {
    return this.profiles.overview(req.principal);
  }

  @Get('growth')
  growth(@Req() req: any) {
    return this.profiles.growth(req.principal);
  }

  @Patch('settings')
  @HttpCode(HttpStatus.OK)
  settings(@Req() req: any, @Body(new ZodValidationPipe(updateSettingsSchema)) b: UpdateSettingsDto) {
    return this.profiles.settings(req.principal, b);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: any, @Body() b: { oldPassword?: string; newPassword?: string }) {
    return this.profiles.changePassword(req.principal, b);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  deactivate(@Req() req: any) {
    return this.profiles.deactivate(req.principal);
  }
}
