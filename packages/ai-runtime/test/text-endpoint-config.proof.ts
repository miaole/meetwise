/**
 * BAILIAN-03/04 文本侧 endpoint + 轮换残留治理的纯逻辑证明。
 * 覆盖 B1（版本化 profile 注册表：精确 https host/path，拒绝自由 URL/非法 profile/跨区）
 * 与 B3（指纹/撤销清单 fail-closed：挂错 Key、旧 Key 残留机械拦截）。
 * 无网络、无 DB、无真实凭据：只对纯函数 resolveTextEndpointConfig /
 * resolveTextBackupEndpointConfig / isTextBackupEnabled / assertTextEndpointKeyFingerprints
 * 与共享原语 keyFingerprint / parseRevokedFingerprints 做确定性断言。
 */
import {
  TEXT_ENDPOINT_REGISTRY_VERSION,
  assertTextEndpointKeyFingerprints,
  isTextBackupEnabled,
  resolveTextBackupEndpointConfig,
  resolveTextEndpointConfig,
} from '../src/text-endpoint-config.ts';
import { keyFingerprint, parseRevokedFingerprints } from '../src/secret-fingerprint.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (action: () => unknown): string => {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
};

// 本证明只在传入的 env 字面量上操作，绝不动真实 process.env（无 .env、无密钥）。
const EMPTY: NodeJS.ProcessEnv = {};

function main() {
  // ── B1: 主文本 endpoint 注册表 ──
  const primary = resolveTextEndpointConfig(EMPTY);
  A('主文本默认 profile = deepseek-cn-public，精确 https host、无 basePath',
    primary.profile === 'deepseek-cn-public'
    && primary.baseUrl === 'https://api.deepseek.com'
    && primary.region === 'cn'
    && primary.registryVersion === TEXT_ENDPOINT_REGISTRY_VERSION
    && primary.model === 'qwen-plus');
  A('主文本 endpoint 快照被冻结（调用方无法在派发前改写）', Object.isFrozen(primary));
  A('主文本 Key 只读 MODEL_API_KEY（不落别的变量）',
    resolveTextEndpointConfig({ MODEL_API_KEY: 'primary-key' }).apiKey === 'primary-key');
  A('主文本模型名读 MODEL_NAME',
    resolveTextEndpointConfig({ MODEL_NAME: 'deepseek-v4-pro' }).model === 'deepseek-v4-pro');

  const qwen = resolveTextEndpointConfig({ MODEL_ENDPOINT_PROFILE: 'dashscope-cn-beijing' });
  A('受控 profile 可切到百炼兼容北京（精确 host+basePath）',
    qwen.profile === 'dashscope-cn-beijing'
    && qwen.baseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1');

  A('非法 profile（不在闭集注册表）被拒绝',
    errorOf(() => resolveTextEndpointConfig({ MODEL_ENDPOINT_PROFILE: 'evil-cross-region' })) === 'text_endpoint_profile_invalid');
  A('原型链键 constructor/__proto__/toString 不被当作合法 profile（Object.hasOwn 防 in 原型链命中）',
    errorOf(() => resolveTextEndpointConfig({ MODEL_ENDPOINT_PROFILE: 'constructor' })) === 'text_endpoint_profile_invalid'
    && errorOf(() => resolveTextEndpointConfig({ MODEL_ENDPOINT_PROFILE: '__proto__' })) === 'text_endpoint_profile_invalid'
    && errorOf(() => resolveTextEndpointConfig({ MODEL_ENDPOINT_PROFILE: 'toString' })) === 'text_endpoint_profile_invalid'
    && errorOf(() => resolveTextBackupEndpointConfig({ MODEL_BACKUP_ENDPOINT_PROFILE: 'constructor' })) === 'text_endpoint_profile_invalid');
  A('旧自由 URL MODEL_BASE_URL 出现即拒绝（绝不当作可解析 endpoint）',
    errorOf(() => resolveTextEndpointConfig({ MODEL_BASE_URL: 'https://api.deepseek.com' })) === 'text_endpoint_env_forbidden');
  A('旧自由 URL MODEL_BACKUP_BASE_URL 出现即拒绝',
    errorOf(() => resolveTextEndpointConfig({ MODEL_BACKUP_BASE_URL: 'https://qwen.backup.invalid' })) === 'text_endpoint_env_forbidden');

  // ── B1: 备用文本 endpoint ──
  A('备用 endpoint 默认 profile = dashscope-cn-beijing（与主独立）',
    resolveTextBackupEndpointConfig(EMPTY).baseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1');
  const backup = resolveTextBackupEndpointConfig({
    MODEL_BACKUP_API_KEY: 'backup-key',
    MODEL_BACKUP_NAME: 'qwen-plus',
    MODEL_BACKUP_ENDPOINT_PROFILE: 'dashscope-cn-beijing',
  });
  A('备用 endpoint 读独立 MODEL_BACKUP_API_KEY / MODEL_BACKUP_NAME',
    backup.apiKey === 'backup-key' && backup.model === 'qwen-plus' && Object.isFrozen(backup));
  A('备用模型名缺省回退主 MODEL_NAME，再回退默认',
    resolveTextBackupEndpointConfig({ MODEL_NAME: 'primary-name' }).model === 'primary-name'
    && resolveTextBackupEndpointConfig(EMPTY).model === 'qwen-plus');
  A('备用 endpoint 同样拒绝旧自由 URL 注入',
    errorOf(() => resolveTextBackupEndpointConfig({ MODEL_BACKUP_BASE_URL: 'https://qwen.backup.invalid' })) === 'text_endpoint_env_forbidden');
  A('备用启用开关 = 备用 Key 已挂载（与自由 URL 存在性无关）',
    isTextBackupEnabled({ MODEL_BACKUP_API_KEY: 'k' }) === true
    && isTextBackupEnabled({ MODEL_BACKUP_API_KEY: '   ' }) === false
    && isTextBackupEnabled({ MODEL_BACKUP_BASE_URL: 'https://qwen.backup.invalid' }) === false
    && isTextBackupEnabled(EMPTY) === false);

  // ── 共享原语: 指纹 / 撤销清单 ──
  const fp = keyFingerprint('rotate-me-key');
  A('指纹 = SHA-256 前 16 个十六进制字符（确定性、不反推明文）',
    fp.length === 16 && /^[0-9a-f]{16}$/.test(fp) && keyFingerprint('rotate-me-key') === fp && fp !== 'rotate-me-key');
  A('撤销清单解析：逗号分隔、去空、大小写归一、去重',
    [...parseRevokedFingerprints(' AbCdEf0123456789, ,abcdef0123456789,ABCDEF0123456789 ')].join(',') === 'abcdef0123456789');
  A('撤销清单空/缺省 = 空集（不启用撤销拦截，但与「无旧 Key 记录」语义区分）',
    parseRevokedFingerprints(undefined).size === 0 && parseRevokedFingerprints('  ').size === 0);
  A('撤销清单项格式非法（非 16 位十六进制）→ revoked_fingerprint_malformed（fail-closed）',
    errorOf(() => parseRevokedFingerprints('deadbeef')) === 'revoked_fingerprint_malformed'
    && errorOf(() => parseRevokedFingerprints('deadbeefdeadbeef, xyz')) === 'revoked_fingerprint_malformed'
    && errorOf(() => parseRevokedFingerprints('deadbeefdeadbeef0')) === 'revoked_fingerprint_malformed');

  // ── B3: 主/备用 Key 指纹 + 撤销清单 fail-closed ──
  const modelKey = 'model-primary-key';
  const modelFp = keyFingerprint(modelKey);
  A('主 Key 与期望指纹一致时不抛（正常启动）',
    errorOf(() => assertTextEndpointKeyFingerprints({ MODEL_API_KEY: modelKey, MODEL_API_KEY_FINGERPRINT: modelFp })) === 'no_error');
  A('主 Key 与期望指纹不一致 → model_api_key_fingerprint_mismatch（挂错 Key 被拦）',
    errorOf(() => assertTextEndpointKeyFingerprints({ MODEL_API_KEY: modelKey, MODEL_API_KEY_FINGERPRINT: 'deadbeefdeadbeef' })) === 'model_api_key_fingerprint_mismatch');
  A('主 Key 命中撤销指纹清单 → model_api_key_revoked（旧 Key 残留被拦）',
    errorOf(() => assertTextEndpointKeyFingerprints({ MODEL_API_KEY: modelKey, MODEL_REVOKED_KEY_FINGERPRINTS: modelFp })) === 'model_api_key_revoked');
  A('备用 Key 命中撤销清单 → model_backup_api_key_revoked',
    errorOf(() => assertTextEndpointKeyFingerprints({ MODEL_BACKUP_API_KEY: modelKey, MODEL_REVOKED_KEY_FINGERPRINTS: modelFp })) === 'model_backup_api_key_revoked');
  A('Key 未挂载时跳过指纹校验（未配置语义归调用方，不越权抛错）',
    errorOf(() => assertTextEndpointKeyFingerprints({ MODEL_API_KEY_FINGERPRINT: 'deadbeefdeadbeef' })) === 'no_error');

  console.log(`\n${failures === 0 ? '✓ 文本 endpoint 注册表 + 轮换残留治理全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
