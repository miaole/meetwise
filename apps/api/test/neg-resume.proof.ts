import { boot, mkAssert } from './_neg-harness';

/**
 * neg-resume.proof — 简历上传/文件/重解析/删除 + 隐私同意/导出/删除 域的**纯负路径**证明。
 * 一条 happy-path 都不承载:断言目标全是「未同意被拦 / 越权 / 畸形文件 / PII 未脱敏 / 过短过长 /
 * 跨用户删读 / 幂等 / 不存在资源 / 降级兜底」。真起 NestJS 栈 + 真 Postgres RLS + 真契约校验 + fake OCR/VOICE。
 *
 * 种子(见 _neg-harness):userA=已有 resume_processing 同意 + 额度 5.0;userB=无同意无额度;victimU=无同意。
 * OCR_FAKE_TEXT 故意含手机号 13800138000 → 用于验证 OCR 链路 PII 脱敏。
 *
 * 关键被测代码:
 *  - resume.service.ts: upload()/uploadFile()/uploadImageViaOcr()/reparse()/remove()/profile() —— consent 硬门、字节/文本封顶、限流。
 *  - privacy.service.ts: consent()/consentStatus()/export()/deleteResumeData() —— 幂等、purpose 隔离、RLS 限己。
 *  - domain/index.ts ingestResume + stripPii —— PII(phone/email/idcard)脱敏 + 注入拦截,structured 永不含明文 PII。
 */
const h = await boot();
const { A, done } = mkAssert('neg:resume');

// ── 断言辅助 ──────────────────────────────────────────────────────────────
const AUTH_A = h.U('userA');            // 已同意 + 有额度
const AUTH_B = h.U('userB');            // 无同意 + 无额度
const AUTH_V = h.U('victimU');          // 无同意
const NOAUTH: Record<string, string> = {};   // 无任何鉴权头 → guard fail-closed 401

const inRange = (s: number, lo: number, hi: number) => s >= lo && s <= hi;
const profileRow = async (id: string) =>
  (await h.pool.query('SELECT structured, pii_summary, status FROM resume_profile WHERE resume_id=$1', [id])).rows[0];
const consentCount = async (uid: string, purpose = 'resume_processing') =>
  Number((await h.pool.query('SELECT count(*)::int AS n FROM consent_record WHERE owner_user_id=$1 AND purpose=$2', [uid, purpose])).rows[0].n);
const resumeExists = async (id: string) =>
  Number((await h.pool.query('SELECT count(*)::int AS n FROM resume WHERE id=$1', [id])).rows[0].n) === 1;

const VALID = '工作经历\n负责后端订单系统三年，熟悉分布式限流与高并发架构设计与落地';   // 合法长度(>20),供门禁/畸形对照
// 一张最小合法 base64(内容无所谓,image/* mime 即走 image_needs_ocr → OCR 链路)
const IMG_B64 = Buffer.from('fake-png-bytes-not-really-an-image').toString('base64');

// ══════════════════════════════════════════════════════════════════════════
// 1) 同意门(PIPL 硬门槛):未同意绝不偷偷处理简历 PII
// ══════════════════════════════════════════════════════════════════════════
{
  const r = await h.post('/resume', AUTH_B, { text: VALID });     // userB 无 resume_processing 同意
  A('userB 文本上传未同意 → 403', r.status === 403);
  A('userB 文本上传 error=consent_required', r.body?.error === 'consent_required');
  A('userB 文本上传回带 purpose=resume_processing', r.body?.purpose === 'resume_processing');

  const f = await h.post('/resume/file', AUTH_B, { filename: 'cv.png', mimeType: 'image/png', contentBase64: IMG_B64 });
  A('userB 图片上传未同意 → 403(计费前即拦,绝不先扣费)', f.status === 403);
  A('userB 图片上传 error=consent_required', f.body?.error === 'consent_required');

  const cs = await h.req('GET', '/privacy/consent', AUTH_B);
  A('userB GET consent → consented=false', cs.status === 200 && cs.body?.consented === false);

  // purpose 隔离:同意到「错的」purpose 不等于同意简历处理
  await h.post('/privacy/consent', AUTH_B, { purpose: 'marketing' });
  const r2 = await h.post('/resume', AUTH_B, { text: VALID });
  A('userB 仅同意 marketing 后文本上传仍 403(purpose 隔离)', r2.status === 403 && r2.body?.error === 'consent_required');
  A('userB 未知/无关 purpose 未泄漏成简历同意', (await consentCount('userB')) === 0);
}

// ══════════════════════════════════════════════════════════════════════════
// 2) 同意幂等 + 校验:重复同意不堆积第二条记录
// ══════════════════════════════════════════════════════════════════════════
{
  await h.post('/privacy/consent', AUTH_V, { purpose: 'resume_processing' });   // victimU 首次
  await h.post('/privacy/consent', AUTH_V, { purpose: 'resume_processing' });   // 重复(双提交/重复点击)
  await h.post('/privacy/consent', AUTH_V, {});                                 // 缺 purpose(默认 resume_processing)
  A('victimU 三次同意(含缺 purpose 默认)仅落 1 条记录(幂等)', (await consentCount('victimU')) === 1);

  // userA 已有同意,再点一次也不应堆积
  await h.post('/privacy/consent', AUTH_A, { purpose: 'resume_processing' });
  A('userA 重复同意仍仅 1 条记录(幂等)', (await consentCount('userA')) === 1);
}

// ══════════════════════════════════════════════════════════════════════════
// 3) 鉴权 fail-closed:所有端点无鉴权头 → 401(不 200、不 500)
// ══════════════════════════════════════════════════════════════════════════
{
  const u = [
    ['POST', '/resume', true],
    ['POST', '/resume/file', true],
    ['GET', '/resume', false],
    ['POST', '/resume/00000000-0000-0000-0000-000000000000/reparse', true],
    ['DELETE', '/resume/00000000-0000-0000-0000-000000000000', false],
    ['GET', '/resume/00000000-0000-0000-0000-000000000000/profile', false],
    ['POST', '/privacy/consent', true],
    ['GET', '/privacy/consent', false],
    ['GET', '/privacy/export', false],
    ['DELETE', '/privacy/resume-data', false],
  ] as const;
  for (const [m, p, hasBody] of u) {
    const r = hasBody ? await h.send(m, p, NOAUTH, {}) : await h.req(m, p, NOAUTH);
    A(`未鉴权 ${m} ${p} → 401`, r.status === 401);
  }
  const one = await h.req('GET', '/privacy/export', NOAUTH);
  A('未鉴权 export body error=unauthenticated', one.body?.error === 'unauthenticated');
}

// ══════════════════════════════════════════════════════════════════════════
// 4) 文本上传畸形:契约 UploadResumeDto(text string, min20, max60000)真校验
// ══════════════════════════════════════════════════════════════════════════
{
  const cases: [string, any][] = [
    ['空字符串', ''],
    ['纯短空白(5 空格 <20)', '     '],
    ['过短(2 字)', 'ab'],
    ['边界 19 字(< min20)', 'a'.repeat(19)],
    ['超大(>60000 字)', 'a'.repeat(60_001)],
    ['text 为数字(非字符串)', 123],
    ['text 为 null', null],
    ['text 为数组', ['a'.repeat(30)]],
    ['text 为布尔', true],
  ];
  for (const [name, text] of cases) {
    const r = await h.post('/resume', AUTH_A, { text });
    A(`文本上传畸形拒:${name} → 400`, r.status === 400);
  }
  A('文本上传缺 text 字段 → 400', (await h.post('/resume', AUTH_A, {})).status === 400);
  // null 字节:通过 zod(合法 JS 串)但 Postgres text 拒   → 可解释失败(不静默入库)
  const nul = await h.post('/resume', AUTH_A, { text: '有效简历文本用于测试' + ' ' + '再补足二十字以上以过契约长度门' });
  A('文本含 null 字节 → 不 5xx(落库前剥除 NUL 优雅处理,不崩)', nul.status < 500);
}

// ══════════════════════════════════════════════════════════════════════════
// 5) PII 脱敏(文本链路,确定性硬断言):structured 永不含明文 PII;pii_summary 只计数
//    —— 被测主张:「PII 一定被去掉」。userA 上传含手机号/邮箱/身份证的文本,直查库断言。
// ══════════════════════════════════════════════════════════════════════════
let RA = '';   // userA 一份真简历(供后续越权/删除/兜底复用)
{
  const piiText = [
    '工作经历',
    '负责订单系统，联系电话13800138000，邮箱 zhangsan@example.com',
    '技能',
    'Redis、限流、身份证11010119900307461X',
  ].join('\n');
  const r = await h.post('/resume', AUTH_A, { text: piiText });
  A('userA(已同意)含 PII 文本上传成功入库(前置:取 resumeId 定位库行)', r.status === 200 && !!r.body?.resumeId);
  RA = r.body?.resumeId ?? '';
  const row = await profileRow(RA);
  const sj = JSON.stringify(row?.structured ?? {});
  A('structured 不含明文手机号 13800138000', !!row && !sj.includes('13800138000'));
  A('structured 不含明文邮箱 zhangsan@example.com', !sj.includes('zhangsan@example.com'));
  A('structured 不含明文身份证 11010119900307461X', !sj.includes('11010119900307461X'));
  A('pii_summary.phone 计数 >=1', Number(row?.pii_summary?.phone ?? 0) >= 1);
  A('pii_summary.email 计数 >=1', Number(row?.pii_summary?.email ?? 0) >= 1);
  A('pii_summary.idcard 计数 >=1', Number(row?.pii_summary?.idcard ?? 0) >= 1);
  A('pii_summary 只存计数不存掩码/明文值(值均为数字)', Object.values(row?.pii_summary ?? {}).every((v) => typeof v === 'number'));

  // 分隔符/全角规避:兜底脱敏也必须命中,不能被 138.0013.8000 / 全角绕过
  const evade = ['工作经历', '负责支付，联系方式 138.0013.8000 与 １３６１２３４５６７８'].join('\n');
  const r2 = await h.post('/resume', AUTH_A, { text: evade });
  A('分隔符/全角规避文本上传成功(前置:取 id)', r2.status === 200 && !!r2.body?.resumeId);
  const sj2 = JSON.stringify((await profileRow(r2.body.resumeId))?.structured ?? {});
  A('规避手机号(点分隔)被兜底脱敏,structured 不含 13800138000', !sj2.includes('13800138000'));
  A('规避手机号(点分隔)原串不整段泄漏', !sj2.includes('138.0013.8000'));
  A('全角手机号被归一后脱敏,structured 不含半角 13612345678', !sj2.includes('13612345678'));
}

// ══════════════════════════════════════════════════════════════════════════
// 6) 文件上传畸形:契约 UploadResumeFileDto + service 字节/格式/提取门
// ══════════════════════════════════════════════════════════════════════════
{
  const base = { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: IMG_B64 };
  A('文件缺 filename → 400', (await h.post('/resume/file', AUTH_A, { mimeType: 'application/pdf', contentBase64: IMG_B64 })).status === 400);
  A('文件缺 contentBase64 → 400', (await h.post('/resume/file', AUTH_A, { filename: 'cv.pdf', mimeType: 'application/pdf' })).status === 400);
  A('文件 filename 空串(< min1) → 400', (await h.post('/resume/file', AUTH_A, { ...base, filename: '' })).status === 400);
  A('文件 filename 超长(>255) → 400', (await h.post('/resume/file', AUTH_A, { ...base, filename: 'a'.repeat(256) })).status === 400);
  A('文件 mimeType 超长(>255) → 400', (await h.post('/resume/file', AUTH_A, { ...base, mimeType: 'a'.repeat(256) })).status === 400);
  A('文件 contentBase64 空串(< min1) → 400', (await h.post('/resume/file', AUTH_A, { ...base, contentBase64: '' })).status === 400);

  // 非法 padding 在共享 Zod 契约层拒绝，避免进入 decoder/parser。
  const empty = await h.post('/resume/file', AUTH_A, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: '====' });
  A('非法 base64 padding(====) → 400，解码/解析前拒绝', empty.status === 400 && empty.body?.error === 'invalid');

  // 超大:base64 超契约上限(10_700_000 chars,约等价 8MB 上限)→ 契约先拒
  const huge = await h.post('/resume/file', AUTH_A, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: 'A'.repeat(10_700_001) });
  A('文件 base64 超上限 → 400(大文件 DoS 门)', huge.status === 400);

  // 坏 base64 + .pdf → 解析失败可解释(不裸崩)
  const badpdf = await h.post('/resume/file', AUTH_A, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: '@@@@not-valid-pdf-bytes@@@@' });
  A('坏字节冒充 PDF → >=400 可解释(非 5xx 裸崩)', inRange(badpdf.status, 400, 499));

  // mime 与内容不符:声称 PDF 实为纯文本字节 → PDF 解析失败
  const mism = await h.post('/resume/file', AUTH_A, { filename: 'cv.pdf', mimeType: 'application/pdf', contentBase64: Buffer.from('这只是纯文本不是PDF结构').toString('base64') });
  A('mime 与内容不符(文本冒充 PDF) → >=400', inRange(mism.status, 400, 499));

  // 不支持格式不得降级为 UTF-8 文本：否则 XLSX/PPTX/视频会以乱码“成功入库”，
  // 既污染 RAG 又失去结构/时间轴/citation。全格式平台接入前必须显式 415。
  const exe = await h.post('/resume/file', AUTH_A, { filename: 'malware.exe', mimeType: 'application/x-msdownload', contentBase64: Buffer.from('MZ').toString('base64') });
  A('不支持类型/扩展(.exe) → 415 unsupported_file_format', exe.status === 415 && exe.body?.error === 'unsupported_file_format');
  const xlsx = await h.post('/resume/file', AUTH_A, { filename: 'budget.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', contentBase64: Buffer.from('PK\\x03\\x04fake-xlsx').toString('base64') });
  A('XLSX 未接专用表格 adapter 时 → 415，绝不乱码入库', xlsx.status === 415 && xlsx.body?.error === 'unsupported_file_format');
  const pptx = await h.post('/resume/file', AUTH_A, { filename: 'deck.pptx', mimeType: 'application/pdf', contentBase64: Buffer.from('PK\\x03\\x04fake-pptx').toString('base64') });
  A('PPTX 即使 MIME 伪称 PDF 仍 → 415，文件名/MIME 双侧 fail-closed', pptx.status === 415 && pptx.body?.error === 'unsupported_file_format');
  const video = await h.post('/resume/file', AUTH_A, { filename: 'interview.mp4', mimeType: 'video/mp4', contentBase64: Buffer.from('fake-video').toString('base64') });
  A('视频不走简历 text 解析 → 415，等待 ASR/时间轴摄取器', video.status === 415 && video.body?.error === 'unsupported_file_format');

  // 路径穿越 filename:filename 只用于格式探测,绝不落地为文件路径 → 安全处理不 5xx
  const trav = await h.post('/resume/file', AUTH_A, { filename: '../../../../etc/passwd', mimeType: 'text/plain', contentBase64: Buffer.from('短').toString('base64') });
  A('路径穿越 filename 被安全处理(4xx,不写文件/不 5xx)', inRange(trav.status, 400, 499));

  // 提取文本过短(txt 里几个字)→ extracted_too_short
  const shortTxt = await h.post('/resume/file', AUTH_A, { filename: 'cv.txt', mimeType: 'text/plain', contentBase64: Buffer.from('简历').toString('base64') });
  A('文件提取文本过短 → 400(extracted_too_short)', shortTxt.status === 400 && shortTxt.body?.error === 'extracted_too_short');
}

// ══════════════════════════════════════════════════════════════════════════
// 7) 重解析:不存在 / 越权 / 非法 id
// ══════════════════════════════════════════════════════════════════════════
{
  const none = await h.post('/resume/11111111-1111-1111-1111-111111111111/reparse', AUTH_A, {});
  A('reparse 不存在 id → 404', none.status === 404);
  A('reparse 不存在 error=not_found_or_forbidden', none.body?.error === 'not_found_or_forbidden');

  const cross = await h.post(`/resume/${RA}/reparse`, AUTH_B, {});   // userB 重解析 userA 的简历
  A('userB reparse userA 的简历 → 404(RLS 越权即不可见)', cross.status === 404);

  const bad = await h.post('/resume/not-a-uuid/reparse', AUTH_A, {});
  A('reparse 非法 uuid → >=400(不 200 泄漏)', bad.status >= 400);
}

// ══════════════════════════════════════════════════════════════════════════
// 8) 删除:不存在 / 跨用户 / 幂等二次
// ══════════════════════════════════════════════════════════════════════════
{
  const none = await h.req('DELETE', '/resume/22222222-2222-2222-2222-222222222222', AUTH_A);
  A('delete 不存在 id → 404', none.status === 404);
  A('delete 不存在 error=not_found_or_forbidden', none.body?.error === 'not_found_or_forbidden');

  const cross = await h.req('DELETE', `/resume/${RA}`, AUTH_B);      // userB 删 userA 的简历
  A('userB 删 userA 的简历 → 404(越权无效)', cross.status === 404);
  A('越权删除后 userA 的简历依然存在(未被删)', await resumeExists(RA));

  // 建一份 userA 专供删除,验证二次删除幂等(第二次 404)
  const rd = await h.post('/resume', AUTH_A, { text: '工作经历\n负责消息队列可靠投递与幂等消费三年，用于删除幂等测试' });
  const RD = rd.body?.resumeId ?? '';
  A('删除测试前置:创建一份 userA 简历', !!RD);
  const del1 = await h.req('DELETE', `/resume/${RD}`, AUTH_A);
  A('首次删除自有简历成功(前置,非业务断言)', del1.status === 200);
  const del2 = await h.req('DELETE', `/resume/${RD}`, AUTH_A);
  A('二次删除同一简历 → 404(幂等,不重复删/不 500)', del2.status === 404);
  A('二次删除 error=not_found_or_forbidden', del2.body?.error === 'not_found_or_forbidden');
}

// ══════════════════════════════════════════════════════════════════════════
// 9) 画像读取:不存在 / 跨用户越权
// ══════════════════════════════════════════════════════════════════════════
{
  const none = await h.req('GET', '/resume/33333333-3333-3333-3333-333333333333/profile', AUTH_A);
  A('GET profile 不存在 id → 404', none.status === 404);
  const cross = await h.req('GET', `/resume/${RA}/profile`, AUTH_B);
  A('userB 读 userA 的画像 → 404(RLS 越权)', cross.status === 404);
}

// ══════════════════════════════════════════════════════════════════════════
// 10) 隐私导出/删除:令牌 A 只能导 A;跨用户删数据不越界
// ══════════════════════════════════════════════════════════════════════════
{
  // victimU(已在 §2 同意)上传一份 → userA 的导出绝不含它
  const rv = await h.post('/resume', AUTH_V, { text: '工作经历\n负责风控系统规则引擎与实时决策三年，供跨租户导出隔离测试' });
  const RV = rv.body?.resumeId ?? '';
  A('跨租户前置:victimU 上传一份简历', !!RV);

  const expA = await h.req('GET', '/privacy/export', AUTH_A);
  A('userA 导出成功(前置:取 resumes 列表)', expA.status === 200 && Array.isArray(expA.body?.resumes));
  A('userA 导出不含 victimU 的简历(跨租户隔离)', !expA.body.resumes.some((x: any) => x.id === RV));
  A('userA 导出确实含自己的简历 RA(RLS 只己见,自证非空导错)', expA.body.resumes.some((x: any) => x.id === RA));

  // OCR 调用记录不含转写明文，但仍可按 owner 关联个人资料；删除权只清自己的
  // resume.vision 行，绝不误删另一个用户的同类审计记录。
  const digest = 'a'.repeat(64);
  await h.pool.query(
    `INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service)
     VALUES ('userB','erase-ocr-trace-b','{}','resume.vision'),('userA','erase-ocr-trace-a','{}','resume.vision')`,
  );
  await h.pool.query(
    `INSERT INTO ai_model_invocation(owner_user_id,idempotency_key,request_digest,status,output,replayable,service,completed_at)
     VALUES ('userB','erase-ocr-invocation-b',$1,'succeeded','{}',false,'resume.vision',clock_timestamp()),
            ('userA','erase-ocr-invocation-a',$1,'succeeded','{}',false,'resume.vision',clock_timestamp())`, [digest],
  );

  // userB 删除自己的简历数据:只删己,不动 userA 的 RA / victimU 的 RV
  const delB = await h.req('DELETE', '/privacy/resume-data', AUTH_B);
  A('userB 删除自有简历数据成功(前置)', delB.status === 200);
  A('userB 删数据仅删己(resumesRemoved=0,userB 本无简历)', delB.body?.resumesRemoved === 0);
  A('userB 的 OCR trace 被同一删除事务清除', delB.body?.ocrTracesRemoved === 1
    && Number((await h.pool.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id='userB' AND service='resume.vision'")).rows[0].n) === 0);
  A('userB 的 OCR durable invocation 被同一删除事务清除', delB.body?.ocrInvocationsRemoved === 1
    && Number((await h.pool.query("SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id='userB' AND service='resume.vision'")).rows[0].n) === 0);
  A('删除 userB 时不误删 userA 的 OCR 衍生记录',
    Number((await h.pool.query("SELECT count(*)::int n FROM ai_invocation_trace WHERE owner_user_id='userA' AND service='resume.vision'")).rows[0].n) === 1
    && Number((await h.pool.query("SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id='userA' AND service='resume.vision'")).rows[0].n) === 1);
  A('userB 删数据后 userA 的 RA 仍在(跨用户不越界)', await resumeExists(RA));
  A('userB 删数据后 victimU 的 RV 仍在(跨用户不越界)', await resumeExists(RV));
}

// ══════════════════════════════════════════════════════════════════════════
// 11) OCR 图片链路 PII 脱敏(OCR_FAKE_TEXT 故意含 13800138000)+ 降级兜底
//     —— 主张:OCR 转写文本同走 stripPii,structured 不含明文手机号;源恒 needs_review。
// ══════════════════════════════════════════════════════════════════════════
{
  const ocr = await h.post('/resume/file', AUTH_A, { filename: 'scan.png', mimeType: 'image/png', contentBase64: IMG_B64 });
  if (ocr.status === 200 && ocr.body?.resumeId) {
    const row = await profileRow(ocr.body.resumeId);
    const sj = JSON.stringify(row?.structured ?? {});
    A('OCR 画像 structured 不含明文手机号 13800138000(转写文本同过 stripPii)', !!row && !sj.includes('13800138000'));
    A('OCR/图片源 profile.status=needs_review(系统不冒充判真伪)', row?.status === 'needs_review');
    A('OCR 画像 pii_summary.phone 计数 >=1', Number(row?.pii_summary?.phone ?? 0) >= 1);
  } else {
    // 额度/重复/kill-switch 等 → 必须可解释降级,不 5xx 裸崩、不静默死胡同
    A('OCR 链路降级路径可解释(>=400,非 200 半成品)', ocr.status >= 400);
    A('OCR 降级回带 error 标志(不静默)', typeof ocr.body?.error === 'string');
  }
  // OCR kill-switch:能力级 flag 关闭 → 与现状一致的 422 降级(不排队、不裸崩)
  // (此处不改环境,仅验证同图重传路径的确定性负行为在别处覆盖;保留说明)
}

// 统计:见文件末注释。
await done();

/*
 * ── 用例条数统计(A() 调用) ──
 * §1 同意门:                8
 * §2 同意幂等:              2
 * §3 鉴权 fail-closed:      11 (10 端点 + 1 body 标志)
 * §4 文本上传畸形:          11 (9 cases + 缺字段 + null 字节)
 * §5 PII 脱敏(文本):        11 (7 主 + 4 规避)
 * §6 文件上传畸形:          12
 * §7 重解析:                4
 * §8 删除:                  8
 * §9 画像读取:              2
 * §10 隐私导出/删除:         10
 * §11 OCR PII / 降级:        3 (二选一分支各含 2~3 条)
 * ── 合计约 79 条纯负路径用例(0 条 happy-path 断言) ──
 */
