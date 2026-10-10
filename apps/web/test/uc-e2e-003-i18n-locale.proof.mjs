#!/usr/bin/env node
/**
 * UC-E2E-003 — i18n / locale 结构面（NON-UI static inventory）
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ UC-E2E-003 covered · 本绿 ≠ 全链路 E2E covered
 * Playwright DOM 扫描 = secondary / 本 prove 不跑
 *
 * S1–S3 钉可证结构；G-GAP-* 诚实标红（EXIT=0 = 诚实钉 ≠ 产品闭环）
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

  'G-GAP-error-code-en-map': () => {
    const src = read('apps/web/lib/resume/ocr-preview-ui.ts');
    assert.match(src, /ERROR_MESSAGES\s*:\s*Record<string,\s*string>/, 'ERROR_MESSAGES map must exist (inventory target)');
    const block = src.match(/ERROR_MESSAGES\s*:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\n\};/);
    assert.ok(block, 'ERROR_MESSAGES object block parseable');
    const entries = [...block[1].matchAll(/^\s*([A-Za-z0-9_]+)\s*:\s*'([^']*)'/gm)];
    assert.ok(entries.length >= 8, 'ERROR_MESSAGES must list machine codes');
    const zhOnly = entries.filter(([, , msg]) => CJK.test(msg));
    const hasLocaleBranch = /locale|getTranslations|messages\/en|ERROR_MESSAGES_EN|enMap/i.test(src);
    if (zhOnly.length === entries.length && !hasLocaleBranch) {
      pinGap(
        'GAP-UC003-ERROR-CODE-EN-MAP',
        `ocr-preview-ui ERROR_MESSAGES is zh-only (${zhOnly.length}/${entries.length} codes); no en locale branch — A2 错误码→en 映射未闭环`,
      );
    } else if (zhOnly.length > 0) {
      pinGap(
        'GAP-UC003-ERROR-CODE-EN-MAP',
        `partial zh leftovers in ERROR_MESSAGES (${zhOnly.length}); en map incomplete`,
      );
    } else {
      console.log('PASS  ERROR_MESSAGES appears locale-clean (unexpected — re-check product)');
    }
    // mapResumeUploadError has no locale param → structural pin
    assert.match(src, /function mapResumeUploadError\s*\(\s*status:\s*number,\s*body:\s*unknown\s*\)/, 'mapResumeUploadError signature has no locale arg');
  },

  'G-GAP-hardcoded-zh-ui': () => {
    const hot = [
      'apps/web/lib/view-model.ts',
      'apps/web/lib/resume/ocr-preview-ui.ts',
      'apps/web/lib/stream/interview-state.ts',
    ];
    let cjkLines = 0;
    const samples = [];
    for (const rel of hot) {
      const text = read(rel);
      for (const line of text.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;
        if (CJK.test(trimmed) && /['"`]/.test(trimmed)) {
          cjkLines += 1;
          if (samples.length < 5) samples.push(`${rel}: ${trimmed.slice(0, 80)}`);
        }
      }
    }
    assert.ok(cjkLines > 0, 'expected known hard-coded zh UI surfaces (inventory honesty)');
    pinGap(
      'GAP-UC003-HARDCODED-ZH-UI',
      `hot lib surfaces have ${cjkLines} string-literal lines with CJK (sample: ${samples[0] ?? 'n/a'}) — locale=en would still show zh leftovers outside messages/*.json`,
    );
  },

  'G-GAP-dom-e2e-ui': () => {
    const e2eUi = resolve(repoRoot, 'apps/web/e2e-ui');
    assert.equal(existsSync(e2eUi), true, 'e2e-ui dir exists');
    const specs = readdirSync(e2eUi).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
    let localeHit = false;
    for (const f of specs) {
      const body = readFileSync(join(e2eUi, f), 'utf8');
      if (/locale|i18n|中文残留|no.?chinese|error.?code.*en/i.test(body)) localeHit = true;
    }
    if (!localeHit) {
      pinGap(
        'GAP-UC003-DOM-E2E-UI',
        `no e2e-ui spec asserts en DOM / error-code en map (specs=${specs.join(',')}); Playwright secondary — not wired this prove`,
      );
    } else {
      console.log('PASS  e2e-ui has some locale mention (still ≠ UC covered)');
    }
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
  console.log('NOTE  no GAP pins emitted — unexpected for current tree; do not auto-promote covered');
} else {
  console.log(`NOTE  honesty GAP pins=${gaps.length}: ${gaps.map((g) => g.id).join(', ')}`);
  console.log('NOTE  EXIT=0 with GAP pins = honest mark-red ≠ product closed ≠ UC-E2E-003 covered');
}

const exitCode = failed === 0 ? 0 : 1;
console.log(`\nCMD=pnpm uc003:i18n-locale:prove EXIT=${exitCode}`);
console.log('本绿≠全链路 E2E covered；≠ UC-E2E-003 covered；最多矩阵 partial');
process.exit(exitCode);
