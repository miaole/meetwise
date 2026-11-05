#!/usr/bin/env node
// request-status-recon.mjs — harness REQUEST 卷状态两读制提取器（受管脚本）。
//
// 唯一功能：对普查全集（ai-docs/delivery/harness/ 下文件名含 REQUEST 的卷，锚定
// 普查基线提交共 274 卷）逐卷做「raw 六锚读法 + 注记终值读法」双向提取，
// 输出两读差异清单与分层计数。除本输出外不做任何其他事。
//
// 算法即 rc-REQUEST §0.1-2「两读制」的物化，规范语义以该节为准，本脚本为其可复跑载体。
// 复跑纪律（§0.1-2 钉死）：EXEC 期复跑以本脚本输出为准，禁另起口径。
//
// 用法：
//   node scripts/ai-docs/request-status-recon.mjs             # 对现树（HEAD）受管面全卷输出两读差异清单
//   node scripts/ai-docs/request-status-recon.mjs --all       # 附每卷两读全表
//   node scripts/ai-docs/request-status-recon.mjs --ref=<ref> # 改读其他提交（默认=HEAD 现树）
//
// ── raw 读法 = 六锚优先级（取首中锚行的首个 canonical token；行中嵌入 token 一律 prose 混入
//    不取；prose 提及与连字合成词不命中——uc025-e2e / secret-checker-nul-guard 反例校验样本）──
//   R1 卷首 title 行 `STOP=` 赋值——取 `STOP=` 后首个 canonical token（title 首个 canonical token
//      须落在赋值位方命中；event-ttl `:1` / ai-graphs-cycle-break `:1` 正例形）；
//   R2 Status/状态 形行（首个携带 canonical token 者；后于 STOP 行出现仍压 STOP 锚：ci-wiring2
//      `:128` / baseline-red5 `:3` / ag-cost5 `:3` / ag24-langfuse-model `:3` 形；Status 头行无态字
//      时顺延下一条 Status 形行——resume-grounding `:3` 空头→`:186` 形）；
//   R3 行首裸 token 行 = 剥 bullet/wrap 后整行恰为一 canonical token（backtick/bold 包裹允许；
//      连字合成词与 prose 提及不命中——resume-reread-status `:1` / closed-job-start `:1` /
//      money-status-proof §8 `:108/:112/:114` / quiz-loopback-host §8 `:174/:178/:180` /
//      boundary-rule-single §8 `:76/:80/:82` 正例形）；
//   R4 行首态行 = 行首 wrap token + 紧随括注（2026-10-15 滞后翻面批 closed 行形：
//      negresume-driver-fix / obs-logging / obs-ready `:3`）；
//   R5 其余 `STOP=` 赋值行（baseline-red5 `:29` 形·被 R2 压）；
//   R6 `STOP ·` 值行（ci-wiring `:86` 形）。
//   六锚全空 = 无状态行（g7-enoent-fix）。
//
// ── 注记终值读法 = 全卷扫权威翻面行，按优先级钉死取最高类末条（末条权威翻面行）──
//   ⑦ 活值翻面行（标记制）：链形（token → token·括号深度零位方为链箭头·取链末元素）/
//      标记 Status 段（Status+·翻面·链补全·演进补登·终翻注记）/ STOP 现值·终值·终态·⑦STOP /
//      终值=·终态：显式赋值 / 「本注记为权威」同线权翻（smoke-env-fix `:3`）/「已改回」撤回行 /
//      EXEC 期终态注记·EXEC 落卷·EXEC 翻面 bold 头标形（db-acl-residual `:181`）/
//      post 双审会签 PASS·post-prove 双席 BOTH PASS 携态字（g2-report-page `:97`）/
//      「EXEC 状态行」节下态字行（resume-grounding `:189`）/ 括注翻面（event-ttl `:3` 收官翻面形）/
//      链续行（行首 → 态字——ha-6-companion `:171` 形）/
//      2026-11-03/05 后四种关闭注（STATUS-RECON 对账刀 + DRAFT-FLIP 批量关闭刀 + ERRATA-SESSION-1105
//      总刀 + fin 台账收官刀 U5a）：`有效态翻面→`态字``翻面注（cap-sanction-2232 `:3`/`:73` 形·
//      `终值裁定=` 同线并存时裁定注后位胜）/ `【关闭 … STOP 收口 `态字``（g2-report-page `:99` 形）/
//      `【闭卷注|【归档注 … 本卷闭卷|归档登记】`（extrev-deps-audit `:203` / g7-enoent-fix `:76` 形·
//      闭卷登记=closed·零态字亦命中）/ `终值裁定=态字`（fin `:27` / regw `:3` 形·链/标记赋值前取）；
//      2026-11-06 rev 引述/提及免疫：三类显式标记与闭卷/归档注只在「规范注头（【终裁注/【翻面/
//      【关闭/【闭卷注|【归档注 + ISO 日期）共线 + marker 本体在 code span 外 + 态字紧邻
//      （marker 后只容反引号/加粗/括号/空白等包裹字符）」时取值，且 marker 本体不被反引号引述
//      （前邻非反引号）——正文引述格式示例（small-fixes-1105 §0 表行形）、裸 marker 行、prose 提及
//      一律不触发（bare `终值裁定=` 不翻系钉死语义）；
//   > 权威条款行（「本注记为权威」/「现以 §N 为准」/「已改回」携态字——smoke-env-fix `:131` vs
//      `:3` 标本：卷尾历史 STOP= 复述行不翻，`:3` 权威终翻行胜）；
//   > 后置历史 STOP=/卷尾注（无⑦标记的 STOP= / STOP · 复述行——smoke-env-fix `:127/:131`、
//      baseline-red5 `:29` 形）；「维持/零翻面/不翻」声明行零翻面（bill4 `:199`、uc025-e2e
//      rev 自检形）；
//   > 后置 `nail 落卷` 叙事行（行首 nail 登记/卷尾 nail 叙事——uuid-id-check `:150` bare 终值
//      nail 与 h5-role-input `:167` 行首 nail 面登记同判 nail 族；obs-family `:197` 与
//      ai-graphs-cycle-break `:112` 卷尾同形叙事行同判叙事层零翻面——两卷机读终值同为
//      executed 族，其形态分组差异由 rc-REQUEST §1 逐卷亲读表承载，非此两行所源）。
//   链末元素无态字者 = 非态字链末元素（b110 `:3` 链末元素 backfill_mw-core 回填注记形——
//   r2 曾误取中段 `exec_landed:awaiting_dual_review` 为终值，本读法勘正）。
//   `nail 落卷`（closed）同位括注等式者归 closed 族（smoke-env-fix 形）。
//
// ── executed 族 token 集（判据①口径）：`executed` / `exec:` / `executed_s1s2` / `executed_slice2` /
//    `exec_resume-grounding` / `exec_landed` / `nailed` / `nail 落卷` / `nail:closed` 前缀族；
//    连字合成词（如 case-closed）与 prose 提及不命中。纯 Status 复述行（无翻面标记）不构成
//    翻面行（growth-gen `:122` / extrev-score-writer `:136` / errmsg-map `:120` /
//    entpay-slice2 `:180` 保持 draft 之机制依据；红停上报行 `executed:stopped_gate_red_escalated`
//    系中间停报态非终值翻面——safewrite-backpressure `:5` 形）。
//
// census 锚定：默认读 HEAD（受管面动态枚举——普查集=该 ref 下 harness/ 内 REQUEST 卷全集，
// 不再钉死卷数常数；274 卷旧基线 e647fcffa 及任何历史提交可用 --ref=<ref> 回读）。
// 防漏门：任何一卷若六锚 raw 与注记终值两读全空（= 未被任何锚读到），报错退出 1 并逐卷点名
// （防新卷无状态注静默漏读；errata-session-1105 起全部在册卷均带状态注或关闭注）。

import { execFileSync } from 'node:child_process';

const DEFAULT_REF = 'HEAD'; // 受管面动态枚举（普查基线重锚现树；历史基线 e647fcffa 用 --ref 回读）
// 卷数收缩防线（2026-11-06 rev）：动态枚举只防「读不出」（防漏门），不防「集合变小」——
// 卷被删/改名漏检时 census 静默缩水。HEAD 默认读法设硬下界=落值时受管卷全集（增长零触碰，
// 永不误红；合法删除须随刀承登如实上调/撤除）。显式 --ref= 读法（历史基线/探针仓）不设界。
const MIN_VOLUME_COUNT = 288;

// ---------- token 模型 ----------

// canonical 状态 token（raw 六锚与终值共用本体）：基词 + `:子值` / `_后缀` 链。
const CANON_SRC =
  '(?:executed|closed|draft|proofed|stopped|exec_landed|post_prove_dual_pass)' +
  '(?::[\\w.:/\\-]+|_[\\w./\\-]+)*';
// executed 族扩展 token（判据①口径）：exec:/exec_resume-grounding 前缀 + nail 族。
const FAMILY_SRC =
  '(?:exec:[\\w:/\\-]+|exec_resume-grounding(?::[\\w:/\\-]+)*|nailed|nail:closed|nail\\s*落卷)';
const FAMILY_TOKEN_RE = new RegExp(`(?<![\\w/\\-])(${CANON_SRC}|${FAMILY_SRC})(?![\\w-])`, 'g');
const CANON_TOKEN_RE = new RegExp(`(?<![\\w/\\-])(${CANON_SRC})(?![\\w-])`, 'g');
// 链箭头：→ 后接 wrap 起始或小写态字起头（`0152→0155` 数字位移、`→EXEC 时点` 大写 prose 不拆）。
const CHAIN_ARROW_LOOKAHEAD =
  '[`*【\\[]|executed(?![\\w-])|closed(?![\\w-])|draft(?![\\w-])|proofed(?![\\w-])|stopped(?![\\w-])|exec_landed(?![\\w-])|exec:|nailed(?![\\w-])|nail:closed|nail\\s*落卷|post_prove_dual_pass';

function normalizeToken(raw) {
  return raw.replace(/\s+/g, ' ').trim();
}

// ---------- 显式翻面标记读法（2026-11-06 rev：引述/提及免疫）----------
// 三类显式标记（`终值裁定=`/`有效态翻面→`/`STOP 收口`态字``）只在「权威注记原行」上取值，
// 三条件齐备方命中（small-fixes-1105-REQUEST §0 表行引述四关闭注格式即被旧读法伪读为
// executed 的 P1 根因）：
//   ① 注头共线：marker 所在行须带该注记种的规范注头+ISO 日期（【终裁注/【翻面/【关闭
//      +\d{4}-\d{2}-\d{2}——append-only 注记约定形，在案全部真翻面行均带；裸 marker、
//      格式示例、他卷注引述不带本种注头不触发；bare `终值裁定=` 行不翻系本读法钉死语义）；
//   ② span 外：marker 本体前邻字符非反引号（`` `有效态翻面→` ``整段被引述形免疫；
//      注记值形 `有效态翻面→`closed`` 的值在 span 内、marker 在外，照常命中）；
//   ③ 态字紧邻：marker 之后只容包裹字符（反引号/加粗/括号/空白）即须紧邻 canonical 态字
//      ——marker 后正文 prose 里任意位置的态字（如「伪读为 executed」）不取。
const ADJUD_MARKER_RE = /终值裁定\s*[`*_\s]*[=＝：:]\s*[`*_\s]*/g;
const RECON_MARKER_RE = /有效态翻面\s*→\s*[`*_\s]*/g;
const STOPCLOSE_MARKER_RE = /STOP\s*收口\s*[`*_\s]*/g;
const ADJUD_NOTE_RE = /【终裁注\s+\d{4}-\d{2}-\d{2}/;
const FLIP_NOTE_RE = /【翻面\s+\d{4}-\d{2}-\d{2}/;
const CLOSE_NOTE_RE = /【关闭\s+\d{4}-\d{2}-\d{2}/;
const EXPLICIT_WRAP_ONLY =
  new RegExp('^[`*_\\s（）()〔〕【】]*(' + CANON_SRC + '|' + FAMILY_SRC + ')(?![\\w-])');

function inCodeSpan(line, idx) {
  return idx > 0 && line[idx - 1] === '`'; // marker 前邻恰为反引号=code span 引述形（`` `有效态翻面→` ``）
}

// errata 闭卷注/归档注整行判定：注头须携 ISO 日期（真注约定形；格式示例/引述不带日期
// 不命中——small-fixes-1105 §0 表行 `` `【闭卷注|【归档注…` 引述形免疫）。
function isCloseNoteLine(line) {
  return /【(?:闭卷注|归档注)\s+\d{4}-\d{2}-\d{2}/.test(line) && /本卷(?:闭卷|归档)登记/.test(line);
}

// marker 全局扫描：取首个「注头共线+非反引号引述+态字紧邻」命中；任一条件不满足即无此标记值。
function explicitMarkerHit(line, markerRe, noteRe) {
  if (!noteRe.test(line)) return null;
  markerRe.lastIndex = 0;
  let m;
  while ((m = markerRe.exec(line)) !== null) {
    if (inCodeSpan(line, m.index)) continue;
    const rest = line.slice(m.index + m[0].length);
    const am = EXPLICIT_WRAP_ONLY.exec(rest);
    if (am) return { token: normalizeToken(am[1]), end: m.index + m[0].length + am[0].length };
  }
  return null;
}

function familyOf(token, line, matchEnd) {
  if (token === 'nail 落卷' || token === 'nail:closed' || token === 'nailed') {
    // `nail 落卷`（closed）同位括注等式者归 closed 族（smoke-env-fix `:3` 权威终翻形）。
    if (token === 'nail 落卷' && /^\s*[`*_\s]*[（(]\s*closed\s*[）)]/.test(line.slice(matchEnd))) return 'closed';
    return 'executed';
  }
  if (/^(executed|exec:|exec_landed|exec_resume-grounding|executed_s1s2|executed_slice2)/.test(token)) {
    return 'executed';
  }
  if (token === 'post_prove_dual_pass') return 'post_prove_dual_pass';
  if (token.startsWith('proofed')) return 'proofed';
  if (token.startsWith('closed')) return 'closed';
  if (token.startsWith('draft')) return 'draft';
  if (token.startsWith('stopped')) return 'stopped';
  return 'executed';
}

function firstFamilyToken(text, canonOnly = false) {
  const re = canonOnly ? CANON_TOKEN_RE : FAMILY_TOKEN_RE;
  re.lastIndex = 0;
  const m = re.exec(text);
  return m ? { token: normalizeToken(m[1]), index: m.index, end: m.index + m[0].length } : null;
}

function allFamilyTokens(text) {
  const re = FAMILY_TOKEN_RE;
  re.lastIndex = 0;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) out.push({ token: normalizeToken(m[1]), index: m.index, end: m.index + m[0].length });
  return out;
}

// token-after-marker：取 marker 之后首个态字。
function tokenAfterMarker(text, markerRe) {
  const m = markerRe.exec(text);
  if (!m) return null;
  const rest = text.slice(m.index + m[0].length);
  const hit = firstFamilyToken(rest);
  if (!hit) return null;
  return { token: hit.token, end: m.index + m[0].length + hit.end };
}

// 括号深度零位的链箭头拆分：返回链末段（无零位链箭头时返回 null）。
function lastChainSegment(line) {
  const re = new RegExp(`→\\s*(?=${CHAIN_ARROW_LOOKAHEAD})`, 'g');
  let depth = 0;
  let lastSplit = -1;
  let m;
  while ((m = re.exec(line)) !== null) {
    const before = line.slice(0, m.index);
    depth = 0;
    for (const ch of before) {
      if (ch === '（' || ch === '(' || ch === '〔' || ch === '【') depth += 1;
      else if (ch === '）' || ch === ')' || ch === '〕' || ch === '】') depth -= 1;
    }
    if (depth <= 0) lastSplit = m.index + m[0].length;
  }
  return lastSplit >= 0 ? line.slice(lastSplit) : null;
}

// 翻面行解析：显式赋值标记（终值裁定/有效态翻面/STOP 收口）最优先——翻面注行常兼含链形
// 与「本行活值 `旧值`」复述（ag09 卷尾注 `:156` 形），链首取到旧值系伪读，注体箭头才是翻面；
// 其余仍链形取链末元素；否则泛值标记赋值；否则 STOP=/现值= 赋值取末个；否则行首态字。
function parseFlipLine(line) {
  // errata 闭卷注/归档注：注头（携 ISO 日期·引述格式示例不带日期不命中）+本卷登记同线即
  // closed（注体零态字亦命中——extrev-deps-audit `:203` / g7-enoent-fix `:76` 形）；
  // 引述行无「本卷…登记」字样不命中。
  if (isCloseNoteLine(line)) {
    return { token: 'closed', family: 'closed', via: 'close_note' };
  }
  const adjudHit = explicitMarkerHit(line, ADJUD_MARKER_RE, ADJUD_NOTE_RE); // fin U5a 终裁注（末位权威·胜于位序）
  const reconHit = explicitMarkerHit(line, RECON_MARKER_RE, FLIP_NOTE_RE); // STATUS-RECON 对账刀翻面注（cap-sanction-2232 `:3`/`:73` 形·协调方授权对账翻面）
  const explicitFlip =
    adjudHit ??
    reconHit ??
    explicitMarkerHit(line, STOPCLOSE_MARKER_RE, CLOSE_NOTE_RE); // DRAFT-FLIP 批量关闭刀（g2-report-page `:99` 形）
  if (explicitFlip) {
    return {
      token: explicitFlip.token,
      family: familyOf(explicitFlip.token, line, explicitFlip.end),
      via: 'marker',
      ...(adjudHit ? { adjudicated: true } : {}),
      ...(reconHit ? { reconFlip: true } : {}),
    };
  }
  const chain = lastChainSegment(line);
  if (chain !== null) {
    const hit = firstFamilyToken(chain);
    if (hit) return { token: hit.token, family: familyOf(hit.token, chain, hit.end), via: 'chain' };
    // 链末元素无态字：仅标签头形（段首 `标签:`——b110 backfill_mw-core 回填注记形）成非态字链末；
    // 其余（prose 叙述段）视为 prose 箭头不成翻面。
    const labelHit = /^[\s`*_]*([A-Za-z][\w.\-]*)\s*[：:]\s*\S/.exec(chain);
    if (labelHit) return { token: null, label: labelHit[1], via: 'chain' };
    return null;
  }
  const assignHit =
    tokenAfterMarker(line, /(?:终值|终态)\s*[`*_\s]*[=＝：:]\s*[`*_\s]*/) ??
    tokenAfterMarker(line, /(?:终翻为|终值为|值终翻)\s*[`*_\s]*/) ??
    tokenAfterMarker(line, /已改回\s*[`*_\s]*/) ??
    tokenAfterMarker(line, /\*\*\s*EXEC\s*(?:翻面|期终态注记|落卷)\s*(?!=)[^）]*）\s*\*\*\s*[：:]?\s*[`*_\s]*/);
  if (assignHit) {
    return { token: assignHit.token, family: familyOf(assignHit.token, line, assignHit.end), via: 'marker' };
  }
  const assigns = allFamilyTokens(line).filter((t) => {
    const before = line.slice(Math.max(0, t.index - 12), t.index);
    return /STOP\s*[=＝]\s*[`*_\s]*$|现值\s*[=＝：:]\s*[`*_\s]*$/.test(before);
  });
  if (assigns.length > 0) {
    const last = assigns[assigns.length - 1]; // 同行多笔赋值取末笔（i18n-metadata-ssr `:186` 形）
    return { token: last.token, family: familyOf(last.token, line, last.end), via: 'assign' };
  }
  const head = firstFamilyToken(line);
  if (head) return { token: head.token, family: familyOf(head.token, line, head.end), via: 'head' };
  return null;
}

// ---------- raw 六锚 ----------

const STATUS_SHAPE_RE =
  /(?:\*\*)?\s*(?:Status|状态)(?:\+|（[^）]*）|\s*(?:链补全|翻面|演进补登|终翻注记|终翻|演进))?(?:\*\*)?\s*(?:（[^）]*）(?:\*\*)?)?\s*[:：]/;
const STOP_ASSIGN_RE = /(?<![\w-])STOP\s*[=＝]\s*[`*_\s]*/;
const STOP_DOT_RE = /STOP\s*·\s*[`*_\s]*/;
const BULLET = /^\s*(?:[-*>+]|\d+[.、)])?\s*/;

function readRaw(lines) {
  // R1：title 行 `STOP=` 后首个 canonical token（title 首个 canonical token 落在赋值位方命中）。
  const title = lines[0] ?? '';
  const titleHit = tokenAfterMarker(title, STOP_ASSIGN_RE);
  const titleFirst = firstFamilyToken(title, true);
  if (titleHit && titleFirst && titleFirst.token === titleHit.token) {
    return { value: titleHit.token, family: familyOf(titleHit.token, title, titleHit.end), anchor: 'R1', line: 1 };
  }
  // R2：首个携带 canonical token 的 Status 形行（空头顺延下一条 Status 形行；压 R5/R6 STOP 锚）。
  for (let i = 0; i < lines.length; i += 1) {
    if (STATUS_SHAPE_RE.test(lines[i])) {
      const hit = firstFamilyToken(lines[i], true);
      if (hit) return { value: hit.token, family: familyOf(hit.token, lines[i], hit.end), anchor: 'R2', line: i + 1 };
    }
  }
  // R3：行首裸 token 行（剥 bullet/wrap 后整行恰为一 canonical token；下划线系 token 本体非 wrap）。
  for (let i = 0; i < lines.length; i += 1) {
    const stripped = lines[i].replace(BULLET, '').replace(/[\s`*]/g, '');
    const bare = firstFamilyToken(stripped, true);
    if (bare && bare.index === 0 && stripped === bare.token) {
      return { value: bare.token, family: familyOf(bare.token, lines[i], 0), anchor: 'R3', line: i + 1 };
    }
  }
  // R4：行首 wrap token + 紧随括注。
  for (let i = 0; i < lines.length; i += 1) {
    const m = new RegExp(`^\\s*(?:[-*>+]\\s*)?(?:[\`*_]{0,4})(${CANON_SRC})(?:[\`*_]{0,4})\\s*（`).exec(lines[i]);
    if (m) return { value: m[1], family: familyOf(m[1], lines[i], m[0].length), anchor: 'R4', line: i + 1 };
  }
  // R5：其余 STOP= 赋值行。
  for (let i = 1; i < lines.length; i += 1) {
    const hit = tokenAfterMarker(lines[i], STOP_ASSIGN_RE);
    if (hit) return { value: hit.token, family: familyOf(hit.token, lines[i], hit.end), anchor: 'R5', line: i + 1 };
  }
  // R6：`STOP ·` 值行。
  for (let i = 1; i < lines.length; i += 1) {
    const hit = tokenAfterMarker(lines[i], STOP_DOT_RE);
    if (hit) return { value: hit.token, family: familyOf(hit.token, lines[i], hit.end), anchor: 'R6', line: i + 1 };
  }
  return null;
}

// ---------- 注记终值 ----------

const NOFLIP_RE = /维持不翻|零翻面|维持（|维持\s*[`*_]|维持原值|不进位|不翻面|不翻/;
const STOP_FLIP_RE = /STOP\s*(?:现值|终值|终态|值终翻)\s*[`*_\s]*[=＝：:]?|⑦STOP|STOP\s*→/;
const EXEC_BOLD_RE = /\*\*\s*EXEC\s*(?:翻面|期终态注记|落卷)\s*(?!=)/;
const AUTHORITY_RE = /本注记为权威|现以 §|已改回|撤回/;
const DUAL_PASS_RE = /post 双审会签 PASS|post-prove 双席 BOTH PASS/;
// 翻面括注=态字后紧随括注（event-ttl `:3` 收官翻面形 / baseline-red5 `:3` 卷主翻面形）；
// 「翻面权/翻面后」叙述性提及不命中（progress-write `:190` / qbank-pipeline-scope `:213` 反例）。
const FLIP_GLOSS_RE =
  new RegExp(
    '(?:' + CANON_SRC + '|nailed|nail:closed|nail\\s*落卷)[`*_\\s]*（[^（）]*翻面(?!权|后|在)[^（）]*）',
  );
const EXEC_SECTION_HEADING_RE = /^#{1,6}\s+\S{0,40}EXEC\s*(?:状态行|期终态|终态|落卷)/;
const NAIL_LEAD_RE = /^\s*(?:[-*]\s*)?(?:\*\*)?\s*nail/;

function readTerminal(lines, raw, debug) {
  // 封口档终值随 raw：closed 卷主翻面卷（2026-10-15 批等·closed 99 族口径保持）与
  // proofed/post_prove 档（附记-甲·档位高于 executed·翻面权归协调方·零触）——卷内后置
  // EXEC/rev 值行系档位内历史层（ha1 `:34`/quizdx `:466` 形），不构成跨档翻面。
  if (raw && (raw.family === 'closed' || raw.family === 'proofed' || raw.family === 'post_prove_dual_pass')) return null;
  const hits = { 7: [], 6: [], 5: [], 4: [] }; // ⑦活值 / 权威条款 / 后置历史 STOP=/卷尾注(复述层不裁决) / 后置 nail 叙事
  let execSection = false;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (/^#{1,6}\s/.test(line)) {
      // 标题行（含 §9 EXEC 记录类）只作 EXEC 节上下文标记，不作翻面行候选——
      // 2026-10-15 批卷 §9 EXEC 记录标题携 EXEC 期历史 STOP= 值（早于 `:3` 卷主翻面）不翻。
      execSection = EXEC_SECTION_HEADING_RE.test(line);
      continue;
    }
    if (NOFLIP_RE.test(line)) continue; // 「维持/零翻面/不翻」声明行零翻面（bill4 `:199` 形）
    // errata 闭卷注/归档注：注体零态字（g7-enoent-fix `:76` 形）也须进入翻面判定。
    const closeNoteFlip = isCloseNoteLine(line);
    if (!firstFamilyToken(line) && !closeNoteFlip) continue;
    const no = i + 1;
    if (debug) debug(`  L${no} [scan] ${line.slice(0, 140)}`);
    // 后置 `nail 落卷` 叙事行先行归类（uuid `:150` bare 终值 nail 与 h5 `:167` 行首 nail 同判
    // nail 族证据位；obs `:197` 与 ai-graphs `:112` 卷尾同形叙事行同判零翻面）。
    if (NAIL_LEAD_RE.test(line) && !STATUS_SHAPE_RE.test(line)) {
      hits[4].push({ no });
      continue;
    }
    const statusShape = STATUS_SHAPE_RE.test(line);
    const chainSeg = lastChainSegment(line);
    const chainFlip = chainSeg !== null;
    const statusMarked = /\*\*\s*Status\s*(?:\+|\s*(?:翻面(?!权)|链补全|演进补登|终翻注记|终翻))/.test(line);
    const stopFlip = STOP_FLIP_RE.test(line);
    const execBold = EXEC_BOLD_RE.test(line);
    const explicitAssign = /(?:终值|终态)\s*[`*_\s]*[=＝：:]|(?:终翻为|终值为|值终翻)/.test(line);
    const dualPass = DUAL_PASS_RE.test(line);
    const flipGloss = FLIP_GLOSS_RE.test(line);
    const lineStartArrow = /^\s*[`*_\s]*→/.test(line);
    const sectionCarry = execSection;
    // 触发旗与取值同判据（注头+span 外+态字紧邻）：正文引述/格式示例/提及不再把行送进翻面分支
    // ——small-fixes-1105 §0 表行（引四关闭注格式）即被旧子串旗伪触发。
    const reconFlip = explicitMarkerHit(line, RECON_MARKER_RE, FLIP_NOTE_RE) !== null; // STATUS-RECON 对账刀翻面注（卷头 :3 形无 STOP/Status 标记时由此触发）
    const stopCloseNote = explicitMarkerHit(line, STOPCLOSE_MARKER_RE, CLOSE_NOTE_RE) !== null; // DRAFT-FLIP 批量关闭刀（无 dualPass 共现时由此触发）
    // 翻面行判定：链形须与 Status/STOP/EXEC 标记或链续行（行首 →）共现——纯 prose 链复述
    // （closed-job-start `:68` 代码箭头 / ag09 `:156` / ci-wiring2 `:34` 等叙述形）不翻。
    const chainIsFlip = chainFlip && (statusShape || statusMarked || stopFlip || execBold || lineStartArrow || sectionCarry);
    if (chainIsFlip || statusMarked || stopFlip || execBold || explicitAssign || dualPass || flipGloss || sectionCarry || closeNoteFlip || reconFlip || stopCloseNote) {
      const parsed = parseFlipLine(line);
      if (parsed) {
        if (parsed.token && parsed.token.startsWith('stopped')) continue; // 红停上报=中间停报态非终值翻面
        hits[7].push({ no, ...parsed });
      }
      continue;
    }
    if (AUTHORITY_RE.test(line)) {
      const parsed = parseFlipLine(line);
      if (parsed && parsed.token && !parsed.token.startsWith('stopped')) hits[6].push({ no, ...parsed });
      continue;
    }
    // 后置历史 STOP=/卷尾注：STOP 赋值须在括号深度零位（nightly-recall-fix `:108` 史录括注形不翻）。
    const stopDepthZero = [STOP_ASSIGN_RE, STOP_DOT_RE].some((re) => {
      const m = re.exec(line);
      if (!m) return false;
      let depth = 0;
      for (const ch of line.slice(0, m.index)) {
        if (ch === '（' || ch === '(' || ch === '〔' || ch === '【') depth += 1;
        else if (ch === '）' || ch === ')' || ch === '〕' || ch === '】') depth -= 1;
      }
      return depth <= 0;
    });
    if (stopDepthZero && !stopFlip) {
      const parsed = parseFlipLine(line);
      if (parsed && parsed.token && !parsed.token.startsWith('stopped')) hits[5].push({ no, ...parsed });
    }
  }
  // 终值裁决只取 ⑦活值翻面行 / 权威条款行；后置历史 STOP=/卷尾注（hits[5]）为复述层
  // 不裁决（无更高类翻面行时随 raw 层——qbank-pipeline-scope `:213` 卷尾历史 trailer 形），
  // hits[4] nail 叙事层同不裁决（判据②佐证位）。
  // `终值裁定=`（fin U5a 终裁注）自钉「终值读序」权威（regw `:3` vs §9-EXEC `:497` 形）：
  // 同类内取末条裁定行，压位序；`有效态翻面→`（STATUS-RECON 对账刀）同层压位序——它逐行
  // append 于卷头/§8/卷尾全部状态行，EXEC 期卷尾摘要的翻面括注复述行（assert-strengthen
  // `:141` 形）位序在后但系旧值史录非翻面。两类权威均缺位时仍取末条（append-only 后位胜）。
  for (const cls of [7, 6]) {
    if (hits[cls].length > 0) {
      const adjs = hits[cls].filter((h) => h.adjudicated);
      const recons = hits[cls].filter((h) => h.reconFlip);
      const last =
        adjs.length > 0 ? adjs[adjs.length - 1] : recons.length > 0 ? recons[recons.length - 1] : hits[cls][hits[cls].length - 1];
      if (last.token) return { value: last.token, family: last.family, via: last.via, class: cls, line: last.no };
      return { value: null, label: last.label, family: 'non-canonical', class: cls, line: last.no };
    }
  }
  return null;
}

// ---------- 普查驱动 ----------

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
}

function main() {
  const argv = process.argv.slice(2);
  const refArg = argv.find((a) => a.startsWith('--ref='));
  const ref = refArg ? refArg.slice('--ref='.length) : DEFAULT_REF;
  const showAll = argv.includes('--all');
  const debugVol = argv.find((a) => a.startsWith('--debug='))?.slice('--debug='.length);

  // 受管面动态枚举：普查集=该 ref 下 harness/ 内 REQUEST 卷全集（不钉卷数常数；
  // 防漏由扫描后的「未被任何锚读到」门承担）。
  const paths = git(['ls-tree', '-r', '--name-only', ref, '--', 'ai-docs/delivery/harness/'])
    .split('\n')
    .filter((p) => p.includes('REQUEST'));

  const rows = [];
  for (const path of paths) {
    const vol = path.split('/').pop().replace(/-REQUEST\.md$/, '');
    const text = git(['show', `${ref}:${path}`]);
    const lines = text.split('\n');
    const raw = readRaw(lines);
    const terminal = readTerminal(lines, raw, debugVol === vol ? console.log : null);
    if (debugVol === vol) {
      console.error(`[debug ${vol}] raw=${JSON.stringify(raw)} terminal=${JSON.stringify(terminal)}`);
    }
    rows.push({ vol, path, raw, terminal });
  }

  // 卷数收缩防线：HEAD 默认读法（未显式 --ref=）下卷集合小于硬下界即红（见 MIN_VOLUME_COUNT 注）。
  if (!refArg && rows.length < MIN_VOLUME_COUNT) {
    console.error(`census shrink: ref ${ref} 卷数 ${rows.length} < 下界 ${MIN_VOLUME_COUNT}（卷集合收缩·合法删除须随刀承登上调）`);
    process.exit(1);
  }

  // 防漏门样本：六锚 raw 与注记终值两读全空 = 未被任何锚读到（新卷无状态注静默漏读防线）。
  // 先出报告再裁决退出码（历史 ref 可能含补注前无状态卷——报告仍可读，退出码如实红）。
  const unread = rows.filter((r) => !r.raw && !r.terminal);

  const rawTally = { closed: 0, executed: 0, draft: 0, proofed: 0, post_prove_dual_pass: 0, stopped: 0, none: 0 };
  const termTally = { executed: 0, closed: 0, draft: 0, proofed: 0, post_prove_dual_pass: 0, stopped: 0, non_canonical: 0 };
  for (const r of rows) {
    if (!r.raw) rawTally.none += 1;
    else rawTally[r.raw.family] += 1;
    if (!r.terminal) continue;
    if (r.terminal.family === 'non-canonical') termTally.non_canonical += 1;
    else termTally[r.terminal.family] += 1;
  }

  const diff = rows.filter((r) => {
    if (!r.terminal) return false;
    if (r.terminal.family === 'non-canonical') return true;
    if (!r.raw) return true;
    return r.raw.value !== r.terminal.value;
  });
  const dir2 = diff.filter((r) => r.raw && r.raw.family === 'draft' && r.terminal.family === 'executed');
  const dirDraftClosed = diff.filter((r) => r.raw && r.raw.family === 'draft' && r.terminal.family === 'closed');
  const dirExecDraft = diff.filter((r) => r.raw && r.raw.family === 'executed' && r.terminal.family === 'draft');
  const dirExecClosed = diff.filter((r) => r.raw && r.raw.family === 'executed' && r.terminal.family === 'closed');
  const dirWithin = diff.filter((r) => r.raw && r.terminal.family === 'executed' && r.raw.family === 'executed');
  const dirNonCanon = diff.filter((r) => r.terminal.family === 'non-canonical');
  const dirClosedMoved = diff.filter((r) => r.raw && r.raw.family === 'closed' && r.terminal.family !== 'closed');
  const grouped = new Set([...dir2, ...dirDraftClosed, ...dirExecDraft, ...dirExecClosed, ...dirWithin, ...dirNonCanon, ...dirClosedMoved].map((r) => r.vol));
  const dirResidual = diff.filter((r) => !grouped.has(r.vol));

  console.log(`# request-status-recon 两读制全量扫描 · ref=${ref} · 卷数=${rows.length}`);
  console.log(`raw 六锚分层：closed=${rawTally.closed} executed族=${rawTally.executed} draft族=${rawTally.draft} proofed=${rawTally.proofed} post_prove=${rawTally.post_prove_dual_pass} stopped=${rawTally.stopped} 无状态行=${rawTally.none}`);
  console.log(`注记终值分层（有翻面行卷）：executed族=${termTally.executed} closed=${termTally.closed} draft族=${termTally.draft} proofed=${termTally.proofed} post_prove=${termTally.post_prove_dual_pass} 非态字链末=${termTally.non_canonical}`);
  console.log(`两读差异卷=${diff.length}（②向 raw-draft→executed族=${dir2.length} · raw-draft→closed=${dirDraftClosed.length} · raw-executed→draft=${dirExecDraft.length} · raw-executed→closed=${dirExecClosed.length} · executed族内值移=${dirWithin.length} · 非态字链末=${dirNonCanon.length} · raw-closed移出=${dirClosedMoved.length} · 残差=${dirResidual.length}）`);
  console.log('');
  console.log('## ②向差异清单（raw=draft 族 ∧ 注记终值=executed 族）');
  for (const r of dir2) {
    console.log(`- ${r.vol} | raw=${r.raw.anchor}:${r.raw.line} ${r.raw.value} | 终值=${r.terminal.class}:${r.terminal.line} ${r.terminal.via} ${r.terminal.value}`);
  }
  const groups = [
    ['raw-draft→closed', dirDraftClosed],
    ['raw-executed→draft', dirExecDraft],
    ['raw-executed→closed', dirExecClosed],
    ['executed族内值移', dirWithin],
    ['非态字链末', dirNonCanon],
    ['raw-closed移出', dirClosedMoved],
    ['残差', dirResidual],
  ];
  for (const [title, list] of groups) {
    if (list.length > 0) {
      console.log(`## ${title}（${list.length}）`);
      for (const r of list) {
        const term = r.terminal.value ?? `非态字(${r.terminal.label ?? ''})`;
        console.log(`- ${r.vol} | raw=${r.raw ? `${r.raw.anchor}:${r.raw.line} ${r.raw.value}` : '无状态行'} | 终值=${r.terminal.class}:${r.terminal.line} ${r.terminal.via ?? ''} ${term}`);
      }
    }
  }
  if (showAll) {
    console.log('## 每卷两读全表');
    for (const r of rows) {
      const raw = r.raw ? `${r.raw.anchor}:${r.raw.line} ${r.raw.value}` : '无状态行';
      const term = r.terminal
        ? r.terminal.value
          ? `${r.terminal.class}:${r.terminal.line} ${r.terminal.value}`
          : `${r.terminal.class}:${r.terminal.line} 非态字(${r.terminal.label ?? ''})`
        : '（无翻面行·随 raw）';
      console.log(`- ${r.vol} | raw=${raw} | 终值=${term}`);
    }
  }
  if (unread.length > 0) {
    console.error(`census leak: ref ${ref} 有 ${unread.length} 卷未被任何锚读到（raw 六锚与注记终值两读全空）：`);
    for (const r of unread) console.error(`- ${r.path}`);
    process.exit(1);
  }
}

main();
