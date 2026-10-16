/**
 * UC-E2E-015 focused HTTP prove (eval-first · resume ingest failure family).
 *
 * Asserts encrypt / 0-byte entry / oversized 413 / malformed PDF / illegal MIME
 * WITHOUT MODEL_API_KEY. Relative to full.e2e OCR success + duplicate 409
 * (success face ≠ this failure family).
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-015 covered
 * fixture via run-e2e-isolated → pgvector → green-risk / R5
 *
 *   pnpm uc015:ingest-failures:prove
 *   pnpm -C apps/api prove:uc015-ingest-failures   (raw; needs isolated DATABASE_URL)
 *
 * Matrix may stay **partial** when this file's asserts run green.
 * Do NOT claim covered until e2e:isolated includes the full HTTP failure family + reason/UI.
 */
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc015:ingest-failures');

console.log('UC-E2E-015 resume-ingest-failures prove · releaseEvidence=false · Not HA');
console.log('NOTE: 本绿≠全链路 E2E covered；≠ matrix covered；相对 OCR 成功+409；fixture=pgvector → green-risk/R5');

const AUTH_A = h.U('userA'); // consented + entitlement (from neg harness seed)

const consCount = async (uid: string) =>
  Number((await h.pool.query(
    'SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1',
    [uid],
  )).rows[0].n);

const resumeCount = async (uid: string) =>
  Number((await h.pool.query(
    'SELECT count(*)::int AS n FROM resume WHERE owner_user_id=$1',
    [uid],
  )).rows[0].n);

const beforeCons = await consCount('userA');
const beforeResume = await resumeCount('userA');

/** Minimal PDF object stream that declares /Encrypt (UC-E2E-015 E1). */
function encryptedPdfFixture(): Buffer {
  const body = [
    '%PDF-1.4',
    '1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj',
    '2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj',
    '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>endobj',
    '4 0 obj<< /Filter /Standard /V 2 /R 3 /Length 128 /P -4 /O () /U () >>endobj',
    'trailer<< /Size 5 /Root 1 0 R /Encrypt 4 0 R >>',
    '%%EOF',
    '',
  ].join('\n');
  return Buffer.from(body, 'utf8');
}

// ── F1 · E1 encrypted PDF → 422 encrypted ──────────────────────────────────
{
  const r = await h.post('/resume/file', AUTH_A, {
    filename: 'locked.pdf',
    mimeType: 'application/pdf',
    contentBase64: encryptedPdfFixture().toString('base64'),
  });
  A('F1 加密 PDF → 422', r.status === 422);
  A('F1 error=encrypted', r.body?.error === 'encrypted');
}

// ── F2 · E3 0-byte entry (contract) → 400 ──────────────────────────────────
{
  const r = await h.post('/resume/file', AUTH_A, {
    filename: 'empty.pdf',
    mimeType: 'application/pdf',
    contentBase64: '',
  });
  A('F2 0字节 contentBase64 空串 → 400 入口即拒', r.status === 400);
}

// ── F3 · E4 oversized → 413 file_too_large ──────────────────────────────────
{
  // 8MB+1 raw; DTO max allows base64 through so service MAX_RESUME_BYTES fires 413.
  const oversized = Buffer.alloc(8 * 1024 * 1024 + 1, 0x41);
  const r = await h.post('/resume/file', AUTH_A, {
    filename: 'huge.pdf',
    mimeType: 'application/pdf',
    contentBase64: oversized.toString('base64'),
  });
  A('F3 超大(>8MB) → 413', r.status === 413);
  A('F3 error=file_too_large', r.body?.error === 'file_too_large');
}

// ── F4 · malformed PDF bytes → 422 parse_failed ────────────────────────────
{
  const r = await h.post('/resume/file', AUTH_A, {
    filename: 'broken.pdf',
    mimeType: 'application/pdf',
    contentBase64: Buffer.from('%PDF-not-a-real-pdf\njunk-bytes' + String.fromCharCode(0, 1, 2)).toString('base64'),
  });
  A('F4 畸形 PDF → 422', r.status === 422);
  A('F4 error=parse_failed', r.body?.error === 'parse_failed');
}

// ── F5 · illegal MIME / non-resume format → 415 ────────────────────────────
{
  const exe = await h.post('/resume/file', AUTH_A, {
    filename: 'malware.exe',
    mimeType: 'application/x-msdownload',
    contentBase64: Buffer.from('MZ').toString('base64'),
  });
  A('F5 非简历格式 .exe → 415', exe.status === 415);
  A('F5 error=unsupported_file_format', exe.body?.error === 'unsupported_file_format');

  const xlsx = await h.post('/resume/file', AUTH_A, {
    filename: 'budget.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    contentBase64: Buffer.from('PK\x03\x04fake-xlsx').toString('base64'),
  });
  A('F5 xlsx → 415（不乱码入库）', xlsx.status === 415 && xlsx.body?.error === 'unsupported_file_format');
}

// ── F-billing · A3 无扣费 / 不落新简历（失败族） ───────────────────────────
{
  const afterCons = await consCount('userA');
  const afterResume = await resumeCount('userA');
  A('F-billing 失败族无新增 entitlement_consumption', afterCons === beforeCons);
  A('F-billing 失败族无新增 resume 行', afterResume === beforeResume);
}

console.log('\nNOTE: still needs e2e:isolated for OCR success+409 (Key) + scanned no_text_layer reason/UI; ≠covered');
await done();
