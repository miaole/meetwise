/**
 * Web 探索器(CRAG fallback 的真抓取机制,纯逻辑 + 注入 fetch seam)。安全/合规承重点:**allowlist 强制**——
 *   只抓配置许可的域(尊重 ToS/版权:源由你配,不乱爬);真 HTTP 抓取是注入 seam(生产注真 fetch,gate 注 fake)。
 * 抓回的素材交 grounded-questions 出题门(标源 + 不照搬 transform + 去重 + 对能力)。空 allowlist → [](优雅降级,只用本地)。
 *
 * SSRF 承重铁律(填 allowlist = 打开真外呼,必须先堵洞):
 *  - 协议仅 http/https;拒私有/环回/link-local IP(含云元数据 169.254.169.254)。
 *  - **重定向必须手动逐跳**(redirect:'manual'):allowlist 域可 302→私网/内网,自动跟随会被绕过。每一跳 URL 重新过 isAllowed。
 *  - **流式读 + 字节上限承重在传输层**:逐 chunk 累计**字节**,超 maxBytes 即 cancel 读端并拒该源(超限=abort,非截断续用);
 *    未超限累计后单次 decode(跨 chunk 多字节字符不碎裂);无字节流的 text()-only 响应 fail-closed 拒。不再"先整读进内存再截断"。
 *  - **解析后 IP 校验缝已建**:opts.resolve(嵌入方注入的 DNS resolver;本包纯逻辑零 IO)在每一跳把解析出的全部 IP
 *    逐一过 isPrivateHost,任一私网即拒该源;生产组合根已注入 node:dns resolver。**未注入 resolve 的嵌入方仍残留
 *    DNS rebinding 窗**(allowlist 域可被解析到私网 IP 而不被本包发现);且 resolve-then-connect 仍有 TOCTOU
 *    重绑定残窗——彻底堵需"pin 该 IP 连接",属网络层加固,不在纯逻辑层,由生产出口/网络层再兜。
 *  - 判定面残留如实声明:fec0::/10(deprecated site-local,RFC 3879 已废址,如 fec0::1)字面放行;
 *    64:ff9b:1::/48(RFC 8215 local-use NAT64)字面放行(现行仅判 64:ff9b::/96);非规范 IPv4 字面(非点分十进制形)
 *    不入 IPv4 分支 → 按域名 fail-open——树内入口均经 URL hostname 规范化不可达,仅本函数被导出误用时构成 Exposure。
 */
import type { SourceDoc } from './grounded-questions.ts';

export interface AllowedSource { domain: string; searchUrl: (q: string) => string }   // 配置:许可域 + 该域的检索 URL 构造
export interface FetchedPage { url: string; text: string }
export type FetchFn = (url: string) => Promise<FetchedPage | null>;                     // 注入:真 HTTP(生产)/ fake(gate)

/**
 * 私网/环回/link-local 主机判定(SSRF 核心)。命中即拒——**不允许任何面向内网/云元数据的出呼**。
 * 保守取向:malformed IPv4(段>255)、0.0.0.0/8、组播(≥224)、IPv4-mapped IPv6 一律拒,宁可错杀不放过。
 */
export function isPrivateHost(host: string): boolean {
  const h = host.replace(/^\[/, '').replace(/\]$/, '').toLowerCase();     // 去 IPv6 方括号
  if (h === 'localhost' || h.endsWith('.localhost')) return true;
  // IPv4
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const o = m.slice(1, 5).map(Number);
    if (o.some((x) => x > 255)) return true;                              // 非法段 → 保守拒
    const a = o[0]!;
    const b = o[1]!;
    if (a === 0) return true;                                            // 0.0.0.0/8(本机/未指定)
    if (a === 127) return true;                                          // 环回 127.0.0.0/8
    if (a === 10) return true;                                           // 私有 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true;                    // 私有 172.16.0.0/12
    if (a === 192 && b === 168) return true;                             // 私有 192.168.0.0/16
    if (a === 169 && b === 254) return true;                             // link-local 169.254/16(云元数据 169.254.169.254!)
    if (a === 100 && b >= 64 && b <= 127) return true;                   // CGNAT 100.64.0.0/10
    if (a >= 224) return true;                                           // 组播/保留 224.0.0.0/4+
    return false;
  }
  // IPv6:先全展开规范化(逐 hextet 解析)再判定——禁止在未展开字面上叠 startsWith 类前缀补丁
  // (压缩形族系不可枚举,如 `0::ffff:a9fe:a9fe` 与 `::ffff:…` 同址异码,补丁式收紧必再漏)。
  if (h.includes(':')) {
    const g = ipv6Hextets(h);
    if (!g) return true;                                                     // malformed IPv6 → 保守拒(宁可错杀)
    if (g.slice(0, 7).every((x) => x === 0) && g[7]! <= 1) return true;      // :: 未指定 / ::1 环回
    const h0 = g[0]!;
    if (h0 >= 0xfe80 && h0 <= 0xfebf) return true;                           // link-local fe80::/10 全段(含 febf)
    if (h0 >= 0xfc00 && h0 <= 0xfdff) return true;                           // ULA fc00::/7
    if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return true; // IPv4-mapped ::ffff:0:0/96(全展开/压缩编码形同判)
    if (g.slice(0, 6).every((x) => x === 0)) return true;                    // IPv4-compatible ::/96 等前导零段 → 保守拒(防绕过)
    if (h0 === 0x64 && g[1] === 0xff9b && g.slice(2, 6).every((x) => x === 0)) return true; // NAT64 64:ff9b::/96
    return false;
  }
  return false;                                                            // 普通域名(resolver 缺省时 DNS rebinding 残窗见文件头注释)
}

/** IPv6 → 恰 8 个 hextet 数值(全展开规范化;内嵌 IPv4 尾形折算为两个 hextet;malformed → null)。纯解析零 IO。 */
function ipv6Hextets(host: string): number[] | null {
  let s = host;
  const v4 = s.match(/:(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);        // 内嵌 IPv4 尾形(如 ::ffff:192.168.1.1)
  if (v4 && v4.index !== undefined) {
    const o = [Number(v4[1]), Number(v4[2]), Number(v4[3]), Number(v4[4])];
    if (o.some((x) => x > 255)) return null;
    s = s.slice(0, v4.index) + `${(((o[0]! << 8) | o[1]!) >>> 0).toString(16)}:${(((o[2]! << 8) | o[3]!) >>> 0).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;                                        // 至多一个 '::'
  const head = halves[0] === '' ? [] : halves[0]!.split(':');
  const tail = halves.length === 2 ? (halves[1] === '' ? [] : halves[1]!.split(':')) : [];
  if (halves.length === 1 && head.length !== 8) return null;                 // 未压缩形必须恰 8 段
  const fill = 8 - head.length - tail.length;
  if (halves.length === 2 && fill < 1) return null;                          // '::' 必须至少吞一个零段
  const parts = [...head, ...new Array<string>(fill).fill('0'), ...tail];
  if (parts.length !== 8) return null;
  const out = parts.map((p) => (/^[0-9a-f]{1,4}$/.test(p) ? parseInt(p, 16) : NaN));
  return out.some((x) => Number.isNaN(x)) ? null : out;
}

/** allowlist 域校验(SSRF 门):协议仅 http/https;拒私网 host;host 必须等于或是许可域的子域。malformed URL → 拒。 */
export function isAllowed(url: string, allowlist: AllowedSource[]): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;      // 仅 http/https(拒 file/ftp/gopher/data…)
    const host = u.hostname.toLowerCase();
    if (isPrivateHost(host)) return false;                                    // 拒私网/环回/link-local/云元数据
    return allowlist.some((s) => host === s.domain.toLowerCase() || host.endsWith('.' + s.domain.toLowerCase()));
  } catch { return false; }
}

/** 从抓回文本抽"像问题"的素材(含问号/请/如何/什么/为什么/谈谈/区别…),去短去重,封顶。供改写出题(非照搬)。 */
export function extractMaterial(text: string, maxItems = 8): string[] {
  const looksLikeQuestion = (s: string) => /[?？]|如何|怎么|什么|为什么|请(谈谈|说说|描述|解释)|区别|实现原理|设计/.test(s);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of text.split(/[\n。;；]/)) {
    const s = raw.trim();
    if (s.length < 8 || !looksLikeQuestion(s)) continue;
    const key = s.replace(/\s+/g, '');
    if (seen.has(key)) continue;
    seen.add(key); out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
}

// 低层 HTTP 抽象(注真 fetch / gate 注 fake)——只暴露 createSafeFetch 需要的最小面,便于测重定向逻辑。
export interface RawResponse {
  status: number;
  headers: { get(name: string): string | null };
  text(): Promise<string>;
  /** 字节流面(与 undici `Response.body` 同形):流式读+字节上限的承重缝;缺席(text()-only 形)→ createSafeFetch fail-closed 拒。 */
  body?: ReadableStream<Uint8Array> | null;
}
export type RawFetch = (url: string, init: { redirect: 'manual'; signal: AbortSignal }) => Promise<RawResponse>;

export interface SafeFetchOpts {
  maxRedirects?: number;
  timeoutMs?: number;
  maxBytes?: number;
  /** 解析后 IP 私网校验缝:注入的 DNS resolver(纯逻辑层零 IO,本包不做 DNS 查询)。每跳把全部解析 IP 过 isPrivateHost,任一私网即拒。 */
  resolve?: (hostname: string) => Promise<string[]>;
}

/**
 * 有界深度检索不是通用搜索引擎，也不是让模型自由浏览网页：它只是同一条经过
 * allowlist/SSRF 门的多源证据获取路径。默认最多并发抓 3 个已授权源，整次取证
 * 最多带回 12,000 个字符；这样一次低置信 CRAG 分支的 egress 和 prompt 面积都可计算。
 */
export interface DeepExploreOpts {
  /** 单次最多尝试的 allowlist 源，硬上限 6。 */
  maxSources?: number;
  /** 单个源进入模型前的最大字符数。 */
  maxCharsPerSource?: number;
  /** 全部源合计进入模型前的最大字符数。 */
  maxTotalChars?: number;
  /** 系统生成的检索 query 的最大字符数；超出直接拒绝，不截断成另一个语义。 */
  maxQueryChars?: number;
}
export interface DeepExploreResult {
  docs: SourceDoc[];
  /** 实际发出的、已通过 allowlist 预检的请求数。 */
  attempted: number;
  /** 因 URL/响应不合规、空文本或预算而丢弃的源数。 */
  rejected: number;
  /** `invalid_query`/`no_allowed_sources`/`ok`，供调用方观测而非让模型猜。 */
  reason: 'invalid_query' | 'no_allowed_sources' | 'ok';
}

function boundedPositive(value: number | undefined, fallback: number, min: number, max: number): number {
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) return fallback;
  return value as number;
}

/**
 * 不把控制字符、空 query 或超长 query 交给站点检索端点。这里不做“截断后继续搜”，
 * 因为那会悄悄改变系统决定的证据主题；调用方应降级为本地题库/无素材出题。
 */
export function normalizeResearchQuery(query: string, maxChars = 256): string | null {
  if (typeof query !== 'string') return null;
  const normalized = query.normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!normalized || normalized.length > maxChars) return null;
  // 检索 query 会离开本系统；即使上游 planner 理应只给“能力名”，也不能把直接标识符
  // 当作站点检索词。这里是 egress 前的纵深门，不替代上游简历脱敏/权限控制。
  const directIdentifier = /[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?86[-\s]?)?1[3-9]\d{9}(?!\d)|(?<!\d)(?:\d{17}[\dXx]|\d{15})(?!\d)/;
  if (directIdentifier.test(normalized)) return null;
  return normalized;
}

/**
 * 给模型的来源文本必须以数据信封交付；URL、页面正文都不具有指令权限。控制字符会被
 * 丢弃，长度仍由调用方的总预算控制。此函数不是“靠 prompt 防注入”的替代品，系统 prompt
 * 也必须声明该信封不执行；它负责让来源边界可审计、不可伪造出宿主 data 围栏。
 */
export function formatUntrustedResearchMaterial(docs: SourceDoc[], maxChars = 12_000): string {
  let remaining = Math.max(0, maxChars);
  const out: string[] = [];
  for (let i = 0; i < docs.length && remaining > 0; i++) {
    const text = String(docs[i]?.text ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    if (!text) continue;
    const part = text.slice(0, remaining);
    remaining -= part.length;
    const url = String(docs[i]?.url ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    out.push(`[UNTRUSTED_RESEARCH_SOURCE index=${i + 1} url=${url}]\n${part}\n[/UNTRUSTED_RESEARCH_SOURCE]`);
  }
  return out.join('\n');
}

/**
 * 把低层 fetch 包成"安全 FetchFn":**手动逐跳重定向 + 每跳 allowlist/私网/解析后 IP 复核 + 整条跳链共享硬超时 + 流式字节上限 + fail-soft**。
 * 这是 SSRF 的承重实现——allowlist 域 302→私网会被逐跳复核拦下(自动 redirect 会绕过)。任意异常/非 2xx/超跳数/超字节限 → null(降级跳过,不拖垮整流程)。
 */
export function createSafeFetch(rawFetch: RawFetch, allowlist: AllowedSource[], opts: SafeFetchOpts = {}): FetchFn {
  const maxRedirects = opts.maxRedirects ?? 4;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const maxBytes = opts.maxBytes ?? 8000;
  return async (startUrl: string): Promise<FetchedPage | null> => {
    try {
      let url = startUrl;
      const deadline = Date.now() + timeoutMs;                               // 不是“每一跳各 8 秒”，整条 redirect chain 共用预算。
      for (let hop = 0; hop <= maxRedirects; hop++) {
        if (!isAllowed(url, allowlist)) return null;                          // 每一跳都复核(起始 URL + 每次重定向目标)
        let remainingMs = deadline - Date.now();                              // 每跳进跳取余(非每跳重置,整链共用 deadline);resolve 相位耗毕后再重算折减
        if (remainingMs <= 0) return null;
        // 解析后 IP 私网校验(resolver 注入缝):dns.lookup 无超时参,与整链剩余时长 Promise.race——到点即弃该源(fail-soft)。
        if (opts.resolve) {
          let raceTimer: ReturnType<typeof setTimeout> | undefined;
          const ips = await Promise.race([
            opts.resolve(new URL(url).hostname).catch(() => null),
            new Promise<null>((settle) => { raceTimer = setTimeout(() => settle(null), remainingMs); }),
          ]);
          if (raceTimer !== undefined) clearTimeout(raceTimer);
          if (ips === null) return null;                                      // 解析失败/超时 → 弃该源
          if (ips.some((ip) => isPrivateHost(ip))) return null;               // 任一解析 IP 私网 → 拒(DNS rebinding 收口)
          remainingMs = deadline - Date.now();                                // resolve 相位耗时折减:不重算则 fetch 仍持进跳时全预算(单跳最坏 2× 预算)
          if (remainingMs <= 0) return null;                                  // resolve 吃满余量 → 弃该源(与 race 到点同路)
        }
        const res = await rawFetch(url, { redirect: 'manual', signal: AbortSignal.timeout(remainingMs) });  // 整链硬超时:慢/死源不阻塞
        if (res.status >= 300 && res.status < 400) {                         // 重定向:取 Location,下一跳循环开头重新校验
          const loc = res.headers.get('location');
          if (!loc) return null;
          url = new URL(loc, url).toString();                                // 相对跳转解析成绝对(再过 isAllowed)
          continue;
        }
        if (res.status < 200 || res.status >= 300) return null;              // 非 2xx → 跳过
        // 流式读 + 字节计:逐 chunk 累计**字节**,超 maxBytes 即 cancel 并拒该源(超限=abort,非截断续用)——
        // 字节上限在传输层承重,不再"先整读进内存再截断"。未超限 → 累计后单次 decode(整段字节一次解码,
        // 跨 chunk 多字节字符不碎裂)。无 body 的 text()-only 形 → fail-closed 拒(上限诚实性优先)。
        if (!res.body) return null;
        const reader = res.body.getReader();
        const chunks: Uint8Array[] = [];
        let total = 0;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.byteLength;
          if (total > maxBytes) {                                            // 超限 → abort 拒源(拒该源,不返回半截文本)
            await reader.cancel().catch(() => undefined);
            return null;
          }
          chunks.push(value);
        }
        const buf = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) { buf.set(chunk, offset); offset += chunk.byteLength; }
        // 先整块剔除 script/style/comment，再去标签。仅“去标签”会把 `<script>ignore…</script>`
        // 的正文保留下来并送进模型；这不是完整 Readability，但能在不引入解析器的前提下收掉
        // 最常见的网页注入载体。剩余页面文字仍按不可信数据处理。(输入已被字节上限有界化:
        // decode 后字符数 ≤ 字节数 ≤ maxBytes,去标签只减不增,故无需再截断。)
        const text = new TextDecoder().decode(buf)
          .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
          .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
          .replace(/<!--[\s\S]*?-->/g, ' ')
          .replace(/<[^>]+>/g, ' ');
        return { url, text };
      }
      return null;                                                           // 跳数超限(重定向环/滥用)→ 跳过
    } catch { return null; }                                                 // 超时/网络挂/malformed → fail-soft
  };
}

/**
 * 受限“deep research”：对至多 N 个已授权官方源并发取证，再在进入 prompt 前实施每源和
 * 总字符预算。它不会跟随站外链接、不会递归抓页面、不会接收用户自由 URL，更不提供
 * 通用 WebSearch/浏览器能力。真实外呼仍须由 createSafeFetch 注入，因而每跳 SSRF 校验
 * 与超时在这里之前已经完成。
 */
export async function deepExplore(
  query: string, allowlist: AllowedSource[], fetchFn: FetchFn, opts: DeepExploreOpts = {},
): Promise<DeepExploreResult> {
  const maxQueryChars = boundedPositive(opts.maxQueryChars, 256, 1, 512);
  const safeQuery = normalizeResearchQuery(query, maxQueryChars);
  if (!safeQuery) return { docs: [], attempted: 0, rejected: 0, reason: 'invalid_query' };
  const maxSources = boundedPositive(opts.maxSources, 3, 1, 6);
  const maxCharsPerSource = boundedPositive(opts.maxCharsPerSource, 4_000, 128, 16_000);
  const maxTotalChars = boundedPositive(opts.maxTotalChars, 12_000, 128, 32_000);
  const sources = allowlist.slice(0, maxSources);
  if (sources.length === 0) return { docs: [], attempted: 0, rejected: 0, reason: 'no_allowed_sources' };

  // 固定上界≤6，Promise.all 将总墙钟时间收敛到最慢一个安全 fetch（而不是 6×8s 串行）。
  const fetched = await Promise.all(sources.map(async (source) => {
    let url: string;
    try { url = source.searchUrl(safeQuery); }
    catch { return { attempted: false, page: null as FetchedPage | null }; } // 配置源坏了只丢该源，不打断面试。
    if (!isAllowed(url, allowlist)) return { attempted: false, page: null as FetchedPage | null };
    const page = await fetchFn(url).catch(() => null);
    // 即使注入的是非 safe fetch，也不能信任返回的最终 URL。
    if (!page || !isAllowed(page.url, allowlist)) return { attempted: true, page: null as FetchedPage | null };
    return { attempted: true, page };
  }));

  let remaining = maxTotalChars;
  let rejected = Math.max(0, allowlist.length - sources.length);
  const docs: SourceDoc[] = [];
  for (const item of fetched) {
    if (!item.page || remaining <= 0) { rejected++; continue; }
    const text = item.page.text.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
    if (!text) { rejected++; continue; }
    const bounded = text.slice(0, Math.min(maxCharsPerSource, remaining));
    if (!bounded) { rejected++; continue; }
    remaining -= bounded.length;
    docs.push({ url: item.page.url, text: bounded });
  }
  return { docs, attempted: fetched.filter((item) => item.attempted).length, rejected, reason: 'ok' };
}

/** 探索:遍历 allowlist 源 → 构造 URL → allowlist 复核 → 注入 fetch 抓取 → 收成 SourceDoc[]。空 allowlist/抓取失败 → 跳过(降级)。 */
export async function webExplore(query: string, allowlist: AllowedSource[], fetchFn: FetchFn): Promise<SourceDoc[]> {
  const out: SourceDoc[] = [];
  for (const s of allowlist) {
    const url = s.searchUrl(query);
    if (!isAllowed(url, allowlist)) continue;                 // 只抓 allowlist 内(安全铁律)
    const page = await fetchFn(url).catch(() => null);        // 抓取失败不拖垮(降级)
    if (page && page.text.trim().length > 0) out.push({ url: page.url, text: page.text });
  }
  return out;
}
