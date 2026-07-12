/**
 * @meetwise/db · 招聘方(B 端)岗位仓储。全部在 principal 上下文 client 上跑(asPrincipal 包事务,RLS 按 owner 隔离)。
 * 多租户:招聘方只见自己的岗位(RLS p_owner)。assertPrincipal 是 belt-and-suspenders(确认上下文 owner 一致)。
 */
import type { PoolClient as Client } from 'pg';   // 直引 pg 类型,不从 ./index 桶引(防成环)
import { randomUUID } from 'node:crypto';

async function assertPrincipal(c: Client, owner: string): Promise<void> {
  const r = await c.query("SELECT current_setting('app.principal_user', true) AS p");
  if (r.rows[0]?.p !== owner) throw new Error('principal_mismatch');
}

export interface JobPosting {
  id: string; owner_user_id: string; title: string; description: string;
  competencies: string[]; status: string; created_at: string;
}

const COLS = 'id, owner_user_id, title, description, competencies, status, created_at';

export async function createJob(c: Client, owner: string, input: { title: string; description?: string; competencies?: string[] }): Promise<{ id: string }> {
  await assertPrincipal(c, owner);
  const id = 'job_' + randomUUID();
  await c.query(
    'INSERT INTO job_posting(id, owner_user_id, title, description, competencies) VALUES ($1,$2,$3,$4,$5)',
    [id, owner, input.title, input.description ?? '', JSON.stringify(input.competencies ?? [])],
  );
  return { id };
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

/* ───────────── 候选人 ↔ 岗位 ↔ 招聘方:申请闭环(多方 RLS) ───────────── */

export interface JobApplication {
  id: string; job_id: string; recruiter_user_id: string; candidate_user_id: string;
  interview_id: string | null; status: string; score: number | null;
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
  if ((ins.rowCount ?? 0) > 0) return { applicationId: ins.rows[0].id as string };
  const existing = await c.query('SELECT id FROM job_application WHERE job_id=$1 AND candidate_user_id=$2', [jobId, candidate]);  // 幂等复用
  return { applicationId: existing.rows[0].id as string };
}

/** 候选人查自己的申请(RLS p_party_read:候选人侧)。带 source 让候选人 UI 区分"受邀/主动投递"并给出动作出口。 */
export async function listMyApplications(c: Client, candidate: string): Promise<Pick<JobApplication, 'id' | 'job_id' | 'status' | 'score' | 'source'>[]> {
  await assertPrincipal(c, candidate);
  const r = await c.query('SELECT id, job_id, status, score, source FROM job_application WHERE candidate_user_id=$1 ORDER BY created_at DESC', [candidate]);
  return r.rows as Pick<JobApplication, 'id' | 'job_id' | 'status' | 'score' | 'source'>[];
}

/** 招聘方查申请到自己某岗位的候选人(RLS p_party_read:招聘方为多方一方→可见)。只见缓存状态/分数,不见候选人私有面试。 */
export async function listJobCandidates(c: Client, recruiter: string, jobId: string): Promise<Pick<JobApplication, 'id' | 'candidate_user_id' | 'status' | 'score' | 'source'>[]> {
  await assertPrincipal(c, recruiter);
  const r = await c.query('SELECT id, candidate_user_id, status, score, source FROM job_application WHERE job_id=$1 ORDER BY created_at DESC', [jobId]);
  return r.rows as Pick<JobApplication, 'id' | 'candidate_user_id' | 'status' | 'score' | 'source'>[];
}

/** 候选人完成面试后回填结果(RLS p_candidate_update:仅候选人改自己那条)。
 * 状态机 CAS 守卫:仅 invited / in_progress 可 → completed(已 completed/declined 落败=0 行,防重复回填/非法迁移)。不存在/越权→false。
 * 信任边界(诚实声明,非"不可伪造"):score 为候选人侧自报、绑定其自己的练习面试——喂给候选人自己的视图与招聘方的速览信号;
 *   服务端从面试评估派生权威分(读 interview_event 求评分)是已记录的后续硬化项,当前未做(见 ai-docs 审计记录)。 */
export async function finalizeApplication(c: Client, candidate: string, appId: string, interviewId: string): Promise<boolean> {
  await assertPrincipal(c, candidate);
  // **分数服务端推导,不接受客户端自报**(B 端人才库可信度):取候选人**本人**该面试已评估各轮的均分。
  //  防伪造两道闸:① owner_user_id=candidate → 只能用自己的面试(借别人高分面试无效)
  //               ② 分数取 AI 评估器落库的真实 answer_evaluated.score,候选人无法在请求里编造。
  //  该面试无任何已评估轮次(空壳/没真做完)→ 推导为 NULL → 不 finalize(WHERE s.score IS NOT NULL)。
  const r = await c.query(
    `WITH s AS (
       SELECT round(avg((payload->>'score')::numeric))::int AS score
         FROM interview_event
        WHERE stream_key=$2 AND kind='answer_evaluated' AND owner_user_id=$3
          AND COALESCE(payload->>'outcome','answered') <> 'unresolved'   -- 剔除 unresolved(跳过/探尽未决,0 分)→ 不系统性压低候选人分;与 worker 报告侧(main.ts)同口径
     )
     UPDATE job_application ja SET interview_id=$2, score=s.score, status='completed', version=version+1
       FROM s
      WHERE ja.id=$1 AND ja.candidate_user_id=$3 AND ja.status IN ('invited','in_progress') AND s.score IS NOT NULL`,
    [appId, interviewId, candidate],
  );
  return (r.rowCount ?? 0) > 0;
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
  if ((ins.rowCount ?? 0) > 0) return { applicationId: ins.rows[0].id as string, status: ins.rows[0].status as string };
  // 幂等:已存在(候选人自投/已被邀请/已完成/已婉拒)→ 复用并**回真实状态**(不谎报 invited,避免误导招聘方)。
  const existing = await c.query('SELECT id, status FROM job_application WHERE job_id=$1 AND candidate_user_id=$2', [jobId, candidateId]);
  return { applicationId: existing.rows[0].id as string, status: existing.rows[0].status as string };
}

/** 候选人开始为某申请面试:状态机 CAS invited → in_progress(RLS p_candidate_update,仅候选人本人,仅 invited 可推进)。 */
export async function startApplicationInterview(c: Client, candidate: string, appId: string): Promise<boolean> {
  await assertPrincipal(c, candidate);
  const r = await c.query(
    "UPDATE job_application SET status='in_progress', version=version+1 WHERE id=$1 AND candidate_user_id=$2 AND status='invited'",
    [appId, candidate],
  );
  return (r.rowCount ?? 0) > 0;
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

export interface TalentQuery { status?: string; sort?: 'score' | 'created'; order?: 'asc' | 'desc' }

/** 人才库:招聘方跨**自有所有岗位**聚合候选人(RLS p_party_read:recruiter_user_id=principal → 只见自己租户)。
 * 服务端排序/筛选(列名白名单,杜绝注入);只返缓存状态/分数,无候选人私有面试。 */
export async function listTalentPool(c: Client, recruiter: string, q: TalentQuery = {}): Promise<TalentRow[]> {
  await assertPrincipal(c, recruiter);
  const sortCol = q.sort === 'score' ? 'a.score' : 'a.created_at';                 // 白名单
  const order = q.order === 'asc' ? 'ASC' : 'DESC';                                // 白名单
  const params: unknown[] = [recruiter];
  let where = 'a.recruiter_user_id = $1';                                          // 显式租户过滤(belt-and-suspenders,RLS 已隔离)
  if (q.status) { params.push(q.status); where += ` AND a.status = $${params.length}`; }
  const r = await c.query(
    `SELECT a.id, a.job_id, j.title AS job_title, a.candidate_user_id, a.status, a.score, a.source, a.created_at
       FROM job_application a JOIN job_posting j ON j.id = a.job_id
      WHERE ${where}
      ORDER BY ${sortCol} ${order} NULLS LAST, a.created_at DESC`,
    params,
  );
  return r.rows as TalentRow[];
}
