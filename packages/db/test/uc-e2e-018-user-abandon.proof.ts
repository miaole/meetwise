/**
 * UC-E2E-018 focused integration prove (eval-first · packages/db).
 *
 * Asserts user-abandon interview → abandoned + consumption released + resume
 * rejected + not in "in-progress" set — NO MODEL_API_KEY, NO HTTP/UI e2e.
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-018 covered
 *
 *   pnpm uc018:abandon:prove          (via run-e2e-isolated)
 *   pnpm -C packages/db prove:uc018-abandon   (raw; needs isolated DATABASE_URL)
 *
 * Matrix may rise to **partial** only when this file's asserts run green.
 * Do NOT claim covered: HTTP mouth prove is separate (uc018:abandon:http:prove); full.e2e CLOSED; graph CLOSED; TTL CLOSED via uc018:ttl:prove; UI/sole-stack still gap (waiting_user+#1+#2+#3 closed).
 *
 * Cite: e2e-scenarios.md UC-E2E-018 A1/A2/A3 · matrix row UC-E2E-018
 */
import { randomUUID } from 'node:crypto';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, abandonInterviewAndRelease, availableUnits,
  completeInterviewAndConfirm, claimNextInterviewJob,
} from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `uc018-${k}-${S}`;
const IID = (k: string) => `iv-uc018-${k}-${S}`;

async function seed(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

async function consStatus(owner: string, key: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function ivStatus(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2',
    [id, owner],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function qStatus(owner: string, id: string, qid: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT status FROM interview_question WHERE owner_user_id=$1 AND interview_id=$2 AND question_id=$3',
    [owner, id, qid],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

/** Mirrors InterviewService 列表/详情 DTO 投影列（issued/answered_turns + current/processing_turn FILTER 式）。 */
async function projection(owner: string, id: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    `SELECT count(*) FILTER (WHERE iq.status <> 'cancelled')::int AS issued_turns,
            count(*) FILTER (WHERE iq.status = 'answered')::int AS answered_turns,
            max(iq.turn) FILTER (WHERE iq.status = 'issued')::int AS current_turn,
            max(iq.turn) FILTER (WHERE iq.status = 'queued')::int AS processing_turn
       FROM interview_question iq WHERE iq.interview_id=$1 AND iq.owner_user_id=$2`,
    [id, owner],
  )).then((r) => r.rows[0] as Record<string, unknown> | undefined);
}

/** Mirrors create()/list "in progress" filter used by InterviewService. */
async function inProgressIds(owner: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    "SELECT id FROM interview WHERE owner_user_id=$1 AND status NOT IN ('completed','abandoned','failed') ORDER BY id",
    [owner],
  )).then((r) => r.rows.map((row) => row.id as string));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('UC-E2E-018 user-abandon prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration assert only；≠ matrix covered');
  console.log('NOTE: fixture=pgvector via isolated → green-risk / R5；≠ sole-stack migrated');

  // ── A1: active + reserved → abandon → abandoned + released + 额度净变 0 ──
  section('A1 · active 预留后放弃：abandoned + released + 额度净变 0');
  {
    const owner = OWN('a1'), id = IID('a1');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('A1 reserve → reserved', r1.status === 'reserved');
    A('A1 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A1 abandon → abandoned', ab.status === 'abandoned');
    A('A1 released=released', ab.released === 'released');
    A('A1 interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A1 consumption=released', (await consStatus(owner, id)) === 'released');
    A('A1 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── A1-shell: created 空壳未预留也可放弃（noop release）──
  section('A1-shell · created 无预留空壳放弃 → abandoned + released=noop');
  {
    const owner = OWN('shell'), id = IID('shell');
    await seed(owner, 3.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    const before = await asPrincipal(pool, owner, (c) => availableUnits(c, owner));
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A1-shell → abandoned', ab.status === 'abandoned');
    A('A1-shell released=noop', ab.released === 'noop');
    A('A1-shell interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A1-shell 额度不变', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === before);
  }

  // ── A2: abandoned 后不可 resume / 不可 complete 复活 ──
  section('A2 · abandoned 终态：二次 abandon 幂等；complete 冲突；不可复活');
  {
    const owner = OWN('a2'), id = IID('a2');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A2 setup interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A2 setup consumption=released', (await consStatus(owner, id)) === 'released');

    const again = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A2 二次 abandon → already_abandoned', again.status === 'already_abandoned');
    A('A2 二次 released=noop（不双退）', again.released === 'noop');
    A('A2 额度仍满（净变 0，不二次回补）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);

    let completeConflict = false;
    let completeCode = '';
    try {
      await asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, id));
    } catch (e: any) {
      completeCode = String(e?.code ?? '');
      // released 账本 → interview_settlement_failed / already_released；或 terminal conflict
      completeConflict = completeCode === 'interview_settlement_failed'
        || completeCode === 'interview_terminal_conflict'
        || (e?.reason === 'already_released');
    }
    A('A2 complete 对 abandoned 拒（settlement_failed/terminal；不可复活）', completeConflict);
    A('A2 complete 错误码可解释', completeCode === 'interview_settlement_failed' || completeCode === 'interview_terminal_conflict');
    A('A2 仍为 abandoned（未复活）', (await ivStatus(owner, id)) === 'abandoned');
  }

  // ── A3: abandoned 不出现在进行中集合 ──
  section('A3 · abandoned 不在 in-progress（create 复用 / 进行中列表口径）');
  {
    const owner = OWN('a3'), live = IID('live'), dead = IID('dead');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created'),($3,$2,'created')",
      [live, owner, dead],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, dead, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, dead));

    const open = await inProgressIds(owner);
    A('A3 live created 仍在进行中', open.includes(live));
    A('A3 abandoned 不在进行中', !open.includes(dead));
    A('A3 abandoned 行仍可读为终态', (await ivStatus(owner, dead)) === 'abandoned');
  }

  // ── A-created-reserved: created+reserved 放弃路径（begin 后、worker 置 active 前）──
  section('A-created-reserved · created+reserved 放弃（begin 后 worker 前）');
  {
    const owner = OWN('cr'), id = IID('cr');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A-created-reserved → abandoned', ab.status === 'abandoned');
    A('A-created-reserved released', ab.released === 'released');
    A('A-created-reserved 额度净变 0', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);
  }

  // ── A-waiting-user: waiting_user+reserved 放弃（题间等待用户作答 · UC-E2E-018 主流程）──
  section('A-waiting-user · waiting_user+reserved 放弃 → abandoned + released');
  {
    const owner = OWN('wu'), id = IID('wu');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')",
      [id, owner],
    );
    const r1 = await asPrincipal(pool, owner, (c) =>
      reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    A('A-waiting-user reserve → reserved', r1.status === 'reserved');
    A('A-waiting-user 额度扣 1.0（5→4）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 4.0);

    const ab = await asPrincipal(pool, owner, (c) =>
      abandonInterviewAndRelease(c, owner, id));
    A('A-waiting-user abandon → abandoned', ab.status === 'abandoned');
    A('A-waiting-user released=released', ab.released === 'released');
    A('A-waiting-user interview=abandoned', (await ivStatus(owner, id)) === 'abandoned');
    A('A-waiting-user consumption=released', (await consStatus(owner, id)) === 'released');
    A('A-waiting-user 额度全回补（4→5，净变 0）', (await asPrincipal(pool, owner, (c) => availableUnits(c, owner))) === 5.0);

    const open = await inProgressIds(owner);
    A('A-waiting-user abandoned ∉ in-progress', !open.includes(id));
  }

  // ── A-open-q: abandon 收口同事务 cancel open 题（cancelOpenInterviewQuestion 接线）+ DTO 读数收敛 ──
  section('A-open-q · abandon 同事务 cancel open 题（issued/queued→cancelled）+ DTO 读数收敛');
  {
    // 零作答面：单 issued 题 → abandon → cancelled；投影 issued_turns 归 0 + current_turn NULL
    //（投影 SQL 镜像 InterviewService 列表列源；issued_turns 归 0 即列表显示
    // 「已出 N 题，未作答」→「尚未出题」翻面的同源机制面）。
    const owner = OWN('oq'), id = IID('oq');
    await seed(owner, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,0,'q0','issued')",
      [owner, id, `${id}:q0`],
    ));
    const ab = await asPrincipal(pool, owner, (c) => abandonInterviewAndRelease(c, owner, id));
    A('A-open-q abandon → abandoned', ab.status === 'abandoned');
    A('A-open-q issued 题 cancelled（open 题账面闭合）', (await qStatus(owner, id, `${id}:q0`)) === 'cancelled');
    const proj = await projection(owner, id);
    A('A-open-q current_turn 读数 NULL', proj?.current_turn === null);
    A('A-open-q issued_turns 归 0（显示翻转同源机制面）', proj?.issued_turns === 0);

    // queued 面：processing_turn 读数 NULL pin（processing_turn FILTER queued 同构面）。
    const ownerQ = OWN('oqq'), idQ = IID('oqq');
    await seed(ownerQ, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')",
      [idQ, ownerQ],
    );
    await asPrincipal(pool, ownerQ, (c) => reserveEntitlement(c, ownerQ, idQ, 'mock_interview', 1.0));
    await asPrincipal(pool, ownerQ, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,1,1,'q1','queued')",
      [ownerQ, idQ, `${idQ}:q1`],
    ));
    await asPrincipal(pool, ownerQ, (c) => abandonInterviewAndRelease(c, ownerQ, idQ));
    const projQ = await projection(ownerQ, idQ);
    A('A-open-q queued 题 cancelled', (await qStatus(ownerQ, idQ, `${idQ}:q1`)) === 'cancelled');
    A('A-open-q processing_turn 读数 NULL', projQ?.processing_turn === null);
    A('A-open-q queued 面 current_turn 仍 NULL', projQ?.current_turn === null);

    // 部分作答面：answered 行保全（业务事实独立保全）+ answered_turns 保全 + open 题 cancelled。
    const ownerM = OWN('oqm'), idM = IID('oqm');
    await seed(ownerM, 5.0);
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'waiting_user')",
      [idM, ownerM],
    );
    await asPrincipal(pool, ownerM, (c) => reserveEntitlement(c, ownerM, idM, 'mock_interview', 1.0));
    await asPrincipal(pool, ownerM, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status,answer_id,answer_hash) VALUES ($1,$2,$3,1,0,'q0','answered',$4,$5)",
      [ownerM, idM, `${idM}:q0`, `ans-${idM}`, 'a'.repeat(64)],
    ));
    await asPrincipal(pool, ownerM, (c) => c.query(
      "INSERT INTO interview_question(owner_user_id,interview_id,question_id,state_version,turn,question,status) VALUES ($1,$2,$3,2,1,'q1','issued')",
      [ownerM, idM, `${idM}:q1`],
    ));
    await asPrincipal(pool, ownerM, (c) => abandonInterviewAndRelease(c, ownerM, idM));
    const projM = await projection(ownerM, idM);
    A('A-open-q answered 行保全（不删不翻·业务事实独立保全）', (await qStatus(ownerM, idM, `${idM}:q0`)) === 'answered');
    A('A-open-q 部分/作答面 issued 题 cancelled', (await qStatus(ownerM, idM, `${idM}:q1`)) === 'cancelled');
    A('A-open-q answered_turns 保全=1', projM?.answered_turns === 1);
    A('A-open-q 作答面 current_turn 仍 NULL（无 issued 残留）', projM?.current_turn === null);
  }

  section('A-queued-job · 放弃时仍排队的作业改为 failed，且不能再被领取');
  {
    const owner = OWN('qj');
    const id = IID('qj');
    const idKept = IID('qj-kept');
    await seed(owner, 5.0);
    const resumeId = randomUUID();
    const resumeKept = randomUUID();
    await pool.query(
      "INSERT INTO resume(id,owner_user_id,status,content_sha,privacy_epoch) VALUES ($1,$2,'ingested',$3,1),($4,$2,'ingested',$5,1)",
      [resumeId, owner, `abandon-job:${id}`, resumeKept, `abandon-job:${idKept}`],
    );
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,'waiting_user',$3,1),($4,$2,'waiting_user',$5,1)",
      [id, owner, resumeId, idKept, resumeKept],
    );
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, idKept, 'mock_interview', 1.0));
    const insertJob = (interviewId: string, boundResume: string, seq: number, status: string, payload: Record<string, unknown>, version: number, leaseOwner: string | null, lastError: string | null) =>
      asPrincipal(pool, owner, (c) => c.query(
        `INSERT INTO interview_job(owner_user_id,interview_id,kind,seq,payload,resume_id,resume_privacy_epoch,reference_schema_version,status,lease_owner,lease_expires_at,version,last_error)
           VALUES ($1,$2,'start',$3,$4::jsonb,$5,1,64,$6,$7,CASE WHEN $7::text IS NULL THEN NULL ELSE now()+interval '10 minutes' END,$8,$9)`,
        [owner, interviewId, seq, JSON.stringify(payload), boundResume, status, leaseOwner, version, lastError],
      ));
    await insertJob(id, resumeId, 0, 'queued', { answer: 'secret-answer', turn: 1 }, 4, 'stale-worker', null);
    await insertJob(id, resumeId, 1, 'running', { answer: 'keep-running', turn: 2 }, 2, 'live-worker', null);
    await insertJob(id, resumeId, 2, 'done', { answer: 'keep-done', turn: 3 }, 3, null, null);
    await insertJob(idKept, resumeKept, 0, 'failed', { answer: 'keep-prior', turn: 9 }, 5, 'old-worker', 'prior');
    const ab = await asPrincipal(pool, owner, (c) => abandonInterviewAndRelease(c, owner, id));
    A('A-queued-job abandon → abandoned', ab.status === 'abandoned');
    await asPrincipal(pool, owner, (c) => abandonInterviewAndRelease(c, owner, idKept));
    const rows = await asPrincipal(pool, owner, (c) => c.query(
      `SELECT seq, status, last_error, lease_owner, lease_expires_at, version, payload, attempts
         FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 ORDER BY seq`,
      [owner, id],
    ));
    const queued = rows.rows.find((r) => Number(r.seq) === 0);
    const running = rows.rows.find((r) => Number(r.seq) === 1);
    const done = rows.rows.find((r) => Number(r.seq) === 2);
    const kept = (await asPrincipal(pool, owner, (c) => c.query(
      `SELECT status, last_error, lease_owner, version, payload FROM interview_job
        WHERE owner_user_id=$1 AND interview_id=$2 AND seq=0`,
      [owner, idKept],
    ))).rows[0];
    A('A-queued-job 当时 queued 变为 failed', queued?.status === 'failed' && queued?.last_error === 'abandoned');
    A('A-queued-job 租约已清且 version 加一、answer 已去掉',
      queued?.lease_owner == null && queued?.lease_expires_at == null && Number(queued?.version) === 5
      && queued?.payload?.answer === undefined && queued?.payload?.turn === 1 && Number(queued?.attempts) === 0);
    A('A-queued-job running 行不改',
      running?.status === 'running' && running?.lease_owner === 'live-worker' && Number(running?.version) === 2
      && running?.payload?.answer === 'keep-running');
    A('A-queued-job done 行不改',
      done?.status === 'done' && Number(done?.version) === 3 && done?.payload?.answer === 'keep-done' && done?.last_error == null);
    A('A-queued-job 已经 failed 的行不改',
      kept?.status === 'failed' && kept?.last_error === 'prior' && kept?.lease_owner === 'old-worker'
      && Number(kept?.version) === 5 && kept?.payload?.answer === 'keep-prior');
    await asPrincipal(pool, owner, (c) => c.query(
      `UPDATE interview_job SET lease_expires_at=now()-interval '1 minute'
        WHERE owner_user_id=$1 AND interview_id=$2 AND status='running'`,
      [owner, id],
    ));
    const claimed = await asPrincipal(pool, owner, (c) => claimNextInterviewJob(c, owner, 'proof-claimer'));
    A('A-queued-job 放弃后不能再被领取', claimed === null);
    const afterClaim = (await asPrincipal(pool, owner, (c) => c.query(
      'SELECT status, attempts FROM interview_job WHERE owner_user_id=$1 AND interview_id=$2 AND seq=0',
      [owner, id],
    ))).rows[0];
    A('A-queued-job 领取尝试后仍是 failed', afterClaim?.status === 'failed' && Number(afterClaim?.attempts) === 0);
  }

  console.log(`\n${fail === 0
    ? '✓ UC-E2E-018 A1–A3 + A-waiting-user integration asserts passed (partial ladder only; ≠ covered; ≠ e2e:isolated; ≠ HTTP abandon)'
    : `✗ ${fail} UC-E2E-018 asserts failed`}`);
  console.log('CLOSED: GAP-UC018-WAITING-USER — abandon CAS now created|active|waiting_user + A-waiting-user prove');
  console.log('CLOSED_GAP_UC018_FULL_E2E: see pnpm uc018:abandon:full-e2e:prove / e2e/full.e2e.ts；GRAPH via uc018:graph:prove；TTL via uc018:ttl:prove；UI + sole-stack still gap → matrix partial ≠ covered');
  console.log('CLOSED_GAP_UC018_GRAPH: see pnpm uc018:graph:prove；AiGraphRun safely_terminated + 业务事实保全已钉；TTL closed via uc018:ttl:prove；UI+sole-stack still gap → matrix partial ≠ covered');
  console.log('CLOSED_GAP_UC018_TTL: see pnpm uc018:ttl:prove；TTL sweeper→abandoned+released 已钉；本 prove 仍 ≠ TTL dedicated；UI+sole-stack still gap → matrix partial ≠ covered');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
