# 审查 — GAP-PRIV-AUTHZ-PROVE-FLAKE honesty · pre-exec · mw-e2e-ha

**角色**: `mw-e2e-ha`（证据诚实 · 对抗）· **不代签** `mw-privacy-int` · **不代签** `mw-rag-route`
**轮次**: Line A' PRE-EXEC · docs-only · 未跑 prove · 未起 Postgres · 未改产品代码 · 未发 live/model
**审的 REQUEST**: `031ad36` / `031ad36f7db01189e9754fd8e37a4b9fff5c6dd2`
**父提交**: `58c0031` / `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc`（`git rev-parse 031ad36^`）
**本轮 diff**（`git diff-tree --name-only -r 031ad36`）仅四份 docs：
- `ai-docs/delivery/harness/gap-priv-authz-prove-flake-honesty.md`
- `ai-docs/delivery/gap-priv-authz-prove-flake-honesty.slice.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-priv-authz-prove-flake-honesty-mw-e2e-ha.md`
- `ai-docs/delivery/reviews/REQUEST-2026-10-02-gap-priv-authz-prove-flake-honesty-mw-privacy-int.md`
**docs-only**: **yes**（无 `.ts` · 无 `checkpoint-principal.ts` · 无 `package.json`）

alone ≠ dual。本 PASS ≠ coding authorization ≠ nail ≠ covered ≠ HA ≠ `mw-privacy-int` 的签名。stub 仍是 PENDING；本文件不把 peer stub 写成已签。

---

## 1. 第一跑、记下 EXIT、禁止刷绿 — 通过

操作性文字在 harness，不在 29 行 stub。stub L6 把刀指向 `harness/gap-priv-authz-prove-flake-honesty.md`。`git show 031ad36:ai-docs/delivery/harness/gap-priv-authz-prove-flake-honesty.md`：

L27：

> A later, separately authorized knife may capture the **first-run** failure of `pnpm privacy-authorization:prove` and record that attempt's EXIT **without** looping until a later attempt is green. This open does not run that command, does not add a script, and does not edit `package.json`.

L31–L32：

> Ban retry-to-green. Ban claiming this gap fixed, closed, or root-caused.
> Ban treating cold_v2 / warm_v2 EXIT 0, or any later single green, as closing the row.

slice L11：`Ban retry-to-green. Ban claiming it fixed.` stub L23：`Ban retry-to-green. Ban claiming it fixed.`

这是第一跑、记下该次 EXIT、禁止循环到绿。没有 retry-until-pass / retry-to-green 的许可。commit message 同样写 without retry-to-green，且 Not coding authorization。本提交自己不跑命令。

L21 在「backlog 已记录」节，不是新的重试授权：

> Ban retry-to-green. Ban claim closed or root-caused. Record every attempt EXIT. Do not treat v2 20/20 or a later single green as closing this row.

抽查同 SHA `gap-bug-backlog.md` L68 仍是同一句（OPEN · Record every attempt EXIT · 不得把 v2 20/20 或后来单次绿当成关行）。L21 是引用，不是「可以一直跑到绿」。若把 L21 读成允许多次重试直到 EXIT 0，与 L27/L31 冲突，以 L27/L31 为准：只记第一跑。

「first-run failure」不得读成「第一跑若是 0 就丢掉再跑，直到看见失败」。L27 后半句是 record that attempt's EXIT。第一跑 EXIT 无论 0 或 1 都原样记下，然后停。

## 2. Flake 保持 OPEN — 通过

harness L8：`GAP-PRIV-AUTHZ-PROVE-FLAKE`（backlog row stays **OPEN** · status **mitigated/cause-unknown**）。L35：`Dual PASS later would still not be a close of the gap.` L46：`gap stays OPEN`。slice L11 同旨。stub L23：`stays **OPEN** · mitigated/cause-unknown`。

未把该 gap 写成 closed / fixed / covered。未把未来 EXIT 0 写成 flake 已修。backlog L68 / L232 在本 SHA 仍是 OPEN · mitigated/cause-unknown (not fixed)。本 diff 不改 backlog。

## 3. principal 与第二套 unsealed-NEG — 通过

harness L33：

> Ban edits to UC-052 product files, including `apps/worker/src/checkpoint-principal.ts`. UC-052 stays **partial**. Do not flip UC-052. Do not flip UC-018.

L10：`Ban product edits · Ban UC-052 product files`。L34：`Ban SSOT edits: matrix, backlog, checklist.`

本 diff 没有 `apps/worker/src/checkpoint-principal.ts`，也没有授权第二套 unsealed-NEG 实现。UC-052 保持 partial。不翻 UC-018。

## 4. 销钉

harness L4 / stub L3 与 stub 表 L14–L21，均未改：

- `haStatus=NOT_HA`
- `releaseEvidence=false`
- `claimProductionHA=false`
- `gR45Closed=true`
- `coveredCount=8`（harness L46 再次写成 **8**）
- `ms3EqualsR4Closed=false`
- PG-retained
- public DELETE stays **503**

无 HA 声称。coveredCount 未翻。

## 5. 抽查（非阻塞）

- `031ad36` 仍是当前 `origin/feat/mysql-schema-skeleton` 的祖先。父提交与 harness L6 所写 `58c003156c3fc69505ecb3daa2e3dad25f4a6dfc` 一致。
- 四文件全是 docs。privacy-int stub 仍 PENDING（其 L3）。本审查不代签。
- harness L16–L20 复述历史：`69de818` 第一跑 EXIT=1、第二跑 EXIT=0 保留；`71ec253`；cold#5 `ECONNREFUSED 127.0.0.1:33047`；warm#2 SQLSTATE 23505 `interview_pkey`；v2 `3d0c71e` 20/20 不是根。与 backlog L68 同文，未把这些绿写成关行。未打开日志重跑。
- stub 本身只有禁令摘要，第一跑句子在 harness L27。以 harness 为刀、stub 为入口，同一 commit，不把 stub 的简短当成缺口。

## 6. 条件

1. docs-only。本 PASS 不是编码授权，不是 nail，不是 covered，不是 HA。
2. 若日后另有授权去跑：只跑第一遍 `pnpm privacy-authorization:prove`，原样记录该次 EXIT（0 或 1 都算数），禁止 retry-to-green / retry-until-pass。绿的重试不关闭 flake。
3. `GAP-PRIV-AUTHZ-PROVE-FLAKE` 保持 OPEN · mitigated/cause-unknown。不得写成 fixed / closed / covered。不得把 cold_v2 / warm_v2 或以后单次 EXIT 0 当成根因或关行。
4. 不得改 `apps/worker/src/checkpoint-principal.ts`。不得授权第二套 unsealed-NEG。UC-052 保持 partial。不得翻 UC-018。不得改 matrix / backlog / checklist。
5. 销钉保持：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。
6. alone ≠ dual。本文件不是 `mw-privacy-int` 的签名。

## 7. 阻塞

无阻塞。

Verdict: PASS
