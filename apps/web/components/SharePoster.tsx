'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Loader2, ImageDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 裂变分享海报(设计语言 §5 运营层)——纯客户端,owner 主动生成自己的报告海报。
 *
 * 隐私铁律(对外可分享物,审计重点):
 * 海报只接收【聚合数值 + 维度名 + 通用文案 + 产品名/落地页】。
 * 不接收、也无法渲染任何简历原文 / 回答内容 / 点评 evidence / 邮箱姓名等 PII——
 * 上游 RSC 在 server 端就把白名单字段单独挑出来传进来(见 share/page.tsx),
 * 本组件的 props 类型里根本没有承载敏感数据的字段。
 *
 * 海报本体用内联 SVG(1080×1440,3:4)绘制:
 *  - 响应式:viewBox 缩放,屏幕上自适应宽度;导出时按 1080×1440 栅格化为 PNG。
 *  - reduced-motion 安全:静态矢量,无动画。
 *  - 下载:序列化 SVG → 离屏 canvas → PNG。QR 以 data-URL 内嵌,canvas 不被 taint,toBlob 可用。
 */

export type PosterDim = { name: string; value: number };

export function SharePoster({
  overall,
  dims,
  line,
  siteUrl,
  product = '知面',
}: {
  overall: number;
  dims: PosterDim[];
  line: string;
  siteUrl: string | null;
  product?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [qrErr, setQrErr] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(false);

  // 综合分兜底:即便上游异常给到 NaN/Infinity,也钳为 0–100 整数,海报绝不出现 "NaN"/破环。
  const safeOverall = Number.isFinite(overall) ? Math.max(0, Math.min(100, Math.round(overall))) : 0;

  // QR 生成:动态 import 保证 qrcode 只进客户端 bundle、且懒加载;失败也不影响海报展示。
  useEffect(() => {
    let alive = true;
    setQr(null);
    setQrErr(false);
    if (!siteUrl) {
      setQrErr(true);
      return undefined;
    }
    import('qrcode')
      .then((m) =>
        m.toDataURL(siteUrl, {
          margin: 1,
          width: 320,
          errorCorrectionLevel: 'M',
          color: { dark: '#1A1A1A', light: '#FFFFFF' },
        }),
      )
      .then((url) => {
        if (alive) setQr(url);
      })
      .catch(() => {
        /* QR 生成失败:标记失败态——海报仍可展示/下载,只是不含二维码,绝不卡死 */
        if (alive) setQrErr(true);
      });
    return () => {
      alive = false;
    };
  }, [siteUrl]);

  // 下载就绪态:QR 已生成或已确认失败才放行,避免导出「缺二维码」的半成品(运营层裂变入口失效)。
  const qrReady = qr !== null || qrErr;

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    setBusy(true);
    try {
      // 克隆并设死像素尺寸(屏幕展示用 style width:100%,栅格化需要确定的 1080×1440)。
      const clone = svg.cloneNode(true) as SVGSVGElement;
      clone.setAttribute('width', '1080');
      clone.setAttribute('height', '1440');
      clone.removeAttribute('style');
      const xml = new XMLSerializer().serializeToString(clone);
      const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setBusy(false);
          setFallback(true);
          return;
        }
        ctx.drawImage(img, 0, 0, 1080, 1440);
        canvas.toBlob((blob) => {
          if (!blob) {
            setBusy(false);
            setFallback(true);
            return;
          }
          const a = document.createElement('a');
          const objUrl = URL.createObjectURL(blob);
          a.href = objUrl;
          a.download = `meetwise-report-${safeOverall}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          // 下一帧再回收:部分浏览器(历史 Firefox)同步 revoke 会取消下载。
          setTimeout(() => URL.revokeObjectURL(objUrl), 0);
          setBusy(false);
        }, 'image/png');
      };
      img.onerror = () => {
        setBusy(false);
        setFallback(true);
      };
      img.src = src;
    } catch {
      setBusy(false);
      setFallback(true);
    }
  }

  const top = dims.slice(0, 5);

  // ── SVG 几何 ──────────────────────────────────────────────
  const W = 1080;
  const H = 1440;
  const ringCx = W / 2;
  const ringCy = 470;
  const ringSize = 260;
  const ringStroke = 24;
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - safeOverall / 100);

  const barX = 150;
  const barW = 780;
  const barTrackH = 14;
  const rowH = 66;
  const barsTop = 720;

  const serif = "'Source Han Serif SC','Songti SC',Georgia,'Times New Roman',serif";
  const sans = "'Source Han Sans SC','PingFang SC',-apple-system,system-ui,sans-serif";

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full max-w-[420px] overflow-hidden rounded-lg border shadow-[0_8px_40px_-20px_rgba(26,26,26,.4)]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label={`知面模拟面试练习反馈海报，反馈数值 ${safeOverall}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          {/* 背景:暖纸底 + 内框发丝线 */}
          <rect x="0" y="0" width={W} height={H} fill="#FAF8F4" />
          <rect x="32" y="32" width={W - 64} height={H - 64} rx="14" fill="#FFFFFF" stroke="#E3DCCF" strokeWidth="2" />

          {/* 顶部品牌行 */}
          <g transform="translate(96,128)">
            <circle cx="6" cy="-6" r="6" fill="#B5651D" />
            <text x="26" y="0" fontFamily={sans} fontSize="26" fontWeight="600" letterSpacing="4" fill="#B5651D">
              {product} · MEETWISE
            </text>
          </g>

          {/* 标题(衬线) */}
          <text x="96" y="232" fontFamily={serif} fontSize="62" fontWeight="700" fill="#1A1A1A">
            我的模拟面试练习反馈
          </text>
          <text x="98" y="280" fontFamily={sans} fontSize="26" fill="#8A8276">
            AI 模拟面试 · 仅供个人复盘
          </text>

          {/* 分数环(签名时刻) */}
          <g transform={`rotate(-90 ${ringCx} ${ringCy})`}>
            <circle cx={ringCx} cy={ringCy} r={ringR} fill="none" stroke="#F1ECE3" strokeWidth={ringStroke} />
            <circle
              cx={ringCx}
              cy={ringCy}
              r={ringR}
              fill="none"
              stroke="#B5651D"
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCirc}
              strokeDashoffset={ringOffset}
            />
          </g>
          <text x={ringCx} y={ringCy + 8} textAnchor="middle" fontFamily={sans} fontSize="104" fontWeight="800" fill="#B5651D">
            {safeOverall}
          </text>
          <text x={ringCx} y={ringCy + 54} textAnchor="middle" fontFamily={sans} fontSize="28" fill="#8A8276">
            / 100 本次练习反馈
          </text>

          {/* 能力维度条(中性序号标签 + 数值,无题面/点评/简历文字) */}
          {top.length > 0 ? (
            <text x={barX} y={barsTop - 38} fontFamily={sans} fontSize="26" fontWeight="600" fill="#3A3632">
              本次练习维度反馈
            </text>
          ) : null}
          {top.map((d, i) => {
            const y = barsTop + i * rowH;
            const v = Math.max(0, Math.min(100, Math.round(d.value)));
            return (
              <g key={i}>
                <text x={barX} y={y - 8} fontFamily={sans} fontSize="28" fill="#3A3632">
                  {d.name}
                </text>
                <text x={barX + barW} y={y - 8} textAnchor="end" fontFamily={sans} fontSize="28" fontWeight="700" fill="#B5651D">
                  {v}
                </text>
                <rect x={barX} y={y} width={barW} height={barTrackH} rx={barTrackH / 2} fill="#F1ECE3" />
                <rect x={barX} y={y} width={(barW * v) / 100} height={barTrackH} rx={barTrackH / 2} fill="#B5651D" />
              </g>
            );
          })}

          {/* 通用文案(衬线,无 PII) */}
          <text x={W / 2} y={1138} textAnchor="middle" fontFamily={serif} fontSize="36" fontStyle="italic" fill="#3A3632">
            {line}
          </text>

          <text x={W / 2} y={1186} textAnchor="middle" fontFamily={sans} fontSize="20" fill="#8A8276">
            仅供个人复盘 · 非能力认证 · 不得用于招聘、资格或录用判断
          </text>

          {/* 分隔线 */}
          <line x1="96" y1="1225" x2={W - 96} y2="1225" stroke="#E3DCCF" strokeWidth="2" />

          {/* 底部:二维码 + 落地页引导 */}
          <g transform="translate(96,1252)">
            <rect x="0" y="0" width="160" height="160" rx="10" fill="#FFFFFF" stroke="#E3DCCF" strokeWidth="2" />
            {qr ? <image href={qr} x="12" y="12" width="136" height="136" preserveAspectRatio="xMidYMid meet" /> : null}
            <text x="192" y="44" fontFamily={serif} fontSize="38" fontWeight="700" fill="#1A1A1A">
              {siteUrl ? '扫码查看项目页面' : '预览环境'}
            </text>
            <text x="192" y="88" fontFamily={sans} fontSize="25" fill="#8A8276">
              {siteUrl ? '逐题反馈 · 个人复盘 · 后续练习' : '未配置公开链接'}
            </text>
            <text x="192" y="138" fontFamily={sans} fontSize="23" fill="#B5651D" letterSpacing="1">
              {siteUrl ? siteUrl.replace(/^https?:\/\//, '') : '预览环境 · 未配置公开链接'}
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center gap-2">
        <Button onClick={downloadPng} disabled={busy || !qrReady} className="min-w-[200px]">
          {busy ? <Loader2 className="mw-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
          下载海报图片
        </Button>
        {!qrReady ? (
          <p className="text-xs text-muted-foreground">二维码生成中,稍候即可下载…</p>
        ) : fallback ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImageDown className="h-3.5 w-3.5" /> 自动导出受限,可直接长按 / 截图上方海报保存分享。
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">下载后即可分享到社交平台,也可直接截图保存。</p>
        )}
      </div>
    </div>
  );
}
