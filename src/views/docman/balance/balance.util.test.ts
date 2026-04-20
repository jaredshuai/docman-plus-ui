import { describe, expect, it } from 'vitest';
import { canSubmitBalance, createBalanceForm, formatScopedCount, isMissingProjectContextError } from './balance.util';

describe('balance util', () => {
  it('disables submit when estimate snapshot is missing', () => {
    expect(canSubmitBalance(undefined)).toBe(false);
    expect(canSubmitBalance({ id: 1, projectId: 2 })).toBe(true);
  });

  it('creates form defaults from latest balance record', () => {
    expect(createBalanceForm()).toEqual({ materialPrice: undefined, balanceRemark: '' });
    expect(createBalanceForm({ id: 3, projectId: 9, materialPrice: 18.5, balanceRemark: 'done' })).toEqual({
      materialPrice: 18.5,
      balanceRemark: 'done'
    });
  });

  it('formats scoped counts with sensible fallbacks', () => {
    expect(formatScopedCount(5, 3)).toBe('5 / 3');
    expect(formatScopedCount(5, undefined)).toBe('5 / 5');
    expect(formatScopedCount(undefined, undefined)).toBe('- / -');
  });

  it('detects stale or inaccessible project context errors', () => {
    expect(isMissingProjectContextError('项目不存在')).toBe(true);
    expect(isMissingProjectContextError('你无权访问该项目')).toBe(true);
    expect(isMissingProjectContextError('项目经理页面加载失败')).toBe(false);
  });
});
