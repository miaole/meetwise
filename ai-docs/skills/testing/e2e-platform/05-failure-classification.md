# 05 · 失败分类

不要把失败写成一团“e2e failed”。先标 出处，再修。实现：`e2e/helpers/classify-failure.ts`（第一匹配；未知 4xx/5xx 落 `FAIL_API`，避免把缺口洗成 BLOCKED）。

| 种类 | 何时用 | 例子 |
| --- | --- | --- |
| `FAIL_API` | HTTP 边界或未识别的 4xx/5xx | 意外 500、契约字段缺失 |
| `FAIL_WORKER` | 图 / checkpoint / 队列消费 | begin 已 202 但无 SSE 终态且 worker 退出 |
| `FAIL_DB` | 迁移、Postgres 连不上、schema 摘要空 | 隔离容器未起来 |
| `FAIL_PROVIDER` | 真供应商超时、429、408 | TTS 暂态 429 耗尽重试 |
| `FAIL_CAPABILITY` | 组合根关闭、假服务开关、未走隔离入口 | `image_ocr_unavailable`、`fake_service_mode_forbidden` |
| `BLOCKED_DATA_OR_PERMISSION` | 鉴权、额度、RLS、重复 OCR | 401 / 403 / 402、`insufficient_entitlement` |
| `BLOCKED_LIVE_KEY` | 缺 `MODEL_API_KEY` | runner / `regression --live` 非零退出 |

## 怎么写结论

```text
kind: FAIL_PROVIDER
command: pnpm e2e:isolated
exit: 1
liveE2E: ran
releaseEvidence: false
```

缺 Key 用 `BLOCKED_LIVE_KEY` + `not_run`，不要改成 passed。

本仓库**没有**案例台账文件，也不要求 70 条检查点。分类是为了修对层，不是为了填一张空表。
