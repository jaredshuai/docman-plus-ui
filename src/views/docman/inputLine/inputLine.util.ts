export function resolvePathProjectId(value: unknown): string | undefined {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const stringValue = String(rawValue ?? '').trim();
  return /^\d+$/.test(stringValue) && stringValue !== '0' ? stringValue : undefined;
}

export function paginateRows<T>(rows: T[], pageNum: number, pageSize: number): T[] {
  const safePageNum = Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : rows.length || 10;
  const start = (safePageNum - 1) * safePageSize;
  return rows.slice(start, start + safePageSize);
}
