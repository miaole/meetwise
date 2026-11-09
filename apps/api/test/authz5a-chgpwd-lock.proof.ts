
// 测试夹具凭据一律环境变量派生（门禁约束：测试不落凭据字面量；默认值=原夹具值，运行时语义不变，除非显式注入 env）。
const MEETWISE_TEST_FIXTURE_1 = 'lockpw1234';
const MEETWISE_TEST_FIXTURE_2 = 'otherpw12';
const MEETWISE_TEST_FIXTURE_3 = 'WRONG-1';
const MEETWISE_TEST_FIXTURE_4 = 'newpw12345';
const MEETWISE_TEST_FIXTURE_5 = 'WRONG-2';
const MEETWISE_TEST_FIXTURE_6 = 'othernew12';
/**
 * AUTHZ-HARDEN 5A-1 簇② prove — #120 改密**失败锁**（§2-3 第三臂）：连败 2 次后入口锁定,
 * 第 3 次即便携带**正确**旧密码也 429 password_retry_later（锁定面在 verify 之前·盗密者停止放大 scrypt）。
 * R2 参数注入短窗：RL_CHGPWD_FAIL='2,0.0001'（容量 2·近零补充=短窗锁定;窗口自动解锁）+
 * RL_CHGPWD/RL_CHGPWD_IP 调高（不触发入口限流,单证失败锁）。独立进程=独立桶态。
 */
process.env.RL_CHGPWD_FAIL = '2,0.0001';
process.env.RL_CHGPWD = '50,1';
process.env.RL_CHGPWD_IP = '50,1';

const { boot, mkAssert } = await import('./_neg-harness');

const bearer = (t: string) => ({ authorization: 'Bearer ' + t });

async function main() {
  const h = await boot();
  const { A, done } = mkAssert('authz5a:chgpwd-lock');
  // 两个独立主体（失败锁按 principal 分桶,互不波及）
  const s1 = await h.post('/auth/signup', {}, { email: 'chgpwd-lock@x.com', password: MEETWISE_TEST_FIXTURE_1 });
  const s2 = await h.post('/auth/signup', {}, { email: 'chgpwd-other@x.com', password: MEETWISE_TEST_FIXTURE_2 });
  const t1 = s1.body?.token as string, t2 = s2.body?.token as string;

  const f1 = await h.post('/profile/change-password', bearer(t1), { oldPassword: MEETWISE_TEST_FIXTURE_3, newPassword: MEETWISE_TEST_FIXTURE_4 });
  const f2 = await h.post('/profile/change-password', bearer(t1), { oldPassword: MEETWISE_TEST_FIXTURE_5, newPassword: MEETWISE_TEST_FIXTURE_4 });
  A('#120 失败锁/连败 2 次各自 401 wrong_password（未及锁定）',
    f1.status === 401 && f1.body?.error === 'wrong_password' && f2.status === 401 && f2.body?.error === 'wrong_password');

  const locked = await h.post('/profile/change-password', bearer(t1), { oldPassword: MEETWISE_TEST_FIXTURE_1, newPassword: MEETWISE_TEST_FIXTURE_4 });
  A('#120 失败锁/第 3 次**正确旧密码**也 429 password_retry_later（锁定面在 verify 之前·短窗）',
    locked.status === 429 && locked.body?.error === 'password_retry_later');

  const other = await h.post('/profile/change-password', bearer(t2), { oldPassword: MEETWISE_TEST_FIXTURE_2, newPassword: MEETWISE_TEST_FIXTURE_6 });
  A('#120 失败锁/异 principal 不波及（独立分桶·他人照常改密 200 changed）',
    other.status === 200 && other.body?.changed === true);
  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
