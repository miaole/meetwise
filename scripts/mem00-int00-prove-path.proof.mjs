/**
 * 静态门：MEM-00 / INT-TRANSCRIPT-00 证明路径 harness 保持诚实边界。
 * 无数据库、不起 Docker、不读 .env。
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HARNESS = join(ROOT, 'scripts', 'run-mem00-int00-prove-path.mjs');
const PKG = join(ROOT, 'package.json');

let failures = 0;
const A = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};

const harness = await readFile(HARNESS, 'utf8');
const pkg = JSON.parse(await readFile(PKG, 'utf8'));

A('package.json 登记 mem00-int00:prove-path', pkg.scripts?.['mem00-int00:prove-path'] === 'node scripts/run-mem00-int00-prove-path.mjs');
A('package.json 登记 mem00-int00:prove-path:gate', pkg.scripts?.['mem00-int00:prove-path:gate'] === 'node scripts/mem00-int00-prove-path.proof.mjs');
A('harness 固定 releaseEvidence=false', /releaseEvidence:\s*false/.test(harness) && !/releaseEvidence:\s*true/.test(harness) && !/\breleaseEvidence\s*=\s*true\b/.test(harness.replace(/releaseEvidence=false/g, '')));
A('harness 明确 controlPlaneClosed=false', /controlPlaneClosed:\s*false/.test(harness));
A('harness 禁止调用本地 compose Postgres 捷径', !/\bpnpm\s+db:up\b/.test(harness) && !/compose\.dev/.test(harness));
A('harness 含 INT-TRANSCRIPT-00 可移植入口', harness.includes('privacy-authorization:crypto:prove') && harness.includes('interview-answer-submission:prove'));
A('harness 含 MEM-00 隔离入口', harness.includes('memory-governance:prove') && harness.includes('memory-control-surface:prove') && harness.includes('memory:prove'));
A('harness 含 privacy-authorization / privacy-erasure:http 隔离入口', harness.includes('privacy-authorization:prove') && harness.includes('privacy-erasure:http:prove'));
A('无 Docker 记 blocked:docker_daemon_missing', harness.includes('blocked:docker_daemon_missing'));
A('portable-only 不把隔离跳过写成通过', harness.includes('--portable-only') && harness.includes('skipped:portable_only'));
A('回执 class 为本地不受信 prove-path', harness.includes('local_untrusted_mem00_int00_prove_path_receipt'));

if (failures) {
  console.error(`mem00-int00 prove-path gate failed: ${failures}`);
  process.exit(1);
}
console.log('✓ mem00-int00 prove-path gate 通过（releaseEvidence=false）');
