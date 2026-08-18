/**
 * 记忆准入元标签门（MEM-12）DB 证明。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移 + nonce 校验）。证明：
 *   - 契约先行：MemoryAdmissionCandidate 是 .strict()，客户端传 owner/purpose/project/factKey/
 *     scope/sourceId 一律被拒（服务端不采信范围字段）
 *   - spanLocator 单一坐标系：offsetKind 固定 'utf8_byte'，code-point/UTF-16 一律拒绝；
 *     UTF-8 字节长度与 JS UTF-16 下标差异是承重点（中文/emoji 多字节下必然错位）
 *   - 三身份由服务端授权快照派生：accessPrincipalContext=app.principal_user；controllerScope 固定
 *     c_personal（无参数可传）；dataSubject 显式声明 + 交叉校验（==principal + 真实账户），伪造/
 *     C-B 混用/无 principal → 0 写入
 *   - 完整元标签集 + 服务端 fail-closed 校验（缺字段/伪造/越界 = RAISE，零写入）
 *   - Unicode（中文/emoji/NFC/NFD）span 越界 / digest 不符 → 0 写入
 *   - 六分量分离：retrievalScore 准入期恒 NULL（不可覆盖 sourceTrust）；status 恒 candidate
 *     （模型输出不可升 active）；sourceTrust/verificationState 服务端派生
 *   - 幂等重放 + app_role 无原始表读 + 持久有序审计事件
 */
import {
  createPool, asPrincipal, assertIsolatedTestTarget,
  issueMemoryAdmissionSnapshot, admitMemoryRecord, type Client,
} from '@meetwise/db';
import {
  utf8ByteLength, canonicalAdmissionSpan, assertAdmissionTrustSeparation,
  deriveAdmissionSourceTrust, memoryContentDigest,
} from '@meetwise/domain';
import { MemoryAdmissionCandidate, MemoryAdmissionSpanLocator } from '@meetwise/contracts';

const admin = createPool();
const owner = `memadm-owner-${process.pid}`;
const otherOwner = `memadm-other-${process.pid}`;

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const rejects = async (fn: () => Promise<unknown>) => { try { await fn(); return false; } catch { return true; } };
const throwsSync = (fn: () => unknown) => { try { fn(); return false; } catch { return true; } };

// 中文 + emoji 来源工件：UTF-8 字节数远大于 JS UTF-16 下标（BMP 3 字节 / astral 4 字节）。
const SRC_TEXT = '面试：分布式锁🔒租约续期';
const SRC_BYTES = utf8ByteLength(SRC_TEXT);
// NFC（预组合 é, 2 字节）与 NFD（e+组合重音, 3 字节）：视觉相同、字节不同 → digest/长度必然不符。
const SRC_PRECOMPOSED = 'é';       // é
const SRC_DECOMPOSED = 'é';      // e + combining acute

const CONTENT_DIGEST = memoryContentDigest('派生摘要：分布式锁的租约续期需强化');

/** 服务端签发器专用 principal（SET LOCAL ROLE memory_admission_issuer + 绑定 owner GUC）。
 *  模拟未来 application service 的 issuer seam；生产由独立 provisioning + 启动门禁接线。 */
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
    [userId, `${userId}@memadm.test`, 'scrypt$salt$dk'],
  );
}

type IssueInput = Parameters<typeof issueMemoryAdmissionSnapshot>[1];
function issueInput(overrides: Partial<IssueInput> = {}): IssueInput {
  return {
    snapshotKey: 'snap-main',
    dataSubjectId: owner,
    threadBoundary: 'thread-1',
    purpose: 'interview_prep',
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

type Candidate = MemoryAdmissionCandidate;
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

const issue = (userId: string, input: IssueInput) =>
  asAdmissionIssuer(userId, (c) => issueMemoryAdmissionSnapshot(c, input));
const admit = (userId: string, cand: Candidate) =>
  asPrincipal(admin, userId, (c) => admitMemoryRecord(c, cand));

async function main() {
  await assertIsolatedTestTarget(admin);
  await insertAccount(owner);
  await insertAccount(otherOwner);
  // HIGH-1 前置：owner 授予 interview_prep 同意（revision=1/epoch=1）。memory_issue_admission_snapshot
  // 现在对照 memory_consent 做 granted + revision/epoch 匹配的 cross-check（无同意不采集），故签发
  // 快照前必须先有 granted consent，否则所有 issuer 正向用例都会 fail-closed。
  await asPrincipal(admin, owner, (c) =>
    c.query('SELECT * FROM memory_grant_consent($1, $2)', ['interview_prep', 'memory-policy-v1']));

  /* ── A. 契约 + 域：范围字段拒绝 / span 单一坐标系 / 六分量守护 ──────────── */
  A('契约: MemoryAdmissionCandidate.parse 通过(字段形状冻结)',
    MemoryAdmissionCandidate.parse(candidate()).snapshotKey === 'snap-main');
  const scopeFieldCases: ReadonlyArray<readonly [string, string]> = [
    ['owner', 'x'], ['purpose', 'career'], ['project', 'p1'], ['projectId', 'p1'],
    ['factKey', 'fk'], ['scope', 'c_personal'], ['sourceId', 's1'], ['controllerScope', 'b_tenant'],
  ];
  for (const [k, v] of scopeFieldCases) {
    A(`契约: 客户端传范围字段 ${k} 被 .strict 拒绝`,
      !MemoryAdmissionCandidate.safeParse({ ...candidate(), [k]: v }).success);
  }
  A('span 坐标系: offsetKind=unicode_codepoint 被契约拒绝',
    !MemoryAdmissionSpanLocator.safeParse({ offsetKind: 'unicode_codepoint', start: 0, end: 5 }).success);
  A('span 坐标系: canonicalAdmissionSpan 拒绝非 utf8_byte(含 code-point/UTF-16)',
    throwsSync(() => canonicalAdmissionSpan({ offsetKind: 'unicode_codepoint' as never, start: 0, end: 5 })));
  A('span 坐标系: canonicalAdmissionSpan 拒绝 start>end',
    throwsSync(() => canonicalAdmissionSpan({ offsetKind: 'utf8_byte', start: 5, end: 0 })));
  A(`span 坐标系: 中文+emoji 来源 UTF-8 字节(${SRC_BYTES}) > JS UTF-16 下标(${SRC_TEXT.length})(坐标系不可混用)`,
    SRC_BYTES > SRC_TEXT.length);
  A('六分量: assertAdmissionTrustSeparation 拒绝非空 retrievalScore',
    throwsSync(() => assertAdmissionTrustSeparation({ producerClass: 'summarizer', retrievalScore: 0.9 })));
  A('六分量: assertAdmissionTrustSeparation 拒绝 status=active(激活属 MEM-13)',
    throwsSync(() => assertAdmissionTrustSeparation({ producerClass: 'summarizer', status: 'active' })));
  A('六分量: assertAdmissionTrustSeparation 拒绝非法 producerClass',
    throwsSync(() => assertAdmissionTrustSeparation({ producerClass: 'evil_model' })));
  A('六分量: 合法 candidate(无 retrievalScore/status) 通过守护',
    !throwsSync(() => assertAdmissionTrustSeparation({ producerClass: 'summarizer' })));

  /* ── B. 签发器：三身份服务端派生 + 伪造 → 0 ─────────────────────────────── */
  A('issuer: 无 principal 拒绝(fail-closed)',
    await withoutPrincipal('memory_admission_issuer', (c) => issueMemoryAdmissionSnapshot(c, issueInput())));
  A('issuer: dataSubject != principal(伪造 subject/C-B 混用)拒绝',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-b1', dataSubjectId: otherOwner }))));
  A('issuer: dataSubject 非真实账户拒绝',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-b2', dataSubjectId: 'ghost-user' }))));
  A('issuer: 非法 purpose 拒绝',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-b3', purpose: 'bogus' as never }))));
  A('issuer: 越界 event_seq(负数/end<start)拒绝',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-b4', eventSeqStart: 0, eventSeqEnd: 5 }))));

  const issued = await issue(owner, issueInput());
  A('issuer: 派生三身份回吐(controllerScope 固定 c_personal / accessPrincipal=principal / subject=principal)',
    issued.controllerScope === 'c_personal' && issued.accessPrincipalUserId === owner && issued.dataSubjectId === owner);
  A('issuer: source_artifact_digest 与 sourceUtf8ByteLength 由服务端重算(与 TS utf8ByteLength 一致)',
    issued.sourceUtf8ByteLength === SRC_BYTES && issued.sourceArtifactDigest.length === 64);
  A('issuer: source_trust 由 source_type 派生(model_summary → untrusted)',
    issued.sourceTrust === 'untrusted' && deriveAdmissionSourceTrust('model_summary') === 'untrusted');
  A('issuer: 伪造 consent_revision=9999(无匹配 granted consent)拒绝(fail-closed 零写入)',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-c1', consentRevision: 9999 }))));
  A('issuer: 伪造 privacy_epoch=9999(无匹配 granted consent)拒绝(fail-closed 零写入)',
    await rejects(() => issue(owner, issueInput({ snapshotKey: 'snap-c2', privacyEpoch: 9999 }))));
  A('issuer: 重复 snapshot_key 拒绝(快照键幂等冲突)',
    await rejects(() => issue(owner, issueInput())));
  A('issuer: app_role 无签发权限(EXECUTE 仅授 memory_admission_issuer)',
    await rejects(() => asPrincipal(admin, owner, (c) => issueMemoryAdmissionSnapshot(c, issueInput({ snapshotKey: 'snap-b5' })))));

  const issuedBiz = await issue(owner, issueInput({ snapshotKey: 'snap-biz', sourceType: 'business_fact', sourceEntityId: 'src-biz' }));
  A('issuer: business_fact → source_trust=trusted(来源可信层只由 source 类型决定)',
    issuedBiz.sourceTrust === 'trusted' && deriveAdmissionSourceTrust('business_fact') === 'trusted');

  /* ── C. 准入：无 principal / 伪造快照 / 伪造 owner / 越权 ─────────────────── */
  A('admit: 无 principal 拒绝(fail-closed)',
    await withoutPrincipal('app_role', (c) => admitMemoryRecord(c, candidate())));
  A('admit: 伪造/不存在 snapshot_key 拒绝',
    await rejects(() => admit(owner, candidate({ snapshotKey: 'snap-ghost' }))));
  A('admit: otherOwner 拿 owner 快照准入拒绝(owner_mismatch + RLS)',
    await rejects(() => admit(otherOwner, candidate())));

  /* ── D. Unicode（中文/emoji/NFC/NFD）span / digest 不符 → 0 ───────────────── */
  const r1 = await admit(owner, candidate());
  A('admit: 合法 candidate 落 candidate 且 created=true', r1.created === true && r1.status === 'candidate');
  A('admit: span 越界(end > UTF-8 字节长度)拒绝',
    await rejects(() => admit(owner, candidate({ sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: SRC_BYTES + 1 } }))));
  A('admit: span 负 start 拒绝',
    await rejects(() => admit(owner, candidate({ sourceSpan: { offsetKind: 'utf8_byte', start: -1, end: SRC_BYTES } }))));
  A('admit: SQL 侧拒绝 offsetKind=unicode_codepoint(绕过契约直击函数)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query(
      'SELECT * FROM memory_admit_record($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      ['snap-main', SRC_TEXT, JSON.stringify({ offsetKind: 'unicode_codepoint', start: 0, end: SRC_BYTES }),
       'summarizer', 0.9, 1.0, 'zh-CN', CONTENT_DIGEST, null]))));
  A('admit: 来源内容被篡改(不同 sourceText)致 digest 不符拒绝',
    await rejects(() => admit(owner, candidate({ sourceText: '别的来源内容' }))));
  // NFC vs NFD：签发 NFD(3 字节)，准入 NFC(2 字节)——视觉相同、字节不同 → digest/长度不符。
  await issue(owner, issueInput({ snapshotKey: 'snap-nfc', sourceText: SRC_DECOMPOSED, sourceEntityId: 'src-nfc' }));
  A('admit: NFC↔NFD 字节漂移(签发 NFD 准入 NFC)致 digest 不符拒绝',
    await rejects(() => admit(owner, candidate({ snapshotKey: 'snap-nfc', sourceText: SRC_PRECOMPOSED,
      sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: utf8ByteLength(SRC_PRECOMPOSED) } }))));
  // 过期快照：签发即过期 → 准入拒绝。
  await issue(owner, issueInput({ snapshotKey: 'snap-expired', expiresAt: new Date(Date.now() - 60_000).toISOString(), sourceEntityId: 'src-exp' }));
  A('admit: 过期快照拒绝(snapshot_expired)',
    await rejects(() => admit(owner, candidate({ snapshotKey: 'snap-expired' }))));

  /* ── E. 六分量分离 + 派生（SQL 侧）────────────────────────────────────── */
  A('六分量: 准入期 retrievalScore 恒 NULL(不可覆盖 sourceTrust)',
    r1.retrievalScore === null);
  A('六分量: status 恒 candidate(模型输出不可升 active)',
    r1.status === 'candidate' && r1.sourceTrust === 'untrusted');
  A('六分量: verificationState 准入期钉死 unverified(客户端 producerClass 不可自动升 trusted)',
    r1.verificationState === 'unverified');
  const rBiz = await admit(owner, candidate({ snapshotKey: 'snap-biz', producerClass: 'business_validator', sourceText: SRC_TEXT, sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: SRC_BYTES }, idempotencyKey: 'idem-biz' }));
  A('六分量: 客户端 producerClass=business_validator 仍得 unverified(business_verified 只由 MEM-13 证据路径授予)',
    rBiz.sourceTrust === 'trusted' && rBiz.verificationState === 'unverified' && rBiz.status === 'candidate');
  // source_type=user_confirmation 与 producerClass=user 是旧实现里唯一能升 user_confirmed 的两条路径；
  // 新实现钉死 unverified，此处逐条对抗验证「客户端自报不能升 trusted」。
  await issue(owner, issueInput({ snapshotKey: 'snap-confirm', sourceType: 'user_confirmation', sourceEntityId: 'src-confirm' }));
  const rConfirm = await admit(owner, candidate({ snapshotKey: 'snap-confirm', sourceText: SRC_TEXT, sourceSpan: { offsetKind: 'utf8_byte', start: 0, end: SRC_BYTES }, producerClass: 'summarizer' }));
  A('六分量: source_type=user_confirmation 仍得 unverified(user_confirmed 只由 MEM-13 证据路径授予)',
    rConfirm.sourceTrust === 'trusted' && rConfirm.verificationState === 'unverified');
  const rUser = await admit(owner, candidate({ snapshotKey: 'snap-main', producerClass: 'user', idempotencyKey: 'idem-user' }));
  A('六分量: 客户端 producerClass=user 仍得 unverified(user_confirmed 只由 MEM-13 证据路径授予)',
    rUser.verificationState === 'unverified');
  A('六分量: fact_key 服务端派生(scope+subject+purpose+source 身份，客户端无字段可传)',
    r1.factKey === 'c_personal:' + owner + ':interview_prep:model_summary:src-1');

  /* ── F. 幂等重放 ─────────────────────────────────────────────────────── */
  const r1replay = await admit(owner, candidate({ idempotencyKey: 'idem-main' }));
  const r1replay2 = await admit(owner, candidate({ idempotencyKey: 'idem-main' }));
  A('幂等: 同 idempotency_key 重放返回既有行(created=false, 同 id)',
    r1replay.created === true && r1replay2.created === false && r1replay2.id === r1replay.id);

  /* ── F2. HIGH-1 admit 期二次复验：签发快照 → 撤回同意 → 再 admit → 被拒 ───── */
  // 关键对抗缺口：签发时刻 consent 仍 granted（revision/epoch 与快照一致），撤回后快照里仍是旧
  // revision/epoch；memory_admit_record 必须回查 live consent 而不是原样落列，否则「签发后撤回
  // 仍 admit」不被拦截。此路径现 52 断言未覆盖（只测了签发期伪造 epoch 拒绝，没测签发后撤回）。
  await issue(owner, issueInput({ snapshotKey: 'snap-revoke' }));
  await asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_revoke_consent($1)', ['interview_prep']));
  A('admit: 签发快照后撤回同意，再 admit 被拒(HIGH-1 无同意不采集在准入边界闭合)',
    await rejects(() => admit(owner, candidate({ snapshotKey: 'snap-revoke' }))));

  /* ── G. app_role 无原始表读 + 持久有序审计 ─────────────────────────────── */
  A('app_role 无 memory_admission_record 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_admission_record'))));
  A('app_role 无 memory_admission_authorization 原始 SELECT(表级 REVOKE)',
    await rejects(() => asPrincipal(admin, owner, (c) => c.query('SELECT * FROM memory_admission_authorization'))));
  const auditRows = await admin.query<{ seq: string; kind: string }>(
    'SELECT seq, kind FROM memory_audit_event WHERE owner_user_id=$1 AND stream_key=$2 ORDER BY seq',
    [owner, `memadmit:${r1.id}`],
  );
  A('审计: 准入走 memory_append_audit 落有序事件(seq=1, kind=admit)',
    auditRows.rows.length === 1 && Number(auditRows.rows[0]!.seq) === 1 && auditRows.rows[0]!.kind === 'admit');

  /* ── H. 字面 C/B 混用：CHECK 结构封死（admin 是 superuser 绕过 RLS，仅 CHECK 触发）───── */
  A('C/B 混用: 直接 INSERT controller_scope=b_tenant 被 CHECK 拒绝(字面零写入)',
    await rejects(() => admin.query(
      `INSERT INTO memory_admission_record (
         access_principal_user_id, controller_scope, data_subject_type, data_subject_id,
         thread_boundary, fact_key, purpose, allowed_data_class,
         consent_revision, privacy_epoch, source_type, source_entity_id,
         immutable_source_version, source_artifact_digest, span_locator,
         normalization_recipe_version, producer_class, policy_version, content_digest,
         language, source_trust, extraction_confidence, verification_state
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)`,
      [owner, 'b_tenant', 'c_personal_user', owner, 'thread-1', 'cb-mix-key', 'interview_prep', 'dimension_label',
        1, 1, 'business_fact', 'src-cb', 'v1', 'a'.repeat(64),
        JSON.stringify({ offsetKind: 'utf8_byte', start: 0, end: 0 }),
        'norm-v1', 'summarizer', 'memory-policy-v1', 'b'.repeat(64),
        'zh-CN', 'trusted', 0.9, 'unverified'])));

  await admin.end();
  console.log(failures === 0
    ? '\n✓ 记忆准入元标签门(MEM-12) DB 证明通过（本地隔离证据）'
    : `\n✗ ${failures} 个断言失败`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await admin.end().catch(() => undefined); process.exit(1); });
