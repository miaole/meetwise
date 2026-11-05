/**
 * PRIV01-A · candidate A — owner isolation prove on isolated real PG.
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
 *   I1  RLS enable+force introspection — canonical owner family: relrowsecurity=true AND relforcerowsecurity=true
 *   I2  policy predicate introspection — canonical owner family policies: qual + with_check contain
 *                                        owner_user_id = current_setting('app.principal_user', …) (real
 *                                        pg_policies deparse, Ban grep-of-migration substitute)
 *   I3  policy census receipt          — total policy count + per-family policy names into receipt JSON;
 *                                        visibility='global' shared-corpus face (rag_corpus_document) reported
 *                                        separately, never mixed into the owner-data face conclusion
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
 *  expectation constant is run through the SAME normalization before compare
 *  (the normalize step erases the parentheses, so comparing raw text against
 *  normalized text never matches). */
function normPolicy(sql: string | null): string {
  return String(sql ?? '')
    .replace(/::[a-z ]+/g, '')
    .replace(/[()\s]+/g, ' ')
    .trim();
}
const OWNER_PREDICATE_RAW = "owner_user_id = current_setting('app.principal_user', true)";
const OWNER_PREDICATE = normPolicy(OWNER_PREDICATE_RAW);
const GLOBAL_DISJUNCTION = normPolicy("visibility = 'global'");

/** Canonical owner-data family (0001 DO-loop tables + later pure p_owner tables with full CRUD face).
 *  consumption_record is excluded: DROP TABLE by 0145_dead_table_jsonb_deprecate.sql:19 (dead-table
 *  retirement knife) — it no longer exists in the applied chain. */
const CANONICAL_FAMILY = [
  'interview', 'ai_graph_run', 'interview_event', 'ai_invocation_trace',
  'user_memory', 'vector_chunk', 'notification',
] as const;

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

const admin = createPool();

interface Receipt {
  policyTotal: number;
  rlsEnabledTables: number;
  familyPolicies: Record<string, string[]>;
  sharedCorpusFace: { table: string; readPolicySharesGlobal: boolean; writePolicyOwnerPredicated: boolean };
  tenantOrgObservation: { tenantColumns: number; tenantPredicatePolicies: number };
}

const receipt: Receipt = {
  policyTotal: -1,
  rlsEnabledTables: -1,
  familyPolicies: {},
  sharedCorpusFace: { table: 'rag_corpus_document', readPolicySharesGlobal: false, writePolicyOwnerPredicated: false },
  tenantOrgObservation: { tenantColumns: -1, tenantPredicatePolicies: -1 },
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
    "INSERT INTO user_memory(id, owner_user_id, kind, content) VALUES ($1,$2,'skill','a-keep'), ($3,$4,'skill','a-delete'), ($5,$6,'skill','b-target')",
    [MEM_A_UPDATE, OWNER_A, MEM_A_DELETE, OWNER_A, MEM_B, OWNER_B],
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

  // ---- I2: policy predicate introspection (real pg_policies, not migration grep) ----
  // Some tables split the owner face across per-action policies (e.g. vector_chunk p_vchunk_read /
  // p_vchunk_insert / …), where a SELECT-only policy carries no with_check and an INSERT-only policy
  // carries no qual. The honest per-table check is therefore: the read side (USING/qual) and the
  // write side (WITH CHECK) are EACH owner-predicated by at least one policy of that table.
  for (const t of CANONICAL_FAMILY) {
    const r = await admin.query(
      `SELECT policyname, qual, with_check FROM pg_policies
        WHERE schemaname='public' AND tablename=$1`, [t]);
    const names = r.rows.map((x: { policyname: string }) => x.policyname);
    receipt.familyPolicies[t] = names;
    const qualOK = r.rows.some((x: { qual: string | null }) => normPolicy(x.qual).includes(OWNER_PREDICATE));
    // eslint-disable-next-line @typescript-eslint/naming-convention -- pg_policies column is snake_case
    const chkOK = r.rows.some((x: { with_check: string | null }) => normPolicy(x.with_check).includes(OWNER_PREDICATE));
    A(`I2 ${t}: read (USING) and write (WITH CHECK) sides each owner-predicated on ${OWNER_PREDICATE_RAW}`,
      qualOK && chkOK, `qual=${qualOK} chk=${chkOK} policies=[${names.join(',')}]`);
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
