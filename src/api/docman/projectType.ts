import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectType, DocProjectTypeForm } from './types';

export function listProjectType(): AxiosPromise<DocProjectType[]> {
  return request({ url: '/docman/project-type/list', method: 'get' });
}

export function getProjectType(id: number): AxiosPromise<DocProjectType> {
  return request({ url: `/docman/project-type/${id}`, method: 'get' });
}

export function saveProjectType(data: DocProjectTypeForm): AxiosPromise<number> {
  return request({ url: '/docman/project-type', method: 'post', data });
}

export function deleteProjectType(ids: number[]): AxiosPromise<void> {
  return request({ url: `/docman/project-type/${ids.join(',')}`, method: 'delete' });
}
