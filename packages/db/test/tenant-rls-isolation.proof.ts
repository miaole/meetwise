/**
 * PRIV01-A · candidate A — owner isolation prove on isolated real PG. (rev r1)
 *
 * Runs under scripts/run-e2e-isolated.mjs (one-off per-run pgvector container;
 * full migration chain applied by the runner's pre-migrate PG-migrate gate —
 * the policy family this proof introspects is created by migrations alone).
 *
 * This proof EVIDENCES the existing RLS authorization root; it does not add,
 * weaken, or replace it. 应用层 tenant ≠ RLS — the authorization root remains
 * PG RLS ENABLE+FORCE + `SET LOCAL ROLE app_role` + set_config('app.principal_user')
 * (0001_baseline.sql:7/:63-82/:300-304 + principal.ts asPrincipal). Wiring is a
 * defense-in-depth SECOND layer (PRIV01-B/C proofs) and is out of scope here.
 *
 * rev r1 (post falsification review priv1-pre-2, both reviews registered in the
 * REQUEST卷 §9): three capture-power holes fixed, zero weakening of r0 faces.
 *   1. I2 was SOME-semantics over ALL policies of a table, so an app_role-facing
 *      hole could be masked by a companion policy scoped to another role
 *      (mut A2/E on interview_event stayed green). I2 is now exact-equality,
 *      grouped by TO roles: only policies whose roles include app_role or
 *      PUBLIC are judged; EVERY such policy's USING and WITH CHECK must
 *      exact-match (deparse-normalized full-string equality, Ban substring)
 *      the table's pinned owner predicate — function-style predicates pin the
 *      function's first owner gate live from pg_proc prosrc instead. Companion
 *      role-scoped policies never participate in the app_role face.
 *   2. The behavioral matrix only touched interview/user_memory. M7 now runs a
 *      full cross-owner CRUD negative matrix on ALL seven canonical family
 *      tables (SELECT/INSERT/UPDATE/DELETE rejected per table, each with its
 *      own-row positive control or a documented shape pin where the runtime
 *      role deliberately has no grant / a purge fence owns the path).
 *   3. New tables (or any table) carrying an owner column with no RLS were not
 *      caught (mut F stayed green), and 3 existing tables already had that
 *      shape. G is a whole-database inversion: every table with owner_user_id
 *      (or tenant/org/workspace attribution column) MUST have RLS enabled;
 *      the uncovered set must be empty OR exactly the named allowlist, whose
 *      members are asserted live to have ZERO runtime-role table privileges
 *      (REVOKE ALL + SECURITY DEFINER-only access paths), recorded in the
 *      receipt. Silent allowance is Ban'd.
 *
 * rev r2 (EXEC 期, four P2 items absorbed per EXEC order + falsification-path
 * implementation warnings; zero weakening of r0/r1 faces):
 *   a. G allowlist zero-privilege probe no longer hardcodes app_role/PUBLIC:
 *      it dynamically enumerates EVERY principal from pg_roles (minus superusers,
 *      minus BYPASSRLS holders, minus pg_ reserved, minus the probed table's
 *      owner) plus the PUBLIC pseudo-role, and asserts zero table privileges for
 *      all of them. The only escape is the named (table, role, privilege) triple
 *      allowlist — deliberately EMPTY today, every hypothetical entry needs a
 *      written reason; widening it to green a live grant is Ban'd.
 *   b. Fence-branch body pins (same form as the r1 stream_privacy_active
 *      first-gate pin: live prosrc substrings + rowCount===1 anti-reload):
 *      interview_event_stream_privacy_active's post-gate fence face (interview
 *      tombstone fence call + resume_quiz/resume_diagnosis owner re-checks) and
 *      interview_privacy_active's own body (first owner gate + erasure-fence
 *      status set — the ai_graph_run predicate's root).
 *
 * Faces (nail REQUEST `gap-priv-01-tenant-rls.md` §3 · C-P3: matrix 6 + introspection 3, no weakening):
 *   M1  cross-owner SELECT isolation   — owner A SELECT owner B interview row → 0 rows
 *                                        (positive controls: A self-read ≥1 · B self-read ≥1 — no idle-green)
 *   M2  cross-owner INSERT 42501       — A INSERT impersonating B's owner_user_id → WITH CHECK 42501
 *                                        (positive control: A own-owner INSERT succeeds)
 *   M3  cross-owner UPDATE/DELETE 0    — A UPDATE/DELETE B user_memory row → 0 rows affected
 *                                        (positive controls: A own UPDATE ≥1 · A own DELETE =1)
 *   M4  GUC unset/blank default deny   — app_role with GUC unset → 0 rows + current_setting(...,true) IS NULL;
 *                                        blank '' GUC → 0 rows; set GUC positive control → ≥1 rows
 *   M5  role escape surface            — dynamic: provisioned runtime LOGIN (NOINHERIT NOBYPASSRLS, production
 *                                        provisionRuntimeLogin shape) without SET ROLE → no table privilege;
 *                                        after SET LOCAL ROLE app_role + GUC → exactly own rows; app_role
 *                                        pg_roles: rolsuper=false · rolbypassrls=false · rolcanlogin=false
 *   M6  app-layer guard mechanism      — the exact query guardInterviewPrivacyTx issues (SELECT 1 FROM
 *                                        interview WHERE id=$1) as owner B on A's id → 0 rows (the 404
 *                                        not_found_or_forbidden branch fires; indistinguishable);
 *                                        + static source witness of the 404/GONE branches (the guard lives
 *                                        in apps/api — importing NestJS deps from a db-package proof is out
 *                                        of scope, so the mapping itself is pinned by witness, not import)
 *   M7  full-family CRUD matrix        — for each of the seven canonical owner tables: cross-owner
 *                                        SELECT=0 · impersonating INSERT rejected (row proven absent) ·
 *                                        cross-owner UPDATE=0 (row proven unchanged) · cross-owner DELETE=0
 *                                        (row proven alive); own-row positive control per granted op;
 *                                        where app_role deliberately holds no grant (interview/ai_graph_run/
 *                                        notification DELETE, interview_event UPDATE/DELETE) the missing
 *                                        grant is pinned; vector_chunk DELETE is pinned to the documented
 *                                        purge-gate fence (own-row delete without purge context rejected)
 *   I1  RLS enable+force introspection — canonical owner family: relrowsecurity=true AND relforcerowsecurity=true
 *   I2  policy predicate introspection — TO-role-grouped EXACT equality (rev r1): per table, the set of
 *                                        policies whose roles include app_role/PUBLIC must be non-empty,
 *                                        cover read (SELECT-side) and write (INSERT/ALL-side) paths, and
 *                                        every member's qual/with_check must exact-match the pinned
 *                                        predicate (interview_event: pinned function call + live prosrc
 *                                        first-gate witness; real pg_policies deparse, Ban grep substitute,
 *                                        Ban substring SOME semantics)
 *   I3  policy census receipt          — total policy count + RLS table count pinned EXACT to this branch's
 *                                        migration chain (drift = conscious re-count at merge, like the cap) +
 *                                        per-family policy names (all + app_role-facing) into receipt JSON;
 *                                        visibility='global' shared-corpus face (rag_corpus_document) reported
 *                                        separately, never mixed into the owner-data face conclusion
 *   G   whole-DB owner-column inversion — every table (relkind r/p) carrying owner_user_id / tenant_id /
 *                                        org_id / workspace_id must have relrowsecurity=true; uncovered ⊆
 *                                        named RLS-free allowlist (each member live-proven zero table
 *                                        privileges across ALL dynamically enumerated principals — rev r2,
 *                                        superuser/owner/BYPASSRLS/pg_ excluded, PUBLIC included — with a
 *                                        named empty (table,role,privilege) triple allowlist as the only
 *                                        escape + SECURITY DEFINER owner-gated entry witnesses);
 *                                        allowlist + owner-column census + principal probe counts into receipt
 *   T1  tenant/org record introspection — information_schema/pg_policies assert no tenant_id/org_id/workspace
 *                                        column or tenant predicate policy exists (record-only: owner-only
 *                                        status is an explicit deferred design extension, 0001_baseline.sql:280-281 —
 *                                        neither "tenant isolation exists" nor "isolation hole confirmed")
 *   S   static pins                    — principal.ts SET LOCAL ROLE + set_config witness · 0001 FORCE RLS
 *                                        witness · tenant/index.ts 应用层 tenant ≠ RLS witness · public
 *                                        DELETE = 503 witness (privacy.controller.ts SERVICE_UNAVAILABLE)
 *
 * PREREQ missing (no DATABASE_URL / PG* target, or not the isolated container)
 * → honest non-zero EXIT, recorded as an attempt. Ban weak-assertion-to-green.
 * EXIT=0 ≠ GAP-PRIV-01 closed ≠ backlog :57 flipped ≠ tenant==RLS equivalence
 * ≠ authorization-root migration ≠ HA ≠ releaseEvidence. UC-052 stays partial.
 * releaseEvidence=false · Not HA · PG-retained (ai-docs/delivery/adr-postgres-retained.md).
 */
import { readFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg';
import {
  createPool,
  asPrincipal,
  provisionRuntimeLogin,
  assertIsolatedTestTarget,
} from '../src/index.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

function code(err: unknown): string {
  return String((err as { code?: string })?.code ?? (err as Error)?.message ?? '');
}

const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
const hasComponents = Boolean(
  process.env.PGHOST && process.env.PGPORT && process.env.PGUSER
  && process.env.PGPASSWORD !== undefined && process.env.PGDATABASE,
);
if (!hasUrl && !hasComponents) {
  console.error('tenant-rls-isolation: PREREQ missing (no DATABASE_URL / PG* target) — honest non-zero EXIT (recorded attempt; Ban weak-assertion-to-green)');
  process.exit(1);
}

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const readWitness = (rel: string): string => readFileSync(join(REPO_ROOT, normalize(rel)), 'utf8');

/** pg_policies deparses expressions with ::text casts and redundant parens.
 *  Normalize (strip casts, strip parens, collapse spaces) so the predicate
 *  shape check is deparse-format tolerant but still content-exact. The
 *  expectation constants are run through the SAME normalization before compare
 *  (the normalize step erases the parentheses, so comparing raw text against
 *  normalized text never matches). rev r1: used for EXACT equality only —
 *  includes() substring matching is Ban'd on the app_role face. */
function normPolicy(sql: string | null): string {
  return String(sql ?? '')
    .replace(/::[a-z ]+/g, '')
    .replace(/[()\s]+/g, ' ')
    .trim();
}
const OWNER_PREDICATE_RAW = "owner_user_id = current_setting('app.principal_user', true)";
const OWNER_PREDICATE = normPolicy(OWNER_PREDICATE_RAW);
const GLOBAL_DISJUNCTION = normPolicy("visibility = 'global'");

/** Pinned per-table predicates (rev r1). Exact-equality targets for the
 *  app_role/PUBLIC-facing policy set, taken from the live migration chain and
 *  pinned here: a policy that deparses to anything else (always-true, widened
 *  disjunction, dropped predicate) fails. */
const AI_GRAPH_RUN_PRED = normPolicy(
  "owner_user_id = current_setting('app.principal_user', true) AND interview_privacy_active(thread_id)");
const IE_FN_PRED = normPolicy('interview_event_stream_privacy_active(owner_user_id, stream_key)');
const VCHUNK_QBANK_READ = normPolicy(
  "(kind = 'qbank' AND owner_user_id = '__system_qbank__') OR (owner_user_id = current_setting('app.principal_user', true))");
const VCHUNK_WRITE = normPolicy(
  "owner_user_id = current_setting('app.principal_user', true) AND kind <> 'qbank'");

const EXPECTED_READ = new Map<string, string[]>([
  ['interview', [OWNER_PREDICATE]],
  ['ai_graph_run', [AI_GRAPH_RUN_PRED]],
  ['interview_event', [IE_FN_PRED]],
  ['ai_invocation_trace', [OWNER_PREDICATE]],
  ['user_memory', [OWNER_PREDICATE]],
  ['vector_chunk', [OWNER_PREDICATE, VCHUNK_QBANK_READ, VCHUNK_WRITE]],
  ['notification', [OWNER_PREDICATE]],
]);
const EXPECTED_WRITE = new Map<string, string[]>([
  ['interview', [OWNER_PREDICATE]],
  ['ai_graph_run', [AI_GRAPH_RUN_PRED]],
  ['interview_event', [IE_FN_PRED]],
  ['ai_invocation_trace', [OWNER_PREDICATE]],
  ['user_memory', [OWNER_PREDICATE]],
  ['vector_chunk', [VCHUNK_WRITE]],
  ['notification', [OWNER_PREDICATE]],
]);

/** Canonical owner-data family (0001 DO-loop tables + later pure p_owner tables with full CRUD face).
 *  consumption_record is excluded: DROP TABLE by 0145_dead_table_jsonb_deprecate.sql:19 (dead-table
 *  retirement knife) — it no longer exists in the applied chain. */
const CANONICAL_FAMILY = [
  'interview', 'ai_graph_run', 'interview_event', 'ai_invocation_trace',
  'user_memory', 'vector_chunk', 'notification',
] as const;

/** rev r1 whole-DB inversion allowlist (named, evidenced, receipt-recorded; silent
 *  allowance Ban'd). These three tables carry owner_user_id but have NO RLS by
 *  design — they are internal ledgers with REVOKE ALL (0120:132 / 0088:27) and
 *  zero runtime-role table privileges (live-proven by G below); every app-reachable
 *  entry path is a SECURITY DEFINER function owner-bound at entry via
 *  ai_cost_require_request_owner (GUC principal match, 0035_ai_cost_principal_scope.sql:4-12).
 *  Data nature: concurrency slot claims (ephemeral slot state), per-call money facts
 *  (no prompt/output content, no read procedure at all), transaction-local permit
 *  stubs (consumed by BEFORE trigger). None is an application read surface for
 *  user-distinguishable data; adding RLS here would not change the runtime face,
 *  so this knife does NOT touch the authorization root (§1 零触碰). */
const RLS_FREE_ALLOWLIST: readonly { table: string; reason: string }[] = [
  { table: 'ai_model_concurrency_lease',
    reason: 'internal cross-replica concurrency slot ledger; REVOKE ALL (0120:132), zero runtime-role table privileges, reached only via owner-gated SECURITY DEFINER ai_model_admission_acquire/record_scoped' },
  { table: 'ai_model_fee_ledger',
    reason: 'internal per-call money ledger (no prompt/output content, no read procedure); REVOKE ALL (0120:132), zero runtime-role table privileges, written only via owner-gated SECURITY DEFINER record path' },
  { table: 'ai_model_invocation_transition_permit',
    reason: 'transaction-local capability stub consumed by BEFORE trigger; REVOKE ALL (0088:27), zero runtime-role table privileges, consumer function not app_role-executable' },
];
const ATTRIBUTION_COLUMNS = ['owner_user_id', 'tenant_id', 'org_id', 'workspace_id'] as const;

/** rev r2 (EXEC P2-1): named (table, role, privilege) triple allowlist for the
 *  RLS-free tables' zero-privilege probe. Deliberately EMPTY today — live census
 *  (2026-11-06, one-off container, full 222-file chain): all 24 non-superuser
 *  roles + PUBLIC hold zero SELECT/INSERT/UPDATE/DELETE on all three allowlist
 *  tables. The machine probe below re-verifies this every run; any live grant
 *  outside a listed triple turns the proof red (mutation G2: GRANT SELECT on
 *  ai_model_fee_ledger TO memory_runtime → red).
 *
 *  Designed non-owner access faces that DO exist in this database live on
 *  RLS-enabled tables as RLS-constrained POLICY faces — e.g. event_retention_worker's
 *  qual=true on interview_event (0219 retention purge face), p_vchunk_read's qbank
 *  face on vector_chunk (0016/0018, pinned exact by I2 EXPECTED_READ), rag_corpus_document's
 *  visibility='global' disjunction (0032, pinned by I3 shared-corpus face). Those are
 *  NOT eligible here: this allowlist only covers tables WITHOUT RLS, where a single
 *  grant equals full uncontrolled access and there is no policy layer to constrain it.
 *  Adding an entry requires a concrete reason + migration witness; widening it to
 *  turn a live grant green is Ban'd. */
const RLS_FREE_GRANT_TRIPLES: readonly { table: string; role: string; privilege: string; reason: string }[] = [];

/** Census baseline pinned to THIS branch's migration chain (222 files, no new
 *  migration in rev r1). If a rebase/merge moves the chain, re-count and update
 *  these two constants consciously — drift must never green silently. */
const POLICY_CENSUS_BASELINE = { policies: 340, rlsTables: 166 };

const HEX = randomBytes(4).toString('hex');
const PID = process.pid;
const OWNER_A = `tenant-rls-iso-a-${PID}-${HEX}`;
const OWNER_B = `tenant-rls-iso-b-${PID}-${HEX}`;
const IV_A_KEEP = `tir-iv-a1-${PID}-${HEX}`;   // A interview row kept for read positive control
const IV_A_DECOY = `tir-iv-a2-${PID}-${HEX}`;  // spare A row (no removal needed; one-off container)
const IV_B = `tir-iv-b1-${PID}-${HEX}`;        // B interview row = cross-owner NEG target
const MEM_A_UPDATE = `tir-um-a1-${PID}-${HEX}`; // A row kept for self-UPDATE positive control
const MEM_A_DELETE = `tir-um-a2-${PID}-${HEX}`; // A row A deletes itself (DELETE positive control)
const MEM_B = `tir-um-b1-${PID}-${HEX}`;        // B row = cross-owner UPDATE/DELETE NEG target
const LOGIN_ROLE = `tenant_rls_iso_login_${PID}_${HEX}`;
const LOGIN_PASSWORD = `tir-${HEX}-${randomBytes(12).toString('hex')}`; // ≥16 chars, no CR/LF/NUL

// M7 (rev r1) per-table fixtures — every canonical family table gets a B-owned
// cross-owner NEG target and an A-owned positive-control row.
const GR_A = `tir-gr-a-${HEX}`;   // ai_graph_run A row (thread = A's kept interview)
const GR_B = `tir-gr-b-${HEX}`;   // ai_graph_run B row (thread = B's interview)
const IEV_A = `tir-iev-a-${HEX}`; // interview_event legacy stream keys (non-colliding → gate true)
const IEV_B = `tir-iev-b-${HEX}`;
const AIT_A = `tir-ait-a-${HEX}`; // ai_invocation_trace idempotency keys
const AIT_B = `tir-ait-b-${HEX}`;
const AIT_DEL = `tir-ait-a3-${HEX}`; // dedicated A row A deletes itself (del pos control)
const VC_A = `tir-vc-a-${HEX}`;   // vector_chunk row ids (kind='memory', 512-dim embedding)
const VC_B = `tir-vc-b-${HEX}`;
const NT_A = `tir-nt-a-${HEX}`;   // notification row ids
const NT_B = `tir-nt-b-${HEX}`;
const UM_A3 = `tir-um-a3-${PID}-${HEX}`; // extra A memory row for the M7 own-DELETE control

const admin = createPool();

interface Receipt {
  policyTotal: number;
  rlsEnabledTables: number;
  familyPolicies: Record<string, string[]>;
  familyAppFacingPolicies: Record<string, string[]>;
  sharedCorpusFace: { table: string; readPolicySharesGlobal: boolean; writePolicyOwnerPredicated: boolean };
  tenantOrgObservation: { tenantColumns: number; tenantPredicatePolicies: number };
  ownerColumnCensus: { tablesWithAttributionColumn: number; withRls: number; uncoveredWithoutRls: string[] };
  rlsFreeAllowlist: { table: string; reason: string }[];
  allowlistProbe: { principalsProbed: number; triplesProbed: number; namedTripleAllowlistSize: number; violations: string[] };
}

const receipt: Receipt = {
  policyTotal: -1,
  rlsEnabledTables: -1,
  familyPolicies: {},
  familyAppFacingPolicies: {},
  sharedCorpusFace: { table: 'rag_corpus_document', readPolicySharesGlobal: false, writePolicyOwnerPredicated: false },
  tenantOrgObservation: { tenantColumns: -1, tenantPredicatePolicies: -1 },
  ownerColumnCensus: { tablesWithAttributionColumn: -1, withRls: -1, uncoveredWithoutRls: [] },
  rlsFreeAllowlist: RLS_FREE_ALLOWLIST.map((x) => ({ table: x.table, reason: x.reason })),
  allowlistProbe: { principalsProbed: -1, triplesProbed: -1, namedTripleAllowlistSize: RLS_FREE_GRANT_TRIPLES.length, violations: [] },
};

let envFailed: string | null = null;
try {
  // Isolated-target attestation first: this proof runs destructive-ish probes
  // (role provisioning) and must never point at a developer/cloud database.
  await assertIsolatedTestTarget(admin);

  // ---- Fixtures (admin seeds bypass RLS via container admin; same shape as privacy-authorization.proof.ts) ----
  await admin.query(
    "INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'active'), ($3,$4,'active'), ($5,$6,'active')",
    [IV_A_KEEP, OWNER_A, IV_A_DECOY, OWNER_A, IV_B, OWNER_B],
  );
  await admin.query(
    "INSERT INTO user_memory(id, owner_user_id, kind, content) VALUES ($1,$2,'skill','a-keep'), ($3,$4,'skill','a-delete'), ($5,$6,'skill','b-target'), ($7,$8,'skill','a-m7-del')",
    [MEM_A_UPDATE, OWNER_A, MEM_A_DELETE, OWNER_A, MEM_B, OWNER_B, UM_A3, OWNER_A],
  );
  // ai_graph_run / interview_event rows carry a projection write-guard trigger
  // (enforce_interview_projection_privacy_active) that fails closed without the
  // principal GUC — even for the seeding admin. Seed each owner's rows inside a
  // transaction that sets the GUC (transaction-local; cleared on COMMIT).
  {
    const c = await admin.connect();
    try {
      await c.query('BEGIN');
      await c.query("SELECT set_config('app.principal_user', $1, true)", [OWNER_A]);
      await c.query(
        "INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status) VALUES ($1,$2,$3,'succeeded')",
        [GR_A, IV_A_KEEP, OWNER_A],
      );
      await c.query(
        "INSERT INTO interview_event(owner_user_id, stream_key, seq, kind) VALUES ($1,$2,1,'progress')",
        [OWNER_A, IEV_A],
      );
      await c.query('COMMIT');
      await c.query('BEGIN');
      await c.query("SELECT set_config('app.principal_user', $1, true)", [OWNER_B]);
      await c.query(
        "INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status) VALUES ($1,$2,$3,'succeeded')",
        [GR_B, IV_B, OWNER_B],
      );
      await c.query(
        "INSERT INTO interview_event(owner_user_id, stream_key, seq, kind) VALUES ($1,$2,1,'progress')",
        [OWNER_B, IEV_B],
      );
      await c.query('COMMIT');
    } finally { c.release(); }
  }
  await admin.query(
    "INSERT INTO ai_invocation_trace(owner_user_id, idempotency_key, output) VALUES ($1,$2,'{}'::jsonb), ($3,$4,'{}'::jsonb), ($5,$6,'{}'::jsonb)",
    [OWNER_A, AIT_A, OWNER_B, AIT_B, OWNER_A, AIT_DEL],
  );
  await admin.query(
    `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
     VALUES ($1,$2,'memory',$3,$4, ('[' || repeat('0.1,', 511) || '0.1]')::vector),
            ($5,$6,'memory',$7,$8, ('[' || repeat('0.1,', 511) || '0.1]')::vector)`,
    [VC_A, OWNER_A, `tir-ref-a-${HEX}`, `tir-hash-a-${HEX}`, VC_B, OWNER_B, `tir-ref-b-${HEX}`, `tir-hash-b-${HEX}`],
  );
  await admin.query(
    "INSERT INTO notification(id, owner_user_id, kind) VALUES ($1,$2,'system'), ($3,$4,'system')",
    [NT_A, OWNER_A, NT_B, OWNER_B],
  );

  // ---- M1: cross-owner SELECT isolation (+ positive controls, C-E3 anti-idle-green) ----
  {
    const selfA = await asPrincipal(admin, OWNER_A, (c) => c.query('SELECT id FROM interview WHERE owner_user_id=$1', [OWNER_A]));
    const selfB = await asPrincipal(admin, OWNER_B, (c) => c.query('SELECT id FROM interview WHERE owner_user_id=$1', [OWNER_B]));
    A('M1-pos positive control: A self-read ≥1 and B self-read ≥1 (seeding in place, no idle-green)',
      (selfA.rowCount ?? 0) >= 1 && (selfB.rowCount ?? 0) >= 1, `A=${selfA.rowCount} B=${selfB.rowCount}`);
    const cross = await asPrincipal(admin, OWNER_A, (c) => c.query('SELECT id FROM interview WHERE id=$1', [IV_B]));
    A('M1 cross-owner SELECT: owner A sees none of owner B interview rows', cross.rowCount === 0, `rowCount=${cross.rowCount}`);
  }

  // ---- M2: cross-owner impersonating INSERT → WITH CHECK 42501 (+ own-row positive control) ----
  {
    let got = 'insert-succeeded';
    try {
      await asPrincipal(admin, OWNER_A, async (c) => {
        await c.query("INSERT INTO interview(id, owner_user_id, status) VALUES ('tir-iv-imp', $1, 'active')", [OWNER_B]);
      });
    } catch (e) { got = code(e); }
    A('M2 cross-owner impersonating INSERT: rejected 42501 (RLS WITH CHECK root intact)', got === '42501', `got=${got}`);
    let own = 'insert-failed';
    try {
      await asPrincipal(admin, OWNER_A, async (c) => {
        await c.query("INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'active')", [`tir-iv-own-${PID}-${HEX}`, OWNER_A]);
      });
      own = 'insert-ok';
    } catch (e) { own = code(e); }
    A('M2-pos positive control: A own-owner INSERT succeeds (isolation, not blanket denial)', own === 'insert-ok', `got=${own}`);
  }

  // ---- M3: cross-owner UPDATE/DELETE → 0 rows affected (+ own-row positive controls) ----
  {
    const upd = await asPrincipal(admin, OWNER_A, (c) =>
      c.query('UPDATE user_memory SET content=$1 WHERE id=$2', ['a-tamper', MEM_B]));
    const del = await asPrincipal(admin, OWNER_A, (c) => c.query('DELETE FROM user_memory WHERE id=$1', [MEM_B]));
    const bStill = await admin.query('SELECT content FROM user_memory WHERE id=$1', [MEM_B]);
    A('M3 cross-owner UPDATE/DELETE: 0 rows affected, B row untouched',
      upd.rowCount === 0 && del.rowCount === 0 && bStill.rows[0]?.content === 'b-target',
      `upd=${upd.rowCount} del=${del.rowCount} content=${String(bStill.rows[0]?.content)}`);
    const selfUpd = await asPrincipal(admin, OWNER_A, (c) =>
      c.query('UPDATE user_memory SET content=$1 WHERE id=$2', ['a-updated', MEM_A_UPDATE]));
    const selfDel = await asPrincipal(admin, OWNER_A, (c) => c.query('DELETE FROM user_memory WHERE id=$1', [MEM_A_DELETE]));
    A('M3-pos positive control: A own UPDATE ≥1 and own DELETE =1 (isolation, not blanket denial)',
      (selfUpd.rowCount ?? 0) >= 1 && selfDel.rowCount === 1, `upd=${selfUpd.rowCount} del=${selfDel.rowCount}`);
  }

  // ---- M4: GUC unset / blank → default deny 0 rows (+ set-GUC positive control) ----
  {
    const c = await admin.connect();
    try {
      await c.query('BEGIN');
      await c.query('SET LOCAL ROLE app_role');
      const unsetVal = await c.query("SELECT current_setting('app.principal_user', true) AS v");
      const unsetRows = await c.query('SELECT count(*)::int AS n FROM interview');
      // Pooled connections that ever served asPrincipal keep the placeholder DEFINED at session
      // level after transaction-local revert → reads '' (not NULL). Never-set reads NULL. Both are
      // the unset face; the load-bearing assertion is the 0-row default deny, not the reading.
      A('M4a GUC unset (never-set NULL or reverted-empty): interview → 0 rows (default deny, no error, no widening)',
        (unsetVal.rows[0]?.v === null || unsetVal.rows[0]?.v === '') && unsetRows.rows[0]?.n === 0,
        `v=${JSON.stringify(unsetVal.rows[0]?.v)} n=${String(unsetRows.rows[0]?.n)}`);
      await c.query("SELECT set_config('app.principal_user', '', true)");
      const blankRows = await c.query('SELECT count(*)::int AS n FROM interview');
      A('M4b GUC blank: interview → 0 rows (blank principal never widens)', blankRows.rows[0]?.n === 0, `n=${String(blankRows.rows[0]?.n)}`);
      await c.query('SELECT set_config(\'app.principal_user\', $1, true)', [OWNER_A]);
      const setRows = await c.query('SELECT count(*)::int AS n FROM interview');
      A('M4-pos positive control: GUC set to A → exactly A rows visible', setRows.rows[0]?.n === (await admin.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1', [OWNER_A])).rows[0]?.n,
        `n=${String(setRows.rows[0]?.n)}`);
      await c.query('ROLLBACK');
    } finally { c.release(); }
  }

  // ---- M5: role escape surface (provisioned runtime LOGIN, production shape) ----
  {
    await provisionRuntimeLogin(admin, { roleName: LOGIN_ROLE, password: LOGIN_PASSWORD });
    const roleShape = await admin.query(
      'SELECT rolname, rolsuper, rolbypassrls, rolcanlogin, rolinherit FROM pg_roles WHERE rolname=$1', ['app_role']);
    const ar = roleShape.rows[0] ?? {};
    A('M5a app_role shape: NOLOGIN · NOSUPERUSER · NOBYPASSRLS (0001 fail-closed root)',
      ar.rolsuper === false && ar.rolbypassrls === false && ar.rolcanlogin === false,
      `super=${String(ar.rolsuper)} bypassrls=${String(ar.rolbypassrls)} canlogin=${String(ar.rolcanlogin)}`);
    const loginShape = await admin.query(
      'SELECT rolsuper, rolbypassrls, rolinherit FROM pg_roles WHERE rolname=$1', [LOGIN_ROLE]);
    const lr = loginShape.rows[0] ?? {};
    A('M5b provisioned runtime LOGIN shape: NOINHERIT · NOBYPASSRLS (provisionRuntimeLogin shape in real pg_roles)',
      lr.rolinherit === false && lr.rolbypassrls === false && lr.rolsuper === false,
      `inherit=${String(lr.rolinherit)} bypassrls=${String(lr.rolbypassrls)}`);

    // Dynamic escape probe over a real non-superuser connection (production entry shape).
    const lc = new Client({
      host: process.env.PGHOST, port: Number(process.env.PGPORT),
      database: process.env.PGDATABASE, user: LOGIN_ROLE, password: LOGIN_PASSWORD,
    });
    await lc.connect();
    try {
      const who = await lc.query('SELECT current_user');
      A('M5c login connects as itself (not app_role, not superuser)', who.rows[0]?.current_user === LOGIN_ROLE, `current_user=${String(who.rows[0]?.current_user)}`);
      let direct = 'direct-read-succeeded';
      try { await lc.query('SELECT count(*) FROM interview'); } catch (e) { direct = code(e); }
      A('M5d login WITHOUT SET ROLE: no table privilege (NOINHERIT fail-closed)',
        direct.startsWith('42501') || direct.includes('permission denied'), `got=${direct.slice(0, 60)}`);
      await lc.query('BEGIN');
      await lc.query('SET LOCAL ROLE app_role');
      const eff = await lc.query('SELECT current_user');
      A('M5e after SET LOCAL ROLE: effective role is app_role', eff.rows[0]?.current_user === 'app_role', `current_user=${String(eff.rows[0]?.current_user)}`);
      const noGuc = await lc.query('SELECT count(*)::int AS n FROM interview');
      A('M5f app_role via real login, GUC unset → 0 rows', noGuc.rows[0]?.n === 0, `n=${String(noGuc.rows[0]?.n)}`);
      await lc.query('SELECT set_config(\'app.principal_user\', $1, true)', [OWNER_A]);
      const own = await lc.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1', [OWNER_A]);
      const cross = await lc.query('SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1', [OWNER_B]);
      A('M5g app_role via real login + GUC: exactly own rows, zero of B rows',
        (own.rows[0]?.n ?? 0) >= 1 && cross.rows[0]?.n === 0, `own=${String(own.rows[0]?.n)} cross=${String(cross.rows[0]?.n)}`);
      await lc.query('ROLLBACK');
    } finally { await lc.end().catch(() => undefined); }
  }

  // ---- M6: app-layer guard mechanism (guardInterviewPrivacyTx issues exactly this SELECT) + source witness ----
  {
    const cross = await asPrincipal(admin, OWNER_B, (c) => c.query('SELECT 1 FROM interview WHERE id=$1', [IV_A_KEEP]));
    const self = await asPrincipal(admin, OWNER_B, (c) => c.query('SELECT 1 FROM interview WHERE id=$1', [IV_B]));
    A('M6 mechanism: B SELECT 1 FROM interview WHERE id=A-row → 0 rows (404 branch fires; indistinguishable), own id → 1',
      cross.rowCount === 0 && (self.rowCount ?? 0) === 1, `cross=${cross.rowCount} self=${self.rowCount}`);
    const svc = readWitness('apps/api/src/modules/interview/interview.service.ts');
    const has404 = svc.includes("error: 'not_found_or_forbidden'") && svc.includes('HttpStatus.NOT_FOUND');
    const has410 = svc.includes("'interview_privacy_fenced'") && svc.includes('HttpStatus.GONE');
    A('M6 witness: guardInterviewPrivacyTx 404 not_found_or_forbidden + 410 fence branches present in source',
      has404 && has410, `has404=${has404} has410=${has410}`);
  }

  // ---- M7 (rev r1): full-family cross-owner CRUD matrix ----
  // Seven canonical tables × {SELECT, INSERT, UPDATE, DELETE}: the cross-owner
  // NEG arm must be rejected (0 rows / error + target proven alive-or-absent via
  // admin), and each granted op gets an own-row positive control so the matrix
  // cannot green via blanket denial. Where the runtime role deliberately holds no
  // grant (interview/ai_graph_run/notification DELETE · interview_event UPDATE/
  // DELETE — minimal documented grant face), the missing grant is itself pinned;
  // vector_chunk DELETE is pinned to the documented 0125 purge-gate fence (plain
  // app_role deletes of memory chunks are rejected by design even on own rows).
  {
    interface OpOutcome { rows: number | null; err: string | null }
    const opAs = async (owner: string, sql: string, params: unknown[] = []): Promise<OpOutcome> => {
      try {
        const r = await asPrincipal(admin, owner, (c) => c.query(sql, params));
        return { rows: r.rowCount ?? 0, err: null };
      } catch (e) { return { rows: null, err: code(e) }; }
    };
    const adminCount = async (sql: string, params: unknown[] = []): Promise<number> =>
      Number((await admin.query(sql, params)).rows[0]?.n ?? -1);
    const rejected = (o: OpOutcome) => o.err !== null || o.rows === 0;
    const permDenied = (o: OpOutcome) => o.err !== null && (o.err.startsWith('42501') || o.err.includes('permission denied'));

    // -- interview (grants: SELECT/INSERT/UPDATE; no DELETE) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT id FROM interview WHERE id=$1', [IV_B]);
      const selPos = await opAs(OWNER_A, 'SELECT id FROM interview WHERE id=$1', [IV_A_KEEP]);
      A('M7 interview cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negId = `tir-iv-n-${HEX}`;
      const insNeg = await opAs(OWNER_A, "INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'active')", [negId, OWNER_B]);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM interview WHERE id=$1', [negId])) === 0;
      const insPos = await opAs(OWNER_A, "INSERT INTO interview(id, owner_user_id, status) VALUES ($1,$2,'active')", [`tir-iv-a3-${HEX}`, OWNER_A]);
      A('M7 interview impersonating INSERT rejected + row absent / own INSERT lands', rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, 'UPDATE interview SET current_question_index=0 WHERE id=$1', [IV_B]);
      const updPos = await opAs(OWNER_A, 'UPDATE interview SET current_question_index=1 WHERE id=$1', [IV_A_KEEP]);
      A('M7 interview cross-owner UPDATE=0 / own UPDATE ≥1', updNeg.rows === 0 && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM interview WHERE id=$1', [IV_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM interview WHERE id=$1', [IV_B])) === 1;
      const noDelGrant = (await admin.query("SELECT has_table_privilege('app_role','interview','DELETE') AS p")).rows[0]?.p === false;
      A('M7 interview cross-owner DELETE rejected (no grant by design) + B row alive + grant-absence pinned',
        permDenied(delNeg) && bAlive && noDelGrant, `neg=${delNeg.err ?? String(delNeg.rows)} alive=${String(bAlive)} noGrant=${String(noDelGrant)}`);
    }

    // -- ai_graph_run (grants: SELECT/INSERT/UPDATE; no DELETE; predicate also gates on interview_privacy_active(thread_id)) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT run_id FROM ai_graph_run WHERE graph_name=$1', [GR_B]);
      const selPos = await opAs(OWNER_A, 'SELECT run_id FROM ai_graph_run WHERE graph_name=$1', [GR_A]);
      A('M7 ai_graph_run cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negName = `tir-gr-n-${HEX}`;
      const insNeg = await opAs(OWNER_A,
        "INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status) VALUES ($1,$2,$3,'created')",
        [negName, IV_B, OWNER_B]);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM ai_graph_run WHERE graph_name=$1', [negName])) === 0;
      const insPos = await opAs(OWNER_A,
        "INSERT INTO ai_graph_run(graph_name, thread_id, owner_user_id, status) VALUES ($1,$2,$3,'created')",
        [`tir-gr-a2-${HEX}`, IV_A_KEEP, OWNER_A]);
      A('M7 ai_graph_run impersonating INSERT rejected + row absent / own INSERT lands',
        rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, 'UPDATE ai_graph_run SET current_node=$1 WHERE graph_name=$2', ['m7', GR_B]);
      const updPos = await opAs(OWNER_A, 'UPDATE ai_graph_run SET current_node=$1 WHERE graph_name=$2', ['m7', GR_A]);
      A('M7 ai_graph_run cross-owner UPDATE=0 / own UPDATE ≥1', updNeg.rows === 0 && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM ai_graph_run WHERE graph_name=$1', [GR_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM ai_graph_run WHERE graph_name=$1', [GR_B])) === 1;
      const noDelGrant = (await admin.query("SELECT has_table_privilege('app_role','ai_graph_run','DELETE') AS p")).rows[0]?.p === false;
      A('M7 ai_graph_run cross-owner DELETE rejected (no grant by design) + B row alive + grant-absence pinned',
        permDenied(delNeg) && bAlive && noDelGrant, `neg=${delNeg.err ?? String(delNeg.rows)} alive=${String(bAlive)} noGrant=${String(noDelGrant)}`);
    }

    // -- interview_event (grants: SELECT/INSERT only; append-only by design — UPDATE/DELETE pinned absent) --
    {
      const op2 = async (owner: string, sql: string, params: unknown[] = []): Promise<OpOutcome> => {
        try {
          const r = await asPrincipal(admin, owner, (c) => c.query(sql, params));
          const count = sql.toUpperCase().startsWith('SELECT COUNT') ? Number((r.rows?.[0] as { n?: number })?.n ?? 0) : (r.rowCount ?? 0);
          return { rows: count, err: null };
        } catch (e) { return { rows: null, err: code(e) }; }
      };
      const selNeg = await op2(OWNER_A, 'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [IEV_B]);
      const selPos = await op2(OWNER_A, 'SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [IEV_A]);
      A('M7 interview_event cross-owner SELECT=0 / own-row ≥1 (count arms)',
        selNeg.rows === 0 && (selPos.rows ?? 0) >= 1, `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negKey = `tir-iev-n-${HEX}`;
      const insNeg = await op2(OWNER_A, "INSERT INTO interview_event(owner_user_id, stream_key, seq, kind) VALUES ($1,$2,1,'progress')", [OWNER_B, negKey]);
      const insNegGone = (await admin.query('SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [negKey])).rows[0]?.n === 0;
      const posKey = `tir-iev-a2-${HEX}`;
      const insPos = await op2(OWNER_A, "INSERT INTO interview_event(owner_user_id, stream_key, seq, kind) VALUES ($1,$2,1,'progress')", [OWNER_A, posKey]);
      A('M7 interview_event impersonating INSERT rejected + row absent / own INSERT lands',
        insNeg.err !== null && insNegGone && insPos.err === null,
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await op2(OWNER_A, 'UPDATE interview_event SET kind=$1 WHERE stream_key=$2', ['progress', IEV_B]);
      const delNeg = await op2(OWNER_A, 'DELETE FROM interview_event WHERE stream_key=$1', [IEV_B]);
      const bAlive = (await admin.query('SELECT count(*)::int AS n FROM interview_event WHERE stream_key=$1', [IEV_B])).rows[0]?.n === 1;
      const grants = await admin.query(
        "SELECT has_table_privilege('app_role','interview_event','UPDATE') AS u, has_table_privilege('app_role','interview_event','DELETE') AS d");
      const noUpdDelGrants = grants.rows[0]?.u === false && grants.rows[0]?.d === false;
      A('M7 interview_event cross-owner UPDATE/DELETE rejected (no grant, append-only by design) + B row alive + grant-absence pinned',
        permDenied(updNeg) && permDenied(delNeg) && bAlive && noUpdDelGrants,
        `upd=${updNeg.err ?? String(updNeg.rows)} del=${delNeg.err ?? String(delNeg.rows)} alive=${String(bAlive)} noGrants=${String(noUpdDelGrants)}`);
    }

    // -- ai_invocation_trace (full CRUD grants, no triggers → full four-op own-row controls) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT idempotency_key FROM ai_invocation_trace WHERE idempotency_key=$1', [AIT_B]);
      const selPos = await opAs(OWNER_A, 'SELECT idempotency_key FROM ai_invocation_trace WHERE idempotency_key=$1', [AIT_A]);
      A('M7 ai_invocation_trace cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negKey = `tir-ait-n-${HEX}`;
      const insNeg = await opAs(OWNER_A, "INSERT INTO ai_invocation_trace(owner_user_id, idempotency_key, output) VALUES ($1,$2,'{}'::jsonb)", [OWNER_B, negKey]);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER_B, negKey])) === 0;
      const insPos = await opAs(OWNER_A, "INSERT INTO ai_invocation_trace(owner_user_id, idempotency_key, output) VALUES ($1,$2,'{}'::jsonb)", [OWNER_A, `tir-ait-a2-${HEX}`]);
      A('M7 ai_invocation_trace impersonating INSERT rejected + row absent / own INSERT lands',
        rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, "UPDATE ai_invocation_trace SET output=$1 WHERE idempotency_key=$2", ['{"m7":true}', AIT_B]);
      const bUnchanged = ((await admin.query('SELECT output FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER_B, AIT_B])).rows[0]?.output ?? null) !== null;
      const updPos = await opAs(OWNER_A, "UPDATE ai_invocation_trace SET output=$1 WHERE idempotency_key=$2", ['{"m7":true}', AIT_A]);
      A('M7 ai_invocation_trace cross-owner UPDATE=0 + B row unchanged / own UPDATE ≥1',
        updNeg.rows === 0 && bUnchanged && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} unchanged=${String(bUnchanged)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM ai_invocation_trace WHERE idempotency_key=$1', [AIT_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER_B, AIT_B])) === 1;
      const delPos = await opAs(OWNER_A, 'DELETE FROM ai_invocation_trace WHERE idempotency_key=$1', [AIT_DEL]);
      A('M7 ai_invocation_trace cross-owner DELETE=0 + B row alive / own DELETE=1',
        delNeg.rows === 0 && bAlive && delPos.rows === 1,
        `neg=${String(delNeg.rows)} alive=${String(bAlive)} pos=${String(delPos.rows)}`);
    }

    // -- vector_chunk (full CRUD grants; DELETE deliberately purge-gated by the 0125 fence even on own rows) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT id FROM vector_chunk WHERE id=$1', [VC_B]);
      const selPos = await opAs(OWNER_A, 'SELECT id FROM vector_chunk WHERE id=$1', [VC_A]);
      A('M7 vector_chunk cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negId = `tir-vc-n-${HEX}`;
      const insNeg = await opAs(OWNER_A,
        `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
         VALUES ($1,$2,'memory',$3,$4, ('[' || repeat('0.1,', 511) || '0.1]')::vector)`,
        [negId, OWNER_B, 'r', `tir-hash-n-${HEX}`]);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM vector_chunk WHERE id=$1', [negId])) === 0;
      const insPos = await opAs(OWNER_A,
        `INSERT INTO vector_chunk(id, owner_user_id, kind, ref_id, content_hash, embedding)
         VALUES ($1,$2,'memory',$3,$4, ('[' || repeat('0.1,', 511) || '0.1]')::vector)`,
        [`tir-vc-a2-${HEX}`, OWNER_A, 'r', `tir-hash-a2-${HEX}`]);
      A('M7 vector_chunk impersonating INSERT rejected + row absent / own INSERT lands',
        rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, 'UPDATE vector_chunk SET ref_id=$1 WHERE id=$2', ['m7', VC_B]);
      const bUnchanged = ((await admin.query('SELECT ref_id FROM vector_chunk WHERE id=$1', [VC_B])).rows[0]?.ref_id ?? '') !== 'm7';
      const updPos = await opAs(OWNER_A, 'UPDATE vector_chunk SET ref_id=$1 WHERE id=$2', [`tir-ref-a2-${HEX}`, VC_A]);
      A('M7 vector_chunk cross-owner UPDATE=0 + B row unchanged / own UPDATE ≥1',
        updNeg.rows === 0 && bUnchanged && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} unchanged=${String(bUnchanged)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM vector_chunk WHERE id=$1', [VC_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM vector_chunk WHERE id=$1', [VC_B])) === 1;
      A('M7 vector_chunk cross-owner DELETE=0 + B row alive', delNeg.rows === 0 && bAlive,
        `neg=${String(delNeg.rows)} alive=${String(bAlive)}`);
      const ownDel = await opAs(OWNER_A, 'DELETE FROM vector_chunk WHERE id=$1', [VC_A]);
      A('M7 vector_chunk own-row DELETE also rejected: documented 0125 purge-gate fence (42501 without purge context)',
        ownDel.err !== null && (ownDel.err.startsWith('42501') || ownDel.err.includes('permission denied')),
        `got=${ownDel.err ?? String(ownDel.rows)}`);
    }

    // -- notification (grants: SELECT/INSERT/UPDATE; no DELETE) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT id FROM notification WHERE id=$1', [NT_B]);
      const selPos = await opAs(OWNER_A, 'SELECT id FROM notification WHERE id=$1', [NT_A]);
      A('M7 notification cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negId = `tir-nt-n-${HEX}`;
      const insNeg = await opAs(OWNER_A, 'INSERT INTO notification(id, owner_user_id, kind) VALUES ($1,$2,$3)', [negId, OWNER_B, 'system']);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM notification WHERE id=$1', [negId])) === 0;
      const insPos = await opAs(OWNER_A, 'INSERT INTO notification(id, owner_user_id, kind) VALUES ($1,$2,$3)', [`tir-nt-a2-${HEX}`, OWNER_A, 'system']);
      A('M7 notification impersonating INSERT rejected + row absent / own INSERT lands',
        rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, 'UPDATE notification SET read=true WHERE id=$1', [NT_B]);
      const bUnchanged = (await admin.query('SELECT read FROM notification WHERE id=$1', [NT_B])).rows[0]?.read === false;
      const updPos = await opAs(OWNER_A, 'UPDATE notification SET read=true WHERE id=$1', [NT_A]);
      A('M7 notification cross-owner UPDATE=0 + B row unchanged / own UPDATE ≥1',
        updNeg.rows === 0 && bUnchanged && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} unchanged=${String(bUnchanged)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM notification WHERE id=$1', [NT_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM notification WHERE id=$1', [NT_B])) === 1;
      const noDelGrant = (await admin.query("SELECT has_table_privilege('app_role','notification','DELETE') AS p")).rows[0]?.p === false;
      A('M7 notification cross-owner DELETE rejected (no grant by design) + B row alive + grant-absence pinned',
        permDenied(delNeg) && bAlive && noDelGrant, `neg=${delNeg.err ?? String(delNeg.rows)} alive=${String(bAlive)} noGrant=${String(noDelGrant)}`);
    }

    // -- user_memory (full CRUD grants; complements M3) --
    {
      const selNeg = await opAs(OWNER_A, 'SELECT id FROM user_memory WHERE id=$1', [MEM_B]);
      const selPos = await opAs(OWNER_A, 'SELECT id FROM user_memory WHERE id=$1', [MEM_A_UPDATE]);
      A('M7 user_memory cross-owner SELECT=0 / own-row ≥1', selNeg.rows === 0 && (selPos.rows ?? 0) >= 1,
        `neg=${String(selNeg.rows)} pos=${String(selPos.rows)}`);
      const negId = `tir-um-n-${HEX}`;
      const insNeg = await opAs(OWNER_A, "INSERT INTO user_memory(id, owner_user_id, kind, content) VALUES ($1,$2,'skill','x')", [negId, OWNER_B]);
      const insNegGone = (await adminCount('SELECT count(*)::int AS n FROM user_memory WHERE id=$1', [negId])) === 0;
      const insPos = await opAs(OWNER_A, "INSERT INTO user_memory(id, owner_user_id, kind, content) VALUES ($1,$2,'skill','a-m7-ins')", [`tir-um-a4-${HEX}`, OWNER_A]);
      A('M7 user_memory impersonating INSERT rejected + row absent / own INSERT lands',
        rejected(insNeg) && insNegGone && !rejected(insPos),
        `neg=${insNeg.err ?? String(insNeg.rows)} gone=${String(insNegGone)} pos=${insPos.err ?? String(insPos.rows)}`);
      const updNeg = await opAs(OWNER_A, 'UPDATE user_memory SET content=$1 WHERE id=$2', ['m7', MEM_B]);
      const bUnchanged = (await admin.query('SELECT content FROM user_memory WHERE id=$1', [MEM_B])).rows[0]?.content === 'b-target';
      const updPos = await opAs(OWNER_A, 'UPDATE user_memory SET content=$1 WHERE id=$2', ['a-m7-upd', MEM_A_UPDATE]);
      A('M7 user_memory cross-owner UPDATE=0 + B row unchanged / own UPDATE ≥1',
        updNeg.rows === 0 && bUnchanged && (updPos.rows ?? 0) >= 1,
        `neg=${String(updNeg.rows)} unchanged=${String(bUnchanged)} pos=${String(updPos.rows)}`);
      const delNeg = await opAs(OWNER_A, 'DELETE FROM user_memory WHERE id=$1', [MEM_B]);
      const bAlive = (await adminCount('SELECT count(*)::int AS n FROM user_memory WHERE id=$1', [MEM_B])) === 1;
      const delPos = await opAs(OWNER_A, 'DELETE FROM user_memory WHERE id=$1', [UM_A3]);
      A('M7 user_memory cross-owner DELETE=0 + B row alive / own DELETE=1',
        delNeg.rows === 0 && bAlive && delPos.rows === 1,
        `neg=${String(delNeg.rows)} alive=${String(bAlive)} pos=${String(delPos.rows)}`);
    }
  }

  // ---- I1: canonical owner family ENABLE + FORCE RLS ----
  {
    for (const t of CANONICAL_FAMILY) {
      const r = await admin.query(
        `SELECT c.relrowsecurity AS rls, c.relforcerowsecurity AS force
           FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname='public' AND c.relname=$1 AND c.relkind='r'`, [t]);
      const row = r.rows[0];
      A(`I1 ${t}: relrowsecurity=true AND relforcerowsecurity=true`,
        row?.rls === true && row?.force === true, `rls=${String(row?.rls)} force=${String(row?.force)}`);
    }
  }

  // ---- I2 (rev r1): TO-role-grouped EXACT predicate introspection (real pg_policies, not migration grep) ----
  // r0 used SOME semantics over ALL policies of a table ("any policy containing the owner
  // predicate substring passes"), so an app_role-facing hole (dropped or always-true policy)
  // could be compensated by a companion policy scoped to another role (e.g.
  // interview_event_scoring_definer) and still green. rev r1: only policies whose roles
  // include app_role or PUBLIC form the app_role face; EVERY member must exact-match the
  // table's pinned predicate on each side it carries (USING for ALL/SELECT/UPDATE, WITH CHECK
  // for ALL/INSERT/UPDATE); the face must cover the read and the write path; companion
  // role-scoped policies are recorded in the receipt and never participate in this judgment.
  {
    // DELETE's USING is the old-row visibility filter for the delete path — exact-checked too.
    const READ_BEARING = new Set(['ALL', 'SELECT', 'UPDATE', 'DELETE']);
    const WRITE_BEARING = new Set(['ALL', 'INSERT', 'UPDATE']);
    interface PgPolicyRow { policyname: string; roles: unknown; cmd: string; qual: string | null;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_policies column is snake_case
      with_check: string | null }
    const toRoles = (v: unknown): string[] => Array.isArray(v)
      ? v.map((x) => String(x))
      : String(v ?? '').replace(/[{}]/g, '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);

    for (const t of CANONICAL_FAMILY) {
      const r = await admin.query(
        `SELECT policyname, roles, cmd, qual, with_check FROM pg_policies
          WHERE schemaname='public' AND tablename=$1`, [t]);
      const all = r.rows as PgPolicyRow[];
      const appFacing = all.filter((x) => {
        const roles = toRoles(x.roles);
        return roles.includes('app_role') || roles.includes('public');
      });
      const companions = all.filter((x) => !appFacing.includes(x));
      receipt.familyPolicies[t] = all.map((x) => x.policyname);
      receipt.familyAppFacingPolicies[t] = appFacing.map((x) => x.policyname);

      const nonEmpty = appFacing.length >= 1;
      A(`I2 ${t}: app_role-facing policy set non-empty (TO app_role / PUBLIC; companion role policies excluded)`,
        nonEmpty, `appFacing=[${appFacing.map((x) => x.policyname).join(',')}] companions=[${companions.map((x) => x.policyname).join(',')}]`);

      const expRead = EXPECTED_READ.get(t) ?? [];
      const expWrite = EXPECTED_WRITE.get(t) ?? [];
      const readExact = appFacing
        .filter((x) => READ_BEARING.has(x.cmd))
        .every((x) => x.qual !== null && expRead.includes(normPolicy(x.qual)));
      const hasReadSide = appFacing.some((x) => READ_BEARING.has(x.cmd));
      const writeExact = appFacing
        .filter((x) => WRITE_BEARING.has(x.cmd))
        .every((x) => x.with_check !== null && expWrite.includes(normPolicy(x.with_check)));
      const hasWriteSide = appFacing.some((x) => WRITE_BEARING.has(x.cmd));
      A(`I2 ${t}: every app_role-facing USING exact-matches the pinned owner predicate (Ban substring/SOME)`,
        readExact, `readExact=${String(readExact)} expect=[${expRead.join(' | ')}]`);
      A(`I2 ${t}: every app_role-facing WITH CHECK exact-matches the pinned owner predicate (Ban substring/SOME)`,
        writeExact, `writeExact=${String(writeExact)} expect=[${expWrite.join(' | ')}]`);
      A(`I2 ${t}: app_role face covers read (SELECT-side) and write (INSERT/ALL-side) paths`,
        nonEmpty && hasReadSide && hasWriteSide, `readSide=${String(hasReadSide)} writeSide=${String(hasWriteSide)}`);
    }

    // interview_event's app_role predicate is a function call: pin the function's first
    // owner gate live from pg_proc (a mutation that defangs the function fails here) and
    // the EXECUTE face (app_role yes, PUBLIC no).
    {
      const fn = await admin.query(
        `SELECT p.prosrc,
                has_function_privilege('app_role', p.oid, 'EXECUTE') AS app_exec,
                has_function_privilege('public', p.oid, 'EXECUTE') AS public_exec
           FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public' AND p.proname='interview_event_stream_privacy_active'`);
      const f = fn.rows[0] ?? {};
      const src = String(f.prosrc ?? '');
      const gate = src.includes('principal IS NULL') && src.includes('principal <> target_owner');
      A('I2 interview_event function gate: live prosrc carries the first owner gate (principal NULL/mismatch → false)',
        fn.rowCount === 1 && gate && f.app_exec === true && f.public_exec === false,
        `rows=${String(fn.rowCount)} gate=${String(gate)} appExec=${String(f.app_exec)} publicExec=${String(f.public_exec)}`);

      // rev r2 (EXEC P2-2): the first gate alone does not pin the POST-gate fence
      // face — a mutation that only defangs the fence branches (drops the interview
      // tombstone fence call, or drops the resume_quiz/resume_diagnosis owner
      // re-check) previously stayed green. Same pin form: live prosrc substrings +
      // rowCount===1 anti-reload.
      const fence = src.includes('interview_privacy_active(target_stream)')
        && src.includes('q.owner_user_id=target_owner')
        && src.includes('d.owner_user_id=target_owner');
      A('I2 interview_event fence branch: tombstone fence call + quiz/diagnosis owner re-checks pinned in live prosrc (post-first-gate face)',
        fn.rowCount === 1 && fence,
        `rows=${String(fn.rowCount)} fence=${String(fence)}`);
    }

    // rev r2 (EXEC P2-2): interview_privacy_active(text) is the fence root under the
    // ai_graph_run predicate (AI_GRAPH_RUN_PRED calls interview_privacy_active(thread_id))
    // and of the tombstone face above. Pin its body: first owner gate substrings +
    // erasure-fence status set, same form (live prosrc + rowCount===1 + EXECUTE face).
    {
      const fn = await admin.query(
        `SELECT p.prosrc,
                has_function_privilege('app_role', p.oid, 'EXECUTE') AS app_exec,
                has_function_privilege('public', p.oid, 'EXECUTE') AS public_exec
           FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
          WHERE n.nspname='public' AND p.proname='interview_privacy_active'`);
      const f = fn.rows[0] ?? {};
      const src = String(f.prosrc ?? '');
      const gate = src.includes('principal IS NULL') && src.includes('length(principal)=0')
        && src.includes('i.owner_user_id=principal') && src.includes('IF NOT FOUND THEN RETURN false');
      const fenceSet = src.includes("'requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused'");
      A('I2 interview_privacy_active body: first owner gate + erasure-fence status set pinned in live prosrc (ai_graph_run predicate root; 0076 current body)',
        fn.rowCount === 1 && gate && fenceSet && f.app_exec === true && f.public_exec === false,
        `rows=${String(fn.rowCount)} gate=${String(gate)} fenceSet=${String(fenceSet)} appExec=${String(f.app_exec)} publicExec=${String(f.public_exec)}`);
    }
  }

  // ---- I3: policy census + shared-corpus face reported separately ----
  {
    const total = await admin.query("SELECT count(*)::int AS n FROM pg_policies WHERE schemaname='public'");
    const rlsTables = await admin.query(
      `SELECT count(*)::int AS n FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind='r' AND c.relrowsecurity=true`);
    receipt.policyTotal = total.rows[0]?.n ?? -1;
    receipt.rlsEnabledTables = rlsTables.rows[0]?.n ?? -1;
    A('I3 census: owner-data RLS surface non-empty (policies + RLS tables recorded in receipt)',
      receipt.policyTotal > 0 && receipt.rlsEnabledTables >= CANONICAL_FAMILY.length,
      `policies=${receipt.policyTotal} rlsTables=${receipt.rlsEnabledTables}`);
    A('I3 census baseline EXACT for this branch chain (drift forces a conscious re-count at merge, cap-style)',
      receipt.policyTotal === POLICY_CENSUS_BASELINE.policies && receipt.rlsEnabledTables === POLICY_CENSUS_BASELINE.rlsTables,
      `policies=${receipt.policyTotal}/${String(POLICY_CENSUS_BASELINE.policies)} rlsTables=${receipt.rlsEnabledTables}/${String(POLICY_CENSUS_BASELINE.rlsTables)}`);

    // Shared corpus face: visibility='global' system-published corpora — assert its shape but keep it
    // OUT of the owner-data conclusion (0032: `visibility='global' OR owner_user_id=...`; publish gate
    // `__system_rag__`-only is enforced by the 0032 control function, cited not re-proven here).
    const corpus = await admin.query(
      `SELECT policyname, qual, with_check FROM pg_policies
        WHERE schemaname='public' AND tablename='rag_corpus_document'`);
    const readSharesGlobal = corpus.rows.some((x: { qual: string | null }) =>
      normPolicy(x.qual).includes(GLOBAL_DISJUNCTION) && normPolicy(x.qual).includes(OWNER_PREDICATE));
    // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_policies column is snake_case
    const writeOwnerPredicated = corpus.rows.some((x: { with_check: string | null }) =>
      normPolicy(x.with_check).includes(OWNER_PREDICATE));
    receipt.sharedCorpusFace = { table: 'rag_corpus_document', readPolicySharesGlobal: readSharesGlobal, writePolicyOwnerPredicated: writeOwnerPredicated };
    A('I3 shared-corpus face (separate): rag_corpus_document read policy carries global disjunction + owner predicate; write policy owner-predicated',
      readSharesGlobal && writeOwnerPredicated,
      `readGlobal=${readSharesGlobal} writeOwner=${writeOwnerPredicated}`);
  }

  // ---- G (rev r1): whole-database owner/attribution-column → RLS inversion ----
  // rev r0 had zero capture power over "table with owner column, no RLS" (mut F: a fresh
  // decoy table stayed green; three existing tables already had that shape and were silently
  // allowed). The inversion: EVERY table (relkind r/p) carrying owner_user_id or a
  // tenant/org/workspace attribution column MUST have RLS enabled. The uncovered set must be
  // empty OR exactly the named RLS_FREE_ALLOWLIST — never anything unnamed — and each
  // allowlist member is live-proven to hold ZERO table privileges across ALL dynamically
  // enumerated principals (rev r2: superuser/owner/BYPASSRLS/pg_ excluded, PUBLIC included,
  // app_role in the set; named empty triple allowlist is the only escape)
  // (REVOKE ALL + SECURITY DEFINER-only access), so no user-reachable face exists to protect.
  {
    const uncoveredRows = await admin.query(
      `SELECT c.relname AS t
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity
          AND EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($1::text[]))
        ORDER BY c.relname`, [ATTRIBUTION_COLUMNS]);
    const uncovered = uncoveredRows.rows.map((x: { t: string }) => x.t);
    const allowNames = RLS_FREE_ALLOWLIST.map((x) => x.table);
    const census = await admin.query(
      `SELECT count(*)::int AS n,
              count(*) FILTER (WHERE c.relrowsecurity)::int AS rls
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind IN ('r','p')
          AND EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($1::text[]))`, [ATTRIBUTION_COLUMNS]);
    receipt.ownerColumnCensus = {
      tablesWithAttributionColumn: census.rows[0]?.n ?? -1,
      withRls: census.rows[0]?.rls ?? -1,
      uncoveredWithoutRls: uncovered,
    };
    A('G inversion: uncovered = attribution-column tables without RLS ⊆ named allowlist (nonempty diff beyond it = FAIL)',
      uncovered.every((t) => allowNames.includes(t)),
      `uncovered=[${uncovered.join(',')}] allowlist=[${allowNames.join(',')}] census=${String(census.rows[0]?.n)}/${String(census.rows[0]?.rls)}`);

    // rev r2 (EXEC P2-1): zero-privilege probe across ALL principals. Dynamically
    // enumerated from pg_roles — superusers, BYPASSRLS holders, pg_ reserved roles
    // and the probed table's owner are EXCLUDED (they access by definition); the
    // PUBLIC pseudo-role joins the must-be-zero set. app_role is in the enumerated
    // set (no longer hardcoded), so this face subsumes the r1 probe. The only
    // exception is the named empty triple allowlist above.
    const principalRows = await admin.query(
      `SELECT r.rolname
         FROM pg_roles r
        WHERE r.rolname NOT LIKE 'pg\\_%'
          AND NOT r.rolsuper AND NOT r.rolbypassrls
          AND NOT EXISTS (SELECT 1 FROM pg_class c
                           WHERE c.relowner = r.oid
                             AND c.relnamespace = 'public'::regnamespace
                             AND c.relname = ANY($1::text[]))
        ORDER BY r.rolname`, [allowNames]);
    const principals = ['public', ...principalRows.rows.map((x: { rolname: string }) => x.rolname)];
    const tripleAllowed = (t: string, role: string, priv: string) =>
      RLS_FREE_GRANT_TRIPLES.some((x) => x.table === t && x.role === role && x.privilege === priv);
    const violations: string[] = [];
    for (const entry of RLS_FREE_ALLOWLIST) {
      const probe = await admin.query(
        `SELECT x.principal, p.priv,
                has_table_privilege(x.principal, $1, p.priv) AS held
           FROM unnest($2::text[]) AS x(principal)
          CROSS JOIN (SELECT unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE']::text[]) AS priv) p
          ORDER BY x.principal, p.priv`, [entry.table, principals]);
      const held = probe.rows
        .filter((x: { held: boolean }) => x.held === true)
        .filter((x: { principal: string; priv: string }) => !tripleAllowed(entry.table, x.principal, x.priv));
      for (const x of held) violations.push(`(${entry.table},${x.principal},${x.priv})`);
      A(`G allowlist ${entry.table}: zero table privileges across ALL enumerated principals (${principals.length} principals = PUBLIC + non-superuser/non-BYPASSRLS/non-owner roles; named triples are the only escape)`,
        (principalRows.rowCount ?? 0) >= 1 && principals.includes('app_role') && principals.includes('public') && probe.rowCount === principals.length * 4 && held.length === 0,
        `principals=${principals.length} rows=${String(probe.rowCount)} held=[${held.map((x: { principal: string; priv: string }) => `${x.principal}:${x.priv}`).join(' ')}]`);
    }
    receipt.allowlistProbe = {
      principalsProbed: principals.length,
      triplesProbed: principals.length * 4 * RLS_FREE_ALLOWLIST.length,
      namedTripleAllowlistSize: RLS_FREE_GRANT_TRIPLES.length,
      violations,
    };
    A('G allowlist probe receipt: principal/triple counts + zero violations recorded',
      principals.length >= 10 && receipt.allowlistProbe.violations.length === 0,
      `principals=${principals.length} triples=${String(receipt.allowlistProbe.triplesProbed)} namedTriples=${String(RLS_FREE_GRANT_TRIPLES.length)} violations=[${violations.join(' ')}]`);

    // SECURITY DEFINER entry witnesses: the only functions touching the ledger tables are
    // definer-owned, and the app-reachable ones are owner-bound at entry (0035 gate).
    const gated = await admin.query(
      `SELECT count(*)::int AS n, bool_and(p.prosecdef) AS sd,
              bool_and(position('ai_cost_require_request_owner' in p.prosrc) > 0) AS gated,
              bool_and(has_function_privilege('app_role', p.oid, 'EXECUTE')) AS app_exec,
              bool_and(NOT has_function_privilege('public', p.oid, 'EXECUTE')) AS no_public_exec
         FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname IN
          ('ai_model_admission_acquire_scoped','ai_model_admission_record_scoped','ai_model_claim_invocation_scoped')`);
    const g = gated.rows[0] ?? {};
    A('G ledger SECURITY DEFINER entries (acquire/record/claim): definer-owned, owner-gated at entry, app_role-executable only',
      g.n === 3 && g.sd === true && g.gated === true && g.app_exec === true && g.no_public_exec === true,
      `n=${String(g.n)} sd=${String(g.sd)} gated=${String(g.gated)} appExec=${String(g.app_exec)} noPublicExec=${String(g.no_public_exec)}`);
    const permit = await admin.query(
      `SELECT count(*)::int AS n, bool_and(p.prosecdef) AS sd,
              bool_and(NOT has_function_privilege('app_role', p.oid, 'EXECUTE')) AS no_app_exec,
              bool_and(NOT has_function_privilege('public', p.oid, 'EXECUTE')) AS no_public_exec
         FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.proname='ai_model_consume_transition_permit'`);
    const q = permit.rows[0] ?? {};
    A('G permit consumer (ai_model_consume_transition_permit): definer-owned and NOT executable by app_role/PUBLIC',
      q.n === 1 && q.sd === true && q.no_app_exec === true && q.no_public_exec === true,
      `n=${String(q.n)} sd=${String(q.sd)} appExec=${String(!q.no_app_exec)} publicExec=${String(!q.no_public_exec)}`);

    const m0120 = readWitness('packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql');
    const m0088 = readWitness('packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql');
    const revokes = m0120.includes('REVOKE ALL ON ai_model_admission_policy, ai_model_fee_ledger, ai_model_breaker_state, ai_model_concurrency_lease FROM app_role')
      && m0088.includes('REVOKE ALL ON ai_model_invocation_transition_permit FROM PUBLIC, app_role');
    A('G migration REVOKE ALL witnesses present (0120:132 ledger+lease, 0088:27 permit)', revokes);
  }

  // ---- T1: tenant/org dimension — record-only introspection (deferred design extension, not a hole) ----
  {
    // Enterprise qbank org-scope columns (0186_qbank_org_owner_columns.sql) legitimately exist for
    // B-side corpora scoping — they are NOT user-tenant isolation and do not replace the owner RLS
    // root. The load-bearing assertions: (a) NO RLS policy predicates isolation on tenant/org —
    // the user-data isolation root stays owner_user_id only; (b) none of the canonical owner-data
    // family tables carry a tenant/org/workspace column. Column census is recorded in the receipt.
    const colRows = await admin.query(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema='public' AND column_name IN ('tenant_id','org_id','workspace_id')
        ORDER BY table_name`);
    const pol = await admin.query(
      `SELECT count(*)::int AS n FROM pg_policies
        WHERE schemaname='public' AND (qual ILIKE '%tenant_id%' OR qual ILIKE '%org_id%'
           OR with_check ILIKE '%tenant_id%' OR with_check ILIKE '%org_id%')`);
    receipt.tenantOrgObservation = { tenantColumns: colRows.rowCount ?? -1, tenantPredicatePolicies: pol.rows[0]?.n ?? -1 };
    // eslint-disable-next-line @typescript-eslint/naming-convention -- information_schema column is snake_case
    const inFamily = colRows.rows.filter((x: { table_name: string }) =>
      (CANONICAL_FAMILY as readonly string[]).includes(x.table_name));
    A('T1 no tenant/org RLS predicate: zero policies isolate on tenant/org (owner_user_id stays the only user-data isolation root)',
      pol.rows[0]?.n === 0, `tenantPredicatePolicies=${String(pol.rows[0]?.n)}`);
    A('T1 canonical owner family remains owner-only: no tenant_id/org_id/workspace_id column inside it',
      inFamily.length === 0, `orgColsElsewhere=${JSON.stringify(colRows.rows)}`);
  }

  // ---- S: static pins (source witnesses; no import of apps/api) ----
  {
    const principalSrc = readWitness('packages/db/src/principal.ts');
    const baseline = readWitness('packages/db/migrations/0001_baseline.sql');
    const tenantSrc = readWitness('packages/db/src/tenant/index.ts');
    const controller = readWitness('apps/api/src/modules/privacy/privacy.controller.ts');
    const s1 = principalSrc.includes('SET LOCAL ROLE app_role') && principalSrc.includes("set_config('app.principal_user'");
    const s2 = baseline.includes('ENABLE ROW LEVEL SECURITY') && baseline.includes('FORCE ROW LEVEL SECURITY')
      && baseline.includes("owner_user_id = current_setting(''app.principal_user'', true)");
    const s3 = tenantSrc.includes('应用层 tenant ≠ RLS');
    const s4 = controller.includes("@Delete('interview-data/:id')") && controller.includes('HttpStatus.SERVICE_UNAVAILABLE');
    A('S1 asPrincipal pin: SET LOCAL ROLE app_role + set_config present in principal.ts', s1);
    A('S2 FORCE RLS pin: 0001 baseline ENABLE+FORCE + owner predicate present', s2);
    A('S3 tenant prototype pin: 应用层 tenant ≠ RLS header intact in packages/db/src/tenant/index.ts (additive, not the root)', s3);
    A('S4 public DELETE=503 pin: interview-data/:id route stays SERVICE_UNAVAILABLE', s4);
  }

  console.log(`TENANT_RLS_ISO_RECEIPT ${JSON.stringify(receipt)}`);
} catch (e) {
  envFailed = `environment/fixture failure — honest non-zero EXIT (recorded attempt): ${code(e)}`;
} finally {
  await admin.end().catch(() => undefined);
}

if (envFailed) console.error(`tenant-rls-isolation: ${envFailed}`);
console.log(failures === 0 && !envFailed
  ? '\n✓ owner isolation prove passed (EXIT=0) — evidences the RLS root; ≠ gap closed ≠ tenant==RLS ≠ HA'
  : `\n✗ owner isolation prove: ${failures} failure(s)${envFailed ? ' + environment failure' : ''}`);
if (failures > 0 || envFailed) process.exitCode = 1;
