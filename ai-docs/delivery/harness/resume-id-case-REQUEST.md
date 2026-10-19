executed:awaiting_post_prove_dual

# 重复开始按同一简历标识认

本说明只记录改法。本步不改产品代码，不改测试。

## §0 锚

行号在提交 `033b1de4f1ee1f7c393b161cb6ead9283390a4ab` 上亲读。下面是打开文件时看到的原文位置。

### 0.1 正则

`apps/api/src/platform/uuid.ts`

- 第 26 行：`export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;` 末尾有 `i`，大写十六进制能通过。
- 第 27 行：`export const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;` 同样有 `i`。
- 第 6–7 行注释仍写面试开始使用 `UUID_V7_RE`。不改这两行注释，也不改第 26、27 行正则。

### 0.2 开始一场面试

`apps/api/src/modules/interview/interview.service.ts`

- 第 27 行：`import { UUID_V7_RE as UUID_RE } from '../../platform/uuid.ts';` 函数里的名字是 `UUID_RE`，绑定的值是 `UUID_V7_RE`。实际执行的正则也有 `i`，所以大写十六进制能通过。本改法不动这行。
- 第 102 行起是 `beginInterviewCore`。第 107 行：`if (!UUID_RE.test(resumeId))` 抛 `{ error: 'invalid_resume_id' }`，状态是 `HttpStatus.BAD_REQUEST`。无效简历标识在这里拒绝。
- 第 173 行：`pinnedResumeId.toLowerCase() !== resumeId.toLowerCase()`。押题 pin 的简历标识比较已经两边都转小写。
- 第 184 行：`const existingResumeId = cur.rows[0].resume_id as string | null;` 来自第 123 行 `SELECT status,resume_id,...`，没有 `::text`。
- 第 188–189 行：`if (existingResumeId && existingResumeId !== resumeId)` 为真就抛 `{ error: 'interview_resume_binding_conflict' }`，状态是 `HttpStatus.CONFLICT`。这里仍是字符串原样比较。
- 第 197–212 行是首次绑定的 `UPDATE`。第 199 行：`SET resume_id=r.id,` 写成简历行自己的 `id`，不是请求头原文。参数仍是第 212 行的 `resumeId`。
- 第 218–231 行查已有 `kind='start'` 的 job。第 231 行：`if (existing.rowCount! > 0) return { accepted: true, jobId: existing.rows[0].id, alreadyBegun: true };` 只有已有 start job 才返回 `alreadyBegun`。
- 第 253–256 行才调用 `reserveEntitlementForApplication` 或 `reserveEntitlement`。第 188 行在扣额之前。

`apps/api/src` 里 `existingResumeId !==` 只有第 188 行这一处。

`apps/api/src/modules/interview/interview.controller.ts` 第 28–31 行：`@HttpCode(202)`，`@Headers('resume-id')` 原样传给 `begin`，不改大小写。同文件第 424–428 行 `begin` 调用 `beginInterviewCore`。

### 0.3 为什么同一枚标识会被当成另一份

- `packages/db/sql/03_resume.sql` 第 10 行：`id uuid PRIMARY KEY`。
- `packages/db/migrations/0028_application_bound_interview.sql` 第 8 行：`ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_id uuid;`
- `packages/db/sql/22_interview_invitation.sql` 第 36 行同样是 `resume_id uuid`。

同一枚 UUID 第一次用任意能通过第 107 行正则的大小写开始，都可以按 `r.id=$3` 绑上；写入的是简历行自己的 `id`。该列是 uuid，读回是规范小写。同一个开始再发、头里仍是大写时，第 188 行用规范小写对请求头原文做字符串比较，不相等就 409，走不到第 231 行的 `alreadyBegun`，也走不到扣额。这不是两份不同简历。

## §1 修法

只改 `apps/api/src/modules/interview/interview.service.ts` 第 188 行这一处比较。两边都 `toLowerCase()`，与第 173 行同一做法。`existingResumeId` 为空时仍短路，不调用 `toLowerCase`。第 189 行抛错保持原样。

改成：

```
    if (existingResumeId && existingResumeId.toLowerCase() !== resumeId.toLowerCase())
      throw new HttpException({ error: 'interview_resume_binding_conflict' }, HttpStatus.CONFLICT);
```

不相等仍然抛原来的 `interview_resume_binding_conflict`，状态码仍是 `HttpStatus.CONFLICT`（409）。

不改首次绑定 SQL（第 197–212 行）。不改扣额（第 253–256 行）。不改 `alreadyBegun` 的条件（第 218–231 行）。不改成功状态码（控制器第 29 行仍是 202）。不改 `uuid.ts` 的正则，也不改那里的注释。不改第 27 行的 import。

不新增证明文件，不新开 npm script。执行时只往已经存在的 `apps/api/test/resume-reference-http.proof.ts` 加断言。该文件第 50–80 行对 `POST /interview/:id/begin` 发真实请求，经控制器第 30–31 行进入 `begin`，再进入 `beginInterviewCore`。第 57–61 行第一次开始，第 75–80 行用同一枚、同一大小写再发，期望 202、`alreadyBegun === true`、同一 `jobId`、start job 仍是 1 条。这段期望保持不动。

在第 75–80 行之后追加两次断言，仍在这个文件里：

1. 再发一次开始。`resume-id` 仍是这一枚标识，但十六进制字母用大写（`resumeId.toUpperCase()`）。它必须和原来的 `resumeId` 不相等；相等说明这枚没有 a–f 字母，这次不能算覆盖。期望仍是 202、`alreadyBegun === true`、`jobId` 与第一次相同、该面试的 start job 仍是 1 条。响应不是 409，错误不是 `interview_resume_binding_conflict`。
2. 再发一次开始，`resume-id` 是另一枚不同的简历标识。期望 409，错误仍是 `interview_resume_binding_conflict`，start job 仍是 1 条，不得 `alreadyBegun`。

## §1.3 否决

- 不改正则。不改 `uuid.ts` 第 26 行 `UUID_RE`，不改第 27 行 `UUID_V7_RE`，不去掉 `i`，不把入参收成只接受小写。
- 不改成 V7。不把第 107 行的校验改去调用别的正则，也不把 `uuid.ts` 里的 `UUID_RE` 改成 `UUID_V7_RE`。第 27 行现有别名保持不动。
- 不改错误码。不相等时仍是 `interview_resume_binding_conflict`，不改 409，不改成 400 或其他码。
- 不改扣额。大小写不同的同一次重放不得变成第二次预留，也不改第 253–256 行的预留调用。
- 不顺手改别的比较。第 173 行已经两边 `toLowerCase`，不要再改。不把请求头先统一成小写再往下传。不改控制器读头。不改第 199 行 `SET resume_id=r.id`。

## §2 门

点名的已有证明命令，不新造：

`pnpm -C apps/api prove:resume-reference-http`

`apps/api/package.json` 第 76 行已经是 `"prove:resume-reference-http": "node --import @swc-node/register/esm-register test/resume-reference-http.proof.ts"`。执行时只给这个证明加 §1 的断言，不新开 script。

再加上：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`pnpm turbo lint` 的警告上限恰为：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601、qdrant 27、ai-graphs 47、contracts 265。0 errors。低于上限可以通过，不许放宽。

对应脚本是各包 `package.json` 里现有的 `eslint . --max-warnings <该数>`：根 `package.json` 第 8 行 5242，`apps/api/package.json` 第 7 行 1423，`packages/domain/package.json` 第 10 行 115，`packages/ai-runtime/package.json` 第 14 行 628，`apps/worker/package.json` 第 7 行 959，`packages/db/package.json` 第 11 行 1042，`apps/web/package.json` 第 7 行 601，`packages/qdrant-store/package.json` 第 11 行 27，`packages/ai-graphs/package.json` 第 10 行 47，`packages/contracts/package.json` 第 12 行 265。未点名的包维持各自现有 lint 脚本，不得放宽。

## §8

本步只新增本说明。

executed:awaiting_post_prove_dual

## 同值

executed:awaiting_post_prove_dual

## §9-EXEC

开头、§8、同值三处状态改为 `executed:awaiting_post_prove_dual`。前文未改。

改动：

- `apps/api/src/modules/interview/interview.service.ts`：已绑定简历标识与本次标识的比较改为两边 `toLowerCase()`。标识为空时仍先短路，不调用 `toLowerCase`。抛错仍是 `interview_resume_binding_conflict` 与 `HttpStatus.CONFLICT`。正则、import、扣额、`alreadyBegun`、控制器、`SET resume_id=r.id` 未改。
- `apps/api/test/resume-reference-http.proof.ts`：同一大小写重放的原断言保留。追加大写十六进制再开始：标识必须与原字符串不相等，响应 202，`alreadyBegun === true`，同一个 jobId，start job 仍是 1 条，且不是 409、错误不是 `interview_resume_binding_conflict`。另一枚不同简历标识：409，错误仍是 `interview_resume_binding_conflict`，不得 `alreadyBegun`，start job 仍是 1 条。没有新证明文件，没有新 npm script。
- 同一份夹具补了一行可解密原文，并把这份简历的 `content_sha` 写成 64 位十六进制。不补的话，第一次开始会在路由供给处停下（无原文是 `candidate_route_undecided`，指纹不合检查是 23514），重复开始到不了标识比较。扣额桶和开始语句未改。

退出码：

- `pnpm resume-reference:http:prove` 写入 `exec-resume-id.log`：0。11 条断言通过。隔离包装未拒绝新引用，未改 `scripts/run-e2e-isolated.mjs`。
- `node scripts/ai-docs/check-docs.mjs` 写入 `exec-resume-id-docs.log`：0。
