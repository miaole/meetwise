'use client';
import { useFormStatus } from 'react-dom';
import { cn } from '@/lib/utils';

/**
 * 语言切换的提交按钮(客户端):server action 经 prop 传入,用 useFormStatus 给即时反馈。
 * 切换走 cookie + revalidate 有一次服务端往返,pending 时禁用 + 半透明 + cursor-wait,绝不"点了没反应"。
 */
function Inner({ active, label }: { active: boolean; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-busy={pending}
      aria-disabled={pending || undefined}
      disabled={pending}
      className={cn(
        'px-1.5 text-xs transition-colors',
        active ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground',
        pending && 'cursor-wait opacity-50',
      )}
    >
      {label}
    </button>
  );
}

export function LocaleSwitchButton({
  action,
  value,
  label,
  active,
}: {
  action: (formData: FormData) => void | Promise<void>;
  value: 'zh' | 'en';
  label: string;
  active: boolean;
}) {
  return (
    <form action={action} className="inline">
      <input type="hidden" name="locale" value={value} />
      <Inner active={active} label={label} />
    </form>
  );
}
