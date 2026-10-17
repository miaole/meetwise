/**
 * AG-15 图运行时可观测（issues-final :213/LG-20）：ai_graph_run 三观测列（current_node/last_error/
 * checkpoint_id）的哑读写面。只观测零修复：本模块零业务语义零终态化零 fence 触——UPDATE 恒零触
 * version/lease/status（version=fence 接管裁判·0194 冻结触发器面零触），行谓词=0149 前六值超集
 * （uq_active_run 五值+quarantined·0001 :36-37 词表·六值 IN 非 uq_active_run partial 索引覆盖面·终态行不写=历史观测诚实留痕）。
 */
import type { Client } from '../principal.ts';

/** 活行集=0149 前六值超集（uq_active_run 五值谓词+quarantined·终态 succeeded/completed/failed/
 *  safe_terminating/safely_terminated 行不写——观测只对在飞 run 落痕）。 */
const LIVE_RUN_STATUSES = "('created','active','waiting_user','migrating','paused','quarantined')";

export interface GraphRunObservationRecord {
  graphName: string;
  threadId: string;
  owner: string;
  currentNode: string | null;
  checkpointId: string | null;
  lastError: string | null;
}

/** 读最近活行观测值（无活行=NULL·读侧供卡死阈值比对）。 */
export async function readGraphRunObservation(
  c: Client, graphName: string, threadId: string, owner: string,
): Promise<{ currentNode: string | null } | null> {
  const r = await c.query<{ [column: string]: unknown }>(
    `SELECT current_node FROM ai_graph_run
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND status IN ${LIVE_RUN_STATUSES}
      ORDER BY version DESC LIMIT 1`,
    [graphName, threadId, owner],
  );
  const row = r.rows[0];
  return row ? { currentNode: typeof row.current_node === 'string' ? row.current_node : null } : null;
}

/** 写三观测列（零触 version/lease/status·rowCount 返回供 fail-soft 观测·零业务分支）。 */
export async function recordGraphRunObservation(c: Client, rec: GraphRunObservationRecord): Promise<number> {
  const r = await c.query(
    `UPDATE ai_graph_run SET current_node=$4, last_error=$5, checkpoint_id=$6
      WHERE graph_name=$1 AND thread_id=$2 AND owner_user_id=$3 AND status IN ${LIVE_RUN_STATUSES}`,
    [rec.graphName, rec.threadId, rec.owner, rec.currentNode, rec.lastError, rec.checkpointId],
  );
  return r.rowCount ?? 0;
}

/** 卡死形状列侧谓词（§1.2 值域定稿）：裸节点名=非 END 非 interrupt: 前缀的非空值。 */
export function graphRunPositionIsStuck(currentNode: string | null): boolean {
  return currentNode !== null && currentNode !== '' && currentNode !== 'END' && !currentNode.startsWith('interrupt:');
}
