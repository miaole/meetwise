'use client';

import { useActionState } from 'react';
import type { PrivacyPreviewReceipt } from '@meetwise/contracts';
import { requestPrivacyPreviewAction, type PreviewActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

function ReceiptView({ receipt }: { receipt: PrivacyPreviewReceipt }) {
  return (
    <div className="space-y-3 rounded-md border border-border p-3" data-testid="privacy-preview-receipt">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{receipt.editionLabel}</Badge>
        <span className="text-sm text-muted-foreground">状态 {receipt.status} · {receipt.completeness}</span>
      </div>
      <p className="text-sm">这不是跨存储生产删除 SLO。外部对象存储、缓存、观测副本和备份仍按盘点未闭合。</p>
      <p className="text-xs text-muted-foreground">请求 {receipt.requestId}{receipt.localSweepRequestId ? ` · 本地 sweep ${receipt.localSweepRequestId}` : ''}</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-1 pr-2 font-medium">sink</th>
              <th className="py-1 pr-2 font-medium">轨道</th>
              <th className="py-1 font-medium">处置</th>
            </tr>
          </thead>
          <tbody>
            {receipt.sinks.map((row) => (
              <tr key={row.sink} className="border-b border-border/60">
                <td className="py-1 pr-2 font-mono text-xs">{row.sink}</td>
                <td className="py-1 pr-2">{row.track}</td>
                <td className="py-1">{row.disposition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PreviewErasureForm({ initialReceipt }: { initialReceipt?: PrivacyPreviewReceipt | null }) {
  const [state, formAction] = useActionState(requestPrivacyPreviewAction, {} as PreviewActionState);
  const receipt = state.receipt ?? initialReceipt ?? null;

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scope">预览范围</Label>
          <select
            id="scope"
            name="scope"
            defaultValue="interview_data"
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="interview_data">一份面试（启动投影围栏，不含队列载荷清除）</option>
            <option value="account_data">账户记忆向量块（启动 0125 本地 sweep，不等于账户删完）</option>
            <option value="resume_data">简历（只盘点，不启破坏性 sweep）</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subjectId">面试标识（仅面试范围需要）</Label>
          <Input id="subjectId" name="subjectId" maxLength={128} autoComplete="off" className="h-11 text-base" />
        </div>
        <SubmitButton pendingLabel="正在生成预览回执…">请求预览删除回执</SubmitButton>
        <p role="status" aria-live="polite" className={`text-sm ${state.error ? 'text-destructive' : 'text-muted-foreground'}`}>
          {state.error ?? (state.ok ? '已生成预览版回执，不是生产删除完成。' : '')}
        </p>
      </form>
      {receipt ? <ReceiptView receipt={receipt} /> : null}
    </div>
  );
}
