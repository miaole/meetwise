import { Controller, Get, Patch, Post, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { updateSettingsSchema, type UpdateSettingsDto, ChangePasswordDto, DeactivateDto } from '@meetwise/contracts';
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
  // AUTHZ-HARDEN 5A-1 #120:req.ip 传给 service 撑 chgpwd:ip 桶(trustProxy 纪律同 signup/login)。
  // #84/API-HARDEN-A:裸 @Body 收编 ChangePasswordDto——字段 optional(缺字段仍由 service 回具名词
  // invalid_password,neg-auth 断言面零漂移),pipe 收「在场的值必 string 且 ≤128」:非字符串真值此前
  // 穿透 falsy 检查直打 scrypt(TypeError→500),超帽密码此前可放行(128 帽=Credentials R4 同源)。
  changePassword(@Req() req: any, @Body(new ZodValidationPipe(ChangePasswordDto)) b: ChangePasswordDto) {
    return this.profiles.changePassword(req.principal, b, req?.ip);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.ACCEPTED)   // 注销+账户级删除受理（UNSTUB-ERASE rev2）：202 软删受理,非完成态
  // #84/API-HARDEN-A:同上收编 DeactivateDto(非字符串 password 此前 scrypt TypeError→500;
  // 缺 password 仍由 service 回 password_required,词零漂移)。
  deactivate(@Req() req: any, @Body(new ZodValidationPipe(DeactivateDto)) b: DeactivateDto) {
    return this.profiles.deactivate(req.principal, b?.password);
  }
}
