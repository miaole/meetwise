draft:awaiting_pre_exec_dual

# 无标题联系行要按归一化原文过滤

本说明只记录改法。本步不改产品代码，不改证明，不改迁移。

## §0 锚

行号是在分支 `line/contact-header-draft`、提交 `eacbc47983a795960fa30243c9699429d6d9a0a0` 上打开文件看到的。

### 0.1 判断认三件事

`packages/domain/src/index.ts` 第 43 行 `looksLikeContactHeaderLine` 认三件事，满足一条即像联系行：

- `clean.includes('@')`，含 `@`
- `/\d{7,}/.test(normalize(clean))`，连续至少 7 位数字
- `clean.replace(/[\s\p{P}\p{S}]/gu, '').length < 6`，去掉空白和标点符号后，有意义字符短于 6

第 41–42 行的注释说的就是这三条。函数体不要改。

### 0.2 未见标题时交给判断的是脱敏后的 clean

`ingestResume` 在第 46 行。第 51 行 `let sawHeader = false`。第 56 行 `const nt = normalize(t)`。`normalize` 在第 15 行，只做 `t.normalize('NFKC')`，不去掉 `@`，也不去掉数字。

第 71 行 `const clean = stripPii(t)`。`stripPii` 在第 31 行：先做 NFKC，再把手机、邮箱、证件换成 `[已脱敏]`，再把拆开的至少 11 位数字串换成 `[已脱敏]`。

第 74 行，还没见过标题时：

`if (!sawHeader && looksLikeContactHeaderLine(clean)) return;`

这里把 `stripPii` 之后的 `clean` 交给判断。上面这几行里的 `@` 和电话数字已经换成 `[已脱敏]`，含 `@` 和连续至少 7 位数字两条都不再生效，只剩「有意义字符短于 6」还能挡住。第 75 行仍把 `clean` 推进 `experience` 和 `facts`。没挡住时，进 facts 的是脱敏文本。

按第 31 行和第 43 行的规则，这四行是：

| 原文 | 进入 facts 时的文本 | 有意义字符 | 对 clean 的判断 |
|---|---|---|---|
| `联系电话：13800138000` | `联系电话:[已脱敏]` | 7 | 不挡，进入 facts |
| `手机号码13800138000` | `手机号码[已脱敏]` | 7 | 不挡，进入 facts |
| `联系邮箱 zhangsan@example.com` | `联系邮箱 [已脱敏]` | 7 | 不挡，进入 facts |
| `电话:13800138000` | `电话:[已脱敏]` | 5 | 挡住，不进入 facts |

全角冒号经 NFKC 变成半角，所以第一条的文本是 `联系电话:[已脱敏]`，不是全角冒号。三条较长行的敏感段都是 `[已脱敏]`，标签还在，有意义字符是 7，不短于 6，于是进入 facts。短标签 `电话:13800138000` 有意义字符是 5，碰巧被滤掉。

### 0.3 没有 @、也没有连续 7 位数字的经历必须留下

`5年后端经验,主导高并发网关改造` 没有 `@`，数字只有单独的 `5`，不是连续 7 位，有意义字符是 15。对 `clean` 和对 `nt` 都不像联系行，必须留下。

`apps/worker/test/resume-grounding.proof.ts` 第 35 行 `FACT_SHORT_EXP` 就是这句，第 40 行放进 `RESUME_RAW`，第 96–97 行断言它在 facts 里。这句不要删，断言也不要倒过来。

### 0.4 见过标题之后的行不要过滤

第 64–69 行：标题命中后，第 68 行把 `sawHeader` 设为 `true`，然后返回。第 73 行注释写明，只在未见任何标题前过滤联系行。第 74 行的条件是 `!sawHeader`。已经见过标题之后的行不要过滤。不要改第 51 行的初值，也不要改第 68 行的赋值。

现有夹具里，短标签在第 38 行，就是 `电话:13800138000`。它碰巧被滤掉，盖不住上面三条较长行。第 100–101 行只断言 facts 不含 `张三`、不含 `13800138000`、不含 `@`。较长行漏进 facts 时文本里已经没有数字和 `@`，这条断言仍然通过。

## §1 修法

只许改一处。`packages/domain/src/index.ts` 第 74 行把 `looksLikeContactHeaderLine(clean)` 改成 `looksLikeContactHeaderLine(nt)`。

`nt` 是第 56 行的 `normalize(t)`。`normalize` 只做 NFKC，不去掉 `@` 和数字。三条较长联系行在 `nt` 上会因连续数字或 `@` 被挡住，不再进入 facts。`5年后端经验,主导高并发网关改造` 在 `nt` 上仍然不像联系行，继续进入 facts。第 75 行继续推进 `clean`，存进去的仍是脱敏文本。不改第 43 行的函数体，不改参数名。

证明只扩展 `apps/worker/test/resume-grounding.proof.ts` 已有夹具，不要新文件。在第 36 行起的 `RESUME_RAW` 里、第 41 行 `教育经历` 之前，加一条较长联系行 `联系电话：13800138000`。断言它不在 facts 里：没有任何一条 fact 包含 `联系电话`。漏网时的文本是 `联系电话:[已脱敏]`，不能只再查一次 `13800138000` 或 `@`。第 38 行的短标签留下。第 35 行那句经历仍须在 facts 里。

不要改 `packages/db/test/resume-ingest.proof.ts`。

## §1.3 否决

- 不改第 37–40 行的标题正则。
- 不改第 31 行 `stripPii`，不改第 15 行 `normalize`。
- 不改已应用的迁移。
- 不把拒绝放进别的包。判断仍只改 `packages/domain/src/index.ts` 第 74 行这一处调用。不在 worker、db 或其他包里另写过滤。
- 不改 `sawHeader`。见过标题之后的行仍不过滤。
- 不新建证明文件。不改 `packages/db/test/resume-ingest.proof.ts`。

## §2 门

`packages/domain/package.json` 第 9–41 行没有单独的 ingest 命令。`packages/domain/test` 里也没有调用 `ingestResume` 的证明。不使用 `pnpm -C packages/domain exec tsx test`。

执行时跑这四条：

1. `pnpm -C apps/worker prove:resume-grounding`。`apps/worker/package.json` 第 78 行的脚本是 `tsx test/resume-grounding.proof.ts`，能跑到这份已有摄取夹具。
2. `node scripts/ai-docs/check-docs.mjs`
3. `pnpm turbo typecheck --force`
4. `pnpm turbo lint`

lint 必须 0 errors。警告上限是 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601。对应根 `package.json` 第 8 行、`apps/api/package.json` 第 7 行、`packages/domain/package.json` 第 10 行、`packages/ai-runtime/package.json` 第 14 行、`apps/worker/package.json` 第 7 行、`packages/db/package.json` 第 11 行、`apps/web/package.json` 第 7 行的 `--max-warnings`。低于上限可以通过。不许改这些上限。

## §8
draft:awaiting_pre_exec_dual

以上三处相同。本步只留下这一份说明。

draft:awaiting_pre_exec_dual
