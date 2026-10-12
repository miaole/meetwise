/**
 * I6 D6-COMPLIANCE (#239) 静态断言门 · §2 七断言机械落面。
 * 形制沿 scripts/qbank-corpus-gates.prove.mjs(静态 readSrc 断言 + 改动集 markers 运行时组装防自指)。
 * 全静态零模型零外呼零生产操作(est live=0)。
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
}

/** 剥注释(渲染文案级检查用):JSX 块注与 // 行不留——负断言只看运行时文案与代码。 */
function stripComments(text) {
  const noBlock = text.replace(new RegExp('\\{\\/[\\s\\S]*?\\*\\/', 'g'), '');
  return noBlock.split('\n').filter((l) => {
    const t = l.trim();
    return !t.startsWith('//');
  }).join('\n');
}

const A = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) process.exitCode = 1;
};

/* ── 改动集(工作树脏=vs HEAD·树净(已提交态/nail 复跑)=vs HEAD~1·含未跟踪) ── */
const dirty = git('status', '--porcelain').trim().length > 0;
const diffBase = dirty ? 'HEAD' : 'HEAD~1';
const changedTracked = git('diff', '--name-only', diffBase).split('\n').map((s) => s.trim()).filter(Boolean);
const untracked = git('ls-files', '--others', '--exclude-standard').split('\n').map((s) => s.trim()).filter(Boolean);
const changeSet = [...new Set([...changedTracked, ...untracked])];

/* ── §2-1 ①内容安全 kill-switch:env 三态闸+begin/turn 双口 fail-closed+缺省 off=现状字节+503 诚实文案 ── */
{
  const gate = read('apps/api/src/platform/content-safety.ts');
  A('① env 闸名在场(MEETWISE_CONTENT_SAFETY_KILL_SWITCH)', gate.includes('MEETWISE_CONTENT_SAFETY_KILL_SWITCH'));
  A('① 三态 fail-closed 缺省 off(undefined/0→false·1→true·余者 throw)', /if \(raw === undefined \|\| raw === '0'\) return false;/.test(gate)
    && /if \(raw === '1'\) return true;/.test(gate)
    && gate.includes("throw new Error('invalid_meetwise_content_safety_kill_switch')"));
  A('① 独立于平台级既有开关(新模块零 import·平台级开关语义字节零触)',
    !/from ['"]/.test(gate));

  const svc = read('apps/api/src/modules/interview/interview.service.ts');
  A('① denyContentSafetyKilled 闸定义在场', svc.includes('private denyContentSafetyKilled(): void'));
  const callSites = svc.split('\n').filter((l) => l.includes('this.denyContentSafetyKilled();')).length;
  A('① begin/turn 双口恰 2 处闸调用', callSites === 2, `callSites=${callSites}`);
  A('① 闸触发=503+诚实文案', /content_safety_kill_switch_active[\s\S]{0,120}HttpStatus\.SERVICE_UNAVAILABLE/.test(svc)
    && svc.includes('内容安全开关已开启：面试出题与作答提交暂停'));
  const beginIdx = svc.indexOf('begin(principal: string, id: string, resumeId: string');
  const turnIdx = svc.indexOf('turn(principal: string, id: string, body: TurnDto');
  const beginBlock = svc.slice(beginIdx, beginIdx + 400);
  const turnBlock = svc.slice(turnIdx, turnIdx + 400);
  A('① begin 首行闸序(denyContentSafetyKilled 先于 denyPublicPreviewWrite)',
    /denyContentSafetyKilled\(\);[\s\S]*?denyPublicPreviewWrite\(\);/.test(beginBlock));
  A('① turn 首行闸序(同形)', /denyContentSafetyKilled\(\);[\s\S]*?denyPublicPreviewWrite\(\);/.test(turnBlock));
}

/* ── §2-2 ②危机话术固定处置:触发词表+固定文案+转介三要素+「不做状态机」负断言 ── */
{
  const dom = read('packages/domain/src/crisis-disposition.ts');
  A('② domain 触发词表在场(CRISIS_TRIGGER_PATTERNS·zh/en)', dom.includes('CRISIS_TRIGGER_PATTERNS') && /自杀/.test(dom) && /suicid/i.test(dom));
  A('② domain 纯函数判定(matchesCrisisTrigger)', dom.includes('export function matchesCrisisTrigger'));
  A('② 负断言:零状态机(代码面无 pgEnum/z.enum/CREATE TABLE)',
    !/pgEnum|z\.enum|CREATE TABLE/.test(stripComments(dom)));
  const idx = read('packages/domain/src/index.ts');
  A('② domain barrel 导出接线', idx.includes("from './crisis-disposition.ts'"));

  const worker = read('apps/worker/src/interview-service.ts');
  const fnIdx = worker.indexOf('export async function invokeEvaluationOnce');
  const fnBody = worker.slice(fnIdx, fnIdx + 1400);
  A('② worker pinned 落点:invokeEvaluationOnce 前置确定性扫描(先于模型 invoke)',
    /matchesCrisisTrigger\(input\.answer\)[\s\S]*?return \{ status: 'failed', error: CRISIS_DISPOSITION_REASON/.test(fnBody)
    && fnBody.indexOf('matchesCrisisTrigger') < fnBody.indexOf('await invoke('));
  A('② worker 拒评沿既有 failed→unscored 释放链(零新联合成员)',
    /status: 'failed', error: CRISIS_DISPOSITION_REASON/.test(worker));

  const webLib = read('apps/web/lib/interview/crisis-disposition.ts');
  const patternLine = new RegExp('^ */(?:[^/' + String.fromCharCode(92) + 'n' + ']|' + String.fromCharCode(92, 92) + '/)+/i?,$', 'gm');
  const domCount = (dom.match(patternLine) ?? []).length;
  const webCount = (webLib.match(patternLine) ?? []).length;
  A('② web 对齐模块词表与 domain 同形(合同对齐不引包·先例 scoring-honesty)', domCount === webCount && domCount >= 10, `patterns=${domCount}/${webCount}`);
  A('② 转介信息三要素(热线 12356+紧急 120+急诊)', webLib.includes('12356') && webLib.includes('120') && webLib.includes('急诊'));
  A('② 法务复核保留标注形', webLib.includes('法务复核保留') && dom.includes('法务复核保留'));

  const panel = read('apps/web/components/InterviewPanel.tsx');
  A('② 提交口确定性拦截(matchesCrisisTrigger(sent))', panel.includes('if (matchesCrisisTrigger(sent))'));
  A('② 警示区 role="alert" 固定文案渲染', /crisisNotice && canAnswer && !submitting && \([\s\S]*?role="alert"/.test(panel)
    && panel.includes('CRISIS_DISPOSITION_NOTICE_HEADING') && panel.includes('CRISIS_DISPOSITION_NOTICE_BODY'));
}

/* ── §2-3 ③注册年龄声明:signup 区落位+zh/en i18n+#263 面 diff 零 ── */
{
  const login = read('apps/web/app/login/page.tsx');
  const zh = JSON.parse(read('apps/web/messages/zh.json'));
  const en = JSON.parse(read('apps/web/messages/en.json'));
  A('③ signup 区年龄声明落位(t(ageDeclaration))', login.includes("t('ageDeclaration')"));
  A('③ 声明文案形(非勾选:零 checkbox/零 required 新控件)', !/checkbox/i.test(login));
  A('③ i18n zh 在场(未满 18 周岁暂不提供服务)', typeof zh.login?.ageDeclaration === 'string' && zh.login.ageDeclaration.includes('未满 18 周岁'));
  A('③ i18n en 在场(en 纯英文·S3 禁 CJK 合规)', typeof en.login?.ageDeclaration === 'string' && en.login.ageDeclaration.includes('18 or older') && !/\p{Script=Han}/u.test(en.login.ageDeclaration));
  const numstatRaw = git('diff', '--numstat', diffBase, '--', 'apps/web/app/login/page.tsx').trim();
  const numstat = (numstatRaw || '0\t0\t-').split('\t');
  A('③ #263 面(:27-28/:38-40 内部预览标注窗)diff 零删改(纯插入)', numstat[1] === '0', `deletions=${numstat[1]}`);
  A('③ #263 标注句逐字仍在场', login.includes('招聘方入口是内部预览骨架，不是已上线产品'));
}

/* ── §2-4 ④B 端 PIPL24:流程内披露+静态受理入口+scoreless 零翻+不虚称复核通道+互洽面 ── */
{
  const jobs = read('apps/web/app/jobs/page.tsx');
  A('④ 流程内披露(第24条·要求人工复核·拒绝仅自动化)', jobs.includes('第24条') && jobs.includes('要求人工复核') && jobs.includes('拒绝仅通过自动化方式作出决定'));
  A('④ 静态受理入口(mailto·零端点零新表)', /href="mailto:privacy@meetwise\.app"/.test(jobs));
  A('④ 不虚称工单/复核通道(暂无专用工单通道·如实引用校准 hold)', jobs.includes('人工受理，暂无专用工单通道') && jobs.includes('评分处于校准期'));
  A('④ 申请流程内落位(apply 表单上方同卡)', jobs.indexOf('自动化处理说明与你的权利') < jobs.indexOf('applyAction.bind'));

  A('④ applications.service.ts 零触(scoreless 语义零翻)', !changeSet.includes('apps/api/src/modules/jobs/applications.service.ts'));
  const how = read('apps/web/app/recruiter/how-it-works/page.tsx');
  const surface = read('apps/web/lib/recruiter/surface.ts');
  const legal = read('apps/web/app/legal/page.tsx');
  A('④ 互洽面零矛盾(how-it-works :36 诚实句仍在)', how.includes('校准和人工复核工单还没开放'));
  A('④ 互洽面零矛盾(surface.ts :95 校准句仍在)', surface.includes('校准和人工复核做完之前'));
  A('④ 互洽面零矛盾(legal :45 自动招聘决定尚未开放仍在)', legal.includes('自动招聘决定尚未开放'));
  const jobsCopy = stripComments(jobs);
  A('④ 披露与既有负断言同向(渲染文案零「工单已开/复核工单」假称)',
    !jobsCopy.includes('工单已开放') && !jobsCopy.includes('复核工单'));
}

/* ── §2-5 邻面零触断言 ── */
{
  const forbidden = [
    'packages/domain/src/adaptive-interview.ts',
    'apps/api/src/platform/public-preview.ts',
    'apps/api/src/modules/privacy/privacy.service.ts',
    'packages/db/src/audit/audit.ts',
    'apps/web/app/admin/page.tsx',
    'packages/db/src/interview/interview-jobs.ts',
    'packages/domain/src/memory-summary.ts',
    'packages/domain/src/research-policy.ts',
    'packages/domain/src/crag.ts',
  ];
  const hits = forbidden.filter((f) => changeSet.includes(f));
  A('⑤ 邻面零触(平台级开关/隐私擦除/admin audit/保留枚举/crag/authz interview-jobs)', hits.length === 0, hits.join(','));
  const migrationsTouched = changeSet.filter((f) => f.includes('packages/db') && /migration|migrations/.test(f));
  A('⑤ 零迁移零新表(改动集零迁移文件)', migrationsTouched.length === 0, migrationsTouched.join(','));
  const ssotTouched = changeSet.filter((f) => /product-campaign-LEDGER|batch-residual-plan|execution-master-checklist|issues-master/.test(f));
  A('⑤ SSOT 四卷零触', ssotTouched.length === 0, ssotTouched.join(','));
}

/* ── §2-7 markers=0 + est live=0 双声明(词面运行时组装防自指) ── */
{
  const words = [['T', 'O', 'D', 'O'].join(''), ['F', 'I', 'X', 'M', 'E'].join(''), ['X', 'X', 'X'].join(''), ['H', 'A', 'C', 'K'].join('')];
  const conflict = ['<' + '<' + '<' + '<' + '<' + '<', '>' + '>' + '>' + '>' + '>'].join('|');
  const hits = [];
  for (const rel of changeSet) {
    let text = '';
    try { text = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    for (const w of words) if (text.includes(w)) hits.push(`${rel}::${w}`);
    if (new RegExp(conflict).test(text)) hits.push(`${rel}::conflict-marker`);
  }
  A('⑦ markers=0(改动集五类标记词零命中)', hits.length === 0, hits.join(' | '));

  const liveSurfaces = [
    'packages/domain/src/crisis-disposition.ts',
    'apps/api/src/platform/content-safety.ts',
    'apps/web/lib/interview/crisis-disposition.ts',
    'scripts/i6-239-gates.proof.mjs',
  ];
  const liveRe = new RegExp([['f', 'e', 't', 'c', 'h'].join(''), ['a', 'x', 'i', 'o', 's'].join(''),
    ['s', 'm', 't', 'p'].join(''), ['s', 'e', 'n', 'd', 'M', 'a', 'i', 'l'].join(''),
    ['M', 'O', 'D', 'E', 'L', '_', 'A', 'P', 'I', '_', 'K', 'E', 'Y'].join('')].join('|'));
  const liveHits = liveSurfaces
    .filter((f) => { try { return liveRe.test(readFileSync(join(ROOT, f), 'utf8')); } catch { return false; } });
  A('⑦ est live=0(本刀新增面零外呼零 SMTP 零 secrets 读用)', liveHits.length === 0, liveHits.join(','));
}

/* ── 改动集恰符清单(申报面) ── */
{
  const expected = new Set([
    'packages/domain/src/crisis-disposition.ts',
    'packages/domain/src/index.ts',
    'apps/api/src/platform/content-safety.ts',
    'apps/api/src/modules/interview/interview.service.ts',
    'apps/worker/src/interview-service.ts',
    'apps/web/lib/interview/crisis-disposition.ts',
    'apps/web/components/InterviewPanel.tsx',
    'apps/web/app/login/page.tsx',
    'apps/web/app/jobs/page.tsx',
    'apps/web/messages/zh.json',
    'apps/web/messages/en.json',
    'ai-docs/delivery/harness/i6-239-REQUEST.md',
    'package.json',
    'scripts/i6-239-gates.proof.mjs',
  ]);
  const unexpected = changeSet.filter((f) => !expected.has(f) && !f.endsWith('tsconfig.tsbuildinfo'));
  A('改动集恰符(实际触面 ⊆ 申报清单·tsbuildinfo 构建副产物不计)', unexpected.length === 0, `unexpected=${unexpected.join(',')}`);
}

console.log(process.exitCode ? '\ni6-239-gates: FAIL' : '\ni6-239-gates: ALL PASS');
