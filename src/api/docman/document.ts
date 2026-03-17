import request from '@/utils/request';

export function listDocument(projectId: number, query: any) {
  return request({ url: '/docman/document/list', method: 'get', params: { projectId, ...query } });
}

export function getDocument(id: number) {
  return request({ url: '/docman/document/' + id, method: 'get' });
}

export function uploadDocument(data: any) {
  return request({ url: '/docman/document/upload', method: 'post', data });
}
