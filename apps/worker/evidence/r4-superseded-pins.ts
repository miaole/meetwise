/**
 * R4 / G4 历史刀 proof 的「后继授权翻面」判据（proof 维护批 A）。
 *
 * 这些 proof 钉的是各自刀落地当时的时序事实——「本刀不翻 P-R1 默认」「status 仍钉
 * 题域隔离 NOT closed」「harness 状态 executed:awaiting_post_prove_dual」。2026-09-23 起
 * 有授权刀（pre-exec + post-prove 双审 BOTH PASS，harness 已钉 post_prove_dual_pass）合法
 * 翻转了这些状态：
 *   - EG3 题域 isolation product close（f2dfa3ed7）→ status/harness 改记 domainIsolationClosed=true；
 *   - G-R4-3 / R1 product close（101fb51e0）→ P-R1 fail-closed 默认翻为 ON；
 *   - 各刀 post-prove 双审通过后的 lifecycle nail → harness 状态改为 post_prove_dual_pass。
 * 旧钉因此恒红（早于 PTP-archive 搬家）。
 *
 * 判据只认两种形态：① 原状态仍在；② 状态已翻，且翻面刀的归档 harness 在案（post_prove_dual_pass
 * + post-prove dual BOTH PASS + 对应翻面标记）。缺②的在案记录仍判红——不放宽为「任意状态皆过」。
 * releaseEvidence=false · ≠HA · 本模块不翻任何产品标志。
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARCHIVE_HARNESS = 'receipts/archive/2026-09-batch23/harness';

function repoRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

function readRepo(rel: string): string {
  const p = join(repoRoot(), rel);
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/** harness 已由授权 nail 钉为 post_prove_dual_pass，且记录 post-prove 双审通过（BOTH PASS / PASS·非自钉）。 */
export function harnessNailedAfterPostProveDual(h: string): boolean {
  return /\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h)
    && /post-prove dual (\*\*)?(BOTH )?PASS/i.test(h);
}

/** harness 状态：执行完待 post-prove 双审（原钉），或双审通过后已授权 nail。 */
export function harnessAwaitingOrDualNailed(h: string): boolean {
  const awaiting = /\*\*Status\*\*: \*\*`executed:awaiting_post_prove_dual`/.test(h)
    && !/\*\*Status\*\*: \*\*`post_prove_dual_pass`/.test(h);
  return awaiting || harnessNailedAfterPostProveDual(h);
}

/** EG3 题域 isolation product close 刀在案（授权关闭 + 双审后 nail）。 */
export function eg3DomainIsolationCloseAuthorized(): boolean {
  const h = readRepo(`${ARCHIVE_HARNESS}/g-r4-5-eg3-domain-isolation-product-close.md`);
  return harnessNailedAfterPostProveDual(h)
    && /domainIsolationClosed=true/.test(h)
    && /题域 isolation product face closed under authorize/.test(h);
}

/** 文本仍钉「题域隔离 NOT closed」，或改记 EG3 授权关闭且 EG3 关闭刀在案。 */
export function domainIsolationNotClosedOrAuthorizedClose(text: string): boolean {
  if (/题域隔离 NOT closed/.test(text)) return true;
  return /题域 isolation product face (\*\*)?closed under authorize/.test(text)
    && /domainIsolationClosed=true/.test(text)
    && eg3DomainIsolationCloseAuthorized();
}

/** G-R4-3 / R1 product close 刀在案：P-R1 fail-closed 默认翻为 ON（授权 + 双审后 nail）。 */
export function r1DefaultFlipAuthorized(): boolean {
  const h = readRepo(`${ARCHIVE_HARNESS}/g-r4-3-r1-product-close.md`);
  return harnessNailedAfterPostProveDual(h)
    && /defaultFlipped=true/.test(h)
    && /R1 product closed under authorize/.test(h);
}

/** worker.env.example：仍记 =0（或缺省），或记 =1 且注明 R1 product-close 授权翻面、翻面刀在案。 */
export function envExampleFailClosedOffOrAuthorizedFlip(envExample: string): boolean {
  if (!envExample || /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*0/.test(envExample)) return true;
  return /MEETWISE_TECH_ROLE_FAIL_CLOSED\s*=\s*1/.test(envExample)
    && /R1 product-close flip under authorize/.test(envExample)
    && r1DefaultFlipAuthorized();
}

/** FUNNEL coveredCount 收官刀 Batch4b（08 eval·coveredCount 7→8）在案（授权 + 双审后 nail）。 */
export function batch4bFunnelLiftAuthorized(): boolean {
  const h = readRepo(`${ARCHIVE_HARNESS}/g-r4-5-funnel-covered-count-batch4b-08-eval.md`);
  return harnessNailedAfterPostProveDual(h) && /coveredCount \*\*7→8\*\*/.test(h);
}

/**
 * EG2 矩阵回执（…-eg2-funnel-covered-matrix.json）原钉 coveredCount=0；Batch1–4b（2026-09-23 授权刀）
 * 按设计复写同一回执、合法抬升计数——认 0，或「计数=covered 行数 + inventCovered=false + 收官刀在案」。
 */
export function eg2MatrixReceiptZeroOrAuthorizedLift(eg2: Record<string, unknown> | null): boolean {
  if (!eg2) return false;
  if (eg2.coveredCount === 0) return true;
  const rows = Array.isArray(eg2.rows) ? (eg2.rows as Array<{ status?: unknown }>) : [];
  const coveredRows = rows.filter((r) => r?.status === 'covered').length;
  return eg2.inventCovered === false
    && typeof eg2.coveredCount === 'number'
    && eg2.coveredCount === coveredRows
    && batch4bFunnelLiftAuthorized();
}
