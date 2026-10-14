#!/usr/bin/env node
/**
 * UC-E2E-003 — i18n / locale 结构面（NON-UI static inventory）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-003 covered · 本绿 ≠ 全链路 E2E covered
 * Playwright DOM 扫描 = secondary / 本 prove 不跑
 *
 * S1–S3 钉可证结构；S4/S5/G3' 钉三面收口后的绿结构（原 G-GAP-1/2/3 翻面，见 harness 翻面注记）；
 * EXIT=0 = 结构绿 ≠ 产品闭环 ≠ covered（矩阵 stays partial）
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(webRoot, '../..');
const CJK = /[\u4e00-\u9fff]/;
const EN_CJK_ALLOW = new Set(['home.footBrand', 'common.zh']);

function read(rel) {
  return readFileSync(resolve(repoRoot, rel), 'utf8');
}

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = v;
  }
  return out;
}

// Strip a trailing `//` comment before line-level scanning so trailing-comment
// text (e.g. interview-state) is not miscounted as copy. Line-leading comments
// are skipped separately by the caller.
function stripTrailingLineComment(line) {
  const idx = line.indexOf('//');
  return idx === -1 ? line : line.slice(0, idx);
}

function cjkLiteralLines(rel) {
  const out = [];
  read(rel).split('\n').forEach((raw, i) => {
    const line = stripTrailingLineComment(raw);
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
    if (CJK.test(trimmed) && /['"`]/.test(trimmed)) out.push({ line: i + 1, text: trimmed });
  });
  return out;
}

function parseStringMapEntries(block) {
  return new Map([...block.matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*'([^']*)'/gm)].map((m) => [m[1], m[2]]));
}

const gaps = [];
function pinGap(id, detail) {
  gaps.push({ id, detail });
  console.log(`GAP  ${id}  ${detail}`);
}

const checks = {
  'S1-i18n-plumbing': () => {
    const req = read('apps/web/i18n/request.ts');
    assert.match(req, /LOCALES\s*=\s*\[['"]zh['"],\s*['"]en['"]\]|LOCALES\s*=\s*\[['"]en['"],\s*['"]zh['"]\]/, 'LOCALES must include zh+en');
    assert.match(req, /DEFAULT_LOCALE/, 'DEFAULT_LOCALE present');
    assert.match(req, /next-intl/, 'next-intl request config');
    assert.equal(existsSync(resolve(repoRoot, 'apps/web/messages/en.json')), true);
    assert.equal(existsSync(resolve(repoRoot, 'apps/web/messages/zh.json')), true);
    const actions = read('apps/web/app/locale-actions.ts');
    assert.match(actions, /set\(['"]locale['"]/, 'locale cookie setter');
    assert.match(actions, /['"]en['"].*['"]zh['"]|['"]zh['"].*['"]en['"]/, 'locale action accepts en|zh');
  },

  'S2-message-key-parity': () => {
    const en = flatten(JSON.parse(read('apps/web/messages/en.json')));
    const zh = flatten(JSON.parse(read('apps/web/messages/zh.json')));
    const onlyEn = Object.keys(en).filter((k) => !(k in zh)).sort();
    const onlyZh = Object.keys(zh).filter((k) => !(k in en)).sort();
    assert.deepEqual(onlyEn, [], `en-only keys: ${onlyEn.join(',')}`);
    assert.deepEqual(onlyZh, [], `zh-only keys: ${onlyZh.join(',')}`);
    assert.ok(Object.keys(en).length >= 50, 'message catalog non-trivial');
  },

  'S3-en-json-no-unexpected-cjk': () => {
    const en = flatten(JSON.parse(read('apps/web/messages/en.json')));
    const offenders = Object.entries(en)
      .filter(([k, v]) => CJK.test(String(v)) && !EN_CJK_ALLOW.has(k))
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`);
    assert.deepEqual(offenders, [], `en.json unexpected CJK: ${offenders.join('; ')}`);
    for (const k of EN_CJK_ALLOW) {
      assert.ok(k in en, `allowlisted key missing: ${k}`);
      assert.ok(CJK.test(String(en[k])), `allowlisted key should keep intentional CJK: ${k}`);
    }
  },

  // Flipped from G-GAP-error-code-en-map: the en map, the locale param, and the
  // upload-face inline bilingual carrier are now asserted green, per-place.
  'S4-error-code-en-map': () => {
    const src = read('apps/web/lib/resume/ocr-preview-ui.ts');
    const zhBlock = src.match(/const ERROR_MESSAGES\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\n\};/);
    const enBlock = src.match(/const ERROR_MESSAGES_EN\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\n\};/);
    assert.ok(zhBlock, 'zh ERROR_MESSAGES map parseable');
    assert.ok(enBlock, 'en ERROR_MESSAGES_EN map parseable');
    const zh = parseStringMapEntries(zhBlock[1]);
    const en = parseStringMapEntries(enBlock[1]);
    assert.equal(zh.size, 20, `zh map must keep exactly 20 machine codes (got ${zh.size})`);
    assert.deepEqual([...en.keys()].sort(), [...zh.keys()].sort(), 'ERROR_MESSAGES_EN keys must be 20/20 parity with zh');
    const cjkEn = [...en.entries()].filter(([, v]) => CJK.test(v)).map(([k]) => k);
    assert.deepEqual(cjkEn, [], `en map values must be CJK-free: ${cjkEn.join(',')}`);
    // locale contract (inverted former no-locale-param pin): third optional param defaulting to zh
    assert.match(
      src,
      /function mapResumeUploadError\s*\(\s*status:\s*number,\s*body:\s*unknown,\s*locale:\s*[A-Za-z]+\s*=\s*'zh'\s*\)/,
      'mapResumeUploadError must carry a locale param defaulting to zh',
    );
    // upload-face inline bilingual carrier — scope pinned to the FIVE upload faces
    // (deleteResumeAction keeps its four zh messages untouched; never file-scan actions.ts).
    const actions = read('apps/web/app/resume/actions.ts');
    assert.match(actions, /\(await cookies\(\)\)\.get\('locale'\)/, 'upload actions read the locale cookie');
    const inline = actions.match(/const UPLOAD_MESSAGES\s*=\s*\{([\s\S]*?)\n\} as const;/);
    assert.ok(inline, 'UPLOAD_MESSAGES bilingual carrier parseable');
    const entries = [...inline[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*\{\s*zh:\s*'([^']*)',\s*en:\s*'([^']*)'\s*\}/gm)];
    assert.equal(entries.length, 5, `inline upload face must be exactly five bilingual entries (got ${entries.length})`);
    for (const m of entries) {
      assert.ok(!CJK.test(m[3]), `inline upload-face en value must be CJK-free: ${m[1]}`);
    }
    for (const name of entries.map((m) => m[1])) {
      assert.ok(actions.includes(`UPLOAD_MESSAGES.${name}[locale]`), `upload face consumes its bilingual entry: ${name}`);
    }
    // delete face zero-touch honesty guard: the four zh messages must stay verbatim.
    for (const needle of ['网络错误，请稍后重试；简历未被删除。', '找不到这份简历，或它已被删除。', '删除请求未受理（', '删除受理形状不合法，未当作已删除。']) {
      assert.ok(actions.includes(needle), `deleteResumeAction zh message must stay untouched: ${needle}`);
    }
  },

  // Flipped from G-GAP-hardcoded-zh-ui: hot three copy lines asserted structurally zero
  // under the comment-stripped scanner, with the interpolation exemption pinned.
  'S5-hot-lib-zh-structural-zero': () => {
    // view-model: non-interpolation copy lines == 0; interpolation residual lines are a
    // known-residual exemption pinned by content (whole lines incl. inline static members).
    const vm = cjkLiteralLines('apps/web/lib/view-model.ts');
    const vmInterp = vm.filter((l) => l.text.includes('${'));
    const vmStatic = vm.filter((l) => !l.text.includes('${'));
    assert.deepEqual(
      vmStatic.map((l) => `${l.line}: ${l.text.slice(0, 70)}`),
      [],
      'view-model non-interpolation CJK copy lines must be 0',
    );
    assert.equal(vmInterp.length, 3, `view-model interpolation CJK lines must be exactly 3 (got ${vmInterp.length})`);
    for (const pin of ['连接面试', '本题得分', '本次练习反馈']) {
      assert.ok(vmInterp.some((l) => l.text.includes(pin)), `interpolation residual line must stay present: ${pin}`);
    }
    // interview-state: all former CJK hits were trailing comments; stripped → 0.
    const ist = cjkLiteralLines('apps/web/lib/stream/interview-state.ts');
    assert.deepEqual(ist.map((l) => `${l.line}: ${l.text.slice(0, 70)}`), [], 'interview-state CJK copy lines must be 0 after comment strip');
    // ocr-preview-ui: copy lines outside the two co-located map blocks must be 0;
    // both map blocks are exempt (zh map stays co-located; en map parity handled by S4).
    const ocr = read('apps/web/lib/resume/ocr-preview-ui.ts');
    const ocrNoMaps = ocr.replace(/const ERROR_MESSAGES(?:_EN)?\s*:\s*Record<string,\s*string>\s*=\s*\{[\s\S]*?\n\};/g, '');
    const offenders = [];
    ocrNoMaps.split('\n').forEach((raw, i) => {
      const line = stripTrailingLineComment(raw);
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      if (CJK.test(trimmed) && /['"`]/.test(trimmed)) offenders.push(`${i + 1}: ${trimmed.slice(0, 70)}`);
    });
    assert.deepEqual(offenders, [], 'ocr-preview-ui non-map-block CJK copy lines must be 0');
  },

  // Flipped from G-GAP-dom-e2e-ui: the dedicated locale DOM spec must exist with the
  // three structural elements. Static presence ≠ DOM green (UI gate runs separately).
  'G3-dom-locale-spec-present': () => {
    const specRel = 'apps/web/e2e-ui/uc003-i18n-locale.spec.ts';
    assert.equal(existsSync(resolve(repoRoot, specRel)), true, 'uc003-i18n-locale.spec.ts must exist');
    const spec = read(specRel);
    assert.ok(spec.includes('UC003-I18N-locale-en'), 'spec must carry the UC003-I18N-locale-en grep anchor');
    assert.match(spec, /addCookies/, 'spec must preset the locale cookie (cookie-only contract)');
    assert.match(spec, /resume-upload-error/, 'spec must assert the error-code en DOM face');
    assert.match(spec, /CJK/, 'spec must carry a DOM CJK scan');
  },
};

let failed = 0;
console.log('UC-E2E-003 i18n/locale structure prove (static inventory; NON-UI)');
console.log('releaseEvidence=false · Not HA · ≠ covered · Playwright secondary\n');

for (const [name, fn] of Object.entries(checks)) {
  try {
    fn();
    console.log(`PASS  ${name}`);
  } catch (err) {
    failed += 1;
    console.error(`FAIL  ${name}: ${err instanceof Error ? err.message : err}`);
  }
}

console.log('');
if (gaps.length === 0) {
  console.log("NOTE  no GAP pins — S4/S5/G3' flipped the three former G-GAP structural gaps to green structural assertions (UC003-I18N)");
} else {
  console.log(`NOTE  honesty GAP pins=${gaps.length}: ${gaps.map((g) => g.id).join(', ')}`);
}
console.log('NOTE  EXIT=0 with GAP pins = honest mark-red ≠ product closed ≠ UC-E2E-003 covered');

const exitCode = failed === 0 ? 0 : 1;
console.log(`\nCMD=pnpm uc003:i18n-locale:prove EXIT=${exitCode}`);
console.log('本绿≠全链路 E2E covered；≠ UC-E2E-003 covered；最多矩阵 partial');
process.exit(exitCode);
