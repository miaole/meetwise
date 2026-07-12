/** Web 探索器证明:allowlist 强制(安全)+ 抽取 + 注入 fetch + 优雅降级。 pnpm web-explore:prove */
import { isAllowed, extractMaterial, webExplore, type AllowedSource, type FetchedPage } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const allow: AllowedSource[] = [{ domain: 'allow.example', searchUrl: (q) => `https://allow.example/s?q=${encodeURIComponent(q)}` }];

A('allowlist:许可域 → 放行', isAllowed('https://allow.example/s?q=x', allow) === true);
A('allowlist:子域 → 放行', isAllowed('https://www.allow.example/p', allow) === true);
A('allowlist:非许可域 → 拒(安全铁律,不乱爬)', isAllowed('https://evil.com/x', allow) === false);
A('allowlist:malformed → 拒', isAllowed('not-a-url', allow) === false);

const mat = extractMaterial('Redis 缓存穿透和击穿的区别是什么？\n今天天气不错\n请描述滑动窗口限流的实现原理\n短\nRedis 缓存穿透和击穿的区别是什么？');
A('抽取:留像问题的、去非问题、去重', mat.length === 2 && mat.some((m) => m.includes('穿透')) && mat.some((m) => m.includes('滑动窗口')));

A('空 allowlist → [](优雅降级,只用本地)', (await webExplore('限流', [], async () => null)).length === 0);

let fetched: string[] = [];
const fakeFetch = async (url: string): Promise<FetchedPage> => { fetched.push(url); return { url, text: '请描述限流的实现原理？' }; };
const docs = await webExplore('限流', allow, fakeFetch);
A('许可源:注入 fetch 抓取 → SourceDoc(带 url+text)', docs.length === 1 && docs[0].url.includes('allow.example') && docs[0].text.length > 0);
A('只抓 allowlist 内的 URL(复核生效)', fetched.every((u) => u.includes('allow.example')));

const docs2 = await webExplore('x', allow, async () => { throw new Error('网络挂'); });
A('抓取失败 → 跳过不拖垮(降级)', docs2.length === 0);

console.log(`\n${fail === 0 ? '✓ Web 探索器(allowlist强制+抽取+注入fetch+降级)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
