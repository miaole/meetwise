# `deep-usage-v1` preview-account runner

This control drives only the two pre-provisioned preview accounts through the
existing HTTP contracts. It must run as a real non-root user on ECS, with the
API exposed only on loopback (`127.0.0.1:8787`). It does not import the DB
package, connect to RDS/Tair, read `/etc/meetwise`, call a model directly, or
write interview/question/event/report/score rows.

The durable state file contains account IDs, application/interview IDs, SSE
cursors, question identities, answer IDs/hashes and job IDs. It never contains
passwords, bearer tokens, question text or answer text. A committed response
loss is recovered by replaying the same `TurnDto` identity; a response that is
not known to be idempotent is not retried.

## Run on ECS

The operator must first provision a finite, expiring `gift` entitlement for
the exact candidate ID through a separately audited trusted control operation.
The runner intentionally stops with `preview_entitlement_grant_required` when
the balance is insufficient. It never creates a payment order or grants its
own entitlement.

```sh
node scripts/preview-account-scenarios/runner.mjs run \
  --api http://127.0.0.1:8787 \
  --state /tmp/meetwise-preview-deep-usage-v1.json
```

`PREVIEW_C_PASSWORD` and `PREVIEW_B_PASSWORD` may be supplied by the ECS
operator environment for the already-created accounts. They are read only in
memory and are not printed or persisted. The current fixed preview credential
is the operator-provided one for both accounts.

To rerun after a process/SSH/SSE interruption, invoke the same command with the
same state path. To perform only the projection check:

```sh
node scripts/preview-account-scenarios/runner.mjs verify \
  --api http://127.0.0.1:8787 \
  --state /tmp/meetwise-preview-deep-usage-v1.json
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
