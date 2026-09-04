/**
 * 视觉(OCR) endpoint 治理（BAILIAN-04 的 vision 侧修复）。
 *
 * OCR 过去复用文本主 Key（`MODEL_API_KEY`）+ 自由 URL（`MODEL_BASE_URL`），视觉与文本
 * 同凭据、同注入面。后果：文本路由一换 provider，视觉就跟着把简历图片发去错误的数据等级；
 * 且 OCR 虽 fail-closed，接线仍指向 broad text key，是待剪断路径（分析 A3）。
 *
 * 本文件把「视觉 endpoint 是什么」收口为**专用 profile + 专用 Key**：
 *   - Key 只读 `DASHSCOPE_VISION_API_KEY`，绝不读 `MODEL_API_KEY`（B2.6 隔离）；
 *   - endpoint 复用版本化 profile 注册表（与 text-endpoint-config.ts 同源 host/path，
 *     即百炼兼容北京 `/compatible-mode/v1`），绝不接受自由 URL 注入；
 *   - 解析结果 `Object.freeze`，调用方无法在派发前改写 endpoint。
 *
 * 注意：这仍是 **transport 边界**，不是 operation registry。OCR 的业务接线仍由
 * MODEL-OP-01 在 `ocr-model-client.ts` 把关：仅预览双旗可派发，生产锁仍拒绝。
 */
import { assertKeyFingerprint, parseRevokedFingerprints } from './secret-fingerprint.ts';

export const VISION_ENDPOINT_REGISTRY_VERSION = 'vision-cn-beijing-v1' as const;

export type VisionEndpointProfile = 'dashscope-cn-beijing';

export interface VisionEndpointConfig {
  readonly registryVersion: typeof VISION_ENDPOINT_REGISTRY_VERSION;
  readonly profile: VisionEndpointProfile;
  readonly region: 'cn';
  readonly baseUrl: string; // 恒为 https，无 userinfo/query/fragment
  readonly apiKey?: string;
  readonly model: string;
}

/** 旧自由 URL 变量：vision 侧同样拒绝，防止旧注入面残留在「未来某次 enable」才暴露。 */
const LEGACY_VISION_URL_VARIABLES = ['MODEL_BASE_URL', 'MODEL_BACKUP_BASE_URL'] as const;

/** profile → 精确 host + basePath（与文本侧 dashscope-cn-beijing 同源；闭集，只能改这里）。 */
const VISION_ENDPOINT_PROFILES: Record<VisionEndpointProfile, { host: string; basePath: string }> = {
  'dashscope-cn-beijing': { host: 'dashscope.aliyuncs.com', basePath: '/compatible-mode/v1' },
};

export function rejectLegacyVisionUrlOverrides(env: NodeJS.ProcessEnv): void {
  for (const name of LEGACY_VISION_URL_VARIABLES) {
    if (env[name]?.trim()) throw new Error('vision_endpoint_env_forbidden');
  }
}

/**
 * 视觉端点快照。Key 只读 `DASHSCOPE_VISION_API_KEY`（专用视觉 Key，与文本 MODEL_API_KEY
 * 无关）；模型名读 `DASHSCOPE_VISION_MODEL`，缺省 qwen-vl-max。结果冻结。
 */
export function resolveVisionEndpointConfig(env: NodeJS.ProcessEnv = process.env): VisionEndpointConfig {
  rejectLegacyVisionUrlOverrides(env);
  // H1 fix: 视觉 Key 的指纹/撤销校验过去是死代码——resolve 从不调 assert，组合根也只 resolve，
  // 导致 compose 挂载的 DASHSCOPE_VISION_API_KEY_FINGERPRINT / REVOKED 清单无人消费，轮换后旧视觉
  // Key 残留不会被机械拦截。把 assert 收进 resolve，任何视觉 client 解析都必经校验（fail-closed）。
  assertVisionEndpointKeyFingerprint(env);
  const profile: VisionEndpointProfile = 'dashscope-cn-beijing';
  const { host, basePath } = VISION_ENDPOINT_PROFILES[profile];
  return Object.freeze({
    registryVersion: VISION_ENDPOINT_REGISTRY_VERSION,
    profile,
    region: 'cn' as const,
    baseUrl: `https://${host}${basePath}`,
    apiKey: env.DASHSCOPE_VISION_API_KEY,
    // F3 fix: 统一读 DASHSCOPE_VISION_MODEL（与 ASR/EMBED/RERANK 同族），
    // 旧 VISION_MODEL_NAME 与 compose/env/policy 全用的 DASHSCOPE_VISION_MODEL 漂移，是死配置。
    model: env.DASHSCOPE_VISION_MODEL?.trim() || 'qwen-vl-max',
  });
}

/**
 * 视觉 Key 的启动期指纹/撤销清单校验（B3 fail-closed）。与 DashScope 6 能力 Key 共用
 * 同一 `DASHSCOPE_REVOKED_KEY_FINGERPRINTS` 撤销清单；Key 未挂载时跳过（未配置语义归调用方）。
 */
export function assertVisionEndpointKeyFingerprint(env: NodeJS.ProcessEnv = process.env): void {
  const revoked = parseRevokedFingerprints(env.DASHSCOPE_REVOKED_KEY_FINGERPRINTS);
  assertKeyFingerprint({ key: env.DASHSCOPE_VISION_API_KEY, fingerprint: env.DASHSCOPE_VISION_API_KEY_FINGERPRINT, revoked, name: 'dashscope_vision_api_key' });
}
