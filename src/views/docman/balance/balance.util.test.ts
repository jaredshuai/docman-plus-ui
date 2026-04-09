import { describe, expect, it } from 'vitest';
import { canSubmitBalance, createBalanceForm } from './balance.util';

describe('balance util', () => {
  it('disables submit when estimate snapshot is missing', () => {
    expect(canSubmitBalance(undefined)).toBe(false);
    expect(canSubmitBalance({ id: 1, projectId: 2 })).toBe(true);
  });

  it('creates form defaults from latest balance record', () => {
    expect(createBalanceForm()).toEqual({ id: undefined, materialPrice: undefined, balanceRemark: '' });
    expect(createBalanceForm({ id: 3, projectId: 9, materialPrice: 18.5, balanceRemark: 'done' })).toEqual({
      id: 3,
      materialPrice: 18.5,
      balanceRemark: 'done'
    });
  });
});
