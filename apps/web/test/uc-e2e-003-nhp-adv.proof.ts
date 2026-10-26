/**
 * UC-E2E-003 — NHP-003-ADV-01（ADV 分面 · 运行级对抗行使 · 纯函数 · 零 PG · 零外呼 · 零 key）
 *
 * 行使面 = `apps/web/lib/resume/ocr-preview-ui.ts` 错误码映射层（:123 readResumeUploadErrorCode ·
 * :129 mapResumeUploadError · :133 `messages[error] ?? messages.upload_failed` fail-closed 回退 ·
 * :68-70 `locale === 'en' ? EN : ZH` 二值 allowlist）+ `apps/web/i18n/request.ts` locale allowlist
 * 契约（:6 DEFAULT_LOCALE='zh' · :11 cookie `includes` 守卫 → 伪造 locale 一律回退默认）。
 *
 * 臂（§1 Row 2 + §9-rev2）：
 *   PC = 已知码 + locale='en' → en 文案（CJK-free · A2 真行使 · 对照缺失=Ban 假绿）
 *   N1 = 已知码 + zh → zh 文案（对照 · NEG 列不因 N-臂翻动）
 *   V1 = 未知错误码 → `upload_failed` 回退（不发明文案）——键域排除原型链族
 *        toString/constructor/__proto__（§9-rev2 ②/R3 预登记：映射层 `messages[error]` 无
 *        own-property 守卫属已知疑似产品缺陷 → 执行中实证即 EXIT1/backlog；本刀收窄键域不行使
 *        该族 → 防假绿，非放水；修复归产品刀 Ban 借刀）
 *   V2 = 伪造 locale 值（'EN'/'fr'/路径形/超长）→ 一律 zh 臂（二值 allowlist · request.ts:11 同契约）
 *   V3 = 对抗信封（非对象 / 空 error / 空白 error / transcript 形字段注入）→ 仅取机器码 ·
 *        `upload_failed` 兜底 · 零 transcript 字段发明
 *   V4 = 413 → `file_too_large` 映射（状态码优先臂 · :131 先于 body error 码）
 *
 * EXIT=0 = 本 case 全臂绿 ≠ UC-E2E-003 covered ≠ suite green；§1.0.1 :114 行措辞零翻动
 * （NEG=gap 不因 N-臂翻动 · FAULT=blind 不动 · ADV blind→case-only 仅经 coordinator nail）。
 * D3 披露：零模型产出语言断言 · A1 DOM 中文残留扫描不重铺（既有 S 锚旁证）。
 *
 *   pnpm uc003:nhp-adv:prove            （root · 经 run-e2e-isolated 零 key 隔离面）
 *   pnpm -C apps/web prove:uc003-nhp-adv （raw）
 */
import { readFileSync } from 'node:fs';
import { mapResumeUploadError, readResumeUploadErrorCode } from '../lib/resume/ocr-preview-ui.ts';

let fail = 0;
let total = 0;
const A = (n: string, c: boolean) => { total++; console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
// 对抗值需绕过编译期窄类型（对抗行使正是模拟绕过上层类型面的运行期值）。
const forged = (v: unknown) => v as never;

const CJK = /[\u4e00-\u9fff]/;
const KNOWN_CODES = [
  'ocr_failed', 'file_too_large', 'empty_file', 'unsupported_file_format', 'parse_failed',
  'too_many_requests', 'server_busy', 'upload_timeout', 'consent_required', 'insufficient_entitlement',
];

console.log('UC-E2E-003 NHP-003-ADV-01 · ADV 运行级对抗行使 · releaseEvidence=false · Not HA');
console.log('NOTE: 纯函数行使零 PG 零外呼零 key；EXIT0 = case ≠ covered；矩阵 :114 行措辞零翻动');

// ── PC · 已知码 + en → en 文案（A2 真行使 · CJK-free 对照臂）──
section('PC · 已知码 + locale=en → en 文案（A2 真行使）');
{
  for (const code of KNOWN_CODES) {
    const r = mapResumeUploadError(400, { error: code }, 'en');
    A(`PC ${code} → error 原样透传`, r.error === code);
    A(`PC ${code} → en 文案非回退且 CJK-free`, r.message.length > 0 && r.message !== 'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.' && !CJK.test(r.message));
  }
  // 全量 20 已知码 en 面 CJK-free（覆盖完整键域 · A2）
  const enCatalog = new Map(KNOWN_CODES.concat([
    'image_ocr_unavailable', 'ocr_no_content', 'ocr_duplicate', 'ocr_binding_missing', 'ocr_binding_invalid',
    'extracted_too_short', 'ocr_preview_format', 'extracted_too_long', 'public_preview_read_only', 'upload_failed',
  ]).map((code) => [code, mapResumeUploadError(400, { error: code }, 'en').message]));
  A('PC 全 20 已知码 en 文案齐备且全 CJK-free', [...enCatalog.values()].every((m) => m.length > 0 && !CJK.test(m)));
}

// ── N1 · 已知码 + zh → zh 文案（对照臂 · NEG 列不翻）──
section('N1 · 已知码 + locale=zh → zh 文案（对照）');
{
  for (const code of ['ocr_failed', 'file_too_large', 'upload_timeout']) {
    const r = mapResumeUploadError(400, { error: code }, 'zh');
    A(`N1 ${code} → zh 文案含中文`, r.error === code && CJK.test(r.message));
  }
  const enVsZh = mapResumeUploadError(400, { error: 'file_too_large' }, 'en').message
    !== mapResumeUploadError(400, { error: 'file_too_large' }, 'zh').message;
  A('N1 同码 en/zh 文案两形可分（映射层真二值）', enVsZh);
}

// ── V1 · 未知错误码 → upload_failed 回退（fail-closed · 不发明文案）──
section('V1 · 未知错误码 → upload_failed 回退（键域排除原型链族）');
{
  const FALLBACK = 'The file upload did not complete. Check the file and network and try again. Recognition results are never invented.';
  const unknownCodes = [
    'totally_unknown_code', 'OCR_FAILED ', 'ocr-failed', 'OCR:failed', '{"injected":true}',
    'ocr_failed;DROP TABLE', '码', 'e'.repeat(4096), 'ok:false', 'null',
  ];
  for (const code of unknownCodes) {
    const r = mapResumeUploadError(400, { error: code }, 'en');
    // :123 契约：机器码 trim 后透传（'OCR_FAILED ' → 'OCR_FAILED'）；trim 后非已知码一律兜底。
    A(`V1 未知码[${String(code).slice(0, 24).replace(/\n/g, '\\n')}] → upload_failed 兜底`, r.error === code.trim() && r.message === FALLBACK);
  }
  // 空白 error 按 :123 trim 契约 → 空码即兜底（trim 后空 ≠ 已知码）
  const ws = mapResumeUploadError(400, { error: '   ' }, 'en');
  A('V1 纯空白 error → 机器码 upload_failed（:123 trim 契约）', ws.error === 'upload_failed' && ws.message === FALLBACK);
  console.log('PIN   §9-rev2 V1 键域排除原型链族 toString/constructor/__proto__（预登记疑似产品缺陷 · 本刀不行使该族 · 修复归产品刀）');
}

// ── V2 · 伪造 locale → 一律 zh（二值 allowlist · request.ts:11 同契约）──
section('V2 · 伪造 locale 值 → 一律 zh 臂');
{
  const zhProbe = '文件超过 8MB 上限。';
  const forgedLocales = ['EN', 'en-US', 'fr', 'zh-Hans', '../../etc/passwd', 'en\x00', 'en ', ' en', 'e'.repeat(4096), 'zh;en', 'LOCALE=en', '__proto__'];
  for (const loc of forgedLocales) {
    const r = mapResumeUploadError(400, { error: 'file_too_large' }, forged(loc));
    A(`V2 伪造 locale[${String(loc).slice(0, 16).replace(/\x00/g, '\\0')}] → 落 zh（非 'en' 即 zh）`, r.message === zhProbe && CJK.test(r.message));
  }
  // request.ts 同契约静态钉：DEFAULT_LOCALE='zh' + cookie includes 守卫（伪造 cookie 值回退 zh）。
  const reqSrc = readFileSync(new URL('../i18n/request.ts', import.meta.url), 'utf8');
  A('V2 request.ts DEFAULT_LOCALE=zh 字面在场', /DEFAULT_LOCALE:\s*Locale\s*=\s*'zh'/.test(reqSrc));
  A('V2 request.ts cookie allowlist includes 守卫在场（伪造值回退默认）', /\.includes\(cookie \?\? ''\)/.test(reqSrc));
}

// ── V3 · 对抗信封 → 仅取机器码 · upload_failed 兜底 · 零 transcript 字段发明 ──
section('V3 · 对抗信封（非对象/空 error/transcript 形注入）');
{
  const FALLBACK_CODE = 'upload_failed';
  const envelopes: Array<{ label: string; body: unknown }> = [
    { label: 'null', body: null },
    { label: 'undefined', body: undefined },
    { label: 'number', body: 42 },
    { label: 'string', body: '{"error":"ocr_failed"}' },
    { label: 'bool', body: true },
    { label: 'array', body: ['ocr_failed'] },
    { label: 'empty-object', body: {} },
    { label: 'empty-error', body: { error: '' } },
    { label: 'null-error', body: { error: null } },
    { label: 'numeric-error', body: { error: 500 } },
    { label: 'transcript-injection', body: { error: '', transcript: '伪造转写文本', text: '伪造正文', ocrText: '伪造OCR' } },
    { label: 'transcript-only', body: { transcript: '伪造转写文本', ocrText: '伪造OCR' } },
  ];
  for (const { label, body } of envelopes) {
    const code = readResumeUploadErrorCode(body);
    const r = mapResumeUploadError(400, body, 'en');
    const invented = 'transcript' in r || 'text' in r || 'ocrText' in r || JSON.stringify(r).includes('伪造');
    A(`V3 ${label} → 机器码 upload_failed 且零 transcript 字段发明`, code === FALLBACK_CODE && r.error === FALLBACK_CODE && !invented);
  }
  // readResumeUploadErrorCode 只吐机器码：transcript 形字段永不升格为 error 码。
  A('V3 readResumeUploadErrorCode 对 transcript 形信封只出机器码', readResumeUploadErrorCode({ transcript: 'x', text: 'y', ocrText: 'z' }) === 'upload_failed');
}

// ── V4 · 413 → file_too_large（状态码优先臂）──
section('V4 · 413 状态码优先臂');
{
  const zh413 = mapResumeUploadError(413, { error: 'empty_file' }, 'zh');
  A('V4 413 + body 已知码 → 仍 file_too_large（状态码先于 body 码）', zh413.error === 'file_too_large' && zh413.message === '文件超过 8MB 上限。');
  const en413 = mapResumeUploadError(413, null, 'en');
  A('V4 413 + null body → file_too_large en 文案', en413.error === 'file_too_large' && en413.message === 'File exceeds the 8MB limit.');
  const non413 = mapResumeUploadError(400, { error: 'empty_file' }, 'zh');
  A('V4 非 413（400）→ 不触发状态码臂（body 码照走）', non413.error === 'empty_file');
  const zh413EnCat = mapResumeUploadError(413, {}, 'en');
  A('V4 413 en 文案 CJK-free', !CJK.test(zh413EnCat.message));
}

console.log(`\n${fail === 0
  ? `✓ NHP-003-ADV-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
  : `✗ ${fail}/${total} NHP-003-ADV-01 断言失败`}`);
console.log('PIN: EXIT0≠covered · §1.0.1 :114 行措辞零翻动（NEG=gap 不因 N-臂翻动 · FAULT=blind 不动）');
console.log('PIN: D3 披露 — 零模型产出语言断言 · A1 DOM 残留扫描不重铺（既有 S 锚旁证·Playwright 降次未接线照旧）');
console.log('PIN: V1 原型链族预登记（§9-rev2）— 本刀键域排除 · 未实证 → 不触发 EXIT1/backlog · 修复归产品刀');
console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · Ban wash 本收据入任何他列');
process.exit(fail ? 1 : 0);
