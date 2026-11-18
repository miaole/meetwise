/**
 * PI 同意闸覆盖面证明（静态·零 DB 零模型零外呼）。
 *
 * 用户裁定（2026-11-15 原话「隐私我说过只要同意就行」·2026-11-09 同义裁定）：**用户同意即隐私
 * bar**——consent_record 同意闸就是 PI 处理的合法性门，不在同意之外发明更重的审批/合规机制。
 * 本证明把该 bar 钉成覆盖面断言：登记端点、撤回端点、政策版本留存、以及每一个 PI 消费面的
 * consent_required 闸都在位——未来任何改动（移除闸 / 新增消费面不加闸）都会打红本证明。
 *
 * 覆盖面（当前全部已实证的消费点）：
 *   1. consent_record 表（0001_baseline：RLS ENABLE+FORCE·policy_version 可审计）。
 *   2. 登记端点 POST /privacy/consent + 状态端点 GET（前端据以显示同意卡片）。
 *   3. 撤回端点 DELETE /privacy/consent（撤回=停止后续使用·不回溯清除——G4 既有条文）。
 *   4. 消费闸 a：简历文本/文件上传链路 resume_processing（resume.service 两处）。
 *   5. 消费闸 b：语音采集 voice_capture。批量转写与流式 listenStreamConsent 各有一处
 *      未同意即拒，不能只因整文件里还剩另一处就当两道门都在。
 * 反证形：任一闸字符串从消费面移除 → 本证明红；只摘流式 throw、批量门仍在 → 本证明红。
 * 新消费面不加闸 → 本证明不覆盖（新增时必须同步在本文件消费面清单登记 + 断言，否则
 * 「同意即 bar」对新增面失守——这是本证明的登记纪律）。不在同意之外再加一道审批。
 *
 * 运行：pnpm pi-consent-gates:prove（静态·已挂 verify:local 尾）。
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

let fail = 0;
const A = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond || !detail ? '' : `  [${detail}]`}`);
  if (!cond) fail += 1;
};
const section = (t) => console.log(`\n──────── ${t} ────────`);

const resumeService = read('apps/api/src/modules/resume/resume.service.ts');
const interviewVoice = read('apps/api/src/modules/interview/interview-voice.ts');
const privacyService = read('apps/api/src/modules/privacy/privacy.service.ts');
const privacyController = read('apps/api/src/modules/privacy/privacy.controller.ts');
const baseline = read('packages/db/migrations/0001_baseline.sql');
const contracts = read('packages/contracts/src/index.ts');

section('1. 同意登记面（consent_record · policy_version 可审计）');
A('C1 consent_record 表在 0001 baseline（RLS ENABLE+FORCE·原文不入 app 可读面）',
  baseline.includes('CREATE TABLE consent_record')
  && /ALTER TABLE consent_record ENABLE ROW LEVEL SECURITY;/.test(baseline)
  && /ALTER TABLE consent_record FORCE ROW LEVEL SECURITY;/.test(baseline));
A('C2 policy_version 列在表内（同意时的政策版本可审计）',
  /policy_version text NOT NULL/.test(baseline));
A('C3 登记=INSERT 携 policy_version（privacy.service consent()）',
  privacyService.includes("'INSERT INTO consent_record(id, owner_user_id, purpose, policy_version) VALUES ($1,$2,$3,$4)'"));
A('C4 状态端点 GET /privacy/consent 在 controller（前端据以渲染同意卡片）',
  privacyController.includes("@Get('consent')"));
A('C5 登记端点 POST /privacy/consent 在 controller',
  privacyController.includes("@Post('consent')"));

section('2. 撤回面（同意可撤销·撤回=停止后续使用）');
A('C6 撤回端点 DELETE /privacy/consent 在 controller',
  privacyController.includes("@Delete('consent')"));
A('C7 撤回语义=删行停止后续使用（G4 既有条文·不回溯清除在注记）',
  privacyService.includes('撤回=停止后续使用'));

section('3. 消费闸覆盖（每一个 PI 消费面必须有 consent_required 闸）');
{
  // 闸的完整形态=「查询 + 未同意即拒」**成对**（只断 SELECT 会漏掉 throw 被摘的假绿——变异实测）。
  const resumeGate = (src) => (src.match(/SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1"\);\s*\n\s*if \(consent\.rowCount === 0\) throw new HttpException\(\{ error: 'consent_required', purpose: 'resume_processing' \}, HttpStatus\.FORBIDDEN\);/g) ?? []).length;
  A('C8 简历文本/文件上传闸成对在位（resume.service 两处·查询+未同意即拒）',
    resumeGate(resumeService) >= 2, `gates=${resumeGate(resumeService)}`);
  A('C9 简历闸数量=2（文本 :177 形 + 文件 :284 形·同 purpose）',
    resumeGate(resumeService) === 2, `gates=${resumeGate(resumeService)}`);
  const throwText = "throw new HttpException({ error: 'consent_required', purpose: 'voice_capture' }, HttpStatus.FORBIDDEN);";
  const fnBody = (src, name) => {
    const start = src.indexOf(`export async function ${name}`);
    if (start < 0) return '';
    const next = src.indexOf('\nexport ', start + 10);
    return src.slice(start, next < 0 ? undefined : next);
  };
  const streamGate = (src) => {
    const body = fnBody(src, 'listenStreamConsent');
    return body.includes("WHERE purpose='voice_capture'") && body.includes(throwText);
  };
  const batchGate = (src) => {
    const body = fnBody(src, 'transcribeForIssuedQuestion');
    return body.includes("WHERE purpose='voice_capture'") && body.includes(throwText);
  };
  A('C10a 流式同意门 listenStreamConsent 自身含未同意即拒', streamGate(interviewVoice));
  A('C10b 批量转写同意门 transcribeForIssuedQuestion 自身含未同意即拒', batchGate(interviewVoice));
  const prepare = read('apps/api/src/modules/interview/interview.service.ts');
  const prepStart = prepare.indexOf('async listenStreamPrepare');
  const prepEnd = prepare.indexOf('listenStreamEvents', prepStart);
  const prep = prepStart >= 0 && prepEnd > prepStart ? prepare.slice(prepStart, prepEnd) : '';
  const consentAt = prep.indexOf('listenStreamConsent(');
  const configAt = prep.indexOf('prepareListenStream(');
  A('C10c listenStreamPrepare 先调流式同意门，再做配置校验', consentAt >= 0 && configAt > consentAt);
  const mutant = interviewVoice.replace(
    /(export async function listenStreamConsent[\s\S]*?if \(\(consent\.rowCount \?\? 0\) === 0\) )throw new HttpException\(\{ error: 'consent_required', purpose: 'voice_capture' \}, HttpStatus\.FORBIDDEN\);/,
    '$1/* removed */;',
  );
  A('C10d 只摘流式 throw 时 C10a 同形断言为假，批量门仍在',
    streamGate(interviewVoice) && !streamGate(mutant) && batchGate(mutant));
}

section('4. 用户裁定锚（2026-11-15「隐私只要同意就行」·守卫引用）');
A('C11 本文件头注载明裁定原文与本证明=bar 的守卫形',
  read('scripts/pi-consent-gates.proof.mjs').includes('用户裁定（2026-11-15'));

section('5. 反证自检（闸字符串摘除必须可红·变异语义见文件头注）');
{
  // 自证：断言用的是与消费面逐字同形的字符串——若未来改闸措辞而未同步本清单，C8-C10 红即报。
  const gateForm = "SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1";
  A('C12 断言字符串与消费面源码逐字同形（防措辞漂移假绿）',
    resumeService.includes(gateForm) && gateForm.length > 60);
}

const ok = fail === 0;
console.log(`\n${ok ? `✓ PI 同意闸覆盖面证明通过（15 断言·静态零外呼·用户裁定 2026-11-15 同意即 bar）` : `✗ ${fail} 失败`}`);
process.exit(ok ? 0 : 1);
