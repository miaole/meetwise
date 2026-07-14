/**
 * 共享题库灌库(决策 i):策展真题 → embed → **经策展治理入库**,而非直写 vector_chunk。
 *
 * 治理路径(每条种子):findSourceByHash/propose → qbank_source(kind,content_hash 去重)→ approve → promoteToPool
 *   → 写 vector_chunk(kind='qbank',系统 owner)。这样该 chunk 的 ref_id 进 approved 策展源之下的 qbank_pool_entry
 *   (0016 可见 lane(a))→ **撤销(reject)源即时下架其真实 chunk**。此前灌库直写 vector_chunk(落 0016 lane(b) 免治理),
 *   源审核/撤销只管未来内容、撤不掉现有题库 —— 本改动把线上真实题库接进治理,使其**可被撤销下架**。
 *
 * 键对齐(修专家审计致命项):可见性 JOIN 与 pool 唯一键都是 **ref_id**(0016 视图 + 0013 UNIQUE(ref_id)),故
 *   pool 条目 PK 也**随 ref_id 派生**('qp-'+sha(refId)),与 ON CONFLICT(ref_id) 仲裁对齐 —— 杜绝"PK 由 content_hash 派生、
 *   仲裁却按 ref_id"导致的 PK 冲突(23505)逃逸 ON CONFLICT → 整批中止(同题面不同 refId / 跨批复灌确定性触发)。
 *   source PK 仍随 content_hash(源身份=内容,同文本多 refId 共享一源);chunk id 仍随 content_hash(与其 UNIQUE(owner,kind,hash) 一致)。
 *
 * refId 内容不可变守卫:同一 refId 若已有**不同 content_hash** 的治理块,视为"改版"——DB 是 ref_id 键的 append-only 池,
 *   无法就地重指;静默 DO NOTHING 会把治理挂在旧源上(reject 打错源→下架失效)。故**抛错(fail-loud)**:改版须走新 refId + 撤销旧源。
 *
 * 治理未 provision 时(qbank_source/池表未建 **或** 系统灌库主体尚非 curator)→ 回落 0016 lane(b) 直灌(向后兼容,
 *   = 收紧前行为)。此时仅 takedown 治理未生效;跨租户投毒的**写门**(06_retrieval:kind='qbank' 仅 __system_qbank__ 可写)
 *   不受本改动影响,依旧封死。生产由迁移 0017 seed 系统主体为 curator → 恒走治理路径(fail-safe-to-legacy,非 fail-open 投毒)。
 *
 * 幂等/原子性:批内先按 refId 去重(同 refId 多次=输入错误,取最后一条,防自撞);**逐条独立事务**(asPrincipal 各自
 *   BEGIN/COMMIT)——灌库天生幂等,不需全批 all-or-nothing:一条竞态/冲突只跳过或失败该条,不拖垮整批;崩溃后重灌补齐
 *   (源 content_hash 去重 + pool ON CONFLICT(ref_id) + chunk ON CONFLICT(owner,kind,hash) 皆幂等)。已 reject 的源**不复活**
 *   (findSourceByHash 见 rejected→跳过);并发把源撤销时 reviewSource CAS 落败→重读→尊重下架跳过(不让池触发器炸该条)。
 * 隐私:原文不入向量库(只 ref_id+hash+向量);题面原文在业务表/题库源。返回真正入库(未跳过)的条数。
 */
import { asPrincipal, upsertVectorChunk, type DbPool } from '@meetwise/db';
import type { Embedder } from '@meetwise/ai-runtime';
import { createHash } from 'node:crypto';
import {
  proposeSource, reviewSource, promoteToPool, isApprovedSource, findSourceByHash, type QbankSourceKind,
} from './qbank-curation.ts';

export const QBANK_OWNER = '__system_qbank__';   // 系统灌库主体:qbank 向量唯一可写 principal + 治理路径下的 curator(迁移 0017 seed)

export interface QbankItem { refId: string; text: string; kind?: QbankSourceKind }

const hashOf = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 32);

export async function ingestQbank(pool: DbPool, items: QbankItem[], embedder: Embedder): Promise<number> {
  if (items.length === 0) return 0;
  // 批内按 refId 去重(后者覆盖):同一 refId 在一批出现多次是输入错误,避免同批自撞 pool/chunk 键。
  const uniq = [...new Map(items.map((it) => [it.refId, it])).values()];
  const vecs = await embedder.embed(uniq.map((i) => i.text));   // 事务外批量嵌入(事务短,不占行锁做网络 IO)

  // 治理是否已 provision:池表存在 且 本灌库主体(当前 principal)是 curator —— 两者由迁移 0013(表)+0017(curator seed)一并 provision。
  const governed = await asPrincipal(pool, QBANK_OWNER, async (c) => {
    const tbl = (await c.query(
      "SELECT to_regclass('qbank_pool_entry') IS NOT NULL AND to_regclass('qbank_curator') IS NOT NULL AS ok")).rows[0].ok as boolean;
    return tbl && ((await c.query('SELECT qbank_is_curator() AS ok')).rows[0].ok === true);
  });

  let n = 0;
  for (let i = 0; i < uniq.length; i++) {
    const { refId } = uniq[i];
    const hash = hashOf(uniq[i].text);
    const embedding = vecs[i];
    // 逐条独立事务:爆炸半径=单条;幂等故可续跑。
    const wrote = await asPrincipal(pool, QBANK_OWNER, async (c) => {
      if (governed) {
        const found = await findSourceByHash(c, hash);
        if (found?.status === 'rejected') return false;              // 尊重下架:重灌不复活被撤销的种子
        // refId 内容不可变守卫:同 refId 已有不同 content_hash 的治理块 = 改版 → 拒绝静默 mis-key,fail-loud。
        const prior = await c.query(
          "SELECT content_hash FROM vector_chunk WHERE ref_id=$1 AND kind='qbank' AND owner_user_id=$2", [refId, QBANK_OWNER]);
        if (prior.rowCount && prior.rows[0].content_hash !== hash)
          throw new Error(`qbank refId ${refId} 内容已变(改版须用新 refId + 撤销旧源);拒绝静默重指治理`);
        const sourceId = found
          ? found.id                                                 // 复用既有活跃源(幂等,不重建)
          : (await proposeSource(c, {
              id: 'qs-' + hash, kind: uniq[i].kind ?? 'question_bank',
              uri: 'seed://' + refId, contentHash: hash, addedBy: QBANK_OWNER,
            })).sourceId;
        if (!(await isApprovedSource(c, sourceId))) {                // 半途 provision 恢复:pending → approve
          const ok = await reviewSource(c, sourceId, 'pending', 'approved', 'seed auto-approved (trusted system corpus)');
          if (!ok) {                                                 // CAS 落败(并发被撤销/改状态)→ 重读,尊重下架而非让池触发器炸该条
            const now = await findSourceByHash(c, hash);
            if (now?.status !== 'approved') return false;
          }
        }
        // pool 条目:PK 随 refId('qp-'+sha(refId))与 ON CONFLICT(ref_id) 仲裁对齐 → 无 PK 逃逸;该 chunk 从此受治理(lane a)。
        await promoteToPool(c, { id: 'qp-' + hashOf(refId), sourceId, refId, contentHash: hash });
      }
      await upsertVectorChunk(c, QBANK_OWNER, { id: 'qb-' + hash, kind: 'qbank', refId, contentHash: hash, embedding });
      return true;
    });
    if (wrote) n++;
  }
  return n;
}
