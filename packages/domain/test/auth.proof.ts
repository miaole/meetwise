/** 认证核心证明（确定性,无 IO）：密码哈希加盐/常量时间;令牌签名+过期+防篡改 fail-closed。 pnpm auth:prove */
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const SECRET = 's3cr3t-hmac-key', NOW = 1_000_000;

A('正确密码验证通过', verifyPassword('hunter2', hashPassword('hunter2')));
A('错误密码拒绝', !verifyPassword('wrong', hashPassword('hunter2')));
A('同密码两次哈希不同(随机盐)', hashPassword('x') !== hashPassword('x'));
A('哈希不含明文密码', !hashPassword('mySecretPw').includes('mySecretPw'));
A('畸形 stored 拒绝', !verifyPassword('x', 'garbage'));

const tok = signToken('userA', SECRET, 3600, NOW);
A('令牌校验还原 uid', verifyToken(tok, SECRET, NOW) === 'userA');
A('过期令牌拒绝(now>exp)', verifyToken(tok, SECRET, NOW + 3601) === null);
A('错密钥拒绝', verifyToken(tok, 'wrong-key', NOW) === null);
A('篡改 payload 拒绝', (() => { const s = tok.split('.')[1]; const bad = Buffer.from(JSON.stringify({ uid: 'attacker', exp: NOW + 3600 })).toString('base64url') + '.' + s; return verifyToken(bad, SECRET, NOW) === null; })());
A('篡改签名拒绝', verifyToken(tok.slice(0, -2) + 'xx', SECRET, NOW) === null);
A('畸形令牌拒绝', verifyToken('nodot', SECRET, NOW) === null && verifyToken('', SECRET, NOW) === null);

console.log(`\n${fail === 0 ? '✓ 认证核心 全部通过' : '✗ ' + fail + ' 失败'}`); process.exit(fail === 0 ? 0 : 1);
