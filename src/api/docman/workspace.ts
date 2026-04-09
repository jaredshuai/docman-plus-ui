import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectWorkspace } from './types';

export interface DocProjectNodeTaskCompleteBo {
  evidenceRef?: string;
}

export interface DocProjectAdvanceNodeBo {
  currentNodeCode: string;
}

export function getProjectWorkspace(projectId: string | number): AxiosPromise<DocProjectWorkspace> {
  return request({ url: `/docman/project/${projectId}/workspace`, method: 'get' });
}

export function completeProjectTask(projectId: string | number, taskRuntimeId: number, data?: DocProjectNodeTaskCompleteBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node-task/${taskRuntimeId}/complete`, method: 'post', data });
}

export function triggerProjectTaskPlugins(projectId: string | number, taskRuntimeId: number): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node-task/${taskRuntimeId}/trigger-plugins`, method: 'post' });
}

export function advanceProjectNode(projectId: string | number, data: DocProjectAdvanceNodeBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/node/advance`, method: 'post', data });
}

export function triggerProjectEstimate(projectId: string | number): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/estimate/trigger`, method: 'post' });
}

export function triggerProjectExport(projectId: string | number): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/export/trigger`, method: 'post' });
}
