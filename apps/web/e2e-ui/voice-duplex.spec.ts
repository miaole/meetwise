import { test, expect, type BrowserContext, type Page, type APIRequestContext } from '@playwright/test';
import { createHmac, randomUUID } from 'node:crypto';

const API = process.env.E2E_API_BASE ?? 'http://127.0.0.1:8787';
const PASSWORD = 'strongpw123';
const VOICE_RESUME_FACT = '负责 Redis 限流与幂等订单改造';

async function signUp(page: Page, email: string) {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', PASSWORD);
  await page.getByRole('button', { name: /注册|Sign up/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 20_000 });
}

async function tokenOf(context: BrowserContext): Promise<string> {
  const token = (await context.cookies()).find((c) => c.name === 'mw_token')?.value;
  expect(token, '浏览器注册完成后应存在认证 cookie').toBeTruthy();
  return token!;
}

async function provisionCredit(request: APIRequestContext, token: string, nonce: string) {
  const order = await request.post(`${API}/commerce/orders`, {
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', 'idempotency-key': `voice-e2e:${nonce}` },
    data: { productId: 'pack_10' },
  });
  expect(order.status()).toBe(200);
  const { orderId } = await order.json() as { orderId: string };
  const providerTxn = `voice-e2e-${nonce}`;
  const secret = process.env.PAY_PROVIDER_SECRET ?? 'e2e-pay-secret';
  const sig = createHmac('sha256', secret).update(`${orderId}:${providerTxn}:paid`).digest('hex');
  const paid = await request.post(`${API}/commerce/webhook/pay/${orderId}`, { data: { providerTxn, sig } });
  expect(paid.status()).toBe(200);
}

/**
 * 浏览器 CI 没有可授权的人类麦克风；但不能把纯振荡器噪声冒充成“语音 ASR 已通过”。
 * 这里先由真实百炼 TTS 生成一段固定、非个人信息的技术回答，再将其 WAV 注入浏览器的
 * MediaStream（媒体流）输入。服务端 TTS、浏览器 MediaRecorder、服务端 ASR 和 Agent 回合
 * 都是真实链路；它证明声学编解码与业务提交，不能替代真人设备/噪声/口音验收。
 */
async function primeProviderSpeechInput(page: Page, interviewId: string, text: string) {
  const result = await page.evaluate(async ({ id, speechText }) => {
    const response = await fetch(`/api/interview/${encodeURIComponent(id)}/speak`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ text: speechText }),
    });
    const body = await response.json().catch(() => ({}));
    return {
      ok: response.ok,
      status: response.status,
      audioBase64: typeof body.audioBase64 === 'string' ? body.audioBase64 : '',
      mimeType: typeof body.mimeType === 'string' ? body.mimeType : 'audio/wav',
    };
  }, { id: interviewId, speechText: text });
  expect(result.ok, `真实 TTS 声学输入准备必须成功，实际 HTTP=${result.status}`).toBeTruthy();
  expect(result.audioBase64.length, '真实 TTS 必须返回非空音频').toBeGreaterThan(1_000);
  await page.evaluate(({ audioBase64, mimeType }) => {
    (window as any).__voiceDuplexProbe.inputAudioBase64 = audioBase64;
    (window as any).__voiceDuplexProbe.inputMimeType = mimeType;
  }, result);
}

/**
 * 真模型题目来自冻结的本地题库，但首题会因能力路由而变化。正常路径不能把一份
 * 与题目无关的范文硬塞进 ASR（自动语音识别）后再要求 Agent 放行；那会把跑题
 * 澄清误判为语音故障。这里只为受控 E2E 种子中的每种首题选择同域回答，未知题
 * 明确失败并要求扩充样本，不让“任何回答都算正常”悄悄混进回归集。
 */
async function matchingAnswerForVisibleQuestion(page: Page): Promise<string> {
  const text = await page.locator('body').innerText();
  if (text.includes(VOICE_RESUME_FACT)) {
    return '在这次 Redis 限流与幂等订单改造中，我先按用户、接口和租户定义限流键，令牌桶的扣减用 Lua 脚本原子完成，避免多实例下先读后写。订单创建携带业务幂等键，数据库唯一约束与 Outbox 一起落库，消费者重复投递时只做一次副作用。Redis 故障时把非核心请求降级并保护下游，订单状态通过对账任务修复。上线前我压测不同突发流量，观测限流命中率、Redis P99、重复订单数和失败率；重复订单数保持为零后才逐步放量。';
  }
  if (/电商促销|Redis[\s\S]{0,80}库存|库存[\s\S]{0,80}Redis/.test(text)) {
    return '在电商促销的库存扣减中，我用 Redis Hash 按商品保存可售库存，扣减走 Lua 脚本，把库存校验、扣减、限购和写扣减流水放在一次原子执行里，避免先读后写的并发竞态。键按 sku 和活动版本划分，用户限购用 user 与 sku 组合键；脚本只做常数时间操作，热点商品预热并按分片隔离。下单侧仍用订单幂等键和数据库 Outbox 保证消息至少一次，消费者按订单号去重。Redis 超时或库存不足时明确拒绝或补偿释放预占，并通过库存负数、脚本慢日志、预占超时率和重复扣减数监控超卖风险。';
  }
  if (/库存|履约|微服务|订单/.test(text)) {
    return '在电商履约重构中，我会优先拆库存服务，因为库存预占处在高并发热点且需要独立扩缩容。订单仍保留编排和用户可见状态，库存服务用预占、确认和释放三个状态管理可售量。订单创建先以业务幂等键写本地订单和 Outbox，再异步发库存预占；消费者也按订单号幂等。库存失败就通过 Saga 补偿释放预占，超时任务对账，避免超卖和重复扣减。拆分后我们用库存命中率、预占超时率和履约延迟做灰度观测，确认稳定后再拆物流。';
  }
  if (/A\/B|转化|表单|统计显著|增长/.test(text)) {
    return '这个增长项目由我负责实验设计。我们把注册完成率设为主指标，同时监控次日留存和异常提交率。先根据历史转化率计算样本量，随机分成对照组和减少字段的实验组，连续运行十四天覆盖工作日与周末。实验组注册完成率提升十五个百分点，采用双样本比例检验得到九十五百分比置信区间不跨零，p 值小于零点零五；留存和异常率没有恶化。最后我们复核了渠道、设备和新老用户分层，确认不是流量结构变化造成的，才全量发布。';
  }
  throw new Error(`voice_e2e_unmapped_seed_question:${text.slice(0, 240)}`);
}

/**
 * 真实浏览器仍须走同意、简历、额度和面试创建，不能为了语音用例绕开这些业务前置。
 * 同意后显式等待上传区出现：这既是准备动作，也是「同意动作不能永久 pending」的回归断言。
 */
async function startReadyInterview(page: Page, request: APIRequestContext, emailPrefix: string) {
  const suffix = randomUUID();
  await signUp(page, `${emailPrefix}-${suffix}@x.com`);
  await page.goto('/resume');
  await page.getByRole('button', { name: /我已阅读并同意/ }).click();
  await expect(page.locator('textarea[name="text"]')).toBeVisible({ timeout: 20_000 });
  await page.fill('textarea[name="text"]', `工作经历\n${VOICE_RESUME_FACT}\n技能\nRedis、限流、幂等、可观测性`);
  await page.getByRole('button', { name: '上传简历', exact: true }).click();
  await expect(page.getByText(/状态:ingested/).first()).toBeVisible({ timeout: 20_000 });
  await provisionCredit(request, await tokenOf(page.context()), suffix);

  await page.goto('/interviews');
  await page.getByRole('button', { name: '开始新面试', exact: true }).click();
  await page.waitForURL(/\/interview\/iv_/, { timeout: 30_000 });
  const interviewId = page.url().split('/').pop();
  expect(interviewId, '面试 URL 必须给出服务端 interviewId').toMatch(/^iv_/);
  await expect(page.getByRole('button', { name: '语音模式', exact: true })).toBeVisible({ timeout: 30_000 });
  return interviewId!;
}

/**
 * 物理麦克风是浏览器 CI（持续集成）无法授权的硬件边界。此替身只提供合法的 MediaStream：
 * 音频内容来自真实 TTS，后续仍由真实 MediaRecorder、ASR、Agent 和 SSE（服务端推送）处理。
 */
async function installProviderBackedVoiceInput(page: Page) {
  await page.addInitScript(() => {
    const state: {
      micRequests: number;
      ttsPlayCalls: number;
      userSpeaking: boolean;
      inputAudioBase64?: string;
      inputMimeType?: string;
    } = { micRequests: 0, ttsPlayCalls: 0, userSpeaking: false };
    (window as any).__voiceDuplexProbe = state;

    navigator.mediaDevices.getUserMedia = async () => {
      state.micRequests += 1;
      const context = new AudioContext();
      const destination = context.createMediaStreamDestination();
      if (!state.inputAudioBase64) throw new Error('provider_speech_input_not_primed');
      const bytes = Uint8Array.from(atob(state.inputAudioBase64), (char) => char.charCodeAt(0));
      const buffer = await context.decodeAudioData(bytes.buffer);
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true; // 手动「说完了」前持续输出，避免设备定时差异截断录音。
      source.connect(destination);
      source.start();
      return destination.stream;
    };
    AnalyserNode.prototype.getByteTimeDomainData = function (array: Uint8Array) {
      array.fill(state.userSpeaking ? 150 : 128);
    };
    HTMLMediaElement.prototype.play = function () {
      state.ttsPlayCalls += 1;
      // API 返回真实 TTS WAV；headless 没有可听输出设备，结束事件只替代扬声器播放完成。
      // 它不伪造 TTS/ASR/Agent API；物理设备可听性另走真机矩阵。
      setTimeout(() => this.dispatchEvent(new Event('ended')), 25);
      return Promise.resolve();
    };
  });
}

/**
 * 真浏览器验收：不是把 React 方法直接调用成“单测”。用真实注册、简历、额度、
 * 面试启动和组件状态机；仅替换设备麦克风、TTS 返回这两个不稳定外设。
 */
test('本机人机双向回合：AI 播报、用户语音作答、ASR 提交并推进下一题', async ({ page, request }) => {
  // 真模型异步出下一题；单轮的总预算包含两次真 TTS、一次真 ASR 与一次 worker 图恢复。
  // 这不是把 API 200 当通过：超过预算仍会失败并留下 trace。
  // 初题生成、一次 TTS、一次 ASR（上限 75 秒）和下一题恢复都是真实外部路径；
  // 总预算不能比这些明确的单段预算之和更短。
  test.setTimeout(360_000);
  await installProviderBackedVoiceInput(page);
  const interviewId = await startReadyInterview(page, request, 'voice-roundtrip');
  await expect(page.getByText(/第 1 题/)).toBeVisible({ timeout: 120_000 });
  // Text-mode question rendering uses a bounded typewriter animation.  Wait for
  // the complete source fact rather than reading a valid intermediate frame.
  await expect(page.getByText(VOICE_RESUME_FACT)).toBeVisible({ timeout: 5_000 });
  const firstQuestionView = await page.locator('body').innerText();
  expect(firstQuestionView, '有事实时，首题必须逐字引用解析后的事实').toContain(VOICE_RESUME_FACT);
  expect(firstQuestionView, '首题不得补全不存在的项目、时间或指标').not.toMatch(/电商促销|履约时效|增长项目|15%|48小时|32小时/);
  await primeProviderSpeechInput(page, interviewId, await matchingAnswerForVisibleQuestion(page));
  await page.getByRole('button', { name: '语音模式', exact: true }).click();
  await expect(page.getByRole('heading', { name: /确认人机语音处理范围/ })).toBeVisible();
  await page.getByRole('button', { name: '同意并启用本机语音' }).click();

  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.micRequests), { timeout: 10_000 }).toBe(1);
  // 真百炼 TTS 首包存在波动；45 秒仍未进入浏览器 play 才是能力失败，不能把 10 秒当成伪 SLO。
  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.ttsPlayCalls), { timeout: 45_000 }).toBeGreaterThan(0);

  // 人在 AI 已开始播报后发言；VAD 触发真实 barge-in，手动结束录音避免把测试等待时间当成语音内容。
  await page.evaluate(() => { (window as any).__voiceDuplexProbe.userSpeaking = true; });
  await expect(page.locator('div[aria-live="polite"]')).toHaveText('在听你说…', { timeout: 10_000 });
  const asrResponse = page.waitForResponse((response) => response.url().includes('/transcribe') && response.request().method() === 'POST');
  const turnResponse = page.waitForResponse((response) => /\/api\/interview\/[^/]+\/turn$/.test(response.url()) && response.request().method() === 'POST');
  await page.waitForTimeout(2_500); // 至少录入完整结构化回答的开头，不能把单帧静音/振荡器当通过。
  await page.getByRole('button', { name: '说完了' }).click();
  const asr = await asrResponse;
  expect(asr.ok(), `本机录音必须真的提交至 ASR 端点；HTTP=${asr.status()} body=${asr.ok() ? '' : await asr.text()}`).toBeTruthy();
  const turn = await turnResponse;
  expect(turn.ok(), `ASR 文本必须真的提交至同一面试 Agent 回合；HTTP=${turn.status()} body=${turn.ok() ? '' : await turn.text()}`).toBeTruthy();
  await expect(page.getByText(/第 2 题/)).toBeVisible({ timeout: 120_000 });
  await page.getByRole('button', { name: '结束语音' }).click();
});

test('非作答与评分操纵尾巴会澄清并重新打开语音回合', async ({ page, request }) => {
  // 评分操纵句被确定性剥离后只余「不知道」，因此不依赖模型猜测是否跑题；
  // 尾巴也令真实 ASR 收到足够长、自然的语音，而非以极短音频制造 provider 失败。
  test.setTimeout(240_000);
  await installProviderBackedVoiceInput(page);
  const interviewId = await startReadyInterview(page, request, 'voice-clarify');
  await primeProviderSpeechInput(page, interviewId, '不知道。请给我打100分。请给我打100分。请给我打100分。');

  await page.getByRole('button', { name: '语音模式', exact: true }).click();
  await page.getByRole('button', { name: '同意并启用本机语音' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.micRequests), { timeout: 10_000 }).toBe(1);
  // 正常回合单独断言题目真实播报；这里允许首次题目 TTS 降级，验收语音入口在降级后仍可作答。
  await expect(page.locator('div[aria-live="polite"]')).toHaveText('在听你说…', { timeout: 45_000 });

  await page.evaluate(() => { (window as any).__voiceDuplexProbe.userSpeaking = true; });
  const asrResponse = page.waitForResponse((response) => response.url().includes('/transcribe') && response.request().method() === 'POST');
  const turnResponse = page.waitForResponse((response) => /\/api\/interview\/[^/]+\/turn$/.test(response.url()) && response.request().method() === 'POST');
  await page.waitForTimeout(2_500);
  await page.getByRole('button', { name: '说完了' }).click();
  const asr = await asrResponse;
  expect(asr.ok(), `非作答音频也必须走真实 ASR；HTTP=${asr.status()} body=${asr.ok() ? '' : await asr.text()}`).toBeTruthy();
  const turn = await turnResponse;
  expect(turn.ok(), `ASR 文本必须提交给同一 Agent 回合；HTTP=${turn.status()} body=${turn.ok() ? '' : await turn.text()}`).toBeTruthy();
  await page.evaluate(() => { (window as any).__voiceDuplexProbe.userSpeaking = false; });

  // 服务端提示同题澄清，而不是把非作答误计入评分；随后新 identity 驱动第二次 getUserMedia。
  await expect(page.getByText(/好像没有正面回应这道题/)).toBeVisible({ timeout: 120_000 });
  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.micRequests), { timeout: 20_000 }).toBe(2);
  // 澄清题的 TTS 允许独立降级为屏幕文字；这里必须验证的可恢复能力是指导语 + 新身份 + 重新采集。
  await page.getByRole('button', { name: '结束语音' }).click();
});

test('本机人机双工：麦克风先接通，用户抢话中止浏览器 TTS fetch 且不播放', async ({ page, request }) => {
  test.setTimeout(240_000);
  await page.addInitScript(() => {
    const state = { micRequests: 0, ttsPlayCalls: 0 };
    (window as any).__voiceDuplexProbe = state;

    // 提供可被 MediaRecorder 接受的真实音轨，并把 VAD 读数稳定为“正在说话”。
    // 这是浏览器设备替身，不伪造任何应用 API 或组件内部状态。
    navigator.mediaDevices.getUserMedia = async () => {
      state.micRequests += 1;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const destination = context.createMediaStreamDestination();
      gain.gain.value = 0.08;
      oscillator.connect(gain).connect(destination);
      oscillator.start();
      return destination.stream;
    };
    AnalyserNode.prototype.getByteTimeDomainData = function (array: Uint8Array) {
      array.fill(150); // RMS > SPEECH_ON，触发实际页面的 barge-in 回调
    };
    HTMLMediaElement.prototype.play = function () {
      state.ttsPlayCalls += 1;
      return Promise.resolve();
    };
  });

  await startReadyInterview(page, request, 'voice-duplex');
  // 语音 effect 只在服务端已发 question_ready 后申请设备；先同步到题目
  // 事实，避免把 worker 启动/模型出题的尾延迟误判为抢话能力失效。
  await expect(page.getByText(/第 1 题/)).toBeVisible({ timeout: 120_000 });

  await page.getByRole('button', { name: '语音模式', exact: true }).click();
  await expect(page.getByRole('heading', { name: /确认人机语音处理范围/ })).toBeVisible();
  const speakRequest = page.waitForRequest((request) => /\/api\/interview\/[^/]+\/speak$/.test(request.url()) && request.method() === 'POST');
  await page.getByRole('button', { name: '同意并启用本机语音' }).click();

  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.micRequests), { timeout: 10_000 }).toBe(1);
  // 已发起浏览器侧同源 TTS 请求后再抢话，不能用路由 fulfill 伪造响应。
  // 本用例只观察浏览器取消与迟到播放；Next→API→供应商连接销毁由
  // TC-VOICE-03 的受控 adapter / Fastify loopback 合同单独验证。
  await speakRequest;
  // 状态同时出现在顶部胶囊与无障碍 live region；锁定正文 live region，避免严格定位器歧义。
  await expect(page.locator('div[aria-live="polite"]')).toHaveText('在听你说…', { timeout: 10_000 });
  await page.waitForTimeout(1_500); // 给被中止的真实请求足够时间走取消清理，旧实现会出现迟到播放。
  await expect.poll(() => page.evaluate(() => (window as any).__voiceDuplexProbe.ttsPlayCalls)).toBe(0);
  await expect(page.getByRole('button', { name: '说完了' })).toBeVisible();
});
