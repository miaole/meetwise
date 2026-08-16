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
      && !/(DATABASE_URL|REDIS|MODEL_API_KEY|DASHSCOPE|MIGRATION|PASSWORD|TOKEN=)/.test(unit)],
  ['all release entrypoints require an installed root-owned checksum-verified controller path',
    /controller_entry_guard/.test(controller)
      && /sha256sum --check --status controller\.sha256/.test(controller)
      && [prepare, deploy, funnel, finalize, revoke, release, verify].every((source) => /source \/usr\/local\/lib\/meetwise-preview-controller\/controller-lib\.sh/.test(source) && /controller_entry_guard /.test(source))
      && ![prepare, deploy, funnel, finalize, revoke, release, verify].some((source) => /\$release_dir\/ops\//.test(source))],
  ['controller bootstrap verifies a root-owned archive copy, its own signed bytes and archive safety before installing an immutable controller manifest',
    /gh attestation verify/.test(installer)
      && /install -o root -g root -m 0600/.test(installer)
      && /cmp --silent "\$0"/.test(installer)
      && /archive-safety\.mjs/.test(installer)
      && /--signer-workflow/.test(installer)
      && /controller\.sha256/.test(installer)
      && /chown -R root:root/.test(installer)
      && /chmod -R go-w/.test(installer)
      && /controller-files\.txt/.test(installer)],
  ['the release archive is staged before GitHub attestation and has a strict normal-file-only extraction boundary',
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
      && /preview_archive_duplicate_member/.test(archiveSafety)],
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
  ['activation has rollback and only transitions the serial ledger after loopback proof',
    /rollback\(\)/.test(deploy)
      && /systemctl restart meetwise-web-preview\.service/.test(deploy)
      && /controller_ledger_transition staged active_unpublished/.test(deploy)
      && /active release marker mismatch/.test(deploy)
      && /\/api\/privacy\/export/.test(deploy)],
  ['funnel refuses to overwrite a foreign mapping and accepts only the exact local host and loopback target',
    /absent-or-assert/.test(funnel)
      && /if \[\[ "\$before" == absent \]\]/.test(funnel)
      && /funnel --https=443 --yes --bg http:\/\/127\.0\.0\.1:8080/.test(funnel)
      && /preview-funnel-target\.mjs assert/.test(funnel)],
  ['the orchestrator owns one lock across revoke, stage, activation, Funnel, signing and black-box verification',
    /controller_lock/.test(release)
      && /revoke-preview-pages-link\.sh/.test(release)
      && /prepare-preview-web-release\.sh/.test(release)
      && /deploy-preview-web\.sh/.test(release)
      && /enable-preview-funnel\.sh/.test(release)
      && /finalize-preview-web-release\.sh/.test(release)
      && /verify-preview-web\.sh/.test(release)
      && /MEETWISE_PREVIEW_CONTROLLER_LOCK_HELD=1/.test(release)],
  ['the full edge black-box receipt is created before signing and the signed record binds it with a key-pair and finite validity record',
    /preview_ledger_active_release_mismatch/.test(finalize)
      && /preview_blackbox_receipt_invalid/.test(finalize)
      && /preview_signing_key_public_pair_mismatch/.test(finalize)
      && /manifestFingerprint/.test(finalize)
      && /controller_ledger_transition active_unpublished verified/.test(finalize)
      && /preview_manifest_expired/.test(manifest)
      && /\['verified', 'revoked'\]/.test(manifest)
      && /preview_manifest_revocation_invalid/.test(manifest)],
  ['a signed revocation must receive an independently published Pages-disabled receipt before a new edge release can replace it',
    /status: 'revoked'/.test(revoke)
      && /preview-link-state\.json/.test(revoke)
      && /Pages confirmed the preview link is disabled/.test(revoke)
      && /controller_ledger_transition verified revoked/.test(revoke)
      && /manifestFingerprint/.test(revoke)
      && /for _ in \{1\.\.260\}/.test(revoke)],
  ['the Pages workflow fetches a signed edge record, verifies its content digest and publishes a disabled artifact on failure or revocation',
    /fetch-preview-release-manifest\.mjs/.test(pagesWorkflow)
      && /verify-preview-origin\.mjs \.preview-release-manifest\.json/.test(pagesWorkflow)
      && /--force-disabled/.test(pagesWorkflow)
      && /cron: '17 \* \* \* \*'/.test(pagesWorkflow)
      && !/pull_request_target/.test(pagesWorkflow)],
  ['the orchestrator executes black-box verification before it can sign or publish a verified manifest',
    release.indexOf('verify-preview-web.sh') < release.indexOf('finalize-preview-web-release.sh')],
  ['use case retains all seven required test classes', ['main', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6'].every((suffix) => useCase.includes(`TC-ecs-public-preview-web-ingress-01-${suffix}`))],
];

for (const [name, ok] of checks) assert.equal(ok, true, name);
console.log(`✓ ecs preview configuration ${checks.length}/${checks.length} static assertions passed; releaseEvidence=false`);
