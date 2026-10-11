// GODFN-1c five-value machine counter · 口径: comment-/string-stripped code, per interview module dir
// 五值: asPrincipal / guardInterviewPrivacy / denyPublicPreviewWrite / requirePublicPreviewControlledWrite / catch(:any)
// 附: advisory(pg_advisory_xact_lock) / FOR UPDATE
// 定义排除: each guard name has exactly one definition (private method in interview.service.ts) — subtract 1 per def found.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
const dir = process.argv[2];
const files = [];
(function walk(d) { for (const e of readdirSync(d)) { const p = join(d, e); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.ts')) files.push(p); } })(dir);
function strip(t) {
  // 口径: strip COMMENTS only (keep string/template contents — SQL text is code), same as audit standard.
  let res = ''; let i = 0;
  while (i < t.length) {
    const c = t[i], c2 = t[i + 1];
    if (c === '/' && c2 === '/') { while (i < t.length && t[i] !== '\n') i++; continue; }
    if (c === '/' && c2 === '*') { i += 2; while (i < t.length && !(t[i] === '*' && t[i + 1] === '/')) i++; i += 2; continue; }
    res += c; i++;
  }
  return res;
}
const total = { asPrincipal: 0, guardInterviewPrivacy: 0, denyPublicPreviewWrite: 0, requirePublicPreviewControlledWrite: 0, catchAny: 0, advisory: 0, forUpdate: 0 };
const perFile = {};
for (const f of files) {
  const code = strip(readFileSync(f, 'utf8'));
  const c = {
    asPrincipal: (code.match(/asPrincipal\s*\(/g) || []).length,
    guardInterviewPrivacy_all: (code.match(/guardInterviewPrivacy/g) || []).length,
    guardInterviewPrivacy_def: (code.match(/private\s+async\s+guardInterviewPrivacy/g) || []).length,
    denyPublicPreviewWrite_all: (code.match(/denyPublicPreviewWrite/g) || []).length,
    denyPublicPreviewWrite_def: (code.match(/private\s+denyPublicPreviewWrite/g) || []).length,
    requirePublicPreviewControlledWrite_all: (code.match(/requirePublicPreviewControlledWrite/g) || []).length,
    requirePublicPreviewControlledWrite_def: (code.match(/private\s+requirePublicPreviewControlledWrite/g) || []).length,
    catchAny: (code.match(/catch\s*\(\s*\w+\s*:\s*any\s*\)/g) || []).length,
    advisory: (code.match(/pg_advisory_xact_lock/g) || []).length,
    forUpdate: (code.match(/FOR\s+UPDATE/g) || []).length,
  };
  const vals = {
    asPrincipal: c.asPrincipal,
    guardInterviewPrivacy: c.guardInterviewPrivacy_all - c.guardInterviewPrivacy_def,
    denyPublicPreviewWrite: c.denyPublicPreviewWrite_all - c.denyPublicPreviewWrite_def,
    requirePublicPreviewControlledWrite: c.requirePublicPreviewControlledWrite_all - c.requirePublicPreviewControlledWrite_def,
    catchAny: c.catchAny, advisory: c.advisory, forUpdate: c.forUpdate,
  };
  perFile[f] = vals;
  for (const k of Object.keys(total)) total[k] += vals[k];
}
for (const [f, v] of Object.entries(perFile)) console.log(f.replace(process.cwd() + '/', ''), JSON.stringify(v));
console.log('TOTAL', JSON.stringify(total));
