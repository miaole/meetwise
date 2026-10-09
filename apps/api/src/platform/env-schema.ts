import { z } from 'zod';

/**
 * 审计 #91「配置集中校验刀」：关键必需 env 的**启动期 fail-fast 校验层**。
 *
 * 修复口径：此前 AUTH_SECRET 缺失照常启动并通过 readiness（auth.service.ts:57 缺密钥时
 * 登录恒 500、principal.guard.ts:52 所有 Bearer 验签恒 401——认证全瘫但探针全绿）。
 * 本层在 createApp 最早点对**关键必需项**做一次 zod 校验：缺失/格式错 → 抛
 * `env_schema_invalid` 并**一次性列全**缺失项，进程启动即死（main.ts bootstrap 捕获后
 * 打印错误并以退出码 1 结束）。校验结果同时纳入 readiness（health.service.configReady）。
 *
 * 三档定谳（逐消费点亲读，见 ai-docs/delivery/harness/obs-envschema-REQUEST.md §1）：
 *  - T1 必需（本层无条件校验）：AUTH_SECRET、数据库目标（DATABASE_URL 或完整 PG 五件套）。
 *  - T2 条件必需：无成员。MODEL_API_KEY 经亲读**降级 T3**——生产 compose 明文
 *    「Text provider credentials are Worker-only … no API service receives either key」
 *    （docker/compose.prod.yml:271-273，Key 仅挂 worker 块 :277），API 进程按部署契约
 *    本就不持有；WEB_ORIGIN 的生产 fail-closed 已由 main.ts:78-79 既有检查覆盖，不重复收。
 *  - T3 可选（运行时 fail-closed·设计如此·不入本层）：MODEL_API_KEY/MODEL_BACKUP_API_KEY
 *    （缺 → known_not_executed 未派发，model-client.ts:583）、DASHSCOPE 每能力 Key 族
 *    （缺 → *_not_configured，dashscope-native-config.ts:35）、DASHSCOPE_VISION_API_KEY
 *    （OCR 三锁预览-only，ocr-model-client.ts:12-24）、OCR_ENABLED/OCR_PREVIEW（缺省 0）。
 *
 * **Ban 大规模重构（#91 审计口径④）**：本层只做启动校验，不把散落各文件的 process.env
 * 读法改写成集中 config 对象；108 个 env 全量收编同样明确禁止。DATABASE_URL 的深度格式
 * 规则（协议/TLS/生产本地 host/URL 与组件冲突）仍以 @meetwise/db
 * resolveDatabaseConnectionString（packages/db/src/principal.ts:758-790）为单一真相，
 * 本层只做**存在性/粗格式**前置（同一 boot 内 db 层仍会二次把关，双保险不漂移）。
 */

/** 稳定错误码前缀：spawn 断言与日志告警按此 grep。 */
export const ENV_SCHEMA_INVALID = 'env_schema_invalid';

/** 空白串视同缺失（与 @meetwise/db nonEmpty 口径一致）。 */
const blankToUndefined = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? undefined : v);

const nonEmptyAfterTrim = z.string().trim().min(1);

/**
 * 关键必需 env 的 zod schema（字段级格式面）。只收 T1 面；成员语义：
 *  - AUTH_SECRET：登录令牌 HMAC 密钥（消费点 auth.service.ts:57 / principal.guard.ts:52 /
 *    profile.service.ts:111 / privacy.service.ts:74 回退）。缺失 = 认证全瘫。
 *  - 数据库目标二选一（与 principal.ts:765-786 同口径）：DATABASE_URL（粗格式
 *    postgres:// 或 postgresql://）**或** PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE
 *    完整组件集（password 允许空串、不允许未定义）。
 *    择一关系不放在 superRefine——zod 在基础字段已有 issue 时跳过 refinement，
 *    会漏报缺失项；改由 parseCriticalEnv 在 parse 后以普通代码恒算（保证一次性列全）。
 */
const criticalEnvSchema = z.object({
  AUTH_SECRET: z.preprocess(blankToUndefined, nonEmptyAfterTrim),
  DATABASE_URL: z.preprocess(
    blankToUndefined,
    z
      .string()
      .regex(/^postgres(ql)?:\/\//, { message: 'database_url_must_start_with_postgres_or_postgresql' })
      .optional(),
  ),
  PGHOST: z.preprocess(blankToUndefined, nonEmptyAfterTrim.optional()),
  PGPORT: z.preprocess(
    blankToUndefined,
    z.coerce
      .number()
      .int()
      .min(1)
      .max(65535, { message: 'database_port_out_of_range' })
      .optional(),
  ),
  PGUSER: z.preprocess(blankToUndefined, nonEmptyAfterTrim.optional()),
  PGPASSWORD: z.string().optional(),   // 允许空串；只关心「是否提供」（principal.ts:767 components.password === undefined 才算缺）
  PGDATABASE: z.preprocess(blankToUndefined, nonEmptyAfterTrim.optional()),
});

/** 校验结果：ok=false 时 problems 为稳定机器码列表（如 `missing:AUTH_SECRET`）。 */
export type EnvSchemaResult = { ok: true } | { ok: false; problems: string[] };

/** zod issue → 稳定机器码（`missing:<KEY>` / `invalid:<KEY>:<原因>`）。 */
function issueToProblemCode(issue: z.ZodIssue): string {
  const key = issue.path.join('.') || 'env';
  if (key === 'AUTH_SECRET') return 'missing:AUTH_SECRET';
  return `invalid:${key}:${issue.message ?? ''}`;
}

/** 数据库目标存在性恒算（parse 后普通代码，保证与其它缺失项一次性并列）。 */
function databaseTargetProblem(
  data: {
    DATABASE_URL?: string;
    PGHOST?: string;
    PGPORT?: number;
    PGUSER?: string;
    PGPASSWORD?: string;
    PGDATABASE?: string;
  },
  rawEnv: NodeJS.ProcessEnv,
): string | undefined {
  // 已提供（非空白）DATABASE_URL 时不再报 target_missing——格式问题由 invalid:DATABASE_URL 单列（与 db SSOT 的 database_url_malformed 单列口径一致）。
  if (blankToUndefined(rawEnv.DATABASE_URL) !== undefined) return undefined;
  const missingComponents = (
    ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const
  ).filter((name) => data[name] === undefined);
  if (missingComponents.length === 0) return undefined;   // 五件套齐全=components 路径合法（principal.ts:765-786 同口径）
  return `database_target_missing:DATABASE_URL or complete PG component set (lacking: ${missingComponents.join(',')})`;
}

/**
 * 纯函数校验（不抛错、零副作用）：供 boot fail-fast 与 readiness 配置位共用。
 * 重复调用安全（env 进程内不变；单次 zod parse 为微秒级，readiness 每次现算不做缓存）。
 */
export function parseCriticalEnv(env: NodeJS.ProcessEnv = process.env): EnvSchemaResult {
  const parsed = criticalEnvSchema.safeParse(env);
  const targetProblem = databaseTargetProblem(parsed.success ? parsed.data : {}, env);
  if (parsed.success) {
    return targetProblem === undefined ? { ok: true } : { ok: false, problems: [targetProblem] };
  }
  const problems = [...new Set(parsed.error.issues.map(issueToProblemCode))];
  if (targetProblem !== undefined) problems.push(targetProblem);
  return { ok: false, problems };
}

/** 启动期 fail-fast：校验不过 → 抛 `env_schema_invalid: <全量缺失项>`（调用方打印后即死）。 */
export function assertCriticalEnv(env: NodeJS.ProcessEnv = process.env): void {
  const result = parseCriticalEnv(env);
  if (result.ok) return;
  throw new Error(`${ENV_SCHEMA_INVALID}: ${result.problems.join('; ')}`);
}
