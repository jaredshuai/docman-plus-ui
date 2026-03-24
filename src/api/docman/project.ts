import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocProject, DocProjectQuery, DocProjectForm, PageResult } from './types';

export function listProject(query: DocProjectQuery): AxiosPromise<PageResult<DocProject>> {
  return request({ url: '/docman/project/list', method: 'get', params: query });
}

export function listMyProject(query?: Partial<DocProjectQuery>): AxiosPromise<DocProject[]> {
  return request({ url: '/docman/project/my', method: 'get', params: query });
}

export function getProject(id: number): AxiosPromise<DocProject> {
  return request({ url: '/docman/project/' + id, method: 'get' });
}

export function addProject(data: DocProjectForm): AxiosPromise<void> {
  return request({ url: '/docman/project', method: 'post', data });
}

export function updateProject(data: DocProjectForm): AxiosPromise<void> {
  return request({ url: '/docman/project', method: 'put', data });
}

export function delProject(ids: number[]): AxiosPromise<void> {
  return request({ url: '/docman/project/' + ids.join(','), method: 'delete' });
}
