import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocArchivePackage, DocmanId } from './types';
import download from '@/plugins/download';

/**
 * 归档项目
 * @param projectId 项目ID
 */
export function archiveProject(projectId: string | number): AxiosPromise<void> {
  return request({
    url: `/docman/archive/${projectId}`,
    method: 'post'
  });
}

/**
 * 获取归档详情
 * @param projectId 项目ID
 */
export function getArchive(projectId: string | number): AxiosPromise<DocArchivePackage> {
  return request({
    url: '/docman/archive/' + projectId,
    method: 'get'
  });
}

/**
 * 获取归档历史列表
 * @param projectId 项目ID
 */
export function listArchive(projectId: string | number): AxiosPromise<DocArchivePackage[]> {
  return request({
    url: `/docman/archive/history/${projectId}`,
    method: 'get'
  });
}

/**
 * 下载归档包
 * @param archiveId 归档ID
 */
export function downloadArchive(archiveId: DocmanId): void {
  download.zip(`/docman/archive/${archiveId}/download`, `archive_${archiveId}.zip`);
}
