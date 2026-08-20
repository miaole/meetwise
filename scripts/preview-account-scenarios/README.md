# `deep-usage-v1` preview-account runner

This control drives only the two pre-provisioned preview accounts through the
existing HTTP contracts. It must run as a real non-root user on ECS, with the
API exposed only on loopback (`127.0.0.1:8787`). It does not import the DB
package, connect to RDS/Tair, read `/etc/meetwise`, call a model directly, or
write interview/question/event/report/score rows.

The durable state file contains account IDs, application/interview IDs, SSE
cursors, question identities, answer IDs/hashes and job IDs. After online
verification it also stores the complete secret-free `deep-usage` receipt
(`receiptLayer`, dataset/scenario identity, predecessor capacity dataset,
observations, session count, digest, and `unproven` disclosures), so a root
capture can bind the receipt without reconstructing it from transient stdout.
It never contains passwords, bearer tokens, question text or answer text. A
committed response loss is recovered by replaying the same `TurnDto` identity;
a response that is not known to be idempotent is not retried.

## Run on ECS

The operator must first provision a finite, expiring `gift` entitlement for
the exact candidate ID through a separately audited trusted control operation.
The runner intentionally stops with `preview_entitlement_grant_required` when
the balance is insufficient. It never creates a payment order or grants its
own entitlement.

```sh
node scripts/preview-account-scenarios/runner.mjs run \
  --api http://127.0.0.1:8787 \
  --state /tmp/meetwise-preview-deep-usage-v1.json \
  --target-digest "$PREVIEW_TARGET_DIGEST" \
  --release-identity "$PREVIEW_RELEASE_IDENTITY"
```

`PREVIEW_C_PASSWORD` and `PREVIEW_B_PASSWORD` may be supplied by the ECS
operator environment for the already-created accounts. They are read only in
memory and are not printed or persisted. Both values must satisfy the shared
8--128 character authentication contract; the six-character value `123456`
is deliberately rejected instead of weakening the production login policy.
The catalog identities are the
Chinese-facing `previewc@meetwise.com` C 端 and `previewb@meetwise.com` B 端;
the passwords are deliberately not part of the catalog, source, receipt, or
state file.

The root caller must keep the execution boundaries separate:

- the candidate synthetic loader receives only the explicit read-only verifier
  contract `PREVIEW_VERIFY_DATABASE_URL`,
  `PREVIEW_VERIFY_DATABASE_SSL_CA_PATH`, and
  `PREVIEW_VERIFY_PG_TLS_SERVERNAME`, plus the exact identity bindings
  `PREVIEW_VERIFY_EXPECTED_DATABASE=meetwise_cloud_test` and
  `PREVIEW_VERIFY_EXPECTED_ROLE=meetwise_preview_audit`; the URL path and the
  connected `current_database()`/`current_user` must match those values. It
  must not inherit `DATABASE_URL`, a migration URL, or generic CA/TLS
  variables;
- this deep runner receives only `PREVIEW_API_BASE_URL` (loopback),
  `PREVIEW_SCENARIO_STATE`, `PREVIEW_TARGET_DIGEST`,
  `PREVIEW_RELEASE_IDENTITY`, `PREVIEW_C_PASSWORD`, and `PREVIEW_B_PASSWORD`;
  it receives no DB URL, migration credentials, or model/payment secret;
- prepare binds `/etc/meetwise/full-stack-verifier.env` to the first contract.
  That file is root-owned and readable by the verifier account only.

The dedicated `meetwise_preview_audit` login/role, its read-only grants on
`meetwise_cloud_test`, the TLS CA file, and the corresponding ECS secret/env
file are pre-launch resource actions. They must be provisioned and audited by
the operator outside this repository. The prepare, loader, and verifier code
never creates, alters, or falls back to a migration/runtime role; if the
dedicated role or any exact identity variable is missing, verification fails
closed before a receipt is emitted.

The prepare proof freezes this interface:

```sh
pnpm prepare-full-stack-release:prove
```

The large synthetic capacity dataset is versioned as the
`large-v1-successor` catalog. Its capacity receipt and this runner's
`deep-usage-v1` receipt use different `receiptLayer` values (`capacity` and
`deep-usage`) and different dataset/scenario identities
(`preview-large-v1-successor` versus `preview-deep-usage-v1`). A later capacity
verification must not parse the deep-usage projection as a zero-side-effect
capacity receipt.

The composition validator requires the capacity successor dataset/profile and
the `deep-usage-v1` receipt predecessor binding. It rejects an old
`large-v1` + deep-usage combination, while allowing deep-usage progress states
to remain independent of the capacity receipt's zero-side-effect counters.

`PREVIEW_TARGET_DIGEST` and `PREVIEW_RELEASE_IDENTITY` are mandatory release
bindings. The runner derives a target-scoped state path by appending both
bindings to the requested base path. A first run creates the three sessions
through the public API. On target N→N+1, if the fixed base file or a direct
target-scoped sibling is a complete `verified_online_projection`, the runner
creates a new ledger by cloning only the account/resume/application/interview
IDs and progress identity, clears the predecessor receipt, and performs
login/list/resume/job/application/interview/talent projection reads. It does
not call signup, start, begin, turn, or abandon on this path. The new receipt
is marked `attestationMode: "api_read_only"` and binds N+1; the N receipt is
never edited. Malformed, writable, or symlinked predecessor candidates fail
closed. The caller must capture the derived path (the exported
`targetScopedStatePath` helper is the canonical calculation) when handing the
state to the publication controller.

The direct CLI stdout includes `attestationMode`, predecessor bindings when
present, and the new receipt digest. The durable successor state is the
canonical source for publication; no password or bearer token is written.

To rerun after a process/SSH/SSE interruption, invoke the same command with the
same state path. To perform only the projection check:

```sh
node scripts/preview-account-scenarios/runner.mjs verify \
  --api http://127.0.0.1:8787 \
  --state /tmp/meetwise-preview-deep-usage-v1.json \
  --target-digest "$PREVIEW_TARGET_DIGEST" \
  --release-identity "$PREVIEW_RELEASE_IDENTITY"
```

## Expected online distribution

- One existing C-owned application bound to a B-owned job reaches at least 5
  applied turns or an actual terminal event.
- Two more existing invited applications reach at least 3 and 5 applied turns
  respectively, then use the real abandon endpoint. Their reservation is
  released by the service saga; the runner does not mark a terminal row itself.
- C therefore gets three non-zero, question-ledger-backed sessions while the
  old zero-turn large-history rows remain zero-turn. B retains its large job and
  talent projection and should observe `in_progress` and/or
  `assessment_unavailable`; every recruiter-visible `score` must remain `null`.
- A successful first session consumes one interview unit; the two abandoned
  sessions release their reservations. Payment orders and numeric scores are
  not part of this scenario.

The receipt is explicitly `verified_online_projection`; it lists database
forbidden counters, the full RLS matrix, and model/payment side effects as
unproven. The root/operator verification step must take the independent
read-only DB snapshot before declaring `deep_usage_verified`.

## Pure proof

```sh
node scripts/preview-account-scenarios/proof.mjs
```

The proof covers non-root/loopback gates, deterministic answer identity,
durable secret-free state, SSE question identities, three-session distribution,
abandon/release behavior, and a committed `/turn` response-loss replay against
an in-process HTTP fake. It does not claim ECS, RDS, Worker or model evidence.
