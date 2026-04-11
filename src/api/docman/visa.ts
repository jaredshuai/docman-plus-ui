import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectVisa, DocProjectVisaForm, DocmanId } from './types';

export function listProjectVisas(projectId: string | number): AxiosPromise<DocProjectVisa[]> {
  return request({ url: '/docman/project/visa/list', method: 'get', params: { projectId } });
}

export function getProjectVisa(id: DocmanId): AxiosPromise<DocProjectVisa> {
  return request({ url: `/docman/project/visa/${id}`, method: 'get' });
}

export function saveProjectVisa(data: DocProjectVisaForm): AxiosPromise<number> {
  return request({ url: '/docman/project/visa', method: 'post', data });
}

export function deleteProjectVisa(ids: DocmanId[]): AxiosPromise<void> {
  return request({ url: `/docman/project/visa/${ids.join(',')}`, method: 'delete' });
}
