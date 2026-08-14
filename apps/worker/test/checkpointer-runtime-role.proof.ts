/**
 * A production runtime login must be able to persist LangGraph state after the
 * migration service has installed the vendor schema, but must not gain DDL or
 * raw checkpoint-table access. This catches the common setup()-at-runtime trap.
 */
import { fileURLToPath } from 'node:url';
import { Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault } from '@meetwise/ai-graphs';
import { assertIsolatedTestTarget, asPrincipal, createPool, enrollCheckpointThread, revokeCheckpointThread, loadMigrations, provisionRuntimeLogin, runMigrations } from '@meetwise/db';
import { createCheckpointer } from '../src/main.ts';
import { withCheckpointAccess } from '../src/checkpoint-principal.ts';

const admin = createPool();
const role = `checkpoint_runtime_${process.pid}`;
const password = 'checkpoint-runtime-role-password-2026';
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };

async function main() {
  await assertIsolatedTestTarget(admin);
  await admin.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  await runMigrations(admin, loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url))));
  await provisionRuntimeLogin(admin, { roleName: role, password });
  const runtime = createPool({ user: role, password });
  const port = process.env.PGPORT ?? '54329';
  const connection = `postgresql://${encodeURIComponent(role)}:${encodeURIComponent(password)}@${process.env.PGHOST ?? '127.0.0.1'}:${port}/${encodeURIComponent(process.env.PGDATABASE ?? 'meetwise')}`;
  const checkpointer = createCheckpointer(connection, true);
  const ownerA = `checkpoint-owner-a-${process.pid}`;
  const ownerB = `checkpoint-owner-b-${process.pid}`;
  const threadA = `checkpoint-thread-a-${process.pid}`;
  try {
    await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$4,'created')", [threadA, ownerA, `checkpoint-thread-b-${process.pid}`, ownerB]);
    const enrollmentA = await asPrincipal(runtime, ownerA, (c) => enrollCheckpointThread(c, ownerA, threadA));
    const accessA = { owner: ownerA, threadId: enrollmentA.threadId, fenceEpoch: enrollmentA.fenceEpoch };
    A('低权登录不能绕开 app_role 直接读取 checkpoint 表', await rejects(() => runtime.query('SELECT thread_id FROM checkpoints')));
    const answerVault = createEphemeralAnswerVault();
    const graph = buildAdaptiveInterviewGraph(checkpointer, {
      competencies: ['并发控制'], maxTurns: 1,
      retrieveAndGenerate: async () => ({ question: '请解释令牌桶如何限制突发流量？', sources: [] }),
      assess: async () => ({ score: 88, evidence: ['说明了补充速率与容量'], relevant: true }),
      loadAnswer: answerVault.loadAnswer,
    });
    const config = { configurable: { thread_id: threadA } };
    await withCheckpointAccess(accessA, () => graph.invoke({}, config));
    const first = await withCheckpointAccess(accessA, () => graph.getState(config));
    await withCheckpointAccess(accessA, () => graph.invoke(new Command({ resume: answerVault.issue('令牌按速率补充，容量限制突发') }), config));
    const second = await withCheckpointAccess(accessA, () => graph.getState(config));
    A('低权 app_role 可在迁移后的表中持久化 interrupt 并恢复',
      first.next.length > 0 && second.next.length === 0 && second.values.transcript?.length === 1 && !JSON.stringify(second.values).includes('令牌按速率补充'));
    const count = await admin.query('SELECT count(*)::int AS n FROM checkpoints WHERE thread_id=$1', [config.configurable.thread_id]);
    A('checkpoint 真正落库，运行时未执行 setup DDL', Number(count.rows[0]?.n) > 0);
    const bTuple = await withCheckpointAccess({ owner: ownerB, threadId: threadA, fenceEpoch: enrollmentA.fenceEpoch }, () => checkpointer.getTuple(config));
    const bRows = await asPrincipal(runtime, ownerB, async (c) => {
      const selected = await c.query('SELECT thread_id FROM checkpoints WHERE thread_id=$1', [threadA]);
      const updated = await c.query("UPDATE checkpoints SET metadata='{}'::jsonb WHERE thread_id=$1", [threadA]);
      const deleted = await c.query('DELETE FROM checkpoints WHERE thread_id=$1', [threadA]);
      return { selected: selected.rowCount ?? 0, updated: updated.rowCount ?? 0, deleted: deleted.rowCount ?? 0 };
    });
    const afterB = await withCheckpointAccess(accessA, () => checkpointer.getTuple(config));
    A('A/B checkpoint RLS：B 的真实 saver 恢复、SELECT、UPDATE、DELETE 成功数均为 0',
      bTuple === undefined && bRows.selected === 0 && bRows.updated === 0 && bRows.deleted === 0 && afterB !== undefined);
    // 0075 pauses public/app_role deletion admission because a writable
    // principal GUC is not an authorization root.  This setup-only trusted
    // operator call still exercises the vendor-table stale-epoch fence; it is
    // deliberately not evidence that an HTTP user may revoke a thread.
    const lowPrivilegeRevokeRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) => revokeCheckpointThread(c, threadA)));
    const trustedOperator = await admin.connect();
    let revokedEpoch = 0;
    try {
      await trustedOperator.query('BEGIN');
      await trustedOperator.query("SELECT set_config('app.principal_user',$1,true)", [ownerA]);
      const revoked = await trustedOperator.query<{ revoke_checkpoint_thread: number | string }>(
        'SELECT revoke_checkpoint_thread($1) AS revoke_checkpoint_thread', [threadA]);
      revokedEpoch = Number(revoked.rows[0]?.revoke_checkpoint_thread);
      await trustedOperator.query('COMMIT');
    } catch (error) {
      await trustedOperator.query('ROLLBACK').catch(() => undefined);
      throw error;
    } finally {
      trustedOperator.release();
    }
    const staleWriteRejected = await rejects(() => withCheckpointAccess(accessA, () =>
      (checkpointer as any).pool.query(
        "INSERT INTO checkpoints(thread_id,checkpoint_ns,checkpoint_id,checkpoint,metadata) VALUES ($1,'','late-write','{}'::jsonb,'{}'::jsonb)",
        [threadA],
      ),
    ));
    const reEnrollRejected = await rejects(() => asPrincipal(runtime, ownerA, (c) => enrollCheckpointThread(c, ownerA, threadA)));
    A('低权 app_role 不能直接撤回；受控测试撤回后旧 epoch 的真实 Saver 写入与重新 enrollment 均被数据库拒绝',
      lowPrivilegeRevokeRejected && revokedEpoch === enrollmentA.fenceEpoch + 1 && staleWriteRejected && reEnrollRejected);
  } finally {
    await (checkpointer as any).pool.end();
    await runtime.end();
    await admin.query(`DROP ROLE IF EXISTS ${role}`);
    await admin.end();
  }
  console.log(failures === 0 ? '\n✓ 低权 LangGraph checkpoint proof 全部通过' : `\n✗ ${failures} 项失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (error) => { console.error(error); await admin.end().catch(() => undefined); process.exit(1); });
