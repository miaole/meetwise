/**
 * qbank 策展门(生产入口)——把"内容进策展全局池"收敛到审核门后。纯 DB 层 ops:入参 client,由调用方用
 * asPrincipal 包事务(RLS/FORCE 生效)。安全**不靠这层**——真正的门在 DB(RLS + 触发器 + CAS + 视图,见 0013 迁移);
 * 任何绕过它直连 SQL 也照样被 DB 门挡住。
 *
 * 诚实边界:本模块喂的是**策展全局池**(qbank_pool_entry / qbank_retrieval_candidate 视图),
 *   尚**未接管**旧检索路径(annSearch 直读 vector_chunk)。把 annSearch 切到只在本视图 ref_id 内召回、
 *   并收紧 vector_chunk 直写,是后续步骤(见 0013 文末 TODO)。在此之前旧直写洞仍在。
 *
 *   proposeSource     任何 principal 提议一条源(落 pending,added_by=自己);content_hash 去重幂等。
 *   reviewSource      curator 审核:CAS pending→approved/rejected(或 approved→rejected 撤销);非 curator/陈旧=不生效。
 *   promoteToPool     curator 把 **approved** 源的一个块登记进策展全局池;非 approved 源被触发器结构化拒。
 *   listRetrievalCandidates  出题检索候选:只读 approved-only 视图 —— pending/rejected/被撤销的都不出现(结构保证)。
 *   isApprovedSource  守卫查询:某源是否可被选入全局池。
 */
import type { PoolClient as Client } from 'pg';

export type QbankSourceKind = 'official_doc' | 'question_bank' | 'manual';
export type QbankSourceStatus = 'pending' | 'approved' | 'rejected';
export type ReviewDecision = 'approved' | 'rejected';
/** AG39 owner layer（0186）: platform=平台公共源; org=企业私有源（orgId 必填）。 */
export type QbankSourceOwnerKind = 'platform' | 'org';

export interface ProposeInput {
  id: string; kind: QbankSourceKind; uri?: string; contentHash: string; addedBy: string;
  /** AG39 additive 可选——缺省臂=platform（全局公共源调用零变）。 */
  ownerKind?: QbankSourceOwnerKind;
  /** ownerKind='org' 时必填（服务端信任根派生值·禁客户端直供）。 */
  orgId?: string;
}
export interface ProposeResult { sourceId: string; dedup: boolean }

const OWNER_KINDS: readonly string[] = ['platform', 'org'];

/** 0186 owner 列在场与否（历史迁移前缀夹具零 owner 列→platform 旧形制写入）。 */
async function ownerColumnsPresent(c: Client, table: string): Promise<boolean> {
  const r = await c.query(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name='owner_kind'
     ) AS present`,
    [table],
  );
  return r.rows[0]?.present === true;
}

/** org 信任根白名单（0186 qbank_org_curator·#110 形）: (orgId, userId) 是否在册。 */
async function isOrgCurator(c: Client, orgId: string, userId: string): Promise<boolean> {
  const r = await c.query(
    'SELECT 1 FROM qbank_org_curator WHERE org_id=$1 AND user_id=$2',
    [orgId, userId],
  );
  return r.rowCount === 1;
}

/**
 * 提议一条策展源(低信任输入)。RLS 强制 added_by=当前 principal 且只能落 pending。
 * 去重仅对活跃源(非 rejected)生效 → 被拒的 hash 可重新提议(不永久占坑)。
 * 命中去重时经 qbank_active_source_id(SECURITY DEFINER,绕 RLS)诚实取既有活跃源 id,不返回未落库的幽灵 id。
 *
 * AG39（0186·rev2 E1 裁决⑥增补行使）: owner 列在场时写入 owner_kind/org_id，且 content_hash 去重
 * **owner 作用域化**——冲突目标=uq_qsrc_active_hash_scoped (owner_kind, COALESCE(org_id,''), content_hash)，
 * org 源与平台源同 hash 不互斥不静默映射；dedup 反查同 owner 域直查（executor 通道 0066 ALL+RLS true），
 * 不再用全局 qbank_active_source_id（防跨 owner 反查映射）。org 提议须 (orgId, addedBy) ∈ org 信任根白名单
 * （系统 seed 主体 __system_qbank__ 例外=平台内容安全兜底灌库面）。owner 列缺席的历史前缀夹具走 platform 旧形制。
 */
export async function proposeSource(c: Client, x: ProposeInput): Promise<ProposeResult> {
  const ownerKind = x.ownerKind ?? 'platform';
  if (!OWNER_KINDS.includes(ownerKind)) throw new Error('qbank_source_invalid_owner_kind');
  if (ownerKind === 'org' && (!x.orgId || x.orgId.length > 512)) throw new Error('qbank_source_invalid_owner_kind');
  if (ownerKind === 'platform' && x.orgId !== undefined && x.orgId !== '') throw new Error('qbank_source_invalid_owner_kind');
  const ownerCols = await ownerColumnsPresent(c, 'qbank_source');
  if (ownerKind === 'org' && !ownerCols) throw new Error('qbank_source_owner_schema_missing');
  if (ownerCols && ownerKind === 'org' && x.addedBy !== '__system_qbank__'
    && !await isOrgCurator(c, x.orgId!, x.addedBy)) {
    throw new Error('qbank_source_org_curator_required');   // 企业私有题维护=审核通过招聘方（#110 信任根）
  }
  const r = ownerCols
    ? await c.query(
      `INSERT INTO qbank_source(id, kind, uri, content_hash, status, added_by, owner_kind, org_id)
         VALUES ($1,$2,$3,$4,'pending',$5,$6,$7)
         ON CONFLICT (owner_kind, coalesce(org_id, ''), content_hash) WHERE status <> 'rejected' DO NOTHING
         RETURNING id`,
      [x.id, x.kind, x.uri ?? null, x.contentHash, x.addedBy, ownerKind, ownerKind === 'org' ? x.orgId! : null])
    : await c.query(
      `INSERT INTO qbank_source(id, kind, uri, content_hash, status, added_by)
         VALUES ($1,$2,$3,$4,'pending',$5)
         ON CONFLICT (content_hash) WHERE status <> 'rejected' DO NOTHING
         RETURNING id`,
      [x.id, x.kind, x.uri ?? null, x.contentHash, x.addedBy]);
  if (r.rowCount === 1) return { sourceId: r.rows[0].id as string, dedup: false };
  // 命中去重:owner 作用域反查（同 owner 域至多一条活跃源=scoped 部分唯一索引保证）;绕 RLS 直查同 qbank_active_source_id 语义。
  const e = ownerCols
    ? await c.query(
      `SELECT id FROM qbank_source
        WHERE content_hash=$1 AND status <> 'rejected' AND owner_kind=$2 AND org_id IS NOT DISTINCT FROM $3
        ORDER BY id LIMIT 1`,
      [x.contentHash, ownerKind, ownerKind === 'org' ? x.orgId! : null])
    : await c.query('SELECT qbank_active_source_id($1) AS id', [x.contentHash]);
  return { sourceId: e.rows[0].id as string, dedup: true };
}

/**
 * 审核:仅 curator(RLS)+ 合法跃迁 + 关键列不可篡改(触发器)+ CAS(from→to,陈旧落败)。返回是否真改了一行。
 * 候选人调用 → RLS USING 假 → 0 行 → false(改不动)。传错的 fromStatus → CAS 0 行 → false。
 *
 * AG39（0186·裁决⑥行使）: additive 审核边界校验参数 reviewerScope——传入时（org 维护面通道）目标源为 org
 * 私有源则 reviewer 须 ∈ qbank_org_curator(orgId) 或平台 curator（内容安全兜底审核/撤回权）;平台公共源须
 * 平台 curator。不传=既有调用形零变（系统 seed 自动审核臂/历史 proof）。RLS 审核策略已被 0176 真空收口,
 * 数据面写授权=executor 通道（0066 executable grant）,本校验是授权之上的信任根断言,非鉴权根。
 */
export async function reviewSource(
  c: Client, sourceId: string, fromStatus: QbankSourceStatus, decision: ReviewDecision, reviewNote?: string,
  reviewerScope?: { reviewer: string; orgId?: string },
): Promise<boolean> {
  if (reviewerScope !== undefined) {
    const target = await c.query(
      'SELECT owner_kind, org_id FROM qbank_source WHERE id=$1',
      [sourceId],
    );
    const row = target.rows[0] as { owner_kind?: string; org_id?: string | null } | undefined;
    if (!row) return false;
    const ownerKind = row.owner_kind ?? 'platform';
    const isPlatformCurator = await c.query(
      'SELECT 1 FROM qbank_curator WHERE user_id=$1',
      [reviewerScope.reviewer],
    );
    const platformCurator = isPlatformCurator.rowCount === 1;
    if (ownerKind === 'org') {
      const orgId = row.org_id ?? reviewerScope.orgId;
      if (!orgId) return false;
      const inOrg = await isOrgCurator(c, orgId, reviewerScope.reviewer);
      if (!inOrg && !platformCurator) return false;   // 企业侧白名单或平台兜底,其余拒
    } else if (!platformCurator) {
      return false;   // 平台公共源=平台 curator 审
    }
  }
  const r = await c.query(
    `UPDATE qbank_source
        SET status=$3,
            -- Operational qbank builds run without a request principal.  This
            -- is audit attribution only; PostgreSQL role grants, not this GUC,
            -- decide who may perform the update.
            reviewed_by=coalesce(nullif(current_setting('app.principal_user', true), ''), '__system_qbank__'),
            review_note=$4, reviewed_at=now(), version=version+1
      WHERE id=$1 AND status=$2`,
    [sourceId, fromStatus, decision, reviewNote ?? null]);
  return r.rowCount === 1;
}

/** 把一个 approved 源的块登记进策展全局池。非 curator=RLS 拒;非 approved 源=触发器拒。抛错=被门挡住。 */
export async function promoteToPool(
  c: Client, x: { id: string; sourceId: string; refId: string; contentHash: string },
): Promise<void> {
  await c.query(
    `INSERT INTO qbank_pool_entry(id, source_id, ref_id, content_hash)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (ref_id) DO NOTHING`,
    [x.id, x.sourceId, x.refId, x.contentHash]);
}

/** 某源当前是否 approved(可进全局池的守卫)。 */
export async function isApprovedSource(c: Client, sourceId: string): Promise<boolean> {
  const r = await c.query("SELECT 1 FROM qbank_source WHERE id=$1 AND status='approved'", [sourceId]);
  return r.rowCount === 1;
}

/**
 * curator 视角按 content_hash 取一条源(**任意状态**,优先活跃源;partial-unique 保证至多一条活跃)。
 * 系统灌库据此做幂等/治理决策:rejected → 尊重下架不复活;已有活跃源 → 复用其 id 不重建;无 → 由调用方 propose。
 * 仅 curator 能看到全部状态(0013 读 RLS:approved / 自己的 / curator 全见);非 curator 调用只见 approved+自己的,
 * 会漏看他人 pending/rejected → **本 helper 仅供系统灌库(curator 主体)用**,不作通用查询。
 */
export async function findSourceByHash(
  c: Client, contentHash: string,
): Promise<{ id: string; status: QbankSourceStatus } | null> {
  const r = await c.query(
    `SELECT id, status FROM qbank_source WHERE content_hash=$1
       ORDER BY (status <> 'rejected') DESC LIMIT 1`, [contentHash]);
  return r.rowCount ? { id: r.rows[0].id as string, status: r.rows[0].status as QbankSourceStatus } : null;
}

/**
 * 出题检索候选 = 只读 approved-only 视图 qbank_retrieval_candidate。撤销(approved→rejected)后该源的块
 * 立即从视图消失(结构保证,非查询自觉;连直查 pool 表也被 RLS 过滤到 approved)。返回 ref_id 供下游取文/召回。
 */
export async function listRetrievalCandidates(c: Client): Promise<{ refId: string; sourceId: string }[]> {
  const r = await c.query('SELECT ref_id, source_id FROM qbank_retrieval_candidate');
  return r.rows.map((row: { ref_id: string; source_id: string }) => ({ refId: row.ref_id, sourceId: row.source_id }));
}
