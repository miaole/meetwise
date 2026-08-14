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
