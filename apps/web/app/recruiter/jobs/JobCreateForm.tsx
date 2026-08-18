'use client';

import { type FormEvent, useEffect, useRef, useState, useTransition } from 'react';
import { Plus } from 'lucide-react';
import { createJobAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/Spinner';

/** Client-owned refresh prevents a successful B-end write being stranded in Server Action pending on mobile. */
export function JobCreateForm() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  // Reuse this key across ambiguous transport failures while this semantic form remains on screen. The database
  // binds it to the canonical payload, so a tampered/reused key cannot silently create different content.
  const idempotencyKeyRef = useRef<string | undefined>(undefined);
  const [idempotencyKey, setIdempotencyKey] = useState<string>();
  useEffect(() => {
    const next = globalThis.crypto.randomUUID();
    idempotencyKeyRef.current = next;
    setIdempotencyKey(next);
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!idempotencyKeyRef.current) return;
    const data = new FormData(event.currentTarget);
    setMessage(undefined);
    startTransition(async () => {
      const result = await createJobAction(data);
      if (!result.ok) { setMessage(result.message); return; }
      // A hard navigation asks the server for the canonical list and has a deterministic completion boundary.
      // `router.refresh()` leaves the old Server Action/RSC request in flight and was observed to strand both
      // desktop and mobile E2E at "发布中…" even though the job row had been written successfully.
      window.location.replace('/recruiter/jobs?updated=created');
    });
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-describedby={message ? 'create-job-error' : undefined}>
      <input type="hidden" name="idempotencyKey" value={idempotencyKey ?? ''} />
      <div className="space-y-2">
        <Label htmlFor="title">岗位名称</Label>
        <Input id="title" name="title" placeholder="如:高级后端工程师" required minLength={2} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="competencies">目标能力(逗号分隔)</Label>
        <Input id="competencies" name="competencies" placeholder="高并发, 分布式锁, 限流, 系统设计" />
      </div>
      <Button type="submit" disabled={pending || !idempotencyKey} aria-busy={pending}>
        {pending ? <><Spinner className="size-4 border-current border-t-transparent" label="" />发布中…</> : <><Plus className="size-4" />发布岗位</>}
      </Button>
      {message ? <p id="create-job-error" role="alert" className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
