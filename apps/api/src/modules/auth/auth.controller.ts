import { Controller, Post, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { Credentials, SignupDto } from '@meetwise/contracts';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../../platform/zod.pipe';

/** 真鉴权 HTTP 适配层(薄):注册/登录 → 调 AuthService → 映射 HTTP。**不碰 SQL/哈希/令牌**(修审计 F1)。公开端点。 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  // 注册用 SignupDto(email + 密码≥8 + 身份 role:求职者/招聘方)真校验。
  signup(@Body(new ZodValidationPipe(SignupDto)) b: SignupDto) {
    return this.auth.signup(b);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // 登录**故意不**套 Credentials:① 限流必须看到所有尝试(短密码也要计入,不能被 pipe 提前 400);② 登录不校验密码复杂度(可能是历史短密码)。校验由 service 做最小化(都非空)。
  login(@Body() b: { email?: string; password?: string }) {
    return this.auth.login(b);
  }
}
