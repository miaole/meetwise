/** INT-LEVEL-SIGNAL-SSE-01：early_weak/thrashing → 既有 SSE 投影。pnpm signal-sse:prove */
import {
  projectSignalConcludeReason, sessionConcludedAppend,
  signalConcludePracticeCopy, SIGNAL_CONCLUDE_CODES, SESSION_CONCLUDED_KIND,
  SESSION_CONCLUDED_EVENT_KEY,
} from '../src/index.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const weak = { code: 'early_weak' as const, turn: 4, citedCompetencies: ['并发', '缓存'] };
const thrash = { code: 'thrashing' as const, turn: 6, citedCompetencies: ['A', 'B'] };

/* ── 正 TC-INT-LEVEL-SIGNAL-SSE-01-main ── */
{
  A('enum 只锁 early_weak/thrashing（不是全量 ConcludeReason）',
    SIGNAL_CONCLUDE_CODES.join(',') === 'early_weak,thrashing');
  const p = projectSignalConcludeReason(weak);
  A('正: early_weak + turn → 投影 code/turn/cited',
    p?.code === 'early_weak' && p.turn === 4 && p.citedCompetencies.join(',') === '并发,缓存');
  const t = projectSignalConcludeReason(thrash);
  A('正: thrashing → 投影', t?.code === 'thrashing' && t.turn === 6);
  const append = sessionConcludedAppend(weak);
  A('正: append 走既有 kind/eventKey，payload 仅 concludeReason',
    append?.kind === SESSION_CONCLUDED_KIND && append.eventKey === SESSION_CONCLUDED_EVENT_KEY
    && append.payload.concludeReason.code === 'early_weak'
    && !('score' in append.payload) && !('overall' in append.payload.concludeReason));
}

/* ── 特 TC-INT-LEVEL-SIGNAL-SSE-01-S1 ── */
{
  A('特: null/undefined/数组/空对象 → null',
    projectSignalConcludeReason(null) === null
    && projectSignalConcludeReason(undefined) === null
    && projectSignalConcludeReason([]) === null
    && projectSignalConcludeReason({}) === null);
  A('特: 缺 turn 或非整数 turn → null（不补造）',
    projectSignalConcludeReason({ code: 'early_weak' }) === null
    && projectSignalConcludeReason({ code: 'early_weak', turn: 1.5 }) === null
    && projectSignalConcludeReason({ code: 'early_weak', turn: -1 }) === null);
  A('特: CJK 能力名保留',
    projectSignalConcludeReason({ code: 'early_weak', turn: 4, citedCompetencies: ['系统设计'] })
      ?.citedCompetencies[0] === '系统设计');
  const long = '系统设计一致性哈希限流回滚'.repeat(8);
  const truncated = projectSignalConcludeReason({
    code: 'thrashing', turn: 5,
    citedCompetencies: [long, 'ok', 'a@b.com', '+86 13800138000'],
  });
  A('特: 超长能力名截断到 64、邮箱/手机形态丢弃',
    truncated?.citedCompetencies[0] === long.slice(0, 64)
    && truncated?.citedCompetencies.includes('ok')
    && !truncated?.citedCompetencies.some((n) => n.includes('@') || n.includes('138')));
}

/* ── 异 TC-INT-LEVEL-SIGNAL-SSE-01-E1 ── */
{
  const a = JSON.stringify(sessionConcludedAppend(weak));
  const b = JSON.stringify(sessionConcludedAppend(weak));
  const c = JSON.stringify(sessionConcludedAppend({ ...weak }));
  A('异: 同 provenance 三次投影 JSON 全等（纯函数稳定；账本幂等靠 appendEvent event_key）', a === b && b === c);
  A('异: eventKey 恒为 session_concluded（同场恰一条的键）',
    sessionConcludedAppend(weak)?.eventKey === 'session_concluded'
    && sessionConcludedAppend(thrash)?.eventKey === 'session_concluded');
}

/* ── 并 TC-INT-LEVEL-SIGNAL-SSE-01-E2 ── */
{
  const frozen = Object.freeze({ ...weak, citedCompetencies: Object.freeze(['并发', '缓存']) });
  const first = JSON.stringify(projectSignalConcludeReason(frozen));
  const all = Array.from({ length: 20 }, () => JSON.stringify(projectSignalConcludeReason(frozen)));
  A('并: 20 次重复投影同一冻结 provenance 全等（本层无共享可变状态；双 worker 写靠 fence+event_key）', all.every((x) => x === first));
}

/* ── 逃 TC-INT-LEVEL-SIGNAL-SSE-01-E5 ── */
{
  A('逃: coverage_met/all_resolved/safety_ceiling/budget_exhausted 不投影',
    projectSignalConcludeReason({ code: 'coverage_met', turn: 8 }) === null
    && projectSignalConcludeReason({ code: 'all_resolved', turn: 3 }) === null
    && projectSignalConcludeReason({ code: 'safety_ceiling', turn: 120 }) === null
    && projectSignalConcludeReason({ code: 'budget_exhausted', turn: 8 }) === null
    && sessionConcludedAppend({ code: 'safety_ceiling', turn: 120 }) === null);
  A('逃: unscored/identity-mismatch 形状（无 decide provenance）→ null',
    projectSignalConcludeReason({ outcome: 'unscored', reason: 'evaluation_unavailable' }) === null
    && projectSignalConcludeReason({ code: 'early_weak', reason: 'identity-mismatch' }) === null);
}

/* ── 复：投影不发明分 ── */
{
  const fat = {
    code: 'early_weak', turn: 4, citedCompetencies: ['并发'],
    score: 0, overall: 12, band: 'junior', maxTurns: 8,
    coverage: { evidenceItems: 2 },
  };
  const p = projectSignalConcludeReason(fat);
  A('复: 肥胖 provenance 只留三字段，分/band/overall 被剥',
    p != null && Object.keys(p).sort().join(',') === 'citedCompetencies,code,turn'
    && !('score' in p) && !('overall' in p) && !('band' in p));
}

/* ── 刁 TC-INT-LEVEL-SIGNAL-SSE-01-T1 ── */
{
  const poisoned = {
    code: 'early_weak', turn: 4,
    citedCompetencies: ['并发', 'victim@example.com', '我答了限流源文'],
    observedBand: 'senior', yearsOfExperience: 12, gender: 'x',
    overall: 88, score: 0, answer: '明文答案',
  };
  const p = projectSignalConcludeReason(poisoned);
  A('刁: 注入 band/年限/overall/score/原文不进入投影，cited 疑似答文被丢',
    p?.code === 'early_weak' && p.turn === 4
    && JSON.stringify(p).includes('并发')
    && !JSON.stringify(p).includes('senior')
    && !JSON.stringify(p).includes('overall')
    && !JSON.stringify(p).includes('明文')
    && !JSON.stringify(p).includes('我答了限流源文')
    && !JSON.stringify(p).includes('victim@'));
  const copyW = signalConcludePracticeCopy('early_weak');
  const copyT = signalConcludePracticeCopy('thrashing');
  A('刁: 练习文案含控制流否定等级/招聘，且无分数数字',
    copyW.includes('练习') && copyW.includes('控制流') && copyW.includes('未决')
    && copyW.includes('不是能力等级') && copyW.includes('招聘结论') && !/\d/.test(copyW)
    && copyT.includes('练习') && copyT.includes('控制流') && copyT.includes('不是能力等级'));
}

console.log(`\n${fail === 0 ? '✓ SIGNAL-SSE 投影（early_weak/thrashing → session_concluded，不发明分）全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
