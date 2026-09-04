/**
 * Fail-closed SSE cursor parser. No database.
 * pnpm last-event-id:unit:prove
 * HTTP 400 on interview / quiz / diagnosis is `pnpm api:validate` (HC-GAP-006).
 */
import { HttpException } from '@nestjs/common';
import { parseLastEventId } from '../src/platform/last-event-id.ts';

let failures = 0;
const A = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

function rejects(value: string | undefined): boolean {
  try {
    parseLastEventId(value);
    return false;
  } catch (error) {
    return error instanceof HttpException
      && error.getStatus() === 400
      && (error.getResponse() as { error?: string }).error === 'invalid_last_event_id';
  }
}

A('缺省 / 未传 header → 0（全量重放起点）', parseLastEventId(undefined) === 0);
A('空串失败关闭，不降级为全量重放', rejects(''));
A('0 与正整数合法', parseLastEventId('0') === 0 && parseLastEventId('1') === 1 && parseLastEventId('9007199254740991') === 9007199254740991);
A('负号、小数、科学计数、前导加号、前导零失败关闭',
  rejects('-1') && rejects('1.5') && rejects('1e1') && rejects('+1') && rejects('01'));
A('Infinity / 超安全整数 / 非数字失败关闭，不降级为全量重放',
  rejects('Infinity') && rejects('9007199254740992') && rejects('x') && rejects(' '.repeat(1)));
A('过长数字串失败关闭', rejects('1'.repeat(17)));

console.log(`\n${failures === 0 ? '✓ last-event-id fail-closed parser passed' : `✗ ${failures} failed`}`);
process.exit(failures === 0 ? 0 : 1);
