import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocArchivePackage } from './types';

/**
 * 归档项目
 * @param projectId 项目ID
 */
export function archiveProject(projectId: number): AxiosPromise<void> {
  return request({
    url: `/docman/archive/${projectId}`,
    method: 'post'
  });
}

/**
 * 获取归档详情
 * @param projectId 项目ID
 */
export function getArchive(projectId: number): AxiosPromise<DocArchivePackage> {
  return request({
    url: '/docman/archive/' + projectId,
    method: 'get'
  });
}

/**
 * 获取归档历史列表
 * @param projectId 项目ID
 */
export function listArchive(projectId: number): AxiosPromise<DocArchivePackage[]> {
  return request({
    url: '/docman/archive/list/' + projectId,
    method: 'get'
  });
}
