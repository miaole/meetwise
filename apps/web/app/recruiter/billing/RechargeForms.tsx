'use client';
/** B271 #271 片1(S1-C8)企业充值页客户端表单——线上/对公两通道下单(幂等键防网络重试重复下单)、
 *  开票资料维护(RLS 仅本人)、开票申请(仅 paid 订单·DB 触发器具名门·一单至多一张)。
 *  本文件为 B271 片1 EXEC 席 2026-10-10 全新书写(历史隔离档零恢复)。 */
import { useActionState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createOrderAction, saveInvoiceProfileAction, submitInvoiceRequestAction } from '@/app/billing/actions';

type ActionState = { ok?: boolean; error?: string; orderId?: string; amountCents?: number; channel?: string };

function randomKey(): string {
  return `entpay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** 企业商品下单(线上/对公两通道·幂等键防网络重试重复下单)。对公下单成功后展示订单号+备注指引。 */
export function EnterpriseRechargeForms({ productId, name, amountCents }: { productId: string; name: string; amountCents: number }) {
  const [onlineState, onlineAction] = useActionState(async (_prev: ActionState, _f: FormData) => (
    await createOrderAction(productId, { channel: 'online', idempotencyKey: randomKey() })
  ), {} as ActionState);
  const [offlineState, offlineAction] = useActionState(async (_prev: ActionState, _f: FormData) => (
    await createOrderAction(productId, { channel: 'offline', idempotencyKey: randomKey() })
  ), {} as ActionState);

  useEffect(() => {
    if (onlineState.ok) toast.success('线上订单已创建');
    else if (onlineState.error) toast.error(onlineState.error);
  }, [onlineState.ok, onlineState.error]);
  useEffect(() => {
    if (offlineState.ok) toast.success('对公订单已创建，请按指引转账');
    else if (offlineState.error) toast.error(offlineState.error);
  }, [offlineState.ok, offlineState.error]);

  const offline = offlineState.ok ? offlineState : null;
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <form action={onlineAction}><SubmitButton pendingLabel="下单中…">线上支付</SubmitButton></form>
        <form action={offlineAction}><Button type="submit" variant="outline">对公转账</Button></form>
      </div>
      {(onlineState.error || offlineState.error) && (
        <p role="status" aria-live="polite" className="text-xs text-destructive">{onlineState.error ?? offlineState.error}</p>
      )}
      {offline && (
        <div className="rounded border bg-accent/40 px-2 py-1 text-xs">
          <p>订单号 <span className="font-mono font-semibold">{offline.orderId}</span>（¥{((offline.amountCents ?? amountCents) / 100).toFixed(2)} · {name}）</p>
          <p className="text-muted-foreground">转账时请务必备注此订单号，运营确认到账后额度入企业桶（人工确认·双人分离）。</p>
        </div>
      )}
    </div>
  );
}

/** 开票资料维护(RLS 仅本人·approved recruiter)。 */
export function InvoiceProfileForm({ initial }: { initial: { title: string; taxId: string; addressPhone: string; bankAccount: string; email: string } }) {
  const [state, formAction] = useActionState(async (_prev: { ok?: boolean; error?: string }, f: FormData) => (
    await saveInvoiceProfileAction({
      title: String(f.get('title') ?? '').trim(),
      taxId: String(f.get('taxId') ?? '').trim(),
      addressPhone: String(f.get('addressPhone') ?? '').trim() || undefined,
      bankAccount: String(f.get('bankAccount') ?? '').trim() || undefined,
      email: String(f.get('email') ?? '').trim(),
    })
  ), {} as { ok?: boolean; error?: string });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) toast.success('开票资料已保存');
    else if (state.error) toast.error(state.error);
  }, [state.ok, state.error]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div className="space-y-1"><Label htmlFor="inv-title">抬头 *</Label><Input id="inv-title" name="title" defaultValue={initial.title} required /></div>
      <div className="space-y-1"><Label htmlFor="inv-tax">税号 *</Label><Input id="inv-tax" name="taxId" defaultValue={initial.taxId} required /></div>
      <div className="space-y-1"><Label htmlFor="inv-addr">地址电话</Label><Input id="inv-addr" name="addressPhone" defaultValue={initial.addressPhone} /></div>
      <div className="space-y-1"><Label htmlFor="inv-bank">开户行账号</Label><Input id="inv-bank" name="bankAccount" defaultValue={initial.bankAccount} /></div>
      <div className="space-y-1"><Label htmlFor="inv-email">收票邮箱 *</Label><Input id="inv-email" name="email" type="email" defaultValue={initial.email} required /></div>
      <div className="flex items-end"><SubmitButton pendingLabel="保存中…">保存开票资料</SubmitButton></div>
      <p role="status" aria-live="polite" className={`text-xs sm:col-span-2 ${state.error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {state.error ?? '资料仅本人可见；开票为线下流程，发票将由财务按资料开具。'}
      </p>
    </form>
  );
}

/** 开票申请入口(仅 paid 订单·DB 触发器具名门·一单至多一张)。 */
export function InvoiceRequestForm() {
  const [state, formAction] = useActionState(async (_prev: { ok?: boolean; error?: string }, f: FormData) => (
    await submitInvoiceRequestAction(String(f.get('orderId') ?? '').trim())
  ), {} as { ok?: boolean; error?: string });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok) { formRef.current?.reset(); toast.success('开票申请已提交'); }
    else if (state.error) toast.error(state.error);
  }, [state.ok, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2 border-t pt-4">
      <div className="space-y-1">
        <Label htmlFor="inv-order">已支付订单号 *</Label>
        <Input id="inv-order" name="orderId" placeholder="ord-…" className="w-64" required />
      </div>
      <SubmitButton pendingLabel="提交中…">申请开票</SubmitButton>
      <p role="status" aria-live="polite" className={`text-xs ${state.error ? 'text-destructive' : 'text-muted-foreground'}`}>
        {state.error ?? '仅已支付订单可申请；每笔订单限一次。'}
      </p>
    </form>
  );
}
