# Review — HA multi-instance track（第二域 mw-rag-route）

**专家**：mw-rag-route（第二审；主审 mw-e2e-ha 并行）  
**日期**：2026-09-10（PT）  
**结论**：**pass**（工具轨诚实钉；**阶 C/D 未绿**；**禁止升阶 HA**）  
**releaseEvidence=false** · **Not HA** · **stub ≠ 生产** · **shared = GAP**

## 对照

- `harness/ha-track.multi-instance.md`
- `scripts/ha/bring-up-dual.mjs` · `dual-livez-stub.mjs` · `fault-inject.stub.mjs` · `probe.multi.mjs` · `ha-track.multi.proof.mjs`
- 前序骨架审：`2026-09-10-ha-track-skeleton-mw-rag-route.md`（本切片超骨架，仍 Not HA）

## 焦点核实

| 焦点 | 结果 |
|------|------|
| stub dual `/livez` ≠ 真 Nest 双实例 / 生产 HA | **成立**。`STUB_LIVEZ_ONLY`；id=`api-a-stub`/`api-b-stub`；harness 字面禁升阶 |
| shared-state（C3）仍 GAP | **成立**。fault-inject 写 `shared-state.GAP.json`；probe `sharedOk=false` / `sharedGapMarker=true` |
| `--require-evidence` fail-closed EXIT=1 | **成立**（见下表；含 stub+fault 路径仍因 shared 不全而 1） |
| 默认 bring-up 诚实 PREREQ_GAP | **成立**。无 backend 镜像 + 未授权 → `result: PREREQ_GAP` · EXIT=0 |
| 本绿 ≠ HA / releaseEvidence=true | **成立**。所有收据 `haStatus: NOT_HA` · `releaseEvidence: false` |

## CMD / EXIT（本域复跑）

| CMD | EXIT |
|-----|------|
| `node scripts/ha/ha-track.multi.proof.mjs`（≡ `pnpm ha-track:multi:prove`） | **0** |
| `pnpm ha:dual:bring-up`（默认评估） | **0**（`PREREQ_GAP`） |
| `node scripts/ha/probe.multi.mjs --require-evidence` | **1** |
| `node scripts/ha/probe.multi.mjs --with-bring-up-stub --with-fault-inject --require-evidence` | **1**（dual+kill 可有；**shared 仍 GAP** → fail-closed） |

## 阶梯诚实结论

- **C2**：stub 路径可跑（机械探针）· **≠** 真 API  
- **C3**：shared **GAP**  
- **C4**：stub fault 仅证探针机械 · **≠** 生产 failover  
- **D**：未开（无 CI / 无齐套真收据）  
→ **保持 NOT_HA**；**禁止勾 releaseEvidence=true**；**禁止叙事生产 HA**。

## 非宣称

禁止：升阶 HA、双 Nest 已证、shared 已证、failover 已证、`releaseEvidence=true`、本切片 EXIT=0 = HA green。
