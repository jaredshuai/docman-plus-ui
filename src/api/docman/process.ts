import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProcessConfig } from './types';

export function bindProcess(projectId: string | number, definitionId: number): AxiosPromise<void> {
  return request({ url: '/docman/process/bind', method: 'post', params: { projectId, definitionId } });
}

export function startProcess(projectId: string | number): AxiosPromise<void> {
  return request({ url: '/docman/process/start/' + projectId, method: 'post' });
}

export function getProcessConfig(projectId: string | number): AxiosPromise<DocProcessConfig> {
  return request({ url: '/docman/process/' + projectId, method: 'get' });
}

/**
 * 获取流程定义列表
 */
export function listProcessDefinitions(): AxiosPromise<Array<{ id: number; name: string }>> {
  return request({ url: '/docman/process/definitions', method: 'get' });
}
