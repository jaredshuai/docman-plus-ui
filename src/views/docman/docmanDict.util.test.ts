import { describe, expect, it } from 'vitest';
import { findDictOption, resolveDictLabel, resolveDictTagType } from './docmanDict.util';

describe('docman dict util', () => {
  const options: DictDataOption[] = [
    { label: '成功', value: 'ok', elTagType: 'success' },
    { label: '警告', value: 'warn', elTagType: 'warning' }
  ];

  it('finds dict option by stringified value', () => {
    expect(findDictOption(options, 'ok')?.label).toBe('成功');
    expect(findDictOption(options, 0)).toBeUndefined();
  });

  it('resolves label and tag type with safe fallbacks', () => {
    expect(resolveDictLabel(options, 'warn')).toBe('警告');
    expect(resolveDictLabel(options, 'missing', '未知')).toBe('missing');
    expect(resolveDictLabel(options, undefined, '未知')).toBe('未知');
    expect(resolveDictTagType(options, 'ok')).toBe('success');
    expect(resolveDictTagType(options, 'missing')).toBe('info');
  });
});
