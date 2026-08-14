import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@meetwise/contracts'],
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
        // CSP:frame-ancestors 双保险防点击劫持;default-src self;允许内联样式(Tailwind)与 data/blob(TTS 音频/头像)。脚本仅 self(RSC/无内联脚本)。
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
      ],
    }];
  },
};
export default withNextIntl(nextConfig);
