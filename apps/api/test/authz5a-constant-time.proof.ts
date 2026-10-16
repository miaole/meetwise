/**
 * AUTHZ-HARDEN 5A-1 簇② prove — #33 登录恒时序（verify 调用计数证·非墙钟）+ #90 Credentials 形接线 +
 * #111 应用层归一 HTTP 面。隔离库（run-e2e-isolated 门）·est live=0。
 * 断言力：①不存在账户/存在错密/停用三路 verify 恰各 1 次（注入计数）；②两路调用次数相等；
 * ③假哈希同形且真跑 scrypt；④auth.service 源面恒时序接线（无短路 verifyPassword·单点 verifyLogin）；
 * ⑤HTTP 面：ghost/错密同码同形 401 + 大写邮箱命中同账户（#111 五臂的 HTTP 侧补充臂）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert } from './_neg-harness';

const CT = { 'content-type': 'application/json' };
const bearer = (t: string) => ({ authorization: 'Bearer ' + t });
import { verifyPassword, verifyLogin, LOGIN_DUMMY_HASH, normalizeEmail } from '@meetwise/domain';

async function main() {
  const { A, done } = mkAssert('authz5a:constant-time');

  // ── ①/② verify 调用计数（注入计数 verify——计数证非墙钟;#34 async 形注入签名 (pw,stored)=>Promise<boolean>）──
  const counts = { missing: -1, existing: -1 };
  const countingVerify = (() => {
    let n = 0;
    return { run: async (pw: string, stored: string) => { n++; return verifyPassword(pw, stored); }, get: () => n, reset: () => { n = 0; } };
  })();
  {
    countingVerify.reset();
    const r = await verifyLogin(undefined, 'whatever1', countingVerify.run);   // 账户不存在路径（u=undefined）
    counts.missing = countingVerify.get();
    A('恒时序/不存在账户 verify 恰跑 1 次（假哈希补位）', counts.missing === 1 && r === false);
  }
  {
    countingVerify.reset();
    const r = await verifyLogin('scrypt$0123456789abcdef0123456789abcdef$' + 'ab'.repeat(32), 'wrongpw99', countingVerify.run);   // 存在账户·错密路径
    counts.existing = countingVerify.get();
    A('恒时序/存在账户错密 verify 恰跑 1 次（真实哈希同参）', counts.existing === 1 && r === false);
  }
  A('恒时序/不存在与存在错密 verify 调用次数相等（§2-2 计数证）', counts.missing === counts.existing);

  // ── ③ 假哈希同形 + 真跑 scrypt ──
  A('恒时序/LOGIN_DUMMY_HASH 与 hashPassword 输出同形（scrypt$<32hex>$<64hex>）',
    /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/.test(LOGIN_DUMMY_HASH));
  A('恒时序/假哈希经 verifyPassword 真跑一次 scrypt（同参可验·恒 false）', (await verifyPassword('whatever1', LOGIN_DUMMY_HASH)) === false);
  A('恒时序/normalizeEmail 归一形（trim+lower 单一 helper）', normalizeEmail('  AbC@X.COM ') === 'abc@x.com');

  // ── ④ 服务接线静态断言（auth.service 源面：单点 verifyLogin·零短路 verifyPassword）──
  {
    const src = readFileSync(fileURLToPath(new URL('../src/modules/auth/auth.service.ts', import.meta.url)), 'utf8');
    A('恒时序/auth.service 单点 verifyLogin(u?.password_hash,...)（不存在/停用同路）', src.includes('verifyLogin(u?.password_hash'));
    A('恒时序/auth.service 无直呼 verifyPassword（计数等价的结构前提）', !src.includes('verifyPassword('));
    A('#90/auth.service 服务侧 Credentials.shape.email 接线（格式+≤254·R4 不弱化）', src.includes('Credentials.shape.email.safeParse'));
    A('R4/auth.service password ≤128 上限在位（不弱化 Credentials 上限）', src.includes('b.password.length > 128'));
    A('#180/auth.service login 三桶序 per-email→ip→global（|| 短路）',
      src.includes('`login:${email}`') && src.includes('`login:ip:${ip ?? \'unknown\'}`') && src.includes("'login:global'"));
    A('R2/RL_LOGIN_IP/RL_LOGIN_GLOBAL env 覆写口在位（RL_SIGNUP_IP 同款双值形）',
      src.includes('process.env.RL_LOGIN_IP') && src.includes('process.env.RL_LOGIN_GLOBAL'));
  }

  // ── ⑤ HTTP 面（真栈）──
  const h = await boot();
  {
    const ghost = await h.post('/auth/login', {}, { email: 'ghost-ct@x.com', password: 'whatever1' });
    const wrongpw = await h.post('/auth/login', {}, { email: 'pw@x.com', password: 'wrongpw99' });
    A('恒时序/HTTP ghost 与错密同码同形 401（响应差异面=零）',
      ghost.status === 401 && wrongpw.status === 401
      && JSON.stringify(ghost.body) === JSON.stringify(wrongpw.body));
  }
  {
    // #111 HTTP 侧：大写邮箱注册归一落库 + 大写登录命中同一账户
    const s = await h.post('/auth/signup', {}, { email: 'UpperCase@X.com', password: 'upperpw12' });
    A('#111/HTTP signup 大写邮箱 → 200(注册受理)', s.status === 200 && !!s.body?.token);
    const row = await h.pool.query('SELECT email FROM user_account WHERE id=$1', [s.body?.userId]);
    A('#111/HTTP signup 大写邮箱 → 库内归一落库', row.rows[0]?.email === 'uppercase@x.com');
    const l = await h.post('/auth/login', {}, { email: 'UPPERCASE@X.COM', password: 'upperpw12' });
    A('#111/HTTP 大写邮箱登录命中同一账户（userId 相等）', l.status === 200 && l.body?.userId === s.body?.userId);
  }

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
