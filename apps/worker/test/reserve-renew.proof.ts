/**
 * 预留租约续约失败处置面静态证明（零 DB 零模型·纯源读+目录/手册机读）：
 * ①consumer 结构化事件字段形（event 名/kind/phase 两值/interview_ref 键）+旧文本原串零残留
 *   （neg 判别臂——扫描域显式钉=apps/worker/src/interview-consumer.ts 单文件源读；
 *   catalog/runbook 史录注记含旧文本系升格刻意保留·明示排除不在本臂扫描域内防假红）
 * ②重试常量在且值=[250,500]+尽试次数=delays.length+1（先尽试后告警）
 * ③benign false 臂零处置（源级：false 不入失败臂·try 成功通路直 break 零结果消费）
 * ④catalog 条目（event 名/severity=Ticket/matcher 形/runbook 锚/source 届行号）
 * ⑤runbook 锚 id+「目录十四事件」+§6 升格注记（原排除行史录保留）
 * ⑥exclusions 升格注记（条目本体零删·append 防假红明示）
 * pnpm -C apps/worker prove:reserve-renew
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// neg 判别臂扫描域显式钉：唯一产品码源读面=本单文件（其余两读面=配置/手册史录，仅做升格注记正形断言，绝不做旧文本残留负判别）。
const CONSUMER_PATH = join(HERE, '../src/interview-consumer.ts');
const CATALOG_PATH = join(HERE, '../../../scripts/alerts/event-catalog.json');
const RUNBOOK_PATH = join(HERE, '../../../ai-docs/observability/alerting-runbook.md');

const consumer = readFileSync(CONSUMER_PATH, 'utf8');
const runbook = readFileSync(RUNBOOK_PATH, 'utf8');

interface CatalogEvent {
  event?: string;
  severity?: string;
  matchers?: Array<{ type?: string; field?: string; value?: string }>;
  source?: string;
  source_also?: string[];
  runbook?: string;
}
interface CatalogShape {
  events: CatalogEvent[];
  registered_exclusions: Array<{ ref?: string; note?: string }>;
}
const catalog = JSON.parse(readFileSync(CATALOG_PATH, 'utf8')) as CatalogShape;

let fail = 0;
const A = (n: string, c: boolean, detail = '') => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}${detail ? `  [${detail}]` : ''}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──── ${t} ────`);

const EVENT = 'reservation_lease_renew_failed';
const OLD_TEXT = 'reservation lease renew failed';   // 旧文本形 console.error 原串（neg 判别用·含空格与事件名不同形）

/* ── ①+②+③ consumer 源面（扫描域=单文件显式钉） ── */
section('① 事件字段形+neg 判别（扫描域=apps/worker/src/interview-consumer.ts 单文件）');
{
  A('重试常量导出在且值恰 [250,500]（有限短退避·禁无限）',
    /export const RESERVATION_RENEW_RETRY_DELAYS_MS = \[250, 500\];/.test(consumer));
  A('claim 臂结构化事件形：event 名/kind/interview_ref/phase=claim 四键在',
    consumer.includes(`event: '${EVENT}'`) && consumer.includes("kind: 'interview'")
    && consumer.includes('interview_ref: job.interviewId') && consumer.includes("phase: 'claim'"));
  A('heartbeat 臂同名事件 phase=heartbeat 在（30s 天然跨拍重试·闭包内零 sleep）',
    consumer.includes("phase: 'heartbeat'")
    && consumer.split("phase: 'claim'").length - 1 === 1
    && consumer.split("phase: 'heartbeat'").length - 1 === 1);
  A('neg 判别：旧文本原串在本单文件零残留（扫描域显式钉=本文件·catalog/runbook 史录注记已明示排除防假红）',
    !consumer.includes(OLD_TEXT), `scan=${CONSUMER_PATH}`);
}

section('② 尽试次数=delays.length+1（先尽试后告警）');
{
  A('尽试守卫在：catch 臂先判 attempt >= delays.length 才入失败臂（delays.length=2 → 总尝试 3 次）',
    consumer.includes('if (attempt >= RESERVATION_RENEW_RETRY_DELAYS_MS.length)')
    && consumer.split('RESERVATION_RENEW_RETRY_DELAYS_MS.length').length - 1 === 1);
  A('退避 sleep 附加面在：delays 逐档 setTimeout（附加 ≤750ms·尝试自身往返另计受池 statement_timeout 界）',
    consumer.includes('setTimeout(resolve, RESERVATION_RENEW_RETRY_DELAYS_MS[attempt])'));
}

section('③ benign false 臂零处置（源级：false 不入失败臂）');
{
  A('claim 臂成功通路直 break 零结果消费（false=已终态/重放零 throw·绝不当失败处置）',
    /await asPrincipal\(d\.pool, owner, \(c\) => renewReservationLease\(c, owner, job\.interviewId, DEFAULT_LEASE_SECONDS\)\);\n      break;/.test(consumer));
  A('claim 臂失败臂唯一性：仅 catch 内 delays 尽试后的结构化日志一处分发（零第二失败通路）',
    consumer.split(`console.error(JSON.stringify({ event: '${EVENT}'`).length - 1 === 2
    && consumer.split("phase: 'claim'").length - 1 === 1);
  A('heartbeat 臂 renew 包 catch 后下行（图 fence 同拍不再被跳过·闭包返回语义零变）',
    /await renewReservationLease\(c, owner, job\.interviewId, DEFAULT_LEASE_SECONDS\)\n      \.catch\(/.test(consumer));
}

/* ── ④ catalog 条目 ── */
section('④ catalog 正式事件条目（目录驱动·check-alerts 三键面）');
{
  const ev = catalog.events.find((e) => e.event === EVENT);
  A(`events 含 ${EVENT} 条目且 severity=Ticket（降级在发生未丢数据·分层恰位）`,
    ev !== undefined && ev.severity === 'Ticket');
  A('matcher 形=json 精确 event 名匹配（principal.ts 结构化事件先例同形·容忍 compose logs 前缀）',
    ev?.matchers?.length === 1 && ev.matchers[0]?.type === 'json'
    && ev.matchers[0]?.field === 'event' && ev.matchers[0]?.value === EVENT);
  A('runbook 锚字符串+source 届行号（claim 臂发射面）+source_also（heartbeat 臂发射面）',
    ev?.runbook === `ai-docs/observability/alerting-runbook.md#ev-${EVENT}`
    && (ev?.source ?? '').startsWith('apps/worker/src/interview-consumer.ts:')
    && (ev?.source_also?.every((s) => s.startsWith('apps/worker/src/interview-consumer.ts:')) ?? false));
}

/* ── ⑤ runbook 手册节 ── */
section('⑤ runbook §3.14 锚节+计数升格+§6 注记');
{
  A('锚 id+手册节在（四件套=matcher/含义/响应/下钻）',
    runbook.includes(`<a id="ev-${EVENT}"></a>`) && runbook.includes(`### 3.14 ${EVENT}`));
  A('「目录十四事件」在且「目录十三事件」零残留（neg 面·十三→十四恰一步）',
    runbook.includes('目录十四事件') && !runbook.includes('目录十三事件'));
  A('§6 升格注记在且原排除行史录保留（:225 首批外行零删）',
    runbook.includes('升格注记（RESERVE-RENEW-FIX·升格后本行史录保留）')
    && runbook.includes('`apps/worker/src/interview-consumer.ts:225`'));
}

/* ── ⑥ exclusions 升格注记（append 零删+P2 防假红明示） ── */
section('⑥ registered_exclusions 升格注记（条目本体零删·append）');
{
  const ex = catalog.registered_exclusions.find((e) => e.ref === 'apps/worker/src/interview-consumer.ts:225');
  A('排除条目本体零删（ref 恒在）且 note 含升格注记原文（promoted·史录零洗）',
    ex !== undefined && (ex.note ?? '').includes(`已由 RESERVE-RENEW-FIX 升格为正式事件 ${EVENT}（promoted·史录零洗）`));
  A('史录注记明示排除防假红：目录+runbook 双面同载「扫描域显式钉单文件·不在扫描域」语义',
    (ex?.note ?? '').includes('扫描域显式钉 apps/worker/src/interview-consumer.ts 单文件源读')
    && (ex?.note ?? '').includes('防假红') && runbook.includes('不在其扫描域内（防假红）'));
}

console.log(`\n${fail === 0 ? `✓ 预留续租失败处置静态面（事件形/重试界/benign 零触/catalog/runbook/exclusions）全部通过` : `✗ ${fail} 失败`}`);
process.exit(fail ? 1 : 0);
