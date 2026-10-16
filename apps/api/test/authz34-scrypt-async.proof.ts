/**
 * AUTHZ #34 残面小刀 prove — scrypt 异步化(promisify 形)·隔离容器(run-e2e-isolated 门)·est live=0。
 * 断言力(REQUEST §2-1):
 *   ①静态:domain/auth.ts scryptSync 零命中 + promisify/scrypt import 在位 + timingSafeEqual 仍在位(恒时序比对保持)
 *     + 生产面 `await hashPassword|await verifyPassword|await verifyLogin` witness 恰 5 处(±0 熔断);
 *   ②参数等价正证:promisify(scrypt)(pw,salt,32) 与 scryptSync(pw,salt,32) 输出逐字节相等(存量哈希兼容的机械证明);
 *   ③计数证恒等:verifyLogin 注入 async 计数 verify——不存在/存在错密 verify 恰各 1 次·计数相等(#33 语义零变);
 *   ④Promise 形:hashPassword/verifyPassword/verifyLogin 调用返回 instanceof Promise;
 *   ⑤HTTP 面:signup→login roundtrip 200 + login 错密 401 + deactivate 错密 401 wrong_password 且账户 status 未动
 *     (DB 直查仍 active——rev2 席2-B1-2 增臂·neg:auth 90 臂原值不扰动,本臂落本 proof)。
 * 运行:pnpm -C apps/api authz34:scrypt-async(隔离库包装 run-e2e-isolated authz34:scrypt-async:prove)。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { scrypt, scryptSync } from 'node:crypto';
import { hashPassword, verifyPassword, verifyLogin } from '@meetwise/domain';
import { boot, mkAssert } from './_neg-harness';

const here = dirname(fileURLToPath(import.meta.url));
const bearer = (t: string) => ({ authorization: 'Bearer ' + t });

async function main() {
  const { A, done } = mkAssert('authz34:scrypt-async');

  // ── ① 静态:同步形已除 + 异步机械在位 ──
  const authSrc = readFileSync(join(here, '..', '..', '..', 'packages', 'domain', 'src', 'auth.ts'), 'utf8');
  A('静态/domain auth.ts scryptSync 零命中(同步形已除)', !authSrc.includes('scryptSync'));
  A('静态/promisify+scrypt 异步机械在位(promisify 形·非 worker_threads)', authSrc.includes('promisify(scryptCallback)') && authSrc.includes("from 'node:util'"));
  A('静态/timingSafeEqual 仍在位(恒时序比对保持·异步化只移 KDF 不移比对)', authSrc.includes('timingSafeEqual'));
  {
    const svcSrc = readFileSync(join(here, '..', 'src', 'modules', 'auth', 'auth.service.ts'), 'utf8');
    const profileSrc = readFileSync(join(here, '..', 'src', 'modules', 'profile', 'profile.service.ts'), 'utf8');
    const witness = [...(`${svcSrc}\n${profileSrc}`.matchAll(/await hashPassword\(|await verifyPassword\(|await verifyLogin\(/g))].length;
    A('静态/生产面 await hashPassword|await verifyPassword|await verifyLogin 恰 5 处(±0 熔断)', witness === 5);
  }

  // ── ② 参数等价正证(存量哈希兼容的机械证明)──
  {
    const scryptAsync = promisify(scrypt) as (p: string | Buffer, s: string | Buffer, k: number) => Promise<Buffer>;
    const pw = 'a34-equivalence-probe';
    const salt = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');
    const fromAsync = await scryptAsync(pw, salt, 32);
    const fromSync = scryptSync(pw, salt, 32);
    A('参数等价/promisify(scrypt)(pw,salt,32) 与 scryptSync(pw,salt,32) 输出逐字节相等(存量 password_hash 零重哈希根基)',
      Buffer.compare(fromAsync, fromSync) === 0);
    A('参数等价/hashPassword 输出形零变(scrypt$<32hex盐>$<64hex dk>)', /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{64}$/.test(await hashPassword('a34-shape-probe')));
  }

  // ── ③ 计数证恒等(async 注入形·沿 authz5a-constant-time 形改写)──
  {
    let n = 0;
    const countingVerify = async (pw: string, stored: string) => { n++; return verifyPassword(pw, stored); };
    n = 0;
    const rMissing = await verifyLogin(undefined, 'whatever1', countingVerify);
    const missing = n;
    n = 0;
    const rExisting = await verifyLogin('scrypt$0123456789abcdef0123456789abcdef$' + 'ab'.repeat(32), 'wrongpw99', countingVerify);
    const existing = n;
    A('计数/不存在账户 verify 恰跑 1 次(假哈希补位)', missing === 1 && rMissing === false);
    A('计数/存在账户错密 verify 恰跑 1 次(真实哈希同参)', existing === 1 && rExisting === false);
    A('计数/两路 verify 调用次数相等(#33 恰一次语义零变)', missing === existing);
  }

  // ── ④ Promise 形 ──
  {
    const h1 = hashPassword('a34-promise-probe');
    const h2 = verifyPassword('x', 'garbage');
    const h3 = verifyLogin(undefined, 'x');
    A('Promise 形/hashPassword|verifyPassword|verifyLogin 返回 instanceof Promise',
      h1 instanceof Promise && h2 instanceof Promise && h3 instanceof Promise);
    await Promise.all([h1, h2, h3]);   // 不留悬挂 KDF
  }

  // ── ⑤ HTTP 面(真栈)──
  const h = await boot();
  {
    const s = await h.post('/auth/signup', {}, { email: 'a34rt@x.com', password: 'rtpass123' });
    const l = await h.post('/auth/login', {}, { email: 'a34rt@x.com', password: 'rtpass123' });
    A('HTTP/signup→login roundtrip 200 + token(scrypt 异步形全链路)', s.status === 200 && l.status === 200 && !!l.body?.token);
    const wrong = await h.post('/auth/login', {}, { email: 'a34rt@x.com', password: 'wrongpw99' });
    A('HTTP/login 错密 → 401 invalid_credentials', wrong.status === 401 && wrong.body?.error === 'invalid_credentials');
  }
  {
    // deactivate 错密臂(rev2 席2-B1-2):401 wrong_password 且账户 status 未动(DB 直查仍 active·零副作用)
    const s = await h.post('/auth/signup', {}, { email: 'a34deact@x.com', password: 'diepass12' });
    const uid = s.body?.userId;
    const d = await h.post('/profile/deactivate', bearer(s.body?.token ?? ''), { password: 'wrongpw99' });
    A('HTTP/deactivate 错密 → 401 wrong_password', d.status === 401 && d.body?.error === 'wrong_password');
    const q = await h.pool.query('SELECT status FROM user_account WHERE id=$1', [uid]);
    A('HTTP/deactivate 错密账户 status 未动(仍 active·零副作用)', q.rows[0]?.status === 'active');
  }

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
