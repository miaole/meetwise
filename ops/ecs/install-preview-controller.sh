#!/usr/bin/env bash
# Initial trust ceremony only.  The operator must first verify the controller
# archive as an unprivileged user and extract this exact file from that archive.
# Never run a checkout or a candidate release path with sudo.
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH

controller_root=/usr/local/lib/meetwise-preview-controller
repository=miaole/meetwise
signer_workflow='miaole/meetwise/.github/workflows/build-preview-web.yml@refs/heads/main'

if [[ "$EUID" -ne 0 || $# -ne 1 || ! -f "$1" ]]; then
  printf '%s\n' 'usage: sudo install-preview-controller.sh <attested-controller-archive>' >&2
  exit 64
fi

input_archive="$(realpath -e "$1")"
command -v gh >/dev/null || { printf '%s\n' 'GitHub CLI is required to verify the controller attestation' >&2; exit 69; }

install -d -o root -g root -m 0700 /var/lib/meetwise-preview-bootstrap
scratch="$(mktemp -d /var/lib/meetwise-preview-bootstrap/controller.XXXXXX)"
cleanup() { rm -rf "$scratch"; }
trap cleanup EXIT
archive="$scratch/controller.tar.gz"
# The caller-owned source is read exactly once.  All later verification and
# extraction operate only on this root-owned 0600 staging copy.
install -o root -g root -m 0600 "$input_archive" "$archive"
gh attestation verify "$archive" --repo "$repository" --signer-workflow "$signer_workflow" >/dev/null

# The bootstrap itself must be byte-identical to the signed archive member
# before it performs any installation.  Reading a single member to stdout is
# safe; full extraction happens only after the archive validator accepts it.
tar -xOzf "$archive" ops/ecs/install-preview-controller.sh > "$scratch/expected-installer.sh"
cmp --silent "$0" "$scratch/expected-installer.sh" || { printf '%s\n' 'bootstrap is not the installer from the verified controller archive' >&2; exit 77; }
tar -xOzf "$archive" ops/ecs/archive-safety.mjs > "$scratch/archive-safety.mjs"
node "$scratch/archive-safety.mjs" validate "$archive" ops/ecs >/dev/null

payload="$scratch/payload"
install -d -o root -g root -m 0700 "$payload"
tar --no-same-owner --no-same-permissions -xzf "$archive" -C "$payload"
source_root="$payload/ops/ecs"
[[ -f "$source_root/controller-files.txt" ]] || { printf '%s\n' 'controller archive is missing its file map' >&2; exit 65; }
node "$scratch/archive-safety.mjs" verify-extracted "$source_root" >/dev/null

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
if [[ -e "$controller_root" ]]; then mv -T "$controller_root" "$controller_root.previous"; fi
mv -T "$controller_root.new" "$controller_root"
rm -rf "$controller_root.previous"
printf '%s\n' 'installed root-owned preview controller; candidate release scripts are not executable control-plane entries'
