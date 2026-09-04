/**
 * @meetwise/db · resume 存储 ops — S2 摄取的**存储侧**（纯数据访问,不含摄取逻辑;摄取是 @meetwise/domain.ingestResume 纯函数,
 * 由调用方在更高层编排,保持 db 不依赖 domain）。隐私铁律落库：原文只进加密 blob,profile 永不含明文。
 */
import type { PoolClient as Client } from 'pg';
import { createHmac } from 'node:crypto';

export type ResumeStatus = 'uploaded' | 'ingesting' | 'ingested' | 'failed' | 'erasure_fenced' | 'erased';

const IS_PROD = process.env.NODE_ENV === 'production';
/** 必需密钥：prod 缺失即 fail-closed 抛错（杜绝静默用 dev 默认 = 加密形同虚设,审计 P0-2）。 */
function requireSecret(envName: string, devDefault: string): string {
  const v = process.env[envName];
  if (!v) { if (IS_PROD) throw new Error(`${envName} is required in production`); return devDefault; }
  if (v.length < 16) throw new Error(`${envName} too weak (min 16 chars)`);
  return v;
}
/** 简历原文对称加密 key（生产走 KMS/区域密钥）。 */
const RESUME_ENC_KEY = () => requireSecret('RESUME_ENC_KEY', 'dev_resume_key_change_in_prod__x');
/** content 指纹密钥：用 **HMAC** 而非裸 sha256——否则密文旁的明文 sha 成"确认/关联预言机",拿候选简历算 hash 即可证 owner 持有该文(审计 P0-1)。 */
const CONTENT_HMAC_SECRET = () => requireSecret('RESUME_HASH_SECRET', 'dev_resume_hash_secret__change_me');
/** 当前加密 key 版本（轮转用：blob 记 key_version,换钥时 decrypt-rewrite 可混版,审计 P1-7）。 */
export const RESUME_KEY_VERSION = Number(process.env.RESUME_KEY_VERSION ?? 1);
/** 按 blob 记录的 key_version 取解密钥：历史版本走 RESUME_ENC_KEY_V{n},否则用当前钥。
 *  否则一旦轮转 RESUME_ENC_KEY,所有旧 blob 全解不开（审计 N1：column 存了但 decrypt 不按版本选钥=形同虚设）。 */
function keyForVersion(v: number): string {
  return process.env[`RESUME_ENC_KEY_V${v}`] ?? RESUME_ENC_KEY();
}

export const contentDigest = (s: string) => createHmac('sha256', CONTENT_HMAC_SECRET()).update(s, 'utf8').digest('hex');

/** 摄取后用于落库的脱敏结构（与 domain.ResumeProfile 同形的安全子集）。 */
export interface IngestedProfile {
  experience: { text: string; line: number }[];
  skills: { text: string; line: number }[];
  facts: string[];
  pii: { field: string; masked: string; line: number }[];
  blocked: { line: number; reason: string; raw: string }[];
}

/** 上传：建 resume（幂等去重 by content_sha）+ 落**加密**原文 blob。返回是否去重命中。 */
export type ResumeSourceKind = 'text' | 'pdf' | 'image';

/** MODEL-OP-01 密封 OCR 快照（无原文/Key）。形状由迁移 0124 CHECK 与 domain parseSealedOcrProvenance 共同收口。 */
export type ResumeOcrBindingSnapshot = {
  operationId: string;
  registryVersion: string;
  inputKind: string;
  capability: string;
  endpointProfileId: string;
  region: string;
  modelOrRecipe: string;
  admissionKey: string;
  mediaDigest: string;
  wired: boolean;
};

export async function createResumeWithBlob(
  c: Client, owner: string, plaintext: string, sourceKind: ResumeSourceKind = 'text',
): Promise<{ resumeId: string; dedup: boolean }> {
  const digest = contentDigest(plaintext);                                  // HMAC,非裸 sha（防确认预言机）
  const ins = await c.query(
    `INSERT INTO resume(owner_user_id, content_sha, source_kind) VALUES ($1,$2,$3)
     ON CONFLICT (owner_user_id, content_sha)
       WHERE content_sha IS NOT NULL AND status IN ('uploaded','ingesting','ingested','failed')
       DO NOTHING RETURNING id`, [owner, digest, sourceKind]);
  if (ins.rowCount === 0) {
    const ex = await c.query('SELECT id, status FROM resume WHERE owner_user_id=$1 AND content_sha=$2', [owner, digest]);
    if (ex.rows[0].status === 'failed') {                                  // 上次失败 → re-upload 视为重试,re-arm failed→uploaded（审计 N2：否则永久卡死、改字节才能重传）
      await c.query("UPDATE resume SET status='uploaded', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='failed'", [ex.rows[0].id, owner]);
      return { resumeId: ex.rows[0].id, dedup: false };
    }
    return { resumeId: ex.rows[0].id, dedup: true };                       // 同人同原文且未失败：不重复存,不二次摄取
  }
  const resumeId = ins.rows[0].id;
  await c.query(
    'INSERT INTO resume_blob(resume_id, owner_user_id, ciphertext, key_version) VALUES ($1,$2, pgp_sym_encrypt($3,$4), $5)',
    [resumeId, owner, plaintext, RESUME_ENC_KEY(), RESUME_KEY_VERSION]);    // 原文落库即加密,明文不留
  return { resumeId, dedup: false };
}

/** 状态机 CAS：仅当前态==from 才迁移（审计转移、防并发双摄取）。 */
export async function transitionResume(
  c: Client, owner: string, resumeId: string, from: ResumeStatus, to: ResumeStatus,
): Promise<boolean> {
  const r = await c.query(
    'UPDATE resume SET status=$4, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status=$3',
    [resumeId, owner, from, to]);
  return r.rowCount === 1;
}

/** 持久化结构化 profile：只落脱敏文本 + PII **计数**摘要（连掩码值都不存）。幂等（ON CONFLICT DO NOTHING,重试安全）。 */
export async function persistResumeProfile(
  c: Client, owner: string, resumeId: string, p: IngestedProfile, status: 'ok' | 'needs_review' | 'rejected' = 'ok',
  ocrBinding: ResumeOcrBindingSnapshot | null = null,
): Promise<void> {
  const structured = { experience: p.experience, skills: p.skills, facts: p.facts }; // ingestResume 已 stripPii
  const piiSummary = p.pii.reduce<Record<string, number>>((m, x) => { m[x.field] = (m[x.field] ?? 0) + 1; return m; }, {});
  // Do not use `ON CONFLICT DO NOTHING` here. PostgreSQL may require the
  // conflict row to satisfy the table's SELECT policy; during `ingesting` our
  // deliberate active-read policy hides that profile. A plain INSERT is
  // therefore required, but a PostgreSQL unique violation aborts the *whole*
  // transaction even when JavaScript catches it. Contain just this retry race
  // in a savepoint so a duplicate profile stays idempotent without weakening
  // read RLS or materializing the existing profile to the caller.
  const savepoint = 'resume_profile_insert';
  await c.query(`SAVEPOINT ${savepoint}`);
  try {
    await c.query(
      `INSERT INTO resume_profile(resume_id, owner_user_id, structured, pii_summary, blocked_count, status, ocr_binding)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [resumeId, owner, JSON.stringify(structured), JSON.stringify(piiSummary), p.blocked.length, status, ocrBinding ? JSON.stringify(ocrBinding) : null],
    );
  } catch (error: any) {
    if (error?.code !== '23505') {
      await c.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
      throw error;
    }
    await c.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  }
  await c.query(`RELEASE SAVEPOINT ${savepoint}`);
}

/** 原子完成摄取：**同一事务**里落 profile + CAS ingesting→ingested。杜绝"profile 已落但状态卡 ingesting"的非原子缝（审计 P1-6）。 */
export async function completeIngestion(
  c: Client, owner: string, resumeId: string, p: IngestedProfile, status: 'ok' | 'needs_review' | 'rejected' = 'ok',
  ocrBinding: ResumeOcrBindingSnapshot | null = null,
): Promise<boolean> {
  await persistResumeProfile(c, owner, resumeId, p, status, ocrBinding);
  return transitionResume(c, owner, resumeId, 'ingesting', 'ingested');
}

/** 摄取失败：任意非终态 → failed（可观测、可重试,不留卡死的 ingesting）。 */
export async function failIngestion(c: Client, owner: string, resumeId: string): Promise<boolean> {
  const r = await c.query(
    "UPDATE resume SET status='failed', version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status IN ('uploaded','ingesting')",
    [resumeId, owner]);
  return r.rowCount === 1;
}

/** 解密取回原文（仅供需要原文的受控路径,如人工复核/再摄取;普通业务用 profile）。owner 谓词 + RLS 双保险（审计 P1-4）；按 key_version 选钥（审计 N1）。 */
export async function decryptResumeBlob(c: Client, owner: string, resumeId: string): Promise<string> {
  const meta = await c.query('SELECT key_version FROM resume_blob WHERE resume_id=$1 AND owner_user_id=$2', [resumeId, owner]);
  if (meta.rowCount === 0) throw new Error('resume_blob_not_found_or_forbidden');
  const key = keyForVersion(meta.rows[0].key_version);                     // 按该 blob 记录的版本取钥（轮转后旧 blob 仍可解）
  const r = await c.query(
    'SELECT pgp_sym_decrypt(ciphertext, $3) AS pt FROM resume_blob WHERE resume_id=$1 AND owner_user_id=$2',
    [resumeId, owner, key]);
  return r.rows[0].pt;
}

/**
 * Resume-derived workers (quiz/diagnosis) must use this instead of the
 * unrestricted blob reader.  It holds the future erasure lock for the whole
 * caller transaction, checks the owner-bound privacy epoch and only then
 * decrypts.  A later erase implementation has to acquire the same lock before
 * fencing, so it cannot commit between this check and the sensitive read.
 */
export async function decryptActiveResumeBlob(
  c: Client, owner: string, resumeId: string, privacyEpoch: number,
): Promise<string> {
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['resume-privacy', resumeId]);
  const meta = await c.query(
    `SELECT b.key_version
       FROM resume r
       JOIN resume_blob b ON b.resume_id=r.id AND b.owner_user_id=r.owner_user_id
      WHERE r.id=$1
        AND r.owner_user_id=$2
        AND r.status='ingested'
        AND r.privacy_epoch=$3
      FOR KEY SHARE OF r`,
    [resumeId, owner, privacyEpoch],
  );
  if (meta.rowCount !== 1) {
    throw Object.assign(new Error('resume_privacy_fenced_or_not_active'), { code: 'resume_privacy_fenced_or_not_active' });
  }
  const key = keyForVersion(Number(meta.rows[0].key_version));
  const r = await c.query(
    `SELECT pgp_sym_decrypt(b.ciphertext, $3) AS pt
       FROM resume_blob b
      WHERE b.resume_id=$1 AND b.owner_user_id=$2`,
    [resumeId, owner, key],
  );
  if (r.rowCount !== 1) throw new Error('resume_blob_not_found_or_forbidden');
  return r.rows[0].pt;
}

/**
 * OCR 成功文本的短暂恢复工件。它只服务于“供应商已成功、业务提交前进程中断”
 * 的恢复窗口；调用方在简历入库并确认权益的同一事务中必须删除它。
 * 与 resume_blob 相同：数据库只存 pgcrypto 密文与密钥版本，绝不存明文或 trace。
 */
export async function persistResumeOcrArtifact(c: Client, owner: string, idempotencyKey: string, plaintext: string): Promise<void> {
  await c.query(
    `INSERT INTO resume_ocr_artifact(owner_user_id,idempotency_key,ciphertext,key_version)
     VALUES($1,$2,pgp_sym_encrypt($3,$4),$5)
     ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`,
    [owner, idempotencyKey, plaintext, RESUME_ENC_KEY(), RESUME_KEY_VERSION],
  );
}

/** Returns `null` when no recovery artifact exists; RLS makes cross-owner reads indistinguishable from absence. */
export async function decryptResumeOcrArtifact(c: Client, owner: string, idempotencyKey: string): Promise<string | null> {
  const meta = await c.query(
    'SELECT key_version FROM resume_ocr_artifact WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, idempotencyKey]);
  if (meta.rowCount === 0) return null;
  const key = keyForVersion(Number(meta.rows[0].key_version));
  const r = await c.query(
    'SELECT pgp_sym_decrypt(ciphertext,$3) AS pt FROM resume_ocr_artifact WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, idempotencyKey, key],
  );
  return r.rowCount === 1 ? String(r.rows[0].pt) : null;
}

/** Deleting after terminal ingestion/release minimizes the lifetime of OCR-derived PII. */
export async function deleteResumeOcrArtifact(c: Client, owner: string, idempotencyKey: string): Promise<boolean> {
  const r = await c.query('DELETE FROM resume_ocr_artifact WHERE owner_user_id=$1 AND idempotency_key=$2', [owner, idempotencyKey]);
  return r.rowCount === 1;
}
