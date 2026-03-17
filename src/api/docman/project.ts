import request from '@/utils/request';

export function listProject(query: any) {
  return request({ url: '/docman/project/list', method: 'get', params: query });
}

export function getProject(id: number) {
  return request({ url: '/docman/project/' + id, method: 'get' });
}

export function addProject(data: any) {
  return request({ url: '/docman/project', method: 'post', data });
}

export function updateProject(data: any) {
  return request({ url: '/docman/project', method: 'put', data });
}

export function delProject(ids: number[]) {
  return request({ url: '/docman/project/' + ids.join(','), method: 'delete' });
}
