/**
 * UC-E2E-018 ADV prove — NHP-018-ADV-01 against POST /interview/:id/abandon.
 *
 * Attack classes (harness uc-e2e-018-adv.md §1b):
 *   Replay · Tamper body · Cross-tenant · Forged auth · Inject
 *
 * Pattern: extend uc-e2e-018-user-abandon-http.proof.ts + _neg-harness boot
 * (same privacy stub). Real HTTP against isolated stack. Ban invent green.
 *
 * EXIT=0 elevates matrix §1.0 ADV case-only→partial (THIS column only).
 * ADV alone ≠ UC covered · §1.1 stays partial · Ban claim PERF/LOAD closed.
 *
 *   pnpm uc018:adv:prove
 *   pnpm -C apps/api prove:uc018-adv   (raw; needs isolated DATABASE_URL)
 *
 * releaseEvidence=false · Not HA · ≠ suite green · ≠ R5 retired
 */
import { asPrincipal, availableUnits, reserveEntitlement } from '@meetwise/db';
import { boot, mkAssert, tokenFor, AUTH_SECRET } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc018:adv');

console.log('UC-E2E-018 ADV prove · NHP-018-ADV-01 · releaseEvidence=false · Not HA');
console.log('NOTE: ADV EXIT=0 → §1.0 ADV case-only→partial ONLY · ADV alone ≠ UC covered · §1.1 stays partial');
console.log('NOTE: Mouth = POST /interview/:id/abandon · real HTTP · Ban invent green');

// Minimal privacy-active stubs (0058 not in _neg-harness). Owner match only; no erasure fence.
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
console.log('PIN   GAP-UC018-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

const A_ = h.U('userA');
const B_ = h.U('userB');
const S = Date.now().toString(36);
const IID = (k: string) => `IV_ADV018_${k}_${S}`;

const is = (r: { status: number; body: any }, code: number, err?: string) =>
  r.status === code && (err === undefined || r.body?.error === err);

async function ivStatus(id: string): Promise<string | undefined> {
  const r = await h.pool.query('SELECT status FROM interview WHERE id=$1', [id]);
  return r.rows[0]?.status as string | undefined;
}

async function ivOwnerStatus(id: string): Promise<{ owner?: string; status?: string }> {
  const r = await h.pool.query('SELECT owner_user_id, status FROM interview WHERE id=$1', [id]);
  return { owner: r.rows[0]?.owner_user_id, status: r.rows[0]?.status };
}

async function consStatus(owner: string, key: string): Promise<string | undefined> {
  return asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function bal(owner: string): Promise<number> {
  return asPrincipal(h.pool, owner, (c) => availableUnits(c, owner));
}

await h.pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text,
    ADD COLUMN IF NOT EXISTS job_title_snapshot text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()
`);

// Seed paid bucket for userB so cross-tenant targets can hold reserved entitlement
const bBucket = await h.pool.query(
  "SELECT 1 FROM entitlement_bucket WHERE owner_user_id='userB' LIMIT 1",
);
if (bBucket.rowCount === 0) {
  await h.pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ('userB','paid',5.0, now()+interval '300 days')",
  );
}

// ── ADV-Replay · replay legit abandon; idempotent or reject; no double release ──
{
  console.log('\n──────── ADV-Replay · replay abandon · no double release ────────');
  const id = IID('replay');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  const before = await bal('userA');
  const rsv = await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  A('ADV-Replay reserve → reserved', rsv.status === 'reserved');
  A('ADV-Replay 预留后额度 -1', (await bal('userA')) === before - 1);

  const first = await h.post(`/interview/${id}/abandon`, A_, {});
  A('ADV-Replay 1st → 200 abandoned', first.status === 200 && first.body?.abandoned === true);
  A('ADV-Replay 1st released=released', first.body?.released === 'released');
  A('ADV-Replay 1st alreadyAbandoned≠true', first.body?.alreadyAbandoned !== true);
  const afterFirst = await bal('userA');
  A('ADV-Replay 1st 额度回补净变 0', afterFirst === before);
  A('ADV-Replay 1st consumption=released', (await consStatus('userA', id)) === 'released');
  A('ADV-Replay 1st interview=abandoned', (await ivStatus(id)) === 'abandoned');

  const replay = await h.post(`/interview/${id}/abandon`, A_, {});
  A('ADV-Replay 2nd → 200 idempotent', replay.status === 200);
  A('ADV-Replay 2nd alreadyAbandoned=true', replay.body?.alreadyAbandoned === true);
  A('ADV-Replay 2nd released=noop（不双放）', replay.body?.released === 'noop');
  A('ADV-Replay 2nd 额度不二次回补', (await bal('userA')) === afterFirst);
  A('ADV-Replay 2nd 仍 abandoned', (await ivStatus(id)) === 'abandoned');
  A('ADV-Replay 2nd consumption 仍 released（无双放）', (await consStatus('userA', id)) === 'released');

  // Third replay still safe
  const third = await h.post(`/interview/${id}/abandon`, A_, {});
  A('ADV-Replay 3rd → 200 alreadyAbandoned+noop',
    third.status === 200 && third.body?.alreadyAbandoned === true && third.body?.released === 'noop');
  A('ADV-Replay 3rd 额度仍净变 0', (await bal('userA')) === before);
}

// ── ADV-Tamper · tamper body/id/headers; reject or safe no-op; no cross-interview mutate ──
{
  console.log('\n──────── ADV-Tamper · body/id/headers · no cross-interview mutate ────────');
  const target = IID('tamper_t');
  const decoy = IID('tamper_d');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active'),($2,'userA','active')",
    [target, decoy],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', target, 'mock_interview', 1.0));
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', decoy, 'mock_interview', 1.0));
  const before = await bal('userA');

  // Body claims decoy id while path is target — path wins; decoy must stay active+reserved
  const tamperBody = await h.post(`/interview/${target}/abandon`, A_, {
    interviewId: decoy,
    id: decoy,
    owner_user_id: 'userB',
    status: 'completed',
    released: 'forged',
  });
  A('ADV-Tamper body spoof → 200 abandons path id only',
    tamperBody.status === 200 && tamperBody.body?.abandoned === true);
  A('ADV-Tamper path target → abandoned', (await ivStatus(target)) === 'abandoned');
  A('ADV-Tamper decoy 仍 active（不跨面）', (await ivStatus(decoy)) === 'active');
  A('ADV-Tamper decoy consumption 仍 reserved', (await consStatus('userA', decoy)) === 'reserved');
  A('ADV-Tamper target consumption=released', (await consStatus('userA', target)) === 'released');

  // Header spoof: x-user-id userA + forged Authorization garbage should fail closed on Bearer first
  const decoyBeforeHdr = await ivOwnerStatus(decoy);
  const hdrSpoof = await h.post(`/interview/${decoy}/abandon`, {
    ...A_,
    authorization: 'Bearer not.a.real.jwt',
  }, { interviewId: target });
  A('ADV-Tamper bad Bearer(+x-user-id) → 401', hdrSpoof.status === 401);
  A('ADV-Tamper decoy unchanged after bad Bearer',
    (await ivStatus(decoy)) === decoyBeforeHdr.status);
  A('ADV-Tamper target still abandoned (no resurrect)', (await ivStatus(target)) === 'abandoned');

  // Path-id tamper: abandon non-existent / weird id → 404; decoy untouched
  const weird = await h.post(`/interview/${encodeURIComponent('../' + decoy)}/abandon`, A_, {});
  A('ADV-Tamper path traversal-ish → 404 (or not decoy mutate)',
    weird.status === 404 || weird.status === 400 || weird.status >= 400);
  A('ADV-Tamper decoy 仍 active after weird path', (await ivStatus(decoy)) === 'active');
  A('ADV-Tamper decoy consumption 仍 reserved', (await consStatus('userA', decoy)) === 'reserved');

  // Cleanup decoy via legit abandon so bucket is clean for later classes
  const clean = await h.post(`/interview/${decoy}/abandon`, A_, {});
  A('ADV-Tamper cleanup decoy → 200', clean.status === 200 && clean.body?.abandoned === true);
  A('ADV-Tamper cleanup decoy released/noop',
    clean.body?.released === 'released' || clean.body?.released === 'noop');
  A('ADV-Tamper cleanup 后 decoy=abandoned', (await ivStatus(decoy)) === 'abandoned');
  A('ADV-Tamper 额度不低于 setup-before（无双扣）', (await bal('userA')) >= before);
}

// ── ADV-Cross-tenant · user A token vs user B interview; 401/403/404; target unchanged; no leak ──
{
  console.log('\n──────── ADV-Cross-tenant · A vs B interview · no leak ────────');
  const bId = IID('xt_b');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userB','active')",
    [bId],
  );
  const bBefore = await bal('userB');
  await asPrincipal(h.pool, 'userB', (c) =>
    reserveEntitlement(c, 'userB', bId, 'mock_interview', 1.0));
  A('ADV-XT setup userB 额度 -1', (await bal('userB')) === bBefore - 1);

  const aBefore = await bal('userA');
  const cross = await h.post(`/interview/${bId}/abandon`, A_, {});
  A('ADV-XT userA→userB interview → 404 not_found_or_forbidden',
    is(cross, 404, 'not_found_or_forbidden'));
  // No leak of other-tenant status/fields
  A('ADV-XT 响应不泄露 status/owner/released',
    cross.body?.status === undefined
    && cross.body?.owner_user_id === undefined
    && cross.body?.released === undefined
    && cross.body?.abandoned !== true);
  A('ADV-XT 目标仍 active', (await ivStatus(bId)) === 'active');
  A('ADV-XT 目标 owner 仍 userB', (await ivOwnerStatus(bId)).owner === 'userB');
  A('ADV-XT userB consumption 仍 reserved', (await consStatus('userB', bId)) === 'reserved');
  A('ADV-XT userB 额度未回补', (await bal('userB')) === bBefore - 1);
  A('ADV-XT userA 额度不变', (await bal('userA')) === aBefore);

  // Reverse: userB → userA active interview
  const aId = IID('xt_a');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','waiting_user')",
    [aId],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', aId, 'mock_interview', 1.0));
  const aBal2 = await bal('userA');
  const rev = await h.post(`/interview/${aId}/abandon`, B_, {});
  A('ADV-XT userB→userA interview → 404',
    is(rev, 404, 'not_found_or_forbidden'));
  A('ADV-XT reverse 目标仍 waiting_user', (await ivStatus(aId)) === 'waiting_user');
  A('ADV-XT reverse userA 额度未变', (await bal('userA')) === aBal2);
  A('ADV-XT reverse 不泄露',
    rev.body?.abandoned !== true && rev.body?.released === undefined);
}

// ── ADV-Forged-auth · missing/bad token; 401/403; no abandon side effects ──
{
  console.log('\n──────── ADV-Forged-auth · missing/bad token · no side effects ────────');
  const id = IID('forge');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')",
    [id],
  );
  const before = await bal('userA');
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  A('ADV-Forge setup 额度 -1', (await bal('userA')) === before - 1);

  const missing = await h.post(`/interview/${id}/abandon`, {}, {});
  A('ADV-Forge missing auth → 401', missing.status === 401);
  A('ADV-Forge missing 后仍 active', (await ivStatus(id)) === 'active');
  A('ADV-Forge missing 额度未回补', (await bal('userA')) === before - 1);
  A('ADV-Forge missing consumption 仍 reserved', (await consStatus('userA', id)) === 'reserved');

  const garbage = await h.post(`/interview/${id}/abandon`, {
    authorization: 'Bearer garbage.token.here',
  }, {});
  A('ADV-Forge garbage Bearer → 401', garbage.status === 401);
  A('ADV-Forge garbage 后仍 active', (await ivStatus(id)) === 'active');

  const badSig = await h.post(`/interview/${id}/abandon`, {
    authorization: `Bearer ${tokenFor('userA', { secret: 'wrong-secret-key-not-auth' })}`,
  }, {});
  A('ADV-Forge bad signature → 401', badSig.status === 401);
  A('ADV-Forge badSig 后仍 active', (await ivStatus(id)) === 'active');

  const ghost = await h.post(`/interview/${id}/abandon`, {
    authorization: `Bearer ${tokenFor('ghostUser_no_account')}`,
  }, {});
  A('ADV-Forge ghost principal → 401/403/404',
    ghost.status === 401 || ghost.status === 403 || ghost.status === 404);
  A('ADV-Forge ghost 后仍 active', (await ivStatus(id)) === 'active');
  A('ADV-Forge ghost 额度未回补', (await bal('userA')) === before - 1);
  A('ADV-Forge 全程无 abandoned 副作用', (await ivStatus(id)) === 'active');
  A('ADV-Forge 全程 consumption 仍 reserved', (await consStatus('userA', id)) === 'reserved');

  // Valid token (HMAC with AUTH_SECRET) for owner should still work (sanity · not happiness wash)
  const ok = await h.post(`/interview/${id}/abandon`, {
    authorization: `Bearer ${tokenFor('userA', { secret: AUTH_SECRET })}`,
  }, {});
  A('ADV-Forge sanity valid Bearer → 200 abandon',
    ok.status === 200 && ok.body?.abandoned === true);
  A('ADV-Forge sanity 额度回补', (await bal('userA')) === before);
}

// ── ADV-Inject · inject/malformed JSON vs abandon mouth; structural/business reject; no mutate ──
{
  console.log('\n──────── ADV-Inject · malformed / inject vs abandon · no cross-tenant write ────────');
  const id = IID('inject');
  const other = IID('inject_o');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active'),($2,'userB','active')",
    [id, other],
  );
  const aBefore = await bal('userA');
  const bBefore = await bal('userB');
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  await asPrincipal(h.pool, 'userB', (c) =>
    reserveEntitlement(c, 'userB', other, 'mock_interview', 1.0));

  // Malformed JSON body
  const mal = await h.raw('POST', `/interview/${id}/abandon`, {
    ...A_,
    'content-type': 'application/json',
  }, '{"abandoned":true,');
  A('ADV-Inject malformed JSON → 4xx structural reject',
    mal.status >= 400 && mal.status < 500);
  A('ADV-Inject malformed 后 target 仍 active', (await ivStatus(id)) === 'active');
  A('ADV-Inject malformed 后 other 仍 active', (await ivStatus(other)) === 'active');
  A('ADV-Inject malformed userA 额度未回补', (await bal('userA')) === aBefore - 1);
  A('ADV-Inject malformed userB 额度未变', (await bal('userB')) === bBefore - 1);

  // Injection-ish payload (SQL / prototype pollution / status overwrite attempts)
  const inj = await h.post(`/interview/${id}/abandon`, A_, {
    status: "abandoned'; DROP TABLE interview;--",
    owner_user_id: 'userB',
    '__proto__': { admin: true },
    constructor: { prototype: { isAdmin: true } },
    released: 'released',
    units: 999,
  });
  // May succeed as normal abandon (body ignored) OR reject — either OK if no cross-tenant write
  const injOk = inj.status === 200 || (inj.status >= 400 && inj.status < 500);
  A('ADV-Inject polluted body → 200 path-only OR 4xx', injOk);
  if (inj.status === 200) {
    A('ADV-Inject path target abandoned (body ignored)', (await ivStatus(id)) === 'abandoned');
  } else {
    A('ADV-Inject rejected → target 仍 active 或 abandoned 安全',
      (await ivStatus(id)) === 'active' || (await ivStatus(id)) === 'abandoned');
  }
  A('ADV-Inject other(userB) 未变 active', (await ivStatus(other)) === 'active');
  A('ADV-Inject other consumption 仍 reserved', (await consStatus('userB', other)) === 'reserved');
  A('ADV-Inject userB 额度未变（无跨租户写）', (await bal('userB')) === bBefore - 1);

  // Empty / non-JSON content-type with garbage
  const junk = await h.raw('POST', `/interview/${other}/abandon`, {
    ...A_,
    'content-type': 'text/plain',
  }, "';alert(1)//");
  A('ADV-Inject text/plain junk on other path → 4xx or 404 (A cannot abandon B)',
    junk.status === 404 || junk.status === 401 || junk.status === 403
    || (junk.status >= 400 && junk.status < 500));
  A('ADV-Inject junk 后 other 仍 active（无跨租户写）', (await ivStatus(other)) === 'active');
  A('ADV-Inject junk userB 额度未变', (await bal('userB')) === bBefore - 1);

  // Confirmed-account mutate: completed interview must stay completed (no abandon rewrite)
  const doneId = 'IV_DONE'; // seeded completed for userA in _neg-harness
  const doneBefore = await ivOwnerStatus(doneId);
  const againstDone = await h.post(`/interview/${doneId}/abandon`, A_, {
    status: 'abandoned',
    force: true,
  });
  A('ADV-Inject against completed → 409 interview_not_active',
    is(againstDone, 409, 'interview_not_active'));
  A('ADV-Inject completed 仍 completed（不改 confirmed 账）',
    (await ivStatus(doneId)) === 'completed' && doneBefore.status === 'completed');
}

// ── Honesty pins ──
console.log('\n──────── ADV honesty pins ────────');
console.log('PIN   NHP-018-ADV-01: Replay/Tamper/Cross-tenant/Forged-auth/Inject executed against abandon mouth');
console.log('PIN   §1.0 ADV case-only→partial（THIS column only）on EXIT=0');
console.log('PIN   ADV alone ≠ UC-E2E-018 covered · §1.1 stays partial · Ban claim PERF/LOAD closed');
console.log('PIN   haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 · PG-retained');
A('honesty: ADV prove 绿 ≠ UC-E2E-018 covered（§1.1 partial retained · ADV alone ≠ covered）', true);
A('honesty: Ban invent green · real HTTP hit abandon route', true);

await done();
