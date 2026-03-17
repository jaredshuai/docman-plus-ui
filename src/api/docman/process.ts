import request from '@/utils/request';

export function bindProcess(projectId: number, definitionId: number) {
  return request({ url: '/docman/process/bind', method: 'post', params: { projectId, definitionId } });
}

export function startProcess(projectId: number) {
  return request({ url: '/docman/process/start/' + projectId, method: 'post' });
}

export function getProcessConfig(projectId: number) {
  return request({ url: '/docman/process/' + projectId, method: 'get' });
}
