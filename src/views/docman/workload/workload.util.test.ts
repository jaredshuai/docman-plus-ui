import { describe, expect, it } from 'vitest';
import { createEmptyDetail, normalizeDetails, summarizeDetailNames } from './workload.util';

describe('workload util', () => {
  it('creates and normalizes detail forms', () => {
    expect(createEmptyDetail('1001')).toEqual({
      projectId: '1001',
      name: '',
      alias: '',
      price: undefined,
      remark: ''
    });

    expect(
      normalizeDetails(
        [
          { id: 1, projectId: 1001, projectAddRecordId: 2, name: '工作量A', alias: 'A', price: 10, remark: 'r1' },
          { id: 2, projectId: 1001, projectAddRecordId: 2, name: '工作量B', alias: '', price: 20, remark: '' }
        ],
        '1001'
      )
    ).toEqual([
      { id: 1, projectId: '1001', projectAddRecordId: 2, name: '工作量A', alias: 'A', price: 10, remark: 'r1' },
      { id: 2, projectId: '1001', projectAddRecordId: 2, name: '工作量B', alias: '', price: 20, remark: '' }
    ]);
  });

  it('builds readable summary for detail names', () => {
    expect(summarizeDetailNames(undefined)).toBe('暂无工作量明细');
    expect(summarizeDetailNames([{ projectId: 1, name: '工作量A', alias: '别名A' } as any])).toBe('别名A');
    expect(
      summarizeDetailNames([{ projectId: 1, name: '工作量A', alias: '' } as any, { projectId: 1, name: '工作量B', alias: '别名B' } as any])
    ).toBe('工作量A / 别名B');
  });
});
