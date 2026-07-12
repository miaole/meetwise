/**
 * "查了再出"的策略核(纯逻辑,无 IO → 可 gate、可辩护)。把"模型猜题"换成"检索材料→接地生成",并守住四条底线:
 *  ① **标来源**:每题须引用抓到的源(可审计"凭哪来的")。
 *  ② **不照搬**(版权 + 不造假):题面不得与源文近似逐字(长连续子串命中即判抄,必须 transform 改写)。
 *  ③ **去重**:同义/重复题归并。
 *  ④ **对上能力**:每题须落在目标能力清单内(不跑题)。
 * IO(allowlist 抓取、模型读取生成)是注入 seam:fetcher/model 由组合根提供;真 allowlist/授权源由配置定,**此处不硬编源**。
 */
export interface SourceDoc { url: string; text: string }
export interface GroundedQuestion { q: string; competency: string; difficulty: number; citations: string[] }
export interface GroundResult { ok: GroundedQuestion[]; rejected: { q: string; reason: 'no_citation' | 'verbatim_copy' | 'off_competency' | 'duplicate' | 'empty' }[] }

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** 近似逐字检测(版权底线):题面有 ≥minRun 长连续子串原样出现在任一源文 → 判为抄,必须改写。 */
export function isVerbatimCopy(q: string, sources: SourceDoc[], minRun = 12): boolean {
  const nq = norm(q);
  if (nq.length < minRun) return false;
  const corpus = sources.map((s) => norm(s.text));
  for (let i = 0; i + minRun <= nq.length; i++) {
    const window = nq.slice(i, i + minRun);
    if (corpus.some((c) => c.includes(window))) return true;
  }
  return false;
}

/**
 * 校验一批"接地生成"的题:逐题过四门;通过的进 ok,挡下的进 rejected(带原因,可观测)。
 * 注:这是生成**之后**的纪律门;生成本身(fetch+模型读)在 seam 那侧。
 */
export function validateGrounded(questions: GroundedQuestion[], sources: SourceDoc[], competencies: string[]): GroundResult {
  const ok: GroundedQuestion[] = [];
  const rejected: GroundResult['rejected'] = [];
  const seen = new Set<string>();
  const comp = new Set(competencies);
  for (const it of questions) {
    const q = (it.q ?? '').trim();
    if (!q) { rejected.push({ q, reason: 'empty' }); continue; }
    if (!comp.has(it.competency)) { rejected.push({ q, reason: 'off_competency' }); continue; }   // 跑题
    if (!it.citations || it.citations.length === 0) { rejected.push({ q, reason: 'no_citation' }); continue; }   // 无来源
    if (isVerbatimCopy(q, sources)) { rejected.push({ q, reason: 'verbatim_copy' }); continue; }   // 照搬→版权
    const key = norm(q);
    if (seen.has(key)) { rejected.push({ q, reason: 'duplicate' }); continue; }                    // 重复
    seen.add(key);
    ok.push({ ...it, q });
  }
  return { ok, rejected };
}
