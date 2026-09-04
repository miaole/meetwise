# 01 · 目录合同

静态守卫：`scripts/e2e-platform/directory-contract.mjs`（经 `pnpm e2e-platform:prove`）。

## 布局

```text
e2e/
  full.e2e.ts              # 场景编排（业务路径）
  performance.e2e.ts       # 无模型 API 突发，不进 live 供应商门
  ocr-fixture.ts           # 合成 PNG，含手机号哨兵
  helpers/                 # 共享 harness，禁止依赖业务 UI
    assert.ts
    auth.ts
    commerce.ts
    resume.ts
    http.ts
    interview.ts
    sse.ts
    voice.ts
    classify-failure.ts
scripts/
  run-e2e.mjs              # HTTP 全链路 runner：隔离 + 真 Key + 禁假服务
  run-e2e-ui.mjs           # 浏览器 runner
  run-e2e-isolated.mjs     # 临时库包装器
  run-performance-e2e.mjs
  e2e-platform/            # fail-closed 静态守卫
```

## 必须成立

1. 上列 helpers 文件存在。缺一个 → 守卫失败，不要用场景文件内联复制来“先绿”。
2. `e2e/helpers/**` 不得出现 `apps/web`、`apps/api` 页面/controller 导入。HTTP 只走 `fetch` + `E2E_BASE`。
3. `scripts/run-e2e.mjs` 必须启动 `e2e/full.e2e.ts`，不能改成只跑 Playwright 却仍叫 HTTP E2E。
4. 场景文件可以调用 helpers；helpers 不得反向 import `full.e2e.ts`。
5. 新增业务包时先加场景断言，再视需要抽 helper。不要为尚未存在的域建空 `domains/` 树。

## 明确不做

- 不按其它仓库的业务包目录复制一棵空树。
- 不把 Playwright 多页签写成当前主 harness。
- 不在 helpers 里读真实 `.env` 并打印值。
