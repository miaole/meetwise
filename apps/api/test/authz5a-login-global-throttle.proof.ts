/**
 * AUTHZ-HARDEN 5A-1 簇② prove — #180 login **global 桶**（§2-3 第二臂）：全库连击击穿 → 第 4 发 429。
 * R2 参数注入短窗：RL_LOGIN_GLOBAL='3,0.01'（近零补充=窗内恒锁）+ RL_LOGIN_IP='1000,0.01'（不触发）——
 * 每邮箱恰用 1 次（per-email 桶容量 5 不触发）、同 IP 共 4 发（ip 桶容量 1000 不触发），
 * 故 429 必来自 global 桶。独立进程=独立桶态；env 先于 auth.service 模块载入（动态 import）。
 */
process.env.RL_LOGIN_GLOBAL = '3,0.01';
process.env.RL_LOGIN_IP = '1000,0.01';

const { boot, mkAssert } = await import('./_neg-harness');

async function main() {
  const h = await boot();
  const { A, done } = mkAssert('authz5a:login-global-throttle');
  const results: any[] = [];
  for (let i = 0; i < 4; i++) {
    results.push(await h.post('/auth/login', {}, { email: `global-spray-${i}@x.com`, password: 'whatever1' }));
  }
  A('#180 global 桶/前 3 发进校验 → 401（ip 桶容量 1000·per-email 各 1 发,均未触发）',
    results[0].status === 401 && results[1].status === 401 && results[2].status === 401);
  A('#180 global 桶/第 4 发击穿全局阈值 → 429 too_many_attempts（全库喷洒被 global 桶收口）',
    results[3].status === 429 && results[3].body?.error === 'too_many_attempts');
  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
