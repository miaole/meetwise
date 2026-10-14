/**
 * 类型声明：同名 .mjs 脚本的导出面（严格 TS 门要求 import '.mjs' 有声明可解析，fail-closed 拒隐式 any）。
 * 形状以脚本源为单一真相；导出新增/形参变更须随源同步。
 */
export interface PublicPreviewWriteSurface {
  id: string;
  kind: string;
  method: string;
  path: string;
  exposure: string;
  [key: string]: unknown;
}

export declare function isPreviewControlledWriteSurface(surface: unknown): boolean;
export declare function inventoryPath(repoRoot: string): string;
export declare function listPublicHttpWriteSurfaces(manifest: unknown): PublicPreviewWriteSurface[];
export declare function validatePublicPreviewWriteInventory(
  manifest: unknown,
  opts: { repoRoot?: string },
): { valid: boolean; errors: string[]; stats: Record<string, unknown> };
