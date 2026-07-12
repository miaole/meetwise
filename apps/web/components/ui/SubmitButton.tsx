'use client';
import { useFormStatus } from 'react-dom';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

/**
 * Server Action 表单的提交按钮:用 useFormStatus 读所在 <form> 的提交态。
 * pending 时:**自动 disabled(防双提交)+ 内联转圈(复用 Spinner,reduced-motion 安全)+ 可选 pending 文案**,
 * 让"点了就有反馈"成为默认,而不是每个表单各写一遍。包裹 shadcn Button,variant/size/className 原样透传。
 *
 * 必须渲染在 <form action={serverAction}> 的子树里(useFormStatus 读最近一层 form 的状态)。
 * 同一 form 内多个 SubmitButton 会同时进入 pending(符合"整表单提交中、全部锁定"的语义)。
 */
export interface SubmitButtonProps extends ButtonProps {
  /** pending 时替换按钮文案(如「提交中…」「登录中…」);不传则保留原 children,仅加转圈。 */
  pendingLabel?: React.ReactNode;
}

export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  className,
  type = 'submit',
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;
  return (
    <Button
      type={type}
      aria-busy={pending}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      // disabled 的 shadcn Button 自带 pointer-events-none;额外标注 cursor-not-allowed 表意一致。
      className={cn(isDisabled && 'cursor-not-allowed', className)}
      {...props}
    >
      {pending && (
        // currentColor 描边 → 在任意按钮变体(amber 实心/描边/ghost)上都清晰可见;
        // border-t-transparent 形成缺口转圈;mw-spin 在 reduced-motion 下静止为完整环。
        // 转圈本身设为装饰性(aria-hidden):加载语义由按钮的 aria-busy 承担,避免重复播报。
        <span aria-hidden>
          <Spinner className="size-4 border-current border-t-transparent" label="" />
        </span>
      )}
      {pending && pendingLabel != null ? pendingLabel : children}
    </Button>
  );
}
