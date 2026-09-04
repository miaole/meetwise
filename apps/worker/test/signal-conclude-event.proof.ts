/** Worker 接线（无 DB）：只经投影 append。pnpm -C apps/worker prove:signal-sse */
import { emitSignalConcludeEvent } from '../src/signal-conclude-event.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

function fakeAppend() {
  const calls: Array<{ owner: string; stream: string; kind: string; payload: unknown; eventKey?: string }> = [];
  const appendEvent = async (_c: unknown, owner: string, stream: string, kind: string, payload: unknown, eventKey?: string) => {
    const prior = calls.find((x) => x.stream === stream && x.eventKey && x.eventKey === eventKey);
    if (prior) return 7;
    calls.push({ owner, stream, kind, payload, eventKey });
    return calls.length;
  };
  return { calls, appendEvent };
}

{
  const { calls, appendEvent } = fakeAppend();
  const seq = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', {
    code: 'early_weak', turn: 4, citedCompetencies: ['并发'], score: 0, overall: 12, band: 'junior', answer: '明文',
  });
  A('early_weak → 恰一次 append，kind/eventKey=session_concluded',
    seq === 1 && calls.length === 1 && calls[0].kind === 'session_concluded' && calls[0].eventKey === 'session_concluded'
    && calls[0].stream === 'iv1' && calls[0].owner === 'u1');
  const payload = JSON.stringify(calls[0].payload);
  A('写入载荷只有 concludeReason 三字段，无 score/overall/band/answer',
    payload.includes('early_weak') && !payload.includes('score') && !payload.includes('overall')
    && !payload.includes('band') && !payload.includes('明文') && !payload.includes('junior'));
}

{
  const { calls, appendEvent } = fakeAppend();
  const a = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', { code: 'thrashing', turn: 6, citedCompetencies: ['缓存'] });
  const b = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', { code: 'thrashing', turn: 6, citedCompetencies: ['缓存'] });
  A('同 eventKey 第二次返回既有 seq、不双写（模拟 appendEvent 幂等）',
    a === 1 && b === 7 && calls.length === 1);
}

{
  const { calls, appendEvent } = fakeAppend();
  const n = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', { code: 'coverage_met', turn: 8 });
  const u = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', { outcome: 'unscored', reason: 'evaluation_unavailable' });
  const s = await emitSignalConcludeEvent(appendEvent, {}, 'u1', 'iv1', { code: 'safety_ceiling', turn: 120 });
  A('非信号 reason / unscored 形状 → 不 append',
    n === null && u === null && s === null && calls.length === 0);
}

console.log(`\n${fail === 0 ? '✓ worker SIGNAL-SSE 接线（假 append，无 DB）全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
