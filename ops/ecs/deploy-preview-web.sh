#!/usr/bin/env bash
set -euo pipefail

source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
controller_entry_guard deploy-preview-web.sh
controller_require_lock

controller_root=/usr/local/lib/meetwise-preview-controller
nginx_target=/etc/nginx/conf.d/meetwise-preview.conf
unit_target=/etc/systemd/system/meetwise-web-preview.service
env_target=/etc/meetwise/preview-web.env
candidate_port=3001

if [[ $# -ne 1 ]]; then
  printf '%s\n' 'usage: internal deploy-preview-web.sh /srv/meetwise-preview/releases/<release-digest>' >&2
  exit 64
fi

release_dir="$(controller_release_dir "$1")"
release_id="$(basename "$release_dir")"
node "$controller_root/preview-release-artifact.mjs" verify "$release_dir" >/dev/null
[[ -f "$controller_root/meetwise-preview.conf" && -f "$controller_root/meetwise-web-preview.service" ]] || controller_fail 'trusted preview controller is unavailable' 69
systemctl is-active --quiet meetwise-preview-recovery.service || controller_fail 'preview recovery gate is not active before deployment' 70
[[ -x /usr/bin/node ]] || controller_fail 'node runtime is unavailable' 69
command -v nginx >/dev/null || controller_fail 'nginx is unavailable' 69
preview_host="$(controller_tailnet_host)"
web_dir="$release_dir/apps/web"
standalone_dir="$web_dir/.next/standalone/apps/web"
marker="<meta name=\"meetwise-preview-release\" content=\"$release_id\""
scratch="$(mktemp -d /srv/meetwise-preview/.preview-deploy.XXXXXX)"
candidate_unit="meetwise-preview-candidate-${release_id:0:12}-${RANDOM}${RANDOM}"
candidate_started=0
had_nginx=0
had_unit=0
had_env=0
switched=0

deploy_fail() {
  printf '%s\n' "$1" >&2
  return "${2:-70}"
}

stop_candidate() {
  [[ "$candidate_started" == 1 ]] || return 0
  if ! timeout 15s systemctl stop "$candidate_unit" >/dev/null; then
    deploy_fail 'candidate systemd cgroup could not be stopped' 70
    return $?
  fi
  if ! controller_unit_is_inactive "$candidate_unit"; then
    deploy_fail 'candidate systemd cgroup did not stop' 70
    return $?
  fi
  candidate_started=0
}

cleanup() {
  stop_candidate
  rm -rf "$scratch"
}

rollback() {
  local code=$?
  set +e
  if [[ "$had_nginx" == 1 ]]; then cp "$scratch/nginx.previous" "$nginx_target"; else rm -f "$nginx_target"; fi
  if [[ "$had_unit" == 1 ]]; then cp "$scratch/unit.previous" "$unit_target"; else rm -f "$unit_target"; fi
  if [[ "$had_env" == 1 ]]; then cp "$scratch/env.previous" "$env_target"; else rm -f "$env_target"; fi
  systemctl daemon-reload
  # A failed activation never guesses that a prior pointer is still safe. The
  # boot permit is removed and the loopback service remains stopped until a
  # later controlled release validates a complete record set.
  controller_disable_serving >/dev/null 2>&1 || true
  if [[ "$switched" == 1 ]]; then controller_clear_current >/dev/null 2>&1 || true; fi
  nginx -t >/dev/null 2>&1 && nginx -s reload >/dev/null 2>&1 || true
  controller_ledger_transition active_unpublished failed "$release_id" '' '' disabled >/dev/null 2>&1 || true
  controller_ledger_transition staged failed "$release_id" '' '' disabled >/dev/null 2>&1 || true
  cleanup
  exit "$code"
}
trap cleanup EXIT
trap rollback ERR

[[ -f "$nginx_target" ]] && { cp "$nginx_target" "$scratch/nginx.previous"; had_nginx=1; }
[[ -f "$unit_target" ]] && { cp "$unit_target" "$scratch/unit.previous"; had_unit=1; }
[[ -f "$env_target" ]] && { cp "$env_target" "$scratch/env.previous"; had_env=1; }

# Run the candidate inside an isolated transient unit.  The verification
# request is the only permitted loopback egress; KillMode terminates the
# entire cgroup before the candidate can be activated.
systemd-run --unit="$candidate_unit" --collect --service-type=exec \
  --property=User=meetwise --property=Group=meetwise \
  --property="WorkingDirectory=$standalone_dir" \
  --property=NoNewPrivileges=true --property=PrivateTmp=true --property=ProtectHome=true \
  --property=ProtectSystem=full --property=ProtectKernelTunables=true --property=ProtectKernelModules=true --property=ProtectControlGroups=true \
  --property='RestrictAddressFamilies=AF_UNIX AF_INET AF_INET6' \
  --property=IPAddressDeny=any --property=IPAddressAllow=127.0.0.0/8 --property=IPAddressAllow=::1/128 \
  --property="ReadOnlyPaths=$release_dir" --property=InaccessiblePaths=/srv/meetwise --property=CapabilityBoundingSet= --property=KillMode=control-group --property=RuntimeMaxSec=60 --property=TimeoutStopSec=15s \
  --setenv=NODE_ENV=production --setenv=NEXT_TELEMETRY_DISABLED=1 --setenv=MEETWISE_PUBLIC_PREVIEW=1 \
  --setenv="MEETWISE_PREVIEW_RELEASE_DIGEST=$release_id" --setenv=HOSTNAME=127.0.0.1 --setenv="PORT=$candidate_port" \
  /usr/bin/node "$standalone_dir/server.js" >/dev/null
candidate_started=1

candidate_body="$scratch/candidate.html"
for _ in {1..20}; do
  if curl --fail --silent --show-error --max-time 1 -H "Host: $preview_host" "http://127.0.0.1:$candidate_port/" -o "$candidate_body"; then break; fi
  sleep 0.5
done
grep -Fq "$marker" "$candidate_body" || deploy_fail 'candidate release marker mismatch' 70
candidate_digest="$(sha256sum "$candidate_body" | awk '{print $1}')"
stop_candidate

sed "s/__MEETWISE_PREVIEW_HOST__/$preview_host/g" "$controller_root/meetwise-preview.conf" > "$scratch/meetwise-preview.conf"
grep -Fq '__MEETWISE_PREVIEW_HOST__' "$scratch/meetwise-preview.conf" && deploy_fail 'nginx hostname template was not rendered' 70
install -D -o root -g root -m 0644 "$controller_root/meetwise-web-preview.service" "$unit_target"
install -D -o root -g root -m 0644 "$scratch/meetwise-preview.conf" "$nginx_target"
install -d -o root -g root -m 0700 /etc/meetwise
printf 'MEETWISE_PUBLIC_PREVIEW=1\nMEETWISE_PREVIEW_RELEASE_DIGEST=%s\n' "$release_id" | install -o root -g root -m 0644 /dev/stdin "$env_target"
nginx -t
systemctl daemon-reload
systemctl enable meetwise-web-preview.service

controller_current_switch "$release_dir"
switched=1
controller_ledger_transition staged active_unpublished "$release_id" '' '' disabled >/dev/null
# The permit is issued only after both `current` and the durable activation
# state agree. The systemd pre-start hook independently rechecks it.
controller_reconcile_publication
systemctl restart meetwise-web-preview.service
systemctl is-active --quiet meetwise-web-preview.service
nginx -s reload

loopback_body="$scratch/loopback.html"
curl --fail --silent --show-error --max-time 10 -H "Host: $preview_host" -H 'Cookie: mw_token=must_not_forward' http://127.0.0.1:8080/ -o "$loopback_body"
grep -Fq "$marker" "$loopback_body" || deploy_fail 'active release marker mismatch' 70
[[ "$(curl --silent --output "$scratch/unsafe.json" --write-out '%{http_code}' --request POST http://127.0.0.1:8080/ -H "Host: $preview_host")" == 503 ]] || deploy_fail 'preview method gate is not active' 70
grep -Fqx '{"error":"public_preview_read_only"}' "$scratch/unsafe.json" || deploy_fail 'preview method response is invalid' 70
[[ "$(curl --silent --output /dev/null --write-out '%{http_code}' http://127.0.0.1:8080/api/privacy/export -H "Host: $preview_host" -H 'Cookie: mw_token=must_not_forward')" == 404 ]] || deploy_fail 'API path was forwarded by preview edge' 70
loopback_digest="$(sha256sum "$loopback_body" | awk '{print $1}')"
method_digest="$(sha256sum "$scratch/unsafe.json" | awk '{print $1}')"
printf '{\n  "candidate": "%s",\n  "loopback": "%s",\n  "methodGate": "%s"\n}\n' "$candidate_digest" "$loopback_digest" "$method_digest" > "$release_dir/.meetwise-preview-loopback-receipt.json"
fingerprint="$(sha256sum "$release_dir/.meetwise-preview-loopback-receipt.json" | awk '{print $1}')"
printf '%s\n' 'preview Web active on loopback; public edge and Pages entry remain controlled release gates'
