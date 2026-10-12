/**
 * AUTHZ-HARDEN 5A-1 簇② prove — #180 login **ip 桶**（§2-3 第一臂）：同 IP 分散 4 邮箱连击 → 第 4 发 429。
 * R2 参数注入短窗：RL_LOGIN_IP='3,0.01'（容量 3·近零补充=窗内恒锁）+ RL_LOGIN_GLOBAL='1000,0.01'（不触发）——
 * 每邮箱恰用 1 次（per-email 桶容量 5 不触发），故 429 必来自 ip 桶。独立进程=独立桶态。
 * env 须先于 auth.service 模块载入（桶参数模块顶读）→ 动态 import 保障时序。
 */
process.env.RL_LOGIN_IP = '3,0.01';
process.env.RL_LOGIN_GLOBAL = '1000,0.01';

const { boot, mkAssert } = await import('./_neg-harness');

async function main() {
  const h = await boot();
  const { A, done } = mkAssert('authz5a:login-ip-throttle');
  const results: any[] = [];
  for (let i = 0; i < 4; i++) {
    results.push(await h.post('/auth/login', {}, { email: `ip-spray-${i}@x.com`, password: 'whatever1' }));
  }
  A('#180 ip 桶/前 3 发(3 邮箱)进校验 → 401（per-email 桶未触发:每邮箱仅 1 发）',
    results[0].status === 401 && results[1].status === 401 && results[2].status === 401);
  A('#180 ip 桶/同 IP 第 4 邮箱连击 → 429 too_many_attempts（分散 email 喷洒被 ip 桶收口）',
    results[3].status === 429 && results[3].body?.error === 'too_many_attempts');
  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
