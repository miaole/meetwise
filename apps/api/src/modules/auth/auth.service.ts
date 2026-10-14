import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { hashPassword, normalizeEmail, verifyLogin } from '@meetwise/domain';
import { Credentials } from '@meetwise/contracts';
import { errCode } from '@meetwise/db';
import { DbService } from '../../platform/db.service';
import { RateLimitService } from '../../platform/rate-limit.service';
import { issueSessionTokenOrThrow, revokeSession } from '../../platform/auth-session';

// b110 §1.2.6:signup:ip 桶参数 prod 钉死 (10, 0.05)(突发 10·稳态 ~3/分,沿 signup:email 注释量级纪律)。
// RL_SIGNUP_IP(容量,速率 两值)为独立限流段覆写口,仅 perf/E2E 启动档放宽并显式落档
// (scripts/run-performance-e2e.mjs),prod 不设即用钉死值;禁删桶检查/禁静默 special-case(Ban §5.11)。
const RL_SIGNUP_IP_RAW = (process.env.RL_SIGNUP_IP ?? '10,0.05').split(',');
const SIGNUP_IP_CAPACITY = Number(RL_SIGNUP_IP_RAW[0]) > 0 ? Number(RL_SIGNUP_IP_RAW[0]) : 10;
const SIGNUP_IP_REFILL = Number(RL_SIGNUP_IP_RAW[1]) > 0 ? Number(RL_SIGNUP_IP_RAW[1]) : 0.05;

// AUTHZ-HARDEN 5A-1 R2(#180):login ip/global 桶参数同沿 RL_SIGNUP_IP「容量,速率」双值形 env 覆写口——
// prod 钉死默认值,perf/E2E 需放宽/收窄时显式设 env 并落档(证明注入短窗即此口),禁删桶检查/禁静默
// special-case。量级:login:ip(60,1)/login:global(300,5) 对齐 signup 三桶纪律且留足单实例回归套件头寸
// (neg-auth 全程 ~20 次 login 不触新桶;改密桶参数在 profile.service 同款口沿)。
const RL_LOGIN_IP_RAW = (process.env.RL_LOGIN_IP ?? '60,1').split(',');
const LOGIN_IP_CAPACITY = Number(RL_LOGIN_IP_RAW[0]) > 0 ? Number(RL_LOGIN_IP_RAW[0]) : 60;
const LOGIN_IP_REFILL = Number(RL_LOGIN_IP_RAW[1]) > 0 ? Number(RL_LOGIN_IP_RAW[1]) : 1;
const RL_LOGIN_GLOBAL_RAW = (process.env.RL_LOGIN_GLOBAL ?? '300,5').split(',');
const LOGIN_GLOBAL_CAPACITY = Number(RL_LOGIN_GLOBAL_RAW[0]) > 0 ? Number(RL_LOGIN_GLOBAL_RAW[0]) : 300;
const LOGIN_GLOBAL_REFILL = Number(RL_LOGIN_GLOBAL_RAW[1]) > 0 ? Number(RL_LOGIN_GLOBAL_RAW[1]) : 5;

/**
 * 鉴权应用服务(拥有 SQL/哈希/令牌/限流编排)。controller 只解析/校验/映射 HTTP(修审计 F1)。
 * 机制不变:注册 scrypt 哈希落库;登录常量时间校验 + 限流防爆破;签发 HMAC 会话令牌。密码绝不明文存/日志。
 * AUTHZ-HARDEN 5A-1:#111/#131 邮箱归一(normalizeEmail 单一 helper·写侧入库前+读侧入参先归一);
 * #33 恒时序(verifyLogin 内存假哈希·verify 恰一次与账户状态无关);#90/#34 login 服务侧最小校验(Credentials 形接线);
 * #180 login 三桶(per-email→ip→global);#35/#112 会话令牌(kid/jti)+登出服务端化(改密限流/失败锁在 profile.service 同簇收口)。
 */
@Injectable()
export class AuthService {
  constructor(private readonly db: DbService, private readonly rl: RateLimitService) {}

  async signup(b: { email?: string; password?: string; role?: string }, ip?: string) {
    if (!b.email || !b.password || b.password.length < 8) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.BAD_REQUEST);
    // 防注册滥用(安全审计#3:免费不限流注册是成本 DoS 的 on-ramp):同邮箱 3 次突发 + 慢补充 + 全局粗上限。
    //  (真·防海量不同邮箱注册仍需 IP 维度/验证码——内存限流是已知 seam,多实例换 Redis。)
    // b110 §1.2.6:桶序钉死 per-email→ip→global(|| 短路;429 断言确定性);signup:ip 桶参数钉死 (10, 0.05)。
    // 5A-1 #111:per-email 桶 key 用归一邮箱——大小写变体共享同桶,不产生第二限流身份。
    const email = normalizeEmail(b.email);
    if (!(await this.rl.allow(`signup:${email}`, 3, 0.02)) || !(await this.rl.allow(`signup:ip:${ip ?? 'unknown'}`, SIGNUP_IP_CAPACITY, SIGNUP_IP_REFILL)) || !(await this.rl.allow('signup:global', 60, 1)))
      throw new HttpException({ error: 'too_many_attempts' }, HttpStatus.TOO_MANY_REQUESTS);
    const role = b.role === 'recruiter' ? 'recruiter' : 'candidate';   // 身份:招聘方(B)/ 求职者(C),默认 C
    const id = randomUUID();
    // 守卫后 b.email/b.password 已收窄为 string；但 b 是参数(可变),TS 不把收窄带入闭包,
    // 故捕获为 const 再进 asGateway 回调,否则 strictNullChecks 下又退回 string | undefined。
    // #111:入库前归一(trim+lower,与登录/邀请侧同一 helper);SQL 网关函数(0168)内再兜底一次(双闸)。
    const password = b.password;
    try {
      await this.db.asGateway((c) => c.query(
        'SELECT gateway_auth_signup($1,$2,$3,$4)',
        [id, email, hashPassword(password), role],
      ));
    } catch (e: unknown) {
      if (errCode(e) === '23505') throw new HttpException({ error: 'email_taken' }, HttpStatus.CONFLICT);   // 仅唯一冲突=邮箱已注册;其它 DB 错(连接/约束)照抛,不误报 email_taken 掩盖故障
      throw e;
    }
    // b110 R1 双通道感知:recruiter 注册落审核队列(DB 0155·回填重编号 0152→0155),token 照发(账户可登录、B 端功能全 403),
    // signup 模式即时读 body approvalStatus;login 模式靠 B 端 API 403 分码感知(晚一跳 UX 让步)。
    if (role === 'recruiter') return { token: await this.issue(id), userId: id, role, approvalStatus: 'pending' as const };
    return { token: await this.issue(id), userId: id, role };
  }

  async login(b: { email?: string; password?: string }, ip?: string) {
    // #90/#34-login 服务侧最小校验(Credentials 既有形接线·裁决项②=不挂 controller pipe,「限流必须看到所有
    // 尝试+登录不校验复杂度」两理由原文保留于 auth.controller:21):email 沿 Credentials.shape.email(格式+≤254,
    // R4 上限不弱化);password 只校验类型+≤128(R4)+非空——**不设 min(8)**(登录不校验复杂度,历史短密码可尝试)。
    // 先 trim 再格式解析:表单尾随空白不误伤;格式不合格即 400,垃圾不入限流 key(#90 防无界桶键内存面)。
    if (!b || typeof b.password !== 'string' || b.password.length === 0 || b.password.length > 128)
      throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.BAD_REQUEST);
    const rawEmail = typeof b.email === 'string' ? b.email.trim() : '';
    const parsedEmail = Credentials.shape.email.safeParse(rawEmail);
    if (!parsedEmail.success) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.BAD_REQUEST);
    const email = normalizeEmail(parsedEmail.data);
    // 防爆破三桶(#180):对齐 signup 桶序 per-email→ip→global(|| 短路;429 断言确定性)——封「分散 email 喷洒」:
    // 同 IP 多邮箱连击吃 ip 桶,全库喷洒吃 global 桶(R2:RL_LOGIN_IP/RL_LOGIN_GLOBAL env 覆写口)。
    if (!(await this.rl.allow(`login:${email}`, 5, 0.2))
      || !(await this.rl.allow(`login:ip:${ip ?? 'unknown'}`, LOGIN_IP_CAPACITY, LOGIN_IP_REFILL))
      || !(await this.rl.allow('login:global', LOGIN_GLOBAL_CAPACITY, LOGIN_GLOBAL_REFILL)))
      throw new HttpException({ error: 'too_many_attempts' }, HttpStatus.TOO_MANY_REQUESTS);
    const r = await this.db.asGateway((c) => c.query(
      'SELECT id, password_hash, status, role, pwd_epoch FROM gateway_auth_login($1)',
      [email],
    ));
    const u = r.rows[0];
    // 统一错误 + #33 恒时序:verifyLogin 对「真实哈希或同一内存假哈希」**恒跑恰一次**——账户不存在/停用
    // 也同参 scrypt 同耗时,响应差异/时序皆不可枚举账号(verify 调用次数与账户状态无关,计数证非墙钟);
    // 状态判定移到 verify 之后。注释自此与实现相符(旧注释「都跑一次 verify」系短路与实现不符,已如实化)。
    const passOk = verifyLogin(u?.password_hash, b.password);
    const ok = u !== undefined && u.status === 'active' && passOk;
    if (!ok) throw new HttpException({ error: 'invalid_credentials' }, HttpStatus.UNAUTHORIZED);
    // 令牌须内嵌**当前**密码代次 pwd_epoch:否则改密自增代次后,新登录令牌仍是旧代次 → 守卫拒绝 → 用户被锁死(F4 必修)。
    // 5A-1 #35:issue 走会话签发(kid/jti+0169 会话行);返回身份供前端按角色路由。
    return { token: await this.issue(u.id, u.pwd_epoch ?? 0), userId: u.id, role: u.role ?? 'candidate' };
  }

  // #112 登出服务端化:吊销当前 jti 会话(0169 表 revoked_at),令牌窗内即失效(守卫会话查+evict 即时)。
  // R1:存量无 jti 令牌无会话行可吊销(legacy 无态路径至 TTL 自然过期)——如实回 revoked:false,不假宣称服务端吊销;
  // web logoutAction 无论结果都清 cookie(客户端面)+服务端尽力吊销(服务端面),两面如实分工。
  async logout(principal: string, jti?: string) {
    const revoked = jti ? await revokeSession(this.db, principal, jti) : false;
    return { loggedOut: true as const, revoked };
  }

  private async issue(uid: string, pwdEpoch = 0): Promise<string> {
    return issueSessionTokenOrThrow(this.db, uid, pwdEpoch);
  }
}
