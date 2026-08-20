import assert from 'node:assert/strict';
import { lstatSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(root, rel), 'utf8');
const rootPackage = JSON.parse(read('package.json'));

const provisionCd = read('ops/ecs/full-stack/provision-meetwise-cd.sh');
const prepare = read('ops/ecs/full-stack/prepare-full-stack-release.mjs');
const receive = read('ops/ecs/full-stack/meetwise-cd-receive.sh');
const dispatch = read('ops/ecs/full-stack/meetwise-cd-root.sh');
const workflow = read('.github/workflows/deploy-full-stack.yml');
const recoveryWorkflow = read('.github/workflows/recover-full-stack.yml');
const rolloutWorkflow = read('.github/workflows/rollout-cd-controller.yml');
const ciWorkflow = read('.github/workflows/ci.yml');
const pagesWorkflow = read('.github/workflows/pages-preview.yml');
const publisher = read('ops/ecs/full-stack/full-stack-preview-publisher.mjs');
const verifyOrigin = read('scripts/verify-full-stack-public-origin.mjs');
const loader = read('scripts/preview-synthetic-data/loader.mjs');
const edgeClose = read('ops/ecs/full-stack/full-stack-preview-edge-close.sh');
const install = read('ops/ecs/full-stack/install-full-stack-runtime.sh');

assert.equal(rootPackage.packageManager, 'pnpm@10.18.0', 'repository packageManager must stay pinned');
assert.match(dispatch, /case "\$system_recovery_action" in\s+no_ledger\)[\s\S]*?lease_active\)/, 'root recovery must keep only a live lease read-only');
assert.doesNotMatch(dispatch, /lease_active\|lease_unknown\)/, 'legacy unknown leases must execute phase-based recovery');
assert.doesNotMatch(dispatch, /local transaction_id="\$1"[^\n]*\$(?:transaction_id|bundle_digest)/, 'dependent local paths must be assigned after their identifiers under set -u');
assert.doesNotMatch(dispatch, /local bundle_digest="\$1"[^\n]*\$bundle_digest/, 'controller paths must be assigned after bundle_digest under set -u');

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
const receiveSystemStatusAt = receive.indexOf('      status-system|recover-system)');
assert.ok(receiveSystemStatusAt > 0, 'receiver must expose the bounded tokenless system recovery surface');
const receiveSystemStatusEnd = receive.indexOf('      *)', receiveSystemStatusAt);
const receiveSystemStatusBlock = receive.slice(receiveSystemStatusAt, receiveSystemStatusEnd);
assert.match(receiveSystemStatusBlock, /\[\[ \$\{#argv\[@\]\} -eq 3 \]\]/);
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
// Legacy systemd app units are regular files under /etc/systemd/system on the
// current ECS image, so persistent `systemctl mask` is not a valid ownership
// transfer (it cannot replace the file).  The transactional hand-off must stop
// and disable every loaded predecessor and read back inactive+disabled.  The
// disabled state is persistent across reboot; rollback restores the snapshot's
// enabled/active state through restore_predecessor_snapshot.
const quiesceStart = dispatch.indexOf('quiesce_all_writers()');
const quiesceEnd = dispatch.indexOf('\n}\n\nstart_backend_internal()', quiesceStart);
assert.ok(quiesceStart >= 0 && quiesceEnd > quiesceStart, 'quiesce ownership block must be present');
const quiesceBlock = dispatch.slice(quiesceStart, quiesceEnd);
assert.match(quiesceBlock, /systemctl stop \"\$unit\"/);
assert.match(quiesceBlock, /systemctl disable \"\$unit\"/);
assert.match(quiesceBlock, /systemctl is-active \"\$unit\"[^\n]*== inactive/);
assert.match(quiesceBlock, /systemctl is-enabled \"\$unit\"[^\n]*== disabled/);
assert.match(quiesceBlock, /legacy_unit_has_no_activation_edges \"\$unit\"/);
assert.match(quiesceBlock, /legacy_unit_has_no_dbus_activation \"\$unit\"/);
assert.doesNotMatch(quiesceBlock, /^\s*systemctl mask\b/m, 'quiesce must not mask regular local unit files');
const activationFenceStart = dispatch.indexOf('legacy_unit_has_no_activation_edges()');
const activationFenceEnd = dispatch.indexOf('\n}\n\nlegacy_unit_has_no_dbus_activation()', activationFenceStart);
assert.ok(activationFenceStart >= 0 && activationFenceEnd > activationFenceStart, 'legacy activation-edge fence must be present');
const activationFenceBlock = dispatch.slice(activationFenceStart, activationFenceEnd);
for (const property of ['TriggeredBy', 'RequiredBy', 'WantedBy', 'UpheldBy', 'BoundBy', 'BusName']) {
  assert.match(activationFenceBlock, new RegExp(`--property=${property}`));
}
assert.match(activationFenceBlock, /value !== ''/);
assert.match(activationFenceBlock, /seen\.size !== expected\.size/);
const dbusFenceStart = dispatch.indexOf('legacy_unit_has_no_dbus_activation()');
const dbusFenceEnd = dispatch.indexOf('\n}\n\nquiesce_all_writers()', dbusFenceStart);
assert.ok(dbusFenceStart >= 0 && dbusFenceEnd > dbusFenceStart, 'legacy D-Bus activation fence must be present');
const dbusFenceBlock = dispatch.slice(dbusFenceStart, dbusFenceEnd);
assert.match(dbusFenceBlock, /\/usr\/share\/dbus-1\/system-services/);
assert.match(dbusFenceBlock, /lstatSync, readdirSync, readFileSync/);
assert.match(dbusFenceBlock, /error\?\.code === 'ENOENT'/);
assert.match(dbusFenceBlock, /!directoryStat\.isDirectory\(\) \|\| directoryStat\.isSymbolicLink\(\)/);
assert.match(dbusFenceBlock, /!fileStat\.isFile\(\) \|\| fileStat\.isSymbolicLink\(\)/);
assert.match(dbusFenceBlock, /line\.slice\(0, index\)\.trim\(\) === 'SystemdService'/);
assert.match(dbusFenceBlock, /catch \{[\s\S]*?process\.exit\(1\)/);
const restoreSnapshotStart = dispatch.indexOf('restore_predecessor_snapshot()');
const restoreSnapshotEnd = dispatch.indexOf('\n}\n\nrestore_flip_predecessor()', restoreSnapshotStart);
assert.ok(restoreSnapshotStart >= 0 && restoreSnapshotEnd > restoreSnapshotStart, 'snapshot restore block must be present');
const restoreSnapshotBlock = dispatch.slice(restoreSnapshotStart, restoreSnapshotEnd);
assert.match(restoreSnapshotBlock, /systemctl enable \"\$unit\"/);
assert.match(restoreSnapshotBlock, /systemctl start \"\$unit\"/);
const flipStart = dispatch.indexOf('flip_current()');
const flipEnd = dispatch.indexOf('\n}\n\nsynthetic_verify()', flipStart);
assert.ok(flipStart >= 0 && flipEnd > flipStart, 'legacy flip ownership block must be present');
const flipBlock = dispatch.slice(flipStart, flipEnd);
assert.match(flipBlock, /systemctl disable \"\$unit\"/);
assert.match(flipBlock, /systemctl is-enabled \"\$unit\"[^\n]*!= disabled/);
assert.match(flipBlock, /legacy_unit_has_no_activation_edges \"\$unit\"/);
assert.match(flipBlock, /legacy_unit_has_no_dbus_activation \"\$unit\"/);
assert.doesNotMatch(flipBlock, /^\s*systemctl mask\b/m, 'legacy flip must not mask regular local unit files');
// ECS base images may omit Corepack and may contain an unrelated global pnpm.
// Install/provision a root-owned exact pnpm into the controller prefix and
// revalidate it before every candidate dependency install.
assert.match(dispatch, /PNPM_VERSION=10\.18\.0/);
assert.match(dispatch, /PNPM_PREFIX=\/usr\/local\/lib\/meetwise-cd-pnpm/);
assert.match(dispatch, /PNPM_BIN="\$PNPM_PREFIX\/bin\/pnpm"/);
assert.match(dispatch, /PNPM_PACKAGE_ROOT="\$PNPM_PREFIX\/lib\/node_modules\/pnpm"/);
assert.match(dispatch, /PNPM_INTEGRITY='sha512-[A-Za-z0-9+/]+=*'/);
assert.match(dispatch, /current_target="releases\/\$\{current_target#"\$RELEASES_ROOT\/"\}"/);
assert.match(dispatch, /predecessor_current_target_invalid/);
assert.match(dispatch, /v\.state!=="disabled"\|\|v\.generation!==null\|\|v\.releaseDigest!==null/);
assert.match(dispatch, /state:"disabled",generation:0,fingerprint:v\.manifestSha256/);
assert.match(dispatch, /case "\$pages_state" in[\s\S]*?enabled\)[\s\S]*?"\$pages_fingerprint" == "\$publication_fingerprint"[\s\S]*?disabled\)[\s\S]*?"\$pages_generation" =~ \^\(0\|\[1-9\]\[0-9\]\*\)\$/, 'enabled predecessor Pages must bind the local manifest while an exact disabled receipt remains independently restorable');
const normalizePagesIdentity = (value) => {
  const fingerprint = value?.manifestSha256;
  if (['enabled', 'disabled'].includes(value?.state) && Number.isSafeInteger(value?.generation) && value.generation >= 1 && /^[a-f0-9]{64}$/.test(fingerprint ?? '') && value.finalFingerprint === fingerprint) {
    return { state: value.state, generation: value.generation, fingerprint };
  }
  if (value?.state === 'disabled' && value?.generation === null && value?.releaseDigest === null && /^[a-f0-9]{64}$/.test(fingerprint ?? '') && value.finalFingerprint === fingerprint) {
    return { state: 'disabled', generation: 0, fingerprint };
  }
  return null;
};
const bootstrapFingerprint = 'b'.repeat(64);
assert.deepEqual(normalizePagesIdentity({ state: 'disabled', generation: null, releaseDigest: null, manifestSha256: bootstrapFingerprint, finalFingerprint: bootstrapFingerprint }), { state: 'disabled', generation: 0, fingerprint: bootstrapFingerprint });
for (const invalidBootstrap of [
  { state: 'enabled', generation: null, releaseDigest: null, manifestSha256: bootstrapFingerprint, finalFingerprint: bootstrapFingerprint },
  { state: 'disabled', generation: null, releaseDigest: 'old-release', manifestSha256: bootstrapFingerprint, finalFingerprint: bootstrapFingerprint },
  { state: 'disabled', generation: null, releaseDigest: null, manifestSha256: bootstrapFingerprint, finalFingerprint: 'c'.repeat(64) },
  { state: 'disabled', generation: null, releaseDigest: null, manifestSha256: 'not-a-digest', finalFingerprint: 'not-a-digest' },
  { state: 'enabled', generation: 0, releaseDigest: null, manifestSha256: bootstrapFingerprint, finalFingerprint: bootstrapFingerprint },
  { state: 'disabled', generation: 0, releaseDigest: null, manifestSha256: bootstrapFingerprint, finalFingerprint: bootstrapFingerprint },
]) assert.equal(normalizePagesIdentity(invalidBootstrap), null, 'only the exact disabled bootstrap receipt may map to generation zero');
const predecessorPagesSnapshotValid = ({ state, generation, fingerprint }, publicationFingerprint) => state === 'enabled'
  ? Number.isSafeInteger(generation) && generation >= 1 && fingerprint === publicationFingerprint
  : state === 'disabled' && Number.isSafeInteger(generation) && generation >= 0 && /^[a-f0-9]{64}$/.test(fingerprint ?? '');
assert.equal(predecessorPagesSnapshotValid({ state: 'enabled', generation: 1, fingerprint: bootstrapFingerprint }, bootstrapFingerprint), true);
assert.equal(predecessorPagesSnapshotValid({ state: 'enabled', generation: 1, fingerprint: 'c'.repeat(64) }, bootstrapFingerprint), false);
assert.equal(predecessorPagesSnapshotValid({ state: 'disabled', generation: 0, fingerprint: 'c'.repeat(64) }, bootstrapFingerprint), true, 'a fail-closed Pages bootstrap receipt is preserved independently from stale local publication evidence');
assert.equal(predecessorPagesSnapshotValid({ state: 'disabled', generation: -1, fingerprint: bootstrapFingerprint }, bootstrapFingerprint), false);
assert.match(dispatch, /case "\$predecessor_pages_state" in[\s\S]*?enabled\)[\s\S]*?"\$predecessor_pages_fingerprint" == "\$predecessor_publication_fingerprint"[\s\S]*?full-stack-preview-funnel-enable[\s\S]*?disabled\|none\)[\s\S]*?full-stack-preview-funnel-close/, 'rollback may reopen the edge only for an exact enabled predecessor Pages identity; disabled bootstrap predecessors stay physically closed');
assert.match(dispatch, /pages\.state === 'enabled'[\s\S]*?pages\.generation < 1[\s\S]*?pages\.generation < 0/, 'system recovery status must preserve disabled generation zero while rejecting enabled generation zero');
assert.match(workflow, /predecessor_state" = enabled[\s\S]*?gh workflow run pages-preview\.yml[\s\S]*?elif \[ "\$predecessor_state" = disabled \][\s\S]*?v\.state!=="disabled"[\s\S]*?g!==0/, 'in-run recovery must publish only enabled predecessors and keep disabled generation-zero recovery fail-closed without dispatch');
assert.match(recoveryWorkflow, /predecessor_state" == disabled[\s\S]*?predecessor_generation" =~ \^\(0\|\[1-9\]\[0-9\]\*\)\$/, 'standalone recovery projection must admit disabled generation zero');
assert.match(recoveryWorkflow, /if \[ "\$predecessor_state" = enabled \]; then[\s\S]*?wait_pages_receipt[\s\S]*?elif \[ "\$predecessor_state" = disabled \]; then[\s\S]*?\.state == "disabled"[\s\S]*?env\.GEN == "0"/, 'standalone recovery must verify rather than dispatch a disabled bootstrap predecessor');
assert.match(dispatch, /if \[\[ "\$pages_state" == disabled \]\]; then[\s\S]*?status=0[\s\S]*?predecessorRevoked:[\s\S]*?completed: status === 0/, 'the fresh disabled generation-zero receipt must close the edge and persist a completed predecessor fence without Pages dispatch');
assert.match(dispatch, /LEGACY_PREDECESSOR_RELEASE_RE='\^\[a-f0-9\]\{7,40\}-\(progress\|worktree\)-/);
assert.match(dispatch, /flock -w 15 9 \|\| die full_stack_controller_busy 75/, 'transaction commands must tolerate the short recovery-timer lock holder without waiting forever');
assert.match(workflow, /observed_phase[\s\S]*?if \[ "\$observed_phase" = committed \]; then[\s\S]*?p!==f[\s\S]*?v\.state!=="enabled"[\s\S]*?recovery is a read-only no-op[\s\S]*?exit 0[\s\S]*?expected_state=disabled/, 'committed recovery must verify exact enabled Pages and exit before any disabled dispatch');
assert.match(workflow, /observed_phase" == rolled_back[\s\S]*?forward_only_maintenance[\s\S]*?terminal_json="\$status_json"[\s\S]*?else[\s\S]*?transaction recover/, 'rolled-back and forward-only terminal phases must be idempotent while active phases recover once');
assert.match(dispatch, /predecessor_release" =~ \$RELEASE_RE \|\| "\$predecessor_release" =~ \$LEGACY_PREDECESSOR_RELEASE_RE/);
assert.match(dispatch, /-d "\$RELEASES_ROOT\/\$predecessor_release" && ! -L "\$RELEASES_ROOT\/\$predecessor_release"/);
const releasePattern = dispatch.match(/^RELEASE_RE='([^']+)'$/m)?.[1];
const legacyPredecessorPattern = dispatch.match(/^LEGACY_PREDECESSOR_RELEASE_RE='([^']+)'$/m)?.[1];
assert.ok(releasePattern && legacyPredecessorPattern, 'predecessor release patterns must be readable by the behavior proof');
const releaseName = new RegExp(releasePattern);
const legacyPredecessorName = new RegExp(legacyPredecessorPattern);
const normalizePredecessorTarget = (target) => {
  const normalized = target.startsWith('/srv/meetwise-full-stack/releases/')
    ? `releases/${target.slice('/srv/meetwise-full-stack/releases/'.length)}`
    : target;
  const suffix = normalized.startsWith('releases/') ? normalized.slice('releases/'.length) : '';
  return normalized.startsWith('releases/') && !normalized.includes('..') && (releaseName.test(suffix) || legacyPredecessorName.test(suffix)) ? normalized : null;
};
assert.equal(normalizePredecessorTarget('/srv/meetwise-full-stack/releases/c898395-progress-20260820-1'), 'releases/c898395-progress-20260820-1');
assert.equal(normalizePredecessorTarget('releases/c898395-worktree-20260819-1'), 'releases/c898395-worktree-20260819-1');
assert.equal(normalizePredecessorTarget(`releases/${'a'.repeat(40)}-fullstack-20260820-1-1`), `releases/${'a'.repeat(40)}-fullstack-20260820-1-1`);
for (const attack of ['/srv/meetwise-full-stack/releasesX/c898395-progress-20260820-1', '/srv/meetwise-full-stack/releases//c898395-progress-20260820-1', 'releases/c898395-progress-20260820-1/extra', 'releases/../c898395-progress-20260820-1', '/tmp/c898395-progress-20260820-1', 'releases/c898395-random-20260820-1']) {
  assert.equal(normalizePredecessorTarget(attack), null, `unsafe predecessor target accepted: ${attack}`);
}
const predecessorFsRoot = mkdtempSync(join(tmpdir(), 'meetwise-predecessor-target-'));
try {
  const validName = 'c898395-progress-20260820-1';
  const validPath = join(predecessorFsRoot, validName);
  mkdirSync(validPath);
  assert.ok(lstatSync(validPath).isDirectory() && !lstatSync(validPath).isSymbolicLink());
  const outside = join(predecessorFsRoot, 'outside'); mkdirSync(outside);
  const linkedName = 'c898396-progress-20260820-1';
  symlinkSync(outside, join(predecessorFsRoot, linkedName));
  assert.ok(lstatSync(join(predecessorFsRoot, linkedName)).isSymbolicLink(), 'a matching-name directory symlink must be rejected by the controller');
  assert.equal(lstatSync(join(predecessorFsRoot, linkedName)).isDirectory(), false);
  assert.throws(() => lstatSync(join(predecessorFsRoot, 'c898397-progress-20260820-1')), /ENOENT/);
} finally {
  rmSync(predecessorFsRoot, { recursive: true, force: true });
}
assert.match(dispatch, /validate_pnpm_prefix_contents "\$PNPM_PREFIX" "\$PNPM_INTEGRITY" "\$PNPM_VERSION"/);
assert.match(dispatch, /chmod -R u=rwX,go=rX "\$PNPM_PREFIX"/);
assert.match(dispatch, /install -d -o root -g root -m 0755 "\$stage\/prefix"/);
assert.match(dispatch, /find "\$prefix" -type d ! -perm -0005/);
assert.match(dispatch, /find "\$package_root" -type f ! -perm -0004/);
assert.match(dispatch, /npm pack "pnpm@\$PNPM_VERSION"/);
assert.match(dispatch, /actual_integrity.*PNPM_INTEGRITY/s);
assert.match(dispatch, /\.meetwise-integrity/);
assert.match(dispatch, /0:0:600/);
assert.match(dispatch, /timeout --signal=TERM --kill-after=5s 180s/);
assert.match(dispatch, /timeout --signal=TERM --kill-after=5s 300s/);
assert.match(dispatch, /mktemp -d \/usr\/local\/lib\/\.meetwise-cd-pnpm\.XXXXXX/);
assert.match(dispatch, /mv -T -- "\$candidate" "\$PNPM_PREFIX"/);
assert.match(dispatch, /validate_pnpm_prefix "\$PNPM_PREFIX" \|\| die pnpm_toolchain_invalid/);
assert.match(dispatch, /validate_pnpm_prefix_receipt "\$backup"/);
assert.match(dispatch, /validate_pnpm_prefix_receipt "\$PNPM_PREFIX" \|\| die pnpm_rollback_restore_failed/);
assert.match(dispatch, /bootstrap-toolchain\)[\s\S]*with_controller_lock[\s\S]*ensure_pnpm_toolchain/);
assert.match(dispatch, /--version/);
assert.ok(!dispatch.includes('corepack'), 'root controller must not depend on Corepack being installed');
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
// legacy verify-origin helper remains a surface-only v1 fixture; the deploy
// control-repository contract is v2 and is enforced by root + publisher.
assert.match(verifyOrigin, /probe-receipt-ed25519-v1/);
assert.match(verifyOrigin, /sign\(null, Buffer\.from\(canonicalJson\(unsigned\)\)/);
assert.match(verifyOrigin, /createPrivateKey\(signingKeyPem\)/);
assert.match(verifyOrigin, /--signing-key/);
// publisher/root only hold the public key, enforce exact v2 browser-page
// evidence, preserve API/SSE/worker as unproven, and reject forged/secret-bearing
// receipts fail-closed.
assert.match(publisher, /probeReceiptPublicKey: '\/etc\/meetwise\/probe-receipt-ed25519\.pub\.pem'/);
assert.match(publisher, /probe-receipt-ed25519-v2/);
assert.doesNotMatch(publisher, /probe-receipt-ed25519-v1/);
assert.match(publisher, /assertExternalProbeReceiptV2/);
assert.match(publisher, /full_stack_probe_receipt_v2_signature_invalid/);
assert.match(publisher, /noCookieProtectedRedirect/);
assert.match(publisher, /status !== 'passed_pages_only'/);
assert.match(publisher, /scope !== 'browser_auth_pages_only'/);
assert.match(publisher, /complete !== false/);
assert.match(publisher, /sessionCookie/);
assert.match(publisher, /markerHashes/);
assert.match(publisher, /roleBoundary/);
assert.match(publisher, /account\.api/);
assert.match(publisher, /value\.status !== 'unproven'/);
assert.doesNotMatch(publisher, /api\.path !== '\/api\/privacy\/export'/);
assert.match(dispatch, /schemaVersion !== 2/);
assert.match(dispatch, /receipt_v2_e2e_invalid/);
assert.match(dispatch, /receipt_v2_sensitive_value_invalid/);
assert.match(publisher, /verify\(null, Buffer\.from\(canonicalJson\(without\(receipt, 'signature'\)\)\)/);
// 候选 workflow 不得直接获得 probe 私钥；签名由独立固定版本 verifier 完成。
assert.ok(!workflow.includes('ECS_PROBE_SIGNING_KEY'), 'candidate workflow must never receive the probe signing key');

// --- deploy-full-stack.yml ----------------------------------------------------------
assert.match(workflow, /on:/);
assert.match(workflow, /workflow_run:/);
assert.match(workflow, /workflows: \[ci\]/);
assert.match(workflow, /branches: \[main\]/);
const deployHeader = workflow.slice(0, workflow.indexOf('jobs:'));
assert.match(deployHeader, /permissions:\s*\{\}/, 'deploy workflow must default all token permissions to none');
assert.doesNotMatch(deployHeader, /actions:|attestations:|id-token:/, 'deploy workflow must not generalize sensitive permissions at top level');
assert.match(workflow, /deploy-probe:[\s\S]*?permissions:\s*\n\s+contents: read\n\s+actions: read\n\s+attestations: write\n\s+id-token: write/);
assert.match(workflow, /external-verify:[\s\S]*?permissions:\s*\n\s+contents: read\n\s+actions: read/);
assert.match(workflow, /confirm:[\s\S]*?permissions:\s*\n\s+contents: read\n\s+actions: write/);
assert.match(workflow, /recover:[\s\S]*?permissions:\s*\n\s+contents: read\n\s+actions: write/);
const ciHeader = ciWorkflow.slice(0, ciWorkflow.indexOf('jobs:'));
assert.doesNotMatch(ciHeader, /permissions:/, 'CI must not generalize token permissions at top level');
assert.match(ciWorkflow, /secrets-scan:[\s\S]*?permissions:\s*\n\s+contents: read/);
assert.match(ciWorkflow, /verify:[\s\S]*?permissions:\s*\n\s+contents: read/);
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
assert.equal((workflow.match(/Verify forced-command sentinel before sensitive ECS SSH/g) ?? []).length, 3, 'every credentialed deploy job must prove the forced-command boundary');
assert.equal((workflow.match(/__meetwise_cd_forced_command_sentinel__/g) ?? []).length, 3, 'each deploy sentinel must use the fixed unknown command');
assert.equal((workflow.match(/meetwise_cd_unknown_command/g) ?? []).length, 3, 'each deploy sentinel must require the exact unknown-command reason');
assert.equal((workflow.match(/ssh -o BatchMode=yes -o LogLevel=ERROR meetwise-ecs 'meetwise-cd __meetwise_cd_forced_command_sentinel__'/g) ?? []).length, 3, 'deploy sentinels must suppress client transport warnings before exact receiver-reason matching');
const deployFirstSsh = workflow.indexOf("ssh meetwise-ecs 'meetwise-cd controller-version'");
assert.ok(workflow.indexOf('Verify forced-command sentinel before sensitive ECS SSH') < deployFirstSsh, 'deploy sentinel must precede first controller SSH');
const confirmBlockAt = workflow.indexOf('\n  confirm:');
const confirmSentinelAt = workflow.indexOf('Verify forced-command sentinel before sensitive ECS SSH', confirmBlockAt);
const confirmSshAt = workflow.indexOf('ssh meetwise-ecs "meetwise-cd transaction confirm', confirmBlockAt);
assert.ok(confirmBlockAt > 0 && confirmSentinelAt > confirmBlockAt && confirmSentinelAt < confirmSshAt, 'confirm sentinel must precede first confirmation SSH');
const recoverBlockAt = workflow.indexOf('\n  recover:');
const recoverSentinelAt = workflow.indexOf('Verify forced-command sentinel before sensitive ECS SSH', recoverBlockAt);
const recoverSshAt = workflow.indexOf('ssh meetwise-ecs "meetwise-cd transaction status', recoverBlockAt);
assert.ok(recoverBlockAt > 0 && recoverSentinelAt > recoverBlockAt && recoverSentinelAt < recoverSshAt, 'recovery sentinel must precede first recovery SSH');
assert.match(workflow, /version: 10\.18\.0/);
for (const proof of ['cd-pages-receipt.proof.mjs', 'ecs-full-stack-release.proof.mjs', 'verify-full-stack-public-origin.proof.mjs']) {
  assert.ok(workflow.includes(`node scripts/${proof}`), `workflow must run ${proof} before external mutation`);
}
// 外部验证器：探针在独立控制仓库的 GitHub runner（ECS 之外）执行，
// 其 protected environment signer 不会经 workflow_call 泄漏到候选仓库。
const verifierControlCommit = '28939a6f5ccb571be5bfdb72f0d74967ac1b9b66';
assert.match(workflow, /external-verify:\n\s+needs: deploy-probe\n\s+runs-on: ubuntu-latest/);
assert.match(workflow, /CONTROL_REPOSITORY: miaole\/meetwise-deploy-control/);
assert.match(workflow, /CONTROL_WORKFLOW: verify\.yml/);
assert.match(workflow, /CONTROL_REF: main/);
assert.match(workflow, new RegExp(`CONTROL_COMMIT: ${verifierControlCommit}`));
assert.match(workflow, /expected_manifest_sha256: \$\{\{ steps\.probe\.outputs\.expected_manifest_sha256 \}\}/);
assert.ok(!workflow.includes('uses: miaole/meetwise-deploy-control/.github/workflows/verify.yml@'), 'verifier must not use cross-repository workflow_call');
assert.match(workflow, /actions\/create-github-app-token@fee1f7d63c2ff003460e3d139729b119787bc349 # v2/);
assert.equal((workflow.match(/actions\/create-github-app-token@fee1f7d63c2ff003460e3d139729b119787bc349/g) ?? []).length, 1, 'verifier App token action must be pinned once');
assert.match(workflow, /app-id: \$\{\{ vars\.VERIFIER_DISPATCH_APP_ID \}\}/);
assert.match(workflow, /private-key: \$\{\{ secrets\.VERIFIER_DISPATCH_APP_PRIVATE_KEY \}\}/);
assert.match(workflow, /repositories: meetwise-deploy-control/);
assert.match(workflow, /permission-actions: write/);
assert.match(workflow, /permission-metadata: read/);
assert.ok(!workflow.includes('MEETWISE_VERIFIER_DISPATCH_TOKEN'), 'verifier dispatch must use the scoped GitHub App token');
assert.match(workflow, /actions\/workflows\/\$CONTROL_WORKFLOW\/dispatches/);
assert.match(workflow, /\[\[ "\$CONTROL_REF" == 'main' \]\]/);
assert.match(workflow, /ref:\$ref,inputs:\{origin:\$origin,probe_nonce:\$nonce,expected_manifest_sha256:\$manifest\}/);
assert.match(workflow, /\.event == "workflow_dispatch" and \.head_sha == \$sha/);
assert.match(workflow, /\.display_title == \$title/);
assert.match(workflow, /EXPECTED_RUN_NAME: meetwise-public-origin-\$\{\{ needs\.deploy-probe\.outputs\.probe_nonce \}\}/);
assert.match(workflow, /\.repository\.full_name == "miaole\/meetwise-deploy-control"/);
assert.match(workflow, /\.path == "\.github\/workflows\/verify\.yml"/);
assert.match(workflow, /artifact_name="meetwise-public-origin-receipt-\$PROBE_NONCE"/);
assert.match(workflow, /actions\/runs\/\$VERIFIER_RUN_ID\/artifacts/);
assert.match(workflow, /exactly one nonce-bound verifier artifact is required/);
assert.match(workflow, /expected_receipt_filename='receipt\.json'/);
assert.match(workflow, /verifier artifact must contain exactly receipt\.json/);
assert.match(workflow, /printf 'receipt_b64=%s\\n' "\$receipt_b64"/);
const tailscaleAction = 'tailscale/github-action@6cae46e2d796f265265cfcf628b72a32b4d7cade';
assert.equal(workflow.split(tailscaleAction).length - 1, 3, 'all deploy Tailscale jobs must use the audited v3 commit');
assert.equal(rolloutWorkflow.split(tailscaleAction).length - 1, 1, 'controller rollout must use the audited v3 commit');
const tailscaleOauthBlock = /uses: tailscale\/github-action@6cae46e2d796f265265cfcf628b72a32b4d7cade # v3\n\s+with:\n\s+oauth-client-id: \$\{\{ secrets\.TAILSCALE_OAUTH_CLIENT_ID \}\}\n\s+oauth-secret: \$\{\{ secrets\.TAILSCALE_OAUTH_SECRET \}\}\n\s+tags: tag:meetwise-cd/g;
assert.equal((workflow.match(tailscaleOauthBlock) ?? []).length, 3, 'every deploy OAuth action must supply its required tag input');
assert.equal((rolloutWorkflow.match(tailscaleOauthBlock) ?? []).length, 1, 'controller rollout OAuth action must supply its required tag input');
assert.ok(!workflow.includes('args: --advertise-tags=tag:meetwise-cd'), 'OAuth tags must use the action tags input');
assert.ok(!rolloutWorkflow.includes('args: --advertise-tags=tag:meetwise-cd'), 'rollout OAuth tags must use the action tags input');
assert.ok(!workflow.includes('92117a0a1d5c99a90c035c00d1eb52e357e1e1a4'), 'unresolvable Tailscale action pin must not return');
assert.ok(!rolloutWorkflow.includes('92117a0a1d5c99a90c035c00d1eb52e357e1e1a4'), 'unresolvable rollout action pin must not return');
assert.match(ciWorkflow, /repos\/tailscale\/github-action\/contents\/action\.yml\?ref=6cae46e2d796f265265cfcf628b72a32b4d7cade/);
assert.match(ciWorkflow, /repos\/actions\/create-github-app-token\/contents\/action\.yml\?ref=fee1f7d63c2ff003460e3d139729b119787bc349/);
assert.match(ciWorkflow, /control_sha='28939a6f5ccb571be5bfdb72f0d74967ac1b9b66'/);
assert.match(ciWorkflow, /meetwise-deploy-control\/contents\/scripts\/verify-preview-e2e\.mjs\?ref=\$control_sha/);
assert.match(ciWorkflow, /meetwise-deploy-control\/contents\/scripts\/verify-preview-e2e\.proof\.mjs\?ref=\$control_sha/);
assert.match(ciWorkflow, /meetwise-deploy-control\/contents\/package-lock\.json\?ref=\$control_sha/);
assert.match(ciWorkflow, /control_dir=.*mktemp -d/);
assert.match(ciWorkflow, /node scripts\/verify-preview-e2e\.proof\.mjs/);
for (const contractText of ['const probe =', 'inputs.probe_nonce', 'run-name: meetwise-public-origin-${probe}', '  workflow_dispatch:', '      expected_manifest_sha256:', 'RUNNER_TEMP}/receipt.json', 'name: meetwise-public-origin-receipt-${probe}', 'schemaVersion: 2', 'probe-receipt-ed25519-v2', 'noCookieProtectedRedirect', 'validateReceiptShape', 'passed_pages_only', 'browser_auth_pages_only', 'complete: false', 'sessionCookie', 'markerHashes', 'roleBoundary', 'semanticAssertionCount', 'sse', 'worker']) {
  assert.ok(ciWorkflow.includes(contractText), `CI must enforce pinned verifier contract text: ${contractText}`);
}
assert.ok(ciWorkflow.includes('privacy export is intentionally omitted'));
assert.ok(ciWorkflow.includes('control_receipt_must_not_request_privacy_export'));
// The caller validator is executable contract, not a grep-only assertion.  Use
// the v2 control-repository fixture shape (B/C accounts, protected pages,
// and explicitly unproven API/SSE/worker) and execute the
// exact validator source embedded in deploy-full-stack.yml.  A valid
// `noCookieProtectedRedirect` field must pass; similarly named raw-secret keys
// and non-allowlisted headers must fail by exact recursive schema checks.
const callerValidatorStart = workflow.indexOf('          // BEGIN caller receipt validator v2');
const callerValidatorEndMarker = '          // END caller receipt validator v2';
const callerValidatorEnd = workflow.indexOf(callerValidatorEndMarker, callerValidatorStart);
assert.ok(callerValidatorStart >= 0 && callerValidatorEnd > callerValidatorStart, 'caller validator source markers must exist');
assert.match(workflow, /receiptExactKeys/);
assert.match(workflow, /RECEIPT_HEADER_NAMES = new Set\(\['content-type', 'cache-control'\]\)/);
assert.doesNotMatch(workflow, /text\.includes\(['"]previewc@meetwise\.com/);
assert.doesNotMatch(workflow, /\/password\|authorization\|cookie\/i/);
const callerValidatorSource = workflow
  .slice(callerValidatorStart, callerValidatorEnd + callerValidatorEndMarker.length)
  .split('\n')
  .map((line) => line.startsWith('          ') ? line.slice('          '.length) : line)
  .join('\n');
const fixtureOrigin = ['https:/', '/', 'preview-', 'tail1234', '.tail', '1234', '.ts.net'].join('');
const fixtureNonce = 'a'.repeat(64);
const fixtureManifest = 'b'.repeat(64);
const fixtureControlCommit = 'c'.repeat(40);
const fixturePage = (path, bodyHash, markerHash) => ({
  path,
  status: 200,
  headers: { 'content-type': 'text/html; charset=utf-8' },
  bodyHash,
  bodyStored: false,
  markerHashes: [markerHash],
  negativeMarkerHashes: [],
});
const fixtureUnproven = (reason) => ({ status: 'unproven', reason });
const fixtureAccount = (role, loginPath, pagePath, bodyHash, markerHash, accountHash) => ({
  role,
  accountEmailSha256: accountHash,
  loginPath,
  sessionCookie: { httpOnly: true, secure: true, roleCookie: role },
  pages: [fixturePage(pagePath, bodyHash, markerHash)],
  roleBoundary: role === 'candidate'
    ? { status: 'verified', path: '/recruiter/jobs', markerHashes: ['7'.repeat(64)] }
    : fixtureUnproven('no safe recruiter-to-candidate negative write-free contract is available'),
  api: fixtureUnproven('privacy export is intentionally omitted because Playwright API responses may buffer personal data'),
  sse: fixtureUnproven('no stable persisted interview-or-quiz id is permitted for the short verifier'),
  worker: fixtureUnproven('no business object is created by the short verifier'),
  semanticAssertionCount: 1,
});
const callerV2Fixture = {
  schemaVersion: 2,
  origin: fixtureOrigin,
  probeNonce: fixtureNonce,
  checkedAt: new Date(Date.now() - 1000).toISOString(),
  manifestSha256: fixtureManifest,
  rootStatus: 200,
  loginStatus: 200,
  manifestStatus: 200,
  rootUrl: `${fixtureOrigin}/`,
  loginUrl: `${fixtureOrigin}/login`,
  manifestUrl: `${fixtureOrigin}/preview-release-manifest.json`,
  rootSha256: 'd'.repeat(64),
  blackboxSha256: 'e'.repeat(64),
  signingKeyId: 'probe-receipt-ed25519-v2',
  verifier: {
    repository: 'miaole/meetwise-deploy-control',
    workflow: 'verify-meetwise-public-origin',
    ref: 'refs/heads/main',
    commit: fixtureControlCommit,
    runId: '123',
    sourceSha256: 'f'.repeat(64),
    workflowSha256: '1'.repeat(64),
    packageLockSha256: '2'.repeat(64),
  },
  e2e: {
    status: 'passed_pages_only',
    scope: 'browser_auth_pages_only',
    complete: false,
    sensitiveResponseBodies: 'not_stored',
    noCookieProtectedRedirect: { origin: fixtureOrigin, pathname: '/login', search: '?next=%2Fdashboard' },
    accounts: {
      candidate: fixtureAccount('candidate', '/dashboard', '/dashboard', '4'.repeat(64), '5'.repeat(64), '3'.repeat(64)),
      recruiter: fixtureAccount('recruiter', '/recruiter/jobs', '/recruiter/jobs', '6'.repeat(64), '8'.repeat(64), '5'.repeat(64)),
    },
  },
  signature: Buffer.alloc(64, 7).toString('base64'),
};
const callerHarness = `${callerValidatorSource}
const fixture = ${JSON.stringify(callerV2Fixture)};
const options = { origin: fixture.origin, nonce: fixture.probeNonce, manifest: fixture.manifestSha256, controlCommit: fixture.verifier.commit, runId: fixture.verifier.runId };
validateCallerReceipt(fixture, options);
const clone = (value) => JSON.parse(JSON.stringify(value));
const rejects = (name, mutate) => {
  const candidate = clone(fixture);
  mutate(candidate);
  try { validateCallerReceipt(candidate, options); throw new Error(name + '_accepted'); }
  catch (error) { if (error.message === name + '_accepted') throw error; }
};
rejects('top_level_password_key', (value) => { value.password = 'raw'; });
rejects('nested_authorization_header', (value) => { value.e2e.accounts.candidate.pages[0].headers.authorization = 'raw'; });
rejects('nested_cookie_key', (value) => { value.e2e.cookie = 'contract-name-only'; });
rejects('api_claimed', (value) => { value.e2e.accounts.candidate.api.status = 'passed'; });
rejects('sse_claimed', (value) => { value.e2e.accounts.candidate.sse.status = 'passed'; });
rejects('e2e_overclaimed', (value) => { value.e2e.complete = true; });
process.stdout.write('CALLER_V2_VALIDATOR_PASS\\n');`;
const callerBehavior = spawnSync(process.execPath, ['-e', callerHarness], { encoding: 'utf8' });
assert.equal(callerBehavior.status, 0, `caller v2 validator behavior failed: ${callerBehavior.stderr}`);
assert.match(callerBehavior.stdout, /CALLER_V2_VALIDATOR_PASS/);
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
assert.match(workflow, /always\(\) && failure\(\) && steps\.transaction\.outputs\.generation != ''/);
assert.match(workflow, /always\(\) && failure\(\)/);
assert.ok(!/meetwise-cd transaction (?:status|recover|confirm|wait-pages|commit)[^\n]*['\\]/.test(workflow), 'forced-command transaction arguments must not contain quotes or backslashes rejected by the receiver');
assert.ok(!workflow.includes('ECS_PROBE_SIGNING_KEY'), 'candidate workflow must never receive the probe signing key');
const deployRecoveryAt = workflow.indexOf('\n  recover:');
assert.ok(deployRecoveryAt > 0, 'deploy workflow must retain an in-run recovery job');
const deployRecoveryBlock = workflow.slice(deployRecoveryAt);
assert.match(deployRecoveryBlock, /environment: preview-cd-recovery/);
assert.match(deployRecoveryBlock, /RECOVERY_BUDGET_SECONDS: '780'/);
assert.match(deployRecoveryBlock, /timeout-minutes: 20/);
assert.ok(780 < 20 * 60, 'deploy recovery wait budget must be strictly below its job timeout');
assert.match(deployRecoveryBlock, /bounded\s+gh workflow run pages-preview\.yml/);
assert.match(deployRecoveryBlock, /gh workflow run pages-preview\.yml --repo "\$GITHUB_REPOSITORY"/, 'recovery dispatch must not depend on a local Git checkout');
assert.match(deployRecoveryBlock, /bounded\s+ssh meetwise-ecs/);
// Independent cancellation recovery: no candidate checkout/JavaScript/Docker
// path, fixed Pages dispatch, and a single bounded budget below the job ceiling.
assert.match(recoveryWorkflow, /schedule:/);
assert.match(recoveryWorkflow, /workflow_dispatch:/);
assert.match(recoveryWorkflow, /environment: preview-cd-recovery/);
assert.match(recoveryWorkflow, /actions: write/);
assert.match(recoveryWorkflow, /tailscale\/github-action@6cae46e2d796f265265cfcf628b72a32b4d7cade/);
assert.match(recoveryWorkflow, /transaction status-system/);
assert.match(recoveryWorkflow, /transaction recover-system/);
assert.match(recoveryWorkflow, /predecessor\.pages\.state/);
assert.match(recoveryWorkflow, /predecessor\.pages\.generation/);
assert.match(recoveryWorkflow, /predecessor\.pages\.fingerprint/);
assert.match(recoveryWorkflow, /expected_state/);
assert.match(recoveryWorkflow, /expected_generation/);
assert.match(recoveryWorkflow, /expected_manifest_sha256/);
assert.match(recoveryWorkflow, /gh workflow run pages-preview\.yml --repo "\$GITHUB_REPOSITORY"/, 'standalone recovery dispatch must identify the repository outside a checkout');
const pagesDispatches = [...`${workflow}\n${recoveryWorkflow}`.matchAll(/gh workflow run pages-preview\.yml[^\n]*/g)].map((match) => match[0]);
assert.equal(pagesDispatches.length, 7, 'every current Pages dispatch must be enumerated by the release proof');
assert.ok(pagesDispatches.every((line) => line.includes('--repo "$GITHUB_REPOSITORY"')), 'every Pages dispatch must be repository-bound');
assert.match(recoveryWorkflow, /rolled_back/);
assert.match(recoveryWorkflow, /forward_only_maintenance/);
assert.match(recoveryWorkflow, /RECOVERY_BUDGET_SECONDS: '780'/);
assert.match(recoveryWorkflow, /timeout-minutes: 20/);
assert.match(recoveryWorkflow, /ssh -o BatchMode=yes -o LogLevel=ERROR meetwise-ecs 'meetwise-cd __meetwise_cd_forced_command_sentinel__'/);
assert.ok(780 < 20 * 60, 'independent recovery wait budget must be strictly below its job timeout');
assert.doesNotMatch(recoveryWorkflow, /actions\/checkout|node scripts\//, 'independent recovery must not execute candidate checkout code');
assert.doesNotMatch(recoveryWorkflow, /\bdocker\b/i, 'independent recovery must not use Docker');
assert.match(dispatch, /status-system\)/);
assert.match(dispatch, /transaction_status_invalid/);
assert.match(dispatch, /candidate\.finalManifestFingerprint/);
assert.match(dispatch, /predecessor(?:\.|\?\.)pages/);
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
assert.ok(!workflow.includes('hash-web-runtime-artifact.mjs'), 'credentialed deploy must not execute candidate checkout hash code');
assert.match(workflow, /fixed inline control-plane hash/);
assert.match(workflow, /docker cp "\$container:\/app\/\." \/tmp\/web-image-app\//, 'Web attestation must copy the complete image app boundary');
assert.match(workflow, /node --input-type=module - \/tmp\/web-image-app\/apps\/web/, 'Web attestation must hash only the runtime Web subtree after boundary-safe extraction');
assert.ok(!workflow.includes('docker cp "$container:/app/apps/web/."'), 'Web attestation must not isolate standalone symlinks from their image root');
const acrLoginAt = workflow.indexOf('docker login "$REGISTRY"');
assert.ok(acrLoginAt > 0 && !workflow.slice(acrLoginAt).includes('node scripts/'), 'no candidate checkout script may run after ACR login');
const sshKeyAt = workflow.indexOf('secrets\.ECS_CD_DEPLOY_KEY');
assert.ok(sshKeyAt > 0 && !workflow.slice(sshKeyAt).includes('node scripts/'), 'no candidate checkout script may run after SSH key landing');
assert.doesNotMatch(workflow, /import \{ manifestFingerprint \} from ["']\.\/ops\/ecs\/preview-release-manifest\.mjs["']/);
assert.match(workflow, /manifest hashing in this fixed workflow script/);
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
assert.match(provisionCd, /"\$ROOT_DST" bootstrap-toolchain/);
assert.ok(!provisionCd.includes('corepack'), 'provision must not leave Corepack as a hidden prerequisite');
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
assert.match(provisionCd, /systemctl enable meetwise-cd-controller-rollout-recovery\.service meetwise-full-stack-publication-recovery\.service meetwise-full-stack-edge-restore\.service/);
assert.match(provisionCd, /FULL_STACK_RELEASE_RECOVERY_SERVICE=meetwise-full-stack-release-recovery\.service/);
assert.match(provisionCd, /FULL_STACK_RELEASE_RECOVERY_TIMER=meetwise-full-stack-release-recovery\.timer/);
assert.match(provisionCd, /systemctl is-enabled "\$FULL_STACK_RELEASE_RECOVERY_SERVICE"/);
assert.match(provisionCd, /systemctl is-enabled "\$FULL_STACK_RELEASE_RECOVERY_TIMER"/);
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
// 绝不读/改签名私钥：只通过统一的 owner/mode 元数据门，缺失或漂移必须 fail-closed。
assert.match(provisionCd, /require_file_state "\$ETC\/preview-release-ed25519\.pem" root:root:600 signing_key_invalid/);
assert.doesNotMatch(provisionCd, /provision_cd_warn_/);
assert.ok(!/(cat|cp|install|chmod|chown|>|>>|tee)[^\n]*preview-release-ed25519\.pem/.test(provisionCd), 'provision-cd may only [[ -f ]]-test the signing key, never read/copy/rewrite it');
// 绝不写含密钥的 .env：固定 parser 只读检查，不 source、不回显、无任何写入/追加/tee/install。
assert.match(provisionCd, /parse_env_file "\$COMPOSE_ENV" compose 1/);
assert.ok(!/(>|>>|tee|install|cp)[^\n]*"\$COMPOSE_ENV"/.test(provisionCd), 'provision-cd must not author/overwrite the secret .env');
assert.match(provisionCd, /docker compose --project-directory "\$COMPOSE_DIR" -f "\$COMPOSE_DST" config >\/dev\/null \|\| die compose_config_invalid/);

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
