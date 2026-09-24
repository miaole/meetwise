#!/usr/bin/env node
/**
 * Static prove: new eval/harness docs cite matrix row IDs.
 * Does NOT run live E2E / privacy HTTP / scor proves.
 * releaseEvidence=false · Not HA · 本绿≠业务 covered · stub≠gap closed；017/015/018/011/019/010/003/033 partial≠covered；025/004/028/027 gap≠covered；031-032 gap(e2e)/partial(eval)≠covered
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const matrixPath = join(root, 'ai-docs/delivery/e2e-requirement-coverage-matrix.md');

const units = [
  {
    id: 'privacy-erasure-http-503-pin',
    harness: 'ai-docs/delivery/harness/privacy-erasure-http-503-pin.md',
    evalDoc: 'ai-docs/delivery/eval/privacy-erasure-http-503-pin.eval.md',
    rowIds: ['UC-E2E-050–052', 'PRIVACY-HTTP', 'GAP-PRIV-02', 'BUG-PRIV-503'],
    mustPins: [
      [/DELETE\s*=\s*503|DELETE.*503/i, 'DELETE=503'],
      [/本绿\s*≠\s*产品删除闭环/, '本绿≠产品删除闭环'],
      [/privacy-erasure:http:prove/, 'lists privacy-erasure:http:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-015-resume-ingest-failures',
    harness: 'ai-docs/delivery/harness/uc-e2e-015-resume-ingest-failures.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-015-resume-ingest-failures.eval.md',
    rowIds: ['UC-E2E-015'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc015:ingest-failures:prove/, 'lists uc015:ingest-failures:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
      [/encrypt|加密/i, 'pins encrypt family'],
      [/0\s*字节|0-byte|空串/i, 'pins 0-byte family'],
      [/超大|413|file_too_large|oversiz/i, 'pins oversized family'],
      [/畸形|malform|parse_failed/i, 'pins malformed family'],
      [/409|OCR 成功/i, 'relative to OCR success+409'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-017-orphan-reservation',
    harness: 'ai-docs/delivery/harness/uc-e2e-017-orphan-reservation.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-017-orphan-reservation.eval.md',
    rowIds: ['UC-E2E-017'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc017:orphan:prove/, 'lists uc017:orphan:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-018-user-abandon',
    harness: 'ai-docs/delivery/harness/uc-e2e-018-user-abandon.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-018-user-abandon.eval.md',
    rowIds: ['UC-E2E-018'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc018:abandon:prove/, 'lists uc018:abandon:prove'],
      [/uc018:abandon:http:prove/, 'lists uc018:abandon:http:prove'],
      [/uc018:ui:prove/, 'lists uc018:ui:prove'],
      [/uc018:sole:prove/, 'lists uc018:sole:prove'],
      [/uc018:covered-lift:prove/, 'lists uc018:covered-lift:prove'],
      [/uc018:adv:prove/, 'lists uc018:adv:prove'],
      [/canHonestlyFlip\s*=\s*false|canHonestlyFlip:\s*false/i, 'pins canHonestlyFlip=false'],
      [/ADV[^\n]{0,60}\*\*blind\*\*|§1\.0 ADV.*blind/i, 'pins ADV blind refuse'],
      [/GAP-UC018-SOLE/, 'pins GAP-UC018-SOLE'],
      [/GAP-UC018-COVERED-LIFT|covered-lift/i, 'pins covered-lift'],
      [/PG-retained|adr-postgres-retained|Postgres\+pgvector/i, 'pins PG-retained sole'],
      [/#6 alone\s*≠|alone ≠ covered|Ban wash SOLE/i, 'pins #6 alone ≠ covered / Ban wash SOLE'],
      [/抬到 covered|§1b|抬 covered/i, 'pins 抬 covered / §1b'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/abandon|放弃/i, 'pins abandon'],
      [/released|额度|净变/i, 'pins release/quota'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-011-report-refund',
    harness: 'ai-docs/delivery/harness/uc-e2e-011-report-refund.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-011-report-refund.eval.md',
    rowIds: ['UC-E2E-011'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc011:report-refund:prove/, 'lists uc011:report-refund:prove'],
      [/uc011:report-refund:http:prove/, 'lists uc011:report-refund:http:prove'],
      [/抬到 covered|§1b|抬 covered/i, 'pins 抬 covered / §1b'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/confirmed|不退|报告失败/i, 'pins report-fail no-refund'],
      [/released|面试失败|额度/i, 'pins interview-fail release'],
      [/GAP-UC011-REFUND-CALLBACK|refund-callback|refunded/i, 'pins refund-callback GAP'],
      [/GET \/commerce\/entitlement|HTTP 额度/i, 'pins HTTP entitlement mouth'],
      [/balance-ui|GAP-UC011-BALANCE-UI/i, 'pins balance-ui GAP'],
      [/H5|§1b#1|PREREQ|抬 covered 前置|implementing refund-callback/i, 'pins §1b refund-callback PREREQ / H5'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-010-sse-resume',
    harness: 'ai-docs/delivery/harness/uc-e2e-010-sse-resume.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-010-sse-resume.eval.md',
    rowIds: ['UC-E2E-010'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc010:sse-resume:prove/, 'lists uc010:sse-resume:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/Last-Event-ID|last-event-id/i, 'pins Last-Event-ID'],
      [/断线|disconnect|resume|续传/i, 'pins disconnect/resume'],
      [/R-mid|mid-interview|live-tail|live hold/i, 'pins R-mid mid-interview live-tail'],
      [/抬到 covered|§1b|抬 covered/i, 'pins 抬 covered / §1b'],
      [/GAP-UC010|G-GAP|honesty/i, 'pins UC010 GAP honesty'],
      [/last-event-id:unit:prove|sse-slot:prove|helpers\/sse/i, 'cites layer proves'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-019-report-regenerate',
    harness: 'ai-docs/delivery/harness/uc-e2e-019-report-regenerate.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-019-report-regenerate.eval.md',
    rowIds: ['UC-E2E-019'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc019:report-regenerate:prove/, 'lists uc019:report-regenerate:prove'],
      [/uc019:report-regenerate:http:prove/, 'lists uc019:report-regenerate:http:prove'],
      [/抬到 covered|§1b|抬 covered/i, 'pins 抬 covered / §1b'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/requeue|regenerate|重生成|report\/retry/i, 'pins regenerate/requeue/report/retry'],
      [/并发|illegal|非法组合|already_confirmed/i, 'pins concurrency honesty'],
      [/GAP-UC019|quarantine|regenerateAttempt/i, 'pins UC019 GAP'],
      [/POST \/interview\/:id\/report\/retry|report\/retry/i, 'pins HTTP report/retry mouth'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-003-i18n-locale',
    harness: 'ai-docs/delivery/harness/uc-e2e-003-i18n-locale.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-003-i18n-locale.eval.md',
    rowIds: ['UC-E2E-003'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc003:i18n-locale:prove/, 'lists uc003:i18n-locale:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/i18n|locale|en\.json|messages/i, 'pins i18n/locale'],
      [/ERROR_MESSAGES|错误码|GAP-UC003-ERROR-CODE/i, 'pins error-code en map GAP'],
      [/Playwright|secondary|DOM|e2e-ui/i, 'pins Playwright secondary / DOM'],
      [/GAP-UC003|honesty|HARDCODED-ZH/i, 'pins UC003 GAP honesty'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-033-cross-user-authz',
    harness: 'ai-docs/delivery/harness/uc-e2e-033-cross-user-authz.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-033-cross-user-authz.eval.md',
    rowIds: ['UC-E2E-033'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc033:cross-user-authz:prove/, 'lists uc033:cross-user-authz:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/跨用户|cross-user|越权|B-C/i, 'pins cross-user / B-C'],
      [/七类未齐|系统化七类|GAP-UC033/i, 'pins seven-class / GAP honesty'],
      [/neg:auth|neg:bend|neg:interview|full\.e2e/i, 'cites neg:*/full.e2e 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
      [/抬到 covered 还缺|§1b/i, 'pins §1b 抬 covered remaining'],
      [/W1|worker.principal|WORKER-LIVE|asPrincipal/i, 'pins W1 worker-principal honesty'],
      [/X10|concurrent|burst|X9|X11/i, 'pins X9–X11 authz/burst/leak honesty'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },
  {
    id: 'uc-e2e-004-career-path',
    harness: 'ai-docs/delivery/harness/uc-e2e-004-career-path.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-004-career-path.eval.md',
    rowIds: ['UC-E2E-004'],
    mustPins: [
      [/\bgap\b/i, 'pins gap'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc004:career-path:prove/, 'lists uc004:career-path:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/career-path|职业路径/i, 'pins career-path'],
      [/GAP-UC004-E2E-MAIN|TC-E2E-004-main/i, 'pins TC/GAP e2e-main'],
      [/GAP-UC004-GRAPH|AiGraphRun/i, 'pins TC/GAP graph'],
      [/GAP-UC004-GROWTH|抬到 covered 还缺|CapabilityProfile|GrowthTimeline/i, 'pins growth / covered-path remaining'],
      [/GAP-UC004|G-GAP|honesty|mark-red/i, 'pins UC004 GAP honesty'],
      [/report:prove|neg:interview|旁证/i, 'cites report/neg 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },

  {
    id: 'uc-e2e-025-stale-quiz-expiry',
    harness: 'ai-docs/delivery/harness/uc-e2e-025-stale-quiz-expiry.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-025-stale-quiz-expiry.eval.md',
    rowIds: ['UC-E2E-025'],
    mustPins: [
      [/\bgap\b/i, 'pins gap'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc025:stale-quiz-expiry:prove/, 'lists uc025:stale-quiz-expiry:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/押题|stale-quiz|过期|expiry/i, 'pins stale-quiz / expiry'],
      [/TC-E2E-025-stale-quiz|GAP-UC025-STALE-REJECT/i, 'pins TC/GAP stale-reject'],
      [/TC-E2E-025-version-mismatch|GAP-UC025-VERSION-PIN/i, 'pins TC/GAP version-pin'],
      [/GAP-UC025|G-GAP|honesty|mark-red/i, 'pins UC025 GAP honesty'],
      [/quiz:prove|旁证/i, 'cites quiz:prove 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },

  {
    id: 'uc-e2e-028-trace-ledger-fail-open',
    harness: 'ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-028-trace-ledger-fail-open.eval.md',
    rowIds: ['UC-E2E-028'],
    mustPins: [
      [/\bgap\b/i, 'pins gap'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc028:trace-fail-open:prove/, 'lists uc028:trace-fail-open:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/trace|账本失败|fail-open|persistTrace/i, 'pins trace / fail-open'],
      [/GAP-UC028-FAIL-OPEN|TC-E2E-028-trace-fail/i, 'pins TC/GAP fail-open'],
      [/GAP-UC028-RECON|TC-E2E-028-recon/i, 'pins TC/GAP recon'],
      [/GAP-UC028|G-GAP|honesty|mark-red|抬到 covered 还缺/i, 'pins UC028 GAP honesty / covered-path'],
      [/report-bulkhead|旁证/i, 'cites report-bulkhead 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },


  {
    id: 'uc-e2e-027-manual-review-appeal',
    harness: 'ai-docs/delivery/harness/uc-e2e-027-manual-review-appeal.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-027-manual-review-appeal.eval.md',
    rowIds: ['UC-E2E-027'],
    mustPins: [
      [/\bgap\b/i, 'pins gap'],
      [/\bblocked\b/i, 'pins blocked'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc027:manual-review-appeal:prove/, 'lists uc027:manual-review-appeal:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/人工复核|ManualReview|申诉|appeal/i, 'pins ManualReview / appeal'],
      [/GAP-UC027-APPEAL-OPEN|TC-E2E-027-appeal/i, 'pins TC/GAP appeal-open'],
      [/GAP-UC027-OVERTURN-CAS|TC-E2E-027-overturn/i, 'pins TC/GAP overturn'],
      [/GAP-UC027|G-GAP|honesty|mark-red|抬到 covered 还缺/i, 'pins UC027 GAP honesty / covered-path'],
      [/qbank|SelectiveReview|needs_review|旁证/i, 'cites qbank/selective/needs_review 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
      [/no fake API|无 fake API|不假装|禁止.*fake/i, 'pins no-fake-API honesty'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },

  {
    id: 'uc-e2e-040-043-batch-qbank-seat',
    harness: 'ai-docs/delivery/harness/uc-e2e-040-043-batch-qbank-seat.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-040-043-batch-qbank-seat.eval.md',
    rowIds: ['UC-E2E-040–043', 'UC-E2E-040'],
    mustPins: [
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc040-043:batch-qbank-seat:prove/, 'lists uc040-043:batch-qbank-seat:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/批匹配|BatchJob|批任务|题库导入|席位 CAS|SeatLedger/i, 'pins batch/qbank/seat'],
      [/GAP-UC040-BATCH-PARTIAL|TC-E2E-040/i, 'pins TC/GAP batch'],
      [/GAP-UC041-IMPORT-PARTIAL|TC-E2E-041/i, 'pins TC/GAP import'],
      [/GAP-UC043-SEAT-CAS|TC-E2E-043|席位/i, 'pins TC/GAP seat-CAS'],
      [/GAP-UC040|G-GAP|honesty|mark-red|抬到 covered 还缺/i, 'pins UC040 GAP honesty / covered-path'],
      [/full\.e2e|recruiting-bound|旁证/i, 'cites full.e2e recruiting 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },

  {
    id: 'uc-e2e-031-032-injection-jailbreak',
    harness: 'ai-docs/delivery/harness/uc-e2e-031-032-injection-jailbreak.md',
    evalDoc: 'ai-docs/delivery/eval/uc-e2e-031-032-injection-jailbreak.eval.md',
    rowIds: ['UC-E2E-031', 'UC-E2E-032'],
    mustPins: [
      [/\bgap\b/i, 'pins gap'],
      [/\bpartial\b/i, 'pins partial'],
      [/本绿\s*≠\s*全链路 E2E covered/, '本绿≠全链路 E2E covered'],
      [/≠\s*covered|不得.*covered|假绿/i, '≠ covered'],
      [/uc031-032:injection-jailbreak:prove/, 'lists uc031-032:injection-jailbreak:prove'],
      [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false'],
      [/Not HA|非 HA/i, 'Not HA'],
      [/注入|越狱|jailbreak|诱导造假|fabricat/i, 'pins jailbreak / fabrication'],
      [/GAP-UC031-AI-EVAL|TC-E2E-031-model-resist/i, 'pins TC/GAP 031 ai-eval'],
      [/GAP-UC032-AI-EVAL|TC-E2E-032-no-fabricate-model/i, 'pins TC/GAP 032 ai-eval'],
      [/GAP-UC031-032-FAKE-MODEL-BAN|E2E_FAKE_MODEL|禁假模型|fake-model/i, 'pins fake-model ban'],
      [/GAP-UC031|G-GAP|honesty|mark-red|抬到 covered 还缺/i, 'pins UC031 GAP honesty / covered-path'],
      [/golden-tasks|scoring:eval|ai-eval|旁证/i, 'cites golden-tasks/ai-eval 旁证'],
      [/green-risk|R5/i, 'pins R5 green-risk'],
      [/ai-eval suite|质量断言归 ai-eval|抬到 covered.*ai-eval/i, 'pins covered-path = ai-eval'],
    ],
    expectExitDoc: [/期望 EXIT[\s\S]*\b0\b|EXIT.*\*\*0\*\*/i, 'documents expected EXIT=0'],
  },




];

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }

if (!existsSync(matrixPath)) fail(`matrix missing: ${matrixPath}`);
else pass(`matrix present: ${matrixPath}`);

const matrix = existsSync(matrixPath) ? readFileSync(matrixPath, 'utf8') : '';


/** En-dash (U+2013) vs ASCII hyphen: explicit alternates only — no loose normalize. */
function rowIdVariants(id) {
  const EN = '\u2013';
  const HY = '-';
  const out = new Set([id]);
  // Explicit range-separator swap only between digits (050–052), Ban global hyphen rewrite of UC-E2E-*.
  out.add(id.replace(/(\d)-(\d)/g, `$1${EN}$2`));
  out.add(id.replace(new RegExp(`(\d)${EN}(\d)`, 'g'), `$1${HY}$2`));
  return [...out];
}

/** First-column cells from markdown table rows (exact strings). */
function parseMatrixRowIdCells(matrixText) {
  const cells = [];
  for (const line of matrixText.split('\n')) {
    const m = /^\|\s*([^|]+?)\s*\|/.exec(line);
    if (!m) continue;
    const cell = m[1].trim();
    if (!cell || /^[-:\s|]+$/.test(cell)) continue;
    if (cell === '需求/能力ID' || cell.startsWith('---')) continue;
    cells.push(cell);
  }
  return cells;
}

/**
 * Exact matrix row-id match: first cell equals want (or en/hyphen variant),
 * or cell is `want（…）` / `want (…)` annotation suffix — NOT substring of a longer UC id.
 */
function matrixHasExactRowId(cells, want) {
  for (const v of rowIdVariants(want)) {
    for (const cell of cells) {
      if (cell === v) return true;
      if (cell.startsWith(v + '（') || cell.startsWith(v + ' (')) return true;
      // Merged display form used by 031/032: `UC-E2E-031 / 032`
      if (cell.startsWith(v + ' /')) return true;
    }
  }
  return false;
}

/**
 * Doc cite must include the row id as a whole token.
 * `UC-E2E-050` must NOT match inside `UC-E2E-050–052` (digit/en-dash/hyphen continuation banned).
 */
function textCitesExactRowId(text, want) {
  for (const v of rowIdVariants(want)) {
    const esc = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(esc + '(?![0-9\\u2013\\-])');
    if (re.test(text)) return true;
  }
  return false;
}


const matrixRowIdCells = matrix ? parseMatrixRowIdCells(matrix) : [];

for (const u of units) {
  const hPath = join(root, u.harness);
  const ePath = join(root, u.evalDoc);
  if (!existsSync(hPath)) fail(`${u.id}: harness missing ${u.harness}`);
  else pass(`${u.id}: harness present`);
  if (!existsSync(ePath)) fail(`${u.id}: eval missing ${u.evalDoc}`);
  else pass(`${u.id}: eval present`);

  const h = existsSync(hPath) ? readFileSync(hPath, 'utf8') : '';
  const e = existsSync(ePath) ? readFileSync(ePath, 'utf8') : '';
  const both = h + '\n' + e;

  for (const row of u.rowIds) {
    if (textCitesExactRowId(both, row)) pass(`${u.id}: cites matrix row ${row}`);
    else fail(`${u.id}: must cite matrix row ${row}`);
    // Matrix should point back at harness when privacy / 017 updated
    if (matrix.includes(u.harness) || matrix.includes(u.harness.replace(/^ai-docs\/delivery\//, ''))) {
      pass(`${u.id}: matrix points at harness path`);
    } else if (matrixHasExactRowId(matrixRowIdCells, row)) {
      // soft: exact row id cell exists; path pointer checked once per unit below
    }
  }

  if (matrix.includes(u.harness) || matrix.includes(`harness/${u.harness.split('/').pop()}`)) {
    pass(`${u.id}: matrix references harness filename`);
  } else {
    fail(`${u.id}: matrix must reference harness path/filename`);
  }

  for (const [re, label] of u.mustPins) {
    if (re.test(both)) pass(`${u.id}: ${label}`);
    else fail(`${u.id}: missing pin — ${label}`);
  }
  if (u.expectExitDoc) {
    const [re, label] = u.expectExitDoc;
    if (re.test(h)) pass(`${u.id}: ${label}`);
    else fail(`${u.id}: ${label}`);
  }

  // Never claim covered falsely in these docs
  if (/覆盖状态[^\n]*\*\*covered\*\*|状态\s*=\s*covered/i.test(both) && (u.id.includes('uc-e2e-017') || u.id.includes('uc-e2e-015') || u.id.includes('uc-e2e-018') || u.id.includes('uc-e2e-011') || u.id.includes('uc-e2e-019') || u.id.includes('uc-e2e-010') || u.id.includes('uc-e2e-003') || u.id.includes('uc-e2e-033') || u.id.includes('uc-e2e-025') || u.id.includes('uc-e2e-004') || u.id.includes('uc-e2e-028') || u.id.includes('uc-e2e-027') || u.id.includes('uc-e2e-031-032'))) {
    fail(`${u.id}: must not claim covered`);
  } else if (u.id.includes('uc-e2e-017') || u.id.includes('uc-e2e-015') || u.id.includes('uc-e2e-018') || u.id.includes('uc-e2e-011') || u.id.includes('uc-e2e-019') || u.id.includes('uc-e2e-010') || u.id.includes('uc-e2e-003') || u.id.includes('uc-e2e-033') || u.id.includes('uc-e2e-025') || u.id.includes('uc-e2e-004') || u.id.includes('uc-e2e-028') || u.id.includes('uc-e2e-027') || u.id.includes('uc-e2e-031-032')) {
    pass(`${u.id}: does not claim covered`);
  }
  if (/产品删除闭环已|删除已闭环|erasure complete/i.test(both) && !/≠.*产品删除闭环|假绿|不得/.test(both)) {
    fail(`${u.id}: must not claim deletion closed without 本绿≠ pin`);
  }
}


// Exact row-id matching self-test (Ban substring false-positive)
{
  const fakeMatrix = [
    '| UC-E2E-050–052 | **partial** |',
    '| UC-E2E-040–043 | **gap** |',
    '| UC-E2E-015 | **partial** |',
  ].join('\n');
  const cells = parseMatrixRowIdCells(fakeMatrix);
  if (matrixHasExactRowId(cells, 'UC-E2E-050–052') && matrixHasExactRowId(cells, 'UC-E2E-050-052')) {
    pass('row-id exact: en-dash/hyphen variants of UC-E2E-050–052');
  } else {
    fail('row-id exact: must accept en-dash and hyphen variants of merged id');
  }
  if (!matrixHasExactRowId(cells, 'UC-E2E-050')) {
    pass('row-id exact: UC-E2E-050 does NOT match cell UC-E2E-050–052');
  } else {
    fail('row-id exact: substring UC-E2E-050 must not match UC-E2E-050–052');
  }
  if (!matrixHasExactRowId(cells, 'UC-E2E-040')) {
    pass('row-id exact: UC-E2E-040 does NOT match cell UC-E2E-040–043');
  } else {
    fail('row-id exact: substring UC-E2E-040 must not match UC-E2E-040–043');
  }
  if (!matrixHasExactRowId(cells, 'UC-E2E-0500') && !textCitesExactRowId('see UC-E2E-050–052 here', 'UC-E2E-050')) {
    pass('row-id exact: negative UC-E2E-0500 / cite boundary');
  } else {
    fail('row-id exact: negative self-test failed');
  }
  // Live matrix: privacy aggregated id present; bare UC-E2E-050 absent as first cell
  if (matrix && matrixHasExactRowId(matrixRowIdCells, 'UC-E2E-050–052') && !matrixHasExactRowId(matrixRowIdCells, 'UC-E2E-050')) {
    pass('live matrix: UC-E2E-050–052 exact; bare UC-E2E-050 absent');
  } else if (matrix) {
    fail('live matrix: expected exact UC-E2E-050–052 row and no bare UC-E2E-050 first-cell');
  }
}

// Privacy row must stay partial in matrix (not false covered)
if (matrix) {
  if (/PRIVACY-HTTP[\s\S]{0,200}\*\*partial\*\*/.test(matrix) || /PRIVACY-HTTP[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: PRIVACY-HTTP remains partial');
  } else if (/PRIVACY-HTTP[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: PRIVACY-HTTP must not be false covered');
  } else {
    pass('matrix: PRIVACY-HTTP row present (partial check soft)');
  }
  if (/UC-E2E-017[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-017 must not be false covered');
  } else if (/UC-E2E-017[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-017 is partial (not covered)');
  } else if (/UC-E2E-017[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-017 remains gap');
  } else {
    fail('matrix: UC-E2E-017 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-015[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-015 must not be false covered');
  } else if (/UC-E2E-015[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-015 is partial (not covered)');
  } else if (/UC-E2E-015[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-015 remains gap');
  } else {
    fail('matrix: UC-E2E-015 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-018[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-018 must not be false covered');
  } else if (/UC-E2E-018[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-018 is partial (not covered)');
  } else if (/UC-E2E-018[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-018 remains gap');
  } else {
    fail('matrix: UC-E2E-018 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-011[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-011 must not be false covered');
  } else if (/UC-E2E-011[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-011 is partial (not covered)');
  } else if (/UC-E2E-011[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-011 remains gap');
  } else {
    fail('matrix: UC-E2E-011 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-019[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-019 must not be false covered');
  } else if (/UC-E2E-019[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-019 is partial (not covered)');
  } else if (/UC-E2E-019[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-019 remains gap');
  } else {
    fail('matrix: UC-E2E-019 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-010[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-010 must not be false covered');
  } else if (/UC-E2E-010[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-010 is partial (not covered)');
  } else if (/UC-E2E-010[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-010 remains gap');
  } else {
    fail('matrix: UC-E2E-010 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-003[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-003 must not be false covered');
  } else if (/UC-E2E-003[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-003 is partial (not covered)');
  } else if (/UC-E2E-003[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-003 remains gap');
  } else {
    fail('matrix: UC-E2E-003 must be **partial** or **gap**, never covered');
  }
  if (/UC-E2E-033[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-033 must not be false covered');
  } else if (/UC-E2E-033[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-033 is partial (not covered)');
  } else if (/UC-E2E-033[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-033 remains gap');
  } else {
    fail('matrix: UC-E2E-033 must be **partial** or **gap**, never covered');
  }

  if (/UC-E2E-025[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-025 must not be false covered');
  } else if (/UC-E2E-025[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-025 is partial (not covered)');
  } else if (/UC-E2E-025[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-025 remains gap');
  } else {
    fail('matrix: UC-E2E-025 must be **partial** or **gap**, never covered');
  }

  if (/UC-E2E-004[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-004 must not be false covered');
  } else if (/UC-E2E-004[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-004 is partial (not covered)');
  } else if (/UC-E2E-004[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-004 remains gap');
  } else {
    fail('matrix: UC-E2E-004 must be **partial** or **gap**, never covered');
  }

  if (/UC-E2E-028[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-028 must not be false covered');
  } else if (/UC-E2E-028[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-028 is partial (not covered)');
  } else if (/UC-E2E-028[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-028 remains gap');
  } else {
    fail('matrix: UC-E2E-028 must be **partial** or **gap**, never covered');
  }

  if (/UC-E2E-027[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-027 must not be false covered');
  } else if (/UC-E2E-027[^\n]*\*\*partial\*\*/.test(matrix) && !/UC-E2E-027[^\n]*\*\*blocked\*\*/.test(matrix) && !/UC-E2E-027[^\n]*\*\*gap\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-027 must stay gap/blocked (not partial-closed)');
  } else if (/UC-E2E-027[^\n]*\*\*gap\*\*/.test(matrix) || /UC-E2E-027[^\n]*\*\*blocked\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-027 remains gap/blocked');
  } else {
    fail('matrix: UC-E2E-027 must be **gap** / **blocked**, never covered');
  }



  if (/UC-E2E-040[–-]043[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-040–043 must not be false covered');
  } else if (/UC-E2E-040[–-]043[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-040–043 is partial (not covered)');
  } else if (/UC-E2E-040[–-]043[^\n]*\*\*gap\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-040–043 remains gap');
  } else {
    fail('matrix: UC-E2E-040–043 must be **partial** or **gap**, never covered');
  }


  if (/UC-E2E-031\s*\/\s*032[^\n]*\*\*covered\*\*/.test(matrix)) {
    fail('matrix: UC-E2E-031/032 must not be false covered');
  } else if (/UC-E2E-031\s*\/\s*032[^\n]*\*\*gap\*\*\(e2e\)\s*\/\s*\*\*partial\*\*\(eval\)/.test(matrix)) {
    pass('matrix: UC-E2E-031/032 remains gap(e2e)/partial(eval)');
  } else if (/UC-E2E-031\s*\/\s*032[^\n]*\*\*gap\*\*/.test(matrix) && /UC-E2E-031\s*\/\s*032[^\n]*\*\*partial\*\*/.test(matrix)) {
    pass('matrix: UC-E2E-031/032 gap+partial present');
  } else {
    fail('matrix: UC-E2E-031/032 must stay **gap**(e2e) / **partial**(eval), never covered');
  }

  if (/releaseEvidence.*false/i.test(matrix)) pass('matrix: releaseEvidence=false');
  else fail('matrix: must keep releaseEvidence=false');
}

console.log(lines.join('\n'));
console.log(`\nCMD=pnpm eval-harness-matrix-cite:prove EXIT=${exitCode}`);
console.log('NOTE: 本绿≠业务 covered；stub≠gap closed；017/015/018/011/019/010/003/033/040-043 partial≠covered；025/004/028/027 gap≠covered；031-032 gap(e2e)/partial(eval)≠covered；privacy pin绿≠产品删除闭环');
process.exit(exitCode);
