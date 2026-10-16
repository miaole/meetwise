import { Controller, Post, Body, Req, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { SignupDto } from '@meetwise/contracts';
import { AuthService } from './auth.service';
import { PrincipalGuard } from '../../platform/principal.guard';
import { ZodValidationPipe } from '../../platform/zod.pipe';

/** 真鉴权 HTTP 适配层(薄):注册/登录/登出 → 调 AuthService → 映射 HTTP。**不碰 SQL/哈希/令牌**(修审计 F1)。signup/login 公开端点;logout 须过 PrincipalGuard(吊销当前主体会话)。 */
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.OK)
  // 注册用 SignupDto(email + 密码≥8 + 身份 role:求职者/招聘方)真校验。
  // b110:req.ip 传给 service 撑 signup:ip 桶(trustProxy 保持关闭=socket 地址,防 XFF 伪造,Ban §5.10)。
  signup(@Req() req: any, @Body(new ZodValidationPipe(SignupDto)) b: SignupDto) {
    return this.auth.signup(b, req?.ip);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  // 登录**故意不**套 Credentials pipe:① 限流必须看到所有尝试(短密码也要计入,不能被 pipe 提前 400);② 登录不校验密码复杂度(可能是历史短密码)。
  // 5A-1(#90/#34·裁决项②):校验由 service 做**最小化接线**(Credentials 形·email 格式/长度+password 类型/≤128,不设 min)后入限流;
  // req.ip 传给 service 撑 login:ip/global 桶(#180·同 signup 的 trustProxy 纪律)。
  login(@Req() req: any, @Body() b: { email?: string; password?: string }) {
    return this.auth.login(b, req?.ip);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(PrincipalGuard)
  // 5A-1 #112:登出服务端化——吊销当前 jti 会话(0169 表)。须过 PrincipalGuard(鉴权后才知吊销谁的会话;
  // guard 已验 jti 并挂 req.jti)。legacy 无 jti 令牌如实回 revoked:false(无可吊销会话行,R1)。
  logout(@Req() req: any) {
    return this.auth.logout(req.principal, req.jti);
  }
}
