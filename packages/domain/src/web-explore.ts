/**
 * Web 探索器(CRAG fallback 的真抓取机制,纯逻辑 + 注入 fetch seam)。安全/合规承重点:**allowlist 强制**——
 *   只抓配置许可的域(尊重 ToS/版权:源由你配,不乱爬);真 HTTP 抓取是注入 seam(生产注真 fetch,gate 注 fake)。
 * 抓回的素材交 grounded-questions 出题门(标源 + 不照搬 transform + 去重 + 对能力)。空 allowlist → [](优雅降级,只用本地)。
 *
 * SSRF 承重铁律(填 allowlist = 打开真外呼,必须先堵洞):
 *  - 协议仅 http/https;拒私有/环回/link-local IP(含云元数据 169.254.169.254)。
 *  - **重定向必须手动逐跳**(redirect:'manual'):allowlist 域可 302→私网/内网,自动跟随会被绕过。每一跳 URL 重新过 isAllowed。
 *  - DNS rebinding 残留风险:isAllowed 校验的是 host **字符串**,不是解析后的 IP。allowlist 域若把 DNS 指向私网 IP 仍可绕过。
 *    彻底堵需"解析 DNS→校验 IP→pin 该 IP 连接",属带 IO 的加固,不在纯逻辑层;此处标注,生产网络层/出口代理再兜。
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
    const [a, b] = o;
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
  // IPv6
  if (h.includes(':')) {
    if (h === '::1' || h === '::') return true;                          // 环回 / 未指定
    if (h.startsWith('fe80')) return true;                              // link-local fe80::/10
    if (h.startsWith('fc') || h.startsWith('fd')) return true;          // ULA fc00::/7
    if (h.startsWith('::ffff:') || h.startsWith('::')) return true;     // IPv4-mapped/兼容 → 保守拒(防绕过)
    return false;
  }
  return false;                                                          // 普通域名(DNS rebinding 风险见文件头注释)
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
export interface RawResponse { status: number; headers: { get(name: string): string | null }; text(): Promise<string> }
export type RawFetch = (url: string, init: { redirect: 'manual'; signal: AbortSignal }) => Promise<RawResponse>;

export interface SafeFetchOpts { maxRedirects?: number; timeoutMs?: number; maxBytes?: number }

/**
 * 把低层 fetch 包成"安全 FetchFn":**手动逐跳重定向 + 每跳 allowlist/私网复核 + 硬超时 + fail-soft**。
 * 这是 SSRF 的承重实现——allowlist 域 302→私网会被逐跳复核拦下(自动 redirect 会绕过)。任意异常/非 2xx/超跳数 → null(降级跳过,不拖垮整流程)。
 */
export function createSafeFetch(rawFetch: RawFetch, allowlist: AllowedSource[], opts: SafeFetchOpts = {}): FetchFn {
  const maxRedirects = opts.maxRedirects ?? 4;
  const timeoutMs = opts.timeoutMs ?? 8000;
  const maxBytes = opts.maxBytes ?? 8000;
  return async (startUrl: string): Promise<FetchedPage | null> => {
    try {
      let url = startUrl;
      for (let hop = 0; hop <= maxRedirects; hop++) {
        if (!isAllowed(url, allowlist)) return null;                          // 每一跳都复核(起始 URL + 每次重定向目标)
        const res = await rawFetch(url, { redirect: 'manual', signal: AbortSignal.timeout(timeoutMs) });  // 硬超时:慢/死源不阻塞
        if (res.status >= 300 && res.status < 400) {                         // 重定向:取 Location,下一跳循环开头重新校验
          const loc = res.headers.get('location');
          if (!loc) return null;
          url = new URL(loc, url).toString();                                // 相对跳转解析成绝对(再过 isAllowed)
          continue;
        }
        if (res.status < 200 || res.status >= 300) return null;              // 非 2xx → 跳过
        const text = (await res.text()).replace(/<[^>]+>/g, ' ').slice(0, maxBytes);   // 裸抓 + 主正文粗清洗(去标签)。readability 抽取后续再上
        return { url, text };
      }
      return null;                                                           // 跳数超限(重定向环/滥用)→ 跳过
    } catch { return null; }                                                 // 超时/网络挂/malformed → fail-soft
  };
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
