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
  const s1 = await h.post('/auth/signup', {}, { email: 'chgpwd-lock@x.com', password: 'lockpw1234' });
  const s2 = await h.post('/auth/signup', {}, { email: 'chgpwd-other@x.com', password: 'otherpw12' });
  const t1 = s1.body?.token as string, t2 = s2.body?.token as string;

  const f1 = await h.post('/profile/change-password', bearer(t1), { oldPassword: 'WRONG-1', newPassword: 'newpw12345' });
  const f2 = await h.post('/profile/change-password', bearer(t1), { oldPassword: 'WRONG-2', newPassword: 'newpw12345' });
  A('#120 失败锁/连败 2 次各自 401 wrong_password（未及锁定）',
    f1.status === 401 && f1.body?.error === 'wrong_password' && f2.status === 401 && f2.body?.error === 'wrong_password');

  const locked = await h.post('/profile/change-password', bearer(t1), { oldPassword: 'lockpw1234', newPassword: 'newpw12345' });
  A('#120 失败锁/第 3 次**正确旧密码**也 429 password_retry_later（锁定面在 verify 之前·短窗）',
    locked.status === 429 && locked.body?.error === 'password_retry_later');

  const other = await h.post('/profile/change-password', bearer(t2), { oldPassword: 'otherpw12', newPassword: 'othernew12' });
  A('#120 失败锁/异 principal 不波及（独立分桶·他人照常改密 200 changed）',
    other.status === 200 && other.body?.changed === true);
  await done();
}

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
