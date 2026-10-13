/**
 * #213 diag-honesty 修法②证明（纯组装面·零模型外呼·est live=0）:
 *   §2-3 有 role → resume-diagnosis.generate 组装 system 与 899cab1a 基线逐字同(内嵌基线字面量 diff 零变断言·经 promptedModel 生产路径捕获);
 *   §2-2 无 role(undefined/空) → 组装 system 零 match(四维句 + kind 枚举四值),其余段逐字保持(最小 diff 断言);
 *   无 vars/其他 service → getPrompt 原对象返回 system 字节恒定(security-proof 同源不变式不破);
 *   枚举本体零触静态锚(DIAGNOSIS_SECTION_KINDS 五值 / z.enum / kind∈枚举语义)。
 *   残留如实登记:prompt 供给面约束非 validator 强制,不听话模型仍可产 match kind(归 ai-eval 面,§1-② 席1 残留)。
 *   pnpm -C packages/ai-runtime prove:diag-honesty
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPrompt } from '../src/prompts.ts';
import { promptedModel, type ModelClient, type CompletionRequest, type ModelResult } from '../src/model-client.ts';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

// 899cab1a 基线字面量(改动前 prompts.ts :53-57 五段拼接,逐字誊录——§2-3 diff 断言的预期侧)。
const BASELINE =
  '你是资深简历诊断顾问。仅依据 <data> 内的简历事实(可含目标岗位)产出结构化诊断,**严禁编造简历中不存在的经历、技能或数据**。'
  + '从五个维度评估:structure(结构)、completeness(完整性)、highlight(亮点)、risk(风险/硬伤)、match(岗位匹配度)。'
  + '每条 finding 的 refs 必须是简历里出现过的关键词原文(泛结构性观察可留空 refs)。'
  + '可改写建议(rewrites)只优化表达与措辞,**after 严禁出现简历中不存在的经历、公司、学历或数字(包括 QPS/百分比/年限/团队规模等量化数据)**;若原文无量化数据,应提示用户「补充真实数据」而非代为编造。每条 refs 必须锚定其优化的真实经历关键词。'
  + '只返回 JSON: {"overall":0到100整数,"summary":"一句话总评","sections":[{"kind":"structure|completeness|highlight|risk|match","title":"标题","score":0到100可选,"findings":[{"text":"结论","refs":["关键词"]}]}],"rewrites":[{"before":"原句","after":"改写句","refs":["关键词"]}]}';
// 无 role 预期产物 = 基线仅两处联动替换(五维句→四维句;kind 枚举去 match 选项),其余逐字同(最小 diff)。
const NO_ROLE_EXPECTED = BASELINE
  .replace('从五个维度评估:structure(结构)、completeness(完整性)、highlight(亮点)、risk(风险/硬伤)、match(岗位匹配度)。', '从四个维度评估:structure(结构)、completeness(完整性)、highlight(亮点)、risk(风险/硬伤)。')
  .replace('structure|completeness|highlight|risk|match', 'structure|completeness|highlight|risk');

/** 生产路径捕获:promptedModel 产出的 Model.call → 真实 complete 所携 system。零外呼(记录后即回确定性结果)。 */
async function captureSystem(vars: Record<string, unknown>): Promise<{ system: string; userData: string }> {
  const seen: CompletionRequest[] = [];
  const recorder: ModelClient = {
    async complete(req): Promise<ModelResult> {
      seen.push(req);
      return { ok: true, raw: {} } as unknown as ModelResult;
    },
  };
  const model = promptedModel(recorder, 'resume-diagnosis.generate', vars);
  await model.call(1);
  return { system: seen[0]?.system ?? '', userData: seen[0]?.userData ?? '' };
}

async function main() {
  section('§2-3 有 role 照旧:组装 system 与 899cab1a 基线逐字同(注册表缺省+生产路径双拍)');
  A('注册表缺省(无 vars·审计/落 ai_prompt_versions 面)=基线逐字', getPrompt('resume-diagnosis.generate').system === BASELINE);
  A('生产路径(vars.role 给定)捕获 system=基线逐字(五维含 match·kind 枚举五值)', (await captureSystem({ facts: ['限流'], role: '后端工程师' })).system === BASELINE);
  A('有 role 时 buildData 前缀现状字节(目标岗位段)', (await captureSystem({ facts: ['限流'], role: '后端工程师' })).userData.startsWith('目标岗位:后端工程师\n简历事实:\n'));

  section('§2-2 无 role 零 match:role 缺省/空串 → 组装 system 零 match(四维句+kind 枚举四值·其余段逐字同)');
  const noRole = (await captureSystem({ facts: ['限流'] })).system;
  A('role=undefined → 全串零 match 子串', !noRole.includes('match'));
  A('role=undefined → 四维句(枚举剔除 match)逐字', noRole.includes('从四个维度评估:structure(结构)、completeness(完整性)、highlight(亮点)、risk(风险/硬伤)。'));
  A('role=undefined → JSON 模板 kind 枚举四值(去 match 选项)', noRole.includes('"kind":"structure|completeness|highlight|risk"'));
  A('role=undefined → 与基线恰两处联动替换,其余逐字同(最小 diff 断言)', noRole === NO_ROLE_EXPECTED);
  A("role=''(空串) 与 undefined 同臂(buildData :59 同源真值门)", (await captureSystem({ facts: ['限流'], role: '' })).system === noRole);
  A('无 role 时 buildData 前缀现状字节(零目标岗位段)', (await captureSystem({ facts: ['限流'] })).userData.startsWith('简历事实:\n'));

  section('不变式:其余 service 字节恒定不破(security-proof 同源)+getPrompt 兼容');
  const tpl = getPrompt('mock-interview.evaluate');
  A('mock-interview.evaluate system 两次取字节恒定(既有不变式保持)', getPrompt('mock-interview.evaluate').system === tpl.system);
  A('无 vars 调用返回注册表原对象(审计/版本面零形状漂)', getPrompt('resume-diagnosis.generate') === getPrompt('resume-diagnosis.generate'));
  A('promptVersions 仍含 resume-diagnosis.generate v1(版本面零漂)', getPrompt('resume-diagnosis.generate').version === 'v1');

  section('枚举本体零触(静态源锚·§1-②):五值枚举/z.enum/kind∈枚举语义保持');
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');   // = packages/
  const graphSrc = readFileSync(resolve(root, 'ai-graphs/src/resume-diagnosis.ts'), 'utf8');
  const workerSrc = readFileSync(resolve(root, '../apps/worker/src/interview-service.ts'), 'utf8');
  A('DIAGNOSIS_SECTION_KINDS 五值全量保留(resume-diagnosis.ts:20)', graphSrc.includes("['structure', 'completeness', 'highlight', 'risk', 'match'] as const"));
  A('worker schema kind 仍 z.enum 五值枚举(interview-service.ts:188)', workerSrc.includes('kind: z.enum(DIAGNOSIS_SECTION_KINDS)'));
  A('图侧 kind 门=枚举成员语义(非全维齐备·无 role 四维响应即合法)', graphSrc.includes('!DIAGNOSIS_SECTION_KINDS.includes(sec.kind)'));

  console.log(`\n${failures === 0 ? '✓ diag-honesty 修法②组装面全部通过(零模型外呼)' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
