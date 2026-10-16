# TSC-GATE-1 错样抽核（每类 ≥3 例亲读）

判据（REQUEST §1.2）：真断链 vs 严格模式噪声，distinction 决定门禁形态。EXEC 亲读源码逐例定性如下；引用行号为 base `b24fcc5a` 工作树实测。

## A. strict 无关类（Run A∩B·4 例全读）

### A1. full.e2e.ts:209 TS2304 `emitE2EFailure` —— **真断链（仓库内符号·已知锚 ✓）**

亲读：`:14` `import { createE2EReviewLedger, emitClassifiedE2EFailure } from './helpers/failure.ts';`——**未导入** `emitE2EFailure`；`:209` `emitE2EFailure({ class: 'worker', code: 'interview_terminal_timeout' });`（`if (!terminal)` 分支内，终态超时上报路径）。`emitE2EFailure` 在 helpers/failure.ts:21 确有 re-export（源 failure-class.mjs）——纯 import 缺失。运行时后果：该分支执行即 ReferenceError，被 `:421` 外层 catch 归 `client_uncaught`——即 backlog `BUG-E2E-FAILUNIMPORT`（gap-bug-backlog.md:868 预设行）原样形状。
史实注（如实登记·不裁决）：E2EFAIL-1 修复 commit `83a6ec8b`（":14 import + failure-helper import static guard w/ 2 permanent red TCs"）经 `git merge-base --is-ancestor` 亲证**非 HEAD 祖先**，仅存于 `line/g7-driver-assert`（本地+origin）——本 base 上断链仍在，与协调方「已知真断链 :209 在盘不动」预声明一致；并轨顺序归协调方。
盘点处置：不动（Ban）。Run A 命中 TS2304 恰在此点 = 判读器自校准锚命中。

### A2. proof.ts:54 TS2304 `HeadersInit` —— 类型环境缺口（非仓库断链）

亲读：`e2e-helpers.proof.ts:54` `function headerRecord(headers?: HeadersInit): Record<string, string> {`；:55 `headers instanceof Headers`、:62 `new Response(...)`、:70 `RequestInit` **均无错**（@types/node 全局面已含 fetch/Response/Headers/RequestInit），独 `HeadersInit`/`RequestInfo` 二名不在全局。根因面：base.json `lib: ["ES2022"]`（无 DOM）+ `types: ["node"]` 的 undici-types 全局增强未覆盖此二别名。修复方向（归修复刀）：局部 `import type { HeadersInit, RequestInfo } from 'undici-types'`（@types/node 传递依赖在树）或 ambient d.ts——**非改产品码**。

### A3. proof.ts:70 TS2552 `RequestInfo` —— 同 A2 族

亲读：`globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {`——TS2552 带建议「Did you mean 'RequestInit'?」恰证 `RequestInit` 可解析而 `RequestInfo` 缺席，同 undici-types 全局覆盖缺口。

### A4. interview.ts:182 TS2322 —— **真型不配（strict 无关·非噪声）**

亲读：`attributableConclude` :180-182：`if (!(CONCLUDE_REASONS as readonly string[]).includes(reason)) { throw ... } return { kind: 'conclude', reason, ... }`——`includes` 经 `as readonly string[]` 后**不产生收窄**，`reason: string` 赋给返回类型之 `reason: "budget_exhausted" | "all_resolved"`（CONCLUDE_REASONS 字面量族）。运行时守卫在（:180 forged 检查），类型面断链——修复 = `find`/type-predicate 替代 includes-cast，一行级。

## B. strict 面噪声类（Run A∖B·7 例读 5）

### B1. sse.ts:10 TS2322 —— 噪声（noUncheckedIndexedAccess）

亲读：`kind: match[2]`——`buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)` 的 `RegExpMatchArray` 索引访问在 noUncheckedIndexedAccess 下为 `string | undefined`；正则三捕获组对任一全匹配恒存在，运行时安全。同函数 :9 `Number(match[1])` 无错（Number 形参 any）。

### B2. sse.ts:12 TS2345 —— 噪声（同 B1 族）

亲读：`JSON.parse(match[3])`——同捕获组索引面，JSON.parse 形参 `string`。

### B3. ocr-fixture.ts:75/:76 TS2532 ×2 —— 噪声（二维索引链）

亲读：:72 `const glyph = FONT[char];` :73 `if (!glyph) throw ...`（已守卫）；:74-76 `glyph.length` / `glyph[row].length` / `glyph[row][column]`——`glyph[row]`（number[] | undefined）二级索引未收窄。行界由循环 `row < glyph.length` 保证，运行时安全。

### B4. performance.e2e.ts:52-54 TS2532 ×3 —— 噪声（返回类型未收口）

亲读：:20-24 `const percentile = (values: number[], p: number) => { const sorted = [...values].sort(...); if (!sorted.length) return NaN; return sorted[Math.min(sorted.length - 1, ...)]; }`——返回 `number | undefined`（索引访问），:52-54 `.toFixed(1)` 三连调用点报 TS2532。空数组已 :22 NaN 分支。修复 = 收口返回类型（`?? NaN` 或显式 number）。

### B5. （族代表第 5 读）sse.ts:10/:12 与 ocr-fixture/performance 已覆盖全部 7 错中 5 错点位；余 2（ocr-fixture:76、performance:53/:54）与已读例同构同根，不另立定性。

## 定性汇总

| 类 | 数 | 点位 | 门禁含义 |
|----|----|------|----------|
| 真断链（仓库内符号） | 1 | full.e2e.ts:209 | 门禁必抓（E2EFAIL-1 先例：import 门+双常驻负例 TC） |
| 类型环境缺口（lib/types） | 2 | proof.ts:54/:70 | 修复刀决策面（undici-types import 或 ambient），非产品码 |
| 真型不配 | 1 | interview.ts:182 | 小修（predicate 化） |
| strict 噪声 | 7 | sse×2·ocr-fixture×2·performance×3 | 机械修（收窄/收口），修完即可 strict-on 门禁从绿挂起 |
