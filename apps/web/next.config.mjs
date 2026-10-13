import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@meetwise/contracts'],
  // #65（5E 批量清理刀·裁决项⑤「移出生产构建」形）：E2E 压测/守卫注入源（__e2e_stream_* 族）
  // 构建期内联开关——next build 时把 E2E_UI_STRESS 固化为字面量（env 键=DefinePlugin 语义，
  // 客户端/服务端包同内联）。生产构建（无该变量）内联 '0' → events 路由压测分支静态假+死码剔除
  // =数据源移出生产构建（撤除旧「仅靠运行时 env 开关」面）；e2e-ui runner（scripts/run-e2e-ui.mjs）
  // build(:199)/start(:216) 两阶段均显式置 '1' → 既有 e2e spec 消费面零改零回归。
  // 类型声明见 global.d.ts（declare const __E2E_UI_STRESS__）。
  env: { __E2E_UI_STRESS__: process.env.E2E_UI_STRESS === '1' ? '1' : '0' },
  // lib/页面用显式 .ts/.tsx 扩展(与 tsx gate 工具链一致);让 Next/webpack 也能解析,消除工具链冲突。
  webpack: (config) => {
    config.resolve.extensionAlias = {
      '.ts': ['.ts', '.tsx'],
      '.tsx': ['.tsx'],
      '.js': ['.js', '.jsx', '.ts', '.tsx'],
    };
    return config;
  },
  // **安全响应头(安全审计#5)**:防点击劫持(iframe 嵌套诱导"放弃面试/注销/购买")+ 纵深(即便将来某处引入 XSS 也有兜底)+ 传输安全。
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },                                   // 禁 iframe 嵌套 → 防点击劫持
        { key: 'X-Content-Type-Options', value: 'nosniff' },                         // 禁 MIME 嗅探
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self)' },   // 麦克风仅本站(语音面试),其余禁
        // #67(AUTHZ-HARDEN 5A-2):CSP 不再在此静态设置——旧静态 script-src 放行内联脚本(unsafe-inline
        // 形·无 nonce 白名单),且旧注释宣称「脚本仅 self(RSC/无内联脚本)」与实现不符(App Router 内联
        // flight/水合脚本+首页 JSON-LD 确为内联)。现由 middleware.ts 每请求发 nonce 形 CSP(响应头形
        // 唯一设置点;App Router 内联脚本按请求头 CSP 自动补 nonce,自持 JSON-LD 经 x-nonce 接线)。
        // 此处若再静态设置会形成双 CSP 头交集互相击穿,故整体移除;其余安全头(XFO/nosniff/HSTS 等)保留不动。
      ],
    }];
  },
};
export default withNextIntl(nextConfig);
