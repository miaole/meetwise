/**
 * UC-E2E-003 — NHP-003-NEG-01（NEG 分面 · 契约符合性 · 纯函数+静态源对账 · 零 PG · 零外呼 · 零 key）
 *
 * 需求源 = e2e-scenarios.md:101 A2「后端校验错误以 en 文案呈现（错误码→i18n 映射断言）」。
 * 行使面 = API 上传链 NEG 产出码域（apps/api/src/modules/resume/resume.service.ts 上传链
 * HttpException `error:` 字面 · 方法级 scope=uploadGate/uploadFile/uploadImageViaOcr/
 * uploadInTransaction · 排除 not_found_or_forbidden list/get/delete 面=非上传链产出）
 * ↔ web 映射链（apps/web/lib/resume/ocr-preview-ui.ts 映射单源 :19 zh 22 键 · :47 en 22 键 ·
 * :133 mapResumeUploadError · :137 `messages[error] ?? messages.upload_failed` fail-closed ·
 * :141 mapResumeUploadAbort · :146 isUploadTimeoutError）的**契约符合性**——供给侧全域对账+
 * 真信封形，非批 A NHP-003-ADV-01 的对抗健壮性重铺（旁证互不替代 · Ban 互借关列）。
 *
 * 臂（uc003x-REQUEST §1 Case 1）：
 *   N1  契约对账（源→map 键域 · 单段形）——源扫上传链 18 码枚举：
 *       N1a 已映射段 18 码 ∈zh∧∈en（绿断言 · 方向钉死=API⊆map·API 新增码缺映射即红）
 *       N1b encrypted/magic_mismatch 补齐在证（12 条逐字谓词 + 2 条未知码兜底继任臂）——
 *           原否证臂前提（两码 ∉ map 双侧）已被产品映射消灭，退役属**前提失效**非断言放宽。
 *   N2  真信封逐字——zh message/hint 字段逐字 pin 自 resume.service（blob 锚）× locale='en'：
 *       18 码 exact en 文案钉（ERROR_MESSAGES_EN 对应值全等）+ 未知码兜底（由 N1b 强形臂承接）。
 *   N3  状态耦合——真实状态↔码配对全状态域行使（429/400/413/503/415/422/403/402/409 ·
 *       413 状态优先臂 :131 为真产品行为如实行使）。
 *   N4  zh 对照子臂——抽样真信封 × zh → zh 文案（对照 · 列不翻纪律同批 A N1）。
 *   F1  FAULT 薄臂——AbortError/TimeoutError 故障注入形 → isUploadTimeoutError 三形分类 +
 *       mapResumeUploadAbort('en') en upload_timeout exact 钉+CJK-free + zh 对照 +
 *       超时常量关系（FAULT 列不因 F1 翻动 · blind 保持）。
 *   D1-PF Case 2 本地拒臂的纯函数支撑面——resumeImageRefusedLocally error 码透传断言落本层
 *       （r2 席2 P2-4：error 码透传断言落纯函数层非 DOM 文本 · DOM 层仅 message）。
 *
 * 非替代申明：批 A NHP-003-ADV-01（对抗健壮性）· web-logic TC-RES-081（zh 缺省面）·
 * 静态 S4（map 内部 parity）=旁证互不替代 · Ban 借本 case 收据洗 UC-015/批 C ADV 列。
 *
 * EXIT=0 = 本 case 全臂绿 ≠ UC-E2E-003 covered ≠ suite green；§1.0.1 :114 行措辞零翻动
 * （NEG case-only 格值零翻动 · N1b 否证措辞随 2026-10-30 EXEC additive 注记改写 ·
 * FAULT=blind 不因 F1 翻动 · coveredCount=8 不变）。
 *
 *   pnpm uc003:nhp-neg:prove            （root · 经 run-e2e-isolated 隔离面）
 *   pnpm -C apps/web prove:uc003-nhp-neg （raw）
 */
import { readFileSync } from 'node:fs';
import {
  isUploadTimeoutError,
  mapResumeUploadAbort,
  mapResumeUploadError,
  readResumeUploadErrorCode,
  RESUME_OCR_PREVIEW_TIMEOUT_MS,
  RESUME_TEXT_UPLOAD_TIMEOUT_MS,
  resumeImageRefusedLocally,
} from '../lib/resume/ocr-preview-ui.ts';

let fail = 0;
let total = 0;
const A = (n: string, c: boolean) => { total++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const CJK = /[\u4e00-\u9fff]/;

// ── 源读与映射单源键域解析（静态对账基座）──
const svcSrc = readFileSync(new URL('../../../apps/api/src/modules/resume/resume.service.ts', import.meta.url), 'utf8');
const mapSrc = readFileSync(new URL('../lib/resume/ocr-preview-ui.ts', import.meta.url), 'utf8');

const parseMap = (name: string): Map<string, string> => {
  const block = mapSrc.match(new RegExp(`const ${name}\\s*:\\s*Record<string,\\s*string>\\s*=\\s*\\{([\\s\\S]*?)\\n\\};`));
  if (!block) throw new Error(`map_unparseable:${name}`);
  const out = new Map<string, string>();
  for (const m of block[1].matchAll(/^\s*([a-z_]+):\s*'([^']*)',\s*$/gm)) out.set(m[1], m[2]);
  return out;
};
const ZH_MAP = parseMap('ERROR_MESSAGES');
const EN_MAP = parseMap('ERROR_MESSAGES_EN');

// 上传链方法级 scope：uploadGate 起 → list( 止（uploadFile/uploadImageViaOcr/upload/uploadInTransaction
// 全在其内；not_found_or_forbidden list/reparse/remove/profile 面全在其后=排除）。
const scopeMatch = svcSrc.match(/private async uploadGate\([\s\S]*?\n {2}list\(principal: string\) \{/);
const uploadChainSrc = scopeMatch ? scopeMatch[0] : '';
const scanCodes = (region: string): string[] =>
  [...region.matchAll(/HttpException\(\s*\{\s*error:\s*'([a-z_]+)'/g)].map((m) => m[1]);

const EXPECTED_18 = [
  'too_many_requests', 'empty_file', 'file_too_large', 'server_busy', 'unsupported_file_format',
  'encrypted', 'magic_mismatch', 'parse_failed', 'extracted_too_short', 'extracted_too_long',
  'image_ocr_unavailable', 'consent_required', 'insufficient_entitlement', 'ocr_duplicate',
  'ocr_failed', 'ocr_binding_missing', 'ocr_binding_invalid', 'ocr_no_content',
];
const MAPPED_18 = EXPECTED_18;
const WEB_ONLY_4 = ['ocr_preview_format', 'public_preview_read_only', 'upload_timeout', 'upload_failed'];

// 真信封形：zh message/hint 字段逐字 pin 自 resume.service.ts 届值（blob 锚钉 · REQUEST §0.1）。
type Envelope = { code: string; status: number; body: Record<string, unknown>; hint?: string };
const ENVELOPES: Envelope[] = [
  { code: 'too_many_requests', status: 429, body: { error: 'too_many_requests', message: '文件上传过于频繁,请稍候' } },
  { code: 'empty_file', status: 400, body: { error: 'empty_file' } },
  { code: 'file_too_large', status: 413, body: { error: 'file_too_large' } },
  { code: 'server_busy', status: 503, body: { error: 'server_busy', message: '解析繁忙,请稍候重试' } },
  { code: 'unsupported_file_format', status: 415, body: { error: 'unsupported_file_format', filename: 'resume.xls', hint: '该格式尚未接入简历解析；请上传 PDF、Word、图片或纯文本。Excel/PPT/音视频请走全格式知识库摄取管线。' }, hint: '该格式尚未接入简历解析；请上传 PDF、Word、图片或纯文本。Excel/PPT/音视频请走全格式知识库摄取管线。' },
  { code: 'encrypted', status: 422, body: { error: 'encrypted', hint: '文件已加密，无法解析；请解除密码保护后重传或粘贴文本' }, hint: '文件已加密，无法解析；请解除密码保护后重传或粘贴文本' },
  { code: 'magic_mismatch', status: 422, body: { error: 'magic_mismatch', hint: '文件内容与声明的格式不符，请确认文件类型后重传' }, hint: '文件内容与声明的格式不符，请确认文件类型后重传' },
  { code: 'parse_failed', status: 422, body: { error: 'parse_failed', format: undefined } },
  { code: 'extracted_too_short', status: 400, body: { error: 'extracted_too_short', format: 'pdf', hint: '未从文件读到足够文字;若为扫描件/图片型 PDF,请改传清晰图片或粘贴文本' }, hint: '未从文件读到足够文字;若为扫描件/图片型 PDF,请改传清晰图片或粘贴文本' },
  { code: 'extracted_too_long', status: 413, body: { error: 'extracted_too_long', format: 'txt', max: 60_000, hint: '文件内容过长(疑似非常规简历/解压炸弹),请精简后重传或粘贴核心文本' }, hint: '文件内容过长(疑似非常规简历/解压炸弹),请精简后重传或粘贴核心文本' },
  { code: 'image_ocr_unavailable', status: 422, body: { error: 'image_ocr_unavailable', hint: '图片简历 OCR 仅预览版可用（OCR_ENABLED=1 且 OCR_PREVIEW=1）；生产未开放，请先传 PDF/Word 或粘贴文本' }, hint: '图片简历 OCR 仅预览版可用（OCR_ENABLED=1 且 OCR_PREVIEW=1）；生产未开放，请先传 PDF/Word 或粘贴文本' },
  { code: 'consent_required', status: 403, body: { error: 'consent_required', purpose: 'resume_processing' } },
  { code: 'insufficient_entitlement', status: 402, body: { error: 'insufficient_entitlement', hint: '额度不足,请充值后再识别图片简历', requested: 1, available: 0 }, hint: '额度不足,请充值后再识别图片简历' },
  { code: 'ocr_duplicate', status: 409, body: { error: 'ocr_duplicate', hint: '该图片已识别、正在识别，或结果等待人工对账；请在简历列表查看' }, hint: '该图片已识别、正在识别，或结果等待人工对账；请在简历列表查看' },
  { code: 'ocr_failed', status: 422, body: { error: 'ocr_failed', reason: 'vision_upstream', hint: '图片识别失败,请换更清晰的图片或粘贴文本' }, hint: '图片识别失败,请换更清晰的图片或粘贴文本' },
  { code: 'ocr_binding_missing', status: 422, body: { error: 'ocr_binding_missing', hint: '图片简历缺少已登记 OCR binding,请改传 PDF/Word 或粘贴文本' }, hint: '图片简历缺少已登记 OCR binding,请改传 PDF/Word 或粘贴文本' },
  { code: 'ocr_binding_invalid', status: 422, body: { error: 'ocr_binding_invalid', hint: '图片简历缺少可解析的 OCR binding,已退还额度,请改传 PDF/Word 或粘贴文本' }, hint: '图片简历缺少可解析的 OCR binding,已退还额度,请改传 PDF/Word 或粘贴文本' },
  { code: 'ocr_no_content', status: 422, body: { error: 'ocr_no_content', hint: '图片识别成功但未提取到有效简历内容,已退还额度,请换更清晰的图片或粘贴文本' }, hint: '图片识别成功但未提取到有效简历内容,已退还额度,请换更清晰的图片或粘贴文本' },
];

// exact en 文案钉（ERROR_MESSAGES_EN 届值逐字 · map 改值须回炉重 pin 非 Ban 改断言跟跑）。
// 形=Map 键值对数组（键为机读码字面·batch A PC 目录同形·避 object literal property naming 噪声）。
const EN_EXACT = new Map<string, string>([
  ['too_many_requests', 'File uploads are too frequent. Please wait a moment and try again.'],
  ['empty_file', 'Please choose a file to upload.'],
  ['file_too_large', 'File exceeds the 8MB limit.'],
  ['server_busy', 'Parsing is busy. Please wait and retry.'],
  ['unsupported_file_format', 'This format is not wired into resume parsing yet. Please upload PDF or Word, or an image in preview environments.'],
  ['parse_failed', 'File parsing failed. Try a PDF/Word or paste text.'],
  ['extracted_too_short', 'Not enough text could be read from the file. Please paste text or upload a PDF with a text layer.'],
  ['extracted_too_long', 'The file content is too long. Trim it, upload again, or paste the core text.'],
  ['image_ocr_unavailable', 'Image resume recognition is not available here. Please upload a PDF/Word or paste text.'],
  ['consent_required', 'Please agree to the privacy policy before uploading.'],
  ['insufficient_entitlement', 'Insufficient credit; image recognition was not executed. Please upload a PDF/Word or paste text.'],
  ['ocr_duplicate', 'This image is already being recognized or reconciled. Check the resume list instead of treating it as a new recognition result.'],
  ['ocr_failed', 'Image recognition failed. Try a clearer image or paste text. The system never invents recognition results.'],
  ['ocr_binding_missing', 'The image resume lacks a registered recognition binding. Please upload a PDF/Word or paste text.'],
  ['ocr_binding_invalid', 'The image resume binding cannot be parsed; it was treated as a failure and the credit was refunded. Please upload a PDF/Word or paste text.'],
  ['ocr_no_content', 'No valid resume content could be extracted from the image; it was treated as a failure and nothing invented is saved. Try a clearer image or paste text.'],
  ['encrypted', 'The file is encrypted and cannot be parsed. Remove the password protection and upload again, or paste the text. If the file is not actually encrypted, please upload a different file.'],
  ['magic_mismatch', 'The file content does not match its declared format. Please confirm the file type and upload again.'],
]);
const EN_UPLOAD_FAILED = 'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.';
const EN_UPLOAD_TIMEOUT = 'Upload timed out. A recognition failure never invents text. Please retry later or switch to PDF/Word or pasted text.';

// zh 对照抽样钉（ERROR_MESSAGES 届值逐字）。
const ZH_EXACT = new Map<string, string>([
  ['too_many_requests', '文件上传过于频繁，请稍候再试。'],
  ['unsupported_file_format', '该格式尚未接入简历解析。请上传 PDF、Word，或在预览环境上传图片。'],
  ['image_ocr_unavailable', '图片简历识别未开放，请先传 PDF/Word 或粘贴文本。'],
  ['insufficient_entitlement', '额度不足，图片识别未执行。请改传 PDF/Word 或粘贴文本。'],
  ['ocr_duplicate', '该图片已在识别或对账中，请到简历列表查看，不要当作新的识别结果。'],
  ['extracted_too_long', '文件内容过长，请精简后重传或粘贴核心文本。'],
  ['encrypted', '该 PDF 受密码保护，系统无法读取其中内容。请先解除密码保护后重新上传，或改为粘贴文本；若文件确实未加密，请改传其他文件。'],
  ['magic_mismatch', '文件内容与声明格式不符，请确认文件类型后重新上传。'],
]);
const ZH_UPLOAD_FAILED = '文件上传暂未完成，请检查文件和网络后重试。不会编造识别结果。';
const ZH_UPLOAD_TIMEOUT = '上传超时。识别失败不会编造文字，请稍后重试或改传 PDF/Word / 粘贴文本。';

console.log('UC-E2E-003 NHP-003-NEG-01 · NEG 契约符合性行使 · releaseEvidence=false · Not HA');
console.log('NOTE: 纯函数+静态源对账零 PG 零外呼零 key；EXIT0 = case ≠ covered；矩阵 :114 措辞零翻动');

// ── 前置锚 · 方法级 scope 与映射单源键域基座 ──
section('前置锚 · 方法级 scope（uploadGate+三方法）与映射单源键域');
{
  A('锚 uploadGate 方法标记在场（scope 起点 :38）', /private async uploadGate\(principal: string\)/.test(svcSrc));
  A('锚 uploadFile 方法标记在场（:44）', /async uploadFile\(principal: string, dto: UploadResumeFileDto\)/.test(svcSrc));
  A('锚 uploadImageViaOcr 方法标记在场（:95）', /private async uploadImageViaOcr\(/.test(svcSrc));
  A('锚 uploadInTransaction 方法标记在场（:206）', /private async uploadInTransaction\(/.test(svcSrc));
  A('锚 uploadGate 令牌桶 15/0.1 参数形在场（:39）', /this\.rl\.allow\(`resume-file:\$\{principal\}`, 15, 0\.1\)/.test(svcSrc));
  A('映射单源 zh map 恰 22 键', ZH_MAP.size === 22);
  A('映射单源 en map 恰 22 键', EN_MAP.size === 22);
  A('映射单源 zh/en 键域 22/22 parity', [...ZH_MAP.keys()].sort().join(',') === [...EN_MAP.keys()].sort().join(','));
  A('映射单源 en map 22 值全 CJK-free', [...EN_MAP.values()].every((v) => v.length > 0 && !CJK.test(v)));
}

// ── N1 · 契约对账（源→map 键域 · 方法级 scope 源扫）──
section('N1 · 源扫对账（上传链 HttpException error 字面 · 方法级 scope）');
{
  const scanned = scanCodes(uploadChainSrc);
  const distinct = [...new Set(scanned)].sort();
  A('scope 区源扫 HttpException error 字面恰 18 码', distinct.length === 18);
  A('scope 区源扫 18 码集合逐码恰等（EXPECTED_18）', distinct.join(',') === [...EXPECTED_18].sort().join(','));
  A('consent_required 在 scope 区出现 2 次（:107/:214 上传两门）', scanned.filter((c) => c === 'consent_required').length === 2);
  A('not_found_or_forbidden ∉ scope 区（list/get/delete 面排除=非上传链产出）', !distinct.includes('not_found_or_forbidden'));
  A('web 侧独有 4 码 ∉ scope 区（守卫/兜底/abort 面非 API 产出·如实披露）', WEB_ONLY_4.every((c) => !distinct.includes(c)));
  A('upload 链 scope 区非空（源读成立）', uploadChainSrc.length > 1000);
}

// ── N1a · 已映射段（18 码 · ∈zh∧∈en 绿断言 · 方向钉死=API⊆map）──
section('N1a · 18 已映射码 ∈zh∧∈en（绿断言）');
for (const code of MAPPED_18) {
  A(`N1a ${code} ∈ zh map 键`, ZH_MAP.has(code));
  A(`N1a ${code} ∈ en map 键`, EN_MAP.has(code));
}

// ── N1b · 补齐在证（encrypted/magic_mismatch · 12 条逐字谓词 + 2 条未知码兜底继任臂）──
section('N1b · encrypted/magic_mismatch 补齐在证（12 条逐字谓词 · 前提失效臂退役≠放宽）');
// 迭代源只许字面两码数组：禁 GAP_2/任何可空集合/EXPECTED_18.filter 派生
// （空循环静默零迭代且计数门拦不住；MAPPED_18 忘改=131 且 EXIT=0）。
for (const code of ['encrypted', 'magic_mismatch'] as const) {
  const env = ENVELOPES.find((e) => e.code === code) as Envelope;
  A(`N1b ${code} ∈ zh map 键`, ZH_MAP.has(code) === true);
  A(`N1b ${code} ∈ en map 键`, EN_MAP.has(code) === true);
  A(`N1b ${code} en 文案 exact 钉（map 本值）`, mapResumeUploadError(422, { error: code }, 'en').message === EN_EXACT.get(code));
  A(`N1b ${code} zh 文案 exact 钉（map 本值）`, mapResumeUploadError(422, { error: code }, 'zh').message === ZH_EXACT.get(code));
  A(`N1b ${code} en 文案 CJK-free`, typeof EN_MAP.get(code) === 'string' && !CJK.test(EN_MAP.get(code) as string));
  // 真信封（含 zh hint 字段）全链：码提取 → 映射 error 透传 → en exact 文案（区别于第 3 条合成最小体）。
  A(`N1b ${code} 码路径 422 真信封透传`, 'hint' in env.body
    && env.status === 422
    && readResumeUploadErrorCode(env.body) === code
    && mapResumeUploadError(env.status, env.body, 'en').error === code
    && mapResumeUploadError(env.status, env.body, 'en').message === EN_EXACT.get(code));
}
// 未知码兜底继任臂（原 N1b zh 兜底断言的继任者·强形）：合成码非 18 码/非 22 键域，
// 双 locale 逐字钉 upload_failed 且与两表本值同源一致；en 面另有 ADV V1/V3 承接。
{
  const unknown = 'some_unknown_code';
  const unknownEn = mapResumeUploadError(400, { error: unknown }, 'en');
  A('N1b 未知码 some_unknown_code en 兜底 upload_failed 双表 exact 钉',
    unknownEn.error === unknown && unknownEn.message === EN_MAP.get('upload_failed') && unknownEn.message === EN_UPLOAD_FAILED);
  const unknownZh = mapResumeUploadError(400, { error: unknown }, 'zh');
  A('N1b 未知码 some_unknown_code zh 兜底 upload_failed 双表 exact 钉',
    unknownZh.error === unknown && unknownZh.message === ZH_MAP.get('upload_failed') && unknownZh.message === ZH_UPLOAD_FAILED);
}
console.log('PIN   N1b 补齐在证：encrypted/magic_mismatch 两码 zh/en 双侧 22 键全映射（API 18 码 ⊆ web 22 键）· 原 backlog 登记已由本刀产品映射兑现 · 零断言放宽');

// ── N2 · 真信封逐字臂（zh 字段逐字 × locale=en）──
section('N2 · 真信封 × locale=en：18 码 exact en 文案钉 + 未知码兜底（N1b 强形承接）');
{
  for (const env of ENVELOPES.filter((e) => MAPPED_18.includes(e.code))) {
    if (env.code === 'extracted_too_long') {
      // 真信封=HTTP 413（resume.service.ts:81）→ :131 413 状态优先真路由 → file_too_large 文案
      // （真行为如实行使·与 N3 413 臂同真行为互证）——非断言放宽：双面各 exact 钉。
      const r = mapResumeUploadError(env.status, env.body, 'en');
      A(`N2 ${env.code}@413 en 真路由=413 状态优先 file_too_large 文案 exact 钉（:131 真行为）`, r.error === 'file_too_large' && r.message === EN_EXACT.get('file_too_large'));
      // map 本值 exact 钉：非 413 状态面行使 body 码路径（ERROR_MESSAGES_EN 对应值全等）。
      const bodyFace = mapResumeUploadError(400, env.body, 'en');
      A(`N2 ${env.code} en map 本值 exact 钉（非 413 状态面·ERROR_MESSAGES_EN 全等）`, bodyFace.error === 'extracted_too_long' && bodyFace.message === EN_EXACT.get('extracted_too_long'));
      continue;
    }
    const r = mapResumeUploadError(env.status, env.body, 'en');
    A(`N2 ${env.code}@${env.status} en 文案 exact 钉（全等比较）`, r.message === EN_EXACT.get(env.code));
  }
  const allEn = ENVELOPES.filter((e) => MAPPED_18.includes(e.code))
    .map((e) => mapResumeUploadError(e.status, e.body, 'en'));
  A('N2 18 码 en 文案全 CJK-free（en 用户面零 zh 泄漏）', allEn.every((r) => !CJK.test(r.message)));
  for (const env of ENVELOPES.filter((e) => MAPPED_18.includes(e.code) && e.hint)) {
    const r = mapResumeUploadError(env.status, env.body, 'en');
    A(`N2 ${env.code} zh hint 字段零透传（API 中文提示不升格 en 用户面）`, !r.message.includes(env.hint as string));
  }
  A('N2 readResumeUploadErrorCode 对真信封逐码透传（18 码机器码提取）', ENVELOPES.every((e) => readResumeUploadErrorCode(e.body) === e.code));
}

// ── N3 · 状态耦合臂（真实状态↔码配对 · 全状态域 · 413 状态优先真行为如实行使）──
section('N3 · 状态耦合（429/400/413/503/415/422/403/402/409 全域）');
for (const env of ENVELOPES) {
  if (env.status === 413) continue; // 413 族单独臂（状态优先覆盖）
  const r = mapResumeUploadError(env.status, env.body, 'en');
  A(`N3 ${env.status} → ${env.code} 码透传（状态↔码配对）`, r.error === env.code);
}
{
  const f413 = mapResumeUploadError(413, { error: 'file_too_large' }, 'en');
  A('N3 413 → file_too_large 状态优先（:131 真行为）', f413.error === 'file_too_large' && f413.message === EN_EXACT.get('file_too_large'));
  const e413 = mapResumeUploadError(413, { error: 'extracted_too_long' }, 'en');
  A('N3 413 + extracted_too_long → 仍 file_too_large（状态码先于 body 码）', e413.error === 'file_too_large' && e413.message === EN_EXACT.get('file_too_large'));
  const eNon413 = mapResumeUploadError(400, { error: 'extracted_too_long' }, 'en');
  A('N3 非 413（400）+ extracted_too_long → body 码透传（413 门负对照）', eNon413.error === 'extracted_too_long');
}

// ── N4 · zh 对照子臂（抽样真信封 × zh → zh 文案 · 列不翻）──
section('N4 · zh 对照（抽样 · 列不翻纪律）');
{
  const sample = ['too_many_requests', 'unsupported_file_format', 'image_ocr_unavailable', 'insufficient_entitlement', 'ocr_duplicate', 'extracted_too_long'];
  for (const code of sample) {
    const env = ENVELOPES.find((e) => e.code === code) as Envelope;
    if (code === 'extracted_too_long') {
      // 真信封=413 → zh 面同走 :131 状态优先（zh file_too_large 文案 exact 钉）· map 本值经非 413 状态面对照。
      const zhTrue = mapResumeUploadError(env.status, env.body, 'zh');
      A('N4 extracted_too_long × zh 真路由=413 状态优先（zh file_too_large 文案 exact 钉+CJK 在场）', zhTrue.message === '文件超过 8MB 上限。' && CJK.test(zhTrue.message));
      const zhBody = mapResumeUploadError(400, env.body, 'zh');
      A('N4 extracted_too_long × zh map 本值 exact 钉（非 413 状态面）', zhBody.message === ZH_EXACT.get('extracted_too_long') && CJK.test(zhBody.message));
      continue;
    }
    const r = mapResumeUploadError(env.status, env.body, 'zh');
    A(`N4 ${code} × zh → zh 文案 exact 钉`, r.message === ZH_EXACT.get(code) && CJK.test(r.message));
  }
  const enVsZh = sample.every((code) => {
    const env = ENVELOPES.find((e) => e.code === code) as Envelope;
    return mapResumeUploadError(env.status, env.body, 'en').message !== mapResumeUploadError(env.status, env.body, 'zh').message;
  });
  A('N4 抽样六码 en/zh 两形可分（映射层真二值）', enVsZh);
}

// ── F1 · FAULT 薄臂（client abort/timeout · FAULT 列不因 F1 翻动）──
section('F1 · abort/timeout 故障注入薄臂（en 面 · web-logic TC-RES-081 zh 缺省臂旁证互不替代）');
{
  const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' });
  const timeoutErr = Object.assign(new Error('timed out'), { name: 'TimeoutError' });
  A('F1 AbortError → isUploadTimeoutError true', isUploadTimeoutError(abortErr) === true);
  A('F1 TimeoutError → isUploadTimeoutError true', isUploadTimeoutError(timeoutErr) === true);
  A('F1 非超时 Error(network) → false（负判）', isUploadTimeoutError(new Error('network')) === false);
  A('F1 非 Error 形 → false', isUploadTimeoutError('AbortError') === false);
  const en = mapResumeUploadAbort('en');
  A('F1 mapResumeUploadAbort(en) error=upload_timeout 透传', en.error === 'upload_timeout' && en.ok === false);
  A('F1 mapResumeUploadAbort(en) en 文案 exact 钉', en.message === EN_UPLOAD_TIMEOUT);
  A('F1 en abort 文案 CJK-free', !CJK.test(en.message));
  const zh = mapResumeUploadAbort('zh');
  A('F1 mapResumeUploadAbort(zh) zh 对照 exact 钉+CJK 在场', zh.message === ZH_UPLOAD_TIMEOUT && CJK.test(zh.message));
  A('F1 超时常量关系 35s>8s 双值 exact', RESUME_TEXT_UPLOAD_TIMEOUT_MS === 8_000 && RESUME_OCR_PREVIEW_TIMEOUT_MS === 35_000 && RESUME_OCR_PREVIEW_TIMEOUT_MS > RESUME_TEXT_UPLOAD_TIMEOUT_MS);
}

// ── D1-PF · Case 2 本地拒臂纯函数支撑面（error 码透传断言落本层 · DOM 层仅 message）──
section('D1-PF · resumeImageRefusedLocally 纯函数面（Case 2 D1 支撑 · r2 P2-4）');
{
  const en = resumeImageRefusedLocally('en');
  A('D1-PF en 臂 error=image_ocr_unavailable 码透传（落纯函数层）', en.ok === false && en.error === 'image_ocr_unavailable');
  A('D1-PF en 臂 message exact 钉（=en map image_ocr_unavailable 逐字）', en.message === EN_EXACT.get('image_ocr_unavailable'));
  A('D1-PF en 臂 CJK-free', !CJK.test(en.message));
  const zh = resumeImageRefusedLocally('zh');
  A('D1-PF zh 臂对照 exact 钉+CJK 在场', zh.message === ZH_EXACT.get('image_ocr_unavailable') && CJK.test(zh.message));
  A('D1-PF 与映射单源同源（mapResumeUploadError 码面互证）', readResumeUploadErrorCode({ error: 'image_ocr_unavailable' }) === en.error);
}

console.log(`\n${fail === 0
  ? `✓ NHP-003-NEG-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
  : `✗ ${fail}/${total} NHP-003-NEG-01 断言失败`}`);
console.log('PIN: EXIT0≠covered · §1.0.1 :114 行措辞零翻动（NEG gap→case-only 措辞仅经 EXEC · FAULT=blind 不因 F1 翻动）');
console.log('PIN: N1b 已补齐在证（encrypted/magic_mismatch 22 键全映射 · API 18 码 ⊆ web 22 键）· 原 backlog 登记已由本刀兑现 · 零断言放宽');
console.log('PIN: 批 A ADV/web-logic TC-RES-081/静态 S4=旁证互不替代 · Ban 借本收据洗 UC-015/批 C ADV 列');
console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8');
process.exit(fail ? 1 : 0);
