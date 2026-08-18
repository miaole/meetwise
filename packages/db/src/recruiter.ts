/**
 * @meetwise/db · 招聘方(B 端)岗位仓储。全部在 principal 上下文 client 上跑(asPrincipal 包事务,RLS 按 owner 隔离)。
 * 多租户:招聘方只见自己的岗位(RLS p_owner)。assertPrincipal 是 belt-and-suspenders(确认上下文 owner 一致)。
 */
import type { PoolClient as Client } from 'pg';   // 直引 pg 类型,不从 ./index 桶引(防成环)
import { createHash, randomUUID } from 'node:crypto';
import { createJobSemanticRevision, bindApplicationRoute, snapshotInterviewRoute } from './job-route-decision.ts';  // RAG-FUNNEL-03 路由 seam

async function assertPrincipal(c: Client, owner: string): Promise<void> {
  const r = await c.query("SELECT current_setting('app.principal_user', true) AS p");
  if (r.rows[0]?.p !== owner) throw new Error('principal_mismatch');
}

export interface JobPosting {
  id: string; owner_user_id: string; title: string; description: string;
  competencies: string[]; status: string; created_at: string;
}

const COLS = 'id, owner_user_id, title, description, competencies, status, created_at';

export async function createJob(c: Client, owner: string, input: { title: string; description?: string; competencies?: string[]; idempotencyKey?: string }): Promise<{ id: string }> {
  await assertPrincipal(c, owner);
  const title = input.title.trim();
  const description = input.description ?? '';
  const competencies = input.competencies ?? [];
  const idempotencyKey = input.idempotencyKey?.trim() || undefined;
  const payloadHash = idempotencyKey
    ? createHash('sha256').update(JSON.stringify({ title, description, competencies })).digest('hex')
    : undefined;
  const id = 'job_' + randomUUID();
  if (!idempotencyKey) {
    await c.query(
      'INSERT INTO job_posting(id, owner_user_id, title, description, competencies) VALUES ($1,$2,$3,$4,$5)',
      [id, owner, title, description, JSON.stringify(competencies)],
    );
    await createJobSemanticRevision(c, owner, id, { title, description, competencies });  // RAG-FUNNEL-03：建岗即写 revision(route_pending)
    return { id };
  }
  const inserted = await c.query(
    `INSERT INTO job_posting(id, owner_user_id, title, description, competencies, idempotency_key, idempotency_payload_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (owner_user_id, idempotency_key) WHERE idempotency_key IS NOT NULL DO NOTHING
     RETURNING id`,
    [id, owner, title, description, JSON.stringify(competencies), idempotencyKey, payloadHash],
  );
  if ((inserted.rowCount ?? 0) === 1) {
    const createdId = inserted.rows[0].id as string;
    await createJobSemanticRevision(c, owner, createdId, { title, description, competencies });  // 幂等新插入也写 revision；replay 不重复
    return { id: createdId };
  }
  const existing = await c.query(
    'SELECT id, idempotency_payload_hash FROM job_posting WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, idempotencyKey],
  );
  if (existing.rows[0]?.idempotency_payload_hash !== payloadHash) {
    const error = new Error('job_idempotency_key_conflict');
    (error as Error & { code?: string }).code = 'job_idempotency_key_conflict';
    throw error;
  }
  return { id: existing.rows[0].id as string };
}

export async function listJobs(c: Client, owner: string): Promise<JobPosting[]> {
  await assertPrincipal(c, owner);
  // **显式过滤 owner**:开放岗位现公开可读(候选人浏览),RLS 不再隔离招聘方列表 → 必须 WHERE owner,否则看到他人开放岗位。
  const r = await c.query(`SELECT ${COLS} FROM job_posting WHERE owner_user_id=$1 ORDER BY created_at DESC`, [owner]);
  return r.rows as JobPosting[];
}

export async function getJob(c: Client, owner: string, id: string): Promise<JobPosting | null> {
  await assertPrincipal(c, owner);
  // 招聘方视角:只取自己的岗位(显式 owner,不靠 RLS——开放岗位公开可读)。
  const r = await c.query(`SELECT ${COLS} FROM job_posting WHERE id=$1 AND owner_user_id=$2`, [id, owner]);
  return r.rowCount === 0 ? null : (r.rows[0] as JobPosting);
}

export async function closeJob(c: Client, owner: string, id: string): Promise<boolean> {
  await assertPrincipal(c, owner);
  const r = await c.query("UPDATE job_posting SET status='closed', version=version+1 WHERE id=$1 AND status='open'", [id]);
  return (r.rowCount ?? 0) > 0;
}

/**
 * 岗位语义编辑（title/description/competencies）。语义字段真正变化时写入新 revision（route_pending），
 * 旧 revision 的 decision/binding/snapshot 不受影响（消费链的不可变性由 binding/snapshot 的副本保证）。
 * 无变化 → 返回现状，不制造空 revision。行锁串行化并发编辑，保证 revision 单调无碰撞。
 */
export async function updateJob(c: Client, owner: string, id: string, input: { title?: string; description?: string; competencies?: string[] }): Promise<JobPosting | null> {
  await assertPrincipal(c, owner);
  const existing = await c.query(
    `SELECT ${COLS} FROM job_posting WHERE id=$1 AND owner_user_id=$2 FOR UPDATE`,
    [id, owner],
  );
  if (existing.rowCount === 0) return null;
  const cur = existing.rows[0] as JobPosting;
  const title = input.title !== undefined ? input.title.trim() : cur.title;
  const description = input.description !== undefined ? input.description : cur.description;
  const competencies = input.competencies !== undefined ? input.competencies : cur.competencies;
  const unchanged = title === cur.title && description === cur.description
    && JSON.stringify(competencies) === JSON.stringify(cur.competencies);
  if (unchanged) return cur;
  await c.query(
    'UPDATE job_posting SET title=$3, description=$4, competencies=$5, version=version+1 WHERE id=$1 AND owner_user_id=$2',
    [id, owner, title, description, JSON.stringify(competencies)],
  );
  await createJobSemanticRevision(c, owner, id, { title, description, competencies });  // 编辑 → 新 revision(route_pending)
  const updated = await c.query(`SELECT ${COLS} FROM job_posting WHERE id=$1 AND owner_user_id=$2`, [id, owner]);
  return updated.rows[0] as JobPosting;
}

/* ───────────── 候选人 ↔ 岗位 ↔ 招聘方:申请闭环(多方 RLS) ───────────── */

export interface JobApplication {
  id: string; job_id: string; recruiter_user_id: string; candidate_user_id: string;
  interview_id: string | null; resume_id: string | null; status: string; score: number | null;
  source: string; version: number; created_at: string;
}

/** 人才库一行:跨招聘方自有岗位聚合的候选人(含岗位标题 + 来源)。只缓存状态/分数,无候选人私有面试。 */
export interface TalentRow {
  id: string; job_id: string; job_title: string; candidate_user_id: string;
  status: string; score: number | null; source: string; created_at: string;
}

/** 候选人浏览开放岗位:跨租户公开读(RLS p_read 放行 status='open')。不 assertPrincipal——非 owner 视角。 */
export async function listOpenJobs(c: Client): Promise<JobPosting[]> {
  const r = await c.query(`SELECT ${COLS} FROM job_posting WHERE status='open' ORDER BY created_at DESC`);
  return r.rows as JobPosting[];
}

/** 候选人投递岗位。岗位不存在/已关闭→null。重复投递幂等(UNIQUE 冲突复用既有申请 id)。 */
export async function applyToJob(c: Client, candidate: string, jobId: string): Promise<{ applicationId: string } | null> {
  await assertPrincipal(c, candidate);
  const job = await c.query("SELECT owner_user_id FROM job_posting WHERE id=$1 AND status='open'", [jobId]);  // 公开读
  if (job.rowCount === 0) return null;
  const recruiter = job.rows[0].owner_user_id as string;
  const id = 'app_' + randomUUID();
  const ins = await c.query(
    `INSERT INTO job_application(id, job_id, recruiter_user_id, candidate_user_id, status)
     VALUES ($1,$2,$3,$4,'invited')
     ON CONFLICT (job_id, candidate_user_id) DO NOTHING RETURNING id`,
    [id, jobId, recruiter, candidate],
  );
  const applicationId = ((ins.rowCount ?? 0) > 0)
    ? (ins.rows[0].id as string)
    : ((await c.query('SELECT id FROM job_application WHERE job_id=$1 AND candidate_user_id=$2', [jobId, candidate])).rows[0].id as string);  // 幂等复用
  // RAG-FUNNEL-03：申请事务绑定最新 route_decided 版本（未决岗位不绑定 → 无法 start，优雅降级）。
  await bindApplicationRoute(c, { candidateUserId: candidate, recruiterUserId: recruiter, jobId, applicationId, emitConsumptionEvent: true });
  return { applicationId };
}

/** 候选人查自己的申请(RLS p_party_read:候选人侧)。带 source 让候选人 UI 区分"受邀/主动投递"并给出动作出口。 */
export async function listMyApplications(c: Client, candidate: string): Promise<Pick<JobApplication, 'id' | 'job_id' | 'interview_id' | 'resume_id' | 'status' | 'score' | 'source'>[]> {
  await assertPrincipal(c, candidate);
  const r = await c.query('SELECT id, job_id, interview_id, resume_id, status, score, source FROM job_application WHERE candidate_user_id=$1 ORDER BY created_at DESC', [candidate]);
  return r.rows as Pick<JobApplication, 'id' | 'job_id' | 'interview_id' | 'resume_id' | 'status' | 'score' | 'source'>[];
}

/**
 * 招聘方查申请到自己某岗位的候选人。当前评分合同未校准，B 端只可读取
 * 最小状态投影；数值 score 必须在数据库查询边界置空，不能靠页面隐藏。
 */
export async function listJobCandidates(c: Client, recruiter: string, jobId: string): Promise<Pick<JobApplication, 'id' | 'candidate_user_id' | 'status' | 'score' | 'source'>[]> {
  await assertPrincipal(c, recruiter);
  const r = await c.query('SELECT id, candidate_user_id, status, NULL::integer AS score, source FROM job_application WHERE job_id=$1 ORDER BY created_at DESC', [jobId]);
  return r.rows as Pick<JobApplication, 'id' | 'candidate_user_id' | 'status' | 'score' | 'source'>[];
}

export type FinalizeApplicationResult = 'replayed' | 'assessment_unavailable' | 'not_ready';

/**
 * 岗位评估收口：客户端不得传 interviewId。只读取 application 已持久化的绑定，且逐项验证
 * application ↔ interview ↔ job ↔ candidate ↔ resume，避免任何 C 端历史训练被移花接木到招聘岗位。
 * 当前没有已校准的 B 端评分合同。终态 trigger 会把绑定申请收口为
 * scoreless 的 assessment_unavailable；本函数只是浏览器断线重试的幂等后备。
 */
export async function finalizeApplication(c: Client, candidate: string, appId: string): Promise<FinalizeApplicationResult> {
  await assertPrincipal(c, candidate);
  const bound = await c.query(
    `SELECT ja.status AS application_status, ja.interview_id, i.status AS interview_status
       FROM job_application ja
       JOIN interview i ON i.id=ja.interview_id
                      AND i.application_id=ja.id
                      AND i.application_attempt=ja.interview_attempt
                      AND i.job_id=ja.job_id
                      AND i.resume_id=ja.resume_id
                      AND i.owner_user_id=ja.candidate_user_id
      WHERE ja.id=$1 AND ja.candidate_user_id=$2
      FOR UPDATE OF ja`,
    [appId, candidate],
  );
  if (bound.rowCount === 0) return 'not_ready';
  const row = bound.rows[0];
  if (row.application_status === 'completed') return 'replayed'; // pre-hold historical state; never exposes its score to B.
  if (row.application_status === 'assessment_unavailable') return 'assessment_unavailable';
  if (row.application_status !== 'in_progress' || row.interview_status !== 'completed') return 'not_ready';
  const applied = await c.query(
    `UPDATE job_application SET score=NULL,status='assessment_unavailable',version=version+1
      WHERE id=$1 AND candidate_user_id=$2 AND status='in_progress'`,
    [appId, candidate],
  );
  return applied.rowCount === 1 ? 'assessment_unavailable' : 'not_ready';
}

/**
 * The graph has reached a terminal state but one or more answers have no
 * trustworthy score.  This is a B-side terminal, not a fabricated zero-score
 * completion.  The caller must already have atomically failed the bound
 * interview and released its reservation in the same transaction.
 */
/** The marker's result distinguishes a genuine current transition from a late
 * old-attempt worker.  Treating all zero-row updates as `false` used to make a
 * stale worker append a fresh unavailable event after a candidate had already
 * started the next attempt. */
export type AssessmentUnavailableMark = 'updated' | 'replayed' | 'stale' | 'unbound';

export async function markApplicationAssessmentUnavailable(c: Client, candidate: string, interviewId: string): Promise<AssessmentUnavailableMark> {
  await assertPrincipal(c, candidate);
  const r = await c.query(
    `UPDATE job_application ja
        SET status='assessment_unavailable', score=NULL, version=ja.version+1
       FROM interview i
      WHERE ja.candidate_user_id=$1
        AND ja.interview_id=$2
        AND ja.interview_attempt=i.application_attempt
        AND i.id=ja.interview_id
        AND i.application_id=ja.id
        AND i.owner_user_id=ja.candidate_user_id
        AND i.status='failed'
        AND ja.status='in_progress'`,
    [candidate, interviewId],
  );
  if (r.rowCount === 1) return 'updated';
  const binding = await c.query<{ application_id: string | null; application_status: string | null; current_interview_id: string | null; current_attempt: number | null }>(
    `SELECT i.application_id,
            ja.status AS application_status,
            ja.interview_id AS current_interview_id,
            ja.interview_attempt AS current_attempt
       FROM interview i
       LEFT JOIN job_application ja ON ja.id=i.application_id
      WHERE i.id=$1 AND i.owner_user_id=$2`,
    [interviewId, candidate],
  );
  const row = binding.rows[0];
  if (!row?.application_id || !row.current_interview_id) return 'unbound';
  if (row.current_interview_id === interviewId && row.application_status === 'assessment_unavailable') return 'replayed';
  return 'stale';
}

/**
 * A candidate can finish the interaction while supplying no assessable answer
 * (for example, every question reached the bounded clarify → skip route).
 * That is different from a model failure: the interview and its consumption
 * are already completed/confirmed, but a B-side application must not remain
 * in_progress or receive a fabricated zero score.  While the B-side
 * calibration hold is active the automatic finalizer already moves every
 * completion to this state; this function remains a replay-safe fallback for
 * older completion flows and deliberately ignores unbound legacy events.
 */
export async function markApplicationNoEligibleScore(c: Client, candidate: string, interviewId: string): Promise<AssessmentUnavailableMark> {
  await assertPrincipal(c, candidate);
  const r = await c.query(
    `UPDATE job_application ja
        SET status='assessment_unavailable', score=NULL, version=ja.version+1
       FROM interview i
      WHERE ja.candidate_user_id=$1
        AND ja.interview_id=$2
        AND ja.interview_attempt=i.application_attempt
        AND i.id=ja.interview_id
        AND i.application_id=ja.id
        AND i.owner_user_id=ja.candidate_user_id
        AND i.status='completed'
        AND ja.status='in_progress'
        AND NOT EXISTS (
          SELECT 1
            FROM interview_event e
           WHERE e.owner_user_id=i.owner_user_id
             AND e.stream_key=i.id
             AND e.kind='answer_evaluated'
             AND e.payload ?& ARRAY['questionId','stateVersion','answerId','answerHash','competency']
             AND COALESCE(e.payload->>'outcome','answered') <> 'unresolved'
             AND COALESCE(e.payload->>'score','') ~ '^[0-9]+(\\.[0-9]+)?$'
             AND (e.payload->>'score')::numeric BETWEEN 0 AND 100
             AND EXISTS (SELECT 1 FROM interview_question q
                           WHERE q.owner_user_id=e.owner_user_id
                             AND q.interview_id=e.stream_key
                             AND q.question_id=e.payload->>'questionId'
                             AND q.state_version=CASE WHEN COALESCE(e.payload->>'stateVersion','') ~ '^[0-9]+$' THEN (e.payload->>'stateVersion')::int ELSE NULL END
                             AND q.answer_id=e.payload->>'answerId'
                             AND q.answer_hash=e.payload->>'answerHash'
                             AND q.competency=e.payload->>'competency'
                             AND q.status='answered')
        )`,
    [candidate, interviewId],
  );
  if (r.rowCount === 1) return 'updated';
  const binding = await c.query<{ application_id: string | null; application_status: string | null; current_interview_id: string | null }>(
    `SELECT i.application_id,
            ja.status AS application_status,
            ja.interview_id AS current_interview_id
       FROM interview i
       LEFT JOIN job_application ja ON ja.id=i.application_id
      WHERE i.id=$1 AND i.owner_user_id=$2`,
    [interviewId, candidate],
  );
  const row = binding.rows[0];
  if (!row?.application_id || !row.current_interview_id) return 'unbound';
  if (row.current_interview_id === interviewId && row.application_status === 'assessment_unavailable') return 'replayed';
  return 'stale';
}

/* ───────────── B 端企业纵深:招聘方邀请候选人面试 + 人才库 ───────────── */

/** 招聘方邀请候选人为某岗位面试(RLS p_recruiter_insert:仅自有岗位)。岗位非自己/不存在→null。
 * 幂等:同岗位同候选人唯一(候选人可能已自投)→ 复用既有申请 id。score/transcript 不在此写(候选人自己跑面试回填)。 */
export async function inviteCandidate(c: Client, recruiter: string, jobId: string, candidateId: string): Promise<{ applicationId: string; status: string } | null> {
  await assertPrincipal(c, recruiter);
  // 显式校验岗位归属(应用层),与 RLS p_recruiter_insert 的 EXISTS 自校验形成纵深防御。
  const job = await c.query('SELECT id FROM job_posting WHERE id=$1 AND owner_user_id=$2', [jobId, recruiter]);
  if (job.rowCount === 0) return null;
  const id = 'app_' + randomUUID();
  const ins = await c.query(
    `INSERT INTO job_application(id, job_id, recruiter_user_id, candidate_user_id, status, source)
     VALUES ($1,$2,$3,$4,'invited','invited')
     ON CONFLICT (job_id, candidate_user_id) DO NOTHING RETURNING id, status`,
    [id, jobId, recruiter, candidateId],
  );
  let applicationId: string; let status: string;
  if ((ins.rowCount ?? 0) > 0) {
    applicationId = ins.rows[0].id as string; status = ins.rows[0].status as string;
  } else {
    // 幂等:已存在(候选人自投/已被邀请/已完成/已婉拒)→ 复用并**回真实状态**(不谎报 invited,避免误导招聘方)。
    const existing = await c.query('SELECT id, status FROM job_application WHERE job_id=$1 AND candidate_user_id=$2', [jobId, candidateId]);
    applicationId = existing.rows[0].id as string; status = existing.rows[0].status as string;
  }
  // RAG-FUNNEL-03：受邀事务同样绑定最新 route_decided 版本（招聘方侧多方 RLS 插入，不发候选人消费事件）。
  await bindApplicationRoute(c, { candidateUserId: candidateId, recruiterUserId: recruiter, jobId, applicationId, emitConsumptionEvent: false });
  return { applicationId, status };
}

export type StartApplicationResult =
  | { status: 'started' | 'reused'; interviewId: string; resumeId: string }
  | { status: 'noop' | 'resume_not_ready' | 'binding_invalid' };

/**
 * 创建/取得岗位专属会话。application 行锁把“看绑定→建 interview→回写 application”放在同一事务；
 * partial unique indexes 是进程崩溃/未来调用方绕开本函数时的第二道一对一防线。
 */
export async function startApplicationInterview(c: Client, candidate: string, appId: string, resumeId: string): Promise<StartApplicationResult> {
  await assertPrincipal(c, candidate);
  const app = await c.query(
    `SELECT id,job_id,status,interview_id,resume_id,interview_attempt
       FROM job_application WHERE id=$1 AND candidate_user_id=$2 FOR UPDATE`,
    [appId, candidate],
  );
  if (app.rowCount === 0) return { status: 'noop' }; // 不区分不存在/越权
  const row = app.rows[0] as { id: string; job_id: string; status: string; interview_id: string | null; resume_id: string | null; interview_attempt: number };
  if (row.status === 'completed' || row.status === 'declined') return { status: 'noop' };

  if (row.status === 'in_progress' && row.interview_id) {
    const bound = await c.query(
      `SELECT i.id,i.resume_id
         FROM interview i
         JOIN resume r ON r.id=i.resume_id AND r.owner_user_id=i.owner_user_id
        WHERE i.id=$1 AND i.owner_user_id=$2 AND i.application_id=$3 AND i.application_attempt=$4 AND i.job_id=$5 AND i.resume_id=$6
          AND i.resume_privacy_epoch IS NOT NULL
          AND r.status='ingested'
          AND r.privacy_epoch=i.resume_privacy_epoch
          AND i.status IN ('created','active')`,
      [row.interview_id, candidate, row.id, row.interview_attempt, row.job_id, row.resume_id],
    );
    if (bound.rowCount !== 1 || !row.resume_id) return { status: 'binding_invalid' };
    return { status: 'reused', interviewId: row.interview_id, resumeId: row.resume_id };
  }

  // A scoreless attempt is terminal and refundable.  A deliberate new start
  // creates a new, monotonically increasing bound attempt while preserving the
  // old failed interview for audit; delayed old workers no longer match the
  // current job_application pointer or attempt number.
  if (row.status === 'assessment_unavailable' && row.resume_id && row.resume_id !== resumeId)
    return { status: 'binding_invalid' };

  const resume = await c.query(
    "SELECT id,privacy_epoch FROM resume WHERE id=$1 AND owner_user_id=$2 AND status='ingested' FOR KEY SHARE",
    [resumeId, candidate],
  );
  if (resume.rowCount !== 1) return { status: 'resume_not_ready' };

  const interviewId = 'iv_' + randomUUID();
  const nextAttempt = Math.max(0, Number(row.interview_attempt ?? 0)) + 1;
  await c.query(
    `INSERT INTO interview(id,owner_user_id,status,application_id,application_attempt,job_id,resume_id,resume_privacy_epoch)
     VALUES($1,$2,'created',$3,$4,$5,$6,$7)`,
    [interviewId, candidate, row.id, nextAttempt, row.job_id, resumeId, Number(resume.rows[0].privacy_epoch)],
  );
  const updated = await c.query(
    `UPDATE job_application
        SET status='in_progress',interview_id=$3,interview_attempt=$4,resume_id=$5,version=version+1
      WHERE id=$1 AND candidate_user_id=$2
        AND status IN ('invited','assessment_unavailable')
        AND interview_attempt=$6`,
    [row.id, candidate, interviewId, nextAttempt, resumeId, row.interview_attempt],
  );
  if (updated.rowCount !== 1) throw Object.assign(new Error('application_start_conflict'), { code: 'application_start_conflict' });
  // RAG-FUNNEL-03：面试启动事务把 binding 复制到不可变 snapshot（仅当已有 route_decided 绑定）。
  // 无 binding（岗位尚未分类）→ 不落 snapshot，优雅降级为无路由的旧行为，绝不制造死端；
  // 已绑定旧 revision 的面试在岗位后续编辑后仍读旧 snapshot，不受影响。
  await snapshotInterviewRoute(c, candidate, interviewId, row.id);
  return { status: 'started', interviewId, resumeId };
}

/** 候选人婉拒邀请:状态机 CAS invited → declined(终态,不死胡同)。已开始/已完成→落败=0 行。 */
export async function declineInvitation(c: Client, candidate: string, appId: string): Promise<boolean> {
  await assertPrincipal(c, candidate);
  const r = await c.query(
    "UPDATE job_application SET status='declined', version=version+1 WHERE id=$1 AND candidate_user_id=$2 AND status='invited'",
    [appId, candidate],
  );
  return (r.rowCount ?? 0) > 0;
}

export interface TalentQuery { status?: string; order?: 'asc' | 'desc' }

/**
 * 人才库只按创建时间排序。评分校准发布前，不得以历史或实时数值排序、
 * 过滤或向招聘方返回 score；候选人私有面试仍不可读。
 */
export async function listTalentPool(c: Client, recruiter: string, q: TalentQuery = {}): Promise<TalentRow[]> {
  await assertPrincipal(c, recruiter);
  const order = q.order === 'asc' ? 'ASC' : 'DESC';                                // 白名单
  const params: unknown[] = [recruiter];
  let where = 'a.recruiter_user_id = $1';                                          // 显式租户过滤(belt-and-suspenders,RLS 已隔离)
  if (q.status) { params.push(q.status); where += ` AND a.status = $${params.length}`; }
  const r = await c.query(
    `SELECT a.id, a.job_id, j.title AS job_title, a.candidate_user_id, a.status, NULL::integer AS score, a.source, a.created_at
       FROM job_application a JOIN job_posting j ON j.id = a.job_id
      WHERE ${where}
      ORDER BY a.created_at ${order}`,
    params,
  );
  return r.rows as TalentRow[];
}
