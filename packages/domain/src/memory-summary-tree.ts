/**
 * 多层会话摘要树（MEM-03）纯域原语：把「反复覆盖滚动文本」升级为
 * `turn_summary(叶, 引用事件范围) → segment_summary(父, 引用已验证 turn 子) →
 * session_episode(根, 引用已验证 segment 子)` 的摘要树。
 *
 * 与迁移 0116_memory_summary_tree.sql 的 CHECK 约束与 digest 算法逐值一致（漂移即证明失败）。
 *
 * 这里**不重实现**：
 *   - MEM-02 的 draft/verify/activate/supersede/invalidate/hydrate（0112 冻结面，本模块只补树语义）。
 *   - 删除根（issuer 冻结在 privacy-authorization.ts，erasure 归 0112/0111）。
 *   - MEM-04 长期事实 / MEM-05 向量 / MEM-06 snapshot / CTX-04 compression snapshot /
 *     MEM-14 memory_context_snapshot（各自对象，非本树）。
 *   - 真实模型摘要（归 MODEL-OP）。
 *
 * 本模块只提供：
 *   - `SUMMARY_TREE_KINDS`：树内三层 kind 显式 enum（SQL 侧 0116 扩 CHECK 钉死三值）。
 *     注意：与 MEM-02 的 `SUMMARY_KINDS`（turn_summary/segment_summary）刻意分离——后者被
 *     MEM-02 回归断言 `join(',') === 'turn_summary,segment_summary'` 冻结，绝不动。
 *   - `assertSummaryTreeChildKind`：父子 kind 兼容（segment→turn、episode→segment，拒绝跨层/回退/叶有子）。
 *   - `deriveSummaryTreeRangeDigest` / `deriveSummaryTreeArtifactDigest`：父节点「子派生」digest，
 *     与 SQL 0116 的 `memory_summary_compose_draft` 逐字节一致（按 child id 文本升序拼接）。
 *   - `deriveSummaryTreeByteLength`：父节点 source_utf8_byte_length = 子节点字节长之和。
 *
 * 零 IO、零模型、零 db：可直接被 packages/db 与 proof 引用。
 */
import { createHash } from 'node:crypto';

/** 树内三层 kind（显式 enum）：turn(叶) → segment(父) → session_episode(根)。 */
export const SUMMARY_TREE_KINDS = ['turn_summary', 'segment_summary', 'session_episode'] as const;
export type SummaryTreeKind = (typeof SUMMARY_TREE_KINDS)[number];

/**
 * 父子 kind 兼容表（严格单层推进，无跨层、无回退、叶无子）：
 *   - segment_summary 只能引用 turn_summary 子节点；
 *   - session_episode 只能引用 segment_summary 子节点；
 *   - turn_summary 是叶（不能做父，child_summary_ids 必须为空）。
 * 与 SQL 0116 `memory_summary_compose_draft` 的 kind 校验逐值一致。
 */
export const SUMMARY_TREE_CHILD_KINDS: Readonly<Record<'segment_summary' | 'session_episode', readonly SummaryTreeKind[]>> = {
  segment_summary: ['turn_summary'],
  session_episode: ['segment_summary'],
};

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/** 非法树输入统一失败出口：错误名即 code（上层按 code 分支）。 */
const fail = (code: string): never => {
  throw Object.assign(new Error(code), { code });
};

/** 按 child id 文本升序（与 SQL `ORDER BY id::text` 同一字典序，UUID 文本为小写 hex）。 */
const byIdAsc = <T extends { id: string }>(a: T, b: T): number =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * 父子 kind 兼容断言（fail-closed）。叶（turn_summary）作父、跨层（episode 直接引 turn）、
 * 回退（segment 引 episode / turn 引 segment）一律拒绝。
 */
export function assertSummaryTreeChildKind(parentKind: SummaryTreeKind, childKind: SummaryTreeKind): void {
  if (parentKind === 'turn_summary') fail('memory_summary_tree_leaf_cannot_parent');
  const allowed = SUMMARY_TREE_CHILD_KINDS[parentKind as 'segment_summary' | 'session_episode'];
  if (allowed === undefined || !allowed.includes(childKind)) fail('memory_summary_tree_child_kind_mismatch');
}

/**
 * 父节点「子派生」范围 digest：覆盖 thread + 子树范围端点 + 逐子（id:source_range_digest 升序）聚合。
 * 与 SQL 0116 逐字节一致：mid = sha256(join('\n', sorted "id:source_range_digest"))，
 * 然后 sha256(`${threadId}:${from}:${to}:${mid}`)。任一摘要由此可回溯到子链 + 事件范围。
 */
export function deriveSummaryTreeRangeDigest(input: {
  threadId: string;
  fromSequence: number;
  toSequence: number;
  children: Array<{ id: string; sourceRangeDigest: string }>;
}): string {
  if (input.children.length === 0) fail('memory_summary_tree_children_empty');
  const inner = input.children
    .slice()
    .sort(byIdAsc)
    .map((c) => `${c.id}:${c.sourceRangeDigest}`)
    .join('\n');
  const mid = sha256(inner);
  return sha256(`${input.threadId}:${input.fromSequence}:${input.toSequence}:${mid}`);
}

/**
 * 父节点「子派生」原文指纹：sha256(join('\n', sorted "id:content_digest"))。
 * 与 SQL 0116 逐字节一致。content_digest 是子节点正文的 sha256，故父指纹不采信调用方自报。
 */
export function deriveSummaryTreeArtifactDigest(input: {
  children: Array<{ id: string; contentDigest: string }>;
}): string {
  if (input.children.length === 0) fail('memory_summary_tree_children_empty');
  const inner = input.children
    .slice()
    .sort(byIdAsc)
    .map((c) => `${c.id}:${c.contentDigest}`)
    .join('\n');
  return sha256(inner);
}

/** 父节点 source_utf8_byte_length = 子节点字节长之和（子树总来源字节上界）。 */
export function deriveSummaryTreeByteLength(children: Array<{ sourceUtf8ByteLength: number }>): number {
  if (children.length === 0) fail('memory_summary_tree_children_empty');
  return children.reduce((acc, c) => acc + c.sourceUtf8ByteLength, 0);
}
