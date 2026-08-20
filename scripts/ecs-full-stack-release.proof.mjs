import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');

const provisionCd = read('ops/ecs/full-stack/provision-meetwise-cd.sh');
const prepare = read('ops/ecs/full-stack/prepare-full-stack-release.mjs');
const receive = read('ops/ecs/full-stack/meetwise-cd-receive.sh');
const dispatch = read('ops/ecs/full-stack/meetwise-cd-root.sh');
const workflow = read('.github/workflows/deploy-full-stack.yml');
const pagesWorkflow = read('.github/workflows/pages-preview.yml');
const publisher = read('ops/ecs/full-stack/full-stack-preview-publisher.mjs');
const verifyOrigin = read('scripts/verify-full-stack-public-origin.mjs');
const loader = read('scripts/preview-synthetic-data/loader.mjs');
const edgeClose = read('ops/ecs/full-stack/full-stack-preview-edge-close.sh');
const install = read('ops/ecs/full-stack/install-full-stack-runtime.sh');

// --- prepare-full-stack-release.mjs -------------------------------------------------
// 确定性生成：digest 必须复用本次 release 的 catalog.mjs 导出，绝不自带 crypto 副本。
assert.ok(!prepare.includes("from 'node:crypto'"), 'prepare must not roll its own crypto');
assert.match(prepare, /await import\(join\(releasePath, 'scripts\/preview-synthetic-data\/catalog\.mjs'\)\)/);
assert.match(prepare, /const \{ buildPlan, sha256(?:, [^}]+)? \} = await import/);
assert.match(prepare, /successorOfTargetDigest: sha256\(previous\)/);
assert.match(prepare, /prepare_requires_root/);
assert.match(prepare, /releasePath\.startsWith\('\/srv\/meetwise-full-stack\/releases\/'\)/);
assert.match(prepare, /prepare_release_path_invalid/);
assert.match(prepare, /prepare_inherited_cloud_facts_invalid/);
// kebab key（P0-2）：parseArgs 产出 `release-path`，读 camelCase `args.releasePath` 恒 undefined。
assert.ok(!prepare.includes('args.releasePath'), 'prepare must read the kebab --release-path key, not camelCase');
assert.match(prepare, /resolve\(args\['release-path'\]\)/);
// 冻结云事实必须继承并校验，绝不在发布时伪造端点/角色。
assert.match(prepare, /rdsEndpoint !== `\$\{frozen\.rdsInstanceId\}\.pg\.rds\.aliyuncs\.com`/);
assert.match(prepare, /frozen\.expectedDbRole !== VERIFIER_EXPECTED_ROLE/);
assert.match(prepare, /frozen\.database !== VERIFIER_EXPECTED_DATABASE/);
// 唯一 stdout 只输出 targetDigest/generation/releasePath，不打印任何密钥/连接串。
assert.match(prepare, /process\.stdout\.write\(`\$\{JSON\.stringify\(\{ targetDigest, generation, releasePath \}, null, 2\)\}\\n`\)/);
assert.ok(!prepare.includes('DATABASE_URL}\n'), 'prepare must not print DATABASE_URL');

// --- meetwise-cd-receive.sh (强制命令，第一道校验) ----------------------------------
assert.match(receive, /\[\[ -n "\$cmd" \]\]/);
assert.match(receive, /meetwise_cd_no_interactive_shell/);
assert.match(receive, /meetwise_cd_metacharacter_rejected/);
assert.match(receive, /meetwise_cd_unknown_command/);
assert.ok(!receive.includes('eval'), 'receive must not eval');
assert.ok(!receive.includes('sh -c'), 'receive must not spawn a shell');
assert.ok(!receive.includes('bash -c'), 'receive must not spawn bash');
// argv 偏移（P0-1）：workflow 发送 `meetwise-cd <sub> ...` 前缀，argv[0]=meetwise-cd，
// 真正的子命令在 argv[1]；前缀不符即拒，子命令从 argv[1] 取。绝不再从 argv[0] 分派。
assert.match(receive, /\[\[ "\$\{argv\[0\]:-\}" == meetwise-cd \]\]/);
assert.match(receive, /sub="\$\{argv\[1\]:-\}"/);
for (const sub of ['receive-source', 'install-deps', 'prepare', 'probe-nonce', 'verify-public', 'controller-version']) {
  assert.ok(receive.includes(sub), `receive must whitelist ${sub}`);
}
// Image pull and publication revoke are transaction-only actions. The receive
// boundary must still expose their names inside the transaction allowlist.
assert.match(receive, /transaction/);
assert.match(receive, /compose-pull/);
assert.match(receive, /revoke-predecessor/);
assert.match(receive, /exec sudo "\$ROOT_DISPATCH"/);
const receiveStatusAt = receive.indexOf('      status)');
const receiveStatusEnd = receive.indexOf('      *)', receiveStatusAt);
assert.ok(receiveStatusAt > 0 && receiveStatusEnd > receiveStatusAt, 'receive must expose a bounded transaction status command');
const receiveStatusBlock = receive.slice(receiveStatusAt, receiveStatusEnd);
assert.match(receiveStatusBlock, /\[\[ \$\{#argv\[@\]\} -eq 6 \]\]/);
assert.match(receiveStatusBlock, /\[\[ "\$\{argv\[3\]\}" =~ \$TRANSACTION_ID_RE && "\$\{argv\[4\]\}" =~ \$RELEASE_RE && "\$\{argv\[5\]\}" =~ \$TOKEN_RE \]\]/);
// 只有 receive-source 与 confirm-public 接受 stdin；其余命令不读 stdin。
assert.match(receive, /head -c 268435457 > "\$temporary"/);
assert.match(receive, /sha256sum "\$temporary"/);
assert.match(receive, /source_digest_mismatch/);
assert.match(receive, /head -c 65537 > "\$INCOMING\/receipt\.json\.tmp"/);

// --- meetwise-cd-root.sh (root 侧调度，第二道校验) ----------------------------------
assert.match(dispatch, /\[\[ "\$\{EUID\}" -eq 0 \]\]/);
assert.match(dispatch, /meetwise_cd_root_requires_root/);
assert.match(dispatch, /RELEASE_RE='\^\[a-f0-9\]\{40\}-fullstack-\[0-9\]\{8\}-\[1-9\]\[0-9\]\*-\[1-9\]\[0-9\]\*\$'/);
// root 侧用 die() 统一产出 fail-closed reason code：printf 'meetwise_cd_%s\n' 前缀。
assert.match(dispatch, /die\(\) \{ printf 'meetwise_cd_%s\\n'/);
assert.match(dispatch, /die release_name_invalid/);
assert.match(dispatch, /die release_path_invalid/);
assert.match(dispatch, /die unknown_subcommand/);
assert.match(dispatch, /MIGRATE_ENV=\/etc\/meetwise\/full-stack-migrate\.env/);
// 绝不回显任何密钥：禁止 echo 任何 env 文件内容。
assert.ok(!dispatch.includes('echo "$DATABASE_URL"'), 'root must not echo DATABASE_URL');
assert.ok(!dispatch.includes('echo "$MIGRATE_ENV"'), 'root must not echo the migrate env');
// publish 后必须移除 staging 门（与 install 脚本镜像），否则 activate 无法恢复公网。
assert.match(dispatch, /rm -f \/var\/lib\/meetwise-preview-controller\/full-stack-internal-staging\.json/);
// 合成执行器必须来自已安装且 live-digest 校验过的 controller；候选 release
// 代码不得获得 DB verifier 或 B/C credential env。
assert.match(dispatch, /SYNTHETIC_LOADER="\$SYNTHETIC_CONTROLLER_ROOT\/loader\.mjs"/);
assert.match(dispatch, /DEEP_USAGE_RUNNER=\/usr\/local\/lib\/meetwise-preview-controller\/preview-account-scenarios\/runner\.mjs/);
// confirm-public 先把回执从 meetwise-cd 的不可信入站区校验后提升为 root 文件。
assert.match(dispatch, /install -o root -g root -m 0600 "\$receipt" "\$VERIFICATION"/);
assert.match(dispatch, /VERIFICATION=\/etc\/meetwise\/full-stack-public-verification\.json/);
// Root owns generation derivation, image pull/revoke authorization, and schema
// capture; these must be wired through the transaction dispatcher rather than
// exposed as unbound top-level mutations.
assert.match(dispatch, /derive_transaction_generation/);
assert.match(dispatch, /transaction_compose_pull/);
assert.match(dispatch, /transaction_revoke_predecessor/);
assert.match(dispatch, /transaction_migrate/);
assert.match(dispatch, /snapshot\|compose-pull\|revoke-predecessor\|close-edge/);
const rootRevokeAt = dispatch.indexOf('transaction_revoke_predecessor()');
const rootRevokeEnd = dispatch.indexOf('transaction_migrate()', rootRevokeAt);
assert.ok(rootRevokeAt > 0 && rootRevokeEnd > rootRevokeAt, 'root must isolate predecessor revoke in its transaction action');
const rootRevokeBlock = dispatch.slice(rootRevokeAt, rootRevokeEnd);
assert.match(rootRevokeBlock, /predecessorRevoked/);
assert.match(rootRevokeBlock, /generation/);
assert.match(rootRevokeBlock, /fingerprint/);
const rootStatusAt = dispatch.indexOf('    status)');
const rootStatusEnd = dispatch.indexOf('    wait-pages)', rootStatusAt);
assert.ok(rootStatusAt > 0 && rootStatusEnd > rootStatusAt, 'root must expose a bounded transaction status command');
const rootStatusBlock = dispatch.slice(rootStatusAt, rootStatusEnd);
assert.match(rootStatusBlock, /\[\[ \$# -eq 5 \]\]/);
assert.match(rootStatusBlock, /local transaction_id="\$3" release="\$4" token="\$5"/);
assert.match(rootStatusBlock, /assert_transaction_args "\$transaction_id" "\$release" "\$token"/);
assert.ok(!/^  compose-pull\)/m.test(receive), 'receive must not expose an unbound compose-pull command');
assert.ok(!/^  revoke\)/m.test(receive), 'receive must not expose an unbound revoke command');
assert.match(dispatch, /^  compose-pull\)\s+die legacy_direct_compose_pull_disabled/m);
assert.match(dispatch, /^  revoke\)\s+die legacy_direct_revoke_disabled/m);

// --- publisher probe-nonce（只读 nonce 访问，不碰锁、不写状态） ---------------------
assert.match(publisher, /command === 'probe-nonce' \? probeNonce\(\)/);
assert.match(publisher, /full_stack_probe_nonce_requires_root/);
assert.match(publisher, /state\.status !== 'edge_probing'/);
assert.match(publisher, /full_stack_probe_nonce_unavailable/);
assert.match(publisher, /process\.stdout\.write\(`\$\{state\.probeNonce\}\\n`\)/);

// --- ADR-0021 回执签名：外部验证器签、ECS 只验签（公网激活不是 ECS 自证） -------------
// verify-origin 用「仅存在于 GitHub Actions 的私钥」签名回执，签名绑定 nonce+manifestSha256+表面哈希。
assert.match(verifyOrigin, /probe-receipt-ed25519-v1/);
assert.match(verifyOrigin, /sign\(null, Buffer\.from\(canonicalJson\(unsigned\)\)/);
assert.match(verifyOrigin, /createPrivateKey\(signingKeyPem\)/);
assert.match(verifyOrigin, /--signing-key/);
// publisher 只持公钥验签，且伪造/未签名回执 fail-closed。
assert.match(publisher, /probeReceiptPublicKey: '\/etc\/meetwise\/probe-receipt-ed25519\.pub\.pem'/);
assert.match(publisher, /full_stack_probe_receipt_signature_invalid/);
assert.match(publisher, /verify\(null, Buffer\.from\(canonicalJson\(without\(receipt, 'signature'\)\)\)/);
// 候选 workflow 不得直接获得 probe 私钥；签名由独立固定版本 verifier 完成。
assert.ok(!workflow.includes('ECS_PROBE_SIGNING_KEY'), 'candidate workflow must never receive the probe signing key');

// --- deploy-full-stack.yml ----------------------------------------------------------
assert.match(workflow, /on:/);
assert.match(workflow, /workflow_run:/);
assert.match(workflow, /workflows: \[ci\]/);
assert.match(workflow, /branches: \[main\]/);
assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /concurrency:/);
assert.match(workflow, /cancel-in-progress: false/);
// fork/PR 防护：只允许真实仓库 + main 分支。
assert.match(workflow, /github\.event\.workflow_run\.conclusion == 'success'/);
assert.match(workflow, /github\.event\.workflow_run\.event == 'push'/);
assert.match(workflow, /github\.event\.workflow_run\.head_branch == 'main'/);
assert.match(workflow, /ci_sha='\$\{\{ github\.event\.workflow_run\.head_sha \}\}'/);
assert.match(workflow, /\[\[ "\$ci_sha" =~ \^\[a-f0-9\]\{40\}\$ \]\]/);
assert.match(workflow, /test "\$commit" = "\$ci_sha"/);
assert.match(workflow, /test "\$ci_sha" = "\$current_main"/);
assert.match(workflow, /workflow_run\.workflow_id/);
assert.match(workflow, /exactly one workflow named ci is required/);
assert.match(workflow, /\.github\/workflows\/ci\.yml/);
assert.match(workflow, /actions\/runs\/\$ci_run_id/);
assert.match(workflow, /stale main before revoke/);
assert.match(workflow, /stale main before activate/);
assert.match(workflow, /stale main before confirm/);
assert.match(workflow, /stale main before commit/);
assert.match(workflow, /version: 10\.18\.0/);
for (const proof of ['cd-pages-receipt.proof.mjs', 'ecs-full-stack-release.proof.mjs', 'verify-full-stack-public-origin.proof.mjs']) {
  assert.ok(workflow.includes(`node scripts/${proof}`), `workflow must run ${proof} before external mutation`);
}
// 外部验证器：探针在 GitHub runner（ECS 之外）执行，ECS 无法自证公开可用。
assert.match(workflow, /miaole\/meetwise-deploy-control\/\.github\/workflows\/verify\.yml@ccb02e1ab7cf28b812028f7ca9b3699cef0ffc4a/);
// Pages 吊销回执耦合被显式处理（revoke 阻塞于此）。
assert.match(workflow, /gh workflow run pages-preview\.yml/);
assert.ok(!workflow.includes('2>/dev/null || true'), 'Pages dispatch failure must not be swallowed');
assert.match(workflow, /expected_state=disabled/);
assert.match(workflow, /expected_state=enabled/);
assert.match(workflow, /expected_generation/);
assert.match(workflow, /expected_manifest_sha256/);
assert.match(workflow, /transaction begin \$TRANSACTION_ID \$RELEASE \$\{\{ steps\.git\.outputs\.commit \}\} \$\{\{ steps\.git\.outputs\.tree \}\} \$RECOVERY_TOKEN[^\n]*\$ORIGIN/);
assert.match(workflow, /source_digest=\$\(sha256sum \/tmp\/source\.tar\.gz/);
assert.match(workflow, /receive-source \$release \$\{\{ steps\.source\.outputs\.source_digest \}\}/);
assert.match(dispatch, /transaction_source_digest_mismatch/);
assert.match(dispatch, /source-archive-digest/);
assert.match(workflow, /transaction begin did not return a root-owned generation/);
assert.ok(!workflow.match(/transaction begin[^\n]*\$GENERATION/), 'generation must not be supplied to transaction begin');
assert.ok(!workflow.slice(0, workflow.indexOf('meetwise-cd transaction begin')).includes('preview-release-manifest.json'), 'begin must not derive generation from the public manifest');
assert.match(workflow, /final Pages enabled receipt confirmed/);
assert.match(workflow, /exact Pages disabled recovery receipt confirmed/);
assert.match(workflow, /leave workflow failed and retryable/);
assert.match(workflow, /steps\.confirm-public\.outputs\.final_fingerprint != ''/);
assert.match(workflow, /needs\.confirm\.result != 'success'/);
assert.match(workflow, /transaction commit/);
assert.match(workflow, /meetwise-cd transaction recover/);
assert.match(workflow, /always\(\) && failure\(\) && steps\.release\.outputs\.transaction_id != ''/);
assert.match(workflow, /always\(\) && failure\(\)/);
assert.ok(!workflow.includes('ECS_PROBE_SIGNING_KEY'), 'candidate workflow must never receive the probe signing key');
const transactionBeginAt = workflow.indexOf('meetwise-cd transaction begin');
const transactionSnapshotAt = workflow.indexOf('meetwise-cd transaction snapshot');
const composePullAt = workflow.indexOf('meetwise-cd transaction compose-pull');
const revokeAt = workflow.indexOf('meetwise-cd transaction revoke-predecessor');
const closeEdgeAt = workflow.indexOf('meetwise-cd transaction close-edge');
const quiesceAt = workflow.indexOf('meetwise-cd transaction quiesce');
const migrateAt = workflow.indexOf('meetwise-cd transaction migrate');
const prepareAt = workflow.indexOf('meetwise-cd prepare');
const backendAt = workflow.indexOf('meetwise-cd transaction start-backend');
const webInternalAt = workflow.indexOf('meetwise-cd transaction start-web-internal');
const verifyDataAt = workflow.indexOf('meetwise-cd transaction verify-data');
const publishProbeAt = workflow.indexOf('meetwise-cd transaction publish-probe');
const activateAt = workflow.indexOf('meetwise-cd transaction activate');
assert.ok(transactionBeginAt > 0 && transactionSnapshotAt > transactionBeginAt && composePullAt > transactionSnapshotAt && revokeAt > composePullAt && closeEdgeAt > revokeAt && quiesceAt > closeEdgeAt && migrateAt > quiesceAt && prepareAt > migrateAt && backendAt > prepareAt && webInternalAt > backendAt && verifyDataAt > webInternalAt && publishProbeAt > verifyDataAt && activateAt > publishProbeAt, 'full-stack transaction steps must remain ordered and token-bound');
const revokeIdentityBlock = workflow.slice(revokeAt, closeEdgeAt);
assert.match(revokeIdentityBlock, /transaction status \$TRANSACTION_ID \$RELEASE \$RECOVERY_TOKEN/);
assert.match(revokeIdentityBlock, /candidate\?\.predecessorRevoked/);
assert.match(revokeIdentityBlock, /revoked_generation < GENERATION/);
assert.match(revokeIdentityBlock, /expected_generation="\$revoked_generation"/);
assert.doesNotMatch(revokeIdentityBlock, /expected_generation="\$GENERATION"/);
assert.doesNotMatch(revokeIdentityBlock, /preview-release-manifest\.json|\bcurl\b/, 'predecessor identity must not be guessed from the public manifest');
assert.match(workflow, /meetwise-cd transaction compose-pull \$TRANSACTION_ID \$RELEASE \$RECOVERY_TOKEN/);
assert.match(workflow, /meetwise-cd transaction revoke-predecessor \$TRANSACTION_ID \$RELEASE \$RECOVERY_TOKEN/);
assert.doesNotMatch(workflow, /meetwise-ecs "meetwise-cd compose-pull/);
assert.doesNotMatch(workflow, /meetwise-ecs "meetwise-cd revoke(?: |\")/);
assert.match(workflow, /meetwise-cd transaction migrate \$TRANSACTION_ID \$RELEASE \$RECOVERY_TOKEN/);
assert.doesNotMatch(workflow, /transaction migrate[^\n]*schema/);
const disabledRecoveryAt = workflow.indexOf('Recover Pages to an exact disabled receipt after post-confirm failure');
const waitPagesAt = workflow.indexOf('transaction wait-pages');
const commitStepAt = workflow.lastIndexOf('ssh meetwise-ecs "meetwise-cd transaction commit');
assert.ok(disabledRecoveryAt > 0 && disabledRecoveryAt < commitStepAt && waitPagesAt < commitStepAt, 'Pages disabled recovery and exact receipt binding must precede any possible commit');
assert.equal((workflow.match(/exactly one workflow named ci is required before (?:revoke|confirm|commit)/g) ?? []).length, 3, 'pre-revoke/confirm/commit must revalidate unique ci');
assert.match(pagesWorkflow, /expected_state/);
assert.match(pagesWorkflow, /expected_generation/);
assert.match(pagesWorkflow, /expected_manifest_sha256/);
assert.match(pagesWorkflow, /state\.state !== expected\.state/);
const finalVerifyAt = workflow.lastIndexOf('ssh meetwise-ecs "meetwise-cd verify-public"');
assert.ok(finalVerifyAt > 0 && commitStepAt > finalVerifyAt, 'final ECS public verification must precede durable transaction commit');
// 全程无内联密钥，只有 ${{ secrets.* }} 引用。
assert.ok(!workflow.includes('-----BEGIN'), 'workflow must not inline a private key');
assert.match(workflow, /\$\{\{ secrets\.TAILSCALE_OAUTH_CLIENT_ID \}\}/);
assert.match(workflow, /\$\{\{ secrets\.ECS_CD_DEPLOY_KEY \}\}/);
// 强制命令入口：所有 ECS 动作都经 meetwise-cd 强制命令包装器。
for (const cmd of ['receive-source', 'install-deps', 'prepare', 'transaction compose-pull', 'transaction revoke-predecessor', 'transaction status', 'transaction begin', 'transaction snapshot', 'transaction close-edge', 'transaction quiesce', 'transaction migrate', 'transaction start-backend', 'transaction start-web-internal', 'transaction verify-data', 'transaction publish-probe', 'transaction activate', 'probe-nonce', 'transaction confirm', 'transaction wait-pages', 'transaction commit', 'transaction recover', 'verify-public', 'controller-version']) {
  assert.ok(workflow.includes(`meetwise-cd ${cmd}`), `workflow must route ${cmd} through meetwise-cd`);
}
// 探针在 activate 之后、confirm-public 之前（10 分钟硬窗口内）。
const probeAt = workflow.indexOf('meetwise-deploy-control');
const confirmAt = workflow.indexOf('meetwise-cd transaction confirm');
assert.ok(activateAt > 0 && probeAt > activateAt && confirmAt > probeAt, 'probe must sit between activate and token-bound confirm');

// --- compose 单机：镜像在 CI 构建+推送，ECS 只 pull/up/run，绝不在 ECS build -----------------
// root 侧所有 docker compose 调用收敛到 run_compose（.env/-f 路径只此一处）。
assert.ok(dispatch.includes('run_compose()'), 'root must funnel compose via run_compose()');
assert.ok(dispatch.includes("COMPOSE_FILE=\"$COMPOSE_DIR/docker/compose.prod.yml\""), 'root must use an absolute -f (CWD drift)');
assert.ok(dispatch.includes("IMAGE_DIGEST_RE='^sha256:[a-f0-9]{64}$'"), 'root must validate @sha256 image digests');
assert.ok(dispatch.includes('run_compose pull'), 'root must pull (never build) images');
assert.ok(dispatch.includes('run_compose run --rm migrate'), 'root must migrate via one-shot container');
assert.ok(dispatch.includes('run_compose up -d api worker'), 'root flip-current must compose-up api/worker');
// 绝不在 ECS 上 systemctl restart app 或 build web —— 4G OOM 根因已随 compose 上移到 CI。
assert.ok(!dispatch.includes('systemctl restart'), 'root must not systemctl-restart any app service under compose');
assert.ok(!dispatch.includes('build_web') && !dispatch.includes('build-web'), 'root must not build web on ECS under compose');
// prepare 接收镜像摘要并写入 approval.images（runtime 身份 = sha256(images)）。
assert.ok(prepare.includes('backendImageDigest') && prepare.includes('webImageDigest'), 'prepare must accept image digests');
assert.ok(prepare.includes('images: { backend: backendImageDigest, web: webImageDigest }'), 'approval must bind images');
assert.ok(prepare.includes('--backend-image-digest') && prepare.includes('--web-image-digest'), 'prepare must expose image-digest flags');
// receive 的 compose-pull 校验镜像摘要格式。
assert.ok(receive.includes("IMAGE_DIGEST_RE='^sha256:[a-f0-9]{64}$'"), 'receive must validate image digests');
assert.ok(receive.includes('meetwise_cd_transaction_identity_invalid'), 'receive must fail-closed on bad transaction/image identity');
// workflow 在 CI 构建+推送并按 @sha256 取摘要（RepoDigests），再经 compose-pull 钉进 ECS。
assert.ok(workflow.includes('docker build') && workflow.includes('docker push'), 'workflow must build+push in CI');
assert.ok(workflow.includes('RepoDigests'), 'workflow must extract @sha256 digest from pushed image');
assert.ok(workflow.includes('meetwise-cd transaction compose-pull $TRANSACTION_ID $RELEASE $RECOVERY_TOKEN ${{ steps.images.outputs.backend_digest }} ${{ steps.images.outputs.web_digest }}'), 'workflow must pin both digests via the token-bound transaction');
assert.ok(workflow.includes('hash-web-runtime-artifact.mjs'), 'approval web digests must come from the final image');
assert.ok(workflow.includes('git archive --format=tar'), 'source archive must derive from the exact git tree');
assert.ok(workflow.includes('StrictHostKeyChecking yes') && workflow.includes('ECS_CD_KNOWN_HOSTS'), 'SSH host identity must be pinned');
assert.ok(dispatch.includes('acr-pull.env') && dispatch.includes('docker login'), 'ECS must provision a separate ACR pull identity');
assert.ok(dispatch.indexOf('run_compose run --rm migrate') >= 0 && workflow.indexOf('meetwise-cd transaction migrate') < workflow.indexOf('meetwise-cd prepare'), 'migration must precede target ledger freeze');
// loader 的维护窗口控制面：worker 走 docker compose，nginx 仍是宿主 systemd（回执 workerWasActive 名不变）。
assert.ok(loader.includes('COMPOSE_SERVICES'), 'loader must dispatch worker control to compose');
assert.ok(loader.includes("'/usr/bin/docker', ['compose'"), 'loader worker control must call docker compose');
assert.ok(loader.includes('meetwise-worker.service'), 'loader must keep the meetwise-worker.service ledger name');

// --- edge-close / install：app 层容器化后不再碰 systemd 的 api/worker/web 单元 ---------------
// P1-3：web 物理关闭走 docker compose stop，绝不再 systemctl stop meetwise-web.service。
assert.ok(edgeClose.includes('docker compose'), 'edge-close must stop the compose web container');
assert.ok(!edgeClose.includes('systemctl stop meetwise-web.service'), 'edge-close must not systemctl-stop web');
assert.ok(edgeClose.includes('ps --status running -q web'), 'edge-close must verify no running web container (fail-closed)');
// P1-4：install 脚本不再安装/启用/重启 systemd 的 api/worker/web 单元（避免双状态机/端口冲突）。
assert.ok(!install.includes('meetwise-api.service') && !install.includes('meetwise-worker.service') && !install.includes('meetwise-web.service'), 'install must not install/enable/restart systemd app units');

// --- P0-1 降权执行：tarball 不可信 JS 以 meetwise-synthetic 跑，root 不再跑不可信代码 ---------
const provision = read('ops/ecs/full-stack/provision-meetwise-synthetic.sh');
// prepare 拆两模式：root 只编排+落盘，catalog.mjs 由 runuser -u meetwise-synthetic 的 compute 模式 import。
assert.match(prepare, /spawnSync\('\/usr\/sbin\/runuser'/);
assert.match(prepare, /'-u', 'meetwise-synthetic'/);
assert.match(prepare, /prepare_compute_requires_trusted_uid/);
// F4 环境白名单 + 无 argv 密钥：compute 子进程绝不透传 root 环境，且绝不把 DB 口令放进 argv。
// 禁 --preserve-environment 作为 runuser argv、禁 env: process.env 作为 spawnSync 选项，改 env -i
// 从零重建、spawnSync 自身传 env:{}；DB 变量由内层 bash source migrate-env 经 environ 传入（不进 argv）。
// （断言锚定「代码形态」而非散文，避免匹配上方解释性注释里出现的同名词。）
assert.ok(!prepare.includes("'--preserve-environment'"), 'prepare compute must not pass --preserve-environment as a runuser argv');
assert.ok(!/env:\s*process\.env/.test(prepare), 'prepare compute must not forward process.env to the untrusted child');
assert.match(prepare, /'\/usr\/bin\/env', '-i'/);
assert.match(prepare, /env: \{\}/);
// 无 argv 密钥（/proc/<pid>/cmdline 泄漏面）：compute 经 bash source migrate-env，argv 里绝无 DATABASE_URL=。
assert.ok(!prepare.includes('DATABASE_URL='), 'prepare must not place the DB URL in any argv');
assert.match(prepare, /'\/bin\/bash', '-c', /);
assert.match(prepare, /const VERIFIER_ENV_FILE = '\/etc\/meetwise\/full-stack-verifier\.env'/);
// compute 失败只出固定 reason code，不回传 child.stderr（可能带 pg host/user）。
assert.ok(!/prepare_compute_failed:\$\{/.test(prepare), 'prepare must not interpolate compute child stderr');
assert.match(prepare, /throw new Error\('prepare_compute_failed'\)/);
// 审批档读取走严格断言（恒 0600 root:root，绝不接受 gid 2001/0640）；目标档才用放宽的 assertRootFile。
assert.match(prepare, /assertStrictRootFile\(APPROVAL_PATH\)/);
assert.match(prepare, /stat\.uid !== 0 \|\| stat\.gid !== 0 \|\| \(stat\.mode & 0o777\) !== 0o600/);
// compute 输出必须原样保留 CI 身份字段（commit/tree/origin/镜像摘要/generation/releasePath），防 tarball 偷换。
assert.match(prepare, /prepare_compute_output_binding_mismatch/);
assert.match(prepare, /approval\?\.commit === args\.commit/);
assert.match(prepare, /approval\?\.images\?\.backend === args\['backend-image-digest'\]/);
// 目标档落盘 0640 root:meetwise-synthetic（root 写、synthetic 只读），审批档 0600 root:root。
assert.match(prepare, /mode: 0o640, uid: 0, gid: SYNTHETIC_GID/);
assert.match(prepare, /mode: 0o600, uid: 0, gid: 0/);

// root 侧 synthetic_verify 经 runuser 跑 controller-owned loader/deep runner。
// F4 环境白名单 + 无 argv 密钥：runuser 后经 env -i 从零重建环境，绝不带 --preserve-environment；
// 只读 verifier 与固定账号分别由两个 root-owned env 文件注入，绝不 source migrate-env。
// （锚定 runuser 命令行形态，不匹配上方注释里的同名词。）
assert.ok(!/runuser[^\n]*--preserve-environment/.test(dispatch), 'synthetic-verify runuser must not preserve the root environment');
assert.match(dispatch, /runuser -u meetwise-synthetic -- \/usr\/bin\/env -i/);
assert.ok(!dispatch.includes('DATABASE_URL=$DATABASE_URL'), 'synthetic-verify must not place the DB URL in any argv');
assert.match(dispatch, /\. \/etc\/meetwise\/full-stack-verifier\.env; \. \/etc\/meetwise\/preview-test-accounts\.env/);
assert.match(dispatch, /"\$SYNTHETIC_LOADER" showcase-v1 preview-showcase-v1/);
assert.match(dispatch, /"\$SYNTHETIC_LOADER" large-v1-successor preview-large-v1-successor/);
assert.match(dispatch, /\/bin\/bash -c "\$deep_run" "\$DEEP_USAGE_RUNNER" "\$target_digest" "\$release_identity" \|\| die deep_usage_verify_failed/);
const syntheticVerifyBlock = dispatch.slice(dispatch.indexOf('synthetic_verify()'), dispatch.indexOf('probe_nonce()', dispatch.indexOf('synthetic_verify()')));
assert.ok(!syntheticVerifyBlock.includes('full-stack-migrate.env'), 'candidate/synthetic execution must not source the migration credential');
// install_deps 放开 release 树 + node_modules 的组读（meetwise），供 synthetic 读源码解析 pg。
assert.match(dispatch, /chown -R root:meetwise "\$dir"/);
assert.match(dispatch, /runuser -u meetwise-synthetic/);
assert.match(dispatch, /chmod -R u=rwX,g=rX,o= "\$dir"/);
const installDepsBlock = dispatch.slice(dispatch.indexOf('install_deps()'), dispatch.indexOf('prepare_release()', dispatch.indexOf('install_deps()')));
const recursiveModeIndex = installDepsBlock.lastIndexOf('chmod -R u=rwX,g=rX,o= "$dir"');
assert.ok(recursiveModeIndex >= 0, 'install_deps must normalize the release tree');
assert.ok(installDepsBlock.indexOf('chown root:root "$dir/.source-archive.sha256"', recursiveModeIndex) > recursiveModeIndex, 'source archive marker ownership must be restored after recursive normalization');
assert.ok(installDepsBlock.indexOf('chmod 0600 "$dir/.source-archive.sha256"', recursiveModeIndex) > recursiveModeIndex, 'source archive marker mode must be restored after recursive normalization');

// provision：签名私钥锁死 root；/etc/meetwise 对所有非 root 仅 execute（能按已知路径进入、不能列目录），
// 避免在 Compose 接管前夺走 legacy meetwise 对公开 CA 的访问。
assert.match(provision, /SIGNING_KEY="\$ETC\/preview-release-ed25519\.pem"/);
assert.match(provision, /chown root:root "\$SIGNING_KEY"/);
assert.match(provision, /chmod 0600 "\$SIGNING_KEY"/);
assert.match(provision, /chown root:root "\$ETC"/);
assert.match(provision, /chmod 0711 "\$ETC"/);
// 账号无登录 shell，系统账号，专用 uid/gid。
assert.match(provision, /--shell \/usr\/sbin\/nologin/);
assert.match(provision, /groupadd --gid "\$GID_"/);
assert.match(provision, /useradd --uid "\$UID_"/);
// meetwise 补充组是承重项（traverse /srv 读 release 树）：组缺失 fail-closed，且冒烟断言成员已落。
// 绝不静默跳过（旧写法 if getent…then usermod 会把缺组变成部署期隐性断裂）。
assert.match(provision, /provision_meetwise_group_missing/);
assert.match(provision, /provision_meetwise_group_not_applied/);
assert.match(provision, /runuser -u "\$ACCT" -- \/usr\/bin\/id -nG/);
assert.ok(!/if getent group meetwise/.test(provision), 'provision must fail-closed on a missing meetwise group, not silently skip');
// 不把 meetwise-synthetic 加进 docker 组（docker 组 = 经 socket 变相 root）。
assert.ok(!provision.includes('-G docker') && !provision.includes('groupadd docker') && !provision.includes('usermod --append --groups docker'), 'provision must not add synthetic to the docker group');
// 窄 sudo：只放行 nginx 启停 + worker compose ps/stop/up 的确切 argv，绝不放行 docker inspect（通配泄 env）。
assert.ok(!/NOPASSWD:.*inspect/.test(provision), 'provision sudoers must not grant docker inspect');
assert.match(provision, /systemctl stop nginx\.service/);
assert.match(provision, /systemctl start nginx\.service/);
assert.match(provision, /ps --status running -q worker/);
assert.match(provision, /ps --status restarting -q worker/);
assert.match(provision, /stop worker/);
assert.match(provision, /up -d worker/);

// --- provision-meetwise-cd.sh：ECS 侧装机（幂等、非破坏性）契约 -------------------------
assert.match(provisionCd, /provision_cd_requires_root/);
// 非破坏性硬约束：绝不切 current、绝不停旧 app 单元、绝不 compose up、绝不签 manifest。
assert.ok(!/systemctl (stop|disable)[^\n]*meetwise-(api|web|worker)\.service/.test(provisionCd), 'provision-cd must not stop/disable legacy app units');
assert.ok(!/ln -sfn|mv -Tf?[^\n]*current/.test(provisionCd), 'provision-cd must not repoint the current symlink');
assert.ok(!/docker compose (up|run)\b/.test(provisionCd), 'provision-cd must not compose up/run (non-destructive)');
// forced-command：authorized_keys 必须 command= 强制入口 + restrict，无交互 shell。
assert.match(provisionCd, /printf 'command="%s",restrict %s\\n' "\$RECEIVE_DST"/);
assert.match(provisionCd, /RECEIVE_DST=\/usr\/local\/bin\/meetwise-cd-receive/);
// 窄 sudoers：只放行 root dispatch（无通配），visudo 校验后原子落盘。
assert.match(provisionCd, /NOPASSWD: \$ROOT_DST/);
assert.ok(!/NOPASSWD:[^\n]*\*/.test(provisionCd), 'provision-cd sudoers must not use a wildcard');
assert.match(provisionCd, /visudo -cf/);
// install 两个 dispatch 入口 0755 root:root；编排调用 synthetic 降权装配。
assert.match(provisionCd, /install -o root -g root -m 0755 "\$RECEIVE_SRC" "\$RECEIVE_DST"/);
assert.match(provisionCd, /install -o root -g root -m 0755 "\$ROOT_SRC" "\$ROOT_DST"/);
assert.match(provisionCd, /bash "\$SYNTH_SRC"/);
assert.match(provisionCd, /cd-controller-files\.txt/);
assert.match(provisionCd, /CONTROLLER_VERSION=\/etc\/meetwise\/cd-controller-version/);
assert.match(provisionCd, /CONTROLLER_RUN=\/run\/meetwise-preview-controller/);
assert.match(provisionCd, /FULL_STACK_RELEASES=\/srv\/meetwise-full-stack\/releases/);
assert.match(provisionCd, /systemctl enable meetwise-cd-controller-rollout-recovery\.service meetwise-full-stack-publication-recovery\.service meetwise-full-stack-edge-restore\.service nginx\.service/);
assert.match(provisionCd, /systemctl is-enabled meetwise-cd-controller-rollout-recovery\.service/);
// Docker/compose 硬校验（fail-closed）。
assert.match(provisionCd, /docker compose version >\/dev\/null 2>&1 \|\| die docker_compose_plugin_missing/);
// 承重前置：meetwise 组预检在任何变更前（缺则 fail-closed，不半装）。
assert.match(provisionCd, /getent group meetwise[^\n]*\|\| die meetwise_group_missing/);
// 公钥注入防御（最安全敏感行）：CR 剥离 + 单行 wc -l 门 + keytype 锚定，挡多 key / options 注入 / 换行走私。
assert.match(provisionCd, /tr -d '\\r'/);
assert.match(provisionCd, /wc -l\)" -eq 0/);
assert.match(provisionCd, /\^\(ssh-ed25519\|ssh-rsa\|ecdsa-sha2-\[a-z0-9-\]\+\)/);
// StrictModes 链：home/.ssh/incoming 0700 + authorized_keys 0600，属主 meetwise-cd（否则 sshd 静默拒登→CD 连不上）。
assert.match(provisionCd, /install -d -o "\$CD_USER" -g "\$CD_USER" -m 0700 "\$CD_HOME"/);
assert.match(provisionCd, /install -d -o "\$CD_USER" -g "\$CD_USER" -m 0700 "\$CD_SSH"/);
assert.match(provisionCd, /install -d -o "\$CD_USER" -g "\$CD_USER" -m 0700 "\$CD_INCOMING"/);
assert.match(provisionCd, /chmod 0600 "\$tmp"/);
// 绝不读/改签名私钥：它只能出现在 `[[ -f ... ]] || warn` 存在性检查里，绝无任何读/写/改权/改属主。
assert.match(provisionCd, /\[\[ -f "\$ETC\/preview-release-ed25519\.pem" \]\][^\n]*\|\| warn signing_key_absent/);
assert.ok(!/(cat|cp|install|chmod|chown|>|>>|tee)[^\n]*preview-release-ed25519\.pem/.test(provisionCd), 'provision-cd may only [[ -f ]]-test the signing key, never read/copy/rewrite it');
// 绝不写含密钥的 .env：对 $COMPOSE_ENV 只做只读的 grep 存在性检查，无任何写入/追加/tee/install。
assert.match(provisionCd, /grep -qE "\^\(export\[\[:space:\]\]\+\)\?\$k=" "\$COMPOSE_ENV"/);
assert.ok(!/(>|>>|tee|install|cp)[^\n]*"\$COMPOSE_ENV"/.test(provisionCd), 'provision-cd must not author/overwrite the secret .env');

// --- provision-meetwise-synthetic.sh：过渡期非破坏（RDS CA 是公开证书，绝不换组夺旧 app 读权）---
// 专家审计 HIGH：旧 systemd api/worker 以 meetwise 用户运行时直接读 RDS CA 做库 TLS；把 CA chown 成
// meetwise-synthetic 组会在过渡期一重启就断库。CA 是公开证书链→设 0644 root:root（两个用户都能读），
// 且只碰 /etc/meetwise 内的 CA。
assert.match(provision, /ca="\$\(readlink -f "\$DATABASE_SSL_CA_PATH"/);
assert.match(provision, /"\$ca" == "\$ETC"\/\*/);
assert.match(provision, /chown root:root "\$ca"/);
assert.match(provision, /chmod 0644 "\$ca"/);
assert.ok(!/chown "root:\$ACCT" "\$DATABASE_SSL_CA_PATH"/.test(provision), 'synthetic must not chown the RDS CA to the synthetic group (breaks legacy DB TLS on restart)');

// --- F1 read-side（publisher 信任边界）：这些不变量此前无门禁覆盖（专家审计判定的假绿面）。 -------
// 审批档/签名私钥恒走严格 rootJson/rootText（root:root 0600），绝不被降权成 synthetic 可拥有/可读；
// 目标档 + 4 份合成回执才走 syntheticOwnedJson（trustedOwner + {0600,0640}，且 fd 化防 TOCTOU）。
// rootJson 的严格属主检查（uid/gid 双 0）不得被放宽为接受 gid 2001。
assert.match(publisher, /stat\.uid !== 0 \|\| stat\.gid !== 0 \|\| \(stat\.mode & 0o777\) !== mode/);
assert.match(publisher, /const trustedOwner = \(uid, gid\) => \(uid === 0 && \(gid === 0 \|\| gid === SYNTHETIC_GID\)\) \|\| \(uid === SYNTHETIC_UID && gid === SYNTHETIC_GID\)/);
assert.match(publisher, /permissions !== 0o600 && permissions !== 0o640/);
// fd 化：open(O_NOFOLLOW) → 同一 fd fstat → 同一 fd 读（杜绝路径级 TOCTOU 与符号链接跟随）。
assert.match(publisher, /O_RDONLY \| fsConstants\.O_NOFOLLOW/);
assert.match(publisher, /await handle\.stat\(\)/);
assert.match(publisher, /await handle\.readFile\('utf8'\)/);
// stage/publish 读侧：审批走 rootJson（严格），5 份数据档走 syntheticOwnedJson，私钥走 rootText（严格）。
assert.match(publisher, /rootJson\(PATHS\.approval, 0o600\), syntheticOwnedJson\(PATHS\.target\), syntheticOwnedJson\(PATHS\.verification\), syntheticOwnedJson\(PATHS\.dbReceipt\)/);
for (const data of ['target', 'verification', 'dbReceipt', 'datasetManifest', 'maintenance']) {
  assert.ok(publisher.includes(`syntheticOwnedJson(PATHS.${data})`), `publisher must read ${data} via syntheticOwnedJson`);
}
assert.match(publisher, /rootText\(PATHS\.privateKey, 0o600\)/);
// 审批档/签名私钥绝不被 syntheticOwnedJson 读（否则合成账号可伪造门控档让 publisher 签假 manifest）。
assert.ok(!publisher.includes('syntheticOwnedJson(PATHS.approval)'), 'approval must never be read as a synthetic-owned file');
assert.ok(!publisher.includes('syntheticOwnedJson(PATHS.privateKey)'), 'signing key must never be read as a synthetic-owned file');

console.log('ecs full-stack release (CD) proof passed');
