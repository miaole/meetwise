/**
 * Fail-closed generation-trust gate.
 * Automation may refactor, test, and regress; unreviewed generation cannot
 * be treated as done or READY. This script only checks that the policy is
 * encoded in the post-change skill and regression entry. It never sets
 * releaseEvidence or skip-as-pass.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

const REQUIRED = [
  {
    file: 'ai-docs/skills/testing/post-change-review.md',
    terms: ['生成物默认不可信', '出处', '伪造分数', 'skip-as-pass', 'releaseEvidence', '不得标 READY'],
  },
  {
    file: 'ai-docs/skills/testing/honesty-rules.md',
    terms: ['skip-as-pass', 'releaseEvidence', '未审核生成', '不得标 READY'],
  },
  {
    file: 'ai-docs/skills/testing/sop.md',
    terms: ['生成物默认不可信', 'skip-as-pass', '不得声称完成', 'releaseEvidence'],
  },
  {
    file: 'ai-docs/skills/testing/SKILL.md',
    terms: ['生成物默认不可信', 'skip-as-pass', 'releaseEvidence'],
  },
  {
    file: 'scripts/run-post-change-regression.mjs',
    terms: ['claimDone: false', 'regression_claim_done_forbidden', 'skip-as-pass', 'readyFromUnreviewedGeneration'],
  },
];

export function checkGenerationTrust(root = ROOT) {
  const errors = [];
  for (const spec of REQUIRED) {
    const path = join(root, spec.file);
    if (!existsSync(path)) {
      errors.push(`missing:${spec.file}`);
      continue;
    }
    const text = readFileSync(path, 'utf8');
    for (const term of spec.terms) {
      if (!text.includes(term)) errors.push(`${spec.file} must encode ${JSON.stringify(term)}`);
    }
    if (/(?:status|ready)\s*[:=]\s*READY\b/.test(text) && !/NOT_READY|不得标 READY/.test(text)) {
      errors.push(`${spec.file}: READY status claim without NOT_READY / 不得标 READY bound`);
    }
  }
  return errors;
}

const errors = checkGenerationTrust();
if (errors.length) {
  console.error('generation-trust check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('PASS generation-trust: policy encoded; skip-as-pass forbidden; claimDone=false; releaseEvidence=false; unreviewed generation cannot be READY');
