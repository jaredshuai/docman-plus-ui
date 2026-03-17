import request from '@/utils/request';

export function archiveProject(projectId: number) {
  return request({ url: '/docman/archive/' + projectId, method: 'post' });
}

export function getArchive(projectId: number) {
  return request({ url: '/docman/archive/' + projectId, method: 'get' });
}

export function listArchiveHistory(projectId: number) {
  return request({ url: '/docman/archive/history/' + projectId, method: 'get' });
}
