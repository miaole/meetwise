/**
 * Strategy / skill docs must keep HTTP fetch/SSE and Playwright as two layers.
 * Restoring a single "| e2e | Playwright |" gold-path row is a regression.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../..', import.meta.url).pathname;

const LAYER_DOCS = [
  'ai-docs/testing/strategy/test-strategy.md',
  'ai-docs/skills/testing/SKILL.md',
  'ai-docs/skills/testing/e2e-platform/README.md',
  'ai-docs/skills/testing/e2e-platform/00-overview.md',
];

const SOP_PAGES = [
  'ai-docs/skills/testing/e2e-platform/01-directory-contract.md',
  'ai-docs/skills/testing/e2e-platform/02-post-change.md',
  'ai-docs/skills/testing/e2e-platform/03-provenance.md',
  'ai-docs/skills/testing/e2e-platform/04-evidence-and-redaction.md',
  'ai-docs/skills/testing/e2e-platform/05-failure-classification.md',
];

const PLAYWRIGHT_ONLY_ROW = /^\|\s*e2e\s*\|\s*Playwright\b/m;

export function scanDocAlignment(text, file, { requireBothLayers = true } = {}) {
  const errors = [];
  if (PLAYWRIGHT_ONLY_ROW.test(text)) {
    errors.push(`${file}: Playwright-only e2e table row (HTTP fetch/SSE must stay a separate layer)`);
  }
  if (!requireBothLayers) return errors;
  const mentionsHttp = /e2e \(HTTP\)|full\.e2e\.ts|e2e:isolated|fetch\s*\/\s*SSE|fetch \/ SSE/.test(text);
  const mentionsBrowser = /e2e \(browser\)|e2e:ui:isolated|Playwright/.test(text);
  if (!mentionsHttp) errors.push(`${file}: must name the HTTP E2E runner (e2e:isolated or full.e2e.ts)`);
  if (!mentionsBrowser) errors.push(`${file}: must name the browser layer (Playwright or e2e:ui:isolated)`);
  return errors;
}

export function checkRunnerDocAlignment(root = ROOT) {
  const errors = [];
  for (const rel of LAYER_DOCS) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      errors.push(`missing:${rel}`);
      continue;
    }
    errors.push(...scanDocAlignment(readFileSync(path, 'utf8'), rel));
  }
  for (const rel of SOP_PAGES) {
    const path = join(root, rel);
    if (!existsSync(path)) {
      errors.push(`missing:${rel}`);
      continue;
    }
    errors.push(...scanDocAlignment(readFileSync(path, 'utf8'), rel, { requireBothLayers: false }));
  }
  const strategy = existsSync(join(root, LAYER_DOCS[0]))
    ? readFileSync(join(root, LAYER_DOCS[0]), 'utf8')
    : '';
  if (strategy && !/e2e \(HTTP\)/.test(strategy)) {
    errors.push('test-strategy.md must keep an explicit "e2e (HTTP)" row');
  }
  if (strategy && !/e2e \(browser\)/.test(strategy)) {
    errors.push('test-strategy.md must keep an explicit "e2e (browser)" row');
  }
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('runner-doc-alignment.mjs')) {
  const errors = checkRunnerDocAlignment();
  if (errors.length) {
    console.error('e2e-platform runner-doc-alignment failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('PASS e2e-platform runner-doc-alignment');
}
