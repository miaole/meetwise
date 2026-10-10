/**
 * SSE-RESILIENCE #54（C6/W2）：作答草稿本地持久化纯函数层。
 * 键 `${resultId}:${questionId}`（questionIdentity 可用即用 questionId）；缺失时降级
 * `${resultId}:${turns.length}` ——降级键**只写不自动恢复**（防跨题误复用,注记A）。
 * storage 注入缝：默认 sessionStorage（SSR 守卫回退内存 no-op）；纯函数可注入 stub 确定性单测。
 *
 * 注记A（恢复钉）：恢复入框以「当前输入框为空」为前提（restoreDraftIfEmpty）——防存储落后于活内存、
 * 砸掉更新键入。防抖写入、提交成功清除、换 resultId 只清匹配前缀（clearByPrefix 不误伤他场）由面板层编排。
 */

export interface DraftStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** 枚举能力（真实 Storage 具备;stub 可省略——无枚举能力时 clearByPrefix 退化为 no-op）。 */
  length?: number;
  key?(index: number): string | null;
}

export interface DraftStore {
  /** 写草稿;空白文本等价清除（不存空草稿）。防抖由调用方负责。 */
  save(key: string, text: string): void;
  load(key: string): string | null;
  clear(key: string): void;
  /** 清除匹配前缀的全部键（resultId 切换面），返回清除的键列表；不误伤他场。 */
  clearByPrefix(prefix: string): string[];
}

export function makeDraftStore(storage: DraftStorageLike): DraftStore {
  return {
    save(key, text) {
      if (!text.trim()) { storage.removeItem(key); return; }
      storage.setItem(key, text);
    },
    load(key) {
      return storage.getItem(key);
    },
    clear(key) {
      storage.removeItem(key);
    },
    clearByPrefix(prefix) {
      const removed: string[] = [];
      const enumLen = typeof storage.length === 'number' && typeof storage.key === 'function' ? storage.length : 0;
      const keys: string[] = [];
      for (let i = 0; i < enumLen; i++) {
        const k = storage.key!(i);
        if (k && k.startsWith(prefix)) keys.push(k);
      }
      for (const k of keys) { storage.removeItem(k); removed.push(k); }
      return removed;
    },
  };
}

/** 精确键：questionIdentity 可用（questionId 在手）。 */
export function draftKeyExact(resultId: string, questionId: string): string {
  return `${resultId}:${questionId}`;
}

/** 降级键：questionId 缺失（turn 序号兜底,形如 `${resultId}:${turns.length}`）——**只写不自动恢复**（注记A）。 */
export function draftKeyFallback(resultId: string, turnIndex: number): string {
  return `${resultId}:${turnIndex}`;
}

/**
 * 注记A（恢复钉）：仅当当前输入框为空（活内存无更新内容）才恢复存储草稿——
 * 防存储落后于活内存、砸掉用户更新键入。降级键调用方**不得**调用本函数恢复。
 */
export function restoreDraftIfEmpty(currentAnswer: string, stored: string | null): string {
  if (currentAnswer.trim().length > 0) return currentAnswer;
  return stored && stored.trim().length > 0 ? stored : currentAnswer;
}

/** 浏览器 sessionStorage 适配（SSR/测试无 sessionStorage 时回退内存 no-op,不抛错）。 */
export function sessionDraftStorage(): DraftStorageLike {
  if (typeof sessionStorage === 'undefined') {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(k) ?? null,
      setItem: (k, v) => { mem.set(k, v); },
      removeItem: (k) => { mem.delete(k); },
      get length() { return mem.size; },
      key: (i) => Array.from(mem.keys())[i] ?? null,
    };
  }
  return sessionStorage;
}
