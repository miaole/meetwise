/**
 * 记忆事实裁决（MEM-13）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 稳定 fact_key 服务端派生（owner+scope+purpose+namespace+归一化 subject，sha256），TS↔SQL
 *     逐字节一致；客户端 DTO .strict 拒绝 factKey/owner/purpose/scope（禁止传任意 factKey）
 *   - 事实分类 + 单/多值规则：namespace/cardinality 显式枚举；单值事实全局至多一个 active
 *   - 显式 status enum + audited transition：candidate→active（仅用户确认或受信业务事实，模型
 *     候选不可直接 active）；active→superseded/expired/contradicted/revoked；过期自动非 active
 *   - contradicts/supersedes 是**可追溯的边**（memory_fact_relationship），不是布尔列；旧事实不删
 *   - 六分量分离：source_trust/extraction_confidence/user_confirmation/valid_until/salience/
 *     retrieval_score 独立列，绝不合并成单一总分；retrieval_score 裁决期恒 NULL
 *   - 100 并发 confirm/correct/revoke → 单值至多一个 active（partial unique index + advisory 锁 + CAS）
 *   - RLS 跨 owner=0（fail-closed，不泄 owner 存在性）；app_role 无原始表读写
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  issueMemoryAdmissionSnapshot, admitMemoryRecord,
  materializeAdjudicationFact, confirmAdjudicationFact, correctAdjudicationFact,
  revokeAdjudicationFact, expireAdjudicationFacts, type Client,
} from '@meetwise/db';
import {
  normalizeFactSubject, deriveMemoryFactKey, assertFactAdjudicationSeparation,
  memoryContentDigest, assertMemoryFactContentSafe, utf8ByteLength,
} from '@meetwise/domain';
import { MemoryFactMaterializeInput } from '@meetwise/contracts';

// 单池 max=100：100 并发 confirm/correct/revoke 需要 100 个连接；若拆成两个池
// (admin 默认 20 + concurrent 100) 会超过容器默认 max_connections=100 → FATAL 53300。
const admin = createPool({ max: 100 });
const concurrent = admin;  // 与 admin 同池，总连接数不超 max_connections
const owner = `memadj-owner-${process.pid}`;
const otherOwner = `memadj-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const throwsSync = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };

const SRC_TEXT = '面试：分布式锁🔒租约续期';
const SRC_BYTES = utf8ByteLength(SRC_TEXT);

const CONTENT = '派生摘要：当前职级为高级工程师';
const CONTENT_DIGEST = memoryContentDigest(CONTENT);
const CONTENT_V2 = '派生摘要：当前职级为技术专家';
const CONTENT_V2_DIGEST = memoryContentDigest(CONTENT_V2);

const PURPOSE = 'interview_prep' as const;
const NAMESPACE = 'fact' as const;
const SUBJECT = 'current_level';
const SINGLE = 'single_value' as const;
const MULTI = 'multi_value' as const;

/** 服务端签发器专用 principal（SET LOCAL ROLE memory_admission_issuer + 绑定 owner GUC）。 */
async function asAdmissionIssuer<T>(principal: string, fn: (c: Client) => Promise<T>): Promise<T> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE memory_admission_issuer');
    await c.query("SELECT set_config('app.principal_user', $1, true)", [principal]);
    const r = await fn(c);
    await c.query('COMMIT');
    return r;
  } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; } finally { c.release(); }
}

/** 无 principal 调用（只 SET ROLE 不 set_config）：应 fail-closed。 */
async function withoutPrincipal(role: string, fn: (c: Client) => Promise<unknown>): Promise<boolean> {
  const c = await admin.connect();
  try {
    await c.query('BEGIN');
    await c.query(`SET LOCAL ROLE ${role}`);
    await fn(c);
    await c.query('COMMIT');
    return false;
  } catch { await c.query('ROLLBACK').catch(() => undefined); return true; } finally { c.release(); }
}

async function insertAccount(userId: string): Promise<void> {
  await admin.query(
    'INSERT INTO user_account(id, email, password_hash) VALUES ($1,$2,$3) ON CONFLICT (id) DO NOTHING',
    [userId, `${userId}@memadj.test`, 'scrypt$salt$dk'],
  );
}

type IssueInput = Parameters<typeof issueMemoryAdmissionSnapshot>[1];
function issueInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    snapshotKey: 'snap-main',
    dataSubjectId: owner,
    threadBoundary: 'thread-1',
    purpose: PURPOSE,
    allowedDataClass: 'dimension_label',
    consentRevision: 1,
    privacyEpoch: 1,
    sourceType: 'model_summary',
    sourceEntityId: 'src-1',
    immutableSourceVersion: 'v1',
    eventSeqStart: 1,
    eventSeqEnd: 5,
    normalizationRecipeVersion: 'norm-v1',
    sourceText: SRC_TEXT,
    policyVersion: 'memory-policy-v1',
    ...overrides,
  };
}

type Candidate = Parameters<typeof admitMemoryRecord>[1];
function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    snapshotKey: 'snap-main',
    sourceText: SRC_TEXT,
    sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: SRC_BYTES },
    producerClass: 'summarizer',
    extractionConfidence: 0.9,
    salience: 1.0,
    language: 'zh-CN',
    contentDigest: CONTENT_DIGEST,
    ...overrides,
  };
}

type MatInput = Parameters<typeof materializeAdjudicationFact>[1];
function matInput(overrides: Partial<MatInput> = {}): MatInput {
  return {
    admissionRecordId: '00000000-0000-0000-0000-000000000000',
    content: CONTENT,
    namespace: NAMESPACE,
    cardinality: SINGLE,
    subject: SUBJECT,
    validUntil: null,
    ...overrides,
  };
}

const issue = (userId: string, input: IssueInput) => asAdmissionIssuer(userId, (c) => issueMemoryAdmissionSnapshot(c, input));
const admit = (userId: string, cand: Candidate) => asPrincipal(admin, userId, (c) => admitMemoryRecord(c, cand));
const materialize = (userId: string, input: MatInput) => asPrincipal(admin, userId, (c) => materializeAdjudicationFact(c, input));
const confirm = (userId: string, factId: string, confirmation: 'user_confirmation' | 'business_fact') =>
  asPrincipal(admin, userId, (c) => confirmAdjudicationFact(c, factId, confirmation));
const correct = (userId: string, factId: string, content: string, validUntil?: string | null, idem?: string) =>
  asPrincipal(admin, userId, (c) => correctAdjudicationFact(c, factId, content, validUntil, idem));
const revoke = (userId: string, factId: string) => asPrincipal(admin, userId, (c) => revokeAdjudicationFact(c, factId));
const expire = (userId: string, purpose?: string) => asPrincipal(admin, userId, (c) => expireAdjudicationFacts(c, purpose as never));

type FactRow = {
  id: string; status: string; fact_key: string; cardinality: string; namespace: string;
  source_trust: string; extraction_confidence: number | null; user_confirmation: string;
  valid_until: string | null; salience: number; retrieval_score: number | null; source_type: string;
};
const factRow = async (id: string): Promise<FactRow | undefined> =>
  (await admin.query<FactRow>(
    'SELECT id,status,fact_key,cardinality,namespace,source_trust,extraction_confidence,user_confirmation,valid_until,salience,retrieval_score,source_type FROM memory_fact_adjudication WHERE id=$1', [id])).rows[0];

const activeCount = async (factKey: string) =>
  Number((await admin.query('SELECT count(*)::int AS n FROM memory_fact_adjudication WHERE owner_user_id=$1 AND fact_key=$2 AND status=$3', [owner, factKey, 'active'])).rows[0]!.n);

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);
  await asPrincipal(admin, owner, (c) =>
    c.query('SELECT * FROM memory_grant_consent($1, $2)', [PURPOSE, 'memory-policy-v1']));

  /* ── A. 契约 + 域：factKey 派生 / subject 归一化 / 六分量守护 / 范围字段拒绝 ───── */
  A('契约: MemoryFactMaterializeInput.parse 通过(字段形状冻结)',
    MemoryFactMaterializeInput.parse(matInput()).namespace === NAMESPACE);
  const scopeFieldCases: ReadonlyArray<readonly [string, string]> = [
    ['factKey', 'fk'], ['owner', 'x'], ['purpose', 'career'], ['scope', 'c_personal'], ['controllerScope', 'b_tenant'],
  ];
  for (const [k, v] of scopeFieldCases) {
    A(`契约: 客户端传 ${k} 被 .strict 拒绝(禁止传任意 factKey/owner/purpose/scope)`,
      !MemoryFactMaterializeInput.safeParse({ ...matInput(), [k]: v }).success);
  }
  A('域: normalizeFactSubject NFKC+trim+lower(全角/大小写折叠收敛)',
    normalizeFactSubject('  Current Level  ') === 'current level'
    && normalizeFactSubject('全角１２３') === '全角123');
  A('域: normalizeFactSubject 拒绝 control/换行(注入/日志注水)',
    throwsSync(() => normalizeFactSubject('a\nb')) && throwsSync(() => normalizeFactSubject('a\tb')));
  A('域: normalizeFactSubject 拒绝超长(>200)',
    throwsSync(() => normalizeFactSubject('x'.repeat(201))));
  A('域: deriveMemoryFactKey 确定性(同一组件恒同一 64-hex key)',
    deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: 'Current Level' })
    === deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: '  current level  ' })
    && /^[a-f0-9]{64}$/.test(deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: SUBJECT })));
  A('域: deriveMemoryFactKey 拒绝非 c_personal 范围',
    throwsSync(() => deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: SUBJECT, controllerScope: 'b_tenant' })));
  A('域: deriveMemoryFactKey 拒绝非法 namespace',
    throwsSync(() => deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: 'bogus' as never, subject: SUBJECT })));
  A('六分量: assertFactAdjudicationSeparation 拒绝非空 retrievalScore',
    throwsSync(() => assertFactAdjudicationSeparation({ retrievalScore: 0.9 })));
  A('六分量: assertFactAdjudicationSeparation 拒绝非法 userConfirmation',
    throwsSync(() => assertFactAdjudicationSeparation({ userConfirmation: 'auto' as never })));
  A('内容护栏: assertMemoryFactContentSafe 通过派生摘要(非 PII)',
    !throwsSync(() => assertMemoryFactContentSafe(CONTENT)));

  /* ── B. 物化：candidate 恒产 + 硬校验 fail-closed ─────────────────────────── */
  const issued = await issue(owner, issueInput());
  const adm = await admit(owner, candidate());
  A('物化: 无 principal 拒绝(fail-closed)',
    await withoutPrincipal('app_role', (c) => materializeAdjudicationFact(c, matInput({ admissionRecordId: adm.id }))));
  A('物化: 跨 owner 拿他人 admission 拒绝(not_found fail-closed，不泄存在性)',
    await rejects(() => materialize(otherOwner, matInput({ admissionRecordId: adm.id }))));
  A('物化: content 被篡改(digest 与准入 content_digest 不符)拒绝(data fence)',
    await rejects(() => materialize(owner, matInput({ admissionRecordId: adm.id, content: '被篡改的内容' }))));
  A('物化: 非法 namespace 拒绝',
    await rejects(() => materialize(owner, matInput({ admissionRecordId: adm.id, namespace: 'bogus' as never }))));
  A('物化: 非法 cardinality 拒绝',
    await rejects(() => materialize(owner, matInput({ admissionRecordId: adm.id, cardinality: 'many' as never }))));

  const expectedKey = deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: SUBJECT });
  const mat = await materialize(owner, matInput({ admissionRecordId: adm.id, idempotencyKey: 'mat-main' }));
  A('物化: 恒产 candidate(status=candidate, 模型只能写 candidate，无直接 active 写路径)',
    mat.status === 'candidate' && mat.userConfirmation === 'unconfirmed' && mat.retrievalScore === null);
  A('物化: fact_key 服务端派生(TS==SQL 逐字节一致，客户端无字段可传)',
    mat.factKey === expectedKey && mat.factKey.length === 64);
  A('物化: source_trust 从准入复制(model_summary → untrusted)，与 confidence 独立',
    mat.sourceTrust === 'untrusted');
  const matReplay = await materialize(owner, matInput({ admissionRecordId: adm.id, idempotencyKey: 'mat-main' }));
  A('物化: 同 idempotency_key 重放返回既有行(created=false, 同 id)',
    matReplay.created === false && matReplay.id === mat.id);
  const matReplay2 = await materialize(owner, matInput({ admissionRecordId: adm.id }));
  A('物化: 同 admission_record_id 重复物化幂等(候选唯一，不双写)',
    matReplay2.created === false && matReplay2.id === mat.id);

  /* ── C. 六分量分离（SQL 侧独立列，绝不合并单一总分）──────────────────────── */
  const cols = (await admin.query('SELECT column_name FROM information_schema.columns WHERE table_name=$1', ['memory_fact_adjudication']))
    .rows.map((r) => (r as { column_name: string }).column_name);
  A('六分量: 六列独立存在(source_trust/extraction_confidence/user_confirmation/valid_until/salience/retrieval_score)',
    ['source_trust', 'extraction_confidence', 'user_confirmation', 'valid_until', 'salience', 'retrieval_score'].every((n) => cols.includes(n)));
  A('六分量: 无单一总分列(无 total_score/score 合并列)',
    !cols.includes('total_score') && !cols.includes('score'));
  const matRow = await factRow(mat.id);
  A('六分量: 物化后 retrieval_score 恒 NULL(裁决期绝不回填) + source_trust 与 confidence 独立落列',
    matRow?.retrieval_score === null && matRow.source_trust === 'untrusted'
    && Math.abs((matRow.extraction_confidence ?? -1) - 0.9) < 1e-6);

  /* ── D. 状态机：仅用户确认或受信业务事实激活；过期/非法跃迁拒绝 ─────────────── */
  A('状态机: 模型候选走 business_fact 路径被拒(模型候选不可直接 active)',
    await rejects(() => confirm(owner, mat.id, 'business_fact')));
  A('状态机: confirm(非 candidate 之外的非法输入)确认证据枚举拒绝',
    await rejects(() => confirm(owner, mat.id, 'bogus' as never)));
  const expiredMat = await (async () => {
    const snap = await issue(owner, issueInput({ snapshotKey: 'snap-exp', sourceEntityId: 'src-exp' }));
    const admE = await admit(owner, candidate({ snapshotKey: 'snap-exp', idempotencyKey: 'admit-exp' }));
    return materialize(owner, matInput({ admissionRecordId: admE.id, validUntil: new Date(Date.now() - 60_000).toISOString(), idempotencyKey: 'mat-exp' }));
  })();
  A('状态机: 过期候选(valid_until 已过)confirm 被拒(过期不得 active)',
    await rejects(() => confirm(owner, expiredMat.id, 'user_confirmation')));

  const conf = await confirm(owner, mat.id, 'user_confirmation');
  A('状态机: confirm(candidate→active) 用户确认路径成功(user_confirmed + 无 supersede)',
    conf !== null && conf.status === 'active' && conf.userConfirmation === 'user_confirmed' && conf.supersededFactId === null);
  A('状态机: confirm(已 active)返回 null(非法跃迁拒绝，不重复激活)',
    (await confirm(owner, mat.id, 'user_confirmation')) === null);
  A('状态机: revoke(candidate)返回 null(revoke 仅 active)',
    (await revoke(owner, expiredMat.id)) === null);
  A('状态机: correct(candidate)返回 null(correct 仅 active)',
    (await correct(owner, expiredMat.id, CONTENT_V2)) === null);

  /* ── E. contradicts/supersedes 可追溯边（非布尔列；旧事实不删）──────────────── */
  await issue(owner, issueInput({ snapshotKey: 'snap-sup-b', sourceEntityId: 'src-sup-b' }));
  const admB = await admit(owner, candidate({ snapshotKey: 'snap-sup-b', contentDigest: CONTENT_V2_DIGEST, idempotencyKey: 'admit-sup-b' }));
  const matB = await materialize(owner, matInput({ admissionRecordId: admB.id, content: CONTENT_V2, idempotencyKey: 'mat-sup-b' }));
  const confB = await confirm(owner, matB.id, 'user_confirmation');
  A('关系: confirm 同 fact_key 新候选 → 旧 active 被 superseded + 新 active(supersedes 边)',
    confB !== null && confB.supersededFactId === mat.id && confB.status === 'active');
  const oldAfterSupersede = await factRow(mat.id);
  A('关系: 旧事实不删，保留审计链(status 由 active → superseded)',
    oldAfterSupersede?.status === 'superseded');
  const supEdge = await admin.query(
    'SELECT relationship, reason FROM memory_fact_relationship WHERE from_fact_id=$1 AND to_fact_id=$2', [matB.id, mat.id]);
  A('关系: supersedes 是显式边(new--supersedes-->old)，非布尔列',
    supEdge.rows.length === 1 && supEdge.rows[0]!.relationship === 'supersedes' && supEdge.rows[0]!.reason === 'newer_confirmed');

  const corr = await correct(owner, matB.id, '派生摘要：当前职级为架构师', null, 'corr-1');
  A('关系: correct(active→contradicted + 新 active) 纠正路径成功',
    corr !== null && corr.contradictedFactId === matB.id && corr.status === 'active');
  const correctedOld = await factRow(matB.id);
  const correctedNew = await factRow(corr!.id);
  A('关系: 被纠正旧事实 status=contradicted + 新事实 active(source=user_confirmation/trusted，无模型抽取)',
    correctedOld?.status === 'contradicted'
    && correctedNew?.status === 'active'
    && correctedNew.source_type === 'user_confirmation'
    && correctedNew.source_trust === 'trusted'
    && correctedNew.extraction_confidence === null
    && correctedNew.user_confirmation === 'user_confirmed');
  const corrEdge = await admin.query(
    'SELECT relationship, reason FROM memory_fact_relationship WHERE from_fact_id=$1 AND to_fact_id=$2', [corr!.id, matB.id]);
  A('关系: contradicts 是显式边(new--contradicts-->old)，非布尔列',
    corrEdge.rows.length === 1 && corrEdge.rows[0]!.relationship === 'contradicts' && corrEdge.rows[0]!.reason === 'user_correction');

  /* ── F. 100 并发 confirm/correct/revoke → 单值至多一个 active ───────────────── */
  // F1: 100 个不同来源（同 subject）候选 → 100 并发 confirm → 恰好 1 active、99 superseded。
  // 用独立 subject='race_level'（独立 fact_key），使断言不受前文 D/E 段同 key 既有事实干扰。
  const raceKey = deriveMemoryFactKey({ owner, purpose: PURPOSE, namespace: NAMESPACE, subject: 'race_level' });
  const raceIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    await issue(owner, issueInput({ snapshotKey: `snap-race-${i}`, sourceEntityId: `src-race-${i}` }));
    const admR = await admit(owner, candidate({ snapshotKey: `snap-race-${i}`, idempotencyKey: `admit-race-${i}` }));
    const matR = await materialize(owner, matInput({ admissionRecordId: admR.id, subject: 'race_level', idempotencyKey: `mat-race-${i}` }));
    raceIds.push(matR.id);
  }
  const confirmRace = await Promise.all(raceIds.map((id) =>
    asPrincipal(concurrent, owner, (c) => confirmAdjudicationFact(c, id, 'user_confirmation'))));
  const activeN = await activeCount(raceKey);
  const supersededN = Number((await admin.query(
    'SELECT count(*)::int AS n FROM memory_fact_adjudication WHERE owner_user_id=$1 AND fact_key=$2 AND status=$3', [owner, raceKey, 'superseded'])).rows[0]!.n);
  A('100 并发 confirm → 单值至多一个 active(1 active + 99 superseded，partial unique index + advisory 锁)',
    activeN === 1 && supersededN === 99 && confirmRace.every((r) => r !== null));

  // F2: 单值多值对照——100 并发确认多值事实（同 namespace/subject）不互斥，可多 active。
  const multiIds: string[] = [];
  for (let i = 0; i < 20; i++) {
    await issue(owner, issueInput({ snapshotKey: `snap-multi-${i}`, sourceEntityId: `src-multi-${i}` }));
    const admM = await admit(owner, candidate({ snapshotKey: `snap-multi-${i}`, contentDigest: memoryContentDigest(`派生摘要：掌握技能${i}`), idempotencyKey: `admit-multi-${i}` }));
    const matM = await materialize(owner, matInput({
      admissionRecordId: admM.id, content: `派生摘要：掌握技能${i}`,
      namespace: 'skill', cardinality: MULTI, subject: `skill_${i}`, idempotencyKey: `mat-multi-${i}`,
    }));
    multiIds.push(matM.id);
  }
  await Promise.all(multiIds.map((id) => asPrincipal(concurrent, owner, (c) => confirmAdjudicationFact(c, id, 'user_confirmation'))));
  const multiActiveN = Number((await admin.query(
    'SELECT count(*)::int AS n FROM memory_fact_adjudication WHERE owner_user_id=$1 AND cardinality=$2 AND status=$3', [owner, MULTI, 'active'])).rows[0]!.n);
  A('多值对照: 多值事实可多 active(20 个技能全部 active，不受单值唯一约束)',
    multiActiveN === 20);

  // F3: 100 并发 revoke 同一 active → 恰好 1 个赢家（CAS active→revoked）。
  await issue(owner, issueInput({ snapshotKey: 'snap-revoke-race', sourceEntityId: 'src-revoke-race' }));
  const admRv = await admit(owner, candidate({ snapshotKey: 'snap-revoke-race', idempotencyKey: 'admit-revoke-race' }));
  const matRv = await materialize(owner, matInput({ admissionRecordId: admRv.id, idempotencyKey: 'mat-revoke-race' }));
  await confirm(owner, matRv.id, 'user_confirmation');
  const revokeRace = await Promise.all(Array.from({ length: 100 }, () =>
    asPrincipal(concurrent, owner, (c) => revokeAdjudicationFact(c, matRv.id))));
  const revokedWins = revokeRace.filter((r) => r !== null).length;
  const rvRow = await factRow(matRv.id);
  A('100 并发 revoke → CAS 恰好 1 个赢家(1 revoked，其余陈旧落败 null)',
    revokedWins === 1 && rvRow?.status === 'revoked');

  // F4: 100 并发 correct 同一 active → 恰好 1 个赢家（CAS active→contradicted + 1 新 active）。
  await issue(owner, issueInput({ snapshotKey: 'snap-correct-race', sourceEntityId: 'src-correct-race' }));
  const admCr = await admit(owner, candidate({ snapshotKey: 'snap-correct-race', idempotencyKey: 'admit-correct-race' }));
  const matCr = await materialize(owner, matInput({ admissionRecordId: admCr.id, idempotencyKey: 'mat-correct-race' }));
  await confirm(owner, matCr.id, 'user_confirmation');
  const correctRace = await Promise.all(Array.from({ length: 100 }, () =>
    asPrincipal(concurrent, owner, (c) => correctAdjudicationFact(c, matCr.id, CONTENT_V2))));
  const correctWins = correctRace.filter((r) => r !== null).length;
  const crOld = await factRow(matCr.id);
  const crActiveN = await activeCount(expectedKey);
  A('100 并发 correct → CAS 恰好 1 个赢家(旧事实 contradicted + 1 个新 active，其余陈旧落败 null)',
    correctWins === 1 && crOld?.status === 'contradicted' && crActiveN === 1);

  /* ── G. 过期 sweep + RLS 跨 owner=0 + app_role 无原始表读写 ────────────────── */
  await issue(owner, issueInput({ snapshotKey: 'snap-sweep', sourceEntityId: 'src-sweep' }));
  const admSw = await admit(owner, candidate({ snapshotKey: 'snap-sweep', idempotencyKey: 'admit-sweep' }));
  const matSw = await materialize(owner, matInput({ admissionRecordId: admSw.id, validUntil: new Date(Date.now() + 5_000).toISOString(), idempotencyKey: 'mat-sweep' }));
  await confirm(owner, matSw.id, 'user_confirmation');
  const swBefore = await factRow(matSw.id);
  // 强制把 valid_until 拨到过去，再跑 sweep。
  await admin.query('UPDATE memory_fact_adjudication SET valid_until = now() - interval \'1 second\' WHERE id=$1', [matSw.id]);
  const swept = await expire(owner, PURPOSE);
  const swAfter = await factRow(matSw.id);
  A('过期 sweep: active→expired 自动非 active(valid_until 到期)',
    swBefore?.status === 'active' && swept === 1 && swAfter?.status === 'expired');

  A('RLS 跨 owner=0: otherOwner confirm 拿不到 owner 的 fact(not_found fail-closed)',
    await rejects(() => confirm(otherOwner, mat.id, 'user_confirmation')));
  A('RLS 跨 owner=0: otherOwner revoke 拿不到 owner 的 fact(空结果 fail-closed)',
    (await revoke(otherOwner, mat.id)) === null);
  A('RLS 跨 owner=0: otherOwner correct 拿不到 owner 的 fact(not_found fail-closed，不泄存在性)',
    await rejects(() => correct(otherOwner, mat.id, CONTENT_V2)));
  A('app_role 无 memory_fact_adjudication 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_fact_adjudication'))));
  A('app_role 无 memory_fact_relationship 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_fact_relationship'))));

  /* ── H. 审计：每次转移落有序事件 ─────────────────────────────────────────── */
  const auditKinds = (await admin.query<{ kind: string }>(
    'SELECT kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq', [owner, `memfactadj:${mat.id}`]))
    .rows.map((r) => r.kind);
  A('审计: 物化→确认 全走有序事件日志(kind 含 materialize + confirm)',
    auditKinds.includes('materialize') && auditKinds.includes('confirm') && auditKinds[0] === 'materialize');

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 记忆事实裁决(MEM-13) DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  await admin.end().catch(() => undefined);
  process.exit(1);
});
