/**
 * authz5a2-password-max.proof.ts — AUTHZ-HARDEN 5A-2 R4 断言:password max(128) 上界不弱化。
 *
 * R4 处方(§0.5):Credentials shape 含 password max(128)(DoS 上界·防超长输入把 scrypt 变 CPU DoS·
 * 非复杂度要求)——「断言与实现不得弱化该上限」。实现面 5A-1 已落(contracts :12/:15 + login service 侧
 * ≤128 检查);本 prove 钉断言:
 *   ①契约面:Credentials/SignupDto 129 拒·128 收(上界恰在 128·不得更紧或更松)·min(8) 仍在(登录面
 *     不设 min 属既有裁决·注册面保留);
 *   ②HTTP 面:signup 129 密码 → 400(pipe);login 129 密码 → 400(service 最小校验);
 *   ③静态面:login service 源含 ≤128 检查(R4 不弱化实现 witness)。
 * est live=0(零外呼;HTTP 臂走隔离库 harness)。
 *   运行:pnpm -C apps/api authz5a2:password-max(隔离库包装 run-e2e-isolated authz5a2:password-max:prove)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Credentials, SignupDto } from '@meetwise/contracts';
import { boot, mkAssert } from './_neg-harness';

const here = dirname(fileURLToPath(import.meta.url));

async function main() {
  const { A, done } = mkAssert('authz5a2:password-max');

  // ── ① 契约面(zod 边界)──
  const pw = (n: number) => 'a'.repeat(n);
  const credParse = (password: string) => Credentials.safeParse({ email: 'r4@test.example', password }).success;
  A('契约: Credentials password 129 → 拒(上界在位)', !credParse(pw(129)));
  A('契约: Credentials password 128 → 收(边界不弱化·恰在 128)', credParse(pw(128)));
  A('契约: Credentials password 8 → 收(min(8) 保留·上界非复杂度替代)', credParse(pw(8)));
  A('契约: SignupDto password 129 → 拒', !SignupDto.safeParse({ email: 'r4@test.example', password: pw(129) }).success);
  A('契约: SignupDto password 128 → 收', SignupDto.safeParse({ email: 'r4@test.example', password: pw(128) }).success);

  // ── ③ 静态面(实现 witness)──
  const svcSrc = readFileSync(join(here, '..', 'src', 'modules', 'auth', 'auth.service.ts'), 'utf8');
  A('静态: login service 侧 ≤128 检查在位(R4 实现不弱化·5A-1 落线面零触 witness)',
    svcSrc.includes('b.password.length > 128'));
  const contractsSrc = readFileSync(join(here, '..', '..', '..', 'packages', 'contracts', 'src', 'index.ts'), 'utf8');
  A('静态: contracts Credentials 行含 password max(128)', /Credentials = z\.object\(\{ email[^\n]*password: z\.string\(\)\.min\(8\)\.max\(128\)/.test(contractsSrc));

  // ── ② HTTP 面(负路径·不落库即拒)──
  const h = await boot();
  const r1 = await h.post('/auth/signup', {}, { email: 'r4max@test.example', password: pw(129) });
  A('HTTP: signup 129 密码 → 400(pipe 拒·不入库)', r1.status === 400);
  const r2 = await h.post('/auth/login', {}, { email: 'r4max@test.example', password: pw(129) });
  A('HTTP: login 129 密码 → 400(service 最小校验·scrypt 零执行)', r2.status === 400);
  const r3 = await h.post('/auth/login', {}, { email: 'not-an-email', password: 'x' });
  A('HTTP: login 坏 email → 400(Credentials.shape.email 接线零翻)', r3.status === 400);

  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });
