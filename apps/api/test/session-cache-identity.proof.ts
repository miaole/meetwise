/**
 * MW-TEST-003：伪造 uid 配别人的 jti 必须 401 语义（会话不可见=不活跃），
 * 且这次负结果不能写进对方 jti 的缓存。不连数据库。
 * releaseEvidence=false
 */
import { isSessionActive } from '../src/platform/auth-session.ts';

const failures: string[] = [];
const A = (name: string, cond: boolean) => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
  if (!cond) failures.push(name);
};

const rows = new Map<string, { uid: string }>([['jti-b', { uid: 'user-b' }]]);
const db = {
  asPrincipal: async (uid: string, fn: (c: { query: (sql: string, params: unknown[]) => Promise<{ rowCount: number }> }) => Promise<unknown>) => fn({
    query: async (_sql: string, params: unknown[]) => {
      const row = rows.get(String(params[0]));
      const visible = row?.uid === uid && String(params[1]) === uid;
      return { rowCount: visible ? 1 : 0 };
    },
  }),
};

const now = Date.now();
const forged = await isSessionActive(db as never, 'user-a', 'jti-b', now);
const owner = await isSessionActive(db as never, 'user-b', 'jti-b', now);
A('伪造 uid 看不到别人的会话，结果为不活跃', forged === false);
A('同一 jti 的真正用户随后仍能查到活跃会话', owner === true);

const exit = failures.length === 0 ? 0 : 1;
console.log(`ATTEMPT_END EXIT=${exit} fail=${failures.length}`);
process.exit(exit);
