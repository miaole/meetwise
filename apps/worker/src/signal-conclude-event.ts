/**
 * INT-LEVEL-SIGNAL-SSE-01：把图 concludeReason 投到既有 interview_event。
 * 只经 sessionConcludedAppend；禁止把 raw provenance 直接 append（避免嵌套 answer/score）。
 */
import { sessionConcludedAppend } from '@meetwise/domain';

export type EventAppender<C> = (
  client: C,
  owner: string,
  stream: string,
  kind: string,
  payload: unknown,
  eventKey?: string,
) => Promise<number>;

/** 投影为 null 时不写。调用方必须传入 appendEvent，不得手写 payload。 */
export async function emitSignalConcludeEvent<C>(
  appendEvent: EventAppender<C>,
  client: C,
  owner: string,
  interviewId: string,
  concludeReason: unknown,
): Promise<number | null> {
  const signal = sessionConcludedAppend(concludeReason);
  if (!signal) return null;
  return appendEvent(client, owner, interviewId, signal.kind, signal.payload, signal.eventKey);
}
