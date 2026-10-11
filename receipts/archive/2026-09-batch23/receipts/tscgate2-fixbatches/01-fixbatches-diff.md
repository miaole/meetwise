# TSCGATE-2 修复四批 — 全量 diff 原档（git diff @e237e82e · 6 改 2 增 · 14+/6-）

## 1. git diff（6 个 tracked 改动·未过滤未截断）

```diff
diff --git a/e2e/helpers/interview.ts b/e2e/helpers/interview.ts
index c7001612..4aee4a29 100644
--- a/e2e/helpers/interview.ts
+++ b/e2e/helpers/interview.ts
@@ -170,13 +170,17 @@ function concludeMarked(event: Pick<SseEvent, 'kind' | 'payload'>): boolean {
  * the reason is a domain enum. Terminal SSE reasons (assessment_unavailable,
  * report_unavailable, …) and progress.route are not conclude reasons.
  */
+/** Type guard narrowing a server-payload string to the domain ConcludeReason enum. */
+const isConcludeReason = (value: string): value is ConcludeReason =>
+  (CONCLUDE_REASONS as readonly string[]).includes(value);
+
 export function attributableConclude(event: Pick<SseEvent, 'kind' | 'payload'>): AttributableConclude | null {
   if (!concludeMarked(event)) return null;
   const reason = event.payload?.concludeReason ?? event.payload?.reason;
   if (typeof reason !== 'string' || reason.length === 0) {
     throw new Error('e2e_conclude_attribution_missing');
   }
-  if (!(CONCLUDE_REASONS as readonly string[]).includes(reason)) {
+  if (!isConcludeReason(reason)) {
     throw new Error('e2e_conclude_attribution_forged');
   }
   return { kind: 'conclude', reason, source: 'server_payload' };
diff --git a/e2e/helpers/sse.ts b/e2e/helpers/sse.ts
index 42d9b9ca..f41719a2 100644
--- a/e2e/helpers/sse.ts
+++ b/e2e/helpers/sse.ts
@@ -7,9 +7,9 @@ export function parseSseBuffer(buf: string): SseEvent[] {
   for (const match of buf.matchAll(/^id: (\d+)\nevent: (\w+)\ndata: (.*)$/gm)) {
     out.push({
       seq: Number(match[1]),
-      kind: match[2],
+      kind: match[2]!,
       payload: (() => {
-        try { return JSON.parse(match[3]); } catch { return {}; }
+        try { return JSON.parse(match[3]!); } catch { return {}; }
       })(),
     });
   }
diff --git a/e2e/ocr-fixture.ts b/e2e/ocr-fixture.ts
index 760750cf..779743e4 100644
--- a/e2e/ocr-fixture.ts
+++ b/e2e/ocr-fixture.ts
@@ -72,8 +72,8 @@ function writeLine(image: Buffer, text: string, x: number, y: number, scale: num
   for (const char of text) {
     const glyph = FONT[char];
     if (!glyph) throw new Error(`unsupported_ocr_fixture_glyph:${char}`);
-    for (let row = 0; row < glyph.length; row++) for (let column = 0; column < glyph[row].length; column++) {
-      if (glyph[row][column] !== '1') continue;
+    for (let row = 0; row < glyph.length; row++) for (let column = 0; column < glyph[row]!.length; column++) {
+      if (glyph[row]![column] !== '1') continue;
       for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) {
         const offset = ((y + row * scale + dy) * WIDTH + x + column * scale + dx) * 3;
         image[offset] = 31; image[offset + 1] = 41; image[offset + 2] = 55;
diff --git a/e2e/performance.e2e.ts b/e2e/performance.e2e.ts
index e2672fab..425f199c 100644
--- a/e2e/performance.e2e.ts
+++ b/e2e/performance.e2e.ts
@@ -20,7 +20,8 @@ type Sample = { status: number; ms: number };
 const percentile = (values: number[], p: number) => {
   const sorted = [...values].sort((a, b) => a - b);
   if (!sorted.length) return NaN;
-  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
+  // Empty guard above: the min()-clamped index is always in bounds.
+  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)]!;
 };
 
 async function concurrent(total: number, concurrency: number, task: (index: number) => Promise<number>): Promise<{ samples: Sample[]; wallMs: number }> {
diff --git a/package.json b/package.json
index 5cbf840e..4cd3936b 100644
--- a/package.json
+++ b/package.json
@@ -17,6 +17,8 @@
     "e2e-platform:loop": "node scripts/e2e-platform/review-loop.mjs",
     "e2e-static-guards:check": "node scripts/e2e-static-guards.mjs",
     "e2e-static-guards:prove": "node scripts/e2e-static-guards.proof.mjs",
+    "typecheck:e2e": "tsc -p tsconfig.e2e.json",
+    "typecheck": "pnpm typecheck:e2e",
     "e2e-case-inventory:prove": "node scripts/e2e-case-inventory.proof.mjs",
     "regression": "node scripts/run-post-change-regression.mjs",
     "regression:core": "node scripts/run-post-change-regression.mjs --core",
diff --git a/turbo.json b/turbo.json
index c08cbb87..cb9d4740 100644
--- a/turbo.json
+++ b/turbo.json
@@ -1,6 +1,7 @@
 {
   "$schema": "https://turbo.build/schema.json",
   "tasks": {
+    "//#typecheck": {},
     "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
     "db:generate": { "outputs": ["src/generated/**"], "cache": true },
     "typecheck": { "dependsOn": ["^build"] },
```

## 2. 新增文件全文

### 2.1 `e2e/helpers/undici-types.d.ts`（新增·B2 类型环境）

```ts
/**
 * Ambient undici-types surface for the e2e tsc gate (TSCGATE-2 batch B2).
 *
 * undici-types@8.3.0 lives only under .pnpm (no top-level hoist), so the
 * `import('undici-types')` references inside @types/node stay unresolved and
 * the global fetch-family type names never reach this program (`lib:
 * ["ES2022"]` carries no DOM lib). These ambient declarations hand-shape
 * exactly the two names the e2e suite needs, mirroring the real undici-types
 * union members. Deliberately no `any`: a permissive escape would compile
 * green while silently disabling checks (receipt-pinned stance).
 */

/** Verbatim mirror of undici-types `RequestInfo` (keeps proof.ts fetch
 *  wrapper parameter contravariance intact). */
type RequestInfo = string | URL | Request;

/** Union mirror of undici-types `HeadersInit` — no `any` shaping. The record
 *  value is widened to `string | readonly string[] | undefined` for the e2e
 *  helpers' header-record building: the real undici `HeaderRecord` maps
 *  KnownHeaderValues to optional `string | undefined` values, so the plain
 *  record member only bridges it with `undefined` admitted (test surface,
 *  non-claim — harness 适度放宽 license). */
type HeadersInit = Headers | [string, string][] | Record<string, string | readonly string[] | undefined>;
```

### 2.2 `tsconfig.e2e.json`（新增·门禁正式 tsconfig）

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": false,
    "noEmit": true
  },
  "include": ["e2e/**/*"]
}
```

## 3. 接线 diff 要点（package.json / turbo.json 全文见上 diff）

- root package.json scripts 增 2 行：`"typecheck:e2e": "tsc -p tsconfig.e2e.json"`（任务书钉值）+ `"typecheck": "pnpm typecheck:e2e"`（turbo 2.10 根任务按名锚点·attempt-A2·见 03）；
- turbo.json tasks 增 1 行：`"//#typecheck": {}`（rev4 钉值 token·空声明最小面）。

## 4. 零产品码亲证

- `git diff --name-only | grep -E '^(apps|packages)/'` → **空输出·grep EXIT=1**（apps/ packages/ 零行 diff）；
- `git status --porcelain`：仅 `e2e/helpers/{interview,sse}.ts`、`e2e/{ocr-fixture,performance.e2e}.ts`、`package.json`、`turbo.json`（M）+ `e2e/helpers/undici-types.d.ts`、`tsconfig.e2e.json`（??）；
- diff 统计：`6 files changed, 14 insertions(+), 6 deletions(-)` + 2 新增文件。
