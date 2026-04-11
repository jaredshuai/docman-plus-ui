import request from '@/utils/request';
import type { DocPluginInfo, DocmanId, PageResult } from './types';

/**
 * 获取插件列表
 */
export function listPlugins(): Promise<DocPluginInfo[]> {
  return request({
    url: '/docman/plugin/list',
    method: 'get'
  });
}

export interface DocPluginExecutionLogQuery {
  projectId: DocmanId;
  processInstanceId?: DocmanId;
  nodeCode?: string;
  pluginId?: string;
  status?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface DocPluginExecutionLogVo {
  id: DocmanId;
  projectId: DocmanId;
  processInstanceId: DocmanId;
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

export function listExecutionLogs(params: DocPluginExecutionLogQuery): Promise<PageResult<DocPluginExecutionLogVo>> {
  return request({ url: '/docman/plugin/execution/list', method: 'get', params });
}

export interface DocPluginTriggerBo {
  processInstanceId: DocmanId;
  nodeCode?: string;
}

export function triggerExecution(data: DocPluginTriggerBo): Promise<void> {
  return request({ url: '/docman/plugin/execution/trigger', method: 'post', data });
}
