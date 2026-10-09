/**
 * PRIV01-C wiring manifest — single source for the wiring-face machine checks.
 *
 * Consumed by:
 *   - tenant-enforcement.proof.ts  (P1 · R1 flip: face B consumption == manifest,
 *     file envelope + EXACT per-file count — no lower bounds, no silent absence)
 *   - tenant-wiring-e5.proof.ts    (P2 · E5 application-layer half: per-path required
 *     predicate + 0-row fail-closed witness + list-whitelist classification)
 *
 * Counting rule (must stay identical to the proof scan): occurrences of the five
 * tenant symbols (requireOwnerUserId|assertTenantPredicate|buildRequiredOwnerFilter|
 * enforceOwnerOnRow|TenantEnforcementError) PLUS import specifiers whose path contains
 * a `tenant` segment — comment-stripped, OUTSIDE pure re-export spans — per production
 * src file. `count` below is that exact machine number (import occurrences + call sites).
 *
 * R2 (PRIV01-B §4.1.1): the E5 application-layer half (own-id unexpected-empty-set
 * fail-closed rethrow) is proven by P2/P3 against THIS manifest. The E5 DB-layer half
 * (GUC unset → 0 rows default deny) belongs to PRIV01-A candidate A isolation prove.
 * Neither half may be read as "E5 fully proven" by the other.
 *
 * 应用层 tenant ≠ RLS — wiring is the defense-in-depth SECOND layer; the authorization
 * root remains PG RLS FORCE + asPrincipal + set_config('app.principal_user').
 */

export interface WiredPath {
  /** requireOwnerUserId/buildRequiredOwnerFilter context tag (unique, greppable). */
  ctx: string;
  /** E5 classification: single-id paths must fail closed on unexpected-empty sets;
   *  predicate-bind = α owner-predicate binding whose method-level E5 branch is
   *  witnessed by the sibling method-entry tag in the same file. */
  kind: 'single-id' | 'list-legal-empty' | 'entry' | 'predicate-bind';
  /** Textual witness in the same file for the E5 fail-closed branch (single-id only). */
  e5Witness?: string;
  /** Textual witness for the explicit owner predicate bound into statement shape (α). */
  predicateWitness?: string;
}

export interface WiredFile {
  /** Repo-relative production file (file = manifest envelope unit). */
  file: string;
  /** EXACT face B machine count for this file (import + call occurrences). */
  count: number;
  /** Semantic touchpoints registered under this envelope. */
  paths: WiredPath[];
}

export const WIRED_FILES: WiredFile[] = [
  {
    file: 'apps/api/src/modules/interview/interview.service.ts',
    count: 17,
    paths: [
      { ctx: 'interview.begin', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'interview.begin.quizScope', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'interview.begin.bind', kind: 'predicate-bind', predicateWitness: 'AND i.owner_user_id=$2' },
      { ctx: 'interview.turn', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'interview.submitPreviewAnswer', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'interview.submitPreview.issued', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$3' },
      { ctx: 'interview.speak', kind: 'single-id', e5Witness: 'guardInterviewPrivacy' },
      { ctx: 'interview.speakStreamPrepare', kind: 'single-id', e5Witness: 'guardInterviewPrivacy' },
      { ctx: 'interview.transcribe', kind: 'single-id', e5Witness: 'guardInterviewPrivacy' },
      { ctx: 'interview.questionFeedback', kind: 'single-id', e5Witness: 'guardInterviewPrivacy' },
      { ctx: 'interview.abandon', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'interview.create', kind: 'entry' },
      { ctx: 'interview.list', kind: 'list-legal-empty' },
      { ctx: 'interview.list.scope', kind: 'list-legal-empty', predicateWitness: 'i.owner_user_id=$1' },
      { ctx: 'interview.get', kind: 'single-id', e5Witness: 'guardInterviewPrivacy' },
    ],
  },
  {
    file: 'apps/api/src/modules/resume/resume.service.ts',
    count: 9,
    paths: [
      { ctx: 'resume.list', kind: 'list-legal-empty' },
      { ctx: 'resume.list.scope', kind: 'list-legal-empty', predicateWitness: 'WHERE r.owner_user_id=$1' },
      { ctx: 'resume.reparse', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'resume.reparse.existing', kind: 'predicate-bind', predicateWitness: 'r.owner_user_id=$2' },
      { ctx: 'resume.reparse.updateProfile', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'resume.reparse.updateStatus', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'resume.ocrConfirm.dedupe', kind: 'predicate-bind', predicateWitness: 'r.owner_user_id=$2' },
    ],
  },
  {
    file: 'apps/api/src/modules/quiz/quiz.service.ts',
    count: 9,
    paths: [
      { ctx: 'quiz.create', kind: 'entry' },
      { ctx: 'quiz.begin', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'quiz.begin.existingJob', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$1' },
      { ctx: 'quiz.begin.resume', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'quiz.begin.bind', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'quiz.abandon', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'quiz.abandon.cas', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
    ],
  },
  {
    file: 'apps/api/src/modules/diagnosis/diagnosis.service.ts',
    count: 9,
    paths: [
      { ctx: 'diagnosis.create', kind: 'entry' },
      { ctx: 'diagnosis.begin', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'diagnosis.begin.existingJob', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$1' },
      { ctx: 'diagnosis.begin.resume', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'diagnosis.begin.bind', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
      { ctx: 'diagnosis.abandon', kind: 'single-id', e5Witness: 'not_found_or_forbidden' },
      { ctx: 'diagnosis.abandon.cas', kind: 'predicate-bind', predicateWitness: 'owner_user_id=$2' },
    ],
  },
  {
    file: 'apps/api/src/modules/profile/profile.service.ts',
    count: 6,
    paths: [
      { ctx: 'profile.overview', kind: 'list-legal-empty' },
      { ctx: 'profile.overview.answered', kind: 'list-legal-empty', predicateWitness: 'iq.owner_user_id=$1' },
      { ctx: 'profile.growth', kind: 'list-legal-empty' },
      { ctx: 'profile.growth.reports', kind: 'list-legal-empty', predicateWitness: 'owner_user_id=$1' },
    ],
  },
  {
    file: 'apps/api/src/modules/notification/notification.service.ts',
    count: 5,
    paths: [
      { ctx: 'notification.list', kind: 'list-legal-empty' },
      { ctx: 'notification.unread', kind: 'list-legal-empty' },
      { ctx: 'notification.readAll', kind: 'list-legal-empty' },
      { ctx: 'notification.read', kind: 'single-id', e5Witness: "error: 'not_found'" },
    ],
  },
  {
    file: 'apps/api/src/modules/jobs/applications.service.ts',
    count: 5,
    paths: [
      { ctx: 'applications.mine', kind: 'list-legal-empty' },
      { ctx: 'applications.start', kind: 'single-id', e5Witness: 'cannot_finalize' },
      { ctx: 'applications.decline', kind: 'single-id', e5Witness: "'noop'" },
      { ctx: 'applications.finalize', kind: 'single-id', e5Witness: 'cannot_finalize' },
    ],
  },
  {
    file: 'apps/api/src/modules/commerce/commerce.service.ts',
    count: 3,
    paths: [
      { ctx: 'commerce.payWebhook.owner', kind: 'single-id', e5Witness: 'order_not_found' },
      { ctx: 'commerce.refundWebhook.owner', kind: 'single-id', e5Witness: 'order_not_found' },
    ],
  },
  {
    file: 'packages/db/src/notification.ts',
    count: 6,
    paths: [
      { ctx: 'notification.list', kind: 'list-legal-empty', predicateWitness: 'WHERE owner_user_id=$2' },
      { ctx: 'notification.read', kind: 'single-id', e5Witness: 'r.rowCount === 1', predicateWitness: 'AND owner_user_id=$2' },
      { ctx: 'notification.unread', kind: 'list-legal-empty', predicateWitness: 'AND owner_user_id=$1' },
      { ctx: 'notification.readAll', kind: 'list-legal-empty', predicateWitness: 'AND owner_user_id=$1' },
    ],
  },
  {
    file: 'packages/db/src/recruiter.ts',
    count: 9,
    paths: [
      { ctx: 'recruiter.applyToJob', kind: 'single-id', e5Witness: 'return null' },
      { ctx: 'recruiter.listMyApplications', kind: 'list-legal-empty', predicateWitness: 'a.candidate_user_id=$1' },
      { ctx: 'recruiter.finalizeApplication', kind: 'single-id', e5Witness: "'not_ready'" },
      { ctx: 'recruiter.markApplicationAssessmentUnavailable', kind: 'single-id', e5Witness: "'stale'" },
      { ctx: 'recruiter.markApplicationNoEligibleScore', kind: 'single-id', e5Witness: "'stale'" },
      { ctx: 'recruiter.startApplicationInterview', kind: 'single-id', e5Witness: "status: 'noop'" },
      { ctx: 'recruiter.declineInvitation', kind: 'single-id', e5Witness: '(r.rowCount ?? 0) > 0' },
    ],
  },
  {
    file: 'packages/db/src/candidate-route.ts',
    count: 3,
    paths: [
      { ctx: 'candidate-route.supply', kind: 'single-id', e5Witness: 'profile_unavailable' },
    ],
  },
];

/**
 * Same-file / same-plane owner paths deliberately NOT wired by PRIV01-C.
 * Registered absence — silent absence is BANNED (harness §3.1 总账).
 */
export interface ResidualPath {
  file: string;
  paths: string;
  reason: string;
  ownership: string;
}

export const RESIDUAL_PATHS: ResidualPath[] = [
  {
    file: 'apps/api/src/modules/interview/interview.service.ts',
    paths: ':673-931 段 16 处 asPrincipal 入口（report/score/transcript/answer 快照读侧链）· guardInterviewPrivacy :177-190（E3/E5 先例原样保留不重写）',
    reason: '读侧已经 guardInterviewPrivacy（自身 id 0 行 → 404 不可区分 fail-closed）+ RLS 双闸闭合；本刀接线区按 rev3 manifest 锚定 :177-664 写/编排主链',
    ownership: 'PRIV01 第二波（service 读侧深化刀）',
  },
  {
    file: 'apps/api/src/modules/resume/resume.service.ts',
    paths: 'upload/uploadFile/uploadImageViaOcr 入口（落库在 db resume.ts）· profile() 读（RLS-only + 0 行→404）',
    reason: '上传链 owner 谓词在 db resume.ts（登记为 db 层残余）；profile 读已有 RLS+404 fail-closed；§3.1 表锚为本刀接线面',
    ownership: 'PRIV01 第二波',
  },
  {
    file: 'apps/api/src/modules/quiz/quiz.service.ts',
    paths: 'list/get/events（RLS-only · get 0 行→404 · events 0 行→null→404）',
    reason: '§3.1 表锚 5 点已接线；list/get/events 为既有 RLS+fail-closed 读路径',
    ownership: 'PRIV01 第二波',
  },
  {
    file: 'apps/api/src/modules/diagnosis/diagnosis.service.ts',
    paths: 'list/get/events（RLS-only · get 0 行→404 · events 0 行→null→404）',
    reason: '同 quiz（镜像服务）',
    ownership: 'PRIV01 第二波',
  },
  {
    file: 'apps/api/src/modules/profile/profile.service.ts',
    paths: 'me/settings/changePassword/deactivate（user_account 域）',
    reason: 'user_account 主键即 principal（非 owner_user_id 归属表），不在 §3.1 表锚',
    ownership: '不适用（账户域另议）',
  },
  {
    file: 'apps/api/src/modules/commerce/commerce.service.ts',
    paths: 'createOrder/payCallback/getOrder/entitlement（user asPrincipal 路径）',
    reason: '§3.1 表锚=webhook owner 回查两点；user 路径 owner 谓词在 db payment.ts/commerce.ts（登记为 db 层残余）',
    ownership: 'PRIV01 第二波（db 层）',
  },
  {
    file: 'packages/db/src/notification.ts',
    paths: 'insertNotification（系统内部插入 · worker/报告就绪 lane）',
    reason: '系统 lane（§3.2 排除）——插入方为 worker 报告就绪流',
    ownership: 'PRIV01 第二波（worker 刀）',
  },
  {
    file: 'packages/db/src/recruiter.ts',
    paths: 'recruiter-owner 侧 fns（createJob/listJobs/getJob/closeJob/updateJob/listJobCandidates/inviteCandidate/listTalentPool）+ listOpenJobs（公开读 by-design）',
    reason: 'B 端角色维度（§3.2 排除 · Ban owner 冒充 tenant）；listOpenJobs 公开读无 owner 谓词 by-design',
    ownership: '不接线（角色域）',
  },
  {
    file: 'packages/db/src/candidate-route.ts',
    paths: 'getInterviewRouteSnapshotForAdaptiveRole（worker start job 角色门 fallback 读）',
    reason: 'worker lane（§3.2 排除）',
    ownership: 'PRIV01 第二波（worker 刀）',
  },
  {
    file: 'packages/db/src/{resume,quiz-jobs,diagnosis-jobs,interview-jobs,interview-question,report,payment,commerce,job-route-decision,free-text-route-decision,gateway-dispatch,usage-calibration}.ts',
    paths: '各文件内 owner_user_id SQL 点（resume.ts 18 · interview-jobs.ts 20 · commerce.ts 23 · payment.ts 10 · report.ts 10 · quiz-jobs/diagnosis-jobs 各 9 等）',
    reason: 'worker/系统消费 lane 与深层 db helper（owner 形参由本刀已接线服务层供给）；§3.2 排除 worker lane',
    ownership: 'PRIV01 第二波（db 层刀）',
  },
  {
    file: 'packages/db/src/{checkpoint-privacy,checkpoint-thread,privacy-authorization,memory-vector-chunk-erasure,vector-plane-erasure,int-transcript*,qbank-*,memory-*,retrieval-*}.ts',
    paths: '隐私主链/擦除链/向量/记忆/题库 lane 的 owner 点',
    reason: '隐私主链与 erasure 链 = 本刀硬 Ban 触面（interview DELETE 503 关闭 · resume/account DELETE=202 软删受理(purge_pending) · ADR 门 cite-only）；worker/memory/qbank = 系统 lane',
    ownership: 'Ban 链不接线（privacy 主链）· 其余 PRIV01 第二波',
  },
];
