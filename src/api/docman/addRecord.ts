import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectAddRecord, DocProjectAddRecordForm, DocmanId } from './types';

export function listProjectAddRecords(projectId: string | number): AxiosPromise<DocProjectAddRecord[]> {
  return request({ url: '/docman/project/add-record/list', method: 'get', params: { projectId } });
}

export function getProjectAddRecord(id: DocmanId): AxiosPromise<DocProjectAddRecord> {
  return request({ url: `/docman/project/add-record/${id}`, method: 'get' });
}

export function saveProjectAddRecord(data: DocProjectAddRecordForm): AxiosPromise<number> {
  return request({ url: '/docman/project/add-record', method: 'post', data });
}

export function deleteProjectAddRecord(ids: DocmanId[]): AxiosPromise<void> {
  return request({ url: `/docman/project/add-record/${ids.join(',')}`, method: 'delete' });
}
