import type { DocProjectBalanceAdjustment, DocProjectEstimateSnapshot } from '@/api/docman/types';

export function canSubmitBalance(snapshot?: DocProjectEstimateSnapshot): boolean {
  return Boolean(snapshot && typeof snapshot.id === 'number');
}

export function createBalanceForm(balance?: DocProjectBalanceAdjustment) {
  return {
    materialPrice: balance?.materialPrice,
    balanceRemark: balance?.balanceRemark ?? ''
  };
}

export function formatScopedCount(total?: number | null, included?: number | null): string {
  const totalText = typeof total === 'number' ? String(total) : '-';
  const includedText = typeof included === 'number' ? String(included) : typeof total === 'number' ? String(total) : '-';
  return `${totalText} / ${includedText}`;
}

export function isMissingProjectContextError(message: string): boolean {
  return ['项目不存在', '你无权访问该项目'].some((pattern) => message.includes(pattern));
}
