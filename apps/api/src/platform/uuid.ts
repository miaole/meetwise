/**
 * 资源 id UUID 校验单源（#85 归一·5E 批量清理刀 2026-10-12）。此前三份各写：
 * interview.service（V7 严形）/ roles.service + resume.service（通用形）。
 *
 * 错误码语义表（EXEC 重 pin 后固化·两形两码差异是**刻意的**，本刀不改任何响应行为）：
 *  - interview.service → UUID_V7_RE + 400 `invalid_resume_id`：入参是面试域 begin 的 resume-id，
 *    格式错=请求错（400 语义）；V7 严形与 @meetwise/db ids.ts uuidV7Hex 生成口径对齐。
 *  - roles.service / resume.service → UUID_RE + 404 `not_found_or_forbidden`：B 端列表/简历面，
 *    非 uuid 直查会 22P02→500，提前兜成 404（不向调用方泄漏 id 存在性；沿用各文件既有注释口径）。
 */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
