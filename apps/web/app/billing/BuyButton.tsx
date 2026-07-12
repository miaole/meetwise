'use client';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { createOrderAction } from './actions';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';

/**
 * 购买按钮(客户端):用 useTransition 触发 Server Action(createOrderAction),
 * pending 时禁用 + 转圈(防双扣),结果用 toast 显式反馈——money path 绝不静默"点了没反应"。
 */
export function BuyButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  function buy() {
    if (pending) return;
    start(async () => {
      const r = await createOrderAction(productId);
      if (r.ok) toast.success('订单已创建,额度即将到账');
      else toast.error(r.error ?? '下单失败,请重试');
    });
  }
  return (
    <Button
      type="button"
      onClick={buy}
      disabled={pending}
      aria-busy={pending}
      className="w-full disabled:cursor-not-allowed"
    >
      {pending && <Spinner className="size-4 border-current border-t-transparent" label="" />}
      {pending ? '下单中…' : '购买'}
    </Button>
  );
}
