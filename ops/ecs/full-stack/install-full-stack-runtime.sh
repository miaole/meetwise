#!/bin/bash
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then echo 'install_requires_root' >&2; exit 2; fi
if [[ "$#" -ne 1 ]]; then echo 'usage: install-full-stack-runtime.sh <audited-source-root>' >&2; exit 2; fi
source_root="$(readlink -f -- "$1")"
case "$source_root" in /srv/meetwise-full-stack/releases/*) ;; *) echo 'release_root_invalid' >&2; exit 2;; esac
for required in package.json apps/api/src/main.ts apps/worker/src/main.ts apps/web/package.json; do
  [[ -f "$source_root/$required" ]] || { echo "release_missing:$required" >&2; exit 2; }
done

install -d -o root -g root -m 0700 /run/meetwise-preview-controller
touch /run/meetwise-preview-controller/controller.lock
chown root:root /run/meetwise-preview-controller/controller.lock
chmod 0600 /run/meetwise-preview-controller/controller.lock
exec 9>/run/meetwise-preview-controller/controller.lock
flock -n 9 || { echo full_stack_install_busy >&2; exit 75; }

install -d -o root -g meetwise -m 0750 /srv/meetwise-full-stack /srv/meetwise-full-stack/releases
install -d -o meetwise -g meetwise -m 0750 /var/lib/meetwise-full-stack
install -d -o root -g root -m 0700 /var/lib/meetwise-preview-controller
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-api.service" /etc/systemd/system/meetwise-api.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-worker.service" /etc/systemd/system/meetwise-worker.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-web.service" /etc/systemd/system/meetwise-web.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-publication-recovery.service" /etc/systemd/system/meetwise-full-stack-publication-recovery.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-edge-probe-expiry.service" /etc/systemd/system/meetwise-full-stack-edge-probe-expiry.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-edge-probe-expiry.timer" /etc/systemd/system/meetwise-full-stack-edge-probe-expiry.timer
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-edge-restore.service" /etc/systemd/system/meetwise-full-stack-edge-restore.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-revocation-retry.service" /etc/systemd/system/meetwise-full-stack-revocation-retry.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-full-stack-revocation-retry.timer" /etc/systemd/system/meetwise-full-stack-revocation-retry.timer
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/meetwise-preview-synthetic-large.service" /etc/systemd/system/meetwise-preview-synthetic-large.service
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/nginx-meetwise-full-stack.conf" /etc/nginx/conf.d/meetwise-full-stack.conf
install -d -o root -g root -m 0755 /usr/local/lib/meetwise-preview-synthetic
install -d -o root -g root -m 0755 /usr/local/lib/meetwise-preview-controller/full-stack
install -o root -g root -m 0644 "$source_root/ops/ecs/controller-lib.sh" /usr/local/lib/meetwise-preview-controller/controller-lib.sh
install -o root -g root -m 0644 "$source_root/ops/ecs/preview-release-manifest.mjs" /usr/local/lib/meetwise-preview-controller/preview-release-manifest.mjs
install -o root -g root -m 0755 "$source_root/ops/ecs/preview-funnel-status.mjs" /usr/local/lib/meetwise-preview-controller/preview-funnel-status.mjs
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-preview-publisher.mjs" /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-preview-publication.sh" /usr/local/sbin/full-stack-preview-publication
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-preview-edge-close.sh" /usr/local/sbin/full-stack-preview-edge-close
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-edge-probe-expire.sh" /usr/local/sbin/full-stack-edge-probe-expire
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-preview-funnel-close.sh" /usr/local/sbin/full-stack-preview-funnel-close
install -o root -g root -m 0755 "$source_root/ops/ecs/full-stack/full-stack-preview-funnel-enable.sh" /usr/local/sbin/full-stack-preview-funnel-enable
install -o root -g root -m 0644 "$source_root/ops/ecs/full-stack/full-stack-funnel-status.mjs" /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-funnel-status.mjs
for source in catalog.mjs db-verify.mjs loader.mjs loader.proof.mjs target-inspect.mjs; do
  install -o root -g root -m 0755 "$source_root/scripts/preview-synthetic-data/$source" "/usr/local/lib/meetwise-preview-synthetic/$source"
done

full-stack-preview-edge-close
export MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9
/usr/bin/node /usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs stage
ln -sfn "releases/$(basename "$source_root")" /srv/meetwise-full-stack/current.new
mv -Tf /srv/meetwise-full-stack/current.new /srv/meetwise-full-stack/current
systemctl daemon-reload
# The full-stack publisher is the sole writer of the canonical public manifest.
# Retire the former read-only preview writers before the full-stack units can
# become reachable; keeping them active would create a second state machine.
for legacy_unit in meetwise-preview-edge-probe-expiry.timer meetwise-preview-edge-probe-expiry.service meetwise-preview-edge-probe-watchdog.service meetwise-preview-recovery.service meetwise-web-preview.service; do
  legacy_state="$(timeout --kill-after=1s 5s systemctl show --property=LoadState --value "$legacy_unit")"
  if [[ "$legacy_state" == loaded ]]; then
    timeout --kill-after=1s 20s systemctl disable --now "$legacy_unit"
    systemctl mask --runtime "$legacy_unit"
  elif [[ "$legacy_state" != not-found ]]; then
    echo "legacy_preview_writer_state_invalid:$legacy_unit:$legacy_state" >&2
    exit 70
  fi
done
printf '%s\n' '{"schemaVersion":1,"retired":true,"successor":"full-stack-preview-publisher"}' > /var/lib/meetwise-preview-controller/full-stack-writer-retired
chown root:root /var/lib/meetwise-preview-controller/full-stack-writer-retired
chmod 0600 /var/lib/meetwise-preview-controller/full-stack-writer-retired
sync -f /var/lib/meetwise-preview-controller/full-stack-writer-retired
sync -f /var/lib/meetwise-preview-controller
systemd-analyze verify /etc/systemd/system/meetwise-api.service /etc/systemd/system/meetwise-worker.service /etc/systemd/system/meetwise-web.service /etc/systemd/system/meetwise-full-stack-publication-recovery.service /etc/systemd/system/meetwise-full-stack-edge-probe-expiry.service /etc/systemd/system/meetwise-full-stack-edge-probe-expiry.timer /etc/systemd/system/meetwise-full-stack-edge-restore.service /etc/systemd/system/meetwise-full-stack-revocation-retry.service /etc/systemd/system/meetwise-full-stack-revocation-retry.timer /etc/systemd/system/meetwise-preview-synthetic-large.service
nginx -t
systemctl enable meetwise-api.service meetwise-worker.service meetwise-web.service meetwise-full-stack-publication-recovery.service meetwise-full-stack-edge-restore.service nginx.service
systemctl enable --now meetwise-full-stack-revocation-retry.timer
flock -u 9
exec 9>&-
systemctl restart meetwise-full-stack-publication-recovery.service
systemctl restart meetwise-api.service
systemctl restart meetwise-worker.service
systemctl restart meetwise-web.service
systemctl restart nginx.service
full-stack-preview-publication publish
rm -f /var/lib/meetwise-preview-controller/full-stack-internal-staging.json
sync -f /var/lib/meetwise-preview-controller
systemctl restart meetwise-full-stack-publication-recovery.service
echo full_stack_public_activation_pending
