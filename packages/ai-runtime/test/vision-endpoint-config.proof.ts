/**
 * BAILIAN-03/04 视觉(OCR)侧 endpoint + 轮换残留治理的纯逻辑证明。
 * 覆盖 B1（专用 vision profile：只读 DASHSCOPE_VISION_API_KEY，拒绝自由 URL）
 * 与 B3（视觉 Key 指纹/撤销清单 fail-closed）。
 * 无网络、无 DB、无真实凭据：只对 resolveVisionEndpointConfig /
 * rejectLegacyVisionUrlOverrides / assertVisionEndpointKeyFingerprint 做确定性断言。
 */
import {
  VISION_ENDPOINT_REGISTRY_VERSION,
  assertVisionEndpointKeyFingerprint,
  rejectLegacyVisionUrlOverrides,
  resolveVisionEndpointConfig,
} from '../src/vision-endpoint-config.ts';
import { keyFingerprint } from '../src/secret-fingerprint.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const errorOf = (action: () => unknown): string => {
  try { action(); return 'no_error'; }
  catch (error) { return error instanceof Error ? error.message : String(error); }
};

const EMPTY: NodeJS.ProcessEnv = {};

function main() {
  // ── B1: 视觉 endpoint 注册表 ──
  const vision = resolveVisionEndpointConfig(EMPTY);
  A('视觉 endpoint 固定 dashscope-cn-beijing 精确 https host+basePath',
    vision.profile === 'dashscope-cn-beijing'
    && vision.baseUrl === 'https://dashscope.aliyuncs.com/compatible-mode/v1'
    && vision.region === 'cn'
    && vision.registryVersion === VISION_ENDPOINT_REGISTRY_VERSION
    && vision.model === 'qwen-vl-max');
  A('视觉 endpoint 快照被冻结（调用方无法在派发前改写）', Object.isFrozen(vision));
  A('视觉 Key 只读专用 DASHSCOPE_VISION_API_KEY，绝不读文本主 MODEL_API_KEY',
    resolveVisionEndpointConfig({ DASHSCOPE_VISION_API_KEY: 'vision-key', MODEL_API_KEY: 'text-key' }).apiKey === 'vision-key');
  A('视觉模型名读 DASHSCOPE_VISION_MODEL（与 compose/env/policy 同族，非 VISION_MODEL_NAME）',
    resolveVisionEndpointConfig({ DASHSCOPE_VISION_MODEL: 'qwen-vl-plus' }).model === 'qwen-vl-plus');
  A('旧自由 URL MODEL_BASE_URL 出现即拒绝（切断文本 URL 复用）',
    errorOf(() => resolveVisionEndpointConfig({ MODEL_BASE_URL: 'https://model.invalid' })) === 'vision_endpoint_env_forbidden');
  A('旧自由 URL MODEL_BACKUP_BASE_URL 出现即拒绝',
    errorOf(() => resolveVisionEndpointConfig({ MODEL_BACKUP_BASE_URL: 'https://backup.invalid' })) === 'vision_endpoint_env_forbidden');
  A('rejectLegacyVisionUrlOverrides 单独拒绝任意旧 URL（供组合根禁用态提前校验）',
    errorOf(() => rejectLegacyVisionUrlOverrides({ MODEL_BASE_URL: 'x' })) === 'vision_endpoint_env_forbidden'
    && errorOf(() => rejectLegacyVisionUrlOverrides(EMPTY)) === 'no_error');

  // ── B3: 视觉 Key 指纹 + 撤销清单 fail-closed ──
  const visionKey = 'vision-rotate-key';
  const visionFp = keyFingerprint(visionKey);
  A('视觉 Key 与期望指纹一致时不抛（正常启动）',
    errorOf(() => assertVisionEndpointKeyFingerprint({ DASHSCOPE_VISION_API_KEY: visionKey, DASHSCOPE_VISION_API_KEY_FINGERPRINT: visionFp })) === 'no_error');
  A('视觉 Key 与期望指纹不一致 → dashscope_vision_api_key_fingerprint_mismatch',
    errorOf(() => assertVisionEndpointKeyFingerprint({ DASHSCOPE_VISION_API_KEY: visionKey, DASHSCOPE_VISION_API_KEY_FINGERPRINT: 'deadbeefdeadbeef' })) === 'dashscope_vision_api_key_fingerprint_mismatch');
  A('视觉 Key 命中撤销指纹清单 → dashscope_vision_api_key_revoked',
    errorOf(() => assertVisionEndpointKeyFingerprint({ DASHSCOPE_VISION_API_KEY: visionKey, DASHSCOPE_REVOKED_KEY_FINGERPRINTS: visionFp })) === 'dashscope_vision_api_key_revoked');
  A('视觉 Key 未挂载时跳过指纹校验（未配置语义归调用方）',
    errorOf(() => assertVisionEndpointKeyFingerprint({ DASHSCOPE_VISION_API_KEY_FINGERPRINT: 'deadbeefdeadbeef' })) === 'no_error');

  console.log(`\n${failures === 0 ? '✓ 视觉 endpoint 注册表 + 轮换残留治理全部通过' : `✗ ${failures} 项失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
