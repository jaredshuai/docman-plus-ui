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
