import type { DocProjectBalanceAdjustment, DocProjectEstimateSnapshot } from '@/api/docman/types';

export function canSubmitBalance(snapshot?: DocProjectEstimateSnapshot): boolean {
  return Boolean(snapshot && typeof snapshot.id === 'number');
}

export function createBalanceForm(balance?: DocProjectBalanceAdjustment) {
  return {
    id: balance?.id,
    materialPrice: balance?.materialPrice,
    balanceRemark: balance?.balanceRemark ?? ''
  };
}
