# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recruiting-bound.spec.ts >> C→B: real browser binds application to a new interview, completes it, and front-end finalizes it
- Location: e2e-ui/recruiting-bound.spec.ts:142:1

# Error details

```
AggregateError: All promises were rejected
```

```
TimeoutError: locator.waitFor: Timeout 120000ms exceeded.
Call log:
  - waiting for getByText('报告暂时无法生成') to be visible

```

```
TimeoutError: locator.waitFor: Timeout 120000ms exceeded.
Call log:
  - waiting for getByText('练习完成 · 本次练习反馈') to be visible

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - navigation [ref=e3]:
      - link "知面" [ref=e4] [cursor=pointer]:
        - /url: /dashboard
      - generic [ref=e5]:
        - link "总览" [ref=e6] [cursor=pointer]:
          - /url: /dashboard
        - link "成长" [ref=e7] [cursor=pointer]:
          - /url: /growth
        - link "简历" [ref=e8] [cursor=pointer]:
          - /url: /resume
        - link "面试" [ref=e9] [cursor=pointer]:
          - /url: /interviews
        - link "押题" [ref=e10] [cursor=pointer]:
          - /url: /quiz
        - link "找工作" [ref=e11] [cursor=pointer]:
          - /url: /jobs
        - link "通知" [ref=e12] [cursor=pointer]:
          - /url: /notifications
        - link "额度" [ref=e13] [cursor=pointer]:
          - /url: /pricing
        - link "设置" [ref=e14] [cursor=pointer]:
          - /url: /settings
      - generic [ref=e15]:
        - generic [ref=e16]:
          - button "中" [ref=e18] [cursor=pointer]
          - generic [ref=e19]: /
          - button "EN" [ref=e21] [cursor=pointer]
        - button "账户" [ref=e22] [cursor=pointer]:
          - img [ref=e25]
  - main [ref=e29]:
    - generic [ref=e30]:
      - heading "面试岗位：浏览器绑定岗位-9fb27eba" [level=1] [ref=e31]
      - paragraph [ref=e32]: 简历 · 2026年10月08日 10:34 · 版本085710 · 场次963126 · 10/08 10:34
    - generic [ref=e33]:
      - generic [ref=e34]:
        - heading "模拟面试" [level=2] [ref=e35]
        - generic [ref=e36]:
          - button "语音模式" [ref=e37] [cursor=pointer]:
            - img [ref=e38]
            - text: 语音模式
          - button "放弃" [ref=e41] [cursor=pointer]
          - generic [ref=e42]: 预览版
          - generic [ref=e43]: 已结束
      - generic [ref=e45]:
        - generic [ref=e46]:
          - generic [ref=e47]:
            - generic [ref=e48]:
              - generic [ref=e49]:
                - img [ref=e50]
                - text: 新问题
              - generic [ref=e52]: · 项目经验
              - generic [ref=e53]: 第 1 题
            - paragraph [ref=e56]: 在软件项目中，为什么说‘完成需求’不等于‘交付价值’？请结合一个你熟悉的典型场景，说明团队如何识别并验证真正交付了业务价值。
          - generic [ref=e57]:
            - generic [ref=e58]: 我的回答
            - paragraph [ref=e61]: 我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。
        - generic [ref=e62]:
          - generic [ref=e63]:
            - generic [ref=e64]:
              - generic [ref=e65]:
                - img [ref=e66]
                - text: 新问题
              - generic [ref=e68]: · 技术深度
              - generic [ref=e69]: 第 2 题
            - paragraph [ref=e72]: TCP 三次握手过程中，为什么客户端最后还要发送一次 ACK？如果这一步缺失，服务端会处于什么状态？
          - generic [ref=e73]:
            - generic [ref=e74]: 我的回答
            - paragraph [ref=e77]: 我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。
      - status [ref=e78]: 练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）
      - alert [ref=e79]: 面试已完成并扣费结算，但未获得可信评分，本次不生成报告。岗位面试可从“我的投递”重新开始；其他面试可新建一场。
      - button "前往我的投递" [ref=e80] [cursor=pointer]
  - region "Notifications alt+T"
  - alert [ref=e81]: Meetwise 知面 · 预览版
```

# Test source

```ts
  132 |         );
  133 |         throw new Error(`[g7u-fixture] route not decided within ${ROUTE_DECIDED_WAIT_CAP_MS}ms cap — fixture wait failed honestly`);
  134 |       }
  135 |       await new Promise((resolve) => setTimeout(resolve, ROUTE_DECIDED_POLL_INTERVAL_MS));
  136 |     }
  137 |   } finally {
  138 |     await client.end().catch(() => {});
  139 |   }
  140 | }
  141 | 
  142 | test('C→B: real browser binds application to a new interview, completes it, and front-end finalizes it', async ({ page, browser, request }) => {
  143 |   // 这是一个 6 题的真实模型旅程：每题都包含 worker、模型评分和 SSE（服务器发送事件）回写。
  144 |   // 150 秒不足以覆盖已经实测的单轮真实语音延迟，导致“系统仍在正确收口”被误报为产品失败。
  145 |   // 此处只放宽旅程总预算；单服务延迟仍由 performance E2E（端到端）门独立量化，不能把该值当性能目标。
  146 |   test.setTimeout(420_000);
  147 |   const suffix = randomUUID();
  148 |   const candidateEmail = `e2e-bound-candidate-${suffix}@x.com`;
  149 |   const recruiterEmail = `e2e-bound-recruiter-${suffix}@x.com`;
  150 |   const jobTitle = `浏览器绑定岗位-${suffix.slice(0, 8)}`;
  151 | 
  152 |   // C 端：注册、同意隐私、上传已摄取简历（全为页面交互）。
  153 |   await signUp(page, candidateEmail, 'candidate');
  154 |   await page.goto('/resume');
  155 |   await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  156 |   await page.fill('textarea[name="text"]', '后端工程师，熟悉 Redis 限流、幂等订单和可观测性。');
  157 |   await page.getByRole('button', { name: '上传简历', exact: true }).click();
  158 |   await expect(page.getByText(/解析完成/).first()).toBeVisible({ timeout: 20_000 });
  159 |   const candidateToken = await tokenOf(page.context());
  160 |   // 真实支付回调是本用例唯一非 UI 的环境准备：前端不提供「假装支付成功」入口。
  161 |   await provisionPaidInterviewCredit(request, candidateToken, suffix);
  162 | 
  163 |   // B 端：独立浏览器身份注册、建岗、邀请这个已注册的候选人。
  164 |   const recruiterContext = await browser.newContext({ baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3100' });
  165 |   const recruiter = await recruiterContext.newPage();
  166 |   await signUp(recruiter, recruiterEmail, 'recruiter');
  167 |   const publishedAt = Date.now();
  168 |   await recruiter.fill('input[name="title"]', jobTitle);
  169 |   await recruiter.fill('input[name="competencies"]', '高并发, 幂等, 限流');
  170 |   await recruiter.getByRole('button', { name: '发布岗位' }).click();
  171 |   const jobLink = recruiter.getByRole('link', { name: new RegExp(jobTitle) });
  172 |   await expect(jobLink).toBeVisible({ timeout: 20_000 });
  173 |   // G7U 路线甲：begin 前等异步 classify decided（只读轮询 · cap 60s · 超时=诚实 FAIL）。
  174 |   await waitForRouteDecided(jobTitle, publishedAt);
  175 |   await jobLink.click();
  176 |   await recruiter.getByRole('button', { name: '邀请候选人' }).click();
  177 |   await recruiter.fill('input[name="candidateEmail"]', candidateEmail);
  178 |   await recruiter.getByRole('button', { name: '发送邀请' }).click();
  179 |   await expect(recruiter.getByRole('status')).toContainText(/已邀请/, { timeout: 20_000 });
  180 | 
  181 |   // C 端：从真实「我的投递」选择简历并点击开始。URL 的 interviewId 是服务端持久化 binding 返回值。
  182 |   await page.goto('/jobs');
  183 |   await expect(page.getByRole('button', { name: '开始面试' })).toBeVisible({ timeout: 20_000 });
  184 |   await page.getByRole('button', { name: '开始面试' }).click();
  185 |   await page.waitForURL(/\/interview\/iv_[^?]+\?applicationId=app_/, { timeout: 30_000 });
  186 |   const url = new URL(page.url());
  187 |   const boundInterviewId = url.pathname.split('/').at(-1)!;
  188 |   const applicationId = url.searchParams.get('applicationId')!;
  189 |   expect(applicationId).toMatch(/^app_/);
  190 |   // 旁路读 API 只作验收：验证 UI 启动后数据库一对一 binding 已落到申请记录，不依赖 HTML 猜测。
  191 |   const applications = await request.get(`${API}/applications`, { headers: { authorization: `Bearer ${candidateToken}` } });
  192 |   expect(applications.status()).toBe(200);
  193 |   const app = (await applications.json() as { applications: Array<{ id: string; status: string; interview_id: string | null }> }).applications.find((x) => x.id === applicationId);
  194 |   expect(app).toEqual(expect.objectContaining({ status: 'in_progress', interview_id: boundInterviewId }));
  195 | 
  196 |   // 真 UI 逐题作答到终态。useInterviewStream 收到 report 终态后会自动 POST 同源 /api/applications/:id/finalize。
  197 |   const finalizeResponses: number[] = [];
  198 |   page.on('response', (res) => { if (res.url().includes(`/api/applications/${applicationId}/finalize`)) finalizeResponses.push(res.status()); });
  199 |   for (let turn = 0; turn < 12; turn++) {
  200 |     if (await waitForTerminalOrAnswer(page) === 'terminal') break;
  201 |     const answer = page.locator('textarea[placeholder^="打字作答"]');
  202 |     await answer.fill('我会用稳定幂等键约束写操作，配合 outbox、重试退避和指标告警确保最终一致。');
  203 |     await page.getByRole('button', { name: '提交', exact: true }).click();
  204 |     // 非最后一题等待当前编辑器卸载；最后一题则可能直接进入报告终态（早停族结算面同判）。
  205 |     await Promise.race([
  206 |       Promise.any(settlementFaces(page).map((f) => f.waitFor({ state: 'visible', timeout: 20_000 }))),
  207 |       answer.waitFor({ state: 'hidden', timeout: 20_000 }),
  208 |     ]);
  209 |   }
  210 |   // ─── G7V 终态断言（多臂三层：定锚 / 分支守卫 / 禁则 · C-HA-V1/V2 · C-MO-V2/V4）───
  211 |   // 定锚层：早停控制流 copy（view-model.ts:10 逐字 · session_concluded/early_weak 投影——非能力等级、非招聘结论），
  212 |   // 本夹具脚本化弱输入旅程的预期收尾面；正常完成（无 session_concluded）到达 = 诚实红（产品行为面变化）。
  213 |   await expect(page.getByTestId('signal-conclude-reason')).toHaveText(EARLY_STOP_COPY, { timeout: 90_000 });
  214 |   // 分支守卫层：先锚钱面（结算与 SSE 事件同事务提交；failed=已释放 / completed=已扣费），再按臂断言 exact 结算文案。
  215 |   let interviewStatus = '';
  216 |   await expect.poll(async () => {
  217 |     const res = await request.get(`${API}/interview/${boundInterviewId}`, { headers: { authorization: `Bearer ${candidateToken}` } });
  218 |     interviewStatus = res.ok() ? ((await res.json()) as { status: string }).status : '';
  219 |     return interviewStatus;
  220 |   }, { timeout: 15_000 }).toMatch(/^(failed|completed)$/);
  221 |   if (interviewStatus === 'failed') {
  222 |     // 释放臂：unscored>0 → failInterviewAndRelease（commerce.ts:198 补偿释放）——「额度已释放」文案此时为真。
  223 |     await expect(page.getByText(RELEASED_MSG_PART)).toBeVisible({ timeout: 30_000 });
  224 |   } else {
  225 |     // 第三臂 no_eligible_scored_answer（adaptive-lifecycle.ts:342-356 · C-HA-V1 落字 · 不作 PASS 容忍面）：
  226 |     // 其落字事件与释放臂同 kind（:355 vs :364），经同一 SSE 通道达 UI 同现「额度已释放」文案，
  227 |     // 而结算为 completeInterviewAndConfirm 已确认扣费——「status='completed' ∧ 释放文案」组合即本臂：
  228 |     // 观测到 → 诚实红 + 五分类 + 升级披露（UI 文案释放声称与已扣费结算码面相悖），Ban 断言其为 PASS。
  229 |     const releasedCopyOnCharged = await page.getByText(RELEASED_MSG_PART).waitFor({ state: 'visible', timeout: 3_000 }).then(() => true).catch(() => false);
  230 |     expect(releasedCopyOnCharged, '第三臂 no_eligible_scored_answer：UI「本次预留额度已释放」文案与已扣费结算（completeInterviewAndConfirm）相悖——C-HA-V1 不作 PASS 容忍面，须升级披露').toBe(false);
  231 |     // 扣费臂（已扣费 · business-events.ts:55 语义「面试已经完成并扣费」）：等报告 worker 异步结算面分臂（实测 ~40s，cap 120s）。
> 232 |     await Promise.any([page.getByText(REPORT_DOWN_MSG_PART), page.getByText(PRACTICE_FEEDBACK_PART)].map((f) => f.waitFor({ state: 'visible', timeout: 120_000 })));
      |                                                                                                                   ^ TimeoutError: locator.waitFor: Timeout 120000ms exceeded.
  233 |     if (await page.getByText(PRACTICE_FEEDBACK_PART).isVisible()) {
  234 |       // 扣费·报告就绪臂：complete+enqueueReport 成功 → 练习反馈面（仅供个人复盘）。
  235 |       await expect(page.getByText(PRACTICE_FEEDBACK_PART)).toBeVisible();
  236 |     } else {
  237 |       // 扣费·报告暂不可用臂：报告生成失败（view-model.ts:66 文案为「报告暂时无法生成」——已扣费，Ban 写「已释放」）。
  238 |       await expect(page.getByText(REPORT_DOWN_MSG_PART)).toBeVisible({ timeout: 30_000 });
  239 |     }
  240 |   }
  241 |   await expect.poll(() => finalizeResponses.some((status) => status === 200), { timeout: 15_000 }).toBeTruthy();
  242 | 
  243 |   // B 端刷新后只见流程状态，不见候选人的逐题内容或数值分；校准 hold 下必须是评分暂不可用，不能回退成已完成。
  244 |   await recruiter.reload();
  245 |   await expect(recruiter.getByText('评分暂不可用').first()).toBeVisible({ timeout: 20_000 });
  246 |   await expect(recruiter.getByText('已完成')).toHaveCount(0);
  247 |   await expect(recruiter.getByText(/综合评分|我的回答|评分 \d+/)).toHaveCount(0);
  248 |   const statusLink = recruiter.getByRole('link', { name: '查看状态' }).first();
  249 |   await expect(statusLink).toBeVisible();
  250 |   await statusLink.click();
  251 |   await expect(recruiter.getByRole('heading', { name: '申请状态' })).toBeVisible({ timeout: 20_000 });
  252 |   await expect(recruiter.getByText(/看不到面试内容/)).toBeVisible();
  253 |   await expect(recruiter.getByText(/综合评分|我的回答|已完成/)).toHaveCount(0);
  254 |   await recruiterContext.close();
  255 | });
  256 | 
```