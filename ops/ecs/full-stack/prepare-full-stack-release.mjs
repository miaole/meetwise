#!/usr/bin/env node
/**
 * 确定性生成 full-stack 预览发布所需的「审批」(full-stack-release.json) 与
 * 「目标档」(preview-synthetic-target.json)。
 *
 * 为什么存在：这两份 JSON 此前是**手写**的（没有任何脚本生成），是 CD 全自动化的
 * 最后一个断点。本脚本把手写步骤替换为可复现的确定性组装：
 *   - 冻结云事实（RDS 实例/端点/TLS/角色/DB 名、Tailscale origin、合成数据
 *     expectedBaseline/expectedCumulative、targetId）从**现有**目标档继承，
 *     绝不在发布时重新发明；
 *   - 代码绑定字段（releasePath/releaseTreeDigest/apiContractDigest、
 *     schemaHead/schemaLedgerDigest、factoryDigest、各 profile 的 catalogDigest）
 *     从**本次 release 的源码**与**线上 DB** 确定性重算。
 *
 * 关键正确性约束：所有 digest 都必须复用**本次 release 的 catalog.mjs 导出的
 * `sha256`（= `sha256(canonicalJson(value))`）**，绝不自带一份副本——否则
 * targetDigest / successorOfTargetDigest / releaseTreeDigest / factoryDigest
 * 与 loader.mjs / db-verify.mjs / publisher 的回执链会逐字节漂移。
 *
 * P0-1 降权执行：`sha256`/`buildPlan` 来自**本次 release 的 catalog.mjs**，而 catalog.mjs
 * 是 tarball 上传的不可信代码。为不让它以 root 执行，本脚本拆成两个模式：
 *   - root 模式（默认）：只读前驱审批→推导 generation，然后 spawn `runuser -u
 *     meetwise-synthetic` 跑 compute 模式，校验其输出把「CI 传入的身份字段
 *     (commit/tree/origin/镜像摘要/releasePath/generation)」原样保留，最后以 root
 *     把两份 JSON 落盘（目标档 0640 root:meetwise-synthetic 供 synthetic 只读）。
 *   - compute 模式（子命令 compute，runuser -u meetwise-synthetic）：import tarball
 *     的 catalog.mjs、buildPlan、算全部 digest、querySchemaLedger、组装 target+approval，
 *     把 `{ target, approval }` 写到 stdout。此模式下不可信代码以 meetwise-synthetic
 *     执行，读不到 manifest 签名私钥 / 其余 host .env。
 *
 * 运行：
 *   node prepare-full-stack-release.mjs \
 *     --commit <40hex> --tree <40hex> --origin <https://...ts.net> \
 *     --web-build-sha256 <64hex> --static-assets-sha256 <64hex> \
 *     --backend-image-digest <sha256:64hex> --web-image-digest <sha256:64hex> \
 *     --release-path /srv/meetwise-full-stack/releases/<release>
 *
 * 安全不变量：本脚本只写 /etc/meetwise/ 下的两份 root 掌控的 JSON；不读也不写任何
 * 密钥；不打印任何密钥/连接串。生成结果仍会被 full-stack-preview-publisher.mjs 逐字段校验。
 */
import { createRequire } from 'node:module';
import { chmodSync, chownSync, closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const APPROVAL_PATH = '/etc/meetwise/full-stack-release.json';
const TARGET_PATH = '/etc/meetwise/preview-synthetic-target.json';
const PUBLICATION_STATE_PATH = '/var/lib/meetwise-preview-controller/full-stack-publication.json';
const VERIFIER_ENV_FILE = '/etc/meetwise/full-stack-verifier.env';

// P0-1：compute 模式以 meetwise-synthetic（uid/gid 2001，provision 固定）运行；
// root 模式仍要求 root（读前驱审批 + 落盘两份 JSON）。
const SYNTHETIC_UID = 2001;
const SYNTHETIC_GID = 2001;
const trustedUid = (uid, gid) => (uid === 0 && gid === 0) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);
// root 拥有（组 root 或 meetwise-synthetic）或 meetwise-synthetic 拥有的文件。
const trustedOwner = (uid, gid) => (uid === 0 && (gid === 0 || gid === SYNTHETIC_GID)) || (uid === SYNTHETIC_UID && gid === SYNTHETIC_GID);

const COMMIT = /^[a-f0-9]{40}$/;
const DIGEST = /^[a-f0-9]{64}$/;
const IMAGE_DIGEST = /^sha256:[a-f0-9]{64}$/;
const TAILSCALE_ORIGIN = /^https:\/\/[a-z0-9-]+\.tail[a-z0-9]+\.ts\.net$/;
// The factory is a composition, not only the historical four-file loader.
// verifier-env.mjs owns the read-only DB boundary and the account runner owns
// the deep-usage receipt contract; omitting either file would let a release
// reuse a receipt produced by different behavior.
const FACTORY_FILES = Object.freeze([
  'catalog.mjs',
  'db-verify.mjs',
  'loader.mjs',
  'target-inspect.mjs',
  'verifier-env.mjs',
  '../preview-account-scenarios/runner.mjs',
]);

// These are public identity bindings only.  Passwords are deliberately not a
// field in this module, the catalog, a target, an approval, or any receipt.
const FIXED_PREVIEW_ACCOUNTS = Object.freeze([
  Object.freeze({ key: 'preview-candidate', email: 'previewc@meetwise.com', role: 'candidate', displayName: '预览求职者 C 端', credentialEnv: 'PREVIEW_C_PASSWORD', preProvisioned: true }),
  Object.freeze({ key: 'preview-recruiter', email: 'previewb@meetwise.com', role: 'recruiter', displayName: '预览招聘方 B 端', credentialEnv: 'PREVIEW_B_PASSWORD', preProvisioned: true }),
]);
const FIXED_PREVIEW_CAPACITY = Object.freeze({
  accounts: 2,
  jobs: 30,
  applications: 30,
  resumes: 12,
  interviews: 0,
});
const VERIFIER_EXPECTED_DATABASE = 'meetwise_cloud_test';
const VERIFIER_EXPECTED_ROLE = 'meetwise_preview_audit';
const VERIFIER_ENV_CONTRACT = Object.freeze({
  readOnly: true,
  requiredEnv: Object.freeze(['PREVIEW_VERIFY_DATABASE_URL', 'PREVIEW_VERIFY_DATABASE_SSL_CA_PATH', 'PREVIEW_VERIFY_PG_TLS_SERVERNAME', 'PREVIEW_VERIFY_EXPECTED_DATABASE', 'PREVIEW_VERIFY_EXPECTED_ROLE']),
  expectedDatabase: VERIFIER_EXPECTED_DATABASE,
  expectedRole: VERIFIER_EXPECTED_ROLE,
  forbiddenEnv: Object.freeze(['DATABASE_URL', 'MIGRATION_DATABASE_URL', 'RUNTIME_DATABASE_URL', 'QBANK_CONTROL_DATABASE_URL', 'RAG_CONTROL_DATABASE_URL', 'DATABASE_SSL_CA_PATH', 'PG_TLS_SERVERNAME']),
});
const CAPACITY_RECEIPT_FIELDS = Object.freeze([
  'schemaVersion', 'phase', 'status', 'recovery', 'receiptLayer', 'datasetId', 'profile', 'targetDigest',
  'catalogDigest', 'factoryDigest', 'identity', 'schemaHead', 'schemaLedgerDigest', 'releasePath',
  'releaseTreeDigest', 'apiContractDigest', 'counts', 'forbidden', 'verifiedAt', 'receiptDigest',
]);
const DEEP_USAGE_RECEIPT_FIELDS = Object.freeze([
  'schemaVersion', 'receiptLayer', 'datasetId', 'scenarioId', 'predecessorCapacityDatasetId',
  'targetDigest', 'releaseIdentity', 'phase', 'observations', 'sessionCount', 'receiptDigest', 'unproven',
]);

// 与 target-inspect.mjs / db-verify.mjs / publisher 的 releaseDigest 逐字节一致：
// 对 apps/api + packages/contracts + packages/db 三个 scope 做 Merkle 式树摘要。
// sha256 由调用方注入（本次 release 的 catalog.mjs 导出），保证不回漂移。
function releaseTreeDigest(root, sha256) {
  const rows = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release_symlink_rejected:${relative(root, path)}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) rows.push([relative(root, path), sha256(readFileSync(path))]);
    }
  };
  for (const scope of ['apps/api', 'packages/contracts', 'packages/db']) visit(join(root, scope));
  return sha256(rows);
}

// 与 db-verify.mjs / loader.mjs 的 factoryDigest 一致：对完整 preview factory
// composition 做摘要，但来源是**本次 release 的源码**（而非运行中控制器的旧安装）。
export function factoryDigest(sourceRoot, sha256) {
  const dir = join(sourceRoot, 'scripts/preview-synthetic-data');
  return sha256(FACTORY_FILES.map((name) => [name, sha256(readFileSync(join(dir, name)))]));
}

function publicFixedAccounts(accounts = FIXED_PREVIEW_ACCOUNTS) {
  return accounts.map(({ key, email, role, displayName, credentialEnv, preProvisioned }) => ({ key, email, role, displayName, credentialEnv, preProvisioned }));
}

function assertFixedAccounts(accounts) {
  if (!Array.isArray(accounts)) throw new Error('prepare_fixed_preview_accounts_invalid');
  if (JSON.stringify(publicFixedAccounts(accounts)) !== JSON.stringify(publicFixedAccounts(FIXED_PREVIEW_ACCOUNTS))) {
    throw new Error('prepare_fixed_preview_accounts_invalid');
  }
  if (/(?:"(?:password|secret)"\s*:)/i.test(JSON.stringify(accounts))) throw new Error('prepare_fixed_preview_credentials_persisted');
  return publicFixedAccounts(FIXED_PREVIEW_ACCOUNTS);
}

function assertPreviewDataShape(previewData) {
  if (!previewData || previewData.schemaVersion !== 1 || previewData.composition !== 'capacity-successor-plus-deep-usage' || !DIGEST.test(previewData.factoryDigest ?? '') || !DIGEST.test(previewData.compositionDigest ?? '')) throw new Error('prepare_preview_composition_invalid');
  if (/(?:"(?:password|secret)"\s*:)/i.test(JSON.stringify(previewData))) throw new Error('prepare_preview_credentials_persisted');
  const fixed = previewData.fixedAccounts;
  assertFixedAccounts(fixed);
  if (previewData.capacity?.profile !== 'large-v1-successor' || previewData.capacity?.successorOf !== 'large-v1' || previewData.capacity?.datasetId !== 'preview-large-v1-successor' || previewData.capacity?.receiptSchema?.receiptLayer !== 'capacity') throw new Error('prepare_capacity_successor_binding_invalid');
  if (previewData.deepUsage?.datasetId !== 'preview-deep-usage-v1' || previewData.deepUsage?.scenarioId !== 'deep-usage-v1' || previewData.deepUsage?.predecessorCapacityDatasetId !== previewData.capacity.datasetId || previewData.deepUsage?.receiptSchema?.receiptLayer !== 'deep-usage') throw new Error('prepare_deep_usage_binding_invalid');
  if (previewData.verifier?.readOnly !== true || previewData.verifier.expectedDatabase !== VERIFIER_EXPECTED_DATABASE || previewData.verifier.expectedRole !== VERIFIER_EXPECTED_ROLE || !Array.isArray(previewData.verifier.requiredEnv) || !Array.isArray(previewData.verifier.forbiddenEnv) || previewData.verifier.requiredEnv.some((name) => !/^PREVIEW_VERIFY_[A-Z0-9_]+$/.test(name)) || previewData.verifier.forbiddenEnv.some((name) => !/^(?:DATABASE|MIGRATION|RUNTIME|QBANK_CONTROL|RAG_CONTROL|DATABASE_SSL_CA_PATH|PG_TLS_SERVERNAME)/.test(name))) throw new Error('prepare_verifier_contract_invalid');
  return previewData;
}

function buildPreviewData({ catalogDigests, factoryDigest: factory, sha256, fixedAccounts = FIXED_PREVIEW_ACCOUNTS, verifierContract = VERIFIER_ENV_CONTRACT }) {
  for (const profile of ['showcase-v1', 'large-v1', 'large-v1-successor']) {
    if (!DIGEST.test(catalogDigests?.[profile] ?? '')) throw new Error(`prepare_catalog_digest_invalid:${profile}`);
  }
  if (!DIGEST.test(factory ?? '')) throw new Error('prepare_factory_digest_invalid');
  if (JSON.stringify(verifierContract) !== JSON.stringify(VERIFIER_ENV_CONTRACT)) throw new Error('prepare_verifier_contract_invalid');
  const accounts = assertFixedAccounts(fixedAccounts);
  const unsigned = {
    schemaVersion: 1,
    composition: 'capacity-successor-plus-deep-usage',
    factoryDigest: factory,
    verifier: verifierContract,
    fixedAccounts: accounts,
    capacity: {
      profile: 'large-v1-successor',
      successorOf: 'large-v1',
      datasetId: 'preview-large-v1-successor',
      catalogDigest: catalogDigests['large-v1-successor'],
      receiptSchema: { schemaVersion: 1, receiptLayer: 'capacity', requiredFields: CAPACITY_RECEIPT_FIELDS },
      verificationSchemaVersion: 2,
    },
    deepUsage: {
      datasetId: 'preview-deep-usage-v1',
      scenarioId: 'deep-usage-v1',
      predecessorCapacityDatasetId: 'preview-large-v1-successor',
      receiptSchema: { schemaVersion: 1, receiptLayer: 'deep-usage', phase: 'verified_online_projection', requiredFields: DEEP_USAGE_RECEIPT_FIELDS },
    },
  };
  return { ...unsigned, compositionDigest: sha256(unsigned) };
}

function addFixedPreviewCapacity(priorCounts) {
  if (!priorCounts || Object.keys(FIXED_PREVIEW_CAPACITY).some((key) => !Number.isSafeInteger(priorCounts[key]) || priorCounts[key] < 0)) throw new Error('prepare_prior_capacity_count_invalid');
  return Object.fromEntries(Object.entries(priorCounts).map(([key, value]) => [key, value + (FIXED_PREVIEW_CAPACITY[key] ?? 0)]));
}

// 与 db-verify.mjs / loader.mjs 的 validateTarget 对齐的 root 只读文件断言。
// 目标档降权后是 0640 root:meetwise-synthetic（root 写、synthetic 只读），故 0600 时
// 放宽为 {0600,0640}；两者都无组/他人写位，防 synthetic 改写门控档。
function assertRootFile(path, mode) {
  const stat = lstatSync(path);
  const permissions = stat.mode & 0o777;
  const modeOk = mode === 0o600 ? (permissions === 0o600 || permissions === 0o640) : permissions === mode;
  if (!stat.isFile() || stat.isSymbolicLink() || !trustedOwner(stat.uid, stat.gid) || !modeOk) throw new Error(`unsafe_root_file:${path}`);
  return readFileSync(path, 'utf8');
}

// 审批档专用的严格断言：恒为 0600 root:root（synthetic 无需读、绝不放行 gid 2001 / 0640）。目标档才
// 用上面放宽的 assertRootFile；审批档走这条，防守深度上杜绝「审批被降权成 synthetic 可拥有/可读」。
function assertStrictRootFile(path) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) throw new Error(`unsafe_root_file:${path}`);
  return readFileSync(path, 'utf8');
}

function assertVerifierEnvFile(path = VERIFIER_ENV_FILE) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== SYNTHETIC_GID || (stat.mode & 0o777) !== 0o640) throw new Error(`unsafe_verifier_env:${path}`);
}

function durableWriteJson(path, value, { mode = 0o600, uid = 0, gid = 0 } = {}) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  let fd = openSync(temp, 'r'); fsyncSync(fd); closeSync(fd);
  renameSync(temp, path);
  chownSync(path, uid, gid);
  chmodSync(path, mode);
  fd = openSync(dirname(path), 'r'); fsyncSync(fd); closeSync(fd);
}

function parseArgs(argv, start = 2) {
  const out = {};
  for (let i = start; i < argv.length; i += 2) {
    const key = argv[i]; const value = argv[i + 1];
    if (!key?.startsWith('--') || value === undefined) throw new Error(`invalid_argument:${key ?? ''}`);
    out[key.slice(2)] = value;
  }
  return out;
}

export function buildTarget(previous, { releasePath, releaseTreeDigest: tree, apiContractDigest, schemaHead, schemaLedgerDigest, factoryDigest: factory, catalogDigests, sha256, fixedAccounts = FIXED_PREVIEW_ACCOUNTS, verifierContract = VERIFIER_ENV_CONTRACT }) {
  // 冻结云事实：从现有目标档继承（缺失则 fail-closed，绝不在发布时伪造端点/角色）。
  const frozen = {
    targetId: previous.targetId,
    rdsInstanceId: previous.rdsInstanceId,
    rdsEndpoint: previous.rdsEndpoint,
    rdsPort: previous.rdsPort,
    tlsServername: previous.tlsServername,
    // The successor deliberately migrates verification away from the ambient
    // migration identity. These two values are controller-owned constants and
    // are independently proven by the root-only verifier env/current_user;
    // inheriting the historical target would make the upgrade impossible.
    expectedDbRole: VERIFIER_EXPECTED_ROLE,
    database: VERIFIER_EXPECTED_DATABASE,
    apiBaseUrl: previous.apiBaseUrl,
  };
  if (!/^pgm-[a-z0-9]+$/.test(frozen.rdsInstanceId ?? '') || frozen.rdsEndpoint !== `${frozen.rdsInstanceId}.pg.rds.aliyuncs.com` || frozen.tlsServername !== frozen.rdsEndpoint || frozen.rdsPort !== 5432 || frozen.expectedDbRole !== VERIFIER_EXPECTED_ROLE || frozen.database !== VERIFIER_EXPECTED_DATABASE || frozen.apiBaseUrl !== 'http://127.0.0.1:8787') {
    throw new Error('prepare_inherited_cloud_facts_invalid');
  }

  const profiles = {};
  for (const profile of ['showcase-v1', 'large-v1']) {
    const prior = previous.approvedProfiles?.[profile];
    if (!prior || typeof prior !== 'object') throw new Error(`prepare_missing_prior_profile:${profile}`);
    const base = { datasetId: prior.datasetId, maxDurationSeconds: prior.maxDurationSeconds, expectedBaseline: prior.expectedBaseline, expectedCumulative: prior.expectedCumulative, catalogDigest: catalogDigests[profile] };
    if (profile === 'large-v1') base.requiredShowcaseCatalogDigest = catalogDigests['showcase-v1'];
    profiles[profile] = base;
  }

  const priorLarge = profiles['large-v1'];
  const fixedAccountCatalog = assertFixedAccounts(fixedAccounts);
  profiles['large-v1-successor'] = {
    ...priorLarge,
    datasetId: 'preview-large-v1-successor',
    // The fixed B/C slice is created by this successor through the public API.
    // Its preflight therefore starts at the committed large-v1 cumulative
    // counts; only the successor cumulative target includes the new objects.
    expectedBaseline: priorLarge.expectedCumulative,
    expectedCumulative: addFixedPreviewCapacity(priorLarge.expectedCumulative),
    catalogDigest: catalogDigests['large-v1-successor'],
    successorOf: 'large-v1',
    requiredShowcaseCatalogDigest: catalogDigests['showcase-v1'],
    fixedAccounts: fixedAccountCatalog,
  };
  const previewData = buildPreviewData({ catalogDigests, factoryDigest: factory, sha256, fixedAccounts, verifierContract });

  return {
    schemaVersion: 1,
    targetId: frozen.targetId,
    successorOfTargetDigest: sha256(previous),
    rdsInstanceId: frozen.rdsInstanceId,
    rdsEndpoint: frozen.rdsEndpoint,
    rdsPort: frozen.rdsPort,
    tlsServername: frozen.tlsServername,
    expectedDbRole: frozen.expectedDbRole,
    database: frozen.database,
    apiBaseUrl: frozen.apiBaseUrl,
    schemaHead,
    schemaLedgerDigest,
    releasePath,
    releaseTreeDigest: tree,
    apiContractDigest,
    factoryDigest: factory,
    approvedProfiles: profiles,
    previewData,
  };
}

export function buildApproval({ generation, commit, tree, releaseDigest, origin, webBuildSha256, staticAssetsSha256, backendImageDigest, webImageDigest, releasePath, releaseTreeDigest, apiContractDigest, targetDigest, previewData }) {
  return {
    schemaVersion: 1,
    generation,
    mode: 'public-full-stack',
    releaseDigest,
    commit,
    tree,
    webBuildSha256,
    staticAssetsSha256,
    origin,
    releasePath,
    releaseTreeDigest,
    apiContractDigest,
    targetDigest,
    previewData,
    // compose 单机：runtime 身份 = 容器镜像摘要（backend=migrate/api/worker 共用，web 独立）。
    // 为什么按 @sha256 而非 tag：tag 可变漂移，只有内容寻址的 @sha256 与 CI 构建产物一一对应。
    images: { backend: backendImageDigest, web: webImageDigest },
  };
}

export async function querySchemaLedger(releasePath, sha256, resolveReadOnlyVerifierEnv) {
  const require = createRequire(join(releasePath, 'packages/db/package.json'));
  const pg = require('pg');
  const verifierEnv = resolveReadOnlyVerifierEnv(process.env);
  const pool = new pg.Pool({
    connectionString: verifierEnv.databaseUrl,
    ssl: { ca: readFileSync(verifierEnv.caPath, 'utf8'), rejectUnauthorized: true, servername: verifierEnv.tlsServername },
    max: 1,
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ');
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role')).rows[0];
    const ledger = (await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
    if (identity.database !== verifierEnv.expectedDatabase || identity.role !== verifierEnv.expectedRole) throw new Error(`prepare_wrong_db_identity:${identity.database}:${identity.role}`);
    const result = { schemaHead: `${ledger.at(-1)?.version}.sql`, schemaLedgerDigest: sha256(ledger) };
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

function validateSharedArgs(args) {
  if (!COMMIT.test(args.commit ?? '') || !COMMIT.test(args.tree ?? '') || !TAILSCALE_ORIGIN.test(args.origin ?? '') || !DIGEST.test(args['web-build-sha256'] ?? '') || !DIGEST.test(args['static-assets-sha256'] ?? '') || !IMAGE_DIGEST.test(args['backend-image-digest'] ?? '') || !IMAGE_DIGEST.test(args['web-image-digest'] ?? '')) throw new Error('prepare_argument_format_invalid');
  const releasePath = resolve(args['release-path']);
  if (!releasePath.startsWith('/srv/meetwise-full-stack/releases/') || releasePath.includes('..')) throw new Error('prepare_release_path_invalid');
  return { releasePath };
}

// compute 模式：以 meetwise-synthetic 运行，import tarball 的 catalog.mjs 并组装两份 JSON。
async function computeMain() {
  if (!trustedUid(process.getuid?.() ?? -1, process.getgid?.() ?? -1)) throw new Error('prepare_compute_requires_trusted_uid');
  const args = parseArgs(process.argv, 3); // 跳过 argv[2]='compute'
  const generation = Number(args.generation);
  if (!Number.isSafeInteger(generation) || generation < 1) throw new Error('prepare_generation_invalid');
  const { releasePath } = validateSharedArgs(args);

  const previous = JSON.parse(assertRootFile(TARGET_PATH, 0o600));
  // 全部 digest 复用本次 release 的 catalog.mjs 导出，保证与 loader/db-verify/publisher 回执链一致。
  const { buildPlan, sha256, FIXED_PREVIEW_ACCOUNTS: releaseFixedAccounts } = await import(join(releasePath, 'scripts/preview-synthetic-data/catalog.mjs'));
  const { EXPECTED_DATABASE, EXPECTED_ROLE, forbiddenGenericDatabaseEnv, VERIFY_DATABASE_CA_ENV, VERIFY_DATABASE_TLS_ENV, VERIFY_DATABASE_URL_ENV, VERIFY_EXPECTED_DATABASE_ENV, VERIFY_EXPECTED_ROLE_ENV, resolveReadOnlyVerifierEnv } = await import(join(releasePath, 'scripts/preview-synthetic-data/verifier-env.mjs'));
  if (JSON.stringify(publicFixedAccounts(releaseFixedAccounts)) !== JSON.stringify(publicFixedAccounts(FIXED_PREVIEW_ACCOUNTS))) throw new Error('prepare_fixed_preview_accounts_invalid');
  const releaseVerifierContract = {
    readOnly: true,
    requiredEnv: [VERIFY_DATABASE_URL_ENV, VERIFY_DATABASE_CA_ENV, VERIFY_DATABASE_TLS_ENV, VERIFY_EXPECTED_DATABASE_ENV, VERIFY_EXPECTED_ROLE_ENV],
    expectedDatabase: EXPECTED_DATABASE,
    expectedRole: EXPECTED_ROLE,
    forbiddenEnv: [...forbiddenGenericDatabaseEnv],
  };
  if (JSON.stringify(releaseVerifierContract) !== JSON.stringify(VERIFIER_ENV_CONTRACT)) throw new Error('prepare_verifier_contract_invalid');
  const verifierContract = VERIFIER_ENV_CONTRACT;

  const releaseTreeDigestValue = releaseTreeDigest(releasePath, sha256);
  const apiContractDigest = sha256(readFileSync(join(releasePath, 'packages/contracts/src/openapi.ts')));
  const factoryDigestValue = factoryDigest(releasePath, sha256);
  const catalogDigests = {
    'showcase-v1': buildPlan('showcase-v1', 'preview-showcase-v1').catalogDigest,
    'large-v1': buildPlan('large-v1', 'preview-large-v1').catalogDigest,
    'large-v1-successor': buildPlan('large-v1-successor', 'preview-large-v1-successor').catalogDigest,
  };

  const { schemaHead, schemaLedgerDigest } = await querySchemaLedger(releasePath, sha256, resolveReadOnlyVerifierEnv);

  const target = buildTarget(previous, { releasePath, releaseTreeDigest: releaseTreeDigestValue, apiContractDigest, schemaHead, schemaLedgerDigest, factoryDigest: factoryDigestValue, catalogDigests, sha256, fixedAccounts: releaseFixedAccounts, verifierContract });
  const targetDigest = sha256(target);
  const approval = buildApproval({ generation, commit: args.commit, tree: args.tree, releaseDigest: args.commit.slice(0, 7), origin: args.origin, webBuildSha256: args['web-build-sha256'], staticAssetsSha256: args['static-assets-sha256'], backendImageDigest: args['backend-image-digest'], webImageDigest: args['web-image-digest'], releasePath, releaseTreeDigest: releaseTreeDigestValue, apiContractDigest, targetDigest, previewData: target.previewData });

  process.stdout.write(`${JSON.stringify({ target, approval }, null, 2)}\n`);
}

async function main() {
  if (process.getuid?.() !== 0) throw new Error('prepare_requires_root');
  const args = parseArgs(process.argv);
  const { releasePath } = validateSharedArgs(args);

  // Exact retry is idempotent: once this release approval exists, never advance
  // generation merely because a later stage failed. The publisher remains the
  // owner of the committed generation.
  let previousApproval = null;
  try {
    previousApproval = JSON.parse(assertStrictRootFile(APPROVAL_PATH));
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  const exactRetry = previousApproval?.schemaVersion === 1
    && previousApproval.commit === args.commit
    && previousApproval.tree === args.tree
    && previousApproval.origin === args.origin
    && previousApproval.webBuildSha256 === args['web-build-sha256']
    && previousApproval.staticAssetsSha256 === args['static-assets-sha256']
    && previousApproval.images?.backend === args['backend-image-digest']
    && previousApproval.images?.web === args['web-image-digest']
    && previousApproval.releasePath === releasePath
    && previousApproval.previewData?.capacity?.profile === 'large-v1-successor'
    && previousApproval.previewData?.deepUsage?.scenarioId === 'deep-usage-v1';
  if (exactRetry) {
    process.stdout.write(`${JSON.stringify({ targetDigest: previousApproval.targetDigest, generation: previousApproval.generation, releasePath, replayed: true }, null, 2)}\n`);
    return;
  }

  let generation = 1;
  try {
    const state = JSON.parse(assertStrictRootFile(PUBLICATION_STATE_PATH));
    if (state.status !== 'revoked' || !Number.isSafeInteger(state.generation) || state.generation < 1) throw new Error('prepare_committed_predecessor_not_revoked');
    generation = state.generation + 1;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  // P0-1：不可信 catalog.mjs 以 meetwise-synthetic 执行（compute 模式），root 只做编排 + 落盘。
  // runuser 负责 setuid + initgroups（meetwise-synthetic 需 meetwise 补充组以 traverse
  // /srv/meetwise-full-stack root:meetwise）——initgroups 与环境处理无关。
  //
  // F4 环境白名单 + 无 argv 密钥（两层，与 meetwise-cd-root.sh synthetic_verify 同构）：
  //   (1) 绝不 --preserve-environment、绝不把 root 的整个进程环境透传给不可信 compute 进程；用 `env -i`
  //       从零重建最小环境（只带 HOME/PATH 进 bash）。spawnSync 自身也传空环境（runuser 经 libc 读
  //       /etc/passwd，不依赖环境）。
  //   (2) 绝不把 DATABASE_URL（含库口令）放进 argv：runuser 父进程存活期其 /proc/<pid>/cmdline 对同机
  //       其它非特权账号可读，argv 传密钥会泄口令（比 environ 差）。改由内层 bash 自己 source 那份 compute
  //       进程本就可读的 verifier-env（0640 root:meetwise-synthetic），密钥只经 environ 流入 node；argv 里
  //       只有脚本路径 self 与非密的 compute 参数（commit/tree/origin/摘要/releasePath/generation）。
  const self = fileURLToPath(import.meta.url);
  assertVerifierEnvFile();
  const computeArgs = ['compute', '--commit', args.commit, '--tree', args.tree, '--origin', args.origin, '--web-build-sha256', args['web-build-sha256'], '--static-assets-sha256', args['static-assets-sha256'], '--backend-image-digest', args['backend-image-digest'], '--web-image-digest', args['web-image-digest'], '--release-path', releasePath, '--generation', String(generation)];
  // bash -c SCRIPT bash <self> compute … → $0='bash'、$@=[self, …computeArgs]；exec node "$@"。
  const childScript = `set -a; . ${VERIFIER_ENV_FILE}; set +a; exec /usr/bin/node "$@"`;
  const child = spawnSync('/usr/sbin/runuser', [
    '-u', 'meetwise-synthetic', '--',
    '/usr/bin/env', '-i',
    'HOME=/var/lib/meetwise-preview-synthetic', 'PATH=/usr/sbin:/usr/bin:/sbin:/bin',
    '/bin/bash', '-c', childScript, 'bash', self, ...computeArgs,
  ], { encoding: 'utf8', env: {}, maxBuffer: 16 * 1024 * 1024 });
  if (child.error) throw child.error;
  // 不回传 child.stderr（compute 的 pg 连接错误可能带 host/user——按隐私铁律不外泄），只出固定 reason code。
  if (child.status !== 0) throw new Error('prepare_compute_failed');
  let target; let approval;
  try { ({ target, approval } = JSON.parse(child.stdout)); }
  catch { throw new Error('prepare_compute_output_invalid'); }

  // 防御性校验：compute 输出的「CI 传入身份字段」必须与 root 持有的 argv 原样一致，
  // 防不可信 tarball 在 compute 阶段偷换 commit/tree/origin/镜像摘要/releasePath/generation。
  //
  // 各 digest（targetDigest/factoryDigest/releaseTreeDigest/catalogDigest/schemaLedgerDigest/
  // apiContractDigest）都由 tarball 的 catalog.mjs `sha256` 算出，root 无法独立重算（sha256 在
  // tarball 里），这里只校验 targetDigest 的 hex 形状。下游 pinned publisher 的复核**不是**逐字段
  // 独立重算，精确边界如下：
  //   - targetDigest：publisher 用它**自带的可信 crypto** 对 target JSON 重算并断言
  //     `approval.targetDigest === sha256(target)`。这一步既能戳穿被换掉的 `sha256` 导出（伪造的
  //     sha256 算出的 targetDigest 必与可信 sha256 不符 → fail-closed），也把 target 内所有字段
  //     （含下列 digest 的**值**）钉进这一个可信摘要——改任一字段都会破坏该等式。
  //   - factoryDigest/releaseTreeDigest/catalogDigest/schemaLedgerDigest/apiContractDigest：publisher
  //     **不**从源码树/DB 独立重算。其形状/一致性校验分两档（核对过 publisher 实现，勿高估）：
  //       · catalogDigest 与 factoryDigest：有显式 hex 形状校验（DIGEST.test）+ 跨回执一致性；
  //       · releaseTreeDigest / apiContractDigest / schemaLedgerDigest：**仅**跨回执等值校验（approval/
  //         target/dbReceipt 逐字相同），无独立 hex 形状检查（形状经「等于已被 targetDigest 可信摘要
  //         钉住的 target 字段」间接继承）。
  //     跨回执一致性 = 同一值须在 approval/target/verification/dbReceipt/datasetManifest/maintenance
  //     逐字相同。它们与「真实」的锚定来自 synthetic-verify 阶段 loader/db-verify **对 live DB** 产出的
  //     回执 + 冻结云事实校验，而非 publisher 自行重算。故一个自洽地谎报这些内层 digest 的 tarball 不会被
  //     publisher 单独抓出，其防线是 live-DB 回执必须匹配 + prepare 的 querySchemaLedger 身份校验
  //     （database/role）+ confirm-public 阶段 GitHub-Actions 签名的外部探针回执。
  const bindingOk = approval?.commit === args.commit
    && approval?.tree === args.tree
    && approval?.origin === args.origin
    && approval?.releasePath === releasePath
    && approval?.generation === generation
    && approval?.webBuildSha256 === args['web-build-sha256']
    && approval?.staticAssetsSha256 === args['static-assets-sha256']
    && approval?.images?.backend === args['backend-image-digest']
    && approval?.images?.web === args['web-image-digest']
    && /^[a-f0-9]{64}$/.test(approval?.targetDigest ?? '')
    && target?.releasePath === releasePath
    && target?.schemaVersion === 1
    && approval?.schemaVersion === 1
    && JSON.stringify(approval?.previewData) === JSON.stringify(target?.previewData);
  if (!bindingOk) throw new Error('prepare_compute_output_binding_mismatch');
  assertPreviewDataShape(target.previewData);

  const targetDigest = approval.targetDigest;
  // 目标档落盘为 0640 root:meetwise-synthetic（loader/db-verify/compute 以 synthetic 只读）；
  // 审批档保持 0600 root:root（synthetic 无需读，仅 root 推导 generation）。
  durableWriteJson(TARGET_PATH, target, { mode: 0o640, uid: 0, gid: SYNTHETIC_GID });
  durableWriteJson(APPROVAL_PATH, approval, { mode: 0o600, uid: 0, gid: 0 });
  process.stdout.write(`${JSON.stringify({ targetDigest, generation, releasePath }, null, 2)}\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entry = process.argv[2] === 'compute' ? computeMain() : main();
  entry.catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'prepare_full_stack_release_failed'}\n`); process.exitCode = 1; });
}
