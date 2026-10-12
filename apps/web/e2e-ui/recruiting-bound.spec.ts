import { test, expect, type BrowserContext, type Page, type APIRequestContext } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';

/**
 * 真浏览器 C→B 闭环：两个独立 cookie context 分别扮演候选人/招聘方。
 *
 * 额度到账是支付方异步签名回调，不是前端可伪造的「购买」按钮；此用例仅以真实 HMAC webhook
 * provision 一笔测试额度，然后所有招聘方建岗/邀请、候选人简历/申请/开始/答题、前端 finalize
 * 都必须经 production Next UI 和 Server Action 完成。
 */
const API = process.env.E2E_API_BASE ?? 'http://127.0.0.1:8787';
const PASSWORD = 'strongpw123';

// 0155_recruiter_approval_gate 后 recruiter 注册落 approval_status='pending'，signup server action
// 早退反馈审核中（auth-actions.ts:29-31:零 cookie 零跳转），不再直落 /recruiter/jobs。recruiter 臂
// 随演为审核门三拍（e2e-assert-refresh REQUEST §1-②）：
//   拍1（本 helper 内）= pending 中间态断言：审核中反馈文案可见 + 未发生跳转（仍滞 /login）+ 零 mw_token cookie；
//   拍2 approveRecruiterViaAdminApi = 真 admin API approve（Ban mock·缺 E2E_ADMIN_TOKEN 即 throw fail-closed）；
//   拍3 loginViaUi = approve 后真 UI 登录，恢复原 waitForURL('**/recruiter/jobs', 20s) 断言行使
//       （login 模式无 approvalStatus 分流，auth-actions.ts:39 按角色 redirect）。
// candidate 臂零改（dashboard 直落）。
async function signUp(page: Page, email: string, role: 'candidate' | 'recruiter') {
  await page.goto('/login');
  if (role === 'recruiter') await page.getByRole('tab', { name: /招聘方/ }).click();
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole('button', { name: /注册|Sign up/i }).click();
  if (role === 'recruiter') {
    // 拍1:审核门中间态——文案锚「招聘方注册已提交」稳定前缀（auth-actions.ts:30）;早退必须零会话。
    await expect(page.getByText(/招聘方注册已提交/)).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(/\/login$/, { timeout: 5_000 });
    expect((await page.context().cookies()).some((c) => c.name === 'mw_token'),
      'pending 早退不得建立会话（auth-actions.ts:29-31 零 mw_token cookie）').toBe(false);
    return;
  }
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

// 拍2 的 admin 身份:isolated runner（run-e2e-ui.mjs）seedAdmin+HMAC 铸 E2E_ADMIN_TOKEN 经 spawn env 交接
// （镜像 e2e-recruiter-gate C1 形）。缺 token 即 throw fail-closed——Ban 静默跳过审批步
// （先例=e2e/helpers/auth.ts adminHeaders）。本 helper 只做 fail-closed 收窄,不伪造任何决策响应。
function adminAuthHeaders(): Record<string, string> {
  const token = process.env.E2E_ADMIN_TOKEN;
  if (typeof token !== 'string' || token.length === 0) {
    throw new Error('e2e_admin_bootstrap_missing: E2E_ADMIN_TOKEN absent — recruiter approval gate must not be skipped or mocked');
  }
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

// 拍2:真 admin API approve——先例=本 spec provisionPaidInterviewCredit（「唯一非 UI 的环境准备」形）。
// GET /admin/recruiter-approvals 按 email 取目标 id → POST decision {decision:'approve'} → 200 {decided:true}
// （admin.controller.ts recruiter-approvals 两端点;0155 admin_audit 留痕为 DB 侧副产品,零断言负担）。
async function approveRecruiterViaAdminApi(request: APIRequestContext, email: string) {
  const queue = await request.get(`${API}/admin/recruiter-approvals`, { headers: adminAuthHeaders() });
  expect(queue.status()).toBe(200);
  const { approvals } = await queue.json() as { approvals: Array<{ id: string; email: string; approval_status: string }> };
  const target = approvals.find((a) => a.email === email);
  expect(target, `审批队列应含待审 recruiter ${email}`).toBeTruthy();
  const decision = await request.post(`${API}/admin/recruiter-approvals/${target!.id}/decision`, { headers: adminAuthHeaders(), data: { decision: 'approve' } });
  expect(decision.status()).toBe(200);
  expect(await decision.json()).toEqual({ decided: true });
}

// 拍3:approve 后真 UI 登录——原 signUp :21 的 waitForURL 断言在此恢复行使（注册路径已不能直落,
// 登录路径才是审核放行后的真入口）。
async function loginViaUi(page: Page, email: string, role: 'candidate' | 'recruiter') {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.waitForURL(role === 'recruiter' ? '**/recruiter/jobs' : '**/dashboard', { timeout: 20_000 });
}

async function tokenOf(context: BrowserContext): Promise<string> {
  const token = (await context.cookies()).find((c) => c.name === 'mw_token')?.value;
  expect(token, '注册后 browser httpOnly cookie 中应存在 Bearer token').toBeTruthy();
  return token!;
}

async function provisionPaidInterviewCredit(request: APIRequestContext, token: string, nonce: string) {
  const order = await request.post(`${API}/commerce/orders`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': `ui-cb:${nonce}` },
    data: { productId: 'pack_10' },
  });
  expect(order.status()).toBe(200);
  const { orderId } = await order.json() as { orderId: string };
  const providerTxn = `ui-cb-${nonce}`;
  // 5A-2 #100:载荷 `${id}:${txn}:paid:${ts}`(±300s 防重放窗)·body 携 ts。
  const ts = Date.now();
  const sig = createHmac('sha256', process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret').update(`${orderId}:${providerTxn}:paid:${ts}`).digest('hex');
  const paid = await request.post(`${API}/commerce/webhook/pay/${orderId}`, { data: { providerTxn, sig, ts } });
  expect(paid.status()).toBe(200);
}

// 【第4件·0157 fixture 随演（EXEC 发现·协调方授权扩入 2026-10-11）】B271 片2 S2-C4（0157）后岗位绑定
// 面试=企业额度支付：候选人 UI「开始面试」走 start+begin 合一·预留招聘方企业桶
// （commerce.ts reserveEntitlementForApplication payer=招聘方），零余额 → 402 application_enterprise_pay_unavailable。
// 招聘方经真 commerce API 购企业域商品 ent_pack_50 + 真 HMAC webhook 入账（镜像 provisionPaidInterviewCredit
// 形·真 webhook 零 mock·零产品码）——须在候选人点「开始面试」前到账。
async function provisionEnterpriseCredit(request: APIRequestContext, recruiterToken: string, nonce: string) {
  const order = await request.post(`${API}/commerce/orders`, {
    headers: { authorization: `Bearer ${recruiterToken}`, 'content-type': 'application/json', 'idempotency-key': `ui-ent:${nonce}` },
    data: { productId: 'ent_pack_50' },
  });
  expect(order.status()).toBe(200);
  const { orderId } = await order.json() as { orderId: string };
  const providerTxn = `ui-ent-${nonce}`;
  // 5A-2 #100:载荷 `${id}:${txn}:paid:${ts}`(±300s 防重放窗)·body 携 ts。
  const ts = Date.now();
  const sig = createHmac('sha256', process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret').update(`${orderId}:${providerTxn}:paid:${ts}`).digest('hex');
  const paid = await request.post(`${API}/commerce/webhook/pay/${orderId}`, { data: { providerTxn, sig, ts } });
  expect(paid.status()).toBe(200);
}

/**
 * 提交最后一题时，SSE 的报告终态与 textarea 卸载是两个独立 React commit。
 * E2E 必须等待「下一题可答」或「终态已展示」任一事件，不能把 textarea
 * 消失后的瞬间误判为产品失败。
 *
 * G7V 终态校准（REQUEST 14f507e9 · pre-exec dual PASS C-HA-V1~V7/C-MO-V1~V7 · 协调方 EXEC 授权）：
 * 本夹具的单条脚本化答案旅程会触发自适应早停控制流（session_concluded/early_weak 投影——
 * 「自适应控制流，不是能力等级或招聘结论」），终态族按 adaptive-lifecycle.ts:339-365 结算语义分臂，
 * 各臂绑钱面后果（GET /interview/:id 暴露 status，interview.service.ts:47）：
 *   释放臂 unscored>0 → failInterviewAndRelease（commerce.ts:198）→ status='failed'（:68「额度已释放」文案此时为真）；
 *   扣费臂 unscored=0∧eligible>0 → completeInterviewAndConfirm（已扣费）→ status='completed'
 *     → 报告就绪（InterviewPanel.tsx:407）或报告暂不可用（view-model.ts:66 ·「已扣费」语义 Ban 写「已释放」）。
 * 此处只做「旅程已收尾」的臂甄别；PASS 谓词=下方各臂 exact 文案 + 钱面守卫联合断言
 * （Ban race OR 作谓词 · Ban 宽正则 · Ban 单臂钉死——三结算臂跨 run 方差经 sidecar 甄别实证）。
 */
const EARLY_STOP_COPY = '练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）';
const RELEASED_MSG_PART = '本次预留额度已释放';
const REPORT_DOWN_MSG_PART = '报告暂时无法生成';
const PRACTICE_FEEDBACK_PART = '练习完成 · 本次练习反馈';
const NO_REPORT_ON_CHARGED_MSG = '面试已完成并扣费结算，但未获得可信评分，本次不生成报告。岗位面试可从“我的投递”重新开始；其他面试可新建一场。';
function settlementFaces(page: Page) {
  return [page.getByText(EARLY_STOP_COPY), page.getByText(RELEASED_MSG_PART), page.getByText(REPORT_DOWN_MSG_PART), page.getByText(PRACTICE_FEEDBACK_PART)];
}
async function waitForTerminalOrAnswer(page: Page, timeout = 90_000): Promise<'terminal' | 'answer'> {
  const answer = page.locator('textarea[placeholder^="打字作答"]');
  const terminal = Promise.any(settlementFaces(page).map((f) => f.waitFor({ state: 'visible', timeout })));
  return Promise.race([
    terminal.then(() => 'terminal' as const),
    answer.waitFor({ state: 'visible', timeout }).then(() => 'answer' as const),
  ]);
}

// ─── G7U 路线甲夹具（docs REQUEST 4279595c · PRE 双审 PASS C-HA-1~5/C-MO-U6 · 协调方 EXEC 授权路线甲）───
// begin 前等异步 classify 的 route 决策到位（「等 route_decided 再 begin」· G7S harness :79 预留口径）。
// 只读轮询产品自产状态：SELECT-only 白名单沿 G7T sidecar 同族列（job_posting.id 仅作 join 键 /
// job_semantic_revision(status,created_at) / job_route_decision(route_outcome,attempt_outcome,created_at)），
// Ban interview_job.payload / ai_invocation_trace.output / 任何写语句（C-HA-1 · C-MO-U6）。
// 资格谓词 = 产品 bindApplicationRoute 同款（job-route-decision.ts:15「binding 只可绑 route_decided」）。
// cap = 60s（C-HA-3 EXEC 定值）· 周期 1s · 超时 = 诚实 FAIL（不静默 skip、不重试 begin、不调参造 flake）。
// 连接物料只经 isolated runner 既有 env 契约（PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE —— 与
// run-e2e-isolated.mjs 自身探针同款），零硬编码零 .env*（C-HA-2）。pg 客户端经 packages/db 的
// 声明依赖解析（createRequire 锚其 package.json），不改任何 manifest。
const ROUTE_DECIDED_WAIT_CAP_MS = 60_000;
const ROUTE_DECIDED_POLL_INTERVAL_MS = 1_000;

async function waitForRouteDecided(jobTitle: string, publishedAt: number): Promise<void> {
  for (const name of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) {
    if (!process.env[name]) throw new Error(`[g7u-fixture] ${name} missing — isolated runner env contract required (honest env FAIL)`);
  }
  const requireDbDriver = createRequire(new URL('../../../packages/db/package.json', import.meta.url));
  const { Client } = requireDbDriver('pg');
  const client = new Client({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: false,
    connectionTimeoutMillis: 2000,
  });
  await client.connect();
  const startedAt = Date.now();
  try {
    for (;;) {
      const r = await client.query(
        `SELECT r.status AS revision_status, r.created_at AS revision_created_at,
                d.route_outcome, d.attempt_outcome, d.created_at AS decision_created_at
           FROM job_posting j
           JOIN job_semantic_revision r ON r.job_id = j.id
      LEFT JOIN job_route_decision d ON d.job_id = r.job_id AND d.revision = r.revision
          WHERE j.title = $1
          ORDER BY r.revision DESC`,
        [jobTitle],
      );
      const row = r.rows[0] as
        | { revision_status: string; revision_created_at: Date; route_outcome: string | null; attempt_outcome: string | null; decision_created_at: Date | null }
        | undefined;
      if (row?.route_outcome === 'route_decided') {
        console.log(
          `[g7u-fixture] route_decided observed: ${Date.now() - startedAt}ms since wait start, `
          + `${startedAt - publishedAt}ms wait-anchor offset after publish click, revision_status=${row.revision_status}, `
          + `attempt_outcome=${row.attempt_outcome}, decision_created_at=${row.decision_created_at?.toISOString() ?? 'n/a'}`,
        );
        return;
      }
      if (Date.now() - startedAt >= ROUTE_DECIDED_WAIT_CAP_MS) {
        console.error(
          `✗ [g7u-fixture] route_decided timeout after ${ROUTE_DECIDED_WAIT_CAP_MS}ms cap `
          + `(last revision_status=${row?.revision_status ?? 'none'}, attempt_outcome=${row?.attempt_outcome ?? 'none'}) `
          + `— honest FAIL, begin not attempted`,
        );
        throw new Error(`[g7u-fixture] route not decided within ${ROUTE_DECIDED_WAIT_CAP_MS}ms cap — fixture wait failed honestly`);
      }
      await new Promise((resolve) => setTimeout(resolve, ROUTE_DECIDED_POLL_INTERVAL_MS));
    }
  } finally {
    await client.end().catch(() => {});
  }
}

test('C→B: real browser binds application to a new interview, completes it, and front-end finalizes it', async ({ page, browser, request }) => {
  // 这是一个 6 题的真实模型旅程：每题都包含 worker、模型评分和 SSE（服务器发送事件）回写。
  // 150 秒不足以覆盖已经实测的单轮真实语音延迟，导致“系统仍在正确收口”被误报为产品失败。
  // 此处只放宽旅程总预算；单服务延迟仍由 performance E2E（端到端）门独立量化，不能把该值当性能目标。
  test.setTimeout(420_000);
  const suffix = randomUUID();
  const candidateEmail = `e2e-bound-candidate-${suffix}@x.com`;
  const recruiterEmail = `e2e-bound-recruiter-${suffix}@x.com`;
  const jobTitle = `浏览器绑定岗位-${suffix.slice(0, 8)}`;

  // C 端：注册、同意隐私、上传已摄取简历（全为页面交互）。
  await signUp(page, candidateEmail, 'candidate');
  await page.goto('/resume');
  await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  await page.fill('textarea[name="text"]', '后端工程师，熟悉 Redis 限流、幂等订单和可观测性。');
  await page.getByRole('button', { name: '上传简历', exact: true }).click();
  await expect(page.getByText(/解析完成/).first()).toBeVisible({ timeout: 20_000 });
  const candidateToken = await tokenOf(page.context());
  // 真实支付回调是本用例唯一非 UI 的环境准备：前端不提供「假装支付成功」入口。
  await provisionPaidInterviewCredit(request, candidateToken, suffix);

  // B 端:独立浏览器身份注册（拍1:pending 中间态）→ 真 admin API approve（拍2）→ approve 后真 UI 登录
  // 恢复 waitForURL('**/recruiter/jobs') 行使（拍3·0155 审核门三拍）。
  const recruiterContext = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100' });
  const recruiter = await recruiterContext.newPage();
  await signUp(recruiter, recruiterEmail, 'recruiter');
  await approveRecruiterViaAdminApi(request, recruiterEmail);
  await loginViaUi(recruiter, recruiterEmail, 'recruiter');
  // 第4件·0157:岗位绑定面试改企业额度支付——招聘方购企业包(真 webhook 入账)后候选人才可开始。
  // 候选人个人包仍保留(真支付回调环境准备原样·C 端购买面收据)。
  await provisionEnterpriseCredit(request, await tokenOf(recruiter.context()), `${suffix}-ent`);
  const publishedAt = Date.now();
  await recruiter.fill('input[name="title"]', jobTitle);
  await recruiter.fill('input[name="competencies"]', '高并发, 幂等, 限流');
  await recruiter.getByRole('button', { name: '发布岗位' }).click();
  const jobLink = recruiter.getByRole('link', { name: new RegExp(jobTitle) });
  await expect(jobLink).toBeVisible({ timeout: 20_000 });
  // G7U 路线甲：begin 前等异步 classify decided（只读轮询 · cap 60s · 超时=诚实 FAIL）。
  await waitForRouteDecided(jobTitle, publishedAt);
  await jobLink.click();
  await recruiter.getByRole('button', { name: '邀请候选人' }).click();
  await recruiter.fill('input[name="candidateEmail"]', candidateEmail);
  await recruiter.getByRole('button', { name: '发送邀请' }).click();
  // 【red②-face2·断言随演（同根 0155/b110·abf80ce6 2026-10-10 落线）】邀请 status 文案已由「已邀请」
  // 随演为「已受理；若对方是注册求职者将收到邀请」——锚新文案稳定前缀（邀请是否真落 app 面由下方
  // API 侧 status='in_progress' 契约断言承重,此处只行使 UI 文案面）。
  await expect(recruiter.getByRole('status')).toContainText(/已受理/, { timeout: 20_000 });

  // C 端：从真实「我的投递」选择简历并点击开始。URL 的 interviewId 是服务端持久化 binding 返回值。
  await page.goto('/jobs');
  await expect(page.getByRole('button', { name: '开始面试' })).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '开始面试' }).click();
  await page.waitForURL(/\/interview\/iv_[^?]+\?applicationId=app_/, { timeout: 30_000 });
  const url = new URL(page.url());
  const boundInterviewId = url.pathname.split('/').at(-1)!;
  const applicationId = url.searchParams.get('applicationId')!;
  expect(applicationId).toMatch(/^app_/);
  // 旁路读 API 只作验收：验证 UI 启动后数据库一对一 binding 已落到申请记录，不依赖 HTML 猜测。
  const applications = await request.get(`${API}/applications`, { headers: { authorization: `Bearer ${candidateToken}` } });
  expect(applications.status()).toBe(200);
  const app = (await applications.json() as { applications: Array<{ id: string; status: string; interview_id: string | null }> }).applications.find((x) => x.id === applicationId);
  expect(app).toEqual(expect.objectContaining({ status: 'in_progress', interview_id: boundInterviewId }));

  // 真 UI 逐题作答到终态。useInterviewStream 收到 report 终态后会自动 POST 同源 /api/applications/:id/finalize。
  const finalizeResponses: number[] = [];
  page.on('response', (res) => { if (res.url().includes(`/api/applications/${applicationId}/finalize`)) finalizeResponses.push(res.status()); });
  for (let turn = 0; turn < 12; turn++) {
    if (await waitForTerminalOrAnswer(page) === 'terminal') break;
    const answer = page.locator('textarea[placeholder^="打字作答"]');
    await answer.fill('我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。');
    await page.getByRole('button', { name: '提交', exact: true }).click();
    // 非最后一题等待当前编辑器卸载；最后一题则可能直接进入报告终态（早停族结算面同判）。
    await Promise.race([
      Promise.any(settlementFaces(page).map((f) => f.waitFor({ state: 'visible', timeout: 20_000 }))),
      answer.waitFor({ state: 'hidden', timeout: 20_000 }),
    ]);
  }
  // ─── G7V 终态断言（多臂三层：定锚 / 分支守卫 / 禁则 · C-HA-V1/V2 · C-MO-V2/V4）───
  // 定锚层：早停控制流 copy（view-model.ts:10 逐字 · session_concluded/early_weak 投影——非能力等级、非招聘结论），
  // 本夹具脚本化弱输入旅程的预期收尾面；正常完成（无 session_concluded）到达 = 诚实红（产品行为面变化）。
  await expect(page.getByTestId('signal-conclude-reason')).toHaveText(EARLY_STOP_COPY, { timeout: 90_000 });
  // 分支守卫层：先锚钱面（结算与 SSE 事件同事务提交；failed=已释放 / completed=已扣费），再按臂断言 exact 结算文案。
  let interviewStatus = '';
  await expect.poll(async () => {
    const res = await request.get(`${API}/interview/${boundInterviewId}`, { headers: { authorization: `Bearer ${candidateToken}` } });
    interviewStatus = res.ok() ? ((await res.json()) as { status: string }).status : '';
    return interviewStatus;
  }, { timeout: 15_000 }).toMatch(/^(failed|completed)$/);
  if (interviewStatus === 'failed') {
    // 释放臂：unscored>0 → failInterviewAndRelease（commerce.ts:198 补偿释放）——「额度已释放」文案此时为真。
    await expect(page.getByText(RELEASED_MSG_PART)).toBeVisible({ timeout: 30_000 });
  } else {
    // 第三臂 no_eligible_scored_answer（adaptive-lifecycle.ts:342-356 · C-HA-V1 落字 · 不作 PASS 容忍面）：
    // 其落字事件与释放臂同 kind（:355 vs :364），经同一 SSE 通道达 UI 同现「额度已释放」文案，
    // 而结算为 completeInterviewAndConfirm 已确认扣费——「status='completed' ∧ 释放文案」组合即本臂：
    // 观测到 → 诚实红 + 五分类 + 升级披露（UI 文案释放声称与已扣费结算码面相悖），Ban 断言其为 PASS。
    const releasedCopyOnCharged = await page.getByText(RELEASED_MSG_PART).waitFor({ state: 'visible', timeout: 3_000 }).then(() => true).catch(() => false);
    expect(releasedCopyOnCharged, '第三臂 no_eligible_scored_answer：UI「本次预留额度已释放」文案与已扣费结算（completeInterviewAndConfirm）相悖——C-HA-V1 不作 PASS 容忍面，须升级披露').toBe(false);
    // 扣费臂（已扣费 · business-events.ts:55 语义「面试已经完成并扣费」）：等报告 worker 异步结算面分臂（实测 ~40s，cap 120s）。
    await Promise.any([page.getByText(NO_REPORT_ON_CHARGED_MSG, { exact: true }), page.getByText(REPORT_DOWN_MSG_PART), page.getByText(PRACTICE_FEEDBACK_PART)].map((f) => f.waitFor({ state: 'visible', timeout: 120_000 })));
    if (await page.getByText(PRACTICE_FEEDBACK_PART).isVisible()) {
      // 扣费·报告就绪臂：complete+enqueueReport 成功 → 练习反馈面（仅供个人复盘）。
      await expect(page.getByText(PRACTICE_FEEDBACK_PART)).toBeVisible();
    } else {
      // 扣费·报告暂不可用臂：报告生成失败（view-model.ts:66 文案为「报告暂时无法生成」——已扣费，Ban 写「已释放」）。
      await expect(page.getByText(REPORT_DOWN_MSG_PART).or(page.getByText(NO_REPORT_ON_CHARGED_MSG, { exact: true }))).toBeVisible({ timeout: 30_000 });
    }
  }
  await expect.poll(() => finalizeResponses.some((status) => status === 200), { timeout: 15_000 }).toBeTruthy();

  // B 端刷新后只见流程状态，不见候选人的逐题内容或数值分；校准 hold 下必须是评分暂不可用，不能回退成已完成。
  await recruiter.reload();
  await expect(recruiter.getByText('评分暂不可用').first()).toBeVisible({ timeout: 20_000 });
  await expect(recruiter.getByText('已完成')).toHaveCount(0);
  await expect(recruiter.getByText(/综合评分|我的回答|评分 \d+/)).toHaveCount(0);
  const statusLink = recruiter.getByRole('link', { name: '查看状态' }).first();
  await expect(statusLink).toBeVisible();
  await statusLink.click();
  await expect(recruiter.getByRole('heading', { name: '申请状态' })).toBeVisible({ timeout: 20_000 });
  await expect(recruiter.getByText(/看不到面试内容/)).toBeVisible();
  // 【第7发现·断言随演（I2 W3④免责卡 d4e51105 2026-10-11 落线）】申请状态页新增 hold 中性注记句
  // 「已面完 · 待校准表示这场面试已完成、还没有可比较的校准分…」——子串 /已完成/ 会误伤该免责句。
  // 随演=已完成 改 exact 全词匹配（仍禁裸「已完成」状态徽回退）+ 候选内容词（综合评分/我的回答）
  // 维持子串零容忍——隐私牙不弱化：逐题内容与数值分仍零出现为 PASS 前提。
  await expect(recruiter.getByText('已完成', { exact: true })).toHaveCount(0);
  await expect(recruiter.getByText(/综合评分|我的回答/)).toHaveCount(0);
  await recruiterContext.close();
});
