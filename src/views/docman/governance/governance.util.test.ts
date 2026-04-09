import { describe, expect, it } from 'vitest';
import type { DictTypeVO } from '@/api/system/dict/type/types';
import {
  buildGovernanceRuleCards,
  describeDictDataCount,
  filterDocmanDictTypes,
  isDocmanDictType,
  normalizeDictDataForm,
  normalizeDictTypeForm
} from './governance.util';

describe('docman governance util', () => {
  it('filters only docman dict types and supports keyword search', () => {
    const items = [
      { dictId: 1, dictName: '项目状态', dictType: 'doc_project_status', remark: '' },
      { dictId: 2, dictName: '客户类型', dictType: 'doc_customer_type', remark: '' },
      { dictId: 3, dictName: '通用状态', dictType: 'sys_normal_disable', remark: '' }
    ] as DictTypeVO[];

    expect(isDocmanDictType('doc_project_status')).toBe(true);
    expect(isDocmanDictType('sys_normal_disable')).toBe(false);
    expect(filterDocmanDictTypes(items).map((item) => item.dictType)).toEqual(['doc_customer_type', 'doc_project_status']);
    expect(filterDocmanDictTypes(items, { dictName: '项目' }).map((item) => item.dictType)).toEqual(['doc_project_status']);
  });

  it('normalizes dict forms with docman-safe defaults', () => {
    expect(normalizeDictTypeForm()).toEqual({
      dictId: undefined,
      dictName: '',
      dictType: 'doc_',
      remark: ''
    });

    expect(normalizeDictDataForm('doc_project_status', { dictLabel: '进行中' })).toEqual({
      dictType: 'doc_project_status',
      dictCode: undefined,
      dictLabel: '进行中',
      dictValue: '',
      cssClass: '',
      listClass: '',
      dictSort: 1,
      remark: ''
    });
  });

  it('builds governance rule cards and data descriptions', () => {
    expect(describeDictDataCount([])).toBe('0 个字典项');
    expect(
      buildGovernanceRuleCards({
        projectTypeCount: 2,
        workflowTemplateCount: 3
      })
    ).toEqual([
      expect.objectContaining({ key: 'project-type', count: 2, route: '/docman/project-type' }),
      expect.objectContaining({ key: 'workflow-template', count: 3, route: '/docman/workflow-template' })
    ]);
  });
});
