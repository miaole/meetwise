import { readFileSync } from 'node:fs';

// compose 单机：app 层（api/worker/web）已容器化，systemd 只保留控制面单元
// （publication-recovery / edge-probe-expiry / edge-restore / revocation-retry / synthetic-large）。
// 本 proof 校验剩余宿主编排契约：nginx 仍是宿主系统服务（funnel 唯一公网入口），
// app 的宿主绑定只回环（deploy-check 另断言 127.0.0.1:8787/3000），web 启动由 publisher 状态机门控。
const files = [
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
const apiMain = readFileSync(new URL('../apps/api/src/main.ts', import.meta.url), 'utf8');
const recovery = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-publication-recovery.service', import.meta.url), 'utf8');
const funnelClose = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-funnel-close.sh', import.meta.url), 'utf8');
const funnelEnable = readFileSync(new URL('../ops/ecs/full-stack/full-stack-preview-funnel-enable.sh', import.meta.url), 'utf8');
const edgeExpiry = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-edge-probe-expiry.service', import.meta.url), 'utf8');
const edgeExpiryScript = readFileSync(new URL('../ops/ecs/full-stack/full-stack-edge-probe-expire.sh', import.meta.url), 'utf8');
const edgeRestore = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-edge-restore.service', import.meta.url), 'utf8');
const revocationRetry = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-revocation-retry.service', import.meta.url), 'utf8');
const revocationTimer = readFileSync(new URL('../ops/ecs/full-stack/meetwise-full-stack-revocation-retry.timer', import.meta.url), 'utf8');

// 应用进程「HOST 未设时回环」的防御仍在源码；容器内 0.0.0.0 由 compose 显式设 HOST=0.0.0.0
// （port 映射需要），宿主侧只回环绑定，公网唯一入口仍是 funnel → nginx:80 → web:3000。
check('API defaults to loopback when HOST is unset (in-container 0.0.0.0 is an explicit compose override)', /process\.env\.HOST \|\| '127\.0\.0\.1'/.test(apiMain) && !/process\.env\.HOST \|\| '0\.0\.0\.0'/.test(apiMain));
check('Worker metrics are not proxied', !/9091/.test(text[files[0]]));
check('Nginx proxies only the Web loopback', /proxy_pass http:\/\/127\.0\.0\.1:3000/.test(text[files[0]]) && !/8787/.test(text[files[0]]));
check('Nginx public preview does not retain Basic Auth credentials', !/auth_basic(?:_user_file)?/.test(text[files[0]]));
check('Installer uses an atomic current pointer rename', /current\.new[\s\S]+mv -Tf/.test(text[files[1]]));
check('Installer verifies systemd and Nginx before restart', /systemd-analyze verify/.test(text[files[1]]) && /nginx -t/.test(text[files[1]]));
// P0-1（F2）：install 不再安装 synthetic-large 的 root 执行单元，也不再落一份宿主 loader 副本。
// large-v1 合成装载改由 CD `synthetic-verify` 经 runuser -u meetwise-synthetic 从 release 源码树跑
// （见 ecs-full-stack-release.proof.mjs 的 runuser 断言）——root 不再执行 tarball 上传的 loader。
// 无尾斜杠：连「裸 install -d /usr/local/lib/meetwise-preview-synthetic」都要抓（尾斜杠会漏）。
// 前缀 /usr/local/lib 与 STATE_ROOT /var/lib/meetwise-preview-synthetic 不同，绝不误伤后者。
check('Installer no longer installs a root-exec synthetic-large unit or a host loader copy', !/meetwise-preview-synthetic-large\.service/.test(text[files[1]]) && !/\/usr\/local\/lib\/meetwise-preview-synthetic/.test(text[files[1]]));
check('Nginx and the publisher share the canonical revocable manifest', /alias \/usr\/share\/meetwise-preview\/preview-release-manifest\.json/.test(text[files[0]]) && /publicManifest: '\/usr\/share\/meetwise-preview\/preview-release-manifest\.json'/.test(text[files[2]]));
check('Installer stages the reviewed full-stack publisher', /full-stack-preview-publisher\.mjs/.test(text[files[1]]));
check('Publisher uses the shared controller flock and a fixed root launcher', /controller\.lock/.test(text[files[2]]) && /full-stack-preview-publication\.sh/.test(text[files[1]]));
check('Installer retires legacy public-manifest writers under the shared lock', /exec 9>\/run\/meetwise-preview-controller\/controller\.lock/.test(text[files[1]]) && /meetwise-preview-edge-probe-expiry\.service/.test(text[files[1]]) && /full-stack-writer-retired/.test(text[files[1]]) && /legacy_preview_writer_state_invalid/.test(text[files[1]]));
// web 启动门控：compose 下 web 只在 activate()/restore 经 runCompose up -d 拉起，
// 且 activate() 先校验 state.status（否则 full_stack_activation_state_invalid）；revoke/edge-close 用
// sticky stop（docker compose stop web，restart:unless-stopped 不会自动拉起）封住吊销期重启。
check('Web boot is gated by publication state (compose up -d web only from activate/restore)', /full_stack_activation_state_invalid/.test(text[files[2]]) && /runCompose\(\['up', '-d', 'web'\]\)/.test(text[files[2]]) && /full-stack-preview-publication recover/.test(recovery));
check('Installer closes the old edge before staging and clears the staging gate only after publish', text[files[1]].indexOf('full-stack-preview-edge-close') < text[files[1]].indexOf('full-stack-internal-staging.json') && text[files[1]].indexOf('full-stack-preview-publication publish') < text[files[1]].indexOf('rm -f /var/lib/meetwise-preview-controller/full-stack-internal-staging.json'));
check('Internal staging recovery keeps Funnel closed', /full-stack-preview-funnel-close/.test(text[files[2]]) && /controller_funnel_status_is_closed/.test(funnelClose) && /Restart=on-failure/.test(recovery));
check('Installer leaves public activation pending after internal verification', /full_stack_public_activation_pending/.test(text[files[1]]) && !/\nfull-stack-preview-funnel-enable(?:\s|$)/.test(text[files[1]]));
check('Public activation has an independent physical-first and post-lock expiry fence', /command === 'activate'/.test(text[files[2]]) && /command === 'confirm-public'/.test(text[files[2]]) && /command === 'expire-probe'/.test(text[files[2]]) && /full-stack-edge-probe-expire/.test(edgeExpiry) && edgeExpiryScript.indexOf('full-stack-preview-edge-close') < edgeExpiryScript.indexOf('MEETWISE_FULL_STACK_PUBLICATION_LOCK_FD=9') && edgeExpiryScript.lastIndexOf('full-stack-preview-edge-close') < edgeExpiryScript.indexOf('full-stack-preview-publisher.mjs expire-probe') && /full-stack-edge-probe-expire\.sh/.test(text[files[1]]));
check('Confirmed edge restoration is durable and resumes after Web boot', /restoring_confirmed_edge/.test(text[files[2]]) && /restore-confirmed-edge/.test(edgeRestore) && /After=.*nginx\.service/.test(edgeRestore) && !/meetwise-web\.service/.test(edgeRestore) && /meetwise-full-stack-edge-restore\.service/.test(text[files[1]]));
check('A live revocation supervisor owns every durable stop intent', /resume-revocation/.test(revocationRetry) && /After=.*nginx\.service/.test(revocationRetry) && /OnUnitActiveSec=5s/.test(revocationTimer) && /meetwise-full-stack-revocation-retry\.timer/.test(text[files[1]]) && text[files[2]].indexOf("'enable', '--now', 'meetwise-full-stack-revocation-retry.timer'") < text[files[2]].indexOf("pendingState('revoking_stop_pending'") && /timerState\.trim\(\) !== 'active'/.test(text[files[2]]));
check('Funnel activation binds the approval origin, deadline and exact target', /http:\/\/127\.0\.0\.1:80/.test(funnelEnable) && /full-stack-funnel-status\.mjs/.test(funnelEnable) && /deadline_ms/.test(funnelEnable) && /full_stack_funnel_deadline_expired/.test(funnelEnable));
check('Installer includes every clean-install publisher dependency', /preview-release-manifest\.mjs/.test(text[files[1]]) && /meetwise-full-stack-edge-probe-expiry\.timer/.test(text[files[1]]));
check('Full-stack revocation performs bounded and verified edge closure', /--kill-after=1s 15s compose stop web/.test(text[files[3]]) && /controller_funnel_status_is_closed/.test(text[files[3]]) && /ps --status running -q web/.test(text[files[3]]) && /full-stack-preview-edge-close/.test(text[files[2]]));
console.log(`\n${failures === 0 ? 'static full-stack runtime contract passed' : `${failures} failures`}`);
process.exit(failures === 0 ? 0 : 1);
