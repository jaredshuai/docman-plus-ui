import request from '@/utils/request';
import { DocProject, DocProjectQuery, DocProjectForm, DocmanId, PageResult } from './types';

export function listProject(query: DocProjectQuery): Promise<PageResult<DocProject>> {
  return request({ url: '/docman/project/list', method: 'get', params: query });
}

export function listMyProject(query?: Partial<DocProjectQuery>): Promise<DocProject[]> {
  return request({ url: '/docman/project/my', method: 'get', params: query });
}

export function getProject(id: DocmanId): Promise<DocProject> {
  return request({ url: '/docman/project/' + id, method: 'get' });
}

export function addProject(data: DocProjectForm): Promise<void> {
  return request({ url: '/docman/project', method: 'post', data });
}

export function updateProject(data: DocProjectForm): Promise<void> {
  return request({ url: '/docman/project', method: 'put', data });
}

export function delProject(ids: DocmanId[]): Promise<void> {
  return request({ url: '/docman/project/' + ids.join(','), method: 'delete' });
}
