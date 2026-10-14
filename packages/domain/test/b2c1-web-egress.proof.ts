/** B2C1 外呼 egress 加固证明(#119:流式读+超限 abort+解析后 IP 私网校验+isPrivateHost 同刀收紧;#80 默认关联动在 worker 侧)。纯注入零真网·零 DNS 查询。 pnpm -C packages/domain prove:b2c1-web-egress */
import { readFileSync } from 'node:fs';
import { isPrivateHost, createSafeFetch, type AllowedSource, type RawFetch, type RawResponse } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const allow: AllowedSource[] = [{ domain: 'allow.example', searchUrl: (q) => `https://allow.example/s?q=${encodeURIComponent(q)}` }];
const enc = new TextEncoder();

// fake 字节流:可指定切分点(直证跨 chunk 多字节不碎裂)+cancel 探针(直证超限 abort 真取消读端)。
const byteStream = (bytes: Uint8Array, splits: number[] = [], onCancel?: () => void): ReadableStream<Uint8Array> => {
  const cuts = [...new Set([0, ...splits.filter((x) => x > 0 && x < bytes.length), bytes.length])].sort((a, b) => a - b);
  let i = 1;
  return new ReadableStream<Uint8Array>({
    pull(c) { if (i >= cuts.length) { c.close(); return; } c.enqueue(bytes.subarray(cuts[i - 1]!, cuts[i]!)); i++; },
    cancel() { onCancel?.(); },
  });
};
const respStream = (body: string, opts: { splits?: number[]; onCancel?: () => void } = {}): RawResponse => ({
  status: 200, headers: { get: () => null }, text: async () => body, body: byteStream(enc.encode(body), opts.splits, opts.onCancel),
});

// ① 大体量 body 流式超 maxBytes → null 且读端被 cancel(超限=abort 拒源直证;旧"整读再 slice"形对此形返回截断文本非 null)。
// 切块加密至 512B:abort 发生在源耗尽 close 之前(仍有未入队 chunk),cancel 传播可确定直证——
// (spec:对已 close 流 cancel 不再回调底层;真 undici 中景流同本形,cancel 必达读端。)
{
  let cancelled = false;
  const big = '<p>' + 'x'.repeat(6000) + '</p>';
  const splits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((k) => k * 512);
  const p = await createSafeFetch(async () => respStream(big, { splits, onCancel: () => { cancelled = true; } }), allow, { maxBytes: 5000 })('https://allow.example/s?q=x');
  A('egress①:流式读超 maxBytes → null 且 reader.cancel() 被调(超限=abort 拒源,非截断续用)', p === null && cancelled);
}

// ② 未超限(含跨 chunk 多字节字符中腰切分:切点 5/10 落在 3 字节 CJK 字符内部) → 文本完整+去标签语义与现状一致(标签→空格)+零 U+FFFD 残形
{
  const p = await createSafeFetch(async () => respStream('<p>请描述令牌桶限流的实现原理？</p>', { splits: [5, 10] }), allow)('https://allow.example/s?q=x');
  A('egress②:未超限流式读 → 文本完整+去标签一致+跨 chunk 多字节零碎裂(无 U+FFFD)', !!p && p.text === ' 请描述令牌桶限流的实现原理？ ' && !p.text.includes('\uFFFD') && !p.text.includes('<'));
}

// ②bis 字节计直证:解码后字符数(4)≤ maxBytes(10) 但字节计(12)超限 → null(码元计/slice 形对此跨界形上限不触发=必漏)
{
  const p = await createSafeFetch(async () => respStream('五五五五', { splits: [5] }), allow, { maxBytes: 10 })('https://allow.example/s?q=x');
  A('egress②bis:maxBytes 计字节——字符数 4 ≤ 10 而 12 字节 > 10 → null(码元计必漏的形)', p === null);
}

// ③ 解析后 IP 私网校验直证(本臂 fake 携 body 流非 text()-only 形,排除与⑥混淆):任一解析 IP 私网 → 拒该源
const privArm = (ips: string[]) => createSafeFetch(async () => respStream('<p>ok</p>'), allow, { resolve: async () => ips })('https://allow.example/s?q=x');
A('egress③a:resolve 返 10.0.0.5 → 拒(解析后 IP 校验直证)', (await privArm(['93.184.216.34', '10.0.0.5'])) === null);
A('egress③b:resolve 返 169.254.169.254(云元数据) → 拒', (await privArm(['169.254.169.254'])) === null);
A('egress③c:resolve 返 febf::1 → 拒(link-local fe80::/10 全段·旧 startsWith 前缀形放行)', (await privArm(['febf::1'])) === null);
A('egress③d:resolve 返 0:0:0:0:0:ffff:a9fe:a9fe → 拒(IPv4-mapped 全展开形·旧形放行)', (await privArm(['0:0:0:0:0:ffff:a9fe:a9fe'])) === null);
A('egress③e:resolve 返 0::ffff:a9fe:a9fe → 拒(压缩编码形——字面前缀补丁必漏形)', (await privArm(['0::ffff:a9fe:a9fe'])) === null);
A('egress③f:resolve 返 64:ff9b::a9fe:a9fe → 拒(NAT64 64:ff9b::/96·旧形放行)', (await privArm(['64:ff9b::a9fe:a9fe'])) === null);

// ④ resolve 返全公网 IP → 放行(不误杀)
{
  const p = await createSafeFetch(async () => respStream('<p>请描述滑动窗口限流？</p>'), allow, { resolve: async () => ['93.184.216.34', '2606:4700::1111'] })('https://allow.example/s?q=x');
  A('egress④:resolve 返全公网 IP(v4+v6) → 放行不误杀', !!p && p.text.includes('滑动窗口'));
}

// ⑤ resolve 抛错 → null(fail-soft 同全函数基调;resolve 相位与整链 remainingMs Promise.race,到点同路弃源)
A('egress⑤:resolve 抛错 → null(fail-soft)', (await createSafeFetch(async () => respStream('<p>ok</p>'), allow, { resolve: async () => { throw new Error('dns down'); } })('https://allow.example/s?q=x')) === null);

// ⑥ text()-only RawResponse(无 body 流)→ null(fail-closed 直证:上限诚实性优先;生产真 Response 恒有 body)
{
  const textOnly: RawResponse = { status: 200, headers: { get: () => null }, text: async () => '<p>hello</p>' };
  A('egress⑥:text()-only 响应(无 body 流)→ null(fail-closed)', (await createSafeFetch(async () => textOnly, allow)('https://allow.example/s?q=x')) === null);
}

// ⑦ 重定向第二跳解析 IP 私网 → null 且第二跳 fetch 未发(每跳重校验直证)
{
  const seen: string[] = [];
  let resolveCalls = 0;
  const raw: RawFetch = async (u) => {
    seen.push(u);
    return u === 'https://allow.example/s?q=x'
      ? { status: 302, headers: { get: (n: string) => (n === 'location' ? 'https://allow.example/b' : null) }, text: async () => '', body: byteStream(enc.encode('')) }
      : respStream('<p>ok</p>');
  };
  const p = await createSafeFetch(raw, allow, { resolve: async () => { resolveCalls++; return resolveCalls >= 2 ? ['10.0.0.9'] : ['93.184.216.34']; } })('https://allow.example/s?q=x');
  A('egress⑦:重定向第二跳解析 IP 私网 → null 且第二跳 fetch 未发(每跳重校验)', p === null && seen.length === 1 && resolveCalls === 2);
}

// ⑧ 静态断言:旧自白句族在 web-explore.ts 零命中(rg 缺席匹配·零命中方过=「实现与注释矛盾」残留已除)
{
  const src = readFileSync(new URL('../src/web-explore.ts', import.meta.url), 'utf8');
  A('egress⑧:web-explore.ts 旧自白句族(「校验的是 host 字符串」/「不是解析后的 IP」)零命中', !src.includes('校验的是 host') && !src.includes('不是解析后的 IP'));
}

// ⑨/⑩ isPrivateHost 收刀直证(纯函数面:盲区四形全拒 + 既有判定零劣化)
A('egress⑨:isPrivateHost 收刀——febf::1 / 0:0:0:0:0:ffff:a9fe:a9fe / 0::ffff:a9fe:a9fe / 64:ff9b::a9fe:a9fe 全拒(全展开规范化后判定)', isPrivateHost('febf::1') && isPrivateHost('0:0:0:0:0:ffff:a9fe:a9fe') && isPrivateHost('0::ffff:a9fe:a9fe') && isPrivateHost('64:ff9b::a9fe:a9fe'));
A('egress⑩:isPrivateHost 既有判定零劣化——:: / ::1 / [fe80::1] / fd00::1 / ::ffff:192.168.1.1 拒;2001:db8::1 / 2606:4700::1111 公网放行', isPrivateHost('::') && isPrivateHost('::1') && isPrivateHost('[fe80::1]') && isPrivateHost('fd00::1') && isPrivateHost('::ffff:192.168.1.1') && !isPrivateHost('2001:db8::1') && !isPrivateHost('2606:4700::1111'));

console.log(`\n${fail === 0 ? '✓ B2C1 egress 加固(流式字节上限/超限abort/解析后IP校验/IPv6全展开收刀)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
