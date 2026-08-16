import { readFileSync } from 'node:fs';

const files = [
  'ops/ecs/full-stack/meetwise-api.service',
  'ops/ecs/full-stack/meetwise-worker.service',
  'ops/ecs/full-stack/meetwise-web.service',
  'ops/ecs/full-stack/nginx-meetwise-full-stack.conf',
  'ops/ecs/full-stack/install-full-stack-runtime.sh',
  'ops/ecs/full-stack/full-stack-preview-publisher.mjs',
  'ops/ecs/full-stack/full-stack-preview-edge-close.sh',
];
let failures = 0;
const check = (name, condition) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const text = Object.fromEntries(files.map((file) => [file, readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')]));
const recovery = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-publication-recovery.service', import.meta.url), 'utf8');
const funnelClose = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-funnel-close.sh', import.meta.url), 'utf8');
const funnelEnable = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-funnel-enable.sh', import.meta.url), 'utf8');
const edgeExpiry = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-edge-probe-expiry.service', import.meta.url), 'utf8');
const edgeExpiryScript = readFileSync(new URL('../ops/ecs/full-stack/full-stack-edge-probe-expire.sh', import.meta.url), 'utf8');
const edgeRestore = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-edge-restore.service', import.meta.url), 'utf8');
const revocationRetry = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-revocation-retry.service', import.meta.url), 'utf8');
const revocationTimer = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-revocation-retry.timer', import.meta.url), 'utf8');
for (const unit of files.filter((file) => file.endsWith('.service'))) {
  check(`${unit} uses the meetwise account`, /User=meetwise\nGroup=meetwise/.test(text[unit]));
  check(`${unit} has a memory ceiling`, /MemoryMax=/.test(text[unit]));
  check(`${unit} reads root-managed environment files`, /EnvironmentFile=\/etc\/meetwise\//.test(text[unit]));
}
check('API binds through service configuration, not a public unit port', !/0\.0\.0\.0:8787/.test(text[files[0]]));
check('Worker metrics are not proxied', !/9091/.test(text[files[3]]));
check('Nginx proxies only the Web loopback', /proxy_pass http:\/\/127\.0\.0\.1:3000/.test(text[files[3]]) && !/8787/.test(text[files[3]]));
check('Nginx public preview does not retain Basic Auth credentials', !/auth_basic(?:_user_file)?/.test(text[files[3]]));
check('Installer uses an atomic current pointer rename', /current\.new[\s\S]+mv -Tf/.test(text[files[4]]));
check('Installer verifies systemd and Nginx before restart', /systemd-analyze verify/.test(text[files[4]]) && /nginx -t/.test(text[files[4]]));
check('Installer stages the synthetic loader and verifies its systemd unit', /meetwise-preview-synthetic-large\.service/.test(text[files[4]]) && /scripts\/preview-synthetic-data/.test(text[files[4]]) && /systemd-analyze verify[^\n]+meetwise-preview-synthetic-large\.service/.test(text[files[4]]));
check('Nginx and the publisher share the canonical revocable manifest', /alias \/usr\/share\/meetwise-preview\/preview-release-manifest\.json/.test(text[files[3]]) && /publicManifest: '\/usr\/share\/meetwise-preview\/preview-release-manifest\.json'/.test(text[files[5]]));
check('Installer stages the reviewed full-stack publisher', /full-stack-preview-publisher\.mjs/.test(text[files[4]]));
check('Publisher uses the shared controller flock and a fixed root launcher', /controller\.lock/.test(text[files[5]]) && /full-stack-preview-publication\.sh/.test(text[files[4]]));
check('Installer retires legacy public-manifest writers under the shared lock', /exec 9>\/run\/meetwise-preview-controller\/controller\.lock/.test(text[files[4]]) && /meetwise-preview-edge-probe-expiry\.service/.test(text[files[4]]) && /full-stack-writer-retired/.test(text[files[4]]) && /legacy_preview_writer_state_invalid/.test(text[files[4]]));
check('Web boot is gated by recovery and root-owned publication state', /ExecStartPre=\/usr\/bin\/systemctl is-active --quiet meetwise-full-stack-publication-recovery\.service/.test(text[files[2]]) && /ExecStartPre=\+\/usr\/local\/sbin\/full-stack-preview-publication assert-web-start-permitted/.test(text[files[2]]) && !/Requires=meetwise-full-stack-publication-recovery/.test(text[files[2]]) && /full-stack-preview-publication recover/.test(recovery) && /full_stack_web_start_not_permitted/.test(text[files[5]]));
check('Installer verifies the new loopback stack before publication', text[files[4]].indexOf('full-stack-preview-edge-close') < text[files[4]].indexOf('full-stack-internal-staging.json') && text[files[4]].indexOf('systemctl restart meetwise-web.service') < text[files[4]].indexOf('full-stack-preview-publication publish'));
check('Internal staging recovery keeps Funnel closed', /full-stack-preview-funnel-close/.test(text[files[5]]) && /controller_funnel_status_is_closed/.test(funnelClose) && /Restart=on-failure/.test(recovery));
check('Installer leaves public activation pending after internal verification', /full_stack_public_activation_pending/.test(text[files[4]]) && !/\nfull-stack-preview-funnel-enable(?:\s|$)/.test(text[files[4]]));
check('Public activation has an independent physical-first and post-lock expiry fence', /command === 'activate'/.test(text[files[5]]) && /command === 'confirm-public'/.test(text[files[5]]) && /command === 'expire-probe'/.test(text[files[5]]) && /full-stack-edge-probe-expire/.test(edgeExpiry) && edgeExpiryScript.indexOf('full-stack-preview-edge-close') < edgeExpiryScript.indexOf('MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9') && edgeExpiryScript.lastIndexOf('full-stack-preview-edge-close') < edgeExpiryScript.indexOf('full-stack-preview-publisher.mjs expire-probe') && /full-stack-edge-probe-expire\.sh/.test(text[files[4]]));
check('Confirmed edge restoration is durable and resumes after Web boot', /restoring_confirmed_edge/.test(text[files[5]]) && /restore-confirmed-edge/.test(edgeRestore) && /After=.*meetwise-web\.service.*nginx\.service/.test(edgeRestore) && /meetwise-full-stack-edge-restore\.service/.test(text[files[4]]));
check('A live revocation supervisor owns every durable stop intent', /resume-revocation/.test(revocationRetry) && /After=.*nginx\.service/.test(revocationRetry) && /OnUnitActiveSec=5s/.test(revocationTimer) && /meetwise-full-stack-revocation-retry\.timer/.test(text[files[4]]) && text[files[5]].indexOf("'enable', '--now', 'meetwise-full-stack-revocation-retry.timer'") < text[files[5]].indexOf("pendingState('revoking_stop_pending'") && /timerState\.trim\(\) !== 'active'/.test(text[files[5]]));
check('Funnel activation binds the approval origin, deadline and exact target', /http:\/\/127\.0\.0\.1:80/.test(funnelEnable) && /full-stack-funnel-status\.mjs/.test(funnelEnable) && /deadline_ms/.test(funnelEnable) && /full_stack_funnel_deadline_expired/.test(funnelEnable));
check('Installer includes every clean-install publisher dependency', /preview-release-manifest\.mjs/.test(text[files[4]]) && /meetwise-full-stack-edge-probe-expiry\.timer/.test(text[files[4]]));
check('Full-stack revocation performs bounded and verified edge closure', /--kill-after=1s 15s systemctl stop meetwise-web\.service/.test(text[files[6]]) && /controller_funnel_status_is_closed/.test(text[files[6]]) && /controller_unit_is_inactive meetwise-web\.service/.test(text[files[6]]) && /full-stack-preview-edge-close/.test(text[files[5]]));
console.log(`\n${failures === 0 ? 'static full-stack runtime contract passed' : `${failures} failures`}`);
process.exit(failures === 0 ? 0 : 1);
