/**
 * 静态门:workflow 调用的 pnpm 冒号形 script 必须存在于 root package.json(NIGHTLY-RECALL-FIX 件d)。
 * 起因=nightly.yml 调已摘除的 recall:eval(幽灵脚本)被 continue-on-error 洗绿=结构性 skip-as-pass。
 * 口径:仅检 `pnpm <name>` 且 name 含 `:`(冒号形必为 script 名,pnpm 内建命令无冒号);`pnpm -C/exec/run/install` 等形不检。
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = join(new URL('..', import.meta.url).pathname);
const scripts = new Set(Object.keys(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).scripts ?? {}));
const wfDir = join(root, '.github', 'workflows');
const yamlFiles = readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f)).sort();
const missing = [];
let checked = 0;
for (const file of yamlFiles) {
  const text = readFileSync(join(wfDir, file), 'utf8');
  for (const m of text.matchAll(/\bpnpm\s+([a-z0-9][a-z0-9._-]*(?::[a-z0-9:._-]+)+)\b/g)) {
    checked += 1;
    if (!scripts.has(m[1])) missing.push(`${file}: ${m[1]}`);
  }
}
console.log(`workflow-script-existence: workflows=${yamlFiles.length} checked=${checked} missing=${missing.length}`);
if (missing.length > 0) {
  console.error(`missing script refs: ${missing.join(' | ')}`);
  process.exit(1);
}
console.log('all pnpm colon-form script refs in workflows exist in root package.json');
