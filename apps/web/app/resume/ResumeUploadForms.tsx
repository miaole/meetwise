'use client';

import { type FormEvent, type ReactNode, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { uploadResumeAction, uploadResumeFileAction, type ResumeUploadActionResult } from './actions';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { Textarea } from '@/components/ui/textarea';
import { resumeFileAccept, resumeFileHelpText, resumeOcrPreviewBanner, type ResumeUploadCopyLabels } from '@/lib/resume/ocr-preview-ui';

type UploadAction = (formData: FormData) => Promise<ResumeUploadActionResult>;

function UploadButton({ pending, children, variant = 'default', pendingLabel }: { pending: boolean; children: string; variant?: 'default' | 'outline'; pendingLabel: string }) {
  return (
    <Button type="submit" variant={variant} disabled={pending} aria-busy={pending}>
      {pending ? <><Spinner className="size-4 border-current border-t-transparent" label="" />{pendingLabel}</> : children}
    </Button>
  );
}

/** Client-owned navigation closes the mobile Server Action redirect/pending failure mode; it never trusts client data. */
function UploadForm({
  action,
  children,
  button,
  pendingLabel,
  variant = 'default',
  className,
}: {
  action: UploadAction;
  children: ReactNode;
  button: string;
  pendingLabel: string;
  variant?: 'default' | 'outline';
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
      <UploadButton pending={pending} pendingLabel={pendingLabel} variant={variant}>{button}</UploadButton>
      {message ? <p id="resume-upload-error" role="alert" className="w-full text-sm text-destructive">{message}</p> : null}
    </form>
  );
}

export function ResumeUploadForms({ ocrPreview }: { ocrPreview: boolean }) {
  const tResumeUpload = useTranslations('resumeUpload');
  const labels: ResumeUploadCopyLabels = (key) => tResumeUpload(key);
  return (
    <>
      {ocrPreview ? (
        <p role="note" className="rounded-md border border-border bg-brand-soft/60 px-3 py-2 text-xs text-ink2">
          {resumeOcrPreviewBanner(labels)}
        </p>
      ) : null}
      <UploadForm action={uploadResumeFileAction} button={tResumeUpload('extractUpload')} pendingLabel={tResumeUpload('uploading')} variant="outline" className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border bg-secondary/40 p-4">
        <input
          type="file" name="file" accept={resumeFileAccept(ocrPreview)} required
          className="text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-1.5 file:text-sm file:font-medium"
        />
        <span className="w-full text-xs text-muted-foreground sm:w-auto">{resumeFileHelpText(ocrPreview, labels)}</span>
      </UploadForm>

      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{tResumeUpload('orPaste')}<span className="h-px flex-1 bg-border" /></div>

      <UploadForm action={uploadResumeAction} button={tResumeUpload('uploadResume')} pendingLabel={tResumeUpload('uploading')} className="space-y-4">
        <Textarea
          name="text"
          required
          minLength={20}
          placeholder={tResumeUpload('pastePlaceholder')}
          className="min-h-36"
        />
      </UploadForm>
    </>
  );
}
