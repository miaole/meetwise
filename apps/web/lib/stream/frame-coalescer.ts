/**
 * 把高频业务事件压缩成每个浏览器帧至多一次 UI 提交。
 * 事件仍按顺序在流驱动中归约；这里只合并已经得到的不可变视图快照，
 * 因而不会丢失业务状态，只避免把每一个 token/progress 帧都变成 React commit。
 */
export interface FrameCoalescer<T> {
  offer(view: T): void;
  cancel(): void;
}

export type FrameScheduler = (flush: () => void) => unknown;
export type FrameCanceller = (handle: unknown) => void;

export function makeFrameCoalescer<T>(
  commit: (view: T) => void,
  schedule: FrameScheduler,
  cancelScheduled?: FrameCanceller,
): FrameCoalescer<T> {
  let pending: T | undefined;
  let hasPending = false;
  let scheduled = false;
  let generation = 0;
  let handle: unknown;

  const flush = (expectedGeneration: number) => {
    // cancel 后浏览器可能仍投递已排队的 rAF；generation 保证该旧回调无副作用。
    if (!scheduled || expectedGeneration !== generation) return;
    scheduled = false;
    handle = undefined;
    if (!hasPending) return;
    const newest = pending as T;
    pending = undefined;
    hasPending = false;
    commit(newest);
  };

  return {
    offer(view) {
      pending = view;
      hasPending = true;
      if (scheduled) return;
      scheduled = true;
      const scheduledGeneration = ++generation;
      handle = schedule(() => flush(scheduledGeneration));
    },
    cancel() {
      generation++;
      if (scheduled && cancelScheduled) cancelScheduled(handle);
      scheduled = false;
      handle = undefined;
      pending = undefined;
      hasPending = false;
    },
  };
}
