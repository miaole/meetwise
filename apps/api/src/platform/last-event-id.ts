import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Parse the resumable SSE cursor fail-closed.  `Number()` accepts Infinity,
 * decimals, scientific notation and whitespace; feeding those to SQL silently
 * changes replay semantics and can force a full-stream scan.
 */
export function parseLastEventId(lastEventId?: string): number {
  if (lastEventId === undefined) return 0;
  if (!/^(0|[1-9]\d{0,15})$/.test(lastEventId))
    throw new HttpException({ error: 'invalid_last_event_id' }, HttpStatus.BAD_REQUEST);
  // Regex already forbids Infinity / decimals / scientific notation. parseInt
  // is the digit conversion, not a second acceptance path.
  const parsed = Number.parseInt(lastEventId, 10);
  if (!Number.isSafeInteger(parsed) || parsed < 0)
    throw new HttpException({ error: 'invalid_last_event_id' }, HttpStatus.BAD_REQUEST);
  return parsed;
}
