/**
 * Web 探索器(CRAG fallback 的真抓取机制,纯逻辑 + 注入 fetch seam)。安全/合规承重点:**allowlist 强制**——
 *   只抓配置许可的域(尊重 ToS/版权:源由你配,不乱爬);真 HTTP 抓取是注入 seam(生产注真 fetch,gate 注 fake)。
 * 抓回的素材交 grounded-questions 出题门(标源 + 不照搬 transform + 去重 + 对能力)。空 allowlist → [](优雅降级,只用本地)。
 */
import type { SourceDoc } from './grounded-questions.ts';

export interface AllowedSource { domain: string; searchUrl: (q: string) => string }   // 配置:许可域 + 该域的检索 URL 构造
export interface FetchedPage { url: string; text: string }
export type FetchFn = (url: string) => Promise<FetchedPage | null>;                     // 注入:真 HTTP(生产)/ fake(gate)

/** allowlist 域校验(双保险):host 必须等于或是许可域的子域。malformed URL → 拒。 */
export function isAllowed(url: string, allowlist: AllowedSource[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
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
