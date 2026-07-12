'use client';
import { useActionState, useEffect, useRef } from 'react';
import { UserPlus, Send } from 'lucide-react';
import { inviteCandidateAction } from '@/app/recruiter/jobs/actions';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * 邀请候选人面试弹窗(B 端企业纵深):Dialog + Server Action(useActionState)。
 * 提交候选人邮箱 → 后端创建 invited 申请(同一面试引擎,严格隔离)。无死胡同:成功/未找到/失败都有 aria-live 文案。
 */
export function InviteCandidateDialog({ jobId }: { jobId: string }) {
  const [state, formAction, pending] = useActionState(inviteCandidateAction, {} as { ok?: boolean; msg?: string });
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state.ok]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm"><UserPlus className="size-4" />邀请候选人</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">邀请候选人面试</DialogTitle>
          <DialogDescription>
            填候选人邮箱(需对方已注册为求职者)。对方用<strong>同一 AI 引擎</strong>面试,你只会看到状态与评分,<strong>看不到面试内容</strong>(数据严格隔离)。
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-3">
          <input type="hidden" name="jobId" value={jobId} />
          <div className="space-y-2">
            <Label htmlFor="candidateEmail">候选人邮箱</Label>
            <Input id="candidateEmail" name="candidateEmail" type="email" placeholder="candidate@example.com" required />
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            <Send className="size-4" />{pending ? '邀请中…' : '发送邀请'}
          </Button>
          <p role="status" aria-live="polite" className={`text-sm ${state.msg ? (state.ok ? 'text-primary' : 'text-destructive') : 'text-muted-foreground'}`}>
            {state.msg ?? ''}
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
