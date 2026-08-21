#!/usr/bin/env bash
# Root-side CD dispatch. Runs ONLY as root via sudo from meetwise-cd-receive.
#
# Security model (defense in depth):
#   1. sudoers allows `meetwise-cd` to run EXACTLY this script with NO wildcards.
#   2. This script re-validates every subcommand and argument itself (so a
#      compromised meetwise-cd account cannot smuggle an unvalidated command
#      through sudo). Never trusts the caller.
#   3. Every file read/written by root is confined to fixed, root-owned paths
#      (/srv/meetwise-full-stack, /etc/meetwise, /var/lib/meetwise-preview-*,
#      /var/lib/meetwise-cd, /srv/meetwise-compose). The incoming staging dir
#      /var/lib/meetwise-cd is the ONLY meetwise-cd-writable surface, and is
#      treated as untrusted input.
#   4. No secret is ever echoed. stderr carries only fail-closed reason codes.
#
# Subcommands (compose 单机 —— app 层跑容器，源码树只用于 prepare/合成校验):
#   receive-source <release>                          extract the staged source tarball
#   install-deps <release>                            filtered production @meetwise/db install — 供 prepare/db-verify 解析 pg
#   discard-unclaimed-release <release>               delete one safely unclaimed partial release
#   transaction compose-pull <tx> <release> <token> <backend-digest> <web-digest>
#                                                       钉住 .env 两镜像引用 + docker compose pull
#   prepare <transaction> <release> <recovery-token> <commit> <tree> <origin> <wb> <sa> <backend-digest> <web-digest>
#   migrate                                           run DB migrations via the one-shot migrate container
#   stage | publish | activate | probe-nonce (revoke is transaction-bound)
#   flip-current <release>                            repoint current symlink + compose up api/worker (web 停到 activate)
#   synthetic-verify <release>                        run showcase + large synthetic load (receipts)
#   confirm-public                                    promote the external probe receipt + confirm
#   transaction status-system                         read-only, tokenless ledger projection for recovery
#   transaction recover-system                        root-owned expiry/CAS recovery after runner cancellation
#   receive-controller <bundle> <archive>             validate a staged controller archive only
#   install-controller <bundle> <archive>             snapshot/install/verify/rollback a controller bundle
#   controller-recover                               recover a durable interrupted controller install
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
umask 077

[[ "${EUID}" -eq 0 ]] || { echo meetwise_cd_root_requires_root >&2; exit 2; }

RELEASES_ROOT=/srv/meetwise-full-stack/releases
CURRENT=/srv/meetwise-full-stack/current
INCOMING=/var/lib/meetwise-cd/incoming
PUBLISHER=/usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs
PUBLICATION=/usr/local/sbin/full-stack-preview-publication
PREPARE=/usr/local/lib/meetwise-preview-controller/full-stack/prepare-full-stack-release.mjs
MIGRATE_ENV=/etc/meetwise/full-stack-migrate.env
VERIFIER_ENV=/etc/meetwise/full-stack-verifier.env
PREVIEW_ACCOUNT_ENV=/etc/meetwise/preview-test-accounts.env
SYNTHETIC_CONTROLLER_ROOT=/usr/local/lib/meetwise-preview-controller/preview-synthetic-data
SYNTHETIC_LOADER="$SYNTHETIC_CONTROLLER_ROOT/loader.mjs"
DEEP_USAGE_RUNNER=/usr/local/lib/meetwise-preview-controller/preview-account-scenarios/runner.mjs
SHOWCASE_ENTITLEMENT=/usr/local/lib/meetwise-preview-controller/full-stack/provision-preview-showcase-entitlement.mjs
VERIFICATION=/etc/meetwise/full-stack-public-verification.json
COMPOSE_DIR=/srv/meetwise-compose
COMPOSE_ENV="$COMPOSE_DIR/.env"
COMPOSE_ENV_ROLLBACK="$COMPOSE_DIR/.env.rollback"
COMPOSE_ROLLBACK_MARKER="$COMPOSE_DIR/.rollback-compose-present"
COMPOSE_FILE="$COMPOSE_DIR/docker/compose.prod.yml"
ACR_PULL_ENV=/etc/meetwise/acr-pull.env
PUBLICATION_STATE=/var/lib/meetwise-preview-controller/full-stack-publication.json
PUBLIC_MANIFEST=/usr/share/meetwise-preview/preview-release-manifest.json
FULL_STACK_LEDGER=/var/lib/meetwise-preview-controller/full-stack-release-ledger.json
FULL_STACK_SNAPSHOTS=/var/lib/meetwise-preview-controller/full-stack-rollback
APPROVAL=/etc/meetwise/full-stack-release.json
TARGET=/etc/meetwise/preview-synthetic-target.json
PAGES_LINK_STATE=https://miaole.github.io/meetwise/preview-link-state.json

# The ECS image has Node/npm but does not guarantee Corepack on PATH.  Keep the
# package manager in a controller-owned prefix, and never execute a tool from
# the candidate release tree or the pre-existing /usr/local/bin/pnpm (which may
# have been installed by an unrelated user).  The version is the repository's
# root packageManager contract and is checked again before every install.
PNPM_VERSION=10.18.0
PNPM_INTEGRITY='sha512-6AT4ifHOzEDVctsITuw+SIFzn43sacD/ENLRvv+aTjCTg7ontbdQBZ1/TBSVNbbNDSyx7Trrc5I5pChKaPQM+g=='
PNPM_PREFIX=/usr/local/lib/meetwise-cd-pnpm
PNPM_BIN="$PNPM_PREFIX/bin/pnpm"
PNPM_PACKAGE_ROOT="$PNPM_PREFIX/lib/node_modules/pnpm"

RELEASE_RE='^[a-f0-9]{40}-fullstack-[0-9]{8}-[1-9][0-9]*-[1-9][0-9]*$'
# The one-time systemd-to-Compose takeover must be able to snapshot and restore
# the exact legacy release directory already on ECS. This wider pattern is
# used only for a predecessor symlink target; every candidate release and
# transaction identity continues to require RELEASE_RE.
LEGACY_PREDECESSOR_RELEASE_RE='^[a-f0-9]{7,40}-(progress|worktree)-[0-9]{8}-[1-9][0-9]*$'
COMMIT_RE='^[a-f0-9]{40}$'
DIGEST_RE='^[a-f0-9]{64}$'
IMAGE_DIGEST_RE='^sha256:[a-f0-9]{64}$'
ORIGIN_RE='^https://[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$'
TRANSACTION_ID_RE='^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'
TOKEN_RE='^[a-f0-9]{64}$'
CONTROLLER_VERSION=/etc/meetwise/cd-controller-version
CONTROLLER_MANIFEST=/usr/local/share/meetwise-cd/cd-controller-files.txt
CONTROLLER_ARCHIVE_MAX=67108864
CONTROLLER_ROLLOUT_ROOT=/var/lib/meetwise-preview-controller/controller-rollout
CONTROLLER_ROLLOUT_SNAPSHOTS="$CONTROLLER_ROLLOUT_ROOT/snapshots"
CONTROLLER_ROLLOUT_TARGETS="$CONTROLLER_ROLLOUT_ROOT/targets"
CONTROLLER_ROLLOUT_LEDGER="$CONTROLLER_ROLLOUT_ROOT/rollout-ledger.json"
FULL_STACK_RELEASE_RECOVERY_SERVICE=meetwise-full-stack-release-recovery.service
FULL_STACK_RELEASE_RECOVERY_TIMER=meetwise-full-stack-release-recovery.timer

die() { printf 'meetwise_cd_%s\n' "$1" >&2; exit "${2:-64}"; }

# Full-stack transaction mutations share the publication controller's kernel
# lock.  The JSON ledger is the durable CAS record; this lock only serializes
# the read/validate/rename sequence and is never represented by an environment
# variable that a forced-command caller can forge.
with_controller_lock() {
  local lock_dir=/run/meetwise-preview-controller
  local lock_path="$lock_dir/controller.lock"
  if [[ -e "$lock_dir" || -L "$lock_dir" ]]; then
    [[ -d "$lock_dir" && ! -L "$lock_dir" ]] || die full_stack_controller_lock_directory_invalid
  else
    install -d -o root -g root -m 0700 "$lock_dir"
  fi
  [[ "$(stat -c '%u:%g:%a' "$lock_dir" 2>/dev/null || true)" == '0:0:700' ]] || die full_stack_controller_lock_directory_invalid
  if [[ -e "$lock_path" || -L "$lock_path" ]]; then
    [[ -f "$lock_path" && ! -L "$lock_path" ]] || die full_stack_controller_lock_invalid
  else
    install -o root -g root -m 0600 /dev/null "$lock_path"
  fi
  [[ "$(stat -c '%u:%g:%a' "$lock_path" 2>/dev/null || true)" == '0:0:600' ]] || die full_stack_controller_lock_invalid
  exec 9>>"$lock_path"
  # The boot-persistent recovery timer uses the same lock for a short CAS
  # read.  Wait a bounded interval so a legitimate transaction command does
  # not fail merely because that read overlapped its SSH arrival.
  flock -w 15 9 || die full_stack_controller_busy 75
  export MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9
}

start_full_stack_release_recovery_timer() {
  /usr/bin/systemctl start --no-block "$FULL_STACK_RELEASE_RECOVERY_TIMER" >/dev/null 2>&1 || die full_stack_release_recovery_timer_start_failed 70
}

stop_full_stack_release_recovery_timer() {
  /usr/bin/systemctl stop --no-block "$FULL_STACK_RELEASE_RECOVERY_TIMER" >/dev/null 2>&1 || true
}

assert_transaction_args() {
  [[ "${1:-}" =~ $TRANSACTION_ID_RE ]] || die transaction_id_invalid
  [[ "${2:-}" =~ $RELEASE_RE ]] || die release_name_invalid
  [[ "${3:-}" =~ $TOKEN_RE ]] || die transaction_token_invalid
}

assert_transaction_ledger_identity() {
  local current_json="$1" transaction_id="$2" release="$3" token="$4"
  MEETWISE_TRANSACTION_TOKEN="$token" /usr/bin/node - "$current_json" "$transaction_id" "$release" <<'NODE' || die transaction_identity_mismatch
const { createHash } = require('node:crypto');
const [raw, transactionId, release] = process.argv.slice(2);
const ledger = JSON.parse(raw);
const token = process.env.MEETWISE_TRANSACTION_TOKEN ?? '';
const digest = createHash('sha256').update(token).digest('hex');
if (ledger.transactionId !== transactionId || ledger.release !== release || ledger.tokenDigest !== digest) process.exit(1);
NODE
}

# Prepare is an irreversible artifact-binding step and therefore cannot be a
# standalone root command.  The durable ledger is the only authority for its
# generation: require the exact token-bound transaction identity and the
# post-migration phase before handing any value to the prepare module.
prepare_ledger_generation() {
  local transaction_id="$1" release="$2" token="$3" commit="$4" tree="$5" current_json
  local prepare_status=0
  current_json="$(ledger_node ledger-prepare --transaction-id "$transaction_id" --release "$release" --token "$token" --commit "$commit" --tree "$tree")" || prepare_status=$?
  [[ "$prepare_status" -eq 0 ]] || { [[ "$prepare_status" -eq 75 ]] && die prepare_transaction_lease_expired 75; die prepare_transaction_identity_mismatch; }
  /usr/bin/node - "$current_json" "$transaction_id" "$release" "$commit" "$tree" <<'NODE' || die prepare_transaction_identity_mismatch
const [raw, transactionId, release, commit, tree] = process.argv.slice(2);
const ledger = JSON.parse(raw);
if (ledger.transactionId !== transactionId || ledger.release !== release
  || ledger.commit !== commit || ledger.tree !== tree || ledger.phase !== 'migrated'
  || !Number.isSafeInteger(ledger.generation) || ledger.generation < 1) process.exit(1);
process.stdout.write(String(ledger.generation));
NODE
}

ledger_node() {
  /usr/bin/node "$PUBLISHER" "$1" --path "$FULL_STACK_LEDGER" "${@:2}"
}

# Publication generation is a controller fact, never a workflow or public
# manifest input.  A missing state is the only fresh-host case and starts at
# one; a legacy public manifest is deliberately not read here.  Existing
# transactions reuse their durable generation, while a new transaction must
# advance the greatest trusted publication/terminal-ledger generation.
trusted_publication_generation() {
  local bootstrap_origin="$1"
  if [[ -e "$PUBLICATION_STATE" || -L "$PUBLICATION_STATE" ]]; then
    [[ -f "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" ]] || die generation_state_invalid
    [[ "$(stat -c '%u:%g:%a' "$PUBLICATION_STATE" 2>/dev/null || true)" == '0:0:600' ]] || die generation_state_invalid
    /usr/bin/node - "$PUBLICATION_STATE" <<'NODE' || die generation_state_invalid
const { readFileSync } = require('node:fs');
const value = JSON.parse(readFileSync(process.argv[2], 'utf8'));
if (!['verified', 'revoked'].includes(value.status) || !Number.isSafeInteger(value.generation) || value.generation < 1) process.exit(1);
process.stdout.write(String(value.generation));
NODE
  else
    # A clean controller host may still have a live predecessor published by
    # Pages.  Its exact public receipt is not release approval, but its
    # generation is a mandatory anti-collision floor for the successor.
    trusted_pages_link_identity "$bootstrap_origin" | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);process.stdout.write(String(v.generation))})'
  fi
}

trusted_pages_link_identity() {
  local bootstrap_origin="$1" state_json
  [[ "$bootstrap_origin" =~ ^https://[a-z0-9.-]+\.ts\.net$ ]] || die bootstrap_origin_invalid 70
  state_json="$(curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 https://miaole.github.io/meetwise/preview-link-state.json)" || die pages_link_identity_invalid 70
  if printf '%s' "$state_json" | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);const f=v.manifestSha256;if(!["enabled","disabled"].includes(v.state)||!Number.isSafeInteger(v.generation)||v.generation<1||!/^[a-f0-9]{64}$/.test(f??"")||v.finalFingerprint!==f)process.exit(1)})'; then
    printf '%s' "$state_json" | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);process.stdout.write(JSON.stringify({state:v.state,generation:v.generation,fingerprint:v.manifestSha256}))})'
    return
  fi
  # A scheduled Pages run can publish an identity-complete disabled bootstrap
  # receipt while no controller publication state exists yet.  It has no
  # release generation by construction.  Treat only this exact shape as the
  # generation-zero floor; the durable terminal transaction ledger still wins
  # in derive_transaction_generation(), so an earlier generation is never
  # reused.  Crucially, this avoids reopening the deliberately closed Funnel
  # merely to fetch an obsolete predecessor manifest.
  if printf '%s' "$state_json" | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);const f=v.manifestSha256;if(v.state!=="disabled"||v.generation!==null||v.releaseDigest!==null||!/^[a-f0-9]{64}$/.test(f??"")||v.finalFingerprint!==f)process.exit(1)})'; then
    printf '%s' "$state_json" | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);process.stdout.write(JSON.stringify({state:"disabled",generation:0,fingerprint:v.manifestSha256}))})'
    return
  fi
  # Legacy Pages receipts used state=verified and omitted generation and
  # finalFingerprint. Upgrade that identity only by fetching and verifying the
  # signed origin manifest; never guess a generation from the incomplete link.
  local manifest_file; manifest_file="$(mktemp /run/meetwise-cd-legacy-manifest.XXXXXX)"
  trap 'rm -f "$manifest_file"' RETURN
  curl --fail --silent --show-error --proto '=https' --tlsv1.2 --max-time 20 "$bootstrap_origin/preview-release-manifest.json" -o "$manifest_file" || die legacy_manifest_fetch_failed 70
  /usr/bin/node --input-type=module - "$state_json" "$manifest_file" /etc/meetwise/preview-release-ed25519.pub.pem <<'NODE' || die legacy_pages_identity_invalid 70
import { readFileSync } from 'node:fs';
import { manifestFingerprint, verifyManifest } from '/usr/local/lib/meetwise-preview-controller/preview-release-manifest.mjs';
const [stateRaw, manifestPath, keyPath] = process.argv.slice(2); const state = JSON.parse(stateRaw); const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
verifyManifest(manifest, readFileSync(keyPath, 'utf8'), { allowExpired: true }); const fingerprint = manifestFingerprint(manifest);
if (state.state !== 'verified' || state.manifestSha256 !== fingerprint || !Number.isSafeInteger(manifest.generation) || manifest.generation < 1) process.exit(1);
process.stdout.write(JSON.stringify({ state: 'verified', generation: manifest.generation, fingerprint }));
NODE
}

derive_transaction_generation() {
  local transaction_id="$1" release="$2" bootstrap_origin="$3" current_json current_phase current_tx current_release current_generation state_generation
  current_json="$(ledger_node ledger-read)" || die transaction_ledger_read_failed
  current_phase="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.phase ?? "")' "$current_json")"
  current_tx="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.transactionId ?? "")' "$current_json")"
  current_release="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.release ?? "")' "$current_json")"
  current_generation="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.generation ? String(v.generation) : "0")' "$current_json")"
  if [[ -n "$current_phase" ]]; then
    if [[ "$current_tx" == "$transaction_id" && "$current_release" == "$release" ]]; then
      [[ "$current_generation" =~ ^[1-9][0-9]*$ ]] || die generation_state_invalid
      printf '%s\n' "$current_generation"
      return
    fi
    case "$current_phase" in
      committed|rolled_back|forward_only_maintenance) ;;
      *) die transaction_in_progress 75 ;;
    esac
  fi
  state_generation="$(trusted_publication_generation "$bootstrap_origin")"
  /usr/bin/node - "$current_generation" "$state_generation" <<'NODE'
const [ledgerRaw, stateRaw] = process.argv.slice(2).map(Number);
if (![ledgerRaw, stateRaw].every((value) => Number.isSafeInteger(value) && value >= 0)) process.exit(1);
const base = Math.max(ledgerRaw, stateRaw);
if (base >= Number.MAX_SAFE_INTEGER) process.exit(1);
process.stdout.write(String(base + 1));
NODE
}

read_legacy_units_json() {
  /usr/bin/node <<'NODE'
const { execFileSync } = require('node:child_process');
const units = {};
for (const unit of ['meetwise-api.service', 'meetwise-worker.service', 'meetwise-web.service']) {
  const output = execFileSync('/usr/bin/timeout', ['--kill-after=1s', '5s', '/usr/bin/systemctl', 'show', '--property', 'LoadState,ActiveState,UnitFileState,Restart', unit], { encoding: 'utf8' });
  const properties = Object.fromEntries(output.trim().split(/\n/).map((line) => {
    const split = line.indexOf('=');
    return split > 0 ? [line.slice(0, split), line.slice(split + 1)] : ['', ''];
  }));
  const load = properties.LoadState;
  const observedActive = properties.ActiveState;
  const enabled = properties.UnitFileState;
  const restart = properties.Restart;
  // Transitional states mean systemd still owns a running/start operation.
  // A failed unit is never promoted from its Restart configuration alone:
  // start limits and conditional restart modes can leave it terminally failed.
  const active = ['active', 'activating', 'reloading'].includes(observedActive) ? 'active' : observedActive;
  const restartValid = /^(no|always|on-success|on-failure|on-abnormal|on-abort|on-watchdog)$/.test(restart)
    || (load === 'not-found' && restart === '');
  const unitFileStateValid = /^(enabled|disabled|masked|static|indirect|generated|transient|not-found)$/.test(enabled)
    || (load === 'not-found' && enabled === '');
  if (!['loaded', 'not-found'].includes(load) || !['active', 'inactive', 'failed'].includes(active) || !unitFileStateValid || !restartValid) {
    throw new Error(`predecessor_legacy_state_invalid:${unit}`);
  }
  units[unit] = { load, active, enabled, masked: enabled === 'masked' };
}
process.stdout.write(JSON.stringify(units));
NODE
}

snapshot_predecessor() {
  local transaction_id="$1" release="$2" dir
  dir="$FULL_STACK_SNAPSHOTS/$transaction_id"
  [[ "$transaction_id" =~ $TRANSACTION_ID_RE ]] || die transaction_id_invalid
  [[ "$release" =~ $RELEASE_RE ]] || die release_name_invalid
  [[ "$dir" == "$FULL_STACK_SNAPSHOTS/"* && "$dir" != *..* ]] || die snapshot_path_invalid
  if [[ -f "$dir/predecessor.json" && ! -L "$dir/predecessor.json" ]]; then
    printf '%s\n' "$dir/predecessor.json"
    return
  fi
  if [[ -e "$FULL_STACK_SNAPSHOTS" || -L "$FULL_STACK_SNAPSHOTS" ]]; then
    [[ -d "$FULL_STACK_SNAPSHOTS" && ! -L "$FULL_STACK_SNAPSHOTS" ]] || die snapshot_root_invalid
  else
    install -d -o root -g root -m 0700 "$FULL_STACK_SNAPSHOTS"
  fi
  [[ "$(stat -c '%u:%g:%a' "$FULL_STACK_SNAPSHOTS" 2>/dev/null || true)" == '0:0:700' ]] || die snapshot_root_invalid
  install -d -o root -g root -m 0700 "$dir"
  [[ ! -e "$dir/predecessor.json" ]] || die snapshot_partial
  for snapshot_entry in compose.env compose.env.missing compose.spec compose.spec.missing compose.env.rollback compose.env.rollback.missing rollback-compose-present rollback-compose-present.missing; do
    [[ ! -e "$dir/$snapshot_entry" ]] || die snapshot_partial
  done
  if [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]]; then
    install -o root -g root -m 0600 "$COMPOSE_ENV" "$dir/compose.env"
  else
    install -o root -g root -m 0600 /dev/null "$dir/compose.env.missing"
  fi
  if [[ -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" ]]; then
    install -o root -g root -m 0600 "$COMPOSE_FILE" "$dir/compose.spec"
  else
    install -o root -g root -m 0600 /dev/null "$dir/compose.spec.missing"
  fi
  if [[ -f "$COMPOSE_ENV_ROLLBACK" && ! -L "$COMPOSE_ENV_ROLLBACK" ]]; then
    install -o root -g root -m 0600 "$COMPOSE_ENV_ROLLBACK" "$dir/compose.env.rollback"
  else
    install -o root -g root -m 0600 /dev/null "$dir/compose.env.rollback.missing"
  fi
  if [[ -f "$COMPOSE_ROLLBACK_MARKER" && ! -L "$COMPOSE_ROLLBACK_MARKER" ]]; then
    install -o root -g root -m 0600 "$COMPOSE_ROLLBACK_MARKER" "$dir/rollback-compose-present"
  else
    install -o root -g root -m 0600 /dev/null "$dir/rollback-compose-present.missing"
  fi
  if [[ -f "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" ]]; then install -o root -g root -m 0600 "$PUBLICATION_STATE" "$dir/publication.state"; else install -o root -g root -m 0600 /dev/null "$dir/publication.state.missing"; fi
  if [[ -f "$PUBLIC_MANIFEST" && ! -L "$PUBLIC_MANIFEST" ]]; then install -o root -g root -m 0644 "$PUBLIC_MANIFEST" "$dir/public.manifest"; else install -o root -g root -m 0600 /dev/null "$dir/public.manifest.missing"; fi
  local current_target=''; [[ -L "$CURRENT" ]] && current_target="$(readlink "$CURRENT")"
  if [[ -n "$current_target" ]]; then
    # Legacy releases used an absolute /srv/.../releases/<id> symlink while
    # the transactional controller stores a confined, portable relative
    # target.  Normalize only an exact child of RELEASES_ROOT and reject every
    # other absolute/escaping target before it can enter a rollback bundle.
    if [[ "$current_target" == "$RELEASES_ROOT/"* ]]; then
      current_target="releases/${current_target#"$RELEASES_ROOT/"}"
    fi
    local predecessor_release="${current_target#releases/}"
    [[ "$current_target" == releases/* && "$current_target" != *..* && ( "$predecessor_release" =~ $RELEASE_RE || "$predecessor_release" =~ $LEGACY_PREDECESSOR_RELEASE_RE ) ]] || die predecessor_current_target_invalid 70
    [[ -d "$RELEASES_ROOT/$predecessor_release" && ! -L "$RELEASES_ROOT/$predecessor_release" ]] || die predecessor_current_target_not_directory 70
  fi
  local compose_present=0 compose_running=''
  if [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" && -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" ]]; then
    compose_present=1
    compose_running="$(run_compose ps --status running --services 2>/dev/null | tr '\n' ' ')" || die predecessor_compose_state_unavailable 70
  fi
  local compose_digest=''; [[ -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" ]] && compose_digest="$(sha256sum "$COMPOSE_FILE" | awk '{print $1}')"
  local rollback_env_present=0 rollback_marker_present=0
  [[ -f "$COMPOSE_ENV_ROLLBACK" && ! -L "$COMPOSE_ENV_ROLLBACK" ]] && rollback_env_present=1
  [[ -f "$COMPOSE_ROLLBACK_MARKER" && ! -L "$COMPOSE_ROLLBACK_MARKER" ]] && rollback_marker_present=1
  local backend_ref='' web_ref=''
  if [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]]; then
    backend_ref="$(awk -F= '/^(export[[:space:]]+)?BACKEND_IMAGE=/{sub(/^[^=]*=/, ""); print; exit}' "$COMPOSE_ENV")"
    web_ref="$(awk -F= '/^(export[[:space:]]+)?WEB_IMAGE=/{sub(/^[^=]*=/, ""); print; exit}' "$COMPOSE_ENV")"
  fi
  local approval_digest='' target_digest=''
  [[ -f "$APPROVAL" && ! -L "$APPROVAL" ]] && approval_digest="$(sha256sum "$APPROVAL" | awk '{print $1}')"
  [[ -f "$TARGET" && ! -L "$TARGET" ]] && target_digest="$(sha256sum "$TARGET" | awk '{print $1}')"
  local publication_status='' publication_fingerprint=''
  if [[ -f "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" ]]; then
    publication_status="$(/usr/bin/node -e 'try { const v=require(process.argv[1]); process.stdout.write(v.status ?? "") } catch {}' "$PUBLICATION_STATE" 2>/dev/null || true)"
    publication_fingerprint="$(/usr/bin/node -e 'try { const v=require(process.argv[1]); process.stdout.write(v.manifestSha256 ?? "") } catch {}' "$PUBLICATION_STATE" 2>/dev/null || true)"
  fi
  local pages_state=none pages_generation=0 pages_fingerprint='' pages_json='' predecessor_origin=''
  local publication_present=0 manifest_present=0
  [[ -f "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" ]] && publication_present=1
  [[ -f "$PUBLIC_MANIFEST" && ! -L "$PUBLIC_MANIFEST" ]] && manifest_present=1
  [[ "$publication_present" == "$manifest_present" ]] || die predecessor_publication_pair_incomplete 70
  if [[ "$publication_present" -eq 1 ]]; then
    [[ "$publication_fingerprint" =~ $DIGEST_RE ]] || die predecessor_publication_identity_invalid 70
    predecessor_origin="$(/usr/bin/node -e 'const v=require(process.argv[1]); process.stdout.write(v.origin ?? "")' "$PUBLIC_MANIFEST")" || die predecessor_manifest_origin_invalid 70
    [[ "$predecessor_origin" =~ ^https://[a-z0-9.-]+\.ts\.net$ ]] || die predecessor_manifest_origin_invalid 70
    pages_json="$(trusted_pages_link_identity "$predecessor_origin")" || die predecessor_pages_identity_unavailable 70
    pages_state="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.state === "verified" ? "enabled" : v.state)' "$pages_json")"
    pages_generation="$(/usr/bin/node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).generation))' "$pages_json")"
    pages_fingerprint="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).fingerprint)' "$pages_json")"
    case "$pages_state" in
      enabled)
        [[ "$pages_generation" =~ ^[1-9][0-9]*$ && "$pages_fingerprint" == "$publication_fingerprint" ]] || die predecessor_pages_identity_mismatch 70
        ;;
      disabled)
        # Preserve the exact public disabled receipt independently from the
        # local predecessor manifest.  A scheduled bootstrap receipt can have
        # generation zero and a different fingerprint; rollback must keep that
        # fail-closed Pages state rather than trying to re-enable stale local
        # publication evidence.
        [[ "$pages_generation" =~ ^(0|[1-9][0-9]*)$ && "$pages_fingerprint" =~ $DIGEST_RE ]] || die predecessor_pages_identity_mismatch 70
        ;;
      *) die predecessor_pages_identity_mismatch 70 ;;
    esac
  fi
  local snapshot_file
  for snapshot_file in "$dir/compose.env" "$dir/compose.env.missing" "$dir/compose.spec" "$dir/compose.spec.missing" "$dir/compose.env.rollback" "$dir/compose.env.rollback.missing" "$dir/rollback-compose-present" "$dir/rollback-compose-present.missing" "$dir/publication.state" "$dir/publication.state.missing" "$dir/public.manifest" "$dir/public.manifest.missing"; do
    [[ -f "$snapshot_file" ]] && sync -f "$snapshot_file"
  done
  sync -f "$dir"
  local snapshot_path="$dir" legacy_units_json
  legacy_units_json="$(read_legacy_units_json)" || die predecessor_legacy_state_invalid 70
  /usr/bin/node - "$snapshot_path" "$legacy_units_json" "$release" "$current_target" "$compose_present" "$compose_running" "$compose_digest" "$rollback_env_present" "$rollback_marker_present" "$backend_ref" "$web_ref" "$approval_digest" "$target_digest" "$publication_status" "$publication_fingerprint" "$pages_state" "$pages_generation" "$pages_fingerprint" "$publication_present" "$manifest_present" <<'NODE'
const { chmodSync, chownSync, closeSync, fsyncSync, openSync, renameSync, writeFileSync } = require('node:fs');
const { dirname } = require('node:path');
const [path, legacyUnitsJson, release, currentTarget, composePresent, composeRunning, composeSpecDigest, rollbackEnvPresent, rollbackMarkerPresent, backendImage, webImage, approvalDigest, targetDigest, publicationStatus, publicationFingerprint, pagesState, pagesGeneration, pagesFingerprint, publicationStatePresent, publicManifestPresent] = process.argv.slice(2);
const units = JSON.parse(legacyUnitsJson);
const digestOrNull = (value) => /^[a-f0-9]{64}$/.test(value ?? '') ? value : null;
const activeServices = String(composeRunning ?? '').trim().split(/\s+/).filter(Boolean).filter((name) => ['migrate', 'api', 'worker', 'web'].includes(name));
const composeOwnsRuntime = activeServices.some((name) => ['api', 'worker', 'web'].includes(name));
const legacyOwnsRuntime = Object.values(units).some((unit) => unit.active === 'active');
if (composeOwnsRuntime && legacyOwnsRuntime) throw new Error('predecessor_runtime_owner_conflict');
const runtimeOwner = composeOwnsRuntime ? 'compose' : legacyOwnsRuntime ? 'legacy' : 'none';
const record = {
  schemaVersion: 1, release, currentTarget: currentTarget || null, runtimeOwner,
  publicationStatePresent: publicationStatePresent === '1', publicManifestPresent: publicManifestPresent === '1',
  approval: { digest: digestOrNull(approvalDigest) }, target: { digest: digestOrNull(targetDigest) },
  compose: { present: composePresent === '1', activeServices, envFile: 'compose.env', specFile: 'compose.spec', specDigest: digestOrNull(composeSpecDigest), rollbackEnvFile: 'compose.env.rollback', rollbackEnvPresent: rollbackEnvPresent === '1', rollbackMarkerFile: 'rollback-compose-present', rollbackMarkerPresent: rollbackMarkerPresent === '1', images: { backend: backendImage || null, web: webImage || null } },
  legacyUnits: units,
  publication: { stateFile: 'publication.state', manifestFile: 'public.manifest', status: publicationStatus || null, manifestSha256: digestOrNull(publicationFingerprint) },
  pages: { state: pagesState || null, generation: pagesGeneration ? Number(pagesGeneration) : null, fingerprint: digestOrNull(pagesFingerprint) },
  capturedAt: new Date().toISOString()
};
const temporary = `${path}/predecessor.json.tmp-${process.pid}`;
writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
const fd = openSync(temporary, 'r'); fsyncSync(fd); closeSync(fd);
renameSync(temporary, `${path}/predecessor.json`);
const dirFd = openSync(dirname(`${path}/predecessor.json`), 'r'); fsyncSync(dirFd); closeSync(dirFd);
chownSync(`${path}/predecessor.json`, 0, 0); chmodSync(`${path}/predecessor.json`, 0o600);
NODE
  printf '%s\n' "$dir/predecessor.json"
}

legacy_unit_has_no_activation_edges() {
  local unit="$1" topology
  topology="$(timeout --kill-after=1s 5s systemctl show \
    --property=TriggeredBy \
    --property=RequiredBy \
    --property=WantedBy \
    --property=UpheldBy \
    --property=BoundBy \
    --property=BusName \
    "$unit" 2>/dev/null)" || return 1
  TOPOLOGY="$topology" /usr/bin/node - <<'NODE'
const expected = new Set(['TriggeredBy', 'RequiredBy', 'WantedBy', 'UpheldBy', 'BoundBy', 'BusName']);
const seen = new Set();
for (const line of (process.env.TOPOLOGY ?? '').split('\n')) {
  if (!line) continue;
  const index = line.indexOf('=');
  if (index <= 0) process.exit(1);
  const key = line.slice(0, index);
  const value = line.slice(index + 1);
  if (!expected.has(key) || seen.has(key) || value !== '') process.exit(1);
  seen.add(key);
}
if (seen.size !== expected.size) process.exit(1);
NODE
}

legacy_unit_has_no_dbus_activation() {
  local unit="$1"
  UNIT="$unit" /usr/bin/node - <<'NODE'
const { lstatSync, readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const target = process.env.UNIT;
const directories = [
  '/etc/dbus-1/system-services',
  '/run/dbus-1/system-services',
  '/usr/local/share/dbus-1/system-services',
  '/usr/share/dbus-1/system-services',
  '/lib/dbus-1/system-services',
];
try {
  for (const directory of directories) {
    let directoryStat;
    try {
      directoryStat = lstatSync(directory);
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
    if (!directoryStat.isDirectory() || directoryStat.isSymbolicLink() || directoryStat.uid !== 0 || directoryStat.gid !== 0 || (directoryStat.mode & 0o022) !== 0) process.exit(1);
    for (const name of readdirSync(directory)) {
      if (!name.endsWith('.service')) continue;
      const file = join(directory, name);
      const fileStat = lstatSync(file);
      if (!fileStat.isFile() || fileStat.isSymbolicLink() || fileStat.uid !== 0 || fileStat.gid !== 0 || (fileStat.mode & 0o022) !== 0) process.exit(1);
      const content = readFileSync(file, 'utf8');
      for (const line of content.split(/\r?\n/)) {
        const index = line.indexOf('=');
        if (index < 0) continue;
        if (line.slice(0, index).trim() === 'SystemdService' && line.slice(index + 1).trim() === target) process.exit(1);
      }
    }
  }
} catch {
  process.exit(1);
}
NODE
}

quiesce_all_writers() {
  # The edge is already closed by the preceding transaction phase.  Stop every
  # possible app writer, including a stale legacy unit and a previously running
  # Compose candidate, before the migration command is allowed to run.
  run_compose stop api worker web >/dev/null 2>&1 || die compose_writer_stop_failed 70
  local running
  running="$(run_compose ps --status running -q api worker web 2>/dev/null)" || die compose_writer_query_failed 70
  [[ -z "$running" ]] || die compose_writer_still_active 70
  local unit load_state
  for unit in meetwise-api.service meetwise-worker.service meetwise-web.service; do
    load_state="$(timeout --kill-after=1s 5s systemctl show --property=LoadState --value "$unit" 2>/dev/null || true)"
    [[ "$load_state" == not-found || "$load_state" == loaded ]] || die legacy_unit_state_invalid 70
    if [[ "$load_state" == loaded ]]; then
      timeout --kill-after=2s 30s systemctl stop "$unit" >/dev/null 2>&1 || die legacy_unit_stop_failed 70
      [[ "$(systemctl is-active "$unit" 2>/dev/null || true)" != active ]] || die legacy_unit_still_active 70
      systemctl disable "$unit" >/dev/null 2>&1 || die legacy_unit_disable_failed 70
      # These legacy units are regular files under /etc/systemd/system.  A
      # persistent `systemctl mask` cannot replace such a file and would make
      # the first Compose hand-off fail after the old owner was already stopped.
      # Disable is the durable ownership-transfer bit: it survives reboot and
      # prevents systemd boot activation.  Read it back before migration so a
      # partial/failed disable never lets the old owner race the new one.
      [[ "$(systemctl is-active "$unit" 2>/dev/null || true)" == inactive ]] || die legacy_unit_inactive_readback_failed 70
      [[ "$(systemctl is-enabled "$unit" 2>/dev/null || true)" == disabled ]] || die legacy_unit_disable_readback_failed 70
      legacy_unit_has_no_activation_edges "$unit" || die legacy_unit_activation_edge_present 70
      legacy_unit_has_no_dbus_activation "$unit" || die legacy_unit_dbus_activation_present 70
    fi
  done
}

start_backend_internal() {
  local release="$1" dir; dir="$(with_release_cwd "$release")"
  ln -sfn "releases/$release" "$CURRENT.new"
  mv -Tf "$CURRENT.new" "$CURRENT"
  run_compose up -d api worker || die compose_up_backend_failed 70
  local ready=0
  for _ in $(seq 1 60); do
    if curl --fail --silent --max-time 2 http://127.0.0.1:8787/readyz/api >/dev/null \
      && run_compose exec -T worker node -e "fetch('http://127.0.0.1:9091/readyz/worker').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then ready=1; break; fi
    sleep 2
  done
  [[ "$ready" -eq 1 ]] || die compose_backend_not_ready 70
}

start_web_internal() {
  /usr/local/sbin/full-stack-preview-edge-close >/dev/null 2>&1 || die edge_close_required 70
  run_compose up -d web || die compose_up_web_failed 70
  local ready=0
  # Next may accept the container before its RSC/server surface is ready.  A
  # single probe creates a deployment race (and probing / then /login in two
  # separate loops can observe different readiness windows), so require both
  # public surfaces in the same bounded round.  Funnel remains closed here;
  # only the later activate transition may open it.
  for _ in $(seq 1 60); do
    if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/ >/dev/null \
      && curl --fail --silent --show-error --max-time 2 http://127.0.0.1:3000/login >/dev/null; then
      ready=1
      break
    fi
    sleep 2
  done
  [[ "$ready" -eq 1 ]] || die web_internal_not_ready 70
}

restore_predecessor_snapshot() {
  local transaction_id="$1" release="$2" dir
  dir="$FULL_STACK_SNAPSHOTS/$transaction_id"
  [[ "$transaction_id" =~ $TRANSACTION_ID_RE && "$release" =~ $RELEASE_RE ]] || die transaction_identity_invalid
  [[ -f "$dir/predecessor.json" && ! -L "$dir/predecessor.json" ]] || die snapshot_missing
  local record; record="$(/usr/bin/node -e 'const v=require(process.argv[1]); if(v.schemaVersion!==1 || v.release!==process.argv[2]) process.exit(1); process.stdout.write(JSON.stringify(v))' "$dir/predecessor.json" "$release")" || die snapshot_binding_invalid
  run_compose stop api worker web >/dev/null 2>&1 || true
  if [[ -f "$dir/compose.env" && ! -L "$dir/compose.env" ]]; then
    rm -f -- "$COMPOSE_ENV"
    install -o root -g root -m 0600 "$dir/compose.env" "$COMPOSE_ENV"
  elif [[ -f "$dir/compose.env.missing" ]]; then
    rm -f -- "$COMPOSE_ENV"
  else
    die snapshot_compose_marker_invalid
  fi
  local expected_spec_digest actual_spec_digest
  expected_spec_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.compose?.specDigest ?? "")' "$record")"
  if [[ -f "$dir/compose.spec" && ! -L "$dir/compose.spec" ]]; then
    actual_spec_digest="$(sha256sum "$dir/compose.spec" | awk '{print $1}')"
    [[ "$expected_spec_digest" =~ $DIGEST_RE && "$actual_spec_digest" == "$expected_spec_digest" ]] || die snapshot_compose_spec_digest_invalid
    rm -f -- "$COMPOSE_FILE"
    install -o root -g root -m 0600 "$dir/compose.spec" "$COMPOSE_FILE"
  elif [[ -f "$dir/compose.spec.missing" ]]; then
    [[ -z "$expected_spec_digest" ]] || die snapshot_compose_spec_marker_invalid
    rm -f -- "$COMPOSE_FILE"
  else
    die snapshot_compose_spec_marker_invalid
  fi
  if [[ -f "$dir/compose.env.rollback" && ! -L "$dir/compose.env.rollback" ]]; then
    rm -f -- "$COMPOSE_ENV_ROLLBACK"
    install -o root -g root -m 0600 "$dir/compose.env.rollback" "$COMPOSE_ENV_ROLLBACK"
  elif [[ -f "$dir/compose.env.rollback.missing" ]]; then
    rm -f -- "$COMPOSE_ENV_ROLLBACK"
  else
    die snapshot_compose_rollback_marker_invalid
  fi
  if [[ -f "$dir/rollback-compose-present" && ! -L "$dir/rollback-compose-present" ]]; then
    rm -f -- "$COMPOSE_ROLLBACK_MARKER"
    install -o root -g root -m 0600 "$dir/rollback-compose-present" "$COMPOSE_ROLLBACK_MARKER"
  elif [[ -f "$dir/rollback-compose-present.missing" ]]; then
    rm -f -- "$COMPOSE_ROLLBACK_MARKER"
  else
    die snapshot_compose_rollback_marker_invalid
  fi
  if [[ -f "$dir/publication.state" && ! -L "$dir/publication.state" ]]; then install -o root -g root -m 0600 "$dir/publication.state" "$PUBLICATION_STATE"; elif [[ -f "$dir/publication.state.missing" ]]; then rm -f -- "$PUBLICATION_STATE"; else die snapshot_publication_marker_invalid; fi
  if [[ -f "$dir/public.manifest" && ! -L "$dir/public.manifest" ]]; then install -o root -g root -m 0644 "$dir/public.manifest" "$PUBLIC_MANIFEST"; elif [[ -f "$dir/public.manifest.missing" ]]; then rm -f -- "$PUBLIC_MANIFEST"; else die snapshot_manifest_marker_invalid; fi
  sync -f "$COMPOSE_DIR"
  sync -f "$(dirname "$PUBLICATION_STATE")"
  sync -f "$(dirname "$PUBLIC_MANIFEST")"
  local current_target; current_target="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.currentTarget ?? "")' "$record")"
  if [[ -n "$current_target" ]]; then
    local predecessor_release="${current_target#releases/}"
    [[ "$current_target" == releases/* && "$current_target" != *..* && ( "$predecessor_release" =~ $RELEASE_RE || "$predecessor_release" =~ $LEGACY_PREDECESSOR_RELEASE_RE ) ]] || die snapshot_current_target_invalid
    [[ -d "$RELEASES_ROOT/$predecessor_release" && ! -L "$RELEASES_ROOT/$predecessor_release" ]] || die snapshot_current_target_missing
    ln -sfn "$current_target" "$CURRENT.new"; mv -Tf "$CURRENT.new" "$CURRENT"
  else
    unlink "$CURRENT" 2>/dev/null || true
  fi
  local runtime_owner; runtime_owner="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); if(!["compose","legacy","none"].includes(v.runtimeOwner)) process.exit(1); process.stdout.write(v.runtimeOwner)' "$record")" || die snapshot_runtime_owner_invalid
  case "$runtime_owner" in
    compose)
      local compose_active_services; compose_active_services="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write((v.compose?.activeServices ?? []).join(" "))' "$record")"
      if [[ -n "$compose_active_services" ]]; then
        local -a compose_services=(); read -r -a compose_services <<< "$compose_active_services"
        run_compose up -d "${compose_services[@]}" || die predecessor_compose_restore_failed 70
      fi
      ;;
    legacy|none) ;;
    *) die snapshot_runtime_owner_invalid ;;
  esac
  # Unit mask/enabled state is part of the predecessor even when Compose owns
  # the application.  Restore that state on every path, but start legacy
  # writers only when the durable owner enum says legacy.
  local unit active load enabled masked
  while IFS= read -r unit; do
    [[ -n "$unit" ]] || continue
    load="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.legacyUnits?.[process.argv[2]]?.load ?? "")' "$record" "$unit")"
    active="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.legacyUnits?.[process.argv[2]]?.active ?? "")' "$record" "$unit")"
    enabled="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.legacyUnits?.[process.argv[2]]?.enabled ?? "")' "$record" "$unit")"
    masked="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.legacyUnits?.[process.argv[2]]?.masked ? "true" : "false")' "$record" "$unit")"
    [[ "$load" == loaded ]] || continue
    systemctl stop "$unit" >/dev/null 2>&1 || true
    if [[ "$masked" == true ]]; then
      systemctl mask "$unit" >/dev/null 2>&1 || die predecessor_legacy_restore_failed 70
    else
      systemctl unmask "$unit" >/dev/null 2>&1 || die predecessor_legacy_restore_failed 70
      case "$enabled" in
        enabled) systemctl enable "$unit" >/dev/null 2>&1 || die predecessor_legacy_restore_failed 70 ;;
        disabled) systemctl disable "$unit" >/dev/null 2>&1 || die predecessor_legacy_restore_failed 70 ;;
      esac
      if [[ "$runtime_owner" == legacy && "$active" == active ]]; then
        systemctl start "$unit" >/dev/null 2>&1 || die predecessor_legacy_restore_failed 70
      else
        systemctl stop "$unit" >/dev/null 2>&1 || true
      fi
    fi
  done < <(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); for (const k of Object.keys(v.legacyUnits ?? {})) process.stdout.write(`${k}\n`)' "$record")
  local actual_compose expected_compose actual_legacy expected_legacy
  actual_compose="$(run_compose ps --status running --services 2>/dev/null | awk '$0=="api"||$0=="worker"||$0=="web"' | sort | tr '\n' ' ')" || die predecessor_owner_readback_failed 70
  expected_compose="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); if(v.runtimeOwner==="compose") process.stdout.write((v.compose?.activeServices??[]).filter(x=>["api","worker","web"].includes(x)).sort().join(" "))' "$record")"
  local legacy_readback_json
  legacy_readback_json="$(read_legacy_units_json)" || die predecessor_owner_readback_failed 70
  actual_legacy="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(Object.entries(v).filter(([,s])=>s.active==="active").map(([k])=>k).sort().join(" "))' "$legacy_readback_json")" || die predecessor_owner_readback_failed 70
  expected_legacy="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); if(v.runtimeOwner==="legacy") process.stdout.write(Object.entries(v.legacyUnits??{}).filter(([,s])=>s.active==="active").map(([k])=>k).sort().join(" "))' "$record")"
  [[ "${actual_compose% }" == "$expected_compose" && "${actual_legacy% }" == "$expected_legacy" ]] || die predecessor_runtime_owner_readback_mismatch 70
  # The old public publication may be restored only after the predecessor
  # files and owner are back.  A missing/disabled predecessor intentionally
  # remains fail-closed at this point.
  local origin publication_status predecessor_pages_state predecessor_pages_generation predecessor_pages_fingerprint predecessor_publication_fingerprint
  predecessor_pages_state="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.pages?.state ?? "none")' "$record")"
  predecessor_pages_generation="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.pages?.generation === null ? "" : String(v.pages?.generation ?? ""))' "$record")"
  predecessor_pages_fingerprint="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.pages?.fingerprint ?? "")' "$record")"
  predecessor_publication_fingerprint="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v.publication?.manifestSha256 ?? "")' "$record")"
  publication_status="$(/usr/bin/node -e 'const v=require(process.argv[1]); process.stdout.write(v.status ?? "")' "$PUBLICATION_STATE" 2>/dev/null || true)"
  case "$predecessor_pages_state" in
    enabled)
      [[ "$predecessor_pages_generation" =~ ^[1-9][0-9]*$ && "$predecessor_pages_fingerprint" =~ $DIGEST_RE && "$predecessor_pages_fingerprint" == "$predecessor_publication_fingerprint" ]] || die predecessor_edge_restore_identity_invalid 70
      [[ -f "$PUBLICATION_STATE" && -f "$PUBLIC_MANIFEST" && "$publication_status" == verified ]] || die predecessor_edge_restore_identity_invalid 70
      origin="$(/usr/bin/node -e 'const v=require(process.argv[1]); process.stdout.write(v.origin ?? "")' "$PUBLIC_MANIFEST" 2>/dev/null || true)"
      [[ "$origin" =~ $ORIGIN_RE ]] || die predecessor_edge_restore_identity_invalid 70
      /usr/local/sbin/full-stack-preview-funnel-enable "$origin" >/dev/null 2>&1 || die predecessor_edge_restore_failed 70
      ;;
    disabled|none)
      /usr/local/sbin/full-stack-preview-funnel-close >/dev/null 2>&1 || die predecessor_edge_restore_failed 70
      ;;
    *) die predecessor_edge_restore_identity_invalid 70 ;;
  esac
}

clear_transaction_snapshot() {
  local transaction_id="$1" snapshot_dir
  snapshot_dir="$FULL_STACK_SNAPSHOTS/$transaction_id"
  [[ "$transaction_id" =~ $TRANSACTION_ID_RE && "$snapshot_dir" == "$FULL_STACK_SNAPSHOTS/"* && ! -L "$snapshot_dir" ]] || die snapshot_path_invalid
  [[ -d "$snapshot_dir" ]] || return 0
  for entry in "$snapshot_dir"/*; do
    [[ -e "$entry" ]] || continue
    [[ -f "$entry" && ! -L "$entry" ]] || die snapshot_gc_unexpected_entry
    rm -f -- "$entry"
  done
  sync -f "$snapshot_dir"
  rmdir "$snapshot_dir" || die snapshot_gc_failed
  sync -f "$FULL_STACK_SNAPSHOTS"
}

capture_candidate_receipts() {
  local transaction_id="$1" release="$2" current_json
  current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
  /usr/bin/node - "$current_json" "$transaction_id" "$release" "$APPROVAL" "$TARGET" \
    /var/lib/meetwise-preview-synthetic/preview-large-v1-successor/verification.json \
    /var/lib/meetwise-preview-synthetic/preview-large-v1-successor/post-db-verification.json \
    /var/lib/meetwise-preview-synthetic/preview-large-v1-successor/manifest.json \
    /var/lib/meetwise-preview-synthetic/preview-large-v1-successor/maintenance.json \
    /var/lib/meetwise-preview-synthetic/preview-deep-usage-v1/scenario.json \
    /var/lib/meetwise-preview-controller/preview-showcase-entitlement.json <<'NODE'
const { createHash } = require('node:crypto');
const { lstatSync, readFileSync } = require('node:fs');
const [ledgerRaw, transactionId, release, approvalPath, targetPath, verificationPath, dbReceiptPath, datasetManifestPath, maintenancePath, deepUsagePath, entitlementPath] = process.argv.slice(2);
const ledger = JSON.parse(ledgerRaw);
if (ledger.transactionId !== transactionId || ledger.release !== release || ledger.phase !== 'web_internal_ready') throw new Error('transaction_receipt_ledger_binding_invalid');
const canonicalJson = (value) => Array.isArray(value) ? `[${value.map(canonicalJson).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}` : JSON.stringify(value);
const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const readJson = (path) => {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('transaction_receipt_file_invalid');
  const bytes = readFileSync(path); return { value: JSON.parse(bytes.toString('utf8')), fileSha256: sha256(bytes) };
};
const approval = readJson(approvalPath); const target = readJson(targetPath); const verification = readJson(verificationPath); const dbReceipt = readJson(dbReceiptPath); const datasetManifest = readJson(datasetManifestPath); const maintenance = readJson(maintenancePath); const deepUsage = readJson(deepUsagePath); const entitlement = readJson(entitlementPath);
if (approval.value?.schemaVersion !== 1 || approval.value.generation !== ledger.generation || approval.value.commit !== ledger.commit || approval.value.tree !== ledger.tree || approval.value.images?.backend !== ledger.backendImageDigest || approval.value.images?.web !== ledger.webImageDigest || !/^[a-f0-9]{64}$/.test(approval.value.targetDigest ?? '')) throw new Error('transaction_approval_binding_invalid');
if (target.value?.schemaVersion !== 1 || target.value.releasePath !== `/srv/meetwise-full-stack/releases/${release}` || sha256(canonicalJson(target.value)) !== approval.value.targetDigest) throw new Error('transaction_target_binding_invalid');
if (verification.value?.schemaVersion !== 2 || verification.value.receiptLayer !== 'capacity' || verification.value.profile !== 'large-v1-successor' || verification.value.datasetId !== 'preview-large-v1-successor' || verification.value.targetDigest !== approval.value.targetDigest || !/^[a-f0-9]{64}$/.test(verification.value.verificationDigest ?? '')) throw new Error('transaction_verification_binding_invalid');
if (dbReceipt.value?.schemaVersion !== 1 || dbReceipt.value.phase !== 'post' || dbReceipt.value.status !== 'verified' || dbReceipt.value.profile !== 'large-v1-successor' || dbReceipt.value.targetDigest !== approval.value.targetDigest || !/^[a-f0-9]{64}$/.test(dbReceipt.value.receiptDigest ?? '')) throw new Error('transaction_db_receipt_binding_invalid');
if (datasetManifest.value?.schemaVersion !== 2 || datasetManifest.value.status !== 'ready' || datasetManifest.value.targetDigest !== approval.value.targetDigest || datasetManifest.value.verificationDigest !== verification.value.verificationDigest) throw new Error('transaction_dataset_binding_invalid');
if (maintenance.value?.schemaVersion !== 1 || maintenance.value.status !== 'restored' || maintenance.value.targetDigest !== approval.value.targetDigest) throw new Error('transaction_maintenance_binding_invalid');
const deepReceipt = deepUsage.value?.deepUsageReceipt;
if (deepUsage.value?.phase !== 'verified_online_projection' || deepReceipt?.schemaVersion !== 1 || deepReceipt.receiptLayer !== 'deep-usage' || deepReceipt.datasetId !== 'preview-deep-usage-v1' || deepReceipt.scenarioId !== 'deep-usage-v1' || deepReceipt.predecessorCapacityDatasetId !== 'preview-large-v1-successor' || deepReceipt.phase !== 'verified_online_projection' || !/^[a-f0-9]{64}$/.test(deepReceipt.receiptDigest ?? '') || deepReceipt.sessionCount !== 3 || !Array.isArray(deepReceipt.observations?.sessions) || deepReceipt.observations.sessions.length !== 3) throw new Error('transaction_deep_usage_binding_invalid');
const { receiptDigest: deepDigest, unproven: deepUnproven, ...deepUnsigned } = deepReceipt;
if (sha256(JSON.stringify(deepUnsigned)) !== deepDigest || !Array.isArray(deepUnproven)) throw new Error('transaction_deep_usage_digest_invalid');
const entitlementDigest = entitlement.value?.receiptDigest; const { receiptDigest: ignoredEntitlementDigest, ...entitlementUnsigned } = entitlement.value ?? {};
if (entitlement.value?.schemaVersion !== 1 || entitlement.value.receiptKind !== 'preview-showcase-entitlement' || entitlement.value.phase !== 'granted' || entitlement.value.ownerEmail !== 'previewc@meetwise.com' || entitlement.value.ownerRole !== 'candidate' || entitlement.value.unitsTotal !== 6 || !Number.isFinite(entitlement.value.unitsReserved) || !Number.isFinite(entitlement.value.unitsConsumed) || !Number.isFinite(entitlement.value.unitsAvailable) || entitlement.value.unitsAvailable < 3 || entitlement.value.unitsReserved + entitlement.value.unitsConsumed + entitlement.value.unitsAvailable !== 6 || !/^\d{4}-\d{2}-\d{2}$/.test(entitlement.value.grantEpoch ?? '') || entitlement.value.sourceOrderId !== `preview-showcase-gift:v2:${entitlement.value.grantEpoch}:previewc@meetwise.com` || entitlement.value.paymentOrderTouched !== false || entitlement.value.targetDigest !== approval.value.targetDigest || entitlement.value.releaseIdentity !== `${approval.value.commit}:${approval.value.tree}` || !/^[a-f0-9]{64}$/.test(entitlementDigest ?? '') || sha256(canonicalJson(entitlementUnsigned)) !== entitlementDigest) throw new Error('transaction_entitlement_binding_invalid');
process.stdout.write(JSON.stringify({
  ...(ledger.candidate ?? {}),
  approval: { fileSha256: approval.fileSha256, targetDigest: approval.value.targetDigest, releaseDigest: approval.value.releaseDigest },
  target: { fileSha256: target.fileSha256, targetDigest: approval.value.targetDigest },
  verification: { fileSha256: verification.fileSha256, verificationDigest: verification.value.verificationDigest },
  dbReceipt: { fileSha256: dbReceipt.fileSha256, receiptDigest: dbReceipt.value.receiptDigest },
  datasetManifest: { fileSha256: datasetManifest.fileSha256, verificationDigest: datasetManifest.value.verificationDigest },
  maintenance: { fileSha256: maintenance.fileSha256 },
  deepUsage: { fileSha256: deepUsage.fileSha256, receiptDigest: deepDigest, phase: deepReceipt.phase, sessionCount: deepReceipt.sessionCount },
  entitlement: { fileSha256: entitlement.fileSha256, receiptDigest: entitlementDigest, unitsTotal: 6, grantEpoch: entitlement.value.grantEpoch },
  release, commit: ledger.commit, tree: ledger.tree, generation: ledger.generation
}));
NODE
}

schema_receipt_from_db() {
  local release="$1" dir database_url ca_path tls_servername expected_database expected_role
  dir="$(with_release_cwd "$release")"
  [[ -f "$VERIFIER_ENV" && ! -L "$VERIFIER_ENV" ]] || die verifier_env_missing
  [[ "$(stat -c '%U:%G:%a' "$VERIFIER_ENV" 2>/dev/null || true)" == root:meetwise-synthetic:640 ]] || die verifier_env_unsafe
  set -a
  # shellcheck disable=SC1090
  . "$VERIFIER_ENV"
  set +a
  database_url="${PREVIEW_VERIFY_DATABASE_URL:-}"
  ca_path="${PREVIEW_VERIFY_DATABASE_SSL_CA_PATH:-}"
  tls_servername="${PREVIEW_VERIFY_PG_TLS_SERVERNAME:-}"
  expected_database="${PREVIEW_VERIFY_EXPECTED_DATABASE:-}"
  expected_role="${PREVIEW_VERIFY_EXPECTED_ROLE:-}"
  [[ -n "$database_url" && -n "$ca_path" && -n "$tls_servername" && "$expected_database" == meetwise_cloud_test && "$expected_role" == meetwise_preview_audit ]] || die verifier_db_env_missing
  [[ -f "$ca_path" && ! -L "$ca_path" ]] || die migrate_ca_missing
  env -i PREVIEW_VERIFY_DATABASE_URL="$database_url" PREVIEW_VERIFY_DATABASE_SSL_CA_PATH="$ca_path" PREVIEW_VERIFY_PG_TLS_SERVERNAME="$tls_servername" PREVIEW_VERIFY_EXPECTED_DATABASE="$expected_database" PREVIEW_VERIFY_EXPECTED_ROLE="$expected_role" RELEASE_PATH="$dir" PATH=/usr/sbin:/usr/bin:/sbin:/bin \
    /usr/bin/node - <<'NODE'
const { createHash } = require('node:crypto');
const { createRequire } = require('node:module');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const releasePath = process.env.RELEASE_PATH;
const databaseUrl = new URL(process.env.PREVIEW_VERIFY_DATABASE_URL);
if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol) || databaseUrl.search || databaseUrl.hash || !databaseUrl.hostname || ['localhost', '127.0.0.1', '::1', '[::1]'].includes(databaseUrl.hostname)) throw new Error('schema_verifier_database_url_invalid');
if (!process.env.PREVIEW_VERIFY_DATABASE_SSL_CA_PATH.startsWith('/') || process.env.PREVIEW_VERIFY_DATABASE_SSL_CA_PATH.includes('..') || process.env.PREVIEW_VERIFY_PG_TLS_SERVERNAME.includes('/') || process.env.PREVIEW_VERIFY_PG_TLS_SERVERNAME.includes('\\')) throw new Error('schema_verifier_tls_contract_invalid');
const requireFromRelease = createRequire(join(releasePath, 'packages/db/package.json'));
const pg = requireFromRelease('pg');
const canonicalJson = (value) => Array.isArray(value) ? `[${value.map(canonicalJson).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}` : JSON.stringify(value);
const schemaDigest = (ledger) => createHash('sha256').update(canonicalJson(ledger)).digest('hex');
const pool = new pg.Pool({
  connectionString: databaseUrl.toString(),
  ssl: { ca: readFileSync(process.env.PREVIEW_VERIFY_DATABASE_SSL_CA_PATH, 'utf8'), rejectUnauthorized: true, servername: process.env.PREVIEW_VERIFY_PG_TLS_SERVERNAME },
  max: 1,
});
;(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role')).rows[0];
    if (identity?.database !== process.env.PREVIEW_VERIFY_EXPECTED_DATABASE || identity?.role !== process.env.PREVIEW_VERIFY_EXPECTED_ROLE) throw new Error('schema_verifier_identity_invalid');
    const ledger = (await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
    await client.query('COMMIT');
    process.stdout.write(JSON.stringify({ schemaHead: `${ledger.at(-1)?.version ?? 'none'}.sql`, schemaLedgerDigest: schemaDigest(ledger), identity: { database: identity.database, role: identity.role } }));
  } finally { client.release(); }
})().catch(() => { process.exitCode = 1; }).finally(async () => {
  await pool.end();
});
NODE
}

transaction_compose_pull() {
  local transaction_id="$1" release="$2" token="$3" backend_digest="$4" web_digest="$5" current_json candidate env_sha expected_env_sha patch_json
  [[ "$backend_digest" =~ $IMAGE_DIGEST_RE && "$web_digest" =~ $IMAGE_DIGEST_RE ]] || die image_digest_invalid
  current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
  candidate="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(JSON.stringify(v?.candidate ?? {}))' "$current_json")"
  if [[ "$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.phase ?? "")' "$current_json")" != snapshotted ]]; then die transaction_phase_conflict; fi
  if /usr/bin/node - "$candidate" "$backend_digest" "$web_digest" <<'NODE'
const [raw, backend, web] = process.argv.slice(2); const value = JSON.parse(raw).composePull;
process.exit(value?.completed === true && value.backendImageDigest === backend && value.webImageDigest === web ? 0 : 1);
NODE
  then
    expected_env_sha="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.composePull?.envSha256 ?? "")' "$candidate")"
    [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]] || die transaction_compose_pull_binding_invalid
    env_sha="$(sha256sum "$COMPOSE_ENV" | awk '{print $1}')"
    [[ "$env_sha" == "$expected_env_sha" && -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" && "$(sha256sum "$COMPOSE_FILE" | awk '{print $1}')" == "$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).composeSpecDigest ?? "")' "$current_json")" ]] || die transaction_compose_pull_binding_invalid
    printf '%s\n' "$current_json"
    return
  fi
  if /usr/bin/node - "$candidate" <<'NODE'
const value = JSON.parse(process.argv[2]); process.exit(value.composePull ? 0 : 1);
NODE
  then
    die transaction_compose_pull_conflict
  fi
  install_candidate_compose_spec "$release" "$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).composeSpecDigest ?? "")' "$current_json")"
  compose_pull "$backend_digest" "$web_digest"
  [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]] || die compose_env_missing
  env_sha="$(sha256sum "$COMPOSE_ENV" | awk '{print $1}')"
  patch_json="$(/usr/bin/node - "$current_json" "$backend_digest" "$web_digest" "$env_sha" <<'NODE'
const [ledgerRaw, backendImageDigest, webImageDigest, envSha256] = process.argv.slice(2); const ledger = JSON.parse(ledgerRaw);
process.stdout.write(JSON.stringify({ candidate: { ...(ledger.candidate ?? {}), composePull: { completed: true, backendImageDigest, webImageDigest, envSha256 } } }));
NODE
  )"
  ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase snapshotted --patch-json "$patch_json"
}

transaction_revoke_predecessor() {
  local transaction_id="$1" release="$2" token="$3" current_json candidate status=0 publication_json predecessor_generation predecessor_fingerprint patch_json
  current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
  [[ "$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.phase ?? "")' "$current_json")" == snapshotted ]] || die transaction_phase_conflict
  candidate="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(JSON.stringify(v?.candidate ?? {}))' "$current_json")"
  if /usr/bin/node - "$candidate" <<'NODE'
const value = JSON.parse(process.argv[2]); process.exit(value.composePull?.completed === true ? 0 : 1);
NODE
  then :; else die transaction_compose_pull_required; fi
  if [[ ! -e "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" && ! -e "$PUBLIC_MANIFEST" && ! -L "$PUBLIC_MANIFEST" ]]; then
    local pages_json pages_state
    local bootstrap_origin
    bootstrap_origin="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);process.stdout.write(v?.candidate?.bootstrapOrigin??"")' "$current_json")"
    pages_json="$(trusted_pages_link_identity "$bootstrap_origin")"
    pages_state="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).state)' "$pages_json")"
    predecessor_generation="$(/usr/bin/node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).generation))' "$pages_json")"
    predecessor_fingerprint="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).fingerprint)' "$pages_json")"
    if [[ "$pages_state" == disabled ]]; then
      /usr/local/sbin/full-stack-preview-funnel-close || die first_release_edge_not_closed 70
      status=0
    else
      # Persist the exact public predecessor identity and ask the workflow to
      # obtain its disabled receipt.  A retry observes disabled, closes the
      # physical edge, and advances the same transaction.
      status=75
    fi
  else
    set +e
    /usr/bin/node "$PUBLISHER" revoke
    status=$?
    set -e
    [[ -f "$PUBLICATION_STATE" && ! -L "$PUBLICATION_STATE" ]] || die predecessor_revoke_state_missing 70
    [[ "$(stat -c '%u:%g:%a' "$PUBLICATION_STATE" 2>/dev/null || true)" == '0:0:600' ]] || die predecessor_revoke_state_unsafe 70
    publication_json="$(/usr/bin/node -e 'const v=require(process.argv[1]);if(!["revoking_stop_pending","revoking","revoked"].includes(v.status)||!Number.isSafeInteger(v.generation)||v.generation<1||!/^[a-f0-9]{64}$/.test(v.manifestSha256??""))process.exit(1);process.stdout.write(JSON.stringify(v))' "$PUBLICATION_STATE")" || die predecessor_revoke_state_invalid 70
    predecessor_generation="$(/usr/bin/node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).generation))' "$publication_json")"
    predecessor_fingerprint="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).manifestSha256)' "$publication_json")"
  fi
  if [[ -z "${predecessor_generation:-}" ]]; then
    predecessor_generation=0
    predecessor_fingerprint="$(printf 'fresh-disabled:%s' "$transaction_id" | sha256sum | awk '{print $1}')"
  fi
  patch_json="$(/usr/bin/node - "$current_json" "$predecessor_generation" "$predecessor_fingerprint" "$status" <<'NODE'
const [raw, generationRaw, fingerprint, statusRaw] = process.argv.slice(2); const ledger = JSON.parse(raw); const generation = Number(generationRaw); const status = Number(statusRaw);
const freshHost = !ledger.predecessor?.publicationStatePresent && !ledger.predecessor?.publicManifestPresent;
process.stdout.write(JSON.stringify({ candidate: { ...(ledger.candidate ?? {}), predecessorRevoked: { identityBound: true, completed: status === 0, freshHost, generation, fingerprint } } }));
NODE
  )"
  ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase snapshotted --patch-json "$patch_json" >/dev/null
  [[ "$status" -eq 0 ]] || { [[ "$status" -eq 75 ]] && die predecessor_revoke_pages_pending 75; die predecessor_revoke_failed 70; }
  ledger_node ledger-read
}

transaction_migrate() {
  local transaction_id="$1" release="$2" token="$3" current_json before_json before_digest after_json after_digest migration_status patch_json
  before_json="$(schema_receipt_from_db "$release")" || die migration_schema_before_failed 70
  before_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); if(!/^[a-f0-9]{64}$/.test(v.schemaLedgerDigest ?? ""))process.exit(1); process.stdout.write(v.schemaLedgerDigest)' "$before_json")" || die migration_schema_before_invalid 70
  current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
  patch_json="$(/usr/bin/node - "$current_json" "$before_json" <<'NODE'
const ledger = JSON.parse(process.argv[2]); const receipt = JSON.parse(process.argv[3]);
process.stdout.write(JSON.stringify({ schemaBefore: receipt.schemaLedgerDigest }));
NODE
  )"
  ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase quiesced --patch-json "$patch_json" >/dev/null
  patch_json="$(/usr/bin/node - "$current_json" "$before_json" <<'NODE'
const ledger = JSON.parse(process.argv[2]); const receipt = JSON.parse(process.argv[3]);
process.stdout.write(JSON.stringify({ candidate: { ...(ledger.candidate ?? {}), migration: { status: 'started', schemaBefore: receipt } } }));
NODE
  )"
  ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase quiesced --next-phase migrating --patch-json "$patch_json" >/dev/null
  migration_status=0
  run_compose run --rm migrate || migration_status=$?
  after_json="$(schema_receipt_from_db "$release" 2>/dev/null || true)"
  if [[ -z "$after_json" ]]; then
    ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase migrating --patch-json '{"lastErrorCode":"migration_schema_after_probe_pending"}' >/dev/null || true
    die migration_schema_after_failed 70
  fi
  after_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); if(!/^[a-f0-9]{64}$/.test(v.schemaLedgerDigest ?? ""))process.exit(1); process.stdout.write(v.schemaLedgerDigest)' "$after_json")" || {
    ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase migrating --patch-json '{"lastErrorCode":"migration_schema_after_probe_pending"}' >/dev/null || true
    die migration_schema_after_invalid 70
  }
  local error_code=''; [[ "$migration_status" -eq 0 ]] || { [[ "$after_digest" == "$before_digest" ]] && error_code='migration_failed' || error_code='migration_failed_forward_only'; }
  patch_json="$(/usr/bin/node - "$current_json" "$before_json" "$after_json" "$error_code" "$migration_status" <<'NODE'
const ledger = JSON.parse(process.argv[2]); const before = JSON.parse(process.argv[3]); const after = JSON.parse(process.argv[4]); const errorCode = process.argv[5]; const exitCode = Number(process.argv[6]);
process.stdout.write(JSON.stringify({ schemaAfter: after.schemaLedgerDigest, candidate: { ...(ledger.candidate ?? {}), migration: { status: exitCode === 0 ? 'completed' : 'failed', exitCode, schemaBefore: before, schemaAfter: after } }, ...(errorCode ? { lastErrorCode: errorCode } : {}) }));
NODE
  )"
  ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase migrating --next-phase migrated --patch-json "$patch_json" >/dev/null || die migration_ledger_update_failed 70
  [[ "$migration_status" -eq 0 ]] || die migrate_failed 70
  printf '%s\n' "$after_json"
}

transaction_step() {
  local action="$2" transaction_id="$3" release="$4" token="$5"
  assert_transaction_args "$transaction_id" "$release" "$token"
  [[ "$action" =~ ^(snapshot|compose-pull|revoke-predecessor|close-edge|quiesce|migrate|start-backend|start-web-internal|verify-data|publish-probe|activate|confirm)$ ]] || die transaction_step_invalid
  with_controller_lock
  local current_json phase; current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
  assert_transaction_ledger_identity "$current_json" "$transaction_id" "$release" "$token"
  current_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_expired 75
  phase="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1])?.phase ?? "")' "$current_json")"
  case "$action:$phase" in
    migrate:migrated)
      /usr/bin/node - "$current_json" <<'NODE' || die migration_schema_receipt_missing
const value = JSON.parse(process.argv[2]);
if (!/^[a-f0-9]{64}$/.test(value.schemaBefore ?? '') || !/^[a-f0-9]{64}$/.test(value.schemaAfter ?? '')) process.exit(1);
NODE
      printf '%s\n' "$current_json"
      return
      ;;
    snapshot:snapshotted|close-edge:edge_closed|quiesce:quiesced|start-backend:backend_ready|start-web-internal:web_internal_ready|verify-data:receipts_ready|publish-probe:probe_published|activate:edge_probing|confirm:confirmed_pending_pages)
      printf '%s\n' "$current_json"
      return
      ;;
  esac
  case "$action" in
    snapshot)
      [[ "$phase" == preflighted ]] || die transaction_phase_conflict
      [[ -f "$FULL_STACK_SNAPSHOTS/$transaction_id/predecessor.json" ]] || die snapshot_missing
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase preflighted --next-phase snapshotted
      ;;
    compose-pull)
      [[ $# -eq 7 ]] || die transaction_argc_invalid
      transaction_compose_pull "$transaction_id" "$release" "$token" "$6" "$7"
      ;;
    revoke-predecessor)
      transaction_revoke_predecessor "$transaction_id" "$release" "$token"
      ;;
    close-edge)
      [[ "$phase" == snapshotted ]] || die transaction_phase_conflict
      /usr/local/sbin/full-stack-preview-edge-close >/dev/null 2>&1 || die edge_close_failed 70
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase snapshotted --next-phase edge_closed
      ;;
    quiesce)
      [[ "$phase" == edge_closed ]] || die transaction_phase_conflict
      quiesce_all_writers
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase edge_closed --next-phase quiesced
      ;;
    migrate)
      [[ "$phase" == quiesced ]] || die transaction_phase_conflict
      transaction_migrate "$transaction_id" "$release" "$token" >/dev/null
      ;;
    start-backend)
      [[ "$phase" == migrated ]] || die transaction_phase_conflict
      /usr/bin/node - "$current_json" <<'NODE' || die migration_schema_receipt_missing
const value = JSON.parse(process.argv[2]);
if (!/^[a-f0-9]{64}$/.test(value.schemaBefore ?? '') || !/^[a-f0-9]{64}$/.test(value.schemaAfter ?? '')) process.exit(1);
NODE
      start_backend_internal "$release"
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase migrated --next-phase backend_ready
      ;;
    start-web-internal)
      [[ "$phase" == backend_ready ]] || die transaction_phase_conflict
      start_web_internal
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase backend_ready --next-phase web_internal_ready
      ;;
    verify-data)
      [[ "$phase" == web_internal_ready ]] || die transaction_phase_conflict
      synthetic_verify "$release"
      local candidate_json; candidate_json="$(capture_candidate_receipts "$transaction_id" "$release")" || die transaction_receipt_binding_failed 70
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase web_internal_ready --next-phase receipts_ready --patch-json "$(/usr/bin/node -e 'process.stdout.write(JSON.stringify({candidate: JSON.parse(process.argv[1])}))' "$candidate_json")"
      ;;
    publish-probe)
      [[ "$phase" == receipts_ready ]] || die transaction_phase_conflict
      /usr/bin/node "$PUBLISHER" stage || die publication_stage_failed 70
      /usr/bin/node "$PUBLISHER" publish || die publication_publish_failed 70
      rm -f -- /var/lib/meetwise-preview-controller/full-stack-internal-staging.json
      sync -f /var/lib/meetwise-preview-controller
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase receipts_ready --next-phase probe_published
      ;;
    activate)
      [[ "$phase" == probe_published ]] || die transaction_phase_conflict
      /usr/bin/node "$PUBLISHER" activate || die publication_activate_failed 70
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase probe_published --next-phase edge_probing
      ;;
    confirm)
      [[ "$phase" == edge_probing ]] || die transaction_phase_conflict
      local final_manifest_fingerprint
      final_manifest_fingerprint="$(confirm_public)" || die publication_confirm_failed 70
      [[ "$final_manifest_fingerprint" =~ $DIGEST_RE ]] || die publication_confirm_fingerprint_invalid 70
      local confirm_patch_json
      confirm_patch_json="$(/usr/bin/node - "$current_json" "$final_manifest_fingerprint" <<'NODE'
const [ledgerRaw, finalManifestFingerprint] = process.argv.slice(2); const ledger = JSON.parse(ledgerRaw);
process.stdout.write(JSON.stringify({ candidate: { ...(ledger.candidate ?? {}), finalManifestFingerprint } }));
NODE
      )"
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase edge_probing --next-phase confirmed_pending_pages --patch-json "$confirm_patch_json"
      ;;
  esac
}

transaction_cmd() {
  local action="${2:-}"
  case "$action" in
    begin)
      [[ $# -eq 13 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" commit="$5" tree="$6" token="$7" controller_digest="$8" compose_digest="${9}" source_digest="${10}" backend_digest="${11}" web_digest="${12}" bootstrap_origin="${13}"
      assert_transaction_args "$transaction_id" "$release" "$token"
      [[ "$commit" =~ $COMMIT_RE && "$tree" =~ $COMMIT_RE && "$controller_digest" =~ $DIGEST_RE && "$compose_digest" =~ $DIGEST_RE && "$source_digest" =~ $DIGEST_RE && "$backend_digest" =~ $IMAGE_DIGEST_RE && "$web_digest" =~ $IMAGE_DIGEST_RE && "$bootstrap_origin" =~ ^https://[a-z0-9.-]+\.ts\.net$ ]] || die transaction_identity_invalid
      [[ -f "$RELEASES_ROOT/$release/.source-archive.sha256" && ! -L "$RELEASES_ROOT/$release/.source-archive.sha256" && "$(stat -c '%u:%g:%a' "$RELEASES_ROOT/$release/.source-archive.sha256")" == '0:0:600' && "$(cat "$RELEASES_ROOT/$release/.source-archive.sha256")" == "$source_digest" ]] || die transaction_source_digest_mismatch
      with_controller_lock
      local generation; generation="$(derive_transaction_generation "$transaction_id" "$release" "$bootstrap_origin")" || die generation_derivation_failed
      local predecessor_file; predecessor_file="$(snapshot_predecessor "$transaction_id" "$release")"
      local predecessor_json; predecessor_json="$(/usr/bin/node -e 'process.stdout.write(JSON.stringify(require(process.argv[1])))' "$predecessor_file")" || die snapshot_read_failed
      # The JSON is generated by the root-owned snapshot helper; ledger-init
      # validates all immutable identity fields again and is idempotent on retry.
      local begin_json; begin_json="$(ledger_node ledger-init --transaction-id "$transaction_id" --release "$release" --commit "$commit" --tree "$tree" --generation "$generation" --token "$token" --controller-digest "$controller_digest" --compose-spec-digest "$compose_digest" --source-archive-digest "$source_digest" --backend-image-digest "$backend_digest" --web-image-digest "$web_digest" --predecessor-json "$predecessor_json" --candidate-json "$(/usr/bin/node -e 'process.stdout.write(JSON.stringify({bootstrapOrigin:process.argv[1]}))' "$bootstrap_origin")")"
      # ledger-init is intentionally idempotent for a replay, including a
      # legacy v1 file written before durable leases existed. Claim/refresh
      # the lease under the same controller flock before starting the watcher;
      # otherwise a legacy ledger would remain lease_unknown forever and could
      # never be recovered safely after a runner cancellation.
      begin_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_claim_failed 70
      start_full_stack_release_recovery_timer
      printf '%s\n' "$begin_json"
      ;;
    compose-pull|snapshot|revoke-predecessor|close-edge|quiesce|migrate|start-backend|start-web-internal|verify-data|publish-probe|activate|confirm)
      if [[ "$action" == compose-pull ]]; then
        [[ $# -eq 7 ]] || die transaction_argc_invalid
      else
        [[ $# -eq 5 ]] || die transaction_argc_invalid
      fi
      transaction_step "$@"
      ;;
    heartbeat)
      [[ $# -eq 5 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5"
      assert_transaction_args "$transaction_id" "$release" "$token"
      with_controller_lock
      local heartbeat_json; heartbeat_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_expired 75
      printf '%s\n' "$heartbeat_json"
      ;;
    schema-before|schema-after)
      [[ $# -eq 6 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5" schema_digest="$6"
      assert_transaction_args "$transaction_id" "$release" "$token"
      [[ "$schema_digest" =~ $DIGEST_RE ]] || die schema_digest_invalid
      with_controller_lock
      local current_json phase; current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
      assert_transaction_ledger_identity "$current_json" "$transaction_id" "$release" "$token"
      current_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_expired 75
      phase="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1])?.phase ?? "")' "$current_json")"
      if [[ "$action" == schema-before ]]; then [[ "$phase" == quiesced ]] || die transaction_phase_conflict; else [[ "$phase" == migrated ]] || die transaction_phase_conflict; fi
      local patch_json; if [[ "$action" == schema-before ]]; then patch_json="{\"schemaBefore\":\"$schema_digest\"}"; else patch_json="{\"schemaAfter\":\"$schema_digest\"}"; fi
      ledger_node ledger-update --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase "$phase" --patch-json "$patch_json"
      ;;
    recover)
      [[ $# -eq 5 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5"
      assert_transaction_args "$transaction_id" "$release" "$token"
      with_controller_lock
      local recovery_json recovery_action; recovery_json="$(ledger_node ledger-recover --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_recovery_failed 70
      recovery_action="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).action ?? "")' "$recovery_json")"
      case "$recovery_action" in
        no_ledger)
          printf '%s\n' "$recovery_json"
          ;;
        noop)
          local recovery_phase; recovery_phase="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.phase ?? "")' "$recovery_json")"
          if [[ "$recovery_phase" == committed || "$recovery_phase" == rolled_back || "$recovery_phase" == forward_only_maintenance ]]; then clear_transaction_snapshot "$transaction_id"; stop_full_stack_release_recovery_timer; fi
          printf '%s\n' "$recovery_json"
          ;;
        discard_unmutated_transaction)
          clear_transaction_snapshot "$transaction_id"
          stop_full_stack_release_recovery_timer
          printf '%s\n' "$recovery_json"
          ;;
        restore_pre_migration_snapshot|rollback_compatible)
          restore_predecessor_snapshot "$transaction_id" "$release"
          ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase rollback_pending --next-phase rolled_back
          clear_transaction_snapshot "$transaction_id"
          stop_full_stack_release_recovery_timer
          ;;
        forward_only_maintenance)
          run_compose stop api worker web >/dev/null 2>&1 || true
          ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase rollback_pending --next-phase forward_only_maintenance
          clear_transaction_snapshot "$transaction_id"
          stop_full_stack_release_recovery_timer
          ;;
        reprobe_migration)
          local migration_probe migration_digest migration_before migration_patch migration_recovery_action
          migration_probe="$(schema_receipt_from_db "$release")" || die migration_recovery_probe_failed 70
          migration_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);if(!/^[a-f0-9]{64}$/.test(v.schemaLedgerDigest??""))process.exit(1);process.stdout.write(v.schemaLedgerDigest)' "$migration_probe")" || die migration_recovery_probe_invalid 70
          migration_before="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);process.stdout.write(v.schemaBefore??"")' "$(ledger_node ledger-read)")"
          [[ "$migration_before" =~ $DIGEST_RE ]] || die migration_recovery_before_invalid 70
          if [[ "$migration_digest" == "$migration_before" ]]; then migration_recovery_action=rollback_compatible; else migration_recovery_action=forward_only_maintenance; fi
          migration_patch="$(/usr/bin/node - "$migration_digest" "$migration_recovery_action" <<'NODE'
const [schemaAfter, action] = process.argv.slice(2); process.stdout.write(JSON.stringify({schemaAfter,lastErrorCode:action==='forward_only_maintenance'?'migration_recovery_schema_changed_forward_only':'migration_recovery_schema_unchanged',recoveryAttempts:1}));
NODE
)"
          ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase migrating --next-phase rollback_pending --patch-json "$migration_patch" >/dev/null
          if [[ "$migration_recovery_action" == rollback_compatible ]]; then
            restore_predecessor_snapshot "$transaction_id" "$release"
            ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase rollback_pending --next-phase rolled_back
            clear_transaction_snapshot "$transaction_id"
            stop_full_stack_release_recovery_timer
          else
            run_compose stop api worker web >/dev/null 2>&1 || true
            ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase rollback_pending --next-phase forward_only_maintenance
            clear_transaction_snapshot "$transaction_id"
            stop_full_stack_release_recovery_timer
          fi
          ;;
        *) die transaction_recovery_action_invalid ;;
      esac
      ;;
    recover-system)
      [[ $# -eq 2 ]] || die transaction_argc_invalid
      with_controller_lock
      local system_before_json system_recovery_json system_recovery_action; system_before_json="$(ledger_node ledger-read 2>/dev/null || true)"; system_recovery_json="$(ledger_node ledger-recover-system)" || die transaction_recovery_failed 70
      system_recovery_action="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).action ?? "")' "$system_recovery_json")"
      case "$system_recovery_action" in
        no_ledger)
          stop_full_stack_release_recovery_timer
          printf '%s\n' "$system_recovery_json"
          ;;
        lease_active)
          # A boot/timer check is read-only while the durable lease is live.
          # Legacy ledgers without a trustworthy lease are routed through the
          # phase-based recovery policy by the controller.
          printf '%s\n' "$system_recovery_json"
          ;;
        noop)
          local system_phase system_transaction_id; system_phase="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.phase ?? "")' "$system_before_json")"; system_transaction_id="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.transactionId ?? "")' "$system_before_json")"
          if [[ -n "$system_transaction_id" ]]; then clear_transaction_snapshot "$system_transaction_id"; fi
          stop_full_stack_release_recovery_timer
          printf '%s\n' "$system_recovery_json"
          ;;
        discard_unmutated_transaction)
          local system_transaction_id; system_transaction_id="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.transactionId ?? "")' "$system_before_json")"
          [[ -n "$system_transaction_id" ]] && clear_transaction_snapshot "$system_transaction_id"
          stop_full_stack_release_recovery_timer
          printf '%s\n' "$system_recovery_json"
          ;;
        restore_pre_migration_snapshot|rollback_compatible)
          local system_transaction_id system_release; system_transaction_id="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).transactionId)' "$(ledger_node ledger-read)")"; system_release="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).release)' "$(ledger_node ledger-read)")"
          restore_predecessor_snapshot "$system_transaction_id" "$system_release"
          ledger_node ledger-system-transition --expected-phase rollback_pending --next-phase rolled_back
          clear_transaction_snapshot "$system_transaction_id"
          stop_full_stack_release_recovery_timer
          ;;
        forward_only_maintenance)
          run_compose stop api worker web >/dev/null 2>&1 || true
          local system_transaction_id; system_transaction_id="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]); process.stdout.write(v?.transactionId ?? "")' "$(ledger_node ledger-read)")"
          ledger_node ledger-system-transition --expected-phase rollback_pending --next-phase forward_only_maintenance
          [[ -n "$system_transaction_id" ]] && clear_transaction_snapshot "$system_transaction_id"
          stop_full_stack_release_recovery_timer
          ;;
        reprobe_migration)
          local system_migration_json system_migration_release system_migration_id system_probe system_probe_digest system_before_digest system_action system_patch
          system_migration_json="$(ledger_node ledger-read)"; system_migration_release="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);process.stdout.write(v.release)' "$system_migration_json")"; system_migration_id="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);process.stdout.write(v.transactionId)' "$system_migration_json")"
          system_probe="$(schema_receipt_from_db "$system_migration_release")" || die migration_recovery_probe_failed 70
          system_probe_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);if(!/^[a-f0-9]{64}$/.test(v.schemaLedgerDigest??""))process.exit(1);process.stdout.write(v.schemaLedgerDigest)' "$system_probe")" || die migration_recovery_probe_invalid 70
          system_before_digest="$(/usr/bin/node -e 'const v=JSON.parse(process.argv[1]);process.stdout.write(v.schemaBefore??"")' "$system_migration_json")"
          [[ "$system_before_digest" =~ $DIGEST_RE ]] || die migration_recovery_before_invalid 70
          if [[ "$system_probe_digest" == "$system_before_digest" ]]; then system_action=rollback_compatible; else system_action=forward_only_maintenance; fi
          system_patch="$(/usr/bin/node - "$system_probe_digest" "$system_action" <<'NODE'
const [schemaAfter, action] = process.argv.slice(2); process.stdout.write(JSON.stringify({schemaAfter,lastErrorCode:action==='forward_only_maintenance'?'migration_recovery_schema_changed_forward_only':'migration_recovery_schema_unchanged',recoveryAttempts:1}));
NODE
)"
          ledger_node ledger-system-transition --expected-phase migrating --next-phase rollback_pending --patch-json "$system_patch" >/dev/null
          if [[ "$system_action" == rollback_compatible ]]; then
            restore_predecessor_snapshot "$system_migration_id" "$system_migration_release"
            ledger_node ledger-system-transition --expected-phase rollback_pending --next-phase rolled_back
            clear_transaction_snapshot "$system_migration_id"
            stop_full_stack_release_recovery_timer
          else
            run_compose stop api worker web >/dev/null 2>&1 || true
            ledger_node ledger-system-transition --expected-phase rollback_pending --next-phase forward_only_maintenance
            clear_transaction_snapshot "$system_migration_id"
            stop_full_stack_release_recovery_timer
          fi
          ;;
        *) die transaction_recovery_action_invalid ;;
      esac
      ;;
    status)
      [[ $# -eq 5 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5"
      assert_transaction_args "$transaction_id" "$release" "$token"
      with_controller_lock
      local current_json; current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
      assert_transaction_ledger_identity "$current_json" "$transaction_id" "$release" "$token"
      printf '%s\n' "$current_json"
      ;;
    status-system)
      # Read-only, tokenless status for an independent recovery workflow.  The
      # root ledger remains the source of truth, but the response is a narrow
      # allowlisted projection: never expose token digests, image refs, source
      # paths, database facts, or candidate receipt bodies to the recovery
      # runner.  A missing ledger is a normal no-op for the scheduled checker.
      [[ $# -eq 2 ]] || die transaction_argc_invalid
      with_controller_lock
      local system_status_json; system_status_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
      /usr/bin/node - "$system_status_json" <<'NODE' || die transaction_status_invalid 70
const raw = process.argv[2] ?? '';
if (!raw || raw === 'null') { process.stdout.write('{"action":"no_ledger"}\n'); process.exit(0); }
const value = JSON.parse(raw);
const digest = (v) => typeof v === 'string' && /^[a-f0-9]{64}$/.test(v) ? v : null;
const pages = value?.predecessor?.pages;
if (!value || !['preflighted','snapshotted','edge_closed','quiesced','migrating','migrated','backend_ready','web_internal_ready','receipts_ready','probe_published','edge_probing','confirmed_pending_pages','pages_enabled','rollback_pending','committed','rolled_back','forward_only_maintenance'].includes(value.phase)) throw new Error('phase');
if (typeof value.transactionId !== 'string' || typeof value.release !== 'string' || !Number.isSafeInteger(value.generation) || value.generation < 1) throw new Error('identity');
if (!pages || !['enabled','disabled','none'].includes(pages.state)) throw new Error('pages_state');
if (pages.state === 'none') {
  if (pages.generation !== null && pages.generation !== undefined && pages.generation !== 0) throw new Error('pages_none_generation');
  if (pages.fingerprint !== null && pages.fingerprint !== undefined && pages.fingerprint !== '') throw new Error('pages_none_fingerprint');
} else if (pages.state === 'enabled') {
  if (!Number.isSafeInteger(pages.generation) || pages.generation < 1 || !digest(pages.fingerprint)) throw new Error('pages_enabled_identity');
} else if (!Number.isSafeInteger(pages.generation) || pages.generation < 0 || !digest(pages.fingerprint)) throw new Error('pages_disabled_identity');
const candidate = value.candidate ?? {};
const finalManifestFingerprint = digest(candidate.finalManifestFingerprint);
const pagesFingerprint = digest(candidate.pagesFingerprint);
process.stdout.write(`${JSON.stringify({
  action: 'status', schemaVersion: value.schemaVersion, transactionId: value.transactionId,
  release: value.release, generation: value.generation, phase: value.phase,
  recoveryPolicy: value.recoveryPolicy, lastErrorCode: value.lastErrorCode ?? null,
  leaseExpiresAt: value.leaseExpiresAt ?? null,
  predecessor: { pages: { state: pages.state, generation: pages.state === 'none' ? null : pages.generation, fingerprint: pages.state === 'none' ? null : pages.fingerprint } },
  candidate: { finalManifestFingerprint, pagesFingerprint },
})}\n`);
NODE
      ;;
    wait-pages)
      [[ $# -eq 6 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5" pages_fingerprint="$6"
      assert_transaction_args "$transaction_id" "$release" "$token"
      [[ "$pages_fingerprint" =~ $DIGEST_RE ]] || die pages_fingerprint_invalid
      with_controller_lock
      local current_json; current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
      assert_transaction_ledger_identity "$current_json" "$transaction_id" "$release" "$token"
      current_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_expired 75
      local phase; phase="$(/usr/bin/node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(x?.phase ?? "")' "$current_json")"
      if [[ "$phase" == pages_enabled || "$phase" == committed ]]; then
        local stored_pages_fingerprint; stored_pages_fingerprint="$(/usr/bin/node -e 'const x=JSON.parse(process.argv[1]); process.stdout.write(x?.candidate?.pagesFingerprint ?? "")' "$current_json")"
        [[ "$stored_pages_fingerprint" == "$pages_fingerprint" ]] || die pages_receipt_mismatch
        printf '%s\n' "$current_json"
        return
      fi
      [[ "$phase" == confirmed_pending_pages ]] || die transaction_phase_conflict
      local pages_json; pages_json="$(/usr/bin/curl --fail --silent --show-error --max-time 20 "https://miaole.github.io/meetwise/preview-link-state.json?manifest=$pages_fingerprint")" || die pages_receipt_unavailable 75
      /usr/bin/node - "$pages_json" "$pages_fingerprint" "$current_json" <<'NODE' || die pages_receipt_mismatch
const [raw, fingerprint, ledgerRaw] = process.argv.slice(2); const value = JSON.parse(raw); const ledger = JSON.parse(ledgerRaw);
if (value.state !== 'enabled' || String(value.generation) !== String(ledger.generation) || value.manifestSha256 !== fingerprint || value.finalFingerprint !== fingerprint) process.exit(1);
NODE
      local patch_json; patch_json="$(/usr/bin/node - "$current_json" "$pages_json" "$pages_fingerprint" <<'NODE'
const [current, receipt, fingerprint] = process.argv.slice(2); const value = JSON.parse(current);
process.stdout.write(JSON.stringify({ candidate: { ...(value.candidate ?? {}), pagesFingerprint: fingerprint, pagesReceipt: JSON.parse(receipt) } }));
NODE
      )"
      ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase confirmed_pending_pages --next-phase pages_enabled --patch-json "$patch_json"
      ;;
    commit)
      [[ $# -eq 6 ]] || die transaction_argc_invalid
      local transaction_id="$3" release="$4" token="$5" pages_fingerprint="$6"
      assert_transaction_args "$transaction_id" "$release" "$token"
      [[ "$pages_fingerprint" =~ $DIGEST_RE ]] || die pages_fingerprint_invalid
      with_controller_lock
      local current_json; current_json="$(ledger_node ledger-read)" || die transaction_ledger_missing
      assert_transaction_ledger_identity "$current_json" "$transaction_id" "$release" "$token"
      current_json="$(ledger_node ledger-heartbeat --transaction-id "$transaction_id" --release "$release" --token "$token")" || die transaction_lease_expired 75
      local phase candidate_fingerprint; phase="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1])?.phase ?? "")' "$current_json")"; candidate_fingerprint="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1])?.candidate?.pagesFingerprint ?? "")' "$current_json")"
      [[ "$phase" == committed || "$phase" == pages_enabled ]] || die transaction_commit_phase_invalid
      [[ "$candidate_fingerprint" == "$pages_fingerprint" ]] || die pages_receipt_mismatch
      local committed_controller_digest; committed_controller_digest="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1])?.controllerDigest ?? "")' "$current_json")"
      [[ "$committed_controller_digest" =~ $DIGEST_RE ]] || die transaction_controller_digest_missing
      controller_live_readback "$committed_controller_digest" >/dev/null || die transaction_controller_digest_drift 75
      if [[ "$phase" == pages_enabled ]]; then
        ledger_node ledger-transition --transaction-id "$transaction_id" --release "$release" --token "$token" --expected-phase pages_enabled --next-phase committed
      else
        printf '%s\n' "$current_json"
      fi
      clear_transaction_snapshot "$transaction_id"
      stop_full_stack_release_recovery_timer
      ;;
    *) die transaction_action_invalid ;;
  esac
}

# release must match the fixed pattern AND resolve inside RELEASES_ROOT without traversal.
release_dir() {
  local release="$1"
  [[ "$release" =~ $RELEASE_RE ]] || die release_name_invalid
  local dir="$RELEASES_ROOT/$release"
  [[ "$dir" == "$RELEASES_ROOT"/* && "$dir" != *".."* ]] || die release_path_invalid
  printf '%s' "$dir"
}

# Untrusted staging file (written by meetwise-cd) — must be a regular, non-symlink file.
assert_incoming_file() {
  local path="$1"
  [[ -f "$path" && ! -L "$path" ]] || die incoming_file_missing
  local owner
  owner="$(stat -c '%U' "$path")"
  [[ "$owner" == meetwise-cd ]] || die incoming_file_owner_invalid
}

# compose 控制面：所有 docker compose 调用走这一个 helper，.env/-f 路径只此一处、不写散。
run_compose() {
  /usr/bin/docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" "$@"
}

receive_source() {
  local release="$1" expected_digest="$2"; local dir; dir="$(release_dir "$release")"
  local archive="$INCOMING/$release.tar.gz"
  [[ "$expected_digest" =~ $DIGEST_RE ]] || die source_digest_invalid
  assert_incoming_file "$archive"
  [[ "$(sha256sum "$archive" | awk '{print $1}')" == "$expected_digest" ]] || die source_digest_mismatch
  [[ ! -e "$dir" ]] || die release_dir_exists
  install -d -o root -g root -m 0755 "$dir"
  # --no-same-owner/--no-same-permissions neutralize tar metadata; GNU tar 1.29+
  # refuses absolute paths and `..`; required-file check catches a bad payload.
  if ! tar -xzf "$archive" -C "$dir" --no-same-owner --no-same-permissions --no-overwrite-dir; then
    rm -rf "$dir"; die source_extract_failed 70
  fi
  for required in package.json apps/api/src/main.ts apps/worker/src/main.ts apps/web/package.json packages/contracts/src/openapi.ts packages/db/src/migrate-cli.ts scripts/preview-synthetic-data/loader.mjs; do
    [[ -f "$dir/$required" ]] || { rm -rf "$dir"; die "source_missing:$required" 70; }
  done
  if find "$dir" -type l -print -quit | grep -q .; then rm -rf "$dir"; die source_contains_symlink 70; fi
  printf '%s\n' "$expected_digest" > "$dir/.source-archive.sha256"
  chown root:root "$dir/.source-archive.sha256"; chmod 0600 "$dir/.source-archive.sha256"; sync -f "$dir"
  echo receive_source_ok
}

with_release_cwd() {
  local dir; dir="$(release_dir "$1")"
  [[ -d "$dir" ]] || die release_dir_missing
  printf '%s' "$dir"
}

validate_pnpm_prefix_contents() {
  local prefix="$1" bin="$1/bin/pnpm" package_root="$1/lib/node_modules/pnpm"
  local receipt="$1/.meetwise-integrity"
  local required_integrity="${2:-}" required_version="${3:-}"
  local resolved actual_version package_version declared_integrity unsafe
  [[ -d "$prefix" && ! -L "$prefix" && -L "$bin" && -x "$bin" ]] || return 1
  [[ -f "$receipt" && ! -L "$receipt" && "$(stat -c '%u:%g:%a' "$receipt" 2>/dev/null || true)" == '0:0:600' ]] || return 1
  declared_integrity="$(cat "$receipt" 2>/dev/null || true)"
  [[ "$declared_integrity" =~ ^sha512-[A-Za-z0-9+/]+={0,2}$ ]] || return 1
  [[ -z "$required_integrity" || "$declared_integrity" == "$required_integrity" ]] || return 1
  [[ "$(stat -c '%u:%g' "$bin" 2>/dev/null || true)" == '0:0' ]] || return 1
  [[ -d "$package_root" && ! -L "$package_root" ]] || return 1
  resolved="$(readlink -f "$bin" 2>/dev/null || true)"
  [[ "$resolved" == "$package_root/bin/pnpm.cjs" ]] || return 1
  # No package-file symlink and no non-root/group-writable package material:
  # this prevents a lower-privilege account from replacing the trusted tool.
  if find "$package_root" -type l -print -quit 2>/dev/null | grep -q .; then
    return 1
  fi
  unsafe="$(find "$prefix" \( -type f -o -type d \) \( ! -user root -o ! -group root -o -perm /022 \) -print -quit 2>/dev/null || true)"
  [[ -z "$unsafe" ]] || return 1
  package_version="$(/usr/bin/node -e 'const p=require(process.argv[1]);process.stdout.write(String(p.version ?? ""))' "$package_root/package.json" 2>/dev/null || true)"
  [[ "$package_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || return 1
  [[ -z "$required_version" || "$package_version" == "$required_version" ]] || return 1
  actual_version="$(/usr/bin/env -i HOME=/var/lib/meetwise-preview-synthetic PATH=/usr/bin:/usr/sbin:/bin:/sbin:"$prefix/bin" "$bin" --version 2>/dev/null || true)"
  [[ "$actual_version" == "$package_version" ]]
}

validate_pnpm_prefix_receipt() {
  local prefix="$1" package_root="$1/lib/node_modules/pnpm"
  validate_pnpm_prefix_contents "$@" || return 1
  [[ "$(stat -c '%u:%g:%a' "$prefix" 2>/dev/null || true)" == '0:0:755' ]] || return 1
  # The trusted package remains root-owned and non-writable, but every
  # directory must be traversable and every package file readable by the
  # low-privilege install-deps account.
  ! find "$prefix" -type d ! -perm -0005 -print -quit 2>/dev/null | grep -q . || return 1
  ! find "$package_root" -type f ! -perm -0004 -print -quit 2>/dev/null | grep -q . || return 1
}

validate_pnpm_prefix() {
  validate_pnpm_prefix_receipt "$1" "$PNPM_INTEGRITY" "$PNPM_VERSION"
}

ensure_pnpm_toolchain() {
  local stage archive candidate backup actual_integrity
  backup="$PNPM_PREFIX.rollback"
  # Normalize the one legacy private-prefix layout only after the complete
  # root-owned receipt/content/version checks pass. This is an idempotent
  # accessibility repair, not a trust bypass.
  if validate_pnpm_prefix_contents "$PNPM_PREFIX" "$PNPM_INTEGRITY" "$PNPM_VERSION"; then
    chmod -R u=rwX,go=rX "$PNPM_PREFIX" || die pnpm_prefix_access_failed 70
    chmod 0600 "$PNPM_PREFIX/.meetwise-integrity" || die pnpm_receipt_mode_failed 70
  fi
  if validate_pnpm_prefix "$PNPM_PREFIX"; then
    [[ ! -e "$backup" && ! -L "$backup" ]] || rm -rf -- "$backup"
    return 0
  fi
  if validate_pnpm_prefix_receipt "$backup"; then
    [[ ! -e "$PNPM_PREFIX" && ! -L "$PNPM_PREFIX" ]] || rm -rf -- "$PNPM_PREFIX"
    mv -T -- "$backup" "$PNPM_PREFIX"
    validate_pnpm_prefix_receipt "$PNPM_PREFIX" || die pnpm_rollback_restore_failed 70
    sync -f /usr/local/lib
  fi
  [[ ! -e "$backup" && ! -L "$backup" ]] || die pnpm_rollback_invalid 70
  [[ -x /usr/bin/npm ]] || die npm_missing 70
  if [[ -e "$PNPM_PREFIX" || -L "$PNPM_PREFIX" ]]; then
    [[ -d "$PNPM_PREFIX" && ! -L "$PNPM_PREFIX" ]] || die pnpm_prefix_invalid 70
    validate_pnpm_prefix_receipt "$PNPM_PREFIX" || die pnpm_existing_prefix_invalid 70
  fi
  stage="$(mktemp -d /usr/local/lib/.meetwise-cd-pnpm.XXXXXX)" || die pnpm_stage_create_failed 70
  trap 'rm -rf -- "${stage:-}"' EXIT
  install -d -o root -g root -m 0700 "$stage/download"
  install -d -o root -g root -m 0755 "$stage/prefix"
  timeout --signal=TERM --kill-after=5s 180s /usr/bin/env -i HOME=/root PATH=/usr/bin:/usr/sbin:/bin:/sbin \
    /usr/bin/npm pack "pnpm@$PNPM_VERSION" --pack-destination "$stage/download" \
      --ignore-scripts --json >/dev/null 2>&1 || die pnpm_download_failed 70
  archive="$stage/download/pnpm-$PNPM_VERSION.tgz"
  [[ -f "$archive" && ! -L "$archive" ]] || die pnpm_archive_missing 70
  actual_integrity="$(/usr/bin/node - "$archive" <<'NODE'
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
process.stdout.write(`sha512-${createHash('sha512').update(readFileSync(process.argv[2])).digest('base64')}`);
NODE
)"
  [[ "$actual_integrity" == "$PNPM_INTEGRITY" ]] || die pnpm_archive_integrity_invalid 70
  timeout --signal=TERM --kill-after=5s 300s /usr/bin/env -i HOME=/root PATH=/usr/bin:/usr/sbin:/bin:/sbin \
    /usr/bin/npm install --global --prefix "$stage/prefix" \
      --ignore-scripts --no-audit --no-fund "$archive" >/dev/null 2>&1 \
    || die pnpm_install_failed 70
  chown -R root:root "$stage/prefix" || die pnpm_prefix_chown_failed 70
  chmod -R u=rwX,go=rX "$stage/prefix" || die pnpm_prefix_mode_failed 70
  printf '%s\n' "$PNPM_INTEGRITY" > "$stage/prefix/.meetwise-integrity"
  chown root:root "$stage/prefix/.meetwise-integrity"
  chmod 0600 "$stage/prefix/.meetwise-integrity"
  validate_pnpm_prefix "$stage/prefix" || die pnpm_candidate_invalid 70
  candidate="$stage/prefix"
  if [[ -e "$PNPM_PREFIX" || -L "$PNPM_PREFIX" ]]; then mv -T -- "$PNPM_PREFIX" "$backup"; fi
  mv -T -- "$candidate" "$PNPM_PREFIX"
  validate_pnpm_prefix "$PNPM_PREFIX" || {
    rm -rf -- "$PNPM_PREFIX"
    [[ ! -e "$backup" && ! -L "$backup" ]] || mv -T -- "$backup" "$PNPM_PREFIX"
    die pnpm_toolchain_invalid 70
  }
  [[ ! -e "$backup" && ! -L "$backup" ]] || rm -rf -- "$backup"
  sync -f /usr/local/lib
  trap - EXIT
  rm -rf -- "$stage"
  echo bootstrap_toolchain_ok
}

install_deps() {
  local dir; dir="$(with_release_cwd "$1")"
  # Only @meetwise/db's production closure is needed on ECS: prepare and
  # db-verify use createRequire(packages/db/package.json) to resolve pg. A
  # workspace-wide install needlessly materializes every app/package (and can
  # exhaust the small ECS disk); --prod plus the dependency selector keeps the
  # install frozen, lifecycle-free, and limited to the runtime DB boundary.
  with_controller_lock
  validate_pnpm_prefix "$PNPM_PREFIX" || die pnpm_toolchain_invalid 70
  chown -R meetwise-synthetic:meetwise "$dir"
  chmod -R u+rwX,g+rX,o-rwx "$dir"
  chown root:root "$dir/.source-archive.sha256"; chmod 0600 "$dir/.source-archive.sha256"
  /usr/sbin/runuser -u meetwise-synthetic -- /usr/bin/env -i \
    HOME=/var/lib/meetwise-preview-synthetic PATH=/usr/bin:/usr/sbin:/bin:/sbin:"$PNPM_PREFIX/bin" \
    /bin/bash -c 'cd "$1" && exec "$2" --filter @meetwise/db install --prod --frozen-lockfile --ignore-scripts' bash "$dir" "$PNPM_BIN" \
    || die install_deps_failed 70
  # P0-1 降权：prepare compute 与 synthetic-verify 以 meetwise-synthetic（meetwise 补充组）读本树
  # 与 node_modules（解析 pg）。源码树非机密（开源），组可读即可；g+rX 只加组读与目录遍历，
  # 不加组写/他人位，不把不可信 tarball 文件变成可执行。umask 077 下 tar 与 pnpm 落盘是
  # root:root 0600/0700，synthetic 读不到，必须在此统一放开组读。
  chown -R root:meetwise "$dir"
  chmod -R u=rwX,g=rX,o= "$dir"
  # The archive identity is controller state, not candidate source. Recursive
  # dependency ownership normalization must never weaken it; transaction begin
  # requires the exact root-only marker after install completes.
  chown root:root "$dir/.source-archive.sha256"
  chmod 0600 "$dir/.source-archive.sha256"
  sync -f "$dir/.source-archive.sha256"
  sync -f "$dir"
  echo install_deps_ok
}

discard_unclaimed_release() {
  local release="$1" dir marker current_target ledger_json marker_status snapshot_status ledger_status
  [[ $# -eq 1 && "$release" =~ $RELEASE_RE ]] || die release_name_invalid
  [[ -d "$RELEASES_ROOT" && ! -L "$RELEASES_ROOT" ]] || die releases_root_invalid 70
  dir="$RELEASES_ROOT/$release"
  [[ "$dir" == "$RELEASES_ROOT/"* && "$dir" != *..* ]] || die release_path_invalid 70

  # Serialize cleanup with transaction begin/recovery and every other ledger
  # mutation. Missing is an idempotent safe success; no broad glob is ever
  # passed to rm.
  with_controller_lock
  if [[ ! -e "$dir" && ! -L "$dir" ]]; then
    printf 'discard_unclaimed_release_missing\n'
    return 0
  fi
  [[ -d "$dir" && ! -L "$dir" ]] || die release_dir_not_directory 70

  if [[ -e "$CURRENT" || -L "$CURRENT" ]]; then
    [[ -L "$CURRENT" ]] || die current_pointer_invalid 70
    current_target="$(readlink -f "$CURRENT" 2>/dev/null || true)"
    [[ -n "$current_target" && -d "$current_target" && ! -L "$current_target" ]] || die current_pointer_invalid 70
    [[ "$current_target" != "$dir" ]] || die release_current 70
  fi

  ledger_json="$(ledger_node ledger-read)" || die release_ledger_read_failed 70
  ledger_status=0
  /usr/bin/node - "$ledger_json" "$release" <<'NODE' || ledger_status=$?
const [raw, release] = process.argv.slice(2);
const value = JSON.parse(raw);
if (value && value.release === release) process.exit(2);
NODE
  case "$ledger_status" in
    0) : ;;
    2) die release_ledger_referenced 70 ;;
    *) die release_ledger_invalid 70 ;;
  esac

  # Snapshot predecessor files are root-owned rollback authorities. Validate
  # their ownership/shape before accepting the no-reference result; an
  # unexpected snapshot entry fails closed instead of being ignored.
  snapshot_status=0
  /usr/bin/node - "$FULL_STACK_SNAPSHOTS" "$release" <<'NODE' || snapshot_status=$?
const { lstatSync, readdirSync, readFileSync } = require('node:fs');
const [root, release] = process.argv.slice(2);
let rootStat;
try { rootStat = lstatSync(root); } catch (error) {
  if (error?.code === 'ENOENT') process.exit(0);
  process.exit(3);
}
if (!rootStat.isDirectory() || rootStat.isSymbolicLink() || rootStat.uid !== 0 || rootStat.gid !== 0 || (rootStat.mode & 0o777) !== 0o700) process.exit(3);
for (const name of readdirSync(root)) {
  const dir = `${root}/${name}`;
  const dirStat = lstatSync(dir);
  if (!dirStat.isDirectory() || dirStat.isSymbolicLink() || dirStat.uid !== 0 || dirStat.gid !== 0 || (dirStat.mode & 0o777) !== 0o700) process.exit(3);
  const predecessor = `${dir}/predecessor.json`;
  let stat;
  try { stat = lstatSync(predecessor); } catch (error) {
    if (error?.code === 'ENOENT') continue;
    process.exit(3);
  }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) process.exit(3);
  const value = JSON.parse(readFileSync(predecessor, 'utf8'));
  if (value?.schemaVersion !== 1 || typeof value.release !== 'string'
    || (value.currentTarget !== null && typeof value.currentTarget !== 'string')) process.exit(3);
  if (value.release === release || value.currentTarget === `releases/${release}`) process.exit(2);
}
NODE
  case "$snapshot_status" in
    0) : ;;
    2) die release_snapshot_referenced 70 ;;
    *) die release_snapshot_invalid 70 ;;
  esac

  marker="$dir/.source-archive.sha256"
  [[ -f "$marker" && ! -L "$marker" && "$(stat -c '%u:%g:%a' "$marker" 2>/dev/null || true)" == '0:0:600' ]] || die release_marker_invalid 70
  marker_status=0
  /usr/bin/node - "$marker" <<'NODE' || marker_status=$?
const { lstatSync, readFileSync } = require('node:fs');
const path = process.argv[2];
const stat = lstatSync(path);
if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) process.exit(1);
const bytes = readFileSync(path);
if (bytes.length !== 65 || bytes[64] !== 0x0a || !/^[a-f0-9]{64}\n$/.test(bytes.toString('utf8'))) process.exit(1);
NODE
  [[ "$marker_status" -eq 0 ]] || die release_marker_invalid 70

  rm -rf --one-file-system -- "$dir"
  [[ ! -e "$dir" && ! -L "$dir" ]] || die release_discard_failed 70
  sync -f "$RELEASES_ROOT"
  printf 'discard_unclaimed_release_ok\n'
}

# 把本次两镜像的 @sha256 摘要拼成完整引用写进 .env，再 pull。云凭据（DB/Tair/模型 key/ACR 认证）
# 仍冻结在 .env（provision 时写好）；本函数只重写 BACKEND_IMAGE/WEB_IMAGE 两行，其余不动。
set_image_env() {
  local backend_ref="$1" web_ref="$2" tmp="$COMPOSE_ENV.tmp.$$"
  [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]] || die compose_env_missing
  [[ "$(stat -c '%u:%g:%a' "$COMPOSE_ENV" 2>/dev/null || true)" == '0:0:600' ]] || die compose_env_unsafe
  awk '!/^(export[[:space:]]+)?(BACKEND_IMAGE|WEB_IMAGE)=/' "$COMPOSE_ENV" > "$tmp"
  printf 'BACKEND_IMAGE=%s\nWEB_IMAGE=%s\n' "$backend_ref" "$web_ref" >> "$tmp"
  chmod 0600 "$tmp"
  mv -f "$tmp" "$COMPOSE_ENV"
}

install_candidate_compose_spec() {
  local release="$1" expected_digest="$2" release_root candidate temporary actual_digest
  [[ "$expected_digest" =~ $DIGEST_RE ]] || die candidate_compose_spec_digest_invalid
  release_root="$(with_release_cwd "$release")"
  candidate="$release_root/docker/compose.prod.yml"
  [[ -f "$candidate" && ! -L "$candidate" && "$(stat -c '%u' "$candidate" 2>/dev/null || true)" == 0 ]] || die candidate_compose_spec_invalid 70
  actual_digest="$(sha256sum "$candidate" | awk '{print $1}')"
  [[ "$actual_digest" == "$expected_digest" ]] || die candidate_compose_spec_digest_mismatch 70
  install -d -o root -g root -m 0755 "$(dirname "$COMPOSE_FILE")"
  temporary="$(mktemp "$(dirname "$COMPOSE_FILE")/.compose.prod.yml.XXXXXX")" || die candidate_compose_spec_temp_failed 70
  trap 'rm -f -- "$temporary"' RETURN
  install -o root -g root -m 0644 "$candidate" "$temporary"
  /usr/bin/docker compose --project-directory "$COMPOSE_DIR" -f "$temporary" config >/dev/null || die candidate_compose_spec_config_invalid 70
  sync -f "$temporary"
  mv -f -- "$temporary" "$COMPOSE_FILE"
  sync -f "$(dirname "$COMPOSE_FILE")"
  trap - RETURN
}

compose_pull() {
  local backend_digest="$1" web_digest="$2" registry namespace
  [[ "$backend_digest" =~ $IMAGE_DIGEST_RE && "$web_digest" =~ $IMAGE_DIGEST_RE ]] || die image_digest_invalid
  [[ -f "$COMPOSE_ENV" && ! -L "$COMPOSE_ENV" ]] || die compose_env_missing
  [[ "$(stat -c '%u:%g:%a' "$COMPOSE_ENV" 2>/dev/null || true)" == '0:0:600' ]] || die compose_env_unsafe
  [[ -f "$COMPOSE_FILE" && ! -L "$COMPOSE_FILE" ]] || die compose_spec_missing
  [[ "$(stat -c '%u:%g' "$COMPOSE_FILE" 2>/dev/null || true)" == '0:0' ]] || die compose_spec_owner_invalid
  if [[ -e "$COMPOSE_ENV_ROLLBACK" || -L "$COMPOSE_ENV_ROLLBACK" ]]; then
    [[ -f "$COMPOSE_ENV_ROLLBACK" && ! -L "$COMPOSE_ENV_ROLLBACK" ]] || die compose_rollback_unsafe
    [[ "$(stat -c '%u:%g:%a' "$COMPOSE_ENV_ROLLBACK" 2>/dev/null || true)" == '0:0:600' ]] || die compose_rollback_unsafe
  fi
  if [[ -e "$COMPOSE_ROLLBACK_MARKER" || -L "$COMPOSE_ROLLBACK_MARKER" ]]; then
    [[ -f "$COMPOSE_ROLLBACK_MARKER" && ! -L "$COMPOSE_ROLLBACK_MARKER" ]] || die compose_rollback_marker_unsafe
    [[ "$(stat -c '%u:%g:%a' "$COMPOSE_ROLLBACK_MARKER" 2>/dev/null || true)" == '0:0:600' ]] || die compose_rollback_marker_unsafe
  fi
  registry="$(awk -F= '/^ACR_REGISTRY=/{print substr($0,index($0,"=")+1); exit}' "$COMPOSE_ENV")"
  namespace="$(awk -F= '/^ACR_NAMESPACE=/{print substr($0,index($0,"=")+1); exit}' "$COMPOSE_ENV")"
  [[ -n "$registry" && -n "$namespace" ]] || die acr_env_missing
  [[ -f "$ACR_PULL_ENV" && ! -L "$ACR_PULL_ENV" ]] || die acr_pull_env_missing
  [[ "$(stat -c '%U:%G:%a' "$ACR_PULL_ENV")" == 'root:root:600' ]] || die acr_pull_env_unsafe
  set -a
  # shellcheck disable=SC1090
  . "$ACR_PULL_ENV"
  set +a
  [[ -n "${ACR_PULL_USERNAME:-}" && -n "${ACR_PULL_PASSWORD:-}" ]] || die acr_pull_credentials_missing
  printf '%s\n' "$ACR_PULL_PASSWORD" | /usr/bin/docker login "$registry" -u "$ACR_PULL_USERNAME" --password-stdin >/dev/null || die acr_pull_login_failed 70
  unset ACR_PULL_PASSWORD ACR_PULL_USERNAME
  if [[ ! -e "$COMPOSE_ENV_ROLLBACK" ]]; then
    install -o root -g root -m 0600 "$COMPOSE_ENV" "$COMPOSE_ENV_ROLLBACK"
    if grep -qE '^BACKEND_IMAGE=.+@sha256:[a-f0-9]{64}$' "$COMPOSE_ENV" \
      && grep -qE '^WEB_IMAGE=.+@sha256:[a-f0-9]{64}$' "$COMPOSE_ENV"; then
      install -o root -g root -m 0600 /dev/null "$COMPOSE_ROLLBACK_MARKER"
    fi
    sync -f "$COMPOSE_ENV_ROLLBACK"
    sync -f "$COMPOSE_DIR"
  fi
  set_image_env "$registry/$namespace/meetwise-backend@$backend_digest" "$registry/$namespace/meetwise-web@$web_digest"
  run_compose pull || die compose_pull_failed 70
  echo compose_pull_ok
}

restore_flip_predecessor() {
  local previous_target="$1" had_previous_compose=0 unit
  run_compose stop api worker web >/dev/null 2>&1 || true
  if [[ -f "$COMPOSE_ENV_ROLLBACK" && ! -L "$COMPOSE_ENV_ROLLBACK" ]]; then
    [[ -f "$COMPOSE_ROLLBACK_MARKER" ]] && had_previous_compose=1
    install -o root -g root -m 0600 "$COMPOSE_ENV_ROLLBACK" "$COMPOSE_ENV"
    sync -f "$COMPOSE_ENV"
    sync -f "$COMPOSE_DIR"
  fi
  if [[ -n "$previous_target" ]]; then
    ln -sfn "$previous_target" "$CURRENT.new"
    mv -Tf "$CURRENT.new" "$CURRENT"
  else
    unlink "$CURRENT" 2>/dev/null || true
  fi
  if [[ "$had_previous_compose" -eq 1 ]]; then
    run_compose up -d api worker || return 1
    for _ in $(seq 1 60); do
      if curl --fail --silent --max-time 2 http://127.0.0.1:8787/readyz/api >/dev/null \
        && run_compose exec -T worker node -e "fetch('http://127.0.0.1:9091/readyz/worker').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
        return 0
      fi
      sleep 2
    done
    return 1
  fi
  for unit in "${active_legacy[@]}"; do
    systemctl enable "$unit" >/dev/null 2>&1 || return 1
    systemctl start "$unit" || return 1
  done
}

prepare() {
  local transaction_id="$1" release="$2" token="$3" commit="$4" tree="$5" origin="$6" wb="$7" sa="$8" backend_digest="$9" web_digest="${10}"
  [[ "$commit" =~ $COMMIT_RE && "$tree" =~ $COMMIT_RE && "$origin" =~ $ORIGIN_RE && "$wb" =~ $DIGEST_RE && "$sa" =~ $DIGEST_RE && "$backend_digest" =~ $IMAGE_DIGEST_RE && "$web_digest" =~ $IMAGE_DIGEST_RE ]] || die prepare_argument_invalid
  [[ "$transaction_id" =~ $TRANSACTION_ID_RE ]] || die prepare_transaction_id_invalid
  [[ "$release" =~ $RELEASE_RE ]] || die prepare_release_invalid
  [[ "$token" =~ $TOKEN_RE ]] || die prepare_recovery_token_invalid
  local dir; dir="$(with_release_cwd "$release")"
  [[ -f "$VERIFIER_ENV" && ! -L "$VERIFIER_ENV" && "$(stat -c '%U:%G:%a' "$VERIFIER_ENV" 2>/dev/null || true)" == root:meetwise-synthetic:640 ]] || die prepare_verifier_env_unsafe
  # The flock covers ledger read → lease heartbeat → child execution → final
  # artifact publication.  A second runner cannot observe the same transaction
  # and race an approval with a different generation.
  with_controller_lock
  local generation generation_status=0
  generation="$(prepare_ledger_generation "$transaction_id" "$release" "$token" "$commit" "$tree")" || generation_status=$?
  if [[ "$generation_status" -ne 0 ]]; then
    # ledger-prepare uses 75 for an expired token lease. Preserve that status
    # so GitHub enters the existing recovery job; never turn it into the
    # generic 64 identity error or blindly retry prepare.
    [[ "$generation_status" -eq 75 ]] && exit 75
    die prepare_transaction_identity_mismatch
  fi
  local prepare_status=0
  /usr/bin/node "$PREPARE" \
    --transaction-id "$transaction_id" --release "$release" --recovery-token "$token" \
    --commit "$commit" --tree "$tree" --origin "$origin" \
    --web-build-sha256 "$wb" --static-assets-sha256 "$sa" \
    --backend-image-digest "$backend_digest" --web-image-digest "$web_digest" \
    --release-path "$dir" --generation "$generation" || prepare_status=$?
  if [[ "$prepare_status" -ne 0 ]]; then
    [[ "$prepare_status" -eq 75 ]] && exit 75
    die prepare_failed 70
  fi
}

# compose 单机：迁移由一次性 migrate 容器执行（后端镜像内含 migrations + pg），不再从源码树跑。
# `run --rm` 前台同步、退出码直传，作为 CD 的迁移闸门；flip-current 时 api/worker 的 depends_on
# 会再触发一次 migrate，版本化迁移幂等（schema_migrations 无待跑项）故无副作用。
migrate() {
  run_compose run --rm migrate || die migrate_failed 70
}

publish_subcommand() {
  if [[ "$1" == revoke && ! -e "$PUBLICATION_STATE" && ! -e "$PUBLIC_MANIFEST" ]]; then
    # First release has no predecessor generation to revoke. It may proceed only
    # while Pages is already disabled and the old Funnel mapping is authoritatively
    # closed. Any one-file/mixed state is handled by the publisher and fails closed.
    local pages_state
    pages_state="$(curl --fail --silent --show-error --max-time 20 https://miaole.github.io/meetwise/preview-link-state.json \
      | /usr/bin/node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{const v=JSON.parse(s);if(v.state!=="disabled")process.exit(1);process.stdout.write(v.state)})')" \
      || die first_release_pages_not_disabled 70
    [[ "$pages_state" == disabled ]] || die first_release_pages_not_disabled 70
    /usr/local/sbin/full-stack-preview-funnel-close || die first_release_edge_not_closed 70
    echo first_release_no_predecessor
    return
  fi
  "$PUBLICATION" "$1" || die "publication_$1_failed" 70
  # install-full-stack-runtime.sh removes the staging gate right after publish so
  # the following activate() can bring web back up in public mode. Mirror that here.
  if [[ "$1" == publish ]]; then
    rm -f /var/lib/meetwise-preview-controller/full-stack-internal-staging.json
    sync -f /var/lib/meetwise-preview-controller
  fi
}

# compose 单机：flip = 重指 current 符号链接（db-verify/target-inspect 从新 release 解析 pg）
# + 启动新 api/worker 容器。web 仍在停（等 activate），避免「旧 web 打新 api」的过渡窗口。
flip_current() {
  local dir; dir="$(with_release_cwd "$1")"
  local previous_target='' active_legacy=() managed_legacy=() unit load_state
  if [[ -L "$CURRENT" ]]; then previous_target="$(readlink "$CURRENT")"; fi
  # One-time ownership transfer: legacy host units must be physically inactive
  # before Compose can bind 8787/3000 or run a Worker. The public edge has already
  # been revoked by the workflow; on failure we restore the prior owner.
  for unit in meetwise-api.service meetwise-worker.service meetwise-web.service; do
    load_state="$(timeout --kill-after=1s 5s systemctl show --property=LoadState --value "$unit")" || die legacy_unit_query_failed 70
    if [[ "$load_state" == loaded ]]; then
      managed_legacy+=("$unit")
      if systemctl is-active --quiet "$unit"; then active_legacy+=("$unit"); fi
      timeout --kill-after=2s 30s systemctl stop "$unit" || die legacy_unit_stop_failed 70
      [[ "$(systemctl is-active "$unit" 2>/dev/null || true)" == inactive ]] || die legacy_unit_still_active 70
    elif [[ "$load_state" != not-found ]]; then
      die legacy_unit_state_invalid 70
    fi
  done
  for unit in "${managed_legacy[@]}"; do
    if ! systemctl disable "$unit" >/dev/null 2>&1 \
      || [[ "$(systemctl is-active "$unit" 2>/dev/null || true)" != inactive ]] \
      || [[ "$(systemctl is-enabled "$unit" 2>/dev/null || true)" != disabled ]] \
      || ! legacy_unit_has_no_activation_edges "$unit" \
      || ! legacy_unit_has_no_dbus_activation "$unit"; then
      for unit in "${active_legacy[@]}"; do systemctl enable "$unit" >/dev/null 2>&1 || true; systemctl start "$unit" || true; done
      die legacy_unit_ownership_transfer_failed 70
    fi
  done
  ln -sfn "releases/$1" "$CURRENT.new"
  mv -Tf "$CURRENT.new" "$CURRENT"
  if ! run_compose up -d api worker; then
    restore_flip_predecessor "$previous_target" || die predecessor_restore_failed 70
    die compose_up_backend_failed 70
  fi
  local ready=0
  for _ in $(seq 1 60); do
    if curl --fail --silent --max-time 2 http://127.0.0.1:8787/readyz/api >/dev/null \
      && run_compose exec -T worker node -e "fetch('http://127.0.0.1:9091/readyz/worker').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
      ready=1; break
    fi
    sleep 2
  done
  if [[ "$ready" -ne 1 ]]; then
    restore_flip_predecessor "$previous_target" || die predecessor_restore_failed 70
    die compose_backend_not_ready 70
  fi
  rm -f "$COMPOSE_ENV_ROLLBACK" "$COMPOSE_ROLLBACK_MARKER"
  sync -f "$COMPOSE_DIR"
  echo flip_current_ok
}

synthetic_verify() {
  local release="$1" dir; dir="$(with_release_cwd "$release")"
  [[ -f "$SYNTHETIC_LOADER" && ! -L "$SYNTHETIC_LOADER" ]] || die trusted_loader_missing
  [[ -f "$DEEP_USAGE_RUNNER" && ! -L "$DEEP_USAGE_RUNNER" ]] || die trusted_deep_runner_missing
  [[ -f "$VERIFIER_ENV" && ! -L "$VERIFIER_ENV" && -f "$PREVIEW_ACCOUNT_ENV" && ! -L "$PREVIEW_ACCOUNT_ENV" ]] || die synthetic_runtime_env_missing
  [[ "$(stat -c '%U:%G:%a' "$VERIFIER_ENV")" == root:meetwise-synthetic:640 && "$(stat -c '%U:%G:%a' "$PREVIEW_ACCOUNT_ENV")" == root:meetwise-synthetic:640 ]] || die synthetic_runtime_env_unsafe
  # Both programs are installed controller code whose live digest is checked
  # before any release mutation. Candidate release JavaScript never receives a
  # database URL. The only database connection is the dedicated read-only
  # verifier contract; B/C credentials enter solely via a root-owned env file.
  local synth_home=/var/lib/meetwise-preview-synthetic
  local synth_run='set -a; . /etc/meetwise/full-stack-verifier.env; . /etc/meetwise/preview-test-accounts.env; set +a; exec /usr/bin/node "$0" run --profile "$1" --dataset-id "$2"'
  local showcase_json successor_json
  showcase_json="$(/usr/sbin/runuser -u meetwise-synthetic -- /usr/bin/env -i \
    "HOME=$synth_home" 'PATH=/usr/sbin:/usr/bin:/sbin:/bin' \
    /bin/bash -c "$synth_run" "$SYNTHETIC_LOADER" showcase-v1 preview-showcase-v1)" || die synthetic_showcase_failed 70
  successor_json="$(/usr/sbin/runuser -u meetwise-synthetic -- /usr/bin/env -i \
    "HOME=$synth_home" 'PATH=/usr/sbin:/usr/bin:/sbin:/bin' \
    /bin/bash -c "$synth_run" "$SYNTHETIC_LOADER" large-v1-successor preview-large-v1-successor)" || die synthetic_successor_failed 70
  # Promote only the just-verified target-scoped bundle into the fixed
  # controller read paths.  Target directories remain immutable evidence for
  # N->N+1 re-attestation; no symlink or caller-controlled path is accepted.
  local bundle_rows
  bundle_rows="$(/usr/bin/node - "$successor_json" <<'NODE'
const raw = process.argv[2]; const value = JSON.parse(raw); const root = '/var/lib/meetwise-preview-synthetic/preview-large-v1-successor/';
if (!/^[a-f0-9]{64}$/.test(value.targetDigest ?? '') || !value.receiptPaths || value.targetStateDir !== value.receiptPaths.targetStateDir || !value.targetStateDir.startsWith(`${root}.target-`)) process.exit(1);
for (const [key, name] of [['manifestPath','manifest.json'],['verificationPath','verification.json'],['preDbVerificationPath','pre-db-verification.json'],['postDbVerificationPath','post-db-verification.json'],['maintenancePath','maintenance.json'],['receiptBundlePath','receipt-bundle.json']]) {
  const path = value.receiptPaths[key]; if (path !== `${value.targetStateDir}/${name}` || path.includes('\n') || path.includes('\r')) process.exit(1); process.stdout.write(`${path}|${root}${name}\n`);
}
NODE
  )" || die synthetic_receipt_bundle_invalid 70
  while IFS='|' read -r scoped canonical; do
    [[ -f "$scoped" && ! -L "$scoped" && "$canonical" == /var/lib/meetwise-preview-synthetic/preview-large-v1-successor/* ]] || die synthetic_receipt_bundle_invalid 70
    install -o meetwise-synthetic -g meetwise-synthetic -m 0600 "$scoped" "$canonical"
  done <<< "$bundle_rows"
  [[ -f "$SHOWCASE_ENTITLEMENT" && ! -L "$SHOWCASE_ENTITLEMENT" ]] || die preview_entitlement_controller_missing
  /usr/bin/node "$SHOWCASE_ENTITLEMENT" --mode write >/dev/null || die preview_entitlement_grant_failed 70
  local target_digest release_identity
  target_digest="$(/usr/bin/node -e 'const {createHash}=require("node:crypto");const fs=require("node:fs");const canonical=v=>Array.isArray(v)?`[${v.map(canonical).join(",")}]`:v&&typeof v==="object"?`{${Object.keys(v).sort().map(k=>`${JSON.stringify(k)}:${canonical(v[k])}`).join(",")}}`:JSON.stringify(v);const v=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));process.stdout.write(createHash("sha256").update(canonical(v)).digest("hex"))' "$TARGET")" || die deep_usage_target_digest_failed
  release_identity="$(/usr/bin/node -e 'const v=require(process.argv[1]);if(!/^[a-f0-9]{40}$/.test(v.commit??"")||!/^[a-f0-9]{40}$/.test(v.tree??""))process.exit(1);process.stdout.write(`${v.commit}:${v.tree}`)' "$APPROVAL")" || die deep_usage_release_identity_failed
  [[ "$target_digest" =~ $DIGEST_RE && "$release_identity" =~ ^[a-f0-9]{40}:[a-f0-9]{40}$ ]] || die deep_usage_release_binding_invalid
  local deep_run='set -a; . /etc/meetwise/preview-test-accounts.env; set +a; export PREVIEW_API_BASE_URL=http://127.0.0.1:8787 PREVIEW_SCENARIO_STATE=/var/lib/meetwise-preview-synthetic/preview-deep-usage-v1/scenario.json PREVIEW_TARGET_DIGEST="$1" PREVIEW_RELEASE_IDENTITY="$2"; exec /usr/bin/node "$0" run'
  /usr/sbin/runuser -u meetwise-synthetic -- /usr/bin/env -i \
    "HOME=$synth_home" 'PATH=/usr/sbin:/usr/bin:/sbin:/bin' \
    /bin/bash -c "$deep_run" "$DEEP_USAGE_RUNNER" "$target_digest" "$release_identity" || die deep_usage_verify_failed 70
  local deep_scoped=/var/lib/meetwise-preview-synthetic/preview-deep-usage-v1/scenario.json.target-${target_digest}-
  deep_scoped+="$(printf '%s' "$release_identity" | sha256sum | awk '{print substr($1,1,16)}')"
  [[ -f "$deep_scoped" && ! -L "$deep_scoped" ]] || die deep_usage_scoped_receipt_missing 70
  install -o meetwise-synthetic -g meetwise-synthetic -m 0600 "$deep_scoped" /var/lib/meetwise-preview-synthetic/preview-deep-usage-v1/scenario.json
  # Re-attest after the controlled deep sessions consume their units. The
  # publication receipt must bind the live balance and retain at least three
  # starts for an interviewer using the public preview.
  /usr/bin/node "$SHOWCASE_ENTITLEMENT" --mode write >/dev/null || die preview_entitlement_post_deep_attestation_failed 70
}

probe_nonce() {
  /usr/bin/node "$PUBLISHER" probe-nonce || die probe_nonce_failed 70
}

confirm_public() {
  # The external receipt was staged by meetwise-cd into its incoming dir; validate
  # its shape before promoting it to the root path the publisher reads.
  local receipt="$INCOMING/receipt.json"
  assert_incoming_file "$receipt"
  /usr/bin/node - "$receipt" <<'NODE' || die receipt_schema_invalid
const { readFileSync } = require('node:fs');
const receipt = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$/;
const DIGEST_RE = /^[a-f0-9]{64}$/;
const PAGE_PATHS = new Set(['/dashboard', '/interviews', '/jobs', '/resume', '/settings', '/privacy', '/recruiter/jobs', '/recruiter/talent']);
const HEADER_NAMES = new Set(['content-type', 'cache-control']);
const exactKeys = (value, expected, label) => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify([...expected].sort())) throw new Error(`${label}_keys_invalid`);
};
const digest = (value, label) => { if (!DIGEST_RE.test(value ?? '')) throw new Error(`${label}_digest_invalid`); };
const safeReason = (value, label) => { if (typeof value !== 'string' || value.length < 1 || value.length > 256 || /[\u0000-\u001f\u007f]/.test(value)) throw new Error(`${label}_reason_invalid`); };
exactKeys(receipt, ['schemaVersion', 'origin', 'probeNonce', 'checkedAt', 'manifestSha256', 'rootStatus', 'loginStatus', 'manifestStatus', 'rootUrl', 'loginUrl', 'manifestUrl', 'rootSha256', 'blackboxSha256', 'signingKeyId', 'verifier', 'e2e', 'signature'], 'receipt_v2');
if (receipt.schemaVersion !== 2 || !ORIGIN_RE.test(receipt.origin ?? '') || !DIGEST_RE.test(receipt.probeNonce ?? '') || !DIGEST_RE.test(receipt.manifestSha256 ?? '') || new Date(receipt.checkedAt).toISOString() !== receipt.checkedAt || receipt.signingKeyId !== 'probe-receipt-ed25519-v2') throw new Error('receipt_v2_binding_invalid');
if (receipt.rootStatus !== 200 || receipt.loginStatus !== 200 || receipt.manifestStatus !== 200 || receipt.rootUrl !== `${receipt.origin}/` || receipt.loginUrl !== `${receipt.origin}/login` || receipt.manifestUrl !== `${receipt.origin}/preview-release-manifest.json`) throw new Error('receipt_v2_surface_invalid');
if (!/^[A-Za-z0-9+/]+={0,2}$/.test(receipt.signature ?? '') || Buffer.from(receipt.signature, 'base64').length !== 64) throw new Error('receipt_v2_signature_invalid');
digest(receipt.rootSha256, 'receipt_v2_root');
digest(receipt.blackboxSha256, 'receipt_v2_blackbox');
exactKeys(receipt.verifier, ['repository', 'workflow', 'ref', 'commit', 'runId', 'sourceSha256', 'workflowSha256', 'packageLockSha256'], 'receipt_v2_verifier');
if (receipt.verifier.repository !== 'miaole/meetwise-deploy-control' || receipt.verifier.workflow !== 'verify-meetwise-public-origin' || receipt.verifier.ref !== 'refs/heads/main' || !/^[a-f0-9]{40}$/.test(receipt.verifier.commit ?? '') || !/^[0-9]+$/.test(receipt.verifier.runId ?? '')) throw new Error('receipt_v2_verifier_identity_invalid');
for (const [name, value] of [['source', receipt.verifier.sourceSha256], ['workflow', receipt.verifier.workflowSha256], ['package_lock', receipt.verifier.packageLockSha256]]) digest(value, `receipt_v2_verifier_${name}`);
const e2e = receipt.e2e; const redirect = e2e?.noCookieProtectedRedirect;
exactKeys(e2e, ['status', 'scope', 'complete', 'noCookieProtectedRedirect', 'accounts', 'sensitiveResponseBodies'], 'receipt_v2_e2e');
if (e2e.status !== 'passed_pages_only' || e2e.scope !== 'browser_auth_pages_only' || e2e.complete !== false || e2e.sensitiveResponseBodies !== 'not_stored' || !redirect) throw new Error('receipt_v2_e2e_invalid');
exactKeys(redirect, ['origin', 'pathname', 'search'], 'receipt_v2_redirect');
if (redirect.origin !== receipt.origin || redirect.pathname !== '/login' || redirect.search !== '?next=%2Fdashboard') throw new Error('receipt_v2_redirect_invalid');
exactKeys(e2e.accounts, ['candidate', 'recruiter'], 'receipt_v2_accounts');
for (const [role, loginPath] of [['candidate', '/dashboard'], ['recruiter', '/recruiter/jobs']]) {
  const account = e2e.accounts?.[role];
  exactKeys(account, ['role', 'accountEmailSha256', 'loginPath', 'sessionCookie', 'pages', 'roleBoundary', 'api', 'sse', 'worker', 'semanticAssertionCount'], `receipt_v2_${role}_account`);
  if (account.role !== role || account.loginPath !== loginPath) throw new Error('receipt_v2_account_invalid');
  digest(account.accountEmailSha256, 'receipt_v2_account');
  exactKeys(account.sessionCookie, ['httpOnly', 'secure', 'roleCookie'], `receipt_v2_${role}_session`);
  if (account.sessionCookie.httpOnly !== true || account.sessionCookie.secure !== true || account.sessionCookie.roleCookie !== role) throw new Error('receipt_v2_session_invalid');
  if (!Array.isArray(account.pages) || account.pages.length < 1) throw new Error('receipt_v2_pages_invalid');
  account.pages.forEach((page, index) => {
    exactKeys(page, ['path', 'status', 'headers', 'bodyHash', 'bodyStored', 'markerHashes', 'negativeMarkerHashes'], `receipt_v2_${role}_page_${index}`);
    if (!PAGE_PATHS.has(page.path) || page.status !== 200 || page.bodyStored !== false) throw new Error('receipt_v2_page_invalid');
    exactKeys(page.headers, Object.keys(page.headers).filter((key) => HEADER_NAMES.has(key)), `receipt_v2_${role}_page_${index}_headers`);
    for (const [name, value] of Object.entries(page.headers)) if (!HEADER_NAMES.has(name) || typeof value !== 'string' || !/^[\x20-\x7e]{1,256}$/.test(value)) throw new Error('receipt_v2_page_header_invalid');
    digest(page.bodyHash, 'receipt_v2_page');
    if (!Array.isArray(page.markerHashes) || !Array.isArray(page.negativeMarkerHashes) || page.markerHashes.length === 0) throw new Error('receipt_v2_page_semantic_invalid');
    for (const marker of [...page.markerHashes, ...page.negativeMarkerHashes]) digest(marker, 'receipt_v2_page_marker');
  });
  const boundary = account.roleBoundary;
  exactKeys(boundary, boundary?.status === 'verified' ? ['status', 'path', 'markerHashes'] : ['status', 'reason'], `receipt_v2_${role}_role_boundary`);
  if (boundary.status === 'verified') {
    if (boundary.path !== '/recruiter/jobs' || !Array.isArray(boundary.markerHashes) || boundary.markerHashes.length < 1) throw new Error('receipt_v2_role_boundary_invalid');
    boundary.markerHashes.forEach((marker) => digest(marker, 'receipt_v2_role_boundary_marker'));
  } else if (boundary.status === 'unproven') safeReason(boundary.reason, 'receipt_v2_role_boundary');
  else throw new Error('receipt_v2_role_boundary_invalid');
  for (const [name, value] of [['api', account.api], ['sse', account.sse], ['worker', account.worker]]) {
    exactKeys(value, ['status', 'reason'], `receipt_v2_${role}_${name}`);
    if (value.status !== 'unproven') throw new Error(`receipt_v2_${name}_overclaim`);
    safeReason(value.reason, `receipt_v2_${role}_${name}`);
  }
  if (!Number.isInteger(account.semanticAssertionCount) || account.semanticAssertionCount < 1) throw new Error('receipt_v2_semantic_count_invalid');
}
const text = JSON.stringify(receipt);
if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text) || /(?:password|authorization|set-cookie|bearer)\s*[:=]/i.test(text) || /"(?:password|authorization|cookie|set-cookie)"\s*:/i.test(text) || /\bbearer\s+[A-Za-z0-9._-]+/i.test(text)) throw new Error('receipt_v2_sensitive_value_invalid');
NODE
  local origin probe_nonce manifest_sha256
  origin="$(/usr/bin/node -e 'const r=require(process.argv[1]); process.stdout.write(r.origin)' "$receipt")" || die receipt_schema_invalid
  probe_nonce="$(/usr/bin/node -e 'const r=require(process.argv[1]); process.stdout.write(r.probeNonce)' "$receipt")"
  manifest_sha256="$(/usr/bin/node -e 'const r=require(process.argv[1]); process.stdout.write(r.manifestSha256)' "$receipt")"
  [[ "$origin" =~ $ORIGIN_RE && "$probe_nonce" =~ ^[a-f0-9]{64}$ && "$manifest_sha256" =~ $DIGEST_RE ]] || die receipt_field_invalid
  install -o root -g root -m 0600 "$receipt" "$VERIFICATION"
  # transaction_step already owns the controller flock and exported its fd;
  # invoking the wrapper would try to acquire the same lock through a second
  # open file description and fail busy. Call the trusted publisher directly.
  /usr/bin/node "$PUBLISHER" confirm-public || die publication_confirm_failed 70
}

controller_require_digest() {
  [[ "${1:-}" =~ $DIGEST_RE ]] || die controller_bundle_digest_invalid
}

controller_ensure_dir() {
  local path="$1" mode="$2"
  if [[ -e "$path" || -L "$path" ]]; then
    [[ -d "$path" && ! -L "$path" ]] || die controller_state_directory_invalid
    [[ "$(stat -c '%u:%g' "$path" 2>/dev/null || true)" == '0:0' ]] || die controller_state_owner_invalid
  else
    install -d -o root -g root -m "$mode" "$path"
  fi
}

controller_ensure_state_root() {
  controller_ensure_dir "$CONTROLLER_ROLLOUT_ROOT" 0700
  controller_ensure_dir "$CONTROLLER_ROLLOUT_SNAPSHOTS" 0700
  controller_ensure_dir "$CONTROLLER_ROLLOUT_TARGETS" 0700
}

controller_fsync_file() {
  /usr/bin/node - "$1" <<'NODE'
const { closeSync, constants, fsyncSync, lstatSync, openSync } = require('node:fs');
const path = process.argv[2];
const stat = lstatSync(path);
if (!stat.isFile() || stat.isSymbolicLink() || typeof constants.O_NOFOLLOW !== 'number') process.exit(1);
const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
try { fsyncSync(fd); } finally { closeSync(fd); }
NODE
}

controller_fsync_dir() {
  /usr/bin/node - "$1" <<'NODE'
const { closeSync, constants, fsyncSync, lstatSync, openSync } = require('node:fs');
const path = process.argv[2];
const stat = lstatSync(path);
if (!stat.isDirectory() || stat.isSymbolicLink()) process.exit(1);
const fd = openSync(path, constants.O_RDONLY | constants.O_DIRECTORY);
try { fsyncSync(fd); } finally { closeSync(fd); }
NODE
}

controller_live_readback() {
  local expected="${1:-}"
  /usr/bin/node - "$CONTROLLER_MANIFEST" "$expected" <<'NODE'
const { createHash } = require('node:crypto');
const { closeSync, constants, lstatSync, openSync, readFileSync } = require('node:fs');
const [manifestPath, expected] = process.argv.slice(2);
if (typeof constants.O_NOFOLLOW !== 'number') throw new Error('controller_o_nofollow_unavailable');
const source = require('node:fs').readFileSync(manifestPath, 'utf8');
if (!source.endsWith('\n')) throw new Error('controller_manifest_not_newline_terminated');
const rows = [];
for (const line of source.split('\n')) {
  if (!line || line.startsWith('#')) continue;
  const fields = line.split('|');
  if (fields.length !== 3) throw new Error('controller_manifest_shape_invalid');
  const [sourceName, destination, mode] = fields;
  if (!/^[A-Za-z0-9._/-]+$/.test(sourceName) || sourceName.includes('..') || !/^\/[A-Za-z0-9._/-]+$/.test(destination) || destination.includes('..') || !/^0[0-7]{3}$/.test(mode)) throw new Error('controller_manifest_value_invalid');
  const parentParts = destination.split('/').filter(Boolean);
  let parent = '/';
  for (const part of parentParts.slice(0, -1)) {
    parent += `${part}/`;
    const parentStat = lstatSync(parent);
    if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error('controller_destination_parent_invalid');
  }
  const stat = lstatSync(destination);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0) throw new Error('controller_destination_live_invalid');
  const actualMode = (stat.mode & 0o777).toString(8).padStart(3, '0');
  if (actualMode !== mode.slice(1)) throw new Error('controller_destination_mode_invalid');
  const fd = openSync(destination, constants.O_RDONLY | constants.O_NOFOLLOW);
  let bytes;
  try { bytes = readFileSync(fd); } finally { closeSync(fd); }
  const digest = createHash('sha256').update(bytes).digest('hex');
  rows.push(`${sourceName}|${destination}|${mode}|${digest}\n`);
}
const live = createHash('sha256').update(rows.join('')).digest('hex');
if (expected && live !== expected) throw new Error('controller_live_digest_mismatch');
process.stdout.write(live);
NODE
}

controller_copy_archive_root() {
  local source="$1" destination="$2" archive_digest="$3"
  /usr/bin/node - "$source" "$destination" "$archive_digest" <<'NODE'
const { createHash } = require('node:crypto');
const { closeSync, constants, fstatSync, fsyncSync, lstatSync, mkdirSync, openSync, readSync, writeSync, chownSync, chmodSync } = require('node:fs');
const [source, destination, expectedDigest] = process.argv.slice(2);
if (typeof constants.O_NOFOLLOW !== 'number') process.exit(1);
const sourceStat = lstatSync(source); if (!sourceStat.isFile() || sourceStat.isSymbolicLink() || sourceStat.size > 67108864) process.exit(1);
const input = openSync(source, constants.O_RDONLY | constants.O_NOFOLLOW);
const output = openSync(destination, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
const hash = createHash('sha256'); const buffer = Buffer.allocUnsafe(1024 * 1024); let total = 0;
try {
  while (true) { const count = readSync(input, buffer, 0, buffer.length, null); if (count === 0) break; total += count; if (total > 67108864) process.exit(1); hash.update(buffer.subarray(0, count)); let offset = 0; while (offset < count) offset += writeSync(output, buffer, offset, count - offset); }
  fsyncSync(output);
} finally { closeSync(input); closeSync(output); }
if (hash.digest('hex') !== expectedDigest || total !== sourceStat.size) process.exit(1);
chownSync(destination, 0, 0); chmodSync(destination, 0o600);
NODE
}

controller_stage_archive() {
  local bundle_digest="$1" archive_digest="$2" archive stage entries root_archive
  controller_require_digest "$bundle_digest"
  controller_require_digest "$archive_digest"
  controller_ensure_state_root
  archive="$INCOMING/controller-${bundle_digest}.tar.gz"
  [[ -f "$archive" && ! -L "$archive" ]] || die controller_archive_missing
  local expected_archive_owner
  expected_archive_owner="$(id -u meetwise-cd 2>/dev/null || printf 0):$(id -g meetwise-cd 2>/dev/null || printf 0):600"
  [[ "$expected_archive_owner" != 0:0:600 && "$(stat -c '%u:%g:%a' "$archive" 2>/dev/null || true)" == "$expected_archive_owner" ]] || die controller_archive_owner_invalid
  [[ "$(stat -c %s "$archive")" -le "$CONTROLLER_ARCHIVE_MAX" ]] || die controller_archive_too_large
  [[ "$(sha256sum "$archive" | awk '{print $1}')" == "$archive_digest" ]] || die controller_archive_digest_mismatch
  stage="$CONTROLLER_ROLLOUT_ROOT/staging-${bundle_digest}-$$"
  [[ ! -e "$stage" && ! -L "$stage" ]] || die controller_stage_conflict
  install -d -o root -g root -m 0700 "$stage"
  root_archive="$stage/archive.tar.gz"
  controller_copy_archive_root "$archive" "$root_archive" "$archive_digest" || die controller_archive_copy_failed
  entries="$stage/archive.entries"
  /usr/bin/tar -tzf "$root_archive" > "$entries" || die controller_archive_list_invalid
  chmod 0600 "$entries"
  local manifest_count=0 entry duplicate
  while IFS= read -r entry; do
    [[ -n "$entry" && "$entry" != /* && "$entry" != *$'\r'* && "$entry" != *$'\n'* && "$entry" != *..* && "$entry" != */ ]] || die controller_archive_entry_invalid
    case "$entry" in
      manifest.txt) manifest_count=$((manifest_count + 1)) ;;
      payload/*) [[ "$entry" != payload/ ]] || die controller_archive_entry_invalid ;;
      *) die controller_archive_entry_invalid ;;
    esac
  done < "$entries"
  duplicate="$(sort "$entries" | uniq -d)"
  [[ -z "$duplicate" && "$manifest_count" -eq 1 ]] || die controller_archive_entry_duplicate
  while IFS= read -r entry; do
    [[ "${entry:0:1}" == '-' ]] || die controller_archive_entry_type_invalid
  done < <(/usr/bin/tar -tvzf "$root_archive")
  /usr/bin/tar -xzf "$root_archive" --no-same-owner --same-permissions -C "$stage" || die controller_archive_extract_failed
  /usr/bin/node - "$CONTROLLER_MANIFEST" "$stage/manifest.txt" "$entries" "$stage" "$bundle_digest" <<'NODE' || die controller_archive_manifest_invalid
const { createHash } = require('node:crypto');
const { closeSync, constants, lstatSync, openSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const [basePath, candidatePath, entriesPath, stage, bundleDigest] = process.argv.slice(2);
const text = readFileSync(candidatePath, 'utf8');
if (!text.endsWith('\n') || text.includes('\r') || text.includes('\0')) throw new Error('manifest_bytes_invalid');
const digest = createHash('sha256').update(text).digest('hex');
if (digest !== bundleDigest) throw new Error('manifest_digest_invalid');
const parseBase = (raw) => raw.split('\n').filter((line) => line && !line.startsWith('#')).map((line) => {
  const fields = line.split('|'); if (fields.length !== 3) throw new Error('base_manifest_shape_invalid'); return fields;
});
const base = parseBase(readFileSync(basePath, 'utf8'));
const candidateLines = text.split('\n'); if (candidateLines.at(-1) !== '') throw new Error('candidate_manifest_newline_invalid'); candidateLines.pop(); if (candidateLines.some((line) => !line || line.startsWith('#'))) throw new Error('candidate_manifest_blank_or_comment');
const candidate = candidateLines.map((line) => { const fields = line.split('|'); if (fields.length !== 4) throw new Error('candidate_manifest_shape_invalid'); return fields; });
if (candidate.length !== base.length) throw new Error('candidate_manifest_closure_invalid');
const sources = new Set(); const destinations = new Set(); const expectedEntries = ['manifest.txt'];
for (let i = 0; i < base.length; i += 1) {
  const [baseSource, baseDestination, baseMode] = base[i];
  const [source, destination, mode, declaredHash] = candidate[i];
  if (source !== baseSource || destination !== baseDestination || mode !== baseMode || !/^[a-f0-9]{64}$/.test(declaredHash)) throw new Error('candidate_manifest_binding_invalid');
  if (sources.has(source) || destinations.has(destination)) throw new Error('candidate_manifest_duplicate');
  sources.add(source); destinations.add(destination);
  if (!/^[A-Za-z0-9._/-]+$/.test(source) || source.includes('..') || !/^\/[A-Za-z0-9._/-]+$/.test(destination) || destination.includes('..') || !/^0[0-7]{3}$/.test(mode)) throw new Error('candidate_manifest_value_invalid');
  const payload = join(stage, 'payload', source);
  const parts = payload.split('/').filter(Boolean); let parent = '/';
  for (const part of parts.slice(0, -1)) { parent += `${part}/`; const parentStat = lstatSync(parent); if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) throw new Error('payload_parent_invalid'); }
  const stat = lstatSync(payload);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0) throw new Error('payload_file_invalid');
  const actualMode = (stat.mode & 0o777).toString(8).padStart(3, '0');
  if (actualMode !== mode.slice(1)) throw new Error('payload_mode_invalid');
  const fd = openSync(payload, constants.O_RDONLY | constants.O_NOFOLLOW); let bytes; try { bytes = readFileSync(fd); } finally { closeSync(fd); }
  if (createHash('sha256').update(bytes).digest('hex') !== declaredHash) throw new Error('payload_hash_invalid');
  expectedEntries.push(`payload/${source}`);
}
const entries = readFileSync(entriesPath, 'utf8').split('\n').filter(Boolean);
const sorted = (values) => [...values].sort();
if (entries.length !== expectedEntries.length || sorted(entries).join('\n') !== sorted(expectedEntries).join('\n')) throw new Error('archive_manifest_closure_invalid');
NODE
  controller_fsync_file "$stage/manifest.txt" || die controller_stage_fsync_failed
  printf '%s\n' "$stage"
}

controller_syntax_check_tree() {
  local root_dir="$1" source destination mode payload
  while IFS='|' read -r source destination mode _declared_hash; do
    [[ -n "$source" ]] || continue
    payload="$root_dir/payload/$source"
    case "$source" in
      *.sh) /bin/bash -n "$payload" || die controller_candidate_shell_syntax_invalid ;;
      *.mjs) /usr/bin/node --check "$payload" >/dev/null || die controller_candidate_node_syntax_invalid ;;
    esac
  done < "$root_dir/manifest.txt"
}

controller_syntax_check_live() {
  local source destination mode
  while IFS='|' read -r source destination mode; do
    [[ -n "$source" ]] || continue
    case "$source" in
      *.sh) /bin/bash -n "$destination" || return 1 ;;
      *.mjs) /usr/bin/node --check "$destination" >/dev/null || return 1 ;;
    esac
  done < "$CONTROLLER_MANIFEST"
}

controller_snapshot_validate() {
  local snapshot="$1"
  [[ -d "$snapshot" && ! -L "$snapshot" && "$(stat -c '%u:%g:%a' "$snapshot" 2>/dev/null || true)" == '0:0:700' ]] || die controller_snapshot_invalid
  [[ -f "$snapshot/controller-manifest.txt" && ! -L "$snapshot/controller-manifest.txt" && "$(stat -c '%u:%g:%a' "$snapshot/controller-manifest.txt" 2>/dev/null || true)" == '0:0:600' && -f "$snapshot/snapshot.tsv" && ! -L "$snapshot/snapshot.tsv" && -f "$snapshot/version.tsv" && ! -L "$snapshot/version.tsv" && -d "$snapshot/files" && ! -L "$snapshot/files" ]] || die controller_snapshot_invalid
  /usr/bin/node - "$snapshot/controller-manifest.txt" "$snapshot" <<'NODE' || die controller_snapshot_invalid
const { createHash } = require('node:crypto');
const { lstatSync, readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');
const [manifestPath, snapshot] = process.argv.slice(2);
const manifestStat = lstatSync(manifestPath); if (!manifestStat.isFile() || manifestStat.isSymbolicLink() || manifestStat.uid !== 0 || manifestStat.gid !== 0 || (manifestStat.mode & 0o777) !== 0o600) throw new Error();
const base = readFileSync(manifestPath, 'utf8').split('\n').filter((line) => line && !line.startsWith('#')).map((line) => { const f = line.split('|'); if (f.length !== 3) throw new Error(); return f; });
const rows = readFileSync(join(snapshot, 'snapshot.tsv'), 'utf8').trimEnd().split('\n').filter(Boolean).map((line) => line.split('|'));
if (rows.length !== base.length) throw new Error();
const expectedFiles = [];
for (let i = 0; i < base.length; i += 1) {
  const [idx, status, mode, digest] = rows[i]; if (idx !== String(i) || !['present', 'missing'].includes(status)) throw new Error();
  if (status === 'present') {
    if (!/^\d{3,4}$/.test(mode) || !/^[a-f0-9]{64}$/.test(digest)) throw new Error();
    const file = join(snapshot, 'files', String(i)); const stat = lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) throw new Error();
    if (createHash('sha256').update(readFileSync(file)).digest('hex') !== digest) throw new Error();
    expectedFiles.push(String(i));
  } else if (mode !== '-' || digest !== '-') throw new Error();
}
const files = readdirSync(join(snapshot, 'files'));
if (files.some((file) => !/^(0|[1-9][0-9]*)$/.test(file))) throw new Error();
files.sort((a, b) => Number(a) - Number(b));
if (files.join('\n') !== expectedFiles.join('\n')) throw new Error();
const versionRows = readFileSync(join(snapshot, 'version.tsv'), 'utf8').trimEnd().split('\n').filter(Boolean);
if (versionRows.length !== 1) throw new Error(); const version = versionRows[0].split('|');
if (version[0] === 'present') { if (!/^[a-f0-9]{64}$/.test(version[1])) throw new Error(); const stat = lstatSync(join(snapshot, 'version')); if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600 || createHash('sha256').update(readFileSync(join(snapshot, 'version'))).digest('hex') !== version[1]) throw new Error(); }
else if (version[0] !== 'missing' || version.length !== 1 || files.includes('version')) throw new Error();
NODE
}

controller_snapshot_create() {
  local bundle_digest="$1" snapshot temporary source destination mode idx
  snapshot="$CONTROLLER_ROLLOUT_SNAPSHOTS/$bundle_digest"
  controller_require_digest "$bundle_digest"
  controller_ensure_state_root
  if [[ -e "$snapshot" || -L "$snapshot" ]]; then
    controller_snapshot_validate "$snapshot"
    printf '%s\n' "$snapshot"
    return
  fi
  temporary="$CONTROLLER_ROLLOUT_SNAPSHOTS/.${bundle_digest}.tmp-$$"
  [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_snapshot_conflict
  install -d -o root -g root -m 0700 "$temporary"
  install -d -o root -g root -m 0700 "$temporary/files"
  install -o root -g root -m 0600 "$CONTROLLER_MANIFEST" "$temporary/controller-manifest.txt"
  install -o root -g root -m 0600 /dev/null "$temporary/snapshot.tsv"
  idx=0
  while IFS='|' read -r source destination mode; do
    [[ -n "$source" && "$source" != \#* ]] || continue
    if [[ -e "$destination" || -L "$destination" ]]; then
      [[ -f "$destination" && ! -L "$destination" ]] || die controller_snapshot_destination_invalid
      [[ "$(stat -c '%u:%g' "$destination" 2>/dev/null || true)" == '0:0' ]] || die controller_snapshot_destination_owner_invalid
      local previous_mode previous_hash
      previous_mode="$(stat -c '%a' "$destination")"
      previous_hash="$(sha256sum "$destination" | awk '{print $1}')"
      install -o root -g root -m 0600 "$destination" "$temporary/files/$idx"
      printf '%s|present|%s|%s\n' "$idx" "$previous_mode" "$previous_hash" >> "$temporary/snapshot.tsv"
      controller_fsync_file "$temporary/files/$idx" || die controller_snapshot_fsync_failed
    else
      printf '%s|missing|-|-\n' "$idx" >> "$temporary/snapshot.tsv"
    fi
    idx=$((idx + 1))
  done < "$CONTROLLER_MANIFEST"
  if [[ -f "$CONTROLLER_VERSION" && ! -L "$CONTROLLER_VERSION" ]]; then
    [[ "$(stat -c '%u:%g:%a' "$CONTROLLER_VERSION" 2>/dev/null || true)" == '0:0:600' ]] || die controller_snapshot_version_invalid
    install -o root -g root -m 0600 "$CONTROLLER_VERSION" "$temporary/version"
    printf 'present|%s\n' "$(sha256sum "$CONTROLLER_VERSION" | awk '{print $1}')" > "$temporary/version.tsv"
  elif [[ -e "$CONTROLLER_VERSION" || -L "$CONTROLLER_VERSION" ]]; then
    die controller_snapshot_version_invalid
  else
    printf 'missing\n' > "$temporary/version.tsv"
  fi
  chown root:root "$temporary/snapshot.tsv" "$temporary/version.tsv"
  chmod 0600 "$temporary/snapshot.tsv" "$temporary/version.tsv"
  controller_fsync_file "$temporary/controller-manifest.txt" || die controller_snapshot_fsync_failed
  controller_fsync_file "$temporary/snapshot.tsv" || die controller_snapshot_fsync_failed
  controller_fsync_file "$temporary/version.tsv" || die controller_snapshot_fsync_failed
  [[ ! -e "$temporary/version" ]] || controller_fsync_file "$temporary/version" || die controller_snapshot_fsync_failed
  controller_fsync_dir "$temporary/files" || die controller_snapshot_fsync_failed
  controller_fsync_dir "$temporary" || die controller_snapshot_fsync_failed
  mv -T -- "$temporary" "$snapshot"
  controller_fsync_dir "$CONTROLLER_ROLLOUT_SNAPSHOTS" || die controller_snapshot_fsync_failed
  controller_snapshot_validate "$snapshot"
  printf '%s\n' "$snapshot"
}

controller_snapshot_live_readback() {
  local snapshot="$1"
  /usr/bin/node - "$snapshot/controller-manifest.txt" "$snapshot" <<'NODE'
const { createHash } = require('node:crypto');
const { closeSync, constants, lstatSync, openSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const [manifestPath, snapshot] = process.argv.slice(2);
if (typeof constants.O_NOFOLLOW !== 'number') throw new Error();
const base = readFileSync(manifestPath, 'utf8').split('\n').filter((line) => line && !line.startsWith('#')).map((line) => { const f = line.split('|'); if (f.length !== 3) throw new Error(); return f; });
const rows = readFileSync(join(snapshot, 'snapshot.tsv'), 'utf8').trimEnd().split('\n').filter(Boolean).map((line) => line.split('|'));
if (rows.length !== base.length) throw new Error();
for (let i = 0; i < base.length; i += 1) {
  const destination = base[i][1]; const [idx, status, mode, digest] = rows[i]; if (idx !== String(i)) throw new Error();
  const exists = (() => { try { return lstatSync(destination); } catch (error) { if (error.code === 'ENOENT') return null; throw error; } })();
  if (status === 'missing') { if (exists) throw new Error(); continue; }
  if (!exists || !exists.isFile() || exists.isSymbolicLink() || exists.uid !== 0 || exists.gid !== 0 || (exists.mode & 0o777).toString(8) !== mode) throw new Error();
  const fd = openSync(destination, constants.O_RDONLY | constants.O_NOFOLLOW); let bytes; try { bytes = readFileSync(fd); } finally { closeSync(fd); }
  if (createHash('sha256').update(bytes).digest('hex') !== digest) throw new Error();
}
const versionRow = readFileSync(join(snapshot, 'version.tsv'), 'utf8').trimEnd().split('\n'); if (versionRow.length !== 1) throw new Error(); const [versionStatus, versionDigest] = versionRow[0].split('|');
const currentVersion = (() => { try { const stat = lstatSync('/etc/meetwise/cd-controller-version'); if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) throw new Error(); const fd = openSync('/etc/meetwise/cd-controller-version', constants.O_RDONLY | constants.O_NOFOLLOW); let bytes; try { bytes = readFileSync(fd); } finally { closeSync(fd); } return { text: bytes.toString('utf8').trim(), digest: createHash('sha256').update(bytes).digest('hex') }; } catch (error) { if (error.code === 'ENOENT') return null; throw error; } })();
if (versionStatus === 'missing') { if (versionRow[0] !== 'missing' || currentVersion !== null) throw new Error(); } else if (versionStatus === 'present') { if (!/^[a-f0-9]{64}$/.test(versionDigest) || currentVersion === null || currentVersion.digest !== versionDigest) throw new Error(); } else throw new Error();
NODE
}

controller_restore_snapshot() {
  local snapshot="$1" source destination mode idx status stored_idx stored_mode stored_hash temporary
  controller_snapshot_validate "$snapshot"
  exec 8<"$snapshot/snapshot.tsv"
  idx=0
  while IFS='|' read -r source destination mode < <(grep -v '^#' "$snapshot/controller-manifest.txt"); do
    IFS='|' read -r stored_idx status stored_mode stored_hash <&8 || die controller_snapshot_invalid
    [[ "$stored_idx" == "$idx" ]] || die controller_snapshot_invalid
    if [[ "$status" == present ]]; then
      [[ -f "$snapshot/files/$idx" && ! -L "$snapshot/files/$idx" ]] || die controller_snapshot_invalid
      [[ ! -e "$destination" && ! -L "$destination" || -f "$destination" && ! -L "$destination" ]] || die controller_rollback_destination_invalid
      temporary="$destination.controller-rollback-$$"
      [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_rollback_temp_conflict
      install -o root -g root -m "$stored_mode" "$snapshot/files/$idx" "$temporary"
      controller_fsync_file "$temporary" || die controller_rollback_fsync_failed
      mv -Tf -- "$temporary" "$destination"
      controller_fsync_dir "$(dirname "$destination")" || die controller_rollback_fsync_failed
    else
      [[ ! -L "$destination" ]] || die controller_rollback_destination_invalid
      [[ ! -e "$destination" || -f "$destination" ]] || die controller_rollback_destination_invalid
      rm -f -- "$destination"
      controller_fsync_dir "$(dirname "$destination")" || die controller_rollback_fsync_failed
    fi
    idx=$((idx + 1))
  done
  exec 8<&-
  local version_status version_digest
  IFS='|' read -r version_status version_digest < "$snapshot/version.tsv"
  if [[ "$version_status" == present ]]; then
    [[ -f "$snapshot/version" && ! -L "$snapshot/version" ]] || die controller_snapshot_invalid
    temporary="$CONTROLLER_VERSION.controller-rollback-$$"
    [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_rollback_temp_conflict
    install -o root -g root -m 0600 "$snapshot/version" "$temporary"
    controller_fsync_file "$temporary" || die controller_rollback_fsync_failed
    mv -Tf -- "$temporary" "$CONTROLLER_VERSION"
    controller_fsync_dir "$(dirname "$CONTROLLER_VERSION")" || die controller_rollback_fsync_failed
  else
    [[ "$version_status" == missing ]] || die controller_snapshot_invalid
    [[ ! -L "$CONTROLLER_VERSION" ]] || die controller_rollback_destination_invalid
    rm -f -- "$CONTROLLER_VERSION"
    controller_fsync_dir "$(dirname "$CONTROLLER_VERSION")" || die controller_rollback_fsync_failed
  fi
}

controller_apply_stage() {
  local stage="$1" bundle_digest="$2" source destination mode declared_hash payload parent temporary
  while IFS='|' read -r source destination mode declared_hash; do
    [[ -n "$source" ]] || continue
    payload="$stage/payload/$source"
    parent="$(dirname "$destination")"
    [[ -d "$parent" && ! -L "$parent" ]] || die controller_destination_parent_missing
    [[ ! -L "$destination" ]] || die controller_destination_symlink
    temporary="$destination.controller-${bundle_digest}-$$"
    [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_install_temp_conflict
    install -o root -g root -m "$mode" "$payload" "$temporary"
    controller_fsync_file "$temporary" || die controller_install_fsync_failed
    mv -Tf -- "$temporary" "$destination"
    controller_fsync_dir "$parent" || die controller_install_fsync_failed
  done < "$stage/manifest.txt"
}

controller_write_version() {
  local bundle_digest="$1" temporary="$CONTROLLER_VERSION.controller-$$"
  [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_version_temp_conflict
  ( set -o noclobber; : > "$temporary" ) 2>/dev/null || die controller_version_temp_conflict
  printf '%s\n' "$bundle_digest" > "$temporary"
  chown root:root "$temporary"; chmod 0600 "$temporary"
  controller_fsync_file "$temporary" || die controller_version_fsync_failed
  mv -Tf -- "$temporary" "$CONTROLLER_VERSION"
  controller_fsync_dir "$(dirname "$CONTROLLER_VERSION")" || die controller_version_fsync_failed
}

controller_write_receipt() {
  local bundle_digest="$1" archive_digest="$2" stage="$3" snapshot="$4" target temporary
  target="$CONTROLLER_ROLLOUT_TARGETS/$bundle_digest"
  controller_ensure_state_root
  if [[ -e "$target" || -L "$target" ]]; then
    [[ -d "$target" && ! -L "$target" && "$(stat -c '%u:%g:%a' "$target" 2>/dev/null || true)" == '0:0:700' ]] || die controller_receipt_target_invalid
    [[ -f "$target/manifest.txt" && ! -L "$target/manifest.txt" && -f "$target/receipt.json" && ! -L "$target/receipt.json" ]] || die controller_receipt_target_partial
    /usr/bin/node - "$target/receipt.json" "$bundle_digest" "$archive_digest" "$target" "$snapshot" <<'NODE' || die controller_receipt_binding_invalid
const { createHash } = require('node:crypto'); const { lstatSync, readFileSync } = require('node:fs');
const [receiptPath, bundle, archive, target, snapshot] = process.argv.slice(2); const stat = lstatSync(receiptPath); if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) process.exit(1);
const manifestPath = `${target}/manifest.txt`; const manifestStat = lstatSync(manifestPath); if (!manifestStat.isFile() || manifestStat.isSymbolicLink() || manifestStat.uid !== 0 || manifestStat.gid !== 0 || (manifestStat.mode & 0o777) !== 0o600 || createHash('sha256').update(readFileSync(manifestPath)).digest('hex') !== bundle) process.exit(1);
const value = JSON.parse(readFileSync(receiptPath, 'utf8')); if (value.schemaVersion !== 1 || value.bundleDigest !== bundle || value.archiveDigest !== archive || value.targetStateDir !== target || value.snapshotDir !== snapshot || value.manifestPath !== manifestPath || value.receiptBundlePath !== receiptPath) process.exit(1);
NODE
  else
    install -d -o root -g root -m 0700 "$target"
    install -o root -g root -m 0600 "$stage/manifest.txt" "$target/manifest.txt"
    temporary="$target/receipt.json.tmp-$$"
    /usr/bin/node - "$temporary" "$bundle_digest" "$archive_digest" "$target" "$snapshot" <<'NODE'
const { closeSync, constants, fsyncSync, openSync, writeFileSync, chownSync, chmodSync, renameSync } = require('node:fs');
const [temporary, bundleDigest, archiveDigest, targetStateDir, snapshotDir] = process.argv.slice(2); const receiptBundlePath = `${targetStateDir}/receipt.json`;
writeFileSync(temporary, `${JSON.stringify({ schemaVersion: 1, bundleDigest, archiveDigest, targetStateDir, snapshotDir, manifestPath: `${targetStateDir}/manifest.txt`, receiptBundlePath })}\n`, { flag: 'wx', mode: 0o600 });
const fd = openSync(temporary, constants.O_RDONLY | constants.O_NOFOLLOW); try { fsyncSync(fd); } finally { closeSync(fd); }
chownSync(temporary, 0, 0); chmodSync(temporary, 0o600); renameSync(temporary, receiptBundlePath);
const dirFd = openSync(targetStateDir, constants.O_RDONLY | constants.O_DIRECTORY); try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
NODE
    controller_fsync_file "$target/manifest.txt" || die controller_receipt_fsync_failed
  fi
  printf 'controllerReceiptBundlePath=%s\ncontrollerStateDir=%s\n' "$target/receipt.json" "$target"
}

controller_write_ledger() {
  local status="$1" bundle_digest="$2" snapshot="$3" receipt_path="${4:-}" temporary="$CONTROLLER_ROLLOUT_LEDGER.tmp-$$"
  [[ "$status" == installing || "$status" == recovered || "$status" == complete ]] || die controller_ledger_status_invalid
  controller_require_digest "$bundle_digest"
  [[ "$snapshot" == "$CONTROLLER_ROLLOUT_SNAPSHOTS/$bundle_digest" && "$snapshot" != *..* && ! -L "$snapshot" ]] || die controller_ledger_snapshot_invalid
  [[ "$status" != installing || -d "$snapshot" ]] || die controller_ledger_snapshot_invalid
  [[ ! -e "$temporary" && ! -L "$temporary" ]] || die controller_ledger_temp_conflict
  /usr/bin/node - "$temporary" "$status" "$bundle_digest" "$snapshot" "$receipt_path" <<'NODE'
const { closeSync, chmodSync, chownSync, constants, fsyncSync, openSync, renameSync, writeFileSync } = require('node:fs');
const [temporary, status, bundleDigest, snapshotDir, receiptBundlePath] = process.argv.slice(2);
const value = { schemaVersion: 1, status, bundleDigest, snapshotDir, ...(receiptBundlePath ? { receiptBundlePath } : {}) };
writeFileSync(temporary, `${JSON.stringify(value)}\n`, { flag: 'wx', mode: 0o600 });
const fd = openSync(temporary, constants.O_RDONLY | constants.O_NOFOLLOW); try { fsyncSync(fd); } finally { closeSync(fd); }
chownSync(temporary, 0, 0); chmodSync(temporary, 0o600); renameSync(temporary, '/var/lib/meetwise-preview-controller/controller-rollout/rollout-ledger.json');
const dirFd = openSync('/var/lib/meetwise-preview-controller/controller-rollout', constants.O_RDONLY | constants.O_DIRECTORY); try { fsyncSync(dirFd); } finally { closeSync(dirFd); }
NODE
}

controller_recover_pending() {
  local requested_action="${1:-}"
  if [[ ! -e "$CONTROLLER_ROLLOUT_LEDGER" && ! -L "$CONTROLLER_ROLLOUT_LEDGER" ]]; then return 0; fi
  [[ -f "$CONTROLLER_ROLLOUT_LEDGER" && ! -L "$CONTROLLER_ROLLOUT_LEDGER" ]] || die controller_ledger_invalid
  [[ "$(stat -c '%u:%g:%a' "$CONTROLLER_ROLLOUT_LEDGER" 2>/dev/null || true)" == '0:0:600' ]] || die controller_ledger_invalid
  local ledger status bundle_digest snapshot
  ledger="$(/usr/bin/node - "$CONTROLLER_ROLLOUT_LEDGER" <<'NODE'
const { lstatSync, readFileSync } = require('node:fs');
const path = process.argv[2]; const stat = lstatSync(path); if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) process.exit(1);
const value = JSON.parse(readFileSync(path, 'utf8')); if (value.schemaVersion !== 1 || !['installing', 'recovered', 'complete'].includes(value.status) || !/^[a-f0-9]{64}$/.test(value.bundleDigest ?? '') || value.snapshotDir !== `/var/lib/meetwise-preview-controller/controller-rollout/snapshots/${value.bundleDigest}` || (value.receiptBundlePath !== undefined && typeof value.receiptBundlePath !== 'string')) process.exit(1);
process.stdout.write(JSON.stringify(value));
NODE
  )" || die controller_ledger_invalid
  status="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).status)' "$ledger")"
  [[ "$status" == installing ]] || return 0
  bundle_digest="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).bundleDigest)' "$ledger")"
  snapshot="$(/usr/bin/node -e 'process.stdout.write(JSON.parse(process.argv[1]).snapshotDir)' "$ledger")"
  [[ "$snapshot" == "$CONTROLLER_ROLLOUT_SNAPSHOTS/$bundle_digest" ]] || die controller_ledger_snapshot_invalid
  with_controller_lock
  controller_restore_snapshot "$snapshot" || die controller_pending_recovery_failed 70
  controller_snapshot_live_readback "$snapshot" || die controller_pending_recovery_readback_failed 70
  controller_write_ledger recovered "$bundle_digest" "$snapshot"
  flock -u 9
  exec 9>&-
  printf 'controllerPendingRecovery=bundle:%s\n' "$bundle_digest" >&2
  [[ "$requested_action" == controller-recover ]] || exit 75
}

controller_assert_application_terminal() {
  if [[ ! -e "$FULL_STACK_LEDGER" && ! -L "$FULL_STACK_LEDGER" ]]; then return 0; fi
  [[ -f "$FULL_STACK_LEDGER" && ! -L "$FULL_STACK_LEDGER" ]] || die controller_application_ledger_invalid
  [[ "$(stat -c '%u:%g:%a' "$FULL_STACK_LEDGER" 2>/dev/null || true)" == '0:0:600' ]] || die controller_application_ledger_invalid
  local phase
  phase="$(/usr/bin/node - "$FULL_STACK_LEDGER" <<'NODE'
const { lstatSync, readFileSync } = require('node:fs');
const path = process.argv[2]; const stat = lstatSync(path); if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) process.exit(1);
const value = JSON.parse(readFileSync(path, 'utf8')); if (typeof value.phase !== 'string') process.exit(1); process.stdout.write(value.phase);
NODE
  )" || die controller_application_ledger_invalid
  case "$phase" in
    committed|rolled_back|forward_only_maintenance) ;;
    *) die controller_application_transaction_active 75 ;;
  esac
}

controller_install() {
  local bundle_digest="$1" archive_digest="$2" stage snapshot failed=0
  controller_require_digest "$bundle_digest"
  controller_require_digest "$archive_digest"
  with_controller_lock
  controller_assert_application_terminal
  stage="$(controller_stage_archive "$bundle_digest" "$archive_digest")" || die controller_stage_failed
  if [[ -f "$CONTROLLER_VERSION" && ! -L "$CONTROLLER_VERSION" && "$(tr -d '\n' < "$CONTROLLER_VERSION")" == "$bundle_digest" ]] && controller_live_readback "$bundle_digest" >/dev/null 2>&1; then
    controller_write_receipt "$bundle_digest" "$archive_digest" "$stage" "$CONTROLLER_ROLLOUT_SNAPSHOTS/$bundle_digest"
    rm -rf -- "$stage"
    printf 'controllerBundleDigest=%s\ncontrollerArchiveDigest=%s\n' "$bundle_digest" "$archive_digest"
    return
  fi
  controller_syntax_check_tree "$stage"
  snapshot="$(controller_snapshot_create "$bundle_digest")" || die controller_snapshot_failed
  controller_write_ledger installing "$bundle_digest" "$snapshot" || die controller_ledger_installing_failed 70
  if ! controller_apply_stage "$stage" "$bundle_digest"; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! nginx -t >/dev/null; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! systemctl daemon-reload; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! systemctl enable meetwise-cd-controller-rollout-recovery.service >/dev/null; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! systemctl is-enabled --quiet meetwise-cd-controller-rollout-recovery.service; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! controller_live_readback "$bundle_digest" >/dev/null; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! controller_write_version "$bundle_digest"; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! controller_syntax_check_live; then failed=1; fi
  if [[ "$failed" -eq 0 ]] && ! controller_live_readback "$bundle_digest" >/dev/null; then failed=1; fi
  if [[ "$failed" -ne 0 ]]; then
    controller_restore_snapshot "$snapshot" || die controller_rollback_failed 70
    controller_snapshot_live_readback "$snapshot" || die controller_rollback_readback_failed 70
    controller_write_ledger recovered "$bundle_digest" "$snapshot" || die controller_ledger_recovery_mark_failed 70
    die controller_install_rolled_back 70
  fi
  controller_write_receipt "$bundle_digest" "$archive_digest" "$stage" "$snapshot" || {
    controller_restore_snapshot "$snapshot" || die controller_rollback_failed 70
    controller_snapshot_live_readback "$snapshot" || die controller_rollback_readback_failed 70
    controller_write_ledger recovered "$bundle_digest" "$snapshot" || die controller_ledger_recovery_mark_failed 70
    die controller_receipt_failed 70
  }
  controller_write_ledger complete "$bundle_digest" "$snapshot" "$CONTROLLER_ROLLOUT_TARGETS/$bundle_digest/receipt.json" || {
    controller_restore_snapshot "$snapshot" || die controller_rollback_failed 70
    controller_snapshot_live_readback "$snapshot" || die controller_rollback_readback_failed 70
    controller_write_ledger recovered "$bundle_digest" "$snapshot" || die controller_ledger_recovery_mark_failed 70
    die controller_ledger_complete_failed 70
  }
  if ! /usr/local/sbin/meetwise-cd-root controller-version >/dev/null; then
    controller_write_ledger installing "$bundle_digest" "$snapshot" || die controller_ledger_installing_failed 70
    controller_restore_snapshot "$snapshot" || die controller_rollback_failed 70
    controller_snapshot_live_readback "$snapshot" || die controller_rollback_readback_failed 70
    controller_write_ledger recovered "$bundle_digest" "$snapshot" || die controller_ledger_recovery_mark_failed 70
    die controller_post_install_self_test_failed 70
  fi
  rm -rf -- "$stage"
  printf 'controllerBundleDigest=%s\ncontrollerArchiveDigest=%s\n' "$bundle_digest" "$archive_digest"
}

controller_version() {
  [[ -f "$CONTROLLER_VERSION" && ! -L "$CONTROLLER_VERSION" ]] || die controller_version_missing
  [[ "$(stat -c '%U:%G:%a' "$CONTROLLER_VERSION")" == 'root:root:600' ]] || die controller_version_unsafe
  local expected live
  expected="$(tr -d '\n' < "$CONTROLLER_VERSION")"
  [[ "$expected" =~ $DIGEST_RE ]] || die controller_version_invalid
  live="$(controller_live_readback "$expected")" || die controller_live_digest_mismatch
  [[ "$live" == "$expected" ]] || die controller_live_digest_mismatch
  printf '%s\n' "$live"
}

controller_recover_pending "${1:-}"

case "${1:-}" in
  transaction)       transaction_cmd "$@" ;;
  receive-source)    receive_source "${2:-}" "${3:-}" ;;
  install-deps)      install_deps "${2:-}" ;;
  discard-unclaimed-release)
    [[ $# -eq 2 ]] || die discard_release_argc_invalid
    discard_unclaimed_release "$2"
    ;;
  compose-pull)      die legacy_direct_compose_pull_disabled ;;
  prepare)           prepare "${2:-}" "${3:-}" "${4:-}" "${5:-}" "${6:-}" "${7:-}" "${8:-}" "${9:-}" "${10:-}" "${11:-}" ;;
  migrate)           migrate ;;
  revoke)            die legacy_direct_revoke_disabled ;;
  stage|publish|activate|verify-public) publish_subcommand "$1" ;;
  flip-current)      flip_current "${2:-}" ;;
  synthetic-verify)  synthetic_verify "${2:-}" ;;
  probe-nonce)       probe_nonce ;;
  bootstrap-toolchain)
    [[ $# -eq 1 ]] || die controller_argc_invalid
    with_controller_lock
    ensure_pnpm_toolchain ;;
  confirm-public)    die legacy_direct_confirm_disabled ;;
  receive-controller)
    [[ $# -eq 3 ]] || die controller_argc_invalid
    controller_require_digest "$2"; controller_require_digest "$3"
    # The receive phase only validates the already staged archive and leaves
    # installed destinations untouched. The second, explicit command performs
    # the root-owned snapshot/install/rollback transaction.
    received_stage="$(controller_stage_archive "$2" "$3")" || die controller_receive_validation_failed
    rm -rf -- "$received_stage"
    printf 'controllerReceivedBundleDigest=%s\ncontrollerArchiveDigest=%s\n' "$2" "$3"
    ;;
  install-controller)
    [[ $# -eq 3 ]] || die controller_argc_invalid
    controller_install "$2" "$3" ;;
  controller-recover)
    [[ $# -eq 1 ]] || die controller_argc_invalid
    printf 'controllerRecovery=none\n' ;;
  controller-version) controller_version ;;
  *) die unknown_subcommand ;;
esac
