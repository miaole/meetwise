'use client';

/**
 * I3 JOB-MGMT（#220/#219·裁决①③⑦）：岗位管理面板（client）——编辑表单切换、下线（二次确认）、
 * 显式重试路由。动作全部经 Server Action（actions.ts）→ PATCH/POST 契约端点；反馈文案无死胡同。
 */
import { useState } from 'react';
import { closeJobAction, retryJobRouteAction, updateJobAction } from '../actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface JobAdminPanelProps {
  jobId: string;
  title: string;
  description: string;
  competencies: string[];
  /** 岗位当前 status（open 才显示下线入口）。 */
  jobStatus: string;
  /** 最新 revision 路由状态（route_unresolved 才显示重试入口·#219）。 */
  routeStatus: string | null;
}

export function JobAdminPanel({ jobId, title, description, competencies, jobStatus, routeStatus }: JobAdminPanelProps) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string>();

  const runAction = async (fn: () => Promise<{ ok: boolean; message?: string }>) => {
    setPending(true);
    setMessage(undefined);
    try {
      const r = await fn();
      setMessage(r.message ?? (r.ok ? '已完成。' : '操作失败，请稍后重试。'));
      // 硬导航取服务端权威状态（沿 JobCreateForm 先例：Server Action 后 router.refresh 会悬挂）。
      if (r.ok) window.location.reload();
    } finally {
      setPending(false);
    }
  };

  const submitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    data.set('jobId', jobId);
    void runAction(() => updateJobAction(data));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setEditing((v) => !v)}>
          {editing ? '收起编辑' : '编辑岗位'}
        </Button>
        {jobStatus === 'open' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => {
              // 关闭=二次确认后调 close 端点（§1-①）。
              if (globalThis.confirm('确认下线该岗位？下线后候选人不可再投递。')) void runAction(() => closeJobAction(jobId));
            }}
          >
            下线岗位
          </Button>
        ) : null}
        {routeStatus === 'route_unresolved' ? (
          <Button type="button" variant="secondary" size="sm" disabled={pending} onClick={() => void runAction(() => retryJobRouteAction(jobId))}>
            重试路由
          </Button>
        ) : null}
      </div>
      {editing ? (
        <form onSubmit={submitEdit} className="space-y-3 rounded-md border border-input p-3">
          <input type="hidden" name="jobId" value={jobId} />
          <div className="space-y-2">
            <Label htmlFor="edit-title">岗位名称</Label>
            <Input id="edit-title" name="title" defaultValue={title} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">岗位描述(JD·可选)</Label>
            <Textarea id="edit-description" name="description" maxLength={8000} rows={5} defaultValue={description} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-competencies">目标能力(逗号分隔)</Label>
            <Input id="edit-competencies" name="competencies" defaultValue={competencies.join(', ')} />
          </div>
          <Button type="submit" disabled={pending} aria-busy={pending}>保存编辑</Button>
          <p className="text-xs text-muted-foreground">保存后语义字段变化会自动触发岗位重新路由。</p>
        </form>
      ) : null}
      {message ? <p role="alert" className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
