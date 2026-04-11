import type { DictDataForm, DictDataVO } from '@/api/system/dict/data/types';
import type { DictTypeForm, DictTypeVO } from '@/api/system/dict/type/types';

const DOCMAN_DICT_PREFIX = 'doc_';

export interface GovernanceRuleCard {
  key: string;
  title: string;
  description: string;
  count: number;
  route: string;
  actionText: string;
}

export interface GovernanceDictFilter {
  dictName?: string;
  dictType?: string;
}

export function isDocmanDictType(dictType?: string): boolean {
  return Boolean(dictType) && String(dictType).startsWith(DOCMAN_DICT_PREFIX);
}

export function filterDocmanDictTypes(types: DictTypeVO[], query: GovernanceDictFilter = {}): DictTypeVO[] {
  const nameKeyword = (query.dictName || '').trim().toLowerCase();
  const typeKeyword = (query.dictType || '').trim().toLowerCase();

  return [...types]
    .filter((item) => isDocmanDictType(item.dictType))
    .filter((item) => !nameKeyword || item.dictName?.toLowerCase().includes(nameKeyword))
    .filter((item) => !typeKeyword || item.dictType?.toLowerCase().includes(typeKeyword))
    .sort((left, right) => String(left.dictType).localeCompare(String(right.dictType)));
}

export function normalizeDictTypeForm(form: Partial<DictTypeForm> = {}): DictTypeForm {
  return {
    dictId: form.dictId,
    dictName: form.dictName || '',
    dictType: form.dictType || DOCMAN_DICT_PREFIX,
    remark: form.remark || ''
  };
}

export function normalizeDictDataForm(dictType = '', form: Partial<DictDataForm> = {}): DictDataForm {
  return {
    dictType: form.dictType || dictType,
    dictCode: form.dictCode,
    dictLabel: form.dictLabel || '',
    dictValue: form.dictValue || '',
    cssClass: form.cssClass || '',
    listClass: form.listClass || 'primary',
    dictSort: form.dictSort ?? 1,
    remark: form.remark || ''
  };
}

export function describeDictDataCount(data: DictDataVO[]): string {
  return `${data.length} 个字典项`;
}

export function buildGovernanceRuleCards(summary: { projectTypeCount: number; workflowTemplateCount: number }): GovernanceRuleCard[] {
  return [
    {
      key: 'project-type',
      title: '项目类型定义',
      description: '维护电信项目类型、客户类型映射和启停状态。',
      count: summary.projectTypeCount,
      route: '/docman/project-type',
      actionText: '进入项目类型'
    },
    {
      key: 'workflow-template',
      title: '流程模板编排',
      description: '维护节点、事项与插件绑定规则，控制项目工作流骨架。',
      count: summary.workflowTemplateCount,
      route: '/docman/workflow-template',
      actionText: '进入流程模板'
    }
  ];
}
