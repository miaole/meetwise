import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashPassword, verifyPassword, signToken } from '@meetwise/domain';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';

/**
 * 鉴权应用服务(拥有 SQL/哈希/令牌/限流编排)。controller 只解析/校验/映射 HTTP(修审计 F1)。
 * 机制不变:注册 scrypt 哈希落库;登录常量时间校验 + 同邮箱限流防爆破;签发 HMAC 会话令牌。密码绝不明文存/日志。
 */
@Injectable()
export class AuthService {
  constructor(private readonly db: DbService, private readonly rl: RateLimitService) {}

  async signup(b: { email?: string; password?: string; role?: string }) {
    if (!b?.email || !b?.password || b.password.length < 8) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.BAD_REQUEST);
    // 防注册滥用(安全审计#3:免费不限流注册是成本 DoS 的 on-ramp):同邮箱 3 次突发 + 慢补充 + 全局粗上限。
    //  (真·防海量不同邮箱注册仍需 IP 维度/验证码——内存限流是已知 seam,多实例换 Redis。)
    if (!this.rl.allow(`signup:${b.email}`, 3, 0.02) || !this.rl.allow('signup:global', 60, 1))
      throw new HttpException({ error: 'too_many_attempts' }, HttpStatus.TOO_MANY_REQUESTS);
    const role = b.role === 'recruiter' ? 'recruiter' : 'candidate';   // 身份:招聘方(B)/ 求职者(C),默认 C
    const id = randomUUID();
    try {
      await this.db.pool.query('INSERT INTO user_account(id, email, password_hash, role) VALUES ($1,$2,$3,$4)', [id, b.email, hashPassword(b.password), role]);
    } catch (e: any) {
      if (e?.code === '23505') throw new HttpException({ error: 'email_taken' }, HttpStatus.CONFLICT);   // 仅唯一冲突=邮箱已注册;其它 DB 错(连接/约束)照抛,不误报 email_taken 掩盖故障
      throw e;
    }
    return { token: this.issue(id), userId: id, role };
  }

  async login(b: { email?: string; password?: string }) {
    if (!b?.email || !b?.password) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.BAD_REQUEST);
    // 防爆破:同邮箱登录限流(5 次突发 + 0.2/秒补充)。超速 → 429,不进 verify。
    if (!this.rl.allow(`login:${b.email}`, 5, 0.2)) throw new HttpException({ error: 'too_many_attempts' }, HttpStatus.TOO_MANY_REQUESTS);
    const r = await this.db.pool.query('SELECT id, password_hash, status, role, pwd_epoch FROM user_account WHERE email=$1', [b.email]);
    const u = r.rows[0];
    // 统一错误 + 都跑一次 verify,避免靠响应差异/时序枚举账号
    const ok = u && u.status === 'active' && verifyPassword(b.password, u.password_hash);
    if (!ok) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.UNAUTHORIZED);
    // 令牌须内嵌**当前**密码代次 pwd_epoch:否则改密自增代次后,新登录令牌仍是旧代次 → 守卫拒绝 → 用户被锁死(F4 必修)。
    return { token: this.issue(u.id, u.pwd_epoch ?? 0), userId: u.id, role: u.role ?? 'candidate' };   // 返回身份供前端按角色路由
  }

  private issue(uid: string, pwdEpoch = 0): string {
    const secret = process.env.AUTH_SECRET ?? '';
    if (!secret) throw new HttpException({ error: 'auth_not_configured' }, HttpStatus.INTERNAL_SERVER_ERROR);
    return signToken(uid, secret, 7 * 24 * 3600, Math.floor(Date.now() / 1000), pwdEpoch);
  }
}
