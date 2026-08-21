#!/usr/bin/env bash
# Forced-command entry for the `meetwise-cd` account. Installed by
# provision-meetwise-cd.sh as
#   command="/usr/local/bin/meetwise-cd-receive",restrict
# in meetwise-cd's authorized_keys (`restrict` implies no-pty / no-*-forwarding /
# no-user-rc / no-X11 and auto-adopts any future restrictions), so ANY ssh session
# for this key runs this script instead of a shell. The caller's intent arrives in
# $SSH_ORIGINAL_COMMAND.
#
# This layer is the FIRST validation boundary (defense in depth #1). It:
#   - refuses an interactive shell (empty SSH_ORIGINAL_COMMAND),
#   - rejects shell metacharacters/quotes outright,
#   - whitelists the subcommand and validates arg shapes,
#   - stages bounded stdin-bearing source/probe/controller archives as regular files
#     into /var/lib/meetwise-cd/incoming/ as meetwise-cd,
#   - then `exec`s sudo to the root dispatch (defense in depth #2 re-validates).
set -euo pipefail
umask 077

ROOT_DISPATCH=/usr/local/sbin/meetwise-cd-root
INCOMING=/var/lib/meetwise-cd/incoming
CONTROLLER_ARCHIVE_MAX=67108864

RELEASE_RE='^[a-f0-9]{40}-fullstack-[0-9]{8}-[1-9][0-9]*-[1-9][0-9]*$'
COMMIT_RE='^[a-f0-9]{40}$'
DIGEST_RE='^[a-f0-9]{64}$'
IMAGE_DIGEST_RE='^sha256:[a-f0-9]{64}$'
ORIGIN_RE='^https://[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$'
TRANSACTION_ID_RE='^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'
TOKEN_RE='^[a-f0-9]{64}$'

cmd="${SSH_ORIGINAL_COMMAND:-}"
[[ -n "$cmd" ]] || { echo 'meetwise_cd_no_interactive_shell' >&2; exit 1; }

# No quotes/backslash/metacharacters can legitimately appear in a valid command.
# 镜像摘要里只有 sha256:<64hex>，冒号不在拒绝列表，仍可安全通过。
if [[ "$cmd" =~ [\"\'\;\&\|\>\<\\\$\`\(\)\{\}\!\*] ]]; then
  echo 'meetwise_cd_metacharacter_rejected' >&2; exit 1
fi

read -r -a argv <<< "$cmd"
# The workflow always sends a `meetwise-cd` namespace prefix (see deploy-full-stack.yml),
# so argv[0] is that prefix and the REAL subcommand is argv[1]. Reject any command that
# does not carry the expected prefix — a hand-crafted exec must not reach the whitelist.
[[ "${argv[0]:-}" == meetwise-cd ]] || { echo 'meetwise_cd_unknown_command' >&2; exit 1; }
sub="${argv[1]:-}"

valid_release() { [[ "$1" =~ $RELEASE_RE ]]; }

require_release() {
  local release="$1"
  valid_release "$release" || { echo 'meetwise_cd_release_invalid' >&2; exit 1; }
}

require_digest_pair() {
  [[ "$1" =~ $DIGEST_RE && "$2" =~ $DIGEST_RE ]] || { echo 'meetwise_cd_controller_digest_invalid' >&2; exit 1; }
}

assert_incoming_dir() {
  [[ -d "$INCOMING" && ! -L "$INCOMING" ]] || { echo 'meetwise_cd_incoming_invalid' >&2; exit 1; }
  [[ "$(stat -c '%a' "$INCOMING" 2>/dev/null || true)" == 700 ]] || { echo 'meetwise_cd_incoming_mode_invalid' >&2; exit 1; }
}

fsync_regular_file() {
  /usr/bin/node - "$1" <<'NODE'
const { closeSync, constants, fsyncSync, lstatSync, openSync } = require('node:fs');
const path = process.argv[2];
const stat = lstatSync(path);
if (!stat.isFile() || stat.isSymbolicLink() || typeof constants.O_NOFOLLOW !== 'number') process.exit(1);
const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
try { fsyncSync(fd); } finally { closeSync(fd); }
NODE
}

fsync_directory() {
  /usr/bin/node - "$1" <<'NODE'
const { closeSync, constants, fsyncSync, lstatSync, openSync } = require('node:fs');
const path = process.argv[2];
const stat = lstatSync(path);
if (!stat.isDirectory() || stat.isSymbolicLink()) process.exit(1);
const fd = openSync(path, constants.O_RDONLY | constants.O_DIRECTORY);
try { fsyncSync(fd); } finally { closeSync(fd); }
NODE
}

receive_controller_bundle() {
  local bundle_digest="$1" archive_digest="$2" destination temporary
  require_digest_pair "$bundle_digest" "$archive_digest"
  assert_incoming_dir
  destination="$INCOMING/controller-${bundle_digest}.tar.gz"
  temporary="$INCOMING/controller-${bundle_digest}.tar.gz.tmp-$$"
  ( set -o noclobber; : > "$temporary" ) 2>/dev/null || { echo 'meetwise_cd_controller_temp_conflict' >&2; exit 1; }
  trap 'rm -f -- "$temporary"' EXIT
  timeout 120s head -c $((CONTROLLER_ARCHIVE_MAX + 1)) > "$temporary"
  [[ "$(stat -c %s "$temporary" 2>/dev/null || true)" -le "$CONTROLLER_ARCHIVE_MAX" ]] || { echo 'meetwise_cd_controller_archive_too_large' >&2; exit 1; }
  chmod 0600 "$temporary"
  [[ "$(sha256sum "$temporary" | awk '{print $1}')" == "$archive_digest" ]] || { echo 'meetwise_cd_controller_archive_digest_mismatch' >&2; exit 1; }
  fsync_regular_file "$temporary" || { echo 'meetwise_cd_controller_archive_fsync_failed' >&2; exit 1; }
  if [[ -e "$destination" || -L "$destination" ]]; then
    [[ -f "$destination" && ! -L "$destination" && "$(stat -c '%a' "$destination" 2>/dev/null || true)" == 600 && "$(sha256sum "$destination" | awk '{print $1}')" == "$archive_digest" ]] || { echo 'meetwise_cd_controller_identity_conflict' >&2; exit 1; }
    rm -f -- "$temporary"
  else
    mv -T -- "$temporary" "$destination"
    fsync_directory "$INCOMING" || { echo 'meetwise_cd_controller_directory_fsync_failed' >&2; exit 1; }
  fi
  trap - EXIT
  exec sudo "$ROOT_DISPATCH" receive-controller "$bundle_digest" "$archive_digest"
}

assert_incoming_dir

case "$sub" in
  receive-controller)
    [[ ${#argv[@]} -eq 4 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    receive_controller_bundle "${argv[2]}" "${argv[3]}"
    ;;
  install-controller)
    [[ ${#argv[@]} -eq 4 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    require_digest_pair "${argv[2]}" "${argv[3]}"
    exec sudo "$ROOT_DISPATCH" install-controller "${argv[2]}" "${argv[3]}" </dev/null
    ;;
  receive-source)
    require_release "${argv[2]:-}"
    [[ ${#argv[@]} -eq 4 && "${argv[3]}" =~ $DIGEST_RE ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    # Source tarball arrives on stdin (git archive, gzipped). Stage it as meetwise-cd;
    # the root dispatch validates ownership before extracting.
    # Hard ceiling prevents a stolen deploy key from filling the ECS disk.
    temporary="$INCOMING/${argv[2]}.tar.gz.tmp-$$"
    ( set -o noclobber; : > "$temporary" ) 2>/dev/null || { echo 'meetwise_cd_source_temp_conflict' >&2; exit 1; }
    trap 'rm -f -- "$temporary"' EXIT
    timeout 120s head -c 268435457 > "$temporary"
    [[ "$(stat -c %s "$temporary")" -le 268435456 ]] || { echo 'meetwise_cd_source_too_large' >&2; exit 1; }
    [[ "$(sha256sum "$temporary" | awk '{print $1}')" == "${argv[3]}" ]] || { echo 'meetwise_cd_source_digest_mismatch' >&2; exit 1; }
    if [[ -e "$INCOMING/${argv[2]}.tar.gz" ]]; then
      [[ -f "$INCOMING/${argv[2]}.tar.gz" && ! -L "$INCOMING/${argv[2]}.tar.gz" && "$(sha256sum "$INCOMING/${argv[2]}.tar.gz" | awk '{print $1}')" == "${argv[3]}" ]] || { echo 'meetwise_cd_source_identity_conflict' >&2; exit 1; }
      rm -f -- "$temporary"
    else
      mv -T "$temporary" "$INCOMING/${argv[2]}.tar.gz"
    fi
    trap - EXIT
    exec sudo "$ROOT_DISPATCH" receive-source "${argv[2]}" "${argv[3]}"
    ;;
  install-deps)
    require_release "${argv[2]:-}"
    [[ ${#argv[@]} -eq 3 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    exec sudo "$ROOT_DISPATCH" "$sub" "${argv[2]}"
    ;;
  discard-unclaimed-release)
    [[ ${#argv[@]} -eq 3 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    require_release "${argv[2]}"
    exec sudo "$ROOT_DISPATCH" discard-unclaimed-release "${argv[2]}"
    ;;
  prepare)
    # Prepare is transaction-bound: the root dispatcher reads the durable
    # ledger and owns the controller flock.  There is intentionally no
    # standalone commit/tree/release form that could mint an approval without
    # a recovery token and the post-migration phase fence.
    [[ ${#argv[@]} -eq 12 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    [[ "${argv[2]}" =~ $TRANSACTION_ID_RE && "${argv[3]}" =~ $RELEASE_RE && "${argv[4]}" =~ $TOKEN_RE && "${argv[5]}" =~ $COMMIT_RE && "${argv[6]}" =~ $COMMIT_RE && "${argv[7]}" =~ $ORIGIN_RE && "${argv[8]}" =~ $DIGEST_RE && "${argv[9]}" =~ $DIGEST_RE && "${argv[10]}" =~ $IMAGE_DIGEST_RE && "${argv[11]}" =~ $IMAGE_DIGEST_RE ]] || { echo 'meetwise_cd_prepare_arg_invalid' >&2; exit 1; }
    exec sudo "$ROOT_DISPATCH" prepare "${argv[2]}" "${argv[3]}" "${argv[4]}" "${argv[5]}" "${argv[6]}" "${argv[7]}" "${argv[8]}" "${argv[9]}" "${argv[10]}" "${argv[11]}"
    ;;
  probe-nonce|verify-public|controller-version|bootstrap-toolchain)
    [[ ${#argv[@]} -eq 2 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
    exec sudo "$ROOT_DISPATCH" "$sub"
    ;;
  transaction)
    action="${argv[2]:-}"
    case "$action" in
      begin)
        [[ ${#argv[@]} -eq 14 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $COMMIT_RE && "${argv[6]}" =~ $COMMIT_RE && "${argv[7]}" =~ $TOKEN_RE && "${argv[8]}" =~ $DIGEST_RE && "${argv[9]}" =~ $DIGEST_RE && "${argv[10]}" =~ $DIGEST_RE && "${argv[11]}" =~ $IMAGE_DIGEST_RE && "${argv[12]}" =~ $IMAGE_DIGEST_RE && "${argv[13]}" =~ $ORIGIN_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      snapshot|revoke-predecessor|close-edge|quiesce|migrate|start-backend|start-web-internal|verify-data|publish-probe|activate)
        [[ ${#argv[@]} -eq 6 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      compose-pull)
        [[ ${#argv[@]} -eq 8 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE && "${argv[6]}" =~ $IMAGE_DIGEST_RE && "${argv[7]}" =~ $IMAGE_DIGEST_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      confirm)
        [[ ${#argv[@]} -eq 6 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        # Receipt staging is itself part of the token-bound confirm command.
        # A caller cannot mutate publication first and attach it to a different
        # transaction afterwards.
        timeout 10s head -c 65537 > "$INCOMING/receipt.json.tmp"
        [[ "$(stat -c %s "$INCOMING/receipt.json.tmp")" -le 65536 ]] || { rm -f "$INCOMING/receipt.json.tmp"; echo 'meetwise_cd_receipt_too_large' >&2; exit 1; }
        mv -f "$INCOMING/receipt.json.tmp" "$INCOMING/receipt.json"
        ;;
      recover)
        [[ ${#argv[@]} -eq 6 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      wait-pages|commit)
        [[ ${#argv[@]} -eq 7 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE && "${argv[6]}" =~ $DIGEST_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      status)
        [[ ${#argv[@]} -eq 6 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        [[ "${argv[3]}" =~ $TRANSACTION_ID_RE && "${argv[4]}" =~ $RELEASE_RE && "${argv[5]}" =~ $TOKEN_RE ]] || { echo 'meetwise_cd_transaction_identity_invalid' >&2; exit 1; }
        ;;
      status-system|recover-system)
        [[ ${#argv[@]} -eq 3 ]] || { echo 'meetwise_cd_argc_invalid' >&2; exit 1; }
        ;;
      *) echo 'meetwise_cd_transaction_action_invalid' >&2; exit 1 ;;
    esac
    exec sudo "$ROOT_DISPATCH" "${argv[@]:1}"
    ;;
  *)
    echo 'meetwise_cd_unknown_command' >&2
    exit 1
    ;;
esac
