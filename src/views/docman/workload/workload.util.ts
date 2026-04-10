import type { DocProjectAddRecordDetail, DocProjectAddRecordDetailForm } from '@/api/docman/types';

export function createEmptyDetail(projectId: string | number): DocProjectAddRecordDetailForm {
  return {
    projectId,
    name: '',
    alias: '',
    price: undefined,
    remark: ''
  };
}

export function normalizeDetails(details: DocProjectAddRecordDetail[] | undefined, projectId: string | number): DocProjectAddRecordDetailForm[] {
  if (!details || details.length === 0) {
    return [createEmptyDetail(projectId)];
  }
  return details.map((detail) => ({
    id: detail.id,
    projectId,
    projectAddRecordId: detail.projectAddRecordId,
    name: detail.name || '',
    alias: detail.alias || '',
    price: detail.price,
    remark: detail.remark || ''
  }));
}

export function summarizeDetailNames(details: DocProjectAddRecordDetail[] | undefined): string {
  if (!details || details.length === 0) {
    return '暂无工作量明细';
  }
  return details
    .map((detail) => detail.alias || detail.name || '未命名明细')
    .filter(Boolean)
    .join(' / ');
}
