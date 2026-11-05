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
 * rev r3 (post-prove falsification revision; source = meetwise/.tmp/reviews/priv1-post-2.md
 * FAIL P0=0 P1=3 P2=4 — all three P1s were reproduction-tested live; zero weakening of
 * r0/r1/r2 faces): the three P1s were one root cause — the whole-DB inversion built its
 * completeness on four hard-coded column names and named-only pins. Fixes:
 *   1. Column-name coverage widened from the four canonical names to the full
 *      user-scope alias family found by a whole-schema census (user_id, *_user_id
 *      suffixed aliases) PLUS the actor _by family as a second inversion class —
 *      both must carry RLS unless the table is in the named allowlist; a
 *      migration-chain column scan pins that any NEW attribution-shaped column
 *      name must enter these constants or a named semantic-exclusion list
 *      (lease_owner/owner_kind are named non-user semantics), so a fresh alias
 *      can never re-open the alias blind spot. `auth_user_session.user_id`
 *      (0169 granted SELECT/INSERT/UPDATE to app_role, zero RLS — the P1-1 live
 *      cross-owner read/revoke leak) is closed at the root by migration
 *      0225_auth_user_session_owner_rls.sql (ENABLE+FORCE RLS + p_owner
 *      `user_id = current_setting('app.principal_user', true)`, same shape as the
 *      0001 canonical p_owner); the three app code paths
 *      (apps/api/src/platform/auth-session.ts INSERT-login / UPDATE-revoke /
 *      SELECT-validate) already run inside db.asPrincipal(uid) transactions, so
 *      the predicate is self-satisfying and auth flow is unchanged — evidenced
 *      live by the M8 session matrix below (asPrincipal-shaped seeding +
 *      cross-owner read/revoke/impersonating-INSERT negatives + policy exact pin
 *      + grant-absence pin) and by `pnpm neg:auth` staying green. No legitimate
 *      cross-user session face exists today (zero function bodies reference the
 *      table, rev r3 live census); if one is ever needed it must be an explicit
 *      controlled function with an entry owner gate — direct table access is not
 *      the design.
 *   2. Ownership drift capture (P1-2, mut F2): every attribution-carrying
 *      relation (tables AND views) must be owned by a FIXED name list declared in
 *      the migration chain (the migration-executor superuser plus the three
 *      migration-declared NOLOGIN/NOINHERIT/NOBYPASSRLS definer owners). An
 *      ALTER TABLE ... OWNER TO <runtime role> no longer silently shrinks the
 *      probe set — it is red on sight; non-super fixed owners are asserted to
 *      keep the definer-isolation role shape, and every attribution-carrying rel
 *      they own must stay FORCE RLS.
 *   3. SD-reader and view faces (P1-3, mut F6/F7): SECURITY DEFINER functions
 *      executable by app_role/PUBLIC are dynamically enumerated; every
 *      superuser-owned one whose body references a user-scope/actor column or a
 *      protected table must carry the standard first owner gate
 *      (`principal IS NULL` / `ai_cost_require_request_owner`) or be in the named
 *      SD_GATE_ALLOWLIST (each entry live-pins its own authorizing witnesses);
 *      non-superuser-owned SD functions are asserted to run under the
 *      NOBYPASSRLS definer-isolation shape so RLS governs them. All views and
 *      materialized views are enumerated: any referencing an attribution column
 *      must be security_invoker=true OR in the named VIEW_EXEMPT list, whose
 *      members pin superuser ownership + exact view body (pg16 pg_get_viewdef)
 *      so body drift (RLS bypass through a definer-rights view) is red.
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
 *   M8  session-table face (rev r3)   — auth_user_session (0169 + 0225 owner RLS): asPrincipal-shaped
 *                                        INSERT seeding (the login code path shape) succeeds; cross-owner
 *                                        SELECT=0; cross-owner revoke UPDATE=0 rows and B's row stays
 *                                        unrevoked; impersonating INSERT (user_id=B) → 42501 + absent;
 *                                        own-row revoke positive control; GUC-unset app_role → 0 rows;
 *                                        DELETE grant absent pinned (revocation is UPDATE revoked_at, no
 *                                        DELETE by 0169 design); relrowsecurity+force + exactly one
 *                                        app_role-facing policy exact-matching the session predicate on
 *                                        both sides; auth-session.ts three code-path statements + 0225
 *                                        migration witnesses
 *   I3  policy census receipt          — total policy count + RLS table count pinned EXACT to this branch's
 *                                        migration chain (drift = conscious re-count at merge, like the cap) +
 *                                        per-family policy names (all + app_role-facing) into receipt JSON;
 *                                        visibility='global' shared-corpus face (rag_corpus_document) reported
 *                                        separately, never mixed into the owner-data face conclusion
 *   G   whole-DB owner-column inversion — every table (relkind r/p) carrying a user-scope attribution column
 *                                        (rev r3 widened: owner_user_id / user_id / *_user_id / tenant_id /
 *                                        org_id / workspace_id) or an actor _by column must have
 *                                        relrowsecurity=true; uncovered ⊆ named RLS-free allowlist (each
 *                                        member live-proven zero table privileges across ALL dynamically
 *                                        enumerated principals — rev r2, superuser/owner/BYPASSRLS/pg_
 *                                        excluded, PUBLIC included — with a named empty (table,role,
 *                                        privilege) triple allowlist as the only escape + SECURITY
 *                                        DEFINER owner-gated entry witnesses); a migration-chain column
 *                                        scan (rev r3) forces any NEW attribution-shaped column name into
 *                                        the constants or the named semantic-exclusion list;
 *                                        G-O ownership drift: attribution-carrying rels (r/p/v/m) owned
 *                                        only by migration-chain-declared fixed owners (rev r3);
 *                                        G-SD reader face: superuser-owned app/PUBLIC-executable SECURITY
 *                                        DEFINER functions touching user columns/protected tables carry a
 *                                        first owner gate or a named+evidenced allowlist entry, non-super
 *                                        definer owners keep the NOBYPASSRLS isolation shape (rev r3);
 *                                        G-V view face: attribution-referencing views are security_invoker
 *                                        or named exemptions with exact body pins (rev r3);
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
import { readFileSync, readdirSync } from 'node:fs';
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
  // rev r3 (post-falsification P1-1/P2-3): the whole-schema census widened the column
  // families and these two zero-RLS attribution carriers surfaced. Both live-proven
  // zero runtime-role table privileges (same trust shape as the three entries above),
  // reached only via owner-gated SECURITY DEFINER paths pinned by the G-SD arm.
  { table: 'ai_cost_reservation',
    reason: 'internal per-request cost reservation stub (request_owner_user_id alias census, rev r3); zero runtime-role table privileges (live role_table_grants census: owner only), reached only via ai_cost_require_request_owner-gated SECURITY DEFINER ai_cost_settle_text_scoped / ai_model_transition_dispatched_scoped' },
  { table: 'offline_remit_record',
    reason: 'admin-entered offline remittance ledger (entered_by/confirmed_by/failed_by actor columns, rev r3 census); zero runtime-role table privileges (owner-only grants), reached only via admin-gated SECURITY DEFINER gateway_admin_offline_remit_entry/confirm/fail/queue (G-SD allowlist pins gateway_require_active_admin + maker/checker segregation)' },
];

/** User-scope attribution columns (rev r3 widened from the four canonical names after a
 *  whole-schema census — falsification P1-1 root cause: the inversion was only as good as
 *  this name list, and `auth_user_session.user_id` fell outside it while app_role held
 *  SELECT/INSERT/UPDATE grants). Semantics confirmed per name on the live chain:
 *  user_id (session/curator identity), candidate_user_id/recruiter_user_id (route +
 *  application party scope), payer_user_id (billing payer), access_principal_user_id
 *  (memory admission principal), request_owner_user_id (cost governance request owner).
 *  tenant_id/org_id/workspace_id stay per the §0 deviation-2 definition (org_id = B-side
 *  enterprise qbank compliance columns, 0186). */
const ATTRIBUTION_COLUMNS = [
  'owner_user_id', 'tenant_id', 'org_id', 'workspace_id',
  'user_id', 'candidate_user_id', 'recruiter_user_id', 'payer_user_id',
  'access_principal_user_id', 'request_owner_user_id',
] as const;

/** Actor-attribution columns (rev r3 second inversion class): WHO performed an action
 *  (operator/admin/worker identity on audit, receipt and evidence rows). They identify
 *  users but are not the row-ownership root; the inversion still requires their tables
 *  to carry RLS (all do except the allowlisted admin ledger below), and the migration
 *  scan below forces any new alias into one of these two constants. */
const ACTOR_BY_COLUMNS = [
  'added_by', 'reviewed_by', 'recorded_by', 'resolved_by', 'consumed_by',
  'settled_by', 'entered_by', 'confirmed_by', 'failed_by',
] as const;

/** Attribution-SHAPED names found in the migration chain that are deliberately NOT user
 *  attribution (named semantic exclusions — the migration scan below asserts the chain
 *  introduces no other shaped name). `subject_id`/`data_subject_id`/`actor` are
 *  subject-of-action references with mixed non-ownership referents (privacy/rag/audit
 *  domains) and every table carrying them today is already RLS-covered via sibling
 *  attribution columns — recorded in the census, not silently dropped. */
const SEMANTIC_EXCLUDED_COLUMNS: readonly { name: string; reason: string }[] = [
  { name: 'lease_owner', reason: 'worker/replica lease holder identity (dispatch/claim slots), not a user' },
  { name: 'owner_kind', reason: 'corpus owner-class discriminator (system/org/qbank), not a user id' },
];

/** rev r3 G-O: FIXED owner names for attribution-carrying relations. Any other role
 *  owning such a relation is ownership drift (falsification P1-2: ALTER TABLE ... OWNER
 *  TO memory_runtime silently exited the rev r2 probe set with full owner rights).
 *  The migration executor superuser plus the three migration-declared definer owners —
 *  each declared NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS in-chain; those shape
 *  assertions run live below. */
const FIXED_TABLE_OWNERS: readonly { owner: string; super: boolean; declaredAt: string }[] = [
  { owner: 'meetwise', super: true, declaredAt: 'migration executor superuser (0001 baseline chain; isolated container init POSTGRES_USER=meetwise)' },
  { owner: 'rag_control_definer', super: false, declaredAt: '0073_rag_control_plane_identity_isolation.sql:17 (role) / :220,:278 (ALTER TABLE ... OWNER TO rag_control_definer)' },
  { owner: 'privacy_worker_owner', super: false, declaredAt: '0048_checkpoint_physical_erasure.sql:16 / 0107_memory_control_surface.sql:49 (NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS)' },
  { owner: 'online_judge_owner', super: false, declaredAt: '0050_online_judge_control_plane.sql:17 (NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS)' },
];

/** rev r3 G-SD: SECURITY DEFINER reader allowlist. Dynamically enumerated
 *  app_role/PUBLIC-executable SD functions whose body references a user-scope/actor
 *  attribution column or a protected table are flagged; superuser-owned flagged
 *  functions must carry the standard first owner gate (`principal IS NULL` /
 *  `ai_cost_require_request_owner`) or be exactly one of these entries. Each entry
 *  live-pins its own authorizing witnesses (prosrc substrings, whitespace-flattened)
 *  plus the EXECUTE face (app_role yes, PUBLIC no) — so the allowlist is an evidence
 *  contract, not a silent pass. rev r3 live census: 155 app/PUBLIC-executable SD
 *  functions, 126 flagged, 12 superuser-owned carry the standard gate, 98 owned by
 *  NOBYPASSRLS definer roles (RLS-governed — shape asserted live), and exactly these
 *  16 entries. */
const SD_GATE_ALLOWLIST: readonly { fn: string; witnesses: readonly string[]; reason: string }[] = [
  { fn: 'gateway_admin_orders', witnesses: ['gateway_require_active_admin'],
    reason: 'admin cross-owner order queue read (payment_order.owner_user_id listed); caller re-checked in-function by gateway_require_active_admin — admin face by design (user_account.is_admin cross-user read-only, sql/09_auth)' },
  { fn: 'gateway_admin_offline_remit_entry', witnesses: ['gateway_require_active_admin', 'offline_remit_entry_invalid_input'],
    reason: 'admin enters offline remittance row (entered_by=caller admin identity); admin-gated' },
  { fn: 'gateway_admin_offline_remit_confirm', witnesses: ['gateway_require_active_admin', 'offline_remit_segregation_required'],
    reason: 'admin confirms offline remittance; admin-gated + maker/checker segregation (r.entered_by = caller rejected via offline_remit_segregation_required)' },
  { fn: 'gateway_admin_offline_remit_fail', witnesses: ['gateway_require_active_admin'],
    reason: 'admin fails offline remittance + order; admin-gated (failed_by=caller identity)' },
  { fn: 'gateway_admin_offline_remit_queue', witnesses: ['gateway_require_active_admin'],
    reason: 'admin offline-remit queue read (payment_order.owner_user_id + remit actor columns listed); admin-gated' },
  { fn: 'gateway_entpay_reserve', witnesses: ['entpay_principal_missing', 'candidate_user_id = v_owner'],
    reason: 'entitlement reserve: v_owner = current_setting principal, fail-closed when unset; payer derived single hop via application.candidate_user_id = v_owner' },
  { fn: 'gateway_entpay_apply_allocation', witnesses: ['entpay_apply_principal_missing', 'owner_user_id = v_owner'],
    reason: 'entitlement allocation applied strictly inside caller principal scope (idempotency row matched on owner_user_id = v_owner)' },
  { fn: 'gateway_entpay_my_offline_orders', witnesses: ["p.owner_user_id = current_setting('app.principal_user', true)"],
    reason: 'own offline orders read — principal predicate in the query itself' },
  { fn: 'gateway_billing_ledger_payer', witnesses: ["ec.payer_user_id = current_setting('app.principal_user', true)"],
    reason: 'billing ledger for the caller as payer — principal predicate in the query itself' },
  { fn: 'gateway_notify_invited', witnesses: ['gateway_require_active_recruiter', 'recruiter_user_id = p_recruiter'],
    reason: 'recruiter invite notification: recruiter-bound application + active-recruiter check; the notification INSERT executes under the candidate principal context (WITH CHECK satisfied), then reverts' },
  { fn: 'gateway_recruiter_contact_share', witnesses: ['gateway_require_active_recruiter', 'recruiter_user_id = p_recruiter', "purpose = 'recruiter_contact_share'"],
    reason: 'contact share: recruiter-bound application + per-candidate consent gate; output whitelist (application_id, email) only' },
  { fn: 'gateway_b_qualitative_projection', witnesses: ['recruiter_user_id = p_recruiter', "purpose = 'b_qualitative_share'", 'interview_privacy_fenced_targets'],
    reason: 'B-side qualitative disclosure: recruiter-bound + consent gate + privacy fence re-check under switched principal; counts-only whitelist projection, no numeric scores (0215 design)' },
  { fn: 'qbank_generation_distances', witnesses: ['qbank_assert_retrieval_scope', 'search_path=public, pg_temp'],
    reason: 'qbank bounded retrieval reader (§6.1 manifest-pinned in packages/db/src/principal.ts QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST); org-scoped system corpus only, retrieval-scope asserted in-query, no candidate user content' },
  { fn: 'qbank_generation_lexical_search', witnesses: ['qbank_assert_retrieval_scope', 'search_path=public, pg_temp'],
    reason: 'qbank bounded retrieval reader (§6.1 manifest); org-scoped system corpus only, retrieval-scope asserted in-query' },
  { fn: 'qbank_generation_evidence', witnesses: ['qbank_assert_retrieval_scope', 'search_path=public, pg_temp'],
    reason: 'qbank bounded evidence reader (§6.1 manifest); org-scoped system corpus only, retrieval-scope asserted in-query' },
  { fn: 'qbank_generation_question_evidence', witnesses: ['qbank_assert_retrieval_scope', 'search_path=public, pg_temp'],
    reason: 'qbank bounded question-evidence reader (§6.1 manifest); org-scoped system corpus only, retrieval-scope asserted in-query' },
];

/** rev r3 G-V: view exemptions. All views/materialized views are enumerated; any whose
 *  body references an attribution column must be security_invoker=true OR exactly one of
 *  these entries, whose contract is: superuser owner + EXACT view body (pg16
 *  pg_get_viewdef, whitespace-normalized) + pinned invoker state. qbank_visible_ref is
 *  deliberately definer-rights BY DESIGN (0016:63-65 — the owner-bypass is load-bearing
 *  for the curated-visible join face, fail-closed DO at 0016:71+, body restricted to the
 *  __system_qbank__ corpus + curated pool, app_role SELECT is the only exposed grant), so
 *  drift in EITHER direction (body widened OR invoker flipped) is red via the exact pins. */
const VIEW_EXEMPT: readonly { view: string; invokerMustBe: boolean; defExact: string; reason: string }[] = [
  { view: 'qbank_visible_ref', invokerMustBe: false,
    defExact: "SELECT p.ref_id FROM qbank_pool_entry p JOIN qbank_source s ON s.id = p.source_id WHERE s.status = 'approved'::text UNION SELECT v.ref_id FROM vector_chunk v WHERE v.kind = 'qbank'::text AND v.owner_user_id = '__system_qbank__'::text AND NOT (EXISTS ( SELECT 1 FROM qbank_pool_entry pe WHERE pe.ref_id = v.ref_id));",
    reason: '0016 curated-visible join face; security_invoker=false is the documented design (0016:63-65) with a fail-closed owner-bypass DO at 0016:71; body restricted to system qbank corpus + curated pool — no owner data; exact body pin makes the falsification F7 widening red' },
  { view: 'qbank_retrieval_candidate', invokerMustBe: false,
    defExact: "SELECT p.ref_id, p.source_id, p.content_hash FROM qbank_pool_entry p JOIN qbank_source s ON s.id = p.source_id JOIN qbank_chunk ch ON ch.ref_id = p.ref_id AND ch.source_id = p.source_id AND ch.content_hash = p.content_hash WHERE s.status = 'approved'::text AND s.content_hash = p.content_hash AND (p.content_hash = \"left\"(encode(digest(convert_to(ch.content, 'UTF8'::name), 'sha256'::text), 'hex'::text), 32) OR p.content_hash = encode(digest(convert_to(ch.content, 'UTF8'::name), 'sha256'::text), 'hex'::text));",
    reason: '0068 content-fact retrieval candidate face (0068:111-121); body references no attribution column today but reads qbank corpus tables, so its definer-rights body is exact-pinned too — any widening is red' },
];

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

/** Census baseline pinned to THIS branch's migration chain (223 files since rev r3 —
 *  0225_auth_user_session_owner_rls adds one policy + flips auth_user_session to an
 *  RLS table: 340+1/166+1 from the rev r2 chain). If a rebase/merge moves the chain,
 *  re-count and update these two constants consciously — drift must never green
 *  silently. */
const POLICY_CENSUS_BASELINE = { policies: 341, rlsTables: 167 };

/** rev r3 session-table policy predicate (0225), exact-equality target for the M8
 *  introspection arm — same normalization as the canonical OWNER_PREDICATE. */
const SESSION_PREDICATE_RAW = "user_id = current_setting('app.principal_user', true)";
const SESSION_PREDICATE = normPolicy(SESSION_PREDICATE_RAW);

/** pg_policies deparses roles as a text[] — normalize to a plain string list. Shared by
 *  the I2 canonical face and the rev r3 M8 session face. */
function toRolesSafe(v: unknown): string[] {
  return Array.isArray(v)
    ? v.map((x) => String(x))
    : String(v ?? '').replace(/[{}]/g, '').split(',').map((s) => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
}

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
const SES_A = `tir-ses-a-${HEX}`;      // A active session row (M8 cross-owner NEG anchors)
const SES_A_REVOKE = `tir-ses-a2-${HEX}`; // A session A revokes itself (own-UPDATE positive control)
const SES_B = `tir-ses-b-${HEX}`;      // B active session row = cross-owner NEG target
const UM_A3 = `tir-um-a3-${PID}-${HEX}`; // extra A memory row for the M7 own-DELETE control

const admin = createPool();

interface Receipt {
  policyTotal: number;
  rlsEnabledTables: number;
  familyPolicies: Record<string, string[]>;
  familyAppFacingPolicies: Record<string, string[]>;
  sharedCorpusFace: { table: string; readPolicySharesGlobal: boolean; writePolicyOwnerPredicated: boolean };
  tenantOrgObservation: { tenantColumns: number; tenantPredicatePolicies: number };
  ownerColumnCensus: {
    tablesWithAttributionColumn: number; withRls: number; uncoveredWithoutRls: string[];
    userScope: { tables: number; withRls: number };
    actorBy: { tables: number; withRls: number };
    migrationScanSuspects: string[];
    semanticExcluded: { name: string; reason: string }[];
  };
  rlsFreeAllowlist: { table: string; reason: string }[];
  allowlistProbe: { principalsProbed: number; triplesProbed: number; namedTripleAllowlistSize: number; violations: string[] };
  sessionFace: { policies: number; usingExact: boolean; withCheckExact: boolean; deleteGrantAbsent: boolean; codePathsWitnessed: boolean };
  ownershipCensus: { attributionRelations: number; ownerCounts: Record<string, number>; fixedOwners: { owner: string; super: boolean; declaredAt: string }[]; violations: string[] };
  sdReaderCensus: { executableSd: number; flagged: number; standardGated: number; nonSuperOwned: number; allowlist: { fn: string; reason: string }[]; violations: string[] };
  viewCensus: { views: { name: string; kind: string; owner: string; ownerSuper: boolean; securityInvoker: boolean; touchesAttributionColumns: boolean }[]; violations: string[] };
}

const receipt: Receipt = {
  policyTotal: -1,
  rlsEnabledTables: -1,
  familyPolicies: {},
  familyAppFacingPolicies: {},
  sharedCorpusFace: { table: 'rag_corpus_document', readPolicySharesGlobal: false, writePolicyOwnerPredicated: false },
  tenantOrgObservation: { tenantColumns: -1, tenantPredicatePolicies: -1 },
  ownerColumnCensus: {
    tablesWithAttributionColumn: -1, withRls: -1, uncoveredWithoutRls: [],
    userScope: { tables: -1, withRls: -1 },
    actorBy: { tables: -1, withRls: -1 },
    migrationScanSuspects: [],
    semanticExcluded: SEMANTIC_EXCLUDED_COLUMNS.map((x) => ({ name: x.name, reason: x.reason })),
  },
  rlsFreeAllowlist: RLS_FREE_ALLOWLIST.map((x) => ({ table: x.table, reason: x.reason })),
  allowlistProbe: { principalsProbed: -1, triplesProbed: -1, namedTripleAllowlistSize: RLS_FREE_GRANT_TRIPLES.length, violations: [] },
  sessionFace: { policies: -1, usingExact: false, withCheckExact: false, deleteGrantAbsent: false, codePathsWitnessed: false },
  ownershipCensus: {
    attributionRelations: -1, ownerCounts: {}, fixedOwners: FIXED_TABLE_OWNERS.map((x) => ({ ...x })), violations: [],
  },
  sdReaderCensus: {
    executableSd: -1, flagged: -1, standardGated: -1, nonSuperOwned: -1,
    allowlist: SD_GATE_ALLOWLIST.map((x) => ({ fn: x.fn, reason: x.reason })), violations: [],
  },
  viewCensus: { views: [], violations: [] },
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

  // M8 session fixtures: seeded through the LOGIN CODE PATH ITSELF (auth-session.ts
  // issueSessionToken issues `INSERT INTO auth_user_session(jti, user_id, pwd_epoch)`
  // inside db.asPrincipal(uid)) — the policy must be self-satisfying for the app's own
  // three paths, so the positive control is the app-shaped statement under asPrincipal,
  // not an admin bypass seed. A failure here is an honest red (not an env crash).
  {
    let seedErr: string | null = null;
    try {
      await asPrincipal(admin, OWNER_A, (c) => c.query(
        'INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [SES_A, OWNER_A, 0]));
      await asPrincipal(admin, OWNER_A, (c) => c.query(
        'INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [SES_A_REVOKE, OWNER_A, 0]));
      await asPrincipal(admin, OWNER_B, (c) => c.query(
        'INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [SES_B, OWNER_B, 0]));
    } catch (e) { seedErr = code(e); }
    A('M8a login-path INSERT positive control: asPrincipal(uid) INSERT INTO auth_user_session succeeds (issueSessionToken shape, 0225 predicate self-satisfying)',
      seedErr === null, `err=${seedErr ?? 'none'}`);
  }

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

  // ---- M8 (rev r3): auth_user_session face — the P1-1 live leak closed by 0225 ----
  // Falsification priv1-post-2 P1-1: this table (user_id attribution, 0169 object grants
  // SELECT/INSERT/UPDATE to app_role, zero RLS) let app_role read and REVOKE other users'
  // session rows (jti/pwd_epoch truth source) — live-tested. 0225 adds FORCE RLS + p_owner
  // keyed on user_id; the three app paths already run inside db.asPrincipal(uid). This
  // matrix evidences the closed face; the falsification's F5-style alias blind spot is
  // closed by the widened G census + migration scan below.
  {
    // cross-owner SELECT: A sees none of B's session rows, own row visible (isSessionActive query shape)
    const selNeg = await asPrincipal(admin, OWNER_A, (c) => c.query('SELECT 1 FROM auth_user_session WHERE jti=$1 AND revoked_at IS NULL', [SES_B]));
    const selPos = await asPrincipal(admin, OWNER_A, (c) => c.query('SELECT 1 FROM auth_user_session WHERE jti=$1 AND revoked_at IS NULL', [SES_A]));
    A('M8b cross-owner session SELECT=0 / own row ≥1 (isSessionActive query shape)', selNeg.rowCount === 0 && (selPos.rowCount ?? 0) === 1,
      `neg=${String(selNeg.rowCount)} pos=${String(selPos.rowCount)}`);
    // cross-owner revoke: A cannot revoke B's session (revocation truth source integrity)
    const updNeg = await asPrincipal(admin, OWNER_A, (c) => c.query(
      'UPDATE auth_user_session SET revoked_at=now() WHERE jti=$1 AND revoked_at IS NULL', [SES_B]));
    const bUnrevoked = (await admin.query('SELECT revoked_at FROM auth_user_session WHERE jti=$1', [SES_B])).rows[0]?.revoked_at === null;
    A('M8c cross-owner session revoke UPDATE=0 rows + B row stays unrevoked', updNeg.rowCount === 0 && bUnrevoked,
      `neg=${String(updNeg.rowCount)} bUnrevoked=${String(bUnrevoked)}`);
    const updPos = await asPrincipal(admin, OWNER_A, (c) => c.query(
      'UPDATE auth_user_session SET revoked_at=now() WHERE jti=$1 AND revoked_at IS NULL', [SES_A_REVOKE]));
    const aRevoked = (await admin.query('SELECT revoked_at FROM auth_user_session WHERE jti=$1', [SES_A_REVOKE])).rows[0]?.revoked_at !== null;
    A('M8c-pos own-session revoke positive control: own UPDATE=1 row, revoked_at set (revokeSession shape)',
      (updPos.rowCount ?? 0) === 1 && aRevoked, `pos=${String(updPos.rowCount)} aRevoked=${String(aRevoked)}`);
    // impersonating INSERT under B's user_id → WITH CHECK 42501, row absent
    const impJti = `tir-ses-n-${HEX}`;
    let insErr = 'insert-succeeded';
    try {
      await asPrincipal(admin, OWNER_A, (c) => c.query(
        'INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)', [impJti, OWNER_B, 0]));
    } catch (e) { insErr = code(e); }
    const impAbsent = (await admin.query('SELECT count(*)::int AS n FROM auth_user_session WHERE jti=$1', [impJti])).rows[0]?.n === 0;
    A('M8d impersonating session INSERT (user_id=B) rejected 42501 + row absent', insErr === '42501' && impAbsent,
      `got=${insErr} absent=${String(impAbsent)}`);
    // GUC-unset app_role → 0 rows default deny
    {
      const c = await admin.connect();
      try {
        await c.query('BEGIN');
        await c.query('SET LOCAL ROLE app_role');
        const n = await c.query('SELECT count(*)::int AS n FROM auth_user_session');
        A('M8e app_role GUC unset → session rows default deny 0', n.rows[0]?.n === 0, `n=${String(n.rows[0]?.n)}`);
        await c.query('ROLLBACK');
      } finally { c.release(); }
    }
    // grant face: SELECT/INSERT/UPDATE per 0169, DELETE deliberately absent (revocation is UPDATE revoked_at)
    const grants = await admin.query(
      `SELECT has_table_privilege('app_role','auth_user_session','SELECT') AS s,
              has_table_privilege('app_role','auth_user_session','INSERT') AS i,
              has_table_privilege('app_role','auth_user_session','UPDATE') AS u,
              has_table_privilege('app_role','auth_user_session','DELETE') AS d`);
    const g = grants.rows[0] ?? {};
    A('M8f grant face pinned: app_role SELECT/INSERT/UPDATE present, DELETE absent (0169 audit-keeping design)',
      g.s === true && g.i === true && g.u === true && g.d === false,
      `s=${String(g.s)} i=${String(g.i)} u=${String(g.u)} d=${String(g.d)}`);
    receipt.sessionFace.deleteGrantAbsent = g.d === false;
    // introspection: RLS enabled+forced, exactly one app_role-facing policy, predicate exact both sides
    const rls = await admin.query(
      `SELECT c.relrowsecurity AS rls, c.relforcerowsecurity AS force_rls
         FROM pg_class c WHERE c.relnamespace='public'::regnamespace AND c.relname='auth_user_session' AND c.relkind='r'`);
    const pol = await admin.query(
      `SELECT policyname, roles, cmd, qual, with_check FROM pg_policies
        WHERE schemaname='public' AND tablename='auth_user_session'`);
    interface SesPol { policyname: string; roles: unknown; cmd: string; qual: string | null;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_policies column is snake_case
      with_check: string | null }
    const appFacing = (pol.rows as SesPol[]).filter((x) => toRolesSafe(x.roles).includes('app_role') || toRolesSafe(x.roles).includes('public'));
    const usingExact = appFacing.every((x) => x.qual !== null && normPolicy(x.qual) === SESSION_PREDICATE);
    const withCheckExact = appFacing.every((x) => x.with_check !== null && normPolicy(x.with_check) === SESSION_PREDICATE);
    A('M8g introspection: auth_user_session relrowsecurity+relforcerowsecurity=true (0225)',
      rls.rows[0]?.rls === true && rls.rows[0]?.force_rls === true,
      `rls=${String(rls.rows[0]?.rls)} force=${String(rls.rows[0]?.force_rls)}`);
    A('M8h introspection: exactly one app_role-facing policy, USING and WITH CHECK exact-match the 0225 session predicate (Ban substring)',
      appFacing.length === 1 && usingExact && withCheckExact,
      `policies=${appFacing.length} usingExact=${String(usingExact)} withCheckExact=${String(withCheckExact)}`);
    receipt.sessionFace.policies = appFacing.length;
    receipt.sessionFace.usingExact = appFacing.length === 1 && usingExact;
    receipt.sessionFace.withCheckExact = appFacing.length === 1 && withCheckExact;
    // code-path witnesses: the three statements live in asPrincipal(uid) transactions
    const ses = readWitness('apps/api/src/platform/auth-session.ts');
    const wInsert = ses.includes('INSERT INTO auth_user_session(jti, user_id, pwd_epoch) VALUES ($1,$2,$3)');
    const wUpdate = ses.includes('UPDATE auth_user_session SET revoked_at=now() WHERE jti=$1 AND revoked_at IS NULL RETURNING 1');
    const wSelect = ses.includes('SELECT 1 FROM auth_user_session WHERE jti=$1 AND revoked_at IS NULL');
    const wAsPrincipal = (ses.match(/asPrincipal\(uid/g) ?? []).length >= 3;
    const m0225 = readWitness('packages/db/migrations/0225_auth_user_session_owner_rls.sql');
    const w0225 = m0225.includes('FORCE ROW LEVEL SECURITY') && m0225.includes(SESSION_PREDICATE_RAW);
    const m0169 = readWitness('packages/db/migrations/0169_auth_user_session.sql');
    const w0169 = m0169.includes('GRANT SELECT, INSERT, UPDATE ON auth_user_session TO app_role');
    A('M8i witnesses: three auth-session.ts paths (INSERT/UPDATE/SELECT) inside asPrincipal(uid) + 0225 predicate + 0169 grant face',
      wInsert && wUpdate && wSelect && wAsPrincipal && w0225 && w0169,
      `insert=${String(wInsert)} update=${String(wUpdate)} select=${String(wSelect)} asPrincipal=${String(wAsPrincipal)} m0225=${String(w0225)} m0169=${String(w0169)}`);
    receipt.sessionFace.codePathsWitnessed = wInsert && wUpdate && wSelect && wAsPrincipal && w0225 && w0169;
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

  // ---- G (rev r1, widened rev r3): whole-database attribution-column → RLS inversion ----
  // rev r0 had zero capture power over "table with owner column, no RLS" (mut F: a fresh
  // decoy table stayed green; three existing tables already had that shape and were silently
  // allowed). rev r1 inverted the four canonical names. rev r3 widens the inversion after the
  // falsification P1-1 root cause: the alias blind spot (`auth_user_session.user_id`) — the
  // inversion now runs over the UNION of the user-scope attribution family and the actor _by
  // family, each member of which was semantics-confirmed on the live chain (constants above).
  // The uncovered set must be empty OR exactly the named RLS_FREE_ALLOWLIST — never anything
  // unnamed — and each allowlist member is live-proven to hold ZERO table privileges across
  // ALL dynamically enumerated principals (rev r2: superuser/owner/BYPASSRLS/pg_ excluded,
  // PUBLIC included, app_role in the set; named empty triple allowlist is the only escape)
  // (REVOKE ALL / owner-only grants + SECURITY DEFINER-only access), so no user-reachable
  // face exists to protect.
  {
    const ALL_ATTRIBUTION_COLUMNS = [...ATTRIBUTION_COLUMNS, ...ACTOR_BY_COLUMNS];
    const allowNames = RLS_FREE_ALLOWLIST.map((x) => x.table);
    const attrRelPredicate = `EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($1::text[]))`;
    const uncoveredRows = await admin.query(
      `SELECT c.relname AS t
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind IN ('r','p') AND NOT c.relrowsecurity
          AND ${attrRelPredicate}
        ORDER BY c.relname`, [ALL_ATTRIBUTION_COLUMNS]);
    const uncovered = uncoveredRows.rows.map((x: { t: string }) => x.t);
    const census = await admin.query(
      `SELECT count(*)::int AS n,
              count(*) FILTER (WHERE c.relrowsecurity)::int AS rls,
              count(*) FILTER (WHERE EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($2::text[])))::int AS user_scope_n,
              count(*) FILTER (WHERE EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($2::text[])) AND c.relrowsecurity)::int AS user_scope_rls,
              count(*) FILTER (WHERE EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($3::text[])))::int AS actor_by_n,
              count(*) FILTER (WHERE EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($3::text[])) AND c.relrowsecurity)::int AS actor_by_rls
         FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relkind IN ('r','p')
          AND ${attrRelPredicate}`, [ALL_ATTRIBUTION_COLUMNS, ATTRIBUTION_COLUMNS, ACTOR_BY_COLUMNS]);
    const row = census.rows[0] ?? {};
    receipt.ownerColumnCensus = {
      tablesWithAttributionColumn: row.n ?? -1,
      withRls: row.rls ?? -1,
      uncoveredWithoutRls: uncovered,
      userScope: { tables: row.user_scope_n ?? -1, withRls: row.user_scope_rls ?? -1 },
      actorBy: { tables: row.actor_by_n ?? -1, withRls: row.actor_by_rls ?? -1 },
      migrationScanSuspects: [],
      semanticExcluded: SEMANTIC_EXCLUDED_COLUMNS.map((x) => ({ name: x.name, reason: x.reason })),
    };
    A('G inversion (rev r3 union): uncovered = attribution/actor-column tables without RLS ⊆ named allowlist (nonempty diff beyond it = FAIL)',
      uncovered.every((t) => allowNames.includes(t)),
      `uncovered=[${uncovered.join(',')}] allowlist=[${allowNames.join(',')}] census=${String(row.n)}/${String(row.rls)} (userScope ${String(row.user_scope_n)}/${String(row.user_scope_rls)} actorBy ${String(row.actor_by_n)}/${String(row.actor_by_rls)})`);
    // per-class sanity: both families must be non-empty (the widened constants match live
    // columns — guards against the census silently matching nothing after a rename)
    A('G census sanity: user-scope family and actor _by family both live-non-empty (widened constants bind real columns)',
      (row.user_scope_n ?? 0) >= 100 && (row.actor_by_n ?? 0) >= 5,
      `userScope=${String(row.user_scope_n)} actorBy=${String(row.actor_by_n)}`);

    // rev r3 G-SCAN: migration-chain column scan — the alias blind spot must never reopen.
    // Every attribution-shaped column name introduced by the migration chain (static CREATE
    // TABLE bodies + ADD COLUMN clauses, plpgsql variables excluded) must be one of the
    // pinned constants or a named semantic exclusion; any NEW alias name (falsification
    // F5 decoy shape) turns this red before the live inversion can even miss it.
    {
      const migDir = join(REPO_ROOT, 'packages', 'db', 'migrations');
      const migFiles = readdirSync(migDir).filter((f) => f.endsWith('.sql')).sort();
      const TYPE = String.raw`\s+(?:text|integer|int|bigint|smallint|boolean|bool|timestamptz|timestamp|jsonb|json|uuid|vector|halfvec|numeric|real|double\s+precision|bytea|date|interval|serial|bigserial|char|varchar)\b`;
      const colDefRe = new RegExp(String.raw`^\s+([a-z][a-z0-9_]*)` + TYPE);
      const colInlineRe = new RegExp(String.raw`([a-z][a-z0-9_]*)` + TYPE, 'g');
      const addColRe = new RegExp(String.raw`\bADD\s+(?:COLUMN\s+)?(?:IF\s+NOT\s+EXISTS\s+)?([a-z][a-z0-9_]*)` + TYPE, 'i');
      const suspectRe = /(^|_)(user_id|tenant_id|org_id|workspace_id)$|_user_id$|_by$|owner|principal/;
      const suspects = new Set<string>();
      const addIfSuspect = (name: string | undefined) => {
        if (name && !name.startsWith('p_') && suspectRe.test(name)) suspects.add(name);
      };
      for (const f of migFiles) {
        const lines = readFileSync(join(migDir, f), 'utf8').split('\n');
        let inCreate = false;
        for (const line of lines) {
          if (!inCreate && /\bCREATE\s+(?:UNLOGGED\s+|TEMP(?:ORARY)?\s+|LOCAL\s+TEMP(?:ORARY)?\s+)*TABLE\b/i.test(line)) {
            // column defs may start on the CREATE TABLE line itself (inline single-line
            // tables must not escape the scan — falsification F5 decoy shape)
            inCreate = true;
            const open = line.indexOf('(');
            const inline = open >= 0 ? line.slice(open + 1) : '';
            for (const m of inline.matchAll(colInlineRe)) addIfSuspect(m[1]);
            if (/\)\s*(;|PARTITION|WITH|TABLESPACE|AS|INHERITS|$)/.test(inline)) inCreate = false;
          } else if (inCreate) {
            if (/^\s*\)/.test(line)) inCreate = false;
            else { const m = line.match(colDefRe); if (m) addIfSuspect(m[1]); }
          }
          const am = line.match(addColRe);
          if (am) addIfSuspect(am[1]);
        }
      }
      const known = new Set<string>([...ATTRIBUTION_COLUMNS, ...ACTOR_BY_COLUMNS, ...SEMANTIC_EXCLUDED_COLUMNS.map((x) => x.name)]);
      const unknownAlias = [...suspects].filter((n) => !known.has(n)).sort();
      receipt.ownerColumnCensus.migrationScanSuspects = [...suspects].sort();
      A('G-SCAN migration chain: every attribution-shaped column name ∈ pinned constants ∪ named semantic exclusions (new alias = FAIL)',
        suspects.has('owner_user_id') && suspects.has('user_id') && unknownAlias.length === 0,
        `suspects=${suspects.size} unknown=[${unknownAlias.join(',')}]`);
    }

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
    // rev r3: the two widened allowlist entries' SD entry paths are owner-gated too
    const costGated = await admin.query(
      `SELECT count(*)::int AS n,
              bool_and(p.prosecdef) AS sd,
              bool_and(position('ai_cost_require_request_owner' in p.prosrc) > 0) AS gated,
              bool_and(has_function_privilege('app_role', p.oid, 'EXECUTE')) AS app_exec,
              bool_and(NOT has_function_privilege('public', p.oid, 'EXECUTE')) AS no_public_exec
         FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='public' AND p.prosecdef AND p.prokind='f'
          AND p.prosrc ~ 'ai_cost_reservation'
          AND (has_function_privilege('app_role', p.oid, 'EXECUTE') OR has_function_privilege('public', p.oid, 'EXECUTE'))`);
    const cg = costGated.rows[0] ?? {};
    A('G ai_cost_reservation entry paths: every app/PUBLIC-executable SD function referencing it is definer-owned and ai_cost_require_request_owner-gated',
      (cg.n ?? 0) >= 2 && cg.sd === true && cg.gated === true && cg.app_exec === true && cg.no_public_exec === true,
      `n=${String(cg.n)} sd=${String(cg.sd)} gated=${String(cg.gated)} appExec=${String(cg.app_exec)} noPublicExec=${String(cg.no_public_exec)}`);

    const m0120 = readWitness('packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql');
    const m0088 = readWitness('packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql');
    const revokes = m0120.includes('REVOKE ALL ON ai_model_admission_policy, ai_model_fee_ledger, ai_model_breaker_state, ai_model_concurrency_lease FROM app_role')
      && m0088.includes('REVOKE ALL ON ai_model_invocation_transition_permit FROM PUBLIC, app_role');
    A('G migration REVOKE ALL witnesses present (0120:132 ledger+lease, 0088:27 permit)', revokes);
  }

  // ---- G-O (rev r3): ownership drift capture — falsification P1-2 (mut F2) ----
  // rev r2 silently lost a principal when an allowlist table's owner moved to a runtime
  // role (principals 26→25, full owner rights, all green). The inversion: every
  // attribution-carrying relation (r/p/v/m) must be owned by a FIXED migration-chain
  // declared name (superuser executor or a NOLOGIN/NOINHERIT/NOBYPASSRLS definer owner);
  // non-super fixed owners keep the definer-isolation role shape, and every attribution
  // relation they own stays ENABLE+FORCE RLS (the definer-owner contract).
  {
    interface OwnRow { relname: string; relkind: string; owner: string; rolsuper: boolean;
      rolcanlogin: boolean; rolbypassrls: boolean; rolinherit: boolean; rls: boolean; forceRls: boolean }
    const own = await admin.query(
      `SELECT c.relname, c.relkind::text, pg_get_userbyid(c.relowner) AS owner,
              r.rolsuper, r.rolcanlogin, r.rolbypassrls, r.rolinherit,
              c.relrowsecurity AS "rls", c.relforcerowsecurity AS "forceRls"
         FROM pg_class c JOIN pg_roles r ON r.oid=c.relowner
        WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('r','p','v','m')
          AND EXISTS (SELECT 1 FROM pg_attribute a
                       WHERE a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
                         AND a.attname = ANY($1::text[]))
        ORDER BY c.relname`, [[...ATTRIBUTION_COLUMNS, ...ACTOR_BY_COLUMNS]]);
    const rels = own.rows as OwnRow[];
    const fixed = new Map(FIXED_TABLE_OWNERS.map((x) => [x.owner, x]));
    const ownViolations: string[] = [];
    for (const rel of rels) {
      const fx = fixed.get(rel.owner);
      if (!fx) ownViolations.push(`(${rel.relname},${rel.relkind},owner=${rel.owner} not-in-fixed-list)`);
      else if (!fx.super) {
        if (rel.rolcanlogin || rel.rolbypassrls || rel.rolinherit) ownViolations.push(`(${rel.relname},owner=${rel.owner} shape-broken)`);
        if (rel.rls !== true || rel.forceRls !== true) ownViolations.push(`(${rel.relname},owner=${rel.owner} rls/force off)`);
      }
    }
    const ownerCounts: Record<string, number> = {};
    for (const rel of rels) ownerCounts[rel.owner] = (ownerCounts[rel.owner] ?? 0) + 1;
    receipt.ownershipCensus.attributionRelations = rels.length;
    receipt.ownershipCensus.ownerCounts = ownerCounts;
    receipt.ownershipCensus.violations = ownViolations;
    A('G-O ownership: every attribution-carrying relation owned by a fixed migration-declared name; runtime-role owners = FAIL (mut F2 red)',
      rels.length >= 100 && ownViolations.length === 0,
      `rels=${String(rels.length)} owners=${JSON.stringify(ownerCounts)} violations=[${ownViolations.slice(0, 6).join(' ')}${ownViolations.length > 6 ? ' …' : ''}]`);
    const shapeRows = await admin.query(
      `SELECT rolname, rolsuper, rolcanlogin, rolbypassrls, rolinherit
         FROM pg_roles WHERE rolname = ANY($1::text[]) ORDER BY rolname`,
      [FIXED_TABLE_OWNERS.filter((x) => !x.super).map((x) => x.owner)]);
    const shapeOk = (shapeRows.rowCount === FIXED_TABLE_OWNERS.length - 1)
      && (shapeRows.rows as Record<string, unknown>[]).every((x) =>
        x.rolsuper === false && x.rolcanlogin === false && x.rolbypassrls === false && x.rolinherit === false);
    A('G-O definer-owner shape: non-super fixed owners are NOLOGIN · NOINHERIT · NOBYPASSRLS live (0073/0048/0050 declared shape)',
      shapeOk,
      `rows=${String(shapeRows.rowCount)} shapes=${JSON.stringify(shapeRows.rows)}`);
    const w0073 = readWitness('packages/db/migrations/0073_rag_control_plane_identity_isolation.sql');
    const w0048 = readWitness('packages/db/migrations/0048_checkpoint_physical_erasure.sql');
    const w0050 = readWitness('packages/db/migrations/0050_online_judge_control_plane.sql');
    const ownWitness = w0073.includes('CREATE ROLE rag_control_definer NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS')
      && w0073.includes('ALTER TABLE public.%I OWNER TO rag_control_definer')
      && w0048.includes('CREATE ROLE privacy_worker_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS')
      && w0050.includes('CREATE ROLE online_judge_owner NOLOGIN NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS');
    A('G-O witnesses: fixed non-super owners declared NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS in migration chain', ownWitness);
  }

  // ---- G-SD (rev r3): SECURITY DEFINER reader face — falsification P1-3a (mut F6) ----
  // Dynamically enumerate every app_role/PUBLIC-executable SECURITY DEFINER function.
  // Superuser-owned ones bypass RLS entirely, so any whose body references a user-scope/
  // actor attribution column or a protected table must carry the standard first owner gate
  // (`principal IS NULL` / `ai_cost_require_request_owner`) OR be exactly one of the named
  // SD_GATE_ALLOWLIST entries with live witness pins. Flagged functions owned by non-
  // superuser roles are safe only because the owner keeps the NOBYPASSRLS definer-isolation
  // shape (RLS governs every query it runs) — that shape is asserted live above via G-O.
  {
    const flat = (s: unknown): string => String(s ?? '').replace(/\s+/g, ' ');
    const sdRows = await admin.query(
      `SELECT p.proname, p.prosrc, p.proconfig, pg_get_userbyid(p.proowner) AS owner, ro.rolsuper AS owner_super,
              has_function_privilege('app_role', p.oid, 'EXECUTE') AS app_exec,
              has_function_privilege('public', p.oid, 'EXECUTE') AS public_exec
         FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace JOIN pg_roles ro ON ro.oid=p.proowner
        WHERE n.nspname='public' AND p.prosecdef AND p.prokind='f'
          AND p.prorettype <> 'trigger'::regtype
          AND (has_function_privilege('app_role', p.oid, 'EXECUTE') OR has_function_privilege('public', p.oid, 'EXECUTE'))`);
    const COLS = [...ATTRIBUTION_COLUMNS, ...ACTOR_BY_COLUMNS].join('|');
    const TABLES = [...CANONICAL_FAMILY, 'auth_user_session', ...RLS_FREE_ALLOWLIST.map((x) => x.table)].join('|');
    const colRe = new RegExp(`(^|[^_a-zA-Z])(${COLS})([^_a-zA-Z]|$)`);
    const tabRe = new RegExp(`(FROM|JOIN|INTO|UPDATE)\\s+(public\\.)?(${TABLES})([^_a-zA-Z]|$)`);
    interface SdRow { proname: string; prosrc: string; proconfig: string[] | null; owner: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_roles column is snake_case
      owner_super: boolean; app_exec: boolean; public_exec: boolean }
    const flagged: SdRow[] = [];
    let standardGated = 0, nonSuperOwned = 0;
    const sdViolations: string[] = [];
    for (const r of sdRows.rows as SdRow[]) {
      const src = flat(r.prosrc);
      if (!colRe.test(src) && !tabRe.test(src)) continue;
      flagged.push(r);
      if (!r.owner_super) { nonSuperOwned += 1; continue; }
      // witness target = flattened body + the function's SET clause (search_path pin lives in proconfig)
      const witnessTarget = `${src} | ${(r.proconfig ?? []).join(',')}`;
      if (src.includes('principal IS NULL') || src.includes('ai_cost_require_request_owner')) { standardGated += 1; continue; }
      const entry = SD_GATE_ALLOWLIST.find((x) => x.fn === r.proname);
      if (!entry) { sdViolations.push(`(${r.proname}: no gate, not allowlisted)`); continue; }
      const missingWitness = entry.witnesses.filter((w) => !witnessTarget.includes(w));
      if (missingWitness.length > 0) sdViolations.push(`(${r.proname}: missing witnesses [${missingWitness.join(',')}])`);
      if (!r.app_exec || r.public_exec) sdViolations.push(`(${r.proname}: EXECUTE face drifted app=${String(r.app_exec)} public=${String(r.public_exec)})`);
    }
    const allowlistMissing = SD_GATE_ALLOWLIST.filter((x) => !flagged.some((r) => r.proname === x.fn)).map((x) => x.fn);
    const qbankEntry = SD_GATE_ALLOWLIST.filter((x) => x.fn.startsWith('qbank_generation_'));
    const manifest = readWitness('packages/db/src/principal.ts');
    const qbankManifestPinned = qbankEntry.every((x) => manifest.includes(`signature: '${x.fn}(`));
    receipt.sdReaderCensus = {
      executableSd: sdRows.rowCount ?? -1,
      flagged: flagged.length,
      standardGated,
      nonSuperOwned,
      allowlist: SD_GATE_ALLOWLIST.map((x) => ({ fn: x.fn, reason: x.reason })),
      violations: sdViolations,
    };
    A('G-SD reader face: superuser-owned app/PUBLIC-executable SD touching user columns/protected tables are gated or exactly the named evidenced allowlist (mut F6 red)',
      (sdRows.rowCount ?? 0) >= 100 && flagged.length >= 100 && allowlistMissing.length === 0 && sdViolations.length === 0,
      `sd=${String(sdRows.rowCount)} flagged=${String(flagged.length)} standardGated=${String(standardGated)} nonSuperOwned=${String(nonSuperOwned)} missing=[${allowlistMissing.join(',')}] violations=[${sdViolations.slice(0, 4).join(' ')}]`);
    A('G-SD qbank bounded readers: manifest-pinned in principal.ts QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST (static §6.1 contract)',
      qbankManifestPinned, `entries=${String(qbankEntry.length)} pinned=${String(qbankManifestPinned)}`);
    A('G-SD census receipt: executable/flagged/gated/non-super counts recorded',
      (sdRows.rowCount ?? 0) > 0 && flagged.length > 0 && standardGated > 0 && nonSuperOwned > 0,
      `sd=${String(sdRows.rowCount)} flagged=${String(flagged.length)} gated=${String(standardGated)} nonSuper=${String(nonSuperOwned)}`);
  }

  // ---- G-V (rev r3): view face — falsification P1-3b (mut F7) ----
  // A non-security_invoker view executes with its OWNER's privileges: a superuser-owned
  // definer-rights view bypasses RLS on every table its body touches, so body drift is a
  // cross-owner read channel. Every view/materialized view is enumerated; any whose body
  // references an attribution column must be security_invoker=true OR exactly a VIEW_EXEMPT
  // entry (superuser owner + pinned invoker state + EXACT body). Both current views are
  // exact-pinned, so the falsification's CREATE OR REPLACE widening is red on either.
  {
    const viewRows = await admin.query(
      `SELECT c.relname, c.relkind::text AS kind, pg_get_userbyid(c.relowner) AS owner,
              ro.rolsuper AS owner_super, coalesce(array_to_string(c.reloptions, ','), '') AS reloptions,
              regexp_replace(pg_get_viewdef(c.oid, true), '\\s+', ' ', 'g') AS def
         FROM pg_class c JOIN pg_roles ro ON ro.oid=c.relowner
        WHERE c.relnamespace='public'::regnamespace AND c.relkind IN ('v','m')
        ORDER BY c.relname`);
    interface VRow { relname: string; kind: string; owner: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_roles column is snake_case
      owner_super: boolean; reloptions: string; def: string }
    const attrRe = new RegExp(`(^|[^_a-zA-Z])(${[...ATTRIBUTION_COLUMNS, ...ACTOR_BY_COLUMNS].join('|')})([^_a-zA-Z]|$)`);
    const viewViolations: string[] = [];
    const viewReceipt: Receipt['viewCensus']['views'] = [];
    for (const v of viewRows.rows as VRow[]) {
      const invoker = v.reloptions.includes('security_invoker=true');
      const touches = attrRe.test(v.def);
      viewReceipt.push({ name: v.relname, kind: v.kind, owner: v.owner, ownerSuper: v.owner_super, securityInvoker: invoker, touchesAttributionColumns: touches });
      const exempt = VIEW_EXEMPT.find((x) => x.view === v.relname);
      if (exempt) {
        if (invoker !== exempt.invokerMustBe) viewViolations.push(`(${v.relname}: invoker state drifted, want ${String(exempt.invokerMustBe)})`);
        if (v.owner_super !== true) viewViolations.push(`(${v.relname}: owner not superuser)`);
        if (v.def.trim() !== exempt.defExact.trim()) viewViolations.push(`(${v.relname}: body drifted from pinned definition)`);
      } else if (touches && !invoker) {
        viewViolations.push(`(${v.relname}: references attribution columns, security_invoker=false, not exempted)`);
      }
    }
    receipt.viewCensus.views = viewReceipt;
    receipt.viewCensus.violations = viewViolations;
    const exemptOk = VIEW_EXEMPT.every((x) => viewReceipt.some((v) => v.name === x.view));
    A('G-V view face: attribution-referencing views are security_invoker or exact-pinned named exemptions; view body drift = FAIL (mut F7 red)',
      (viewRows.rowCount ?? 0) >= 2 && exemptOk && viewViolations.length === 0,
      `views=${String(viewRows.rowCount)} exempt=${String(VIEW_EXEMPT.length)} violations=[${viewViolations.join(' ')}]`);
    const visibleRef = await admin.query("SELECT has_table_privilege('app_role','qbank_visible_ref','SELECT') AS p");
    A('G-V qbank_visible_ref exposed face pinned: app_role SELECT is the only granted path (0016:70), body restricted to system corpus (exact pin above)',
      visibleRef.rows[0]?.p === true, `appSelect=${String(visibleRef.rows[0]?.p)}`);
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
