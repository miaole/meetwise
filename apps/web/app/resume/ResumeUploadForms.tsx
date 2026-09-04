'use client';

import { type FormEvent, type ReactNode, useState, useTransition } from 'react';
import { uploadResumeAction, uploadResumeFileAction, type ResumeUploadActionResult } from './actions';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { resumeFileAccept, resumeFileHelpText, resumeOcrPreviewBanner } from '@/lib/resume/ocr-preview-ui';

type UploadAction = (formData: FormData) => Promise<ResumeUploadActionResult>;

function UploadButton({ pending, children, variant = 'default' }: { pending: boolean; children: string; variant?: 'default' | 'outline' }) {
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-busy={pending}>
      {pending ? <><Spinner className="size-4 border-current border-t-transparent" label="" />上传中…</> : children}
    </Button>
  );
}

/** Client-owned navigation closes the mobile Server Action redirect/pending failure mode; it never trusts client data. */
function UploadForm({
  action,
  children,
  button,
  className,
}: {
  action: UploadAction;
  children: ReactNode;
  button: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setMessage(undefined);
    startTransition(async () => {
      const result = await action(data);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      // This deliberate hard navigation is the completion boundary. A unique URL prevents browser/RSC reuse, and
      // avoids racing router.replace() against router.refresh() after a Server Action response.
      window.location.replace('/resume?updated=uploaded');
    });
  };

  return (
    <form onSubmit={submit} className={className} aria-describedby={message ? 'resume-upload-error' : undefined}>
      {children}
      <UploadButton pending={pending} variant={button === '提取并上传' ? 'outline' : 'default'}>{button}</UploadButton>
      {message ? <p id="resume-upload-error" role="alert" className="w-full text-sm text-destructive">{message}</p> : null}
    </form>
  );
}

export function ResumeUploadForms({ ocrPreview }: { ocrPreview: boolean }) {
  return (
    <>
      {ocrPreview ? (
        <p role="note" className="rounded-md border border-border bg-brand-soft/60 px-3 py-2 text-xs text-ink2">
          {resumeOcrPreviewBanner()}
        </p>
      ) : null}
      <UploadForm action={uploadResumeFileAction} button="提取并上传" className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 p-4">
        <input
          type="file" name="file" accept={resumeFileAccept(ocrPreview)} required
          className="text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <span className="w-full text-xs text-muted-foreground sm:w-auto">{resumeFileHelpText(ocrPreview)}</span>
      </UploadForm>

      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />或粘贴文本<span className="h-px flex-1 bg-border" /></div>

      <UploadForm action={uploadResumeAction} button="上传简历" className="space-y-4">
        <Textarea
          name="text"
          required
          minLength={20}
          placeholder="在此粘贴简历原文(至少 20 字)…"
          className="min-h-36"
        />
      </UploadForm>
    </>
  );
}
