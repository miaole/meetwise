/**
 * 资源 id UUID 校验单源（#85 归一·5E 批量清理刀 2026-10-12）。此前三份各写：
 * interview.service（V7 严形）/ roles.service + resume.service（通用形）。
 *
 * 错误码语义表（EXEC 重 pin 后固化·两形两码差异是**刻意的**，本刀不改任何响应行为）：
 *  - interview.service → UUID_V7_RE + 400 `invalid_resume_id`：入参是面试域 begin 的 resume-id，
 *    格式错=请求错（400 语义）；V7 严形与 @meetwise/db ids.ts uuidV7Hex 生成口径对齐。
 *  - roles.service / resume.service → UUID_RE + 404 `not_found_or_forbidden`：B 端列表/简历面，
 *    非 uuid 直查会 22P02→500，提前兜成 404（不向调用方泄漏 id 存在性；沿用各文件既有注释口径）。
 *  - privacy.service → UUID_RE + 400 `privacy_preview_invalid`（#85 残面归一·UUID-ID-CHECK 刀 2026-10-16）：
 *    erasure-preview 回执 requestId 入参，格式错=请求错（400 语义）；原 inline 正则与通用形 byte 恒等，仅单源化零行为。
 *
 * 表外形显式登记（#85 残面普查 2026-10-16 定谳·下列各形**刻意不归入本单源**·语义归各文件头注）：
 *  - packages/domain/src/scoring-honesty.ts UUID_RE（V7 严形）↔ apps/web/lib/stream/scoring-honesty.ts WEB_UUID_RE：
 *    跨包孪生（byte 恒等），web 头注「不引入 domain 包」边界锁定；两侧 fail-closed 不抛（domain fail 码/web undefined）。
 *    跨包归一需架构决议（web→domain 依赖或常量迁 contracts=本单源钉位 re-pin）·裁量归协调方。
 *  - packages/domain/src/privacy-authorization.ts UUID（通用形）：jti 验签面，fail-closed → null（不抛）。
 *  - packages/domain/src/qbank-miss.ts RUBRIC_ID（通用形·无 /i 大小写敏感·全仓唯一漂移）：reason 码返回形；
 *    生成侧恒小写今日零偏差，收 /i=放宽行为变更·裁量归协调方。
 *  - apps/web/app/recruiter/jobs/actions.ts（通用形 inline）：web 表单层，失败=表单 message（非 Http 错误族）。
 *  - packages/db/src/ids.ts idUnixMs（[0-9a-fA-F] 显形）：生成/解码口径面（非请求守卫），系本表 V7 严形对齐参照上游。
 *  - packages/contracts z.string().uuid()（zod 内建 51 处）+ apps/web business-events.ts（1 处）：DTO 解析层另一机制族，不归一。
 *  - packages/db/src SQL ::uuid 铸型族（$1::uuid 等 36 处/9 文件）：Postgres 参数铸型面（DB 侧类型 coerce·非服务守卫）=层3 另机制族，不归一。
 *  非 uuid 族 id 形（app_/qgen-/qrecipe- 前缀形、数字形）各域内刻意，不在本表。
 */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
