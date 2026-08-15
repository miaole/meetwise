import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn 标准 cn():合并 className,后者覆盖前者的冲突 Tailwind 工具类。 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
