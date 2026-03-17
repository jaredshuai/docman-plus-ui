import request from '@/utils/request';
import { DocArchivePackageVO } from './types';
import { AxiosPromise } from 'axios';

/**
 * 执行归档
 */
export function archiveProject(projectId: number): AxiosPromise<DocArchivePackageVO> {
  return request({ url: '/docman/archive/' + projectId, method: 'post' });
}

/**
 * 查询最新归档
 */
export function getArchive(projectId: number): AxiosPromise<DocArchivePackageVO> {
  return request({ url: '/docman/archive/' + projectId, method: 'get' });
}

/**
 * 查询归档历史列表
 */
export function listArchiveHistory(projectId: number): AxiosPromise<DocArchivePackageVO[]> {
  return request({ url: '/docman/archive/history/' + projectId, method: 'get' });
}
