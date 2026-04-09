import request from '@/utils/request';
import type { DictDataForm, DictDataQuery, DictDataVO } from '@/api/system/dict/data/types';
import type { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/api/system/dict/type/types';
import type { PageResult } from './types';

export const DOCMAN_DICT_PREFIX = 'doc_';

export function listGovernanceDictTypes(query: Partial<DictTypeQuery> = {}): Promise<PageResult<DictTypeVO>> {
  return request({
    url: '/system/dict/type/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 200,
      dictName: '',
      dictType: '',
      ...query
    }
  });
}

export function saveGovernanceDictType(data: DictTypeForm): Promise<unknown> {
  return request({
    url: '/system/dict/type',
    method: data.dictId ? 'put' : 'post',
    data
  });
}

export function deleteGovernanceDictType(dictId: number | string): Promise<void> {
  return request({
    url: `/system/dict/type/${dictId}`,
    method: 'delete'
  });
}

export function refreshGovernanceDictCache(): Promise<void> {
  return request({
    url: '/system/dict/type/refreshCache',
    method: 'delete'
  });
}

export function listGovernanceDictData(query: Partial<DictDataQuery>): Promise<PageResult<DictDataVO>> {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: {
      pageNum: 1,
      pageSize: 200,
      dictName: '',
      dictType: '',
      dictLabel: '',
      ...query
    }
  });
}

export function saveGovernanceDictData(data: DictDataForm): Promise<unknown> {
  return request({
    url: '/system/dict/data',
    method: data.dictCode ? 'put' : 'post',
    data
  });
}

export function deleteGovernanceDictData(dictCode: number | string): Promise<void> {
  return request({
    url: `/system/dict/data/${dictCode}`,
    method: 'delete'
  });
}
