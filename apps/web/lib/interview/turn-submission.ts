/** 服务端发放的问题身份；UI 不从数组下标或本地计数器猜测这些值。 */
export interface QuestionIdentity {
  questionId: string;
  stateVersion: number;
  turn: number;
}

export interface TurnSubmission {
  questionId: string;
  stateVersion: number;
  answerId: string;
  answerHash: string;
  turn: number;
  answer: string;
}

/** Web Crypto 的 SHA-256：对 UTF-8 原始 answer 哈希，不 trim/normalize，服务端以同一规则复算。 */
export async function sha256Hex(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * 每次首次提交生成 UUID；网络重试必须把同一 answerId 传回本函数。
 * 不存在 CSPRNG 时 fail-closed，不退化为时间戳（时间戳无法抵抗双标签页/并发重试冲突）。
 */
export function newAnswerId(): string {
  const id = globalThis.crypto.randomUUID?.();
  if (!id) throw new Error('secure_answer_id_unavailable');
  return id;
}

export async function buildTurnSubmission(identity: QuestionIdentity, answer: string, answerId = newAnswerId()): Promise<TurnSubmission> {
  return {
    questionId: identity.questionId,
    stateVersion: identity.stateVersion,
    answerId,
    answerHash: await sha256Hex(answer),
    turn: identity.turn,
    answer,
  };
}
