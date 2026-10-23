executed:awaiting_post_prove_dual

# 同文再传不认已隔离简历

本说明只记录改法。本步不改产品代码，不改证明，不改已有 SQL。

## §0 锚

行号是在分支 `line/resume-reread-status-draft`、提交 `e722550dcce62d195e0bf2ead0737fcfee1e62c9` 上打开文件看到的。下面是打开时的原文，不是估计。

### 0.1 冲突目标是部分唯一索引

`packages/db/src/resume/resume.ts` 的 `createResumeWithBlob` 从第 59 行到第 81 行。插入在第 63–67 行：

```
    `INSERT INTO resume(owner_user_id, content_sha, source_kind) VALUES ($1,$2,$3)
     ON CONFLICT (owner_user_id, content_sha)
       WHERE content_sha IS NOT NULL AND status IN ('uploaded','ingesting','ingested','failed')
       DO NOTHING RETURNING id`, [owner, digest, sourceKind]);
```

冲突目标就是部分唯一索引 `uq_resume_content_active`。索引定义有两处，谓词相同，本步都不改，也不新开迁移：

- `packages/db/sql/03_resume.sql` 第 20–23 行：`CREATE UNIQUE INDEX uq_resume_content_active` / `ON resume(owner_user_id, content_sha)` / `WHERE content_sha IS NOT NULL` / `AND status IN ('uploaded','ingesting','ingested','failed');`
- 已应用的 `packages/db/migrations/0060_resume_erasure_tombstone_foundation.sql` 第 22–25 行，是同一条索引的同一谓词。

`packages/db/sql/03_resume.sql` 第 12 行把 `status` 的缺省写成 `uploaded`，所以第一次插入落在这个谓词里面。第 13 行注明 `content_sha` 在擦除墓碑上清空，活跃行才参与去重。

### 0.2 冲突后的回读没有状态谓词，也没有排序

同一函数第 68–74 行：

```
  if (ins.rowCount === 0) {
    const ex = await c.query('SELECT id, status FROM resume WHERE owner_user_id=$1 AND content_sha=$2', [owner, digest]);
    if (ex.rows[0].status === 'failed') {                                  // 上次失败 → re-upload 视为重试,re-arm failed→uploaded（审计 N2：否则永久卡死、改字节才能重传）
      await c.query("UPDATE resume SET status='uploaded', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='failed'", [ex.rows[0].id, owner]);
      return { resumeId: ex.rows[0].id, dedup: false };
    }
    return { resumeId: ex.rows[0].id, dedup: true };                       // 同人同原文且未失败：不重复存,不二次摄取
```

第 69 行只按 `owner_user_id` 与 `content_sha` 回读。没有状态谓词，没有 `ORDER BY`。第 70 行只有 `rows[0].status === 'failed'` 才重新武装；否则第 74 行返回 `rows[0].id`，且 `dedup: true`。没有行时这里也没有按本文件风格主动抛错，而是直接读 `rows[0].status`。

### 0.3 擦除必须清空指纹，隔离仍保留指纹

`packages/db/migrations/0060_resume_erasure_tombstone_foundation.sql` 第 41–44 行：

```
    ALTER TABLE resume
      ADD CONSTRAINT resume_erased_content_hmac_chk
      CHECK ((status='erased') = (content_sha IS NULL));
```

`erased` 必须 `content_sha IS NULL`。因此按指纹回读选不中已擦除行。

`erasure_fenced` 仍保留 `content_sha`。软删走 `packages/db/src/resume-privacy.ts` 的 `beginResumeSoftDelete`（第 19–32 行）。第 22 行调用 `privacy_begin_resume_soft_delete($1,$2)`。不要改这个函数，也不要清空指纹。

`packages/db/migrations/0152_resume_soft_delete_fence.sql` 第 92–99 行把状态改成 `erasure_fenced`，并写下 `erasure_requested_at` 与 `privacy_epoch+1`，SET 列表里没有 `content_sha`。同文件第 169–170 行对所有路径拒绝改指纹：`IF NEW.content_sha IS DISTINCT FROM OLD.content_sha THEN` 抛 `resume_content_hmac_immutable`。

应用角色直接 `UPDATE status='erasure_fenced'` 会被拒绝。同文件第 155–156 行只有 `current_user = 'privacy_api_owner'` 且 `session_user <> 'privacy_api_owner'` 才放开；第 172–174 行在该条件不成立时，只要旧状态或新状态属于 `erasure_fenced` / `erased`，就抛 `resume_privacy_lifecycle_not_available`。`packages/db/src/principal.ts` 第 999 行把 `asPrincipal` 设成 `app_role`，所以这条直接更新不走受审路径。

### 0.4 第三次上传会在冲突后读错行

同文第一次上传得到活跃行（缺省 `uploaded`，落在部分索引里）。软删后指纹还在，但部分索引不包括已隔离行，同文第二次上传插不进这条已隔离行，会再插入一条新的活跃行。第三次上传命中活跃行的冲突目标，`DO NOTHING` 后走第 69 行回读。这条回读没有状态谓词，也没有 `ORDER BY`，不保证行序，更早的 `erasure_fenced` 可能成为 `rows[0]`。第 74 行于是把已隔离的 id 当成去重结果返回，并且 `dedup: true`。

## §1 修法

只改 `createResumeWithBlob` 里这次回读（现在的第 69 行，以及第 70–74 行对 `ex.rows[0]` 的使用）。不改第 63–67 行的 INSERT，不改冲突目标。

回读在现有 `owner_user_id=$1 AND content_sha=$2` 上加上与部分索引相同的状态谓词：

```
SELECT id, status FROM resume
 WHERE owner_user_id=$1 AND content_sha=$2
   AND status IN ('uploaded','ingesting','ingested','failed')
```

参数仍是 `[owner, digest]`。部分索引保证同一 owner、同一指纹下这样的行至多一条，所以不要加 `ORDER BY`，也不要靠堆序挑行。

过滤后没有行时，禁止再发一条不带状态谓词的查询，禁止退回无过滤的 `rows[0]`。必须失败关闭，不得返回 `erasure_fenced` 或 `erased` 的 id。错误沿本文件已有的 `throw new Error('…')` 风格，与第 148 行 `throw new Error('resume_blob_not_found_or_forbidden')` 相同：抛 `throw new Error('resume_active_dedup_row_missing')`。不要发明 HTTP 状态码，也不要套用第 179 行那个解密路径的错误文案。

`failed` 重新武装和「未失败则 `dedup: true`」两条现有分支保留，只是作用在过滤后的那一行：

- `status === 'failed'`：仍执行第 71 行那条 `UPDATE`（`status='uploaded'`、`version=version+1`，并且 `WHERE` 里仍要求 `status='failed'`），返回 `{ resumeId, dedup: false }`。id 用过滤后那一行的 id。
- 否则：返回 `{ resumeId: 过滤后那一行的 id, dedup: true }`。

不要把已隔离行重新武装成 `uploaded`。不要改这个函数以外的存储函数。

## §1.3 否决

- 不改已应用的 SQL。`packages/db/sql/03_resume.sql` 与 `packages/db/migrations/0060_resume_erasure_tombstone_foundation.sql` 都不改。
- 不新迁移。
- 不清 `content_sha`。
- 不改 `beginResumeSoftDelete`，也不改 `privacy_begin_resume_soft_delete`。
- 不把已隔离行重新武装成 `uploaded`。
- 不新开证明文件，不新增 npm script。

## §2 门

执行时只扩展已有 `packages/db/test/resume-ingest.proof.ts`。第 7–10 行的导入仍从 `../src/index.ts` 进来，只在这个列表里加上 `beginResumeSoftDelete`（`packages/db/src/index.ts` 第 122 行已经导出它）。不要新开导入路径。

原有断言保持。第 38–124 行现有段落的期望都不改，包括第 72–75 行 userA 的同文去重（再上传命中、且该 owner 只有 1 条），以及第 111–124 行 userF 的 `failed` 重新武装。新场景用另一个 owner、另一段原文，不要复用 `RAW`、`FAIL_RAW`、`userA`、`userB`、`userF`。新段落放在第 126 行汇总输出之前，让原有断言先按原样跑完。

合法隔离只调用 `beginResumeSoftDelete`。调用放在这个 owner 的 `asPrincipal` 里：`packages/db/src/principal.ts` 第 999–1000 行先 `SET LOCAL ROLE app_role`，再把 `app.principal_user` 设成该 user。`0152` 第 62–65 行要求这个值等于 `p_owner`，否则抛 `resume_soft_delete_forbidden`。不要用会被拒绝的直接 `UPDATE status='erasure_fenced'`。

新断言按这个顺序，中间不插入会改掉这四步含义的别的上传：

1. 上传。得到 id A，`dedup` 为 false。
2. 隔离之后，A 的 `content_sha` 仍不是 NULL，状态是 `erasure_fenced`。
3. 同文再上传得到另一个 id B，且 `dedup` 为 false。
4. 第三次同文上传 `dedup` 为 true，且返回的 id 是 B，不是 A。

`scripts/run-e2e-isolated.mjs` 第 1460–1466 行的 `resume:prove:raw` 数组，是第 3306–3317 行交给收据的 `sourcePaths`。亲读这段，它只给列出的路径做摘要，并不扫描 import。现有证明已经从 `../src/index.ts` 导入，而 `index.ts` 并不在这个数组里。因此现在不要求为这次扩展改该数组。若执行时隔离运行器确实要求被引用文件都在这份名单里，只把已经跟踪的下面两行补进这个现有数组，不要新开目标，不要改别的目标，也不要额外加入 `index.ts`：

- `packages/db/src/resume-privacy.ts`
- `packages/db/migrations/0152_resume_soft_delete_fence.sql`

这两条在本提交上已由 `git ls-files` 跟踪。证明必须走 `pnpm resume:prove`。根 `package.json` 第 221 行是 `node scripts/run-e2e-isolated.mjs resume:prove:raw`；运行器第 2444–2445 行把它派到 `pnpm -C packages/db resume`；`packages/db/package.json` 第 21 行才是 `tsx test/resume-ingest.proof.ts`。这是隔离库上的入口。禁止把证明指向 `127.0.0.1:54329`，禁止设置 `DATABASE_URL` 后直接跑 `tsx`。`packages/db/src/isolated-test-target.ts` 第 70–71 行：`E2E_ISOLATED !== '1'` 时抛 `destructive_proof_requires_e2e_isolated`，设置了 `DATABASE_URL` 时抛 `destructive_proof_database_url_forbidden`。那种跑法不算通过。

另外三道：

- `node scripts/ai-docs/check-docs.mjs`
- `pnpm turbo typecheck --force`
- `pnpm turbo lint`

`turbo.json` 第 8 行有 `typecheck`，第 10 行有 `lint`。`pnpm turbo lint` 必须 0 errors。警告上限恰为这些现有脚本，不得提高：root 5242（根 `package.json` 第 8 行）、api 1423（`apps/api/package.json` 第 7 行）、domain 115（`packages/domain/package.json` 第 10 行）、ai-runtime 628（`packages/ai-runtime/package.json` 第 14 行）、worker 959（`apps/worker/package.json` 第 7 行）、db 1042（`packages/db/package.json` 第 11 行）、web 601（`apps/web/package.json` 第 7 行）、qdrant 27（`packages/qdrant-store/package.json` 第 11 行）、ai-graphs 47（`packages/ai-graphs/package.json` 第 10 行）、contracts 265（`packages/contracts/package.json` 第 12 行）。低于上限可以通过。未点名的包维持各自现有 lint 脚本，不得放宽。

不跑出站清单。不调用模型。本说明是这一步唯一新增的文件。

## §8

executed:awaiting_post_prove_dual

executed:awaiting_post_prove_dual

## §9-EXEC

改了这些文件：

- `packages/db/src/resume/resume.ts`：`createResumeWithBlob` 的回读加上与部分唯一索引相同的状态谓词；过滤后没有行则抛 `resume_active_dedup_row_missing`，不再返回已隔离行的 id。
- `packages/db/test/resume-ingest.proof.ts`：原有断言未改；在汇总输出前为另一个 owner、另一段原文增加隔离后再传场景。
- `ai-docs/delivery/harness/resume-reread-status-REQUEST.md`：三处状态同为 `executed:awaiting_post_prove_dual`，并追加本节。

`pnpm resume:prove` 退出码 0。
`node scripts/ai-docs/check-docs.mjs` 退出码 0。
`pnpm turbo typecheck` 与 `pnpm turbo lint` 未跑，留到事后复验。
