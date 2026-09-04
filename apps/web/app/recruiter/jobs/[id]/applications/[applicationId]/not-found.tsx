import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RecruiterApplicationNotFound() {
  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <h1 className="text-2xl font-bold">申请不存在</h1>
      <p className="mt-2 text-muted-foreground">
        这条申请不属于你的岗位，或编号无效。不会显示他人材料，也不会补一个分数。
      </p>
      <div className="mt-5 flex justify-center gap-3">
        <Button asChild><Link href="/recruiter/jobs">返回岗位</Link></Button>
        <Button asChild variant="outline"><Link href="/recruiter/talent">打开人才库</Link></Button>
      </div>
    </div>
  );
}
