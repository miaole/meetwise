import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const nginx = read('ops/ecs/nginx/meetwise-preview.conf');
const unit = read('ops/ecs/systemd/meetwise-web-preview.service');
const controller = read('ops/ecs/controller-lib.sh');
const installer = read('ops/ecs/install-preview-controller.sh');
const prepare = read('ops/ecs/prepare-preview-web-release.sh');
const deploy = read('ops/ecs/deploy-preview-web.sh');
const funnel = read('ops/ecs/enable-preview-funnel.sh');
const finalize = read('ops/ecs/finalize-preview-web-release.sh');
const revoke = read('ops/ecs/revoke-preview-pages-link.sh');
const reconcile = read('ops/ecs/reconcile-preview-publication.sh');
const ensureServing = read('ops/ecs/ensure-preview-web-serving.sh');
const bootRecovery = read('ops/ecs/recover-preview-publication.sh');
const bootRecoveryUnit = read('ops/ecs/systemd/meetwise-preview-recovery.service');
const edgeProbe = read('ops/ecs/prepare-preview-edge-probe.sh');
const edgeExpiry = read('ops/ecs/expire-preview-edge-probe.sh');
const edgeExpiryTimer = read('ops/ecs/systemd/meetwise-preview-edge-probe-expiry.timer');
const edgeWatchdog = read('ops/ecs/systemd/meetwise-preview-edge-probe-watchdog.service');
const edgeTimeoutHandler = read('ops/ecs/handle-preview-edge-probe-timeout.sh');
const edgeFence = read('ops/ecs/preview-edge-probe-fence.mjs');
const currentPointer = read('ops/ecs/preview-current-pointer.mjs');
const servingPermit = read('ops/ecs/preview-serving-permit.mjs');
const release = read('ops/ecs/release-preview-web.sh');
const verify = read('ops/ecs/verify-preview-web.sh');
const manifest = read('ops/ecs/preview-release-manifest.mjs');
const artifact = read('ops/ecs/preview-release-artifact.mjs');
const archiveSafety = read('ops/ecs/archive-safety.mjs');
const buildWorkflow = read('.github/workflows/build-preview-web.yml');
const pagesWorkflow = read('.github/workflows/pages-preview.yml');
const middleware = read('apps/web/middleware.ts');
const useCase = read('ai-docs/requirements/use-cases/ecs-public-preview-web-ingress.md');

const checks = [
  ['nginx binds only the loopback preview port, rejects unknown hosts and omits query-bearing access logs',
    /listen 127\.0\.0\.1:8080 default_server;/.test(nginx)
      && /server_name _;\s*access_log off;\s*return 444;/s.test(nginx)
      && (nginx.match(/access_log off;/g) ?? []).length === 2
      && !/listen\s+(?:80|443)\b/.test(nginx)],
  ['nginx is both a method and path allowlist, including a static signed-manifest document that never reaches Next',
    /return 503 '\{"error":"public_preview_read_only"\}';/.test(nginx)
      && ['/features', '/faq', '/legal', '/_next/static/', '/preview-release-manifest.json'].every((path) => nginx.includes(path))
      && /alias \/usr\/share\/meetwise-preview\/preview-release-manifest\.json;/.test(nginx)
      && /location \/ \{\s*return 404;/s.test(nginx)
      && !/location \/api/.test(nginx)],
  ['nginx can proxy only display routes to loopback Web and removes browser identity',
    (nginx.match(/proxy_pass http:\/\/127\.0\.0\.1:3000;/g) ?? []).length === 5
      && (nginx.match(/proxy_set_header Cookie "";/g) ?? []).length === 5
      && (nginx.match(/proxy_set_header Authorization "";/g) ?? []).length === 5
      && !/proxy_pass .*api/i.test(nginx)],
  ['web maintains a matching public-preview depth gate without weakening normal auth',
    /MEETWISE_PUBLIC_PREVIEW === '1'/.test(middleware)
      && /public_preview_read_only/.test(middleware)
      && /public_preview_path_unavailable/.test(middleware)
      && /protectedPaths/.test(middleware)
      && /url\.pathname = '\/login'/.test(middleware)],
  ['the active unit is unprivileged, loopback-only and carries neither secrets nor data-plane configuration',
    /User=meetwise/.test(unit)
      && /HOSTNAME=127\.0\.0\.1/.test(unit)
      && /PORT=3000/.test(unit)
      && /IPAddressDeny=any/.test(unit)
      && /IPAddressAllow=127\.0\.0\.0\/8/.test(unit)
      && /ExecStartPre=\+\/usr\/local\/lib\/meetwise-preview-controller\/ensure-preview-web-serving\.sh/.test(unit)
      && /Requires=meetwise-preview-recovery\.service/.test(unit)
      && !/(DATABASE_URL|REDIS|MODEL_API_KEY|DASHSCOPE|MIGRATION|PASSWORD|TOKEN=)/.test(unit)],
  ['all release entrypoints require an installed root-owned checksum-verified controller path',
    /controller_entry_guard/.test(controller)
      && /sha256sum --check --status controller\.sha256/.test(controller)
      && [prepare, deploy, edgeProbe, edgeExpiry, edgeTimeoutHandler, funnel, finalize, revoke, reconcile, ensureServing, bootRecovery, release, verify].every((source) => /source \/usr\/local\/lib\/meetwise-preview-controller\/controller-lib\.sh/.test(source) && /controller_entry_guard /.test(source))
      && ![prepare, deploy, edgeProbe, edgeExpiry, edgeTimeoutHandler, funnel, finalize, revoke, reconcile, ensureServing, bootRecovery, release, verify].some((source) => /\$release_dir\/ops\//.test(source))],
  ['controller installer is a verified payload and rejects direct sudo execution before it can install immutable controller files',
    /gh attestation verify/.test(installer)
      && /verified-controller/.test(installer)
      && /controller installer must run only from the verified bootstrap payload/.test(installer)
      && !/usage: sudo install-preview-controller\.sh/.test(installer)
      && /archive-safety\.mjs/.test(installer)
      && /--signer-workflow/.test(installer)
      && /payloadTreeSha256/.test(installer)
      && /attestationVerifiedAt/.test(installer)
      && /\/usr\/bin\/node/.test(installer)
      && /controller\.sha256/.test(installer)
      && /chown -R root:root/.test(installer)
      && /chmod -R go-w/.test(installer)
      && /controller-files\.txt/.test(installer)],
  ['the release archive is staged before GitHub attestation and permits only root-contained relative soft links during extraction',
    /gh attestation verify/.test(prepare)
      && /input_archive/.test(prepare)
      && /install -o root -g root -m 0600/.test(prepare)
      && /archive-safety\.mjs validate/.test(prepare)
      && /same release digest arrived with a different archive/.test(prepare)
      && /preview-release-artifact\.mjs verify/.test(prepare)
      && !/git -C/.test(prepare)
      && /tar --no-same-owner --no-same-permissions/.test(prepare)
      && /sourceRepository !== 'miaole\/meetwise'/.test(artifact)
      && /preview_release_symlink_escapes_root/.test(artifact)
      && /preview_archive_special_member_rejected/.test(archiveSafety)
      && /preview_archive_duplicate_member/.test(archiveSafety)
      && /preview_archive_long_link_without_symlink/.test(archiveSafety)],
  ['each edge probe persists a release-bound monotonic deadline and only an in-deadline completion may defeat a late timeout',
    /deadlineMonotonicMs/.test(edgeFence)
      && /state: 'armed'/.test(edgeFence)
      && /state: 'timed_out'/.test(edgeFence)
      && /state: 'completed'/.test(edgeFence)
      && /nowMonotonicMs >= prior\.deadlineMonotonicMs/.test(edgeFence)
      && /nowMonotonicMs < prior\.deadlineMonotonicMs/.test(edgeFence)
      && /completedMonotonicMs >= value\.deadlineMonotonicMs/.test(edgeFence)
      && /prior\.state === 'completed'/.test(edgeFence)
      && /controller_arm_edge_fence/.test(edgeProbe)
      && /controller_assert_edge_probe_unexpired/.test(controller)
      && /MEETWISE_PREVIEW_EDGE_FENCE_LOCK/.test(controller)],
  ['the CI workflow builds and attests both immutable delivery archives only from protected main',
    /branches: \[main\]/.test(buildWorkflow)
      && /github\.ref == 'refs\/heads\/main'/.test(buildWorkflow)
      && /actions\/attest@a1948c3f048ba23858d222213b7c278aabede763/.test(buildWorkflow)
      && /meetwise-preview-web\.tar\.gz/.test(buildWorkflow)
      && /meetwise-preview-controller\.tar\.gz/.test(buildWorkflow)
      && /id-token: write/.test(buildWorkflow)
      && /attestations: write/.test(buildWorkflow)
      && !/pull_request_target/.test(buildWorkflow)],
  ['candidate code runs only under a constrained transient systemd cgroup before activation',
    /systemd-run --unit=/.test(deploy)
      && /KillMode=control-group/.test(deploy)
      && /IPAddressDeny=any/.test(deploy)
      && /ReadOnlyPaths=\$release_dir/.test(deploy)
      && /RuntimeMaxSec=60/.test(deploy)
      && /stop_candidate/.test(deploy)
      && /systemctl stop --wait/.test(deploy)
      && !/is-active --quiet "\$candidate_unit" && controller_fail.*\|\| true/.test(deploy)
      && !/runuser -u meetwise -- env/.test(deploy)],
  ['activation syncs current, transitions ledger and creates a start permit before the Web restart',
    /rollback\(\)/.test(deploy)
      && /systemctl restart meetwise-web-preview\.service/.test(deploy)
      && /controller_ledger_transition staged active_unpublished/.test(deploy)
      && /controller_current_switch/.test(deploy)
      && /controller_reconcile_publication/.test(deploy)
      && /await syncDirectory\(pointerParent\);/.test(currentPointer)
      && /issueServingPermit/.test(servingPermit)
      && /active release marker mismatch/.test(deploy)
      && /\/api\/privacy\/export/.test(deploy)],
  ['a temporary Funnel is an explicit edge-probing phase and cannot be opened from loopback-only activation',
    /controller_ledger_transition active_unpublished edge_probing/.test(edgeProbe)
      && /controller_issue_serving_permit/.test(edgeProbe)
      && /systemctl restart meetwise-web-preview\.service/.test(edgeProbe)
      && /controller_clear_edge_probe_timeout/.test(edgeProbe)
      && /controller_clear_edge_fence/.test(edgeProbe)
      && /systemctl stop meetwise-preview-edge-probe-watchdog\.service meetwise-preview-edge-probe-expiry\.timer/.test(edgeProbe)
      && /systemctl reset-failed meetwise-preview-edge-probe-watchdog\.service meetwise-preview-edge-probe-expiry\.service/.test(edgeProbe)
      && /systemctl start meetwise-preview-edge-probe-watchdog\.service/.test(edgeProbe)
      && /ledger\.state !== 'edge_probing'/.test(funnel)
      && /controller_validate_serving_permit "\$ledger" "\$current" null/.test(funnel)
      && /prepare-preview-edge-probe\.sh/.test(release)
      && /controller_ledger_transition edge_probing publishing/.test(finalize)
      && /systemctl restart meetwise-web-preview\.service/.test(finalize)],
  ['funnel refuses to overwrite a foreign mapping and accepts only the exact local host and loopback target',
    /absent-or-assert/.test(funnel)
      && /if \[\[ "\$before" == absent \]\]/.test(funnel)
      && /funnel --https=443 --yes --bg http:\/\/127\.0\.0\.1:8080/.test(funnel)
      && /preview-funnel-target\.mjs assert/.test(funnel)],
  ['the orchestrator owns one lock across revoke, stage, activation, Funnel, signing and black-box verification',
    /controller_lock/.test(release)
      && /revoke-preview-pages-link\.sh/.test(release)
      && /controller_reconcile_publication/.test(release)
      && /prepare-preview-web-release\.sh/.test(release)
      && /deploy-preview-web\.sh/.test(release)
      && /prepare-preview-edge-probe\.sh/.test(release)
      && release.indexOf('systemctl restart meetwise-preview-recovery.service') < release.indexOf('controller_lock')
      && /enable-preview-funnel\.sh/.test(release)
      && /finalize-preview-web-release\.sh/.test(release)
      && /verify-preview-web\.sh/.test(release)
      && !/MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD/.test(release)
      && /\/proc\/\$\$\/fd\/9/.test(controller)
      && /flock -n 9/.test(controller)],
  ['the full edge black-box receipt is created before signing and the signed record binds it with a key-pair and finite validity record',
    /preview_ledger_edge_probe_release_mismatch/.test(finalize)
      && /preview_blackbox_receipt_invalid/.test(finalize)
      && /preview_signing_key_public_pair_mismatch/.test(finalize)
      && /manifestFingerprint/.test(finalize)
      && /controller_ledger_transition edge_probing publishing/.test(finalize)
      && /controller_ledger_transition publishing verified/.test(finalize)
      && /controller_publish_manifest/.test(finalize)
      && /preview_manifest_expired/.test(manifest)
      && /\['verified', 'revoked'\]/.test(manifest)
      && /preview_manifest_revocation_invalid/.test(manifest)],
  ['a signed revocation must receive an independently published Pages-disabled receipt before a new edge release can replace it',
    /status: 'revoked'/.test(revoke)
      && /preview-link-state\.json/.test(revoke)
      && /Pages confirmed the preview link is disabled/.test(revoke)
      && /a revoked preview release cannot be revoked again/.test(revoke)
      && /controller_ledger_transition "\$ledger_state" revoked/.test(revoke)
      && /manifestFingerprint/.test(revoke)
      && /controller_publish_manifest/.test(revoke)
      && revoke.indexOf('receipt_confirmed=1') < revoke.indexOf('controller_ledger_transition "$ledger_state" revoked')
      && /for _ in \{1\.\.260\}/.test(revoke)],
  ['recovery rechecks a pending Pages revocation in bounded single attempts while an explicit release still waits for the receipt',
    /--single-check/.test(revoke)
      && /Pages revocation receipt is not available yet; retry is required/.test(revoke)
      && /--max-time "\$curl_timeout"/.test(revoke)
      && (reconcile.match(/revoke-preview-pages-link\.sh" --single-check/g) ?? []).length === 2
      && !/--single-check/.test(release)],
  ['the Pages workflow fetches a signed edge record, verifies its content digest and publishes a disabled artifact on failure or revocation',
    /fetch-preview-release-manifest\.mjs/.test(pagesWorkflow)
      && /verify-preview-origin\.mjs \.preview-release-manifest\.json/.test(pagesWorkflow)
      && /--force-disabled/.test(pagesWorkflow)
      && /cron: '17 \* \* \* \*'/.test(pagesWorkflow)
      && !/pull_request_target/.test(pagesWorkflow)],
  ['the orchestrator executes black-box verification before it can sign or publish a verified manifest',
    release.indexOf('verify-preview-web.sh') < release.indexOf('finalize-preview-web-release.sh')],
  ['Web restart reconciliation fails closed when a manifest is unreadable, stale or mismatched',
    /preview_reconcile_public_manifest_unverifiable/.test(reconcile)
      && /controller_disable_serving/.test(reconcile)
      && /manifest\.expired/.test(read('ops/ecs/preview-publication-recovery.mjs'))
      && /controller_validate_serving_permit/.test(ensureServing)],
  ['boot recovery is the sole lock-owning mutation path and startup only reads the permit',
    /controller_lock/.test(bootRecovery)
      && /controller_reconcile_publication/.test(bootRecovery)
      && /Before=meetwise-web-preview\.service/.test(bootRecoveryUnit)
      && !/controller_lock/.test(ensureServing)
      && !/controller_reconcile_publication/.test(ensureServing)],
  ['the recovery gate is installed before a release can restart a Web unit that requires it, and the release activates it before acquiring the controller lock',
    /meetwise-preview-recovery\.service/.test(installer)
      && /systemctl enable meetwise-preview-recovery\.service/.test(installer)
      && /preview recovery gate is not active before deployment/.test(deploy)
      && release.indexOf('systemctl restart meetwise-preview-recovery.service') < release.indexOf('controller_lock')
      && /ReadWritePaths=\/usr\/share\/meetwise-preview/.test(bootRecoveryUnit)],
  ['the Pages-visible signed manifest is copied only after the private permit and matching Web restart',
    finalize.indexOf('controller_publish_manifest "$manifest" "$MEETWISE_PREVIEW_PENDING_MANIFEST" 600')
      < finalize.indexOf('controller_ledger_transition edge_probing publishing')
      && finalize.indexOf('controller_ledger_transition publishing verified')
        < finalize.lastIndexOf('systemctl restart meetwise-web-preview.service')
      && finalize.lastIndexOf('systemctl restart meetwise-web-preview.service')
        < finalize.indexOf('controller_publish_manifest "$manifest" "$public_manifest" 644')],
  ['an independent 60-second watchdog closes public reachability without waiting for a stuck release lock, then a bounded retry repeats closure and reconciles durable state',
    /RuntimeMaxSec=60s/.test(edgeWatchdog)
    && /ExecStopPost=\/usr\/local\/lib\/meetwise-preview-controller\/handle-preview-edge-probe-timeout\.sh/.test(edgeWatchdog)
      && /OnFailure=meetwise-preview-edge-probe-expiry\.service/.test(edgeWatchdog)
      && /TimeoutStopSec=50s/.test(edgeWatchdog)
      && /\[\[ "\$\{SERVICE_RESULT:-\}" == timeout \]\]/.test(edgeTimeoutHandler)
      && /controller_try_timeout_edge_fence/.test(edgeTimeoutHandler)
      && /controller_mark_edge_probe_timeout/.test(edgeTimeoutHandler)
      && /controller_force_edge_timeout_closure/.test(edgeTimeoutHandler)
      && edgeTimeoutHandler.indexOf('controller_force_edge_timeout_closure')
        < edgeTimeoutHandler.indexOf('controller_try_timeout_edge_fence')
      && edgeTimeoutHandler.indexOf('controller_force_edge_timeout_closure')
        < edgeTimeoutHandler.indexOf('controller_mark_edge_probe_timeout_runtime')
      && /systemctl start meetwise-preview-edge-probe-expiry\.timer/.test(edgeTimeoutHandler)
      && !/controller_(?:try_)?lock/.test(edgeTimeoutHandler)
      && /OnUnitInactiveSec=5s/.test(edgeExpiryTimer)
      && /TimeoutStartSec=15s/.test(read('ops/ecs/systemd/meetwise-preview-edge-probe-expiry.service'))
      && /Restart=on-failure/.test(read('ops/ecs/systemd/meetwise-preview-edge-probe-expiry.service'))
      && /controller_try_lock/.test(edgeExpiry)
      && /exit 75/.test(edgeExpiry)
      && /controller_force_edge_timeout_closure/.test(edgeExpiry)
      && /controller_try_timeout_edge_fence/.test(edgeExpiry)
      && /controller_reconcile_publication/.test(edgeExpiry)
      && /controller_clear_edge_probe_timeout/.test(edgeExpiry)
      && edgeExpiry.indexOf('controller_force_edge_timeout_closure')
        < edgeExpiry.indexOf('controller_edge_fence_read')
      && /systemctl stop --no-block meetwise-preview-edge-probe-expiry\.timer/.test(edgeExpiry)
      && finalize.indexOf('systemctl stop meetwise-preview-edge-probe-watchdog.service')
        > finalize.indexOf('controller_publish_manifest "$manifest" "$public_manifest" 644')
      && finalize.indexOf('systemctl stop meetwise-preview-edge-probe-expiry.timer')
        > finalize.indexOf('controller_publish_manifest "$manifest" "$public_manifest" 644')
      && /controller_edge_fence_lock/.test(finalize)
      && /controller_complete_edge_probe_fence_held/.test(finalize)
      && finalize.indexOf('controller_publish_manifest "$manifest" "$public_manifest" 644')
        < finalize.indexOf('controller_complete_edge_probe_fence_held "$release_id"')
      && (finalize.match(/controller_assert_edge_probe_unexpired/g) ?? []).length >= 6],
  ['a timeout fence is an irrevocable negative authorization for reconciliation and cannot recreate a public permit',
    /edge_fence_state" == timed_out/.test(reconcile)
      && /controller_force_edge_timeout_closure/.test(reconcile)
      && /revoke-preview-pages-link\.sh/.test(reconcile)
      && /manifest_status" != revoked \|\| "\$ledger_state" != revoked/.test(reconcile)
      && /controller_ledger_transition "\$ledger_state" failed/.test(reconcile)
      && /controller_clear_edge_probe_timeout/.test(reconcile)
      && /controller_clear_edge_probe_timeout_runtime/.test(reconcile)
      && /controller_clear_edge_fence/.test(reconcile)
      && /controller_edge_probe_timeout_fenced/.test(controller)],
  ['hard-deadline closure stops Web and Funnel before any state-volume permit mutation',
    /controller_close_public_preview_edge\(\)/.test(controller)
      && /timeout 15s systemctl stop --wait meetwise-web-preview\.service[^\n]*&/.test(controller)
      && /timeout 15s tailscale funnel --https=443 off[^\n]*&/.test(controller)
      && /wait "\$web_pid"/.test(controller)
      && /wait "\$funnel_pid"/.test(controller)
      && controller.indexOf('controller_close_public_preview_edge || failed=1')
        < controller.indexOf('controller_clear_serving_permit || failed=1')
      && controller.lastIndexOf('controller_close_public_preview_edge || failed=1')
        < controller.lastIndexOf('controller_clear_serving_permit || failed=1')],
  ['controller lock and current release trust checks use dedicated root-only paths',
    /\/run\/meetwise-preview-controller\/controller\.lock/.test(controller)
      && !/\/run\/lock\/meetwise-preview-controller/.test(controller)
      && /controller_assert_root_readonly_path/.test(controller)
      && /preview release trust path is writable outside root/.test(controller)],
  ['use case retains all seven required test classes', ['main', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6'].every((suffix) => useCase.includes(`TC-ecs-public-preview-web-ingress-01-${suffix}`))],
];

for (const [name, ok] of checks) assert.equal(ok, true, name);
console.log(`✓ ecs preview configuration ${checks.length}/${checks.length} static assertions passed; releaseEvidence=false`);
