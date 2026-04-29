import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocmanId, DocTelecomWorkloadItem, DocTelecomWorkloadItemForm } from './types';

export function listWorkloadItem(): AxiosPromise<DocTelecomWorkloadItem[]> {
  return request({ url: '/docman/workload-item/list', method: 'get' });
}

export function getWorkloadItem(id: DocmanId): AxiosPromise<DocTelecomWorkloadItem> {
  return request({ url: `/docman/workload-item/${id}`, method: 'get' });
}

export function saveWorkloadItem(data: DocTelecomWorkloadItemForm): AxiosPromise<number> {
  return request({ url: '/docman/workload-item', method: 'post', data });
}

export function deleteWorkloadItem(ids: DocmanId[]): AxiosPromise<void> {
  return request({ url: `/docman/workload-item/${ids.join(',')}`, method: 'delete' });
}
