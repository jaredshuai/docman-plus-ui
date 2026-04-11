import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectWorkspace, DocmanId } from './types';

export interface DocProjectNodeTaskCompleteBo {
  evidenceRef?: string;
}

export interface DocProjectAdvanceNodeBo {
  currentNodeCode: string;
}

export function getProjectWorkspace(projectId: DocmanId): AxiosPromise<DocProjectWorkspace> {
  return request({ url: `/docman/project/${projectId}/workspace`, method: 'get' });
}

export function completeProjectTask(projectId: DocmanId, taskRuntimeId: DocmanId, data?: DocProjectNodeTaskCompleteBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node-task/${taskRuntimeId}/complete`, method: 'post', data });
}

export function triggerProjectTaskPlugins(projectId: DocmanId, taskRuntimeId: DocmanId): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node-task/${taskRuntimeId}/trigger-plugins`, method: 'post' });
}

export function advanceProjectNode(projectId: DocmanId, data: DocProjectAdvanceNodeBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node/advance`, method: 'post', data });
}

export function triggerProjectEstimate(projectId: DocmanId): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/estimate/trigger`, method: 'post' });
}

export function triggerProjectExport(projectId: DocmanId): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/export/trigger`, method: 'post' });
}
