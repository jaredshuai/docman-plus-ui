import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocPluginInfo } from './types';

/**
 * 获取插件列表
 */
export function listPlugins(): AxiosPromise<DocPluginInfo[]> {
  return request({
    url: '/docman/plugin/list',
    method: 'get'
  });
}

export interface DocPluginExecutionLogQuery {
  projectId: number;
  processInstanceId?: number;
  nodeCode?: string;
  pluginId?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface DocPluginExecutionLogVo {
  id: number;
  projectId: number;
  processInstanceId: number;
  nodeCode: string;
  pluginId: string;
  pluginName: string;
  status: string; // success / failed
  costMs: number;
  generatedFileCount: number;
  errorMessage: string;
  requestSnapshot: string;
  resultSnapshot: string;
  createTime: string;
}

export function listExecutionLogs(params: DocPluginExecutionLogQuery): AxiosPromise<any> {
  return request({ url: '/docman/plugin/execution/list', method: 'get', params });
}

export interface DocPluginTriggerBo {
  processInstanceId: number;
  nodeCode?: string;
}

export function triggerExecution(data: DocPluginTriggerBo): AxiosPromise<void> {
  return request({ url: '/docman/plugin/execution/trigger', method: 'post', data });
}
