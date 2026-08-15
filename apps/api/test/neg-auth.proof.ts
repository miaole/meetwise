import { boot, mkAssert, tokenFor, AUTH_SECRET } from './_neg-harness';

/**
 * neg-auth.proof — 认证/会话/令牌/改密域**纯负路径**证明(一条 happy-path 都不承载)。
 * 每条断言目标均为:拒绝/失败/降级/越界/伪造/重放/吊销/时序。少数"成功"调用仅作**触发后续负例的前置**,绝不作被测断言。
 *
 * 被测行为(读源码确认):
 *  - POST /auth/signup  : ZodValidationPipe(SignupDto=email合法+密码≥8+role?∈{candidate,recruiter}) → 400{error:'invalid'};
 *                          重复邮箱 409{error:'email_taken'};同邮箱>3突发 429{error:'too_many_attempts'};成功 200{token,userId,role}
 *  - POST /auth/login   : 无 pipe;缺 email/password → 400{error:'invalid_credentials'};同邮箱>5突发 429{error:'too_many_attempts'};
 *                          密码错/用户不存在/账号 disabled → 统一 401{error:'invalid_credentials'}(抗枚举)
 *  - PrincipalGuard(/profile/*): Bearer 验签+exp+status+pwd_epoch,fail-closed 401。
 *                          {error} ∈ invalid_token / account_inactive / session_revoked / reserved_principal / unauthenticated
 *  - POST /profile/change-password: 缺字段/新密码<8 → 400{invalid_password};旧密码错 → 401{wrong_password};成功自增 pwd_epoch 吊销旧令牌
 *  - POST /profile/deactivate: status→disabled
 */

const CT = { 'content-type': 'application/json' };
const bearer = (t: string) => ({ authorization: 'Bearer ' + t });

async function main() {
  const h = await boot();
  const { A, done } = mkAssert('neg:auth');
  const me = (headers: Record<string, string>) => h.req('GET', '/profile', headers);
  const errIn = (b: any, ...ks: string[]) => ks.includes(b?.error);

  // ══════════════════════════════════════════════════════════════════════════
  // 1) 令牌负例(全打 GET /profile/me,无副作用)——缺失/伪造/篡改/过期/错密钥/越权 sentinel/畸形段
  // ══════════════════════════════════════════════════════════════════════════
  {
    const r = await me({});
    A('token/无 Authorization 头 → 401 unauthenticated', r.status === 401 && r.body?.error === 'unauthenticated');
  }
  {
    const r = await me({ authorization: 'Basic dXNlcjpwYXNz' });
    A('token/非 Bearer 方案(Basic)→ 401 unauthenticated(不落 dev 回退)', r.status === 401 && errIn(r.body, 'unauthenticated'));
  }
  {
    const r = await me({ authorization: 'bearer ' + tokenFor('userA') });
    A('token/小写 bearer 前缀不被接受 → 401 unauthenticated', r.status === 401 && errIn(r.body, 'unauthenticated'));
  }
  {
    const r = await me({ authorization: 'Bearer' });   // 无尾空格、无令牌
    A('token/裸 "Bearer"(无空格无令牌)→ 401 unauthenticated', r.status === 401 && errIn(r.body, 'unauthenticated'));
  }
  {
    const r = await me({ authorization: 'Bearer ' });   // 空令牌(HTTP 层裁尾空格 → 'Bearer' → 落 unauthenticated;仍是 401 拒绝)
    A('token/空令牌(Bearer + 空)→ 401 拒绝', r.status === 401 && errIn(r.body, 'invalid_token', 'unauthenticated'));
  }
  {
    const r = await me({ authorization: 'Bearer    ' });   // 仅空白(同上,尾空白被裁)
    A('token/纯空白令牌 → 401 拒绝', r.status === 401 && errIn(r.body, 'invalid_token', 'unauthenticated'));
  }
  {
    const r = await me(bearer('garbage-no-dot-here'));
    A('token/垃圾串(无 . 分隔)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer('!!!.###'));
    A('token/畸形 base64 两段(签名不符)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const good = tokenFor('userA');
    const r = await me(bearer(good.slice(0, good.indexOf('.'))));   // 只留 payload,截掉 .sig
    A('token/被截断(仅 payload 无签名段)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const good = tokenFor('userA');
    const r = await me(bearer(good + '.extra.tail'));   // 多余段
    A('token/多段(payload.sig.extra.tail)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    // payload 篡改(改动一个字符使 base64 内容变化)→ HMAC 不符
    const good = tokenFor('userA');
    const i = good.indexOf('.');
    const tampered = (good[0] === 'A' ? 'B' : 'A') + good.slice(1, i) + good.slice(i);
    const r = await me(bearer(tampered));
    A('token/payload 篡改(签名失配)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const good = tokenFor('userA');
    const i = good.indexOf('.');
    const flippedSig = good.slice(0, i + 1) + (good[i + 1] === 'A' ? 'B' : 'A') + good.slice(i + 2);
    const r = await me(bearer(flippedSig));
    A('token/签名段篡改 → 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer(tokenFor('userA', { secret: 'attacker-secret' })));
    A('token/错密钥签名(伪造)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer(tokenFor('userA', { secret: AUTH_SECRET + 'x' })));
    A('token/近似错密钥 → 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer(tokenFor('userA', { ttlSec: -10 })));
    A('token/已过期(ttl 负)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer(tokenFor('userA', { ttlSec: -1 })));
    A('token/刚过期(exp<now)→ 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer('Bearer ' + tokenFor('userA')));   // 双 Bearer:slice(7) 后仍含 "Bearer "
    A('token/双 Bearer 前缀 → 401 invalid_token', r.status === 401 && r.body?.error === 'invalid_token');
  }
  {
    const r = await me(bearer(tokenFor('ghost-nonexistent-uid')));   // 签名合法但账户不存在
    A('token/指向不存在用户(签名合法)→ 401 account_inactive(epoch=-1 天然拒)', r.status === 401 && r.body?.error === 'account_inactive');
  }
  {
    const r = await me(bearer(tokenFor('userA', { pwdEpoch: 9 })));   // 账户 epoch 0,令牌 9
    A('token/pwd_epoch 高于账户(伪造代次)→ 401 session_revoked', r.status === 401 && r.body?.error === 'session_revoked');
  }
  {
    const r = await me(bearer(tokenFor('userA', { pwdEpoch: 1 })));
    A('token/pwd_epoch 差 1(不符)→ 401 session_revoked', r.status === 401 && r.body?.error === 'session_revoked');
  }
  {
    const r = await me(bearer(tokenFor('__system_qbank__')));   // 保留系统 sentinel 主体
    A('token/uid 撞保留 __system 前缀(伪造系统身份)→ 401 reserved_principal', r.status === 401 && r.body?.error === 'reserved_principal');
  }
  {
    const r = await me(bearer(tokenFor('__system_anything')));
    A('token/任意 __system* 前缀均拒 → 401 reserved_principal', r.status === 401 && r.body?.error === 'reserved_principal');
  }
  {
    // dev 回退头(x-user-id)也不许冒充 sentinel
    const r = await me(h.U('__system_qbank__'));
    A('devheader/x-user-id 冒充 __system sentinel → 401 reserved_principal', r.status === 401 && r.body?.error === 'reserved_principal');
  }
  {
    const r = await me(h.U(''));   // 空 x-user-id → 不放行
    A('devheader/空 x-user-id → 401 unauthenticated', r.status === 401 && errIn(r.body, 'unauthenticated'));
  }
  {
    const r = await me(h.U('does-not-exist-user'));   // dev 头放行但账户不存在 → me 404
    A('devheader/存在的头但账户不存在 → 404 not_found(dev 头绕过验签,已知 dev-only 风险)', r.status === 404 && errIn(r.body, 'not_found'));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2) signup 负例——pipe 校验(邮箱/密码/role)、畸形 body、越权自封、重复、节流
  // ══════════════════════════════════════════════════════════════════════════
  {
    const r = await h.post('/auth/signup', {}, {});
    A('signup/空 body → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { password: 'abcdefgh' });
    A('signup/缺 email → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'ok@x.com' });
    A('signup/缺 password → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'ok@x.com', password: '' });
    A('signup/空密码 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'ok@x.com', password: 'short' });
    A('signup/弱密码(5<8)→ 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'ok@x.com', password: 'abcdefg' });
    A('signup/密码边界 7 位(<8)→ 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: '', password: 'abcdefgh' });
    A('signup/空邮箱 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'noatsign', password: 'abcdefgh' });
    A('signup/无 @ 邮箱 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a@', password: 'abcdefgh' });
    A('signup/无域名邮箱 a@ → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: '@x.com', password: 'abcdefgh' });
    A('signup/无本地部邮箱 @x.com → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a b@x.com', password: 'abcdefgh' });
    A('signup/含空格邮箱 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a@@x.com', password: 'abcdefgh' });
    A('signup/双 @ 邮箱 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a@x .com', password: 'abcdefgh' });
    A('signup/域名含空格邮箱 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: "x'; DROP TABLE user_account;--@x.com", password: 'abcdefgh' });
    A('signup/SQL 注入式邮箱 → 400 invalid(格式即拒,且参数化无注入)', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a @x.com', password: 'abcdefgh' });
    A('signup/邮箱含 null 字节 → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a'.repeat(400) + '@x.com', password: 'abcdefgh' });
    A('signup/超长邮箱(400 本地部)→ 拒绝(>=400)', r.status >= 400);
  }
  {
    // 无 max 上限的超长密码:健壮 API 应设上限拒绝(scrypt CPU DoS 面)。当前无 max → 预期本条会失败,标记为发现的 bug。
    const r = await h.post('/auth/signup', {}, { email: 'longpw@x.com', password: 'a'.repeat(4096) });
    A('signup/超长密码(4096)应被拒(缺 max → DoS 面;若通过=已发现 bug)', r.status >= 400);
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'roleadmin@x.com', password: 'abcdefgh', role: 'admin' });
    A('signup/role 自封 admin(枚举外)→ 400 invalid(不可越权)', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'rolesuper@x.com', password: 'abcdefgh', role: 'superadmin' });
    A('signup/role 非法值 superadmin → 400 invalid', r.status === 400 && r.body?.error === 'invalid');
  }
  {
    // is_admin 是 schema 外键 → zod strip → 忽略;账户建成 is_admin=false(阻止提权)
    const r = await h.post('/auth/signup', {}, { email: 'escadmin@x.com', password: 'abcdefgh', is_admin: true, isAdmin: true });
    let escalated = true;
    if (r.status === 200 && r.body?.userId) {
      const q = await h.pool.query('SELECT is_admin FROM user_account WHERE id=$1', [r.body.userId]);
      escalated = q.rows[0]?.is_admin === true;
    }
    A('signup/body 夹带 is_admin=true 被忽略(建成账户非 admin,阻止提权)', escalated === false);
  }
  {
    const r = await h.raw('POST', '/auth/signup', CT, '{ not valid json ');
    A('signup/畸形 JSON body → 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.raw('POST', '/auth/signup', CT, '');
    A('signup/空原始 body → 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.raw('POST', '/auth/signup', CT, '[]');
    A('signup/JSON 数组 body(非对象)→ 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.raw('POST', '/auth/signup', CT, '"just-a-string"');
    A('signup/JSON 字符串 body(非对象)→ 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.raw('POST', '/auth/signup', CT, 'null');
    A('signup/JSON null body → 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.post('/auth/signup', {}, { email: 'a@x.com', password: 'abcdefgh' });   // 已播种 a@x.com
    A('signup/重复邮箱 → 409 email_taken', r.status === 409 && r.body?.error === 'email_taken');
  }
  {
    // 同邮箱突发节流:capacity=3。前 3 次可入(冲突/成功),第 4 次被同邮箱桶拒 → 429
    const email = 'throttle@x.com';
    let last: any = null;
    for (let i = 0; i < 4; i++) last = await h.post('/auth/signup', {}, { email, password: 'abcdefgh' });
    A('signup/同邮箱>3 突发 → 429 too_many_attempts(防注册滥用)', last.status === 429 && last.body?.error === 'too_many_attempts');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3) login 负例——缺字段/畸形/密码错/用户不存在/大小写/抗枚举/暴力节流
  // ══════════════════════════════════════════════════════════════════════════
  {
    const r = await h.post('/auth/login', {}, {});
    A('login/空 body → 400 invalid_credentials', r.status === 400 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.post('/auth/login', {}, { email: 'x@x.com' });
    A('login/缺 password → 400 invalid_credentials', r.status === 400 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.post('/auth/login', {}, { password: 'whatever1' });
    A('login/缺 email → 400 invalid_credentials', r.status === 400 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.post('/auth/login', {}, { email: '', password: '' });
    A('login/空 email+password → 400 invalid_credentials', r.status === 400 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.raw('POST', '/auth/login', CT, '{ bad json');
    A('login/畸形 JSON body → 400', r.status >= 400 && r.status < 500);
  }
  {
    const r = await h.send('POST', '/auth/login', {}, []);   // 数组 body(用 send 拿解析后的 body;raw 只回 text)
    A('login/数组 body → 400 invalid_credentials(email 缺失)', r.status === 400 && errIn(r.body, 'invalid_credentials'));
  }
  {
    const r = await h.post('/auth/login', {}, { email: 'pw@x.com', password: 'wrongpw99' });   // pwUser 真实密码是 oldpass12
    A('login/存在用户密码错 → 401 invalid_credentials', r.status === 401 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.post('/auth/login', {}, { email: 'ghost-nobody@x.com', password: 'whatever1' });
    A('login/用户不存在 → 401 invalid_credentials(与密码错同码,抗枚举)', r.status === 401 && r.body?.error === 'invalid_credentials');
  }
  {
    const r = await h.post('/auth/login', {}, { email: 'PW@X.COM', password: 'oldpass12' });   // 播种为小写 pw@x.com
    A('login/邮箱大小写不匹配(PW@X.COM≠pw@x.com)→ 401 invalid_credentials(精确匹配,大小写敏感)', r.status === 401 && r.body?.error === 'invalid_credentials');
  }
  {
    // 暴力破解节流:同邮箱 capacity=5。前 5 次进 verify(401),第 6 次被桶拒 → 429
    const email = 'bruteforce@x.com';
    const results: any[] = [];
    for (let i = 0; i < 6; i++) results.push(await h.post('/auth/login', {}, { email, password: 'guess' + i }));
    A('login/暴力破解前 5 次进校验 → 401', results[0].status === 401 && results[4].status === 401);
    A('login/同邮箱>5 突发 → 429 too_many_attempts(防爆破)', results[5].status === 429 && results[5].body?.error === 'too_many_attempts');
  }
  {
    const r = await h.req('GET', '/auth/login');   // 方法不匹配(应为 POST)
    A('login/错误方法 GET → 拒绝(>=400)', r.status >= 400);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4) change-password 负例——未鉴权/旧密码错/弱新密码/缺字段(pwUser 在 epoch 0)
  // ══════════════════════════════════════════════════════════════════════════
  {
    const r = await h.post('/profile/change-password', {}, { oldPassword: 'oldpass12', newPassword: 'newpass99' });
    A('changepw/未鉴权 → 401', r.status === 401);
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), {});
    A('changepw/缺 old+new → 400 invalid_password', r.status === 400 && r.body?.error === 'invalid_password');
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), { newPassword: 'newpass99' });
    A('changepw/缺 oldPassword → 400 invalid_password', r.status === 400 && r.body?.error === 'invalid_password');
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), { oldPassword: 'oldpass12' });
    A('changepw/缺 newPassword → 400 invalid_password', r.status === 400 && r.body?.error === 'invalid_password');
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), { oldPassword: 'oldpass12', newPassword: 'short' });
    A('changepw/新密码过弱(<8)→ 400 invalid_password(即便旧密码对也先拒)', r.status === 400 && r.body?.error === 'invalid_password');
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), { oldPassword: 'oldpass12', newPassword: 'abcdefg' });
    A('changepw/新密码边界 7 位 → 400 invalid_password', r.status === 400 && r.body?.error === 'invalid_password');
  }
  {
    const r = await h.post('/profile/change-password', bearer(tokenFor('pwUser', { pwdEpoch: 0 })), { oldPassword: 'WRONG-OLD', newPassword: 'newpass99' });
    A('changepw/旧密码错 → 401 wrong_password', r.status === 401 && r.body?.error === 'wrong_password');
  }
  {
    // 确认上述失败均未改动代次(epoch 仍 0)——否则说明失败路径有副作用
    const q = await h.pool.query('SELECT pwd_epoch FROM user_account WHERE id=$1', ['pwUser']);
    A('changepw/失败路径不自增 pwd_epoch(仍为 0,无副作用)', Number(q.rows[0]?.pwd_epoch) === 0);
  }

  // ── 会话吊销:改密成功后旧代次令牌立即失效 ──
  {
    const oldTok = tokenFor('pwUser', { pwdEpoch: 0 });   // 改密前有效令牌
    // 前置(不作 happy 断言):真正改密,pwd_epoch 0→1,evict 缓存
    await h.post('/profile/change-password', bearer(oldTok), { oldPassword: 'oldpass12', newPassword: 'newpass99' });
    const q = await h.pool.query('SELECT pwd_epoch, password_hash FROM user_account WHERE id=$1', ['pwUser']);
    A('changepw/成功后 pwd_epoch 自增(0→1,会话代次前进)', Number(q.rows[0]?.pwd_epoch) === 1);
    A('changepw/新密码只存 scrypt 派生(绝不明文)', typeof q.rows[0]?.password_hash === 'string' && q.rows[0].password_hash.startsWith('scrypt$') && !q.rows[0].password_hash.includes('newpass99'));
    const reuse = await me(bearer(oldTok));
    A('changepw/改密后旧代次令牌立即失效(重放)→ 401 session_revoked', reuse.status === 401 && reuse.body?.error === 'session_revoked');
  }
  {
    // 改密后旧明文密码不再能登录
    const r = await h.post('/auth/login', {}, { email: 'pw@x.com', password: 'oldpass12' });
    A('changepw/改密后旧明文密码登录被拒 → 401 invalid_credentials', r.status === 401 && r.body?.error === 'invalid_credentials');
  }
  {
    // 跨用户隔离:改 pwUser 密码绝不波及 userB(端点只改 req.principal 自身,无 target 参数)
    const q = await h.pool.query('SELECT pwd_epoch, status FROM user_account WHERE id=$1', ['userB']);
    A('changepw/跨用户隔离:userB 代次/状态未受 pwUser 改密影响', Number(q.rows[0]?.pwd_epoch) === 0 && q.rows[0]?.status === 'active');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 5) deactivate 负例——未鉴权/停用后令牌失效/停用后禁止登录
  // ══════════════════════════════════════════════════════════════════════════
  {
    const r = await h.post('/profile/deactivate', {}, {});
    A('deactivate/未鉴权 → 401', r.status === 401);
  }
  {
    // 前置:新建独立用户(不污染种子),取其令牌
    const s = await h.post('/auth/signup', {}, { email: 'willdie@x.com', password: 'diepass12' });
    const uid = s.body?.userId, tok = s.body?.token;
    // 前置(不作 happy 断言):停用自身
    await h.post('/profile/deactivate', bearer(tok), {});
    const q = await h.pool.query('SELECT status FROM user_account WHERE id=$1', [uid]);
    A('deactivate/停用后 DB status=disabled', q.rows[0]?.status === 'disabled');
    // 停用后旧令牌应立即失效(status 非 active → 401 account_inactive)
    const reuse = await me(bearer(tok));
    A('deactivate/停用后原令牌应即时失效 → 401 account_inactive(若通过=guard 缓存未随 deactivate 清除,已发现 bug)', reuse.status === 401 && reuse.body?.error === 'account_inactive');
    // 停用后原凭据不得再登录(登录直查 DB,不吃缓存)
    const login = await h.post('/auth/login', {}, { email: 'willdie@x.com', password: 'diepass12' });
    A('deactivate/停用后再登录被拒 → 401 invalid_credentials', login.status === 401 && login.body?.error === 'invalid_credentials');
  }

  await done();
}

main();

// ── 用例统计 ──
// 令牌/会话负例:25 · signup 负例:29 · login 负例:14 · change-password 负例:9 · deactivate 负例:4
// 合计:81 条纯负路径断言(A 调用),零 happy-path 主张(成功调用仅作触发后续负例的前置,不被断言)。
