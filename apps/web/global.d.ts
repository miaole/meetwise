declare module '*.css';

// qrcode@1.5.4 自带类型缺失:补最小浏览器侧声明(分享海报 SharePoster 只用 toDataURL)。
declare module 'qrcode' {
  export interface QRCodeToDataURLOptions {
    margin?: number;
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: { dark?: string; light?: string };
  }
  export function toDataURL(text: string, options?: QRCodeToDataURLOptions): Promise<string>;
}

// #65（5E 批量清理刀·裁决项⑤「移出生产构建」形）：E2E 压测/守卫注入源构建期常量。
// 由 next.config.mjs 的 env 键在 **next build 时**从 process.env.E2E_UI_STRESS 内联为 '0'|'1'
// 字面量（webpack DefinePlugin 语义）：生产构建（无 E2E_UI_STRESS）内联 '0' → events 路由的
// __e2e_stream_* 分支静态假、经打包器死码剔除=压测数据源移出生产构建；e2e-ui runner
// （scripts/run-e2e-ui.mjs）build 与 start 两阶段均显式置 E2E_UI_STRESS='1' → 内联 '1'，
// 既有 spec 消费面零改零回归。运行时不再读 process.env.E2E_UI_STRESS（旧「仅靠 env 开关」面撤除）。
declare const __E2E_UI_STRESS__: '0' | '1';
