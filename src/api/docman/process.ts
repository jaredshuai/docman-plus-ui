import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProcessConfig } from './types';

export function bindProcess(projectId: number, definitionId: number): AxiosPromise<void> {
  return request({ url: '/docman/process/bind', method: 'post', params: { projectId, definitionId } });
}

export function startProcess(projectId: number): AxiosPromise<void> {
  return request({ url: '/docman/process/start/' + projectId, method: 'post' });
}

export function getProcessConfig(projectId: number): AxiosPromise<DocProcessConfig> {
  return request({ url: '/docman/process/' + projectId, method: 'get' });
}
