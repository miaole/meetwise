#!/bin/bash
# Verified controller payload. This file is deliberately *not* a first-root
# bootstrap: it runs only after an independent, pre-installed root bootstrap
# has verified the attested archive and staged this exact payload below a
# root-owned path. Never invoke this archive member directly with sudo.
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

controller_root=/usr/local/lib/meetwise-preview-controller
bootstrap_parent=/var/lib/meetwise-preview-bootstrap
actual_installer="$(readlink -f "$0")"
bootstrap_root="$(dirname "$(dirname "$(dirname "$(dirname "$actual_installer")")")")"
payload_root="$bootstrap_root/payload"
archive="$bootstrap_root/controller.tar.gz"
bootstrap_receipt="$bootstrap_root/bootstrap.json"
repository=miaole/meetwise
signer_workflow='miaole/meetwise/.github/workflows/build-preview-web.yml@refs/heads/main'

if [[ "$EUID" -ne 0 || $# -ne 0 ]]; then
  printf '%s\n' 'usage: internal verified-controller installer payload' >&2
  exit 64
fi
[[ "$0" == "$actual_installer" ]] \
  || { printf '%s\n' 'controller installer invocation path must be canonical and non-symlinked' >&2; exit 77; }
[[ "$actual_installer" == "$payload_root/ops/ecs/install-preview-controller.sh" ]] \
  || { printf '%s\n' 'controller installer must run only from the verified bootstrap payload' >&2; exit 77; }
slot_name="${bootstrap_root##*/}"
[[ "$(dirname "$bootstrap_root")" == "$bootstrap_parent" && "$slot_name" =~ ^verified-controller-[a-f0-9]{64}$ ]] \
  || { printf '%s\n' 'controller installer bootstrap slot is invalid' >&2; exit 77; }
[[ -d "$bootstrap_root" && ! -L "$bootstrap_root" && "$(stat -c '%U:%G:%a' "$bootstrap_root")" == root:root:700 ]] \
  || { printf '%s\n' 'verified controller bootstrap slot metadata is invalid' >&2; exit 77; }
[[ -f "$archive" && -f "$bootstrap_receipt" && -d "$payload_root" ]] \
  || { printf '%s\n' 'verified controller bootstrap staging is incomplete' >&2; exit 69; }
[[ "$(stat -c '%U:%G:%a' "$archive")" == root:root:600 && "$(stat -c '%U:%G:%a' "$bootstrap_receipt")" == root:root:600 ]] \
  || { printf '%s\n' 'verified controller bootstrap staging metadata is invalid' >&2; exit 77; }
[[ "$(stat -c '%U:%G:%a' "$payload_root")" == root:root:700 && ! -L "$payload_root" ]] \
  || { printf '%s\n' 'verified controller payload root metadata is invalid' >&2; exit 77; }
! find -P "$payload_root" -xdev \( -type l -o ! -user root -o ! -group root -o -perm /022 \) -print -quit | grep -q . \
  || { printf '%s\n' 'verified controller payload tree metadata is invalid' >&2; exit 77; }

# No archive member is executable until a receipt from the independent root
# bootstrap binds both its bytes and its extracted regular-file tree. This
# check deliberately uses the system Node runtime, never a candidate module.
payload_tree_sha256="$(
  cd "$payload_root"
  find -P . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | awk '{print $1}'
)"
/usr/bin/node --input-type=module - "$bootstrap_receipt" "$archive" "$payload_tree_sha256" "$bootstrap_root" <<'NODE'
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { basename } from 'node:path';
const [receiptPath, archivePath, payloadTreeSha256, bootstrapRoot] = process.argv.slice(2);
const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
const archiveSha256 = createHash('sha256').update(await readFile(archivePath)).digest('hex');
if (receipt.schemaVersion !== 2
  || receipt.bootstrapSlot !== basename(bootstrapRoot)
  || receipt.archiveSha256 !== archiveSha256
  || receipt.payloadTreeSha256 !== payloadTreeSha256
  || receipt.expectedArchiveSha256 !== archiveSha256
  || basename(bootstrapRoot) !== `verified-controller-${archiveSha256}`
  || typeof receipt.attestationVerifiedAt !== 'string'
  || !Number.isFinite(Date.parse(receipt.attestationVerifiedAt))) {
  throw new Error('preview_bootstrap_receipt_invalid');
}
NODE

# Controller replacement must not race a release which has already validated
# a different root-owned controller tree. This bootstrap payload is trusted at
# this point, but it still refuses rather than stealing an active release lock.
runtime_dir=/run/meetwise-preview-controller
lock_path="$runtime_dir/controller.lock"
install -d -o root -g root -m 0700 "$runtime_dir"
[[ "$(stat -c '%U:%G:%a' "$runtime_dir")" == root:root:700 && ! -L "$runtime_dir" && ! -L "$lock_path" && ( ! -e "$lock_path" || -f "$lock_path" ) ]] \
  || { printf '%s\n' 'preview controller lock path is unsafe' >&2; exit 77; }
(umask 077; : >>"$lock_path")
exec 9>>"$lock_path"
flock -n 9 || { printf '%s\n' 'active preview release prevents controller replacement' >&2; exit 75; }

preclose_existing_public_preview() {
  # Do not change the release trust root while an older controller may still
  # serve its own pointer.  This is intentionally self-contained: the new
  # controller has not been installed yet and candidate release code is never
  # sourced here.
  local scratch web_pid funnel_pid
  scratch="$(mktemp -d)"
  trap 'rm -rf "$scratch"' RETURN
  if systemctl cat meetwise-web-preview.service >/dev/null 2>&1; then
    timeout 15s systemctl stop meetwise-web-preview.service >/dev/null 2>&1 &
    web_pid=$!
  else
    web_pid=''
  fi
  command -v tailscale >/dev/null \
    || { printf '%s\n' 'tailscale is required to fail-close an existing preview edge' >&2; return 69; }
  timeout 15s tailscale funnel --https=443 off >/dev/null 2>&1 &
  funnel_pid=$!
  [[ -z "$web_pid" ]] || wait "$web_pid" \
    || { printf '%s\n' 'existing preview Web could not be stopped' >&2; return 70; }
  # Tailscale returns non-zero when Funnel is disabled for the whole tailnet.
  # The following JSON status check, not this exit code, establishes whether
  # an old public Web mapping remains.
  wait "$funnel_pid" || true
  if systemctl is-active --quiet meetwise-web-preview.service; then
    printf '%s\n' 'existing preview Web remains active after fail-close' >&2
    return 70
  fi
  timeout 15s tailscale funnel status --json >"$scratch/funnel.json" \
    || { printf '%s\n' 'existing preview Funnel state could not be verified closed' >&2; return 70; }
  /usr/bin/node "$payload_root/ops/ecs/preview-funnel-status.mjs" "$scratch/funnel.json" \
    || { printf '%s\n' 'existing preview Funnel remains configured or has an unknown status' >&2; return 70; }
  if systemctl cat meetwise-web-preview.service >/dev/null 2>&1; then
    systemctl disable meetwise-web-preview.service >/dev/null \
      || { printf '%s\n' 'existing preview Web unit could not be disabled' >&2; return 70; }
  fi
  rm -f /var/lib/meetwise-preview-controller/serving-permit.json
  trap - RETURN
  rm -rf "$scratch"
}

assert_root_safe_directory() {
  local directory="$1" mode
  [[ -d "$directory" && ! -L "$directory" && "$(stat -c '%U:%G' "$directory")" == root:root ]] \
    || { printf '%s\n' 'preview trust directory ownership is invalid' >&2; return 77; }
  mode="$(stat -c '%a' "$directory")"
  (( (8#$mode & 0022) == 0 )) \
    || { printf '%s\n' 'preview trust directory is writable outside root' >&2; return 77; }
}

ensure_exact_root_directory() {
  local directory="$1" parent
  parent="$(dirname "$directory")"
  assert_root_safe_directory "$parent"
  if [[ -e "$directory" || -L "$directory" ]]; then
    [[ ! -L "$directory" && "$(stat -c '%U:%G:%a' "$directory")" == root:root:755 ]] \
      || { printf '%s\n' 'preview trust directory does not match the required root-owned mode' >&2; return 77; }
    return 0
  fi
  mkdir --mode=0755 -- "$directory"
  chown root:root "$directory"
  sync -d "$parent"
  [[ "$(stat -c '%U:%G:%a' "$directory")" == root:root:755 && ! -L "$directory" ]] \
    || { printf '%s\n' 'preview trust directory creation verification failed' >&2; return 77; }
}

prepare_isolated_preview_trust_root() {
  local current target mode
  assert_root_safe_directory /srv
  ensure_exact_root_directory /srv/meetwise-preview
  ensure_exact_root_directory /srv/meetwise-preview/releases
  if [[ -e /srv/meetwise-preview/current || -L /srv/meetwise-preview/current ]]; then
    [[ -L /srv/meetwise-preview/current ]] \
      || { printf '%s\n' 'preview current pointer is not a symbolic link' >&2; return 77; }
    target="$(readlink -f /srv/meetwise-preview/current)"
    [[ -d "$target" && ! -L "$target" && "$(dirname "$target")" == /srv/meetwise-preview/releases && "$(basename "$target")" =~ ^[a-f0-9]{7,64}$ ]] \
      || { printf '%s\n' 'preview current pointer target is invalid' >&2; return 77; }
    [[ "$(stat -c '%U:%G' "$target")" == root:root ]] \
      || { printf '%s\n' 'preview current target ownership is invalid' >&2; return 77; }
    mode="$(stat -c '%a' "$target")"
    (( (8#$mode & 0022) == 0 )) \
      || { printf '%s\n' 'preview current target is writable outside root' >&2; return 77; }
  fi
}

# This ordering is deliberate. If any pre-close or trust-root assertion
# fails, the installer aborts without creating or taking over the new root.
preclose_existing_public_preview
prepare_isolated_preview_trust_root

command -v gh >/dev/null || { printf '%s\n' 'GitHub CLI is required to verify the controller attestation' >&2; exit 69; }

scratch="$(mktemp -d "$runtime_dir/installer.XXXXXX")"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
gh attestation verify "$archive" --repo "$repository" --signer-workflow "$signer_workflow" >/dev/null

# The independent bootstrap has already validated/extracted the archive. The
# payload repeats both checks as defence in depth, but they are not the source
# of first-root trust.
node "$payload_root/ops/ecs/archive-safety.mjs" validate "$archive" ops/ecs >/dev/null
source_root="$payload_root/ops/ecs"
[[ -f "$source_root/controller-files.txt" ]] || { printf '%s\n' 'controller archive is missing its file map' >&2; exit 65; }
node "$source_root/archive-safety.mjs" verify-extracted "$source_root" >/dev/null

[[ ! -e "$controller_root.new" && ! -L "$controller_root.new" && ! -e "$controller_root.previous" && ! -L "$controller_root.previous" ]] \
  || { printf '%s\n' 'previous controller replacement recovery is incomplete' >&2; exit 75; }
install -d -o root -g root -m 0755 "$controller_root.new"
while IFS=$'\t' read -r source target; do
  [[ -n "$source" && "${source:0:1}" != '#' ]] || continue
  [[ "$source" != *'..'* && "$target" =~ ^[A-Za-z0-9._-]+$ && -f "$source_root/$source" ]] || { printf '%s\n' 'controller file map is invalid' >&2; exit 65; }
  mode=0644
  [[ "$target" == *.sh ]] && mode=0755
  install -D -o root -g root -m "$mode" "$source_root/$source" "$controller_root.new/$target"
done < "$source_root/controller-files.txt"
(
  cd "$controller_root.new"
  find . -type f ! -name controller.sha256 ! -name controller-version.json -print0 | LC_ALL=C sort -z | xargs -0 sha256sum > controller.sha256
)
install -o root -g root -m 0600 /dev/stdin "$controller_root.new/controller-version.json" <<EOF
{"schemaVersion":1,"archiveSha256":"$(sha256sum "$archive" | awk '{print $1}')","installedAt":"$(date -u +%Y-%m-%dT%H:%M:%SZ)"}
EOF
chown -R root:root "$controller_root.new"
chmod -R go-w "$controller_root.new"
unit_backup="$scratch/units"
install -d -o root -g root -m 0700 "$unit_backup"
unit_names=(meetwise-preview-recovery.service meetwise-preview-edge-probe-expiry.service meetwise-preview-edge-probe-expiry.timer meetwise-preview-edge-probe-watchdog.service)
for unit_name in "${unit_names[@]}"; do
  if [[ -e "/etc/systemd/system/$unit_name" ]]; then
    install -o root -g root -m 0600 "/etc/systemd/system/$unit_name" "$unit_backup/$unit_name"
  else
    : >"$unit_backup/$unit_name.absent"
  fi
done
controller_swapped=0
old_controller_moved=0
installer_committed=0
restore_controller_install() {
  local code=$?
  if [[ "$installer_committed" == 0 ]]; then
    set +e
    for unit_name in "${unit_names[@]}"; do
      if [[ -f "$unit_backup/$unit_name" ]]; then
        install -D -o root -g root -m 0644 "$unit_backup/$unit_name" "/etc/systemd/system/$unit_name"
      else
        rm -f "/etc/systemd/system/$unit_name"
      fi
    done
    if [[ "$old_controller_moved" == 1 && -d "$controller_root.previous" ]]; then
      rm -rf "$controller_root"
      mv -T "$controller_root.previous" "$controller_root"
    fi
    rm -rf "$controller_root.new"
    systemctl daemon-reload || true
    set -e
  fi
  exit "$code"
}
trap restore_controller_install ERR
if [[ -e "$controller_root" ]]; then
  mv -T "$controller_root" "$controller_root.previous"
  old_controller_moved=1
fi
mv -T "$controller_root.new" "$controller_root"
controller_swapped=1
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-recovery.service" /etc/systemd/system/meetwise-preview-recovery.service
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-expiry.service" /etc/systemd/system/meetwise-preview-edge-probe-expiry.service
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-expiry.timer" /etc/systemd/system/meetwise-preview-edge-probe-expiry.timer
install -D -o root -g root -m 0644 "$controller_root/meetwise-preview-edge-probe-watchdog.service" /etc/systemd/system/meetwise-preview-edge-probe-watchdog.service
install -d -o root -g root -m 0700 /var/lib/meetwise-preview-controller
install -d -o root -g root -m 0755 /usr/share/meetwise-preview
# The immutable replacement is complete. Release the installer-held lock
# before invoking the recovery unit, which independently acquires it.
flock -u 9
exec 9>&-
systemctl daemon-reload
systemctl enable meetwise-preview-recovery.service
systemctl restart meetwise-preview-recovery.service
systemctl is-active --quiet meetwise-preview-recovery.service
installer_committed=1
trap - ERR
rm -rf "$controller_root.previous"
printf '%s\n' 'installed root-owned preview controller; candidate release scripts are not executable control-plane entries'
