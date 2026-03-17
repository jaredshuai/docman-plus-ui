import request from '@/utils/request';
import { DocPluginExecutionQuery, DocPluginExecutionVO, DocPluginInfoVO } from './types';
import { AxiosPromise } from 'axios';

/**
 * 查询已注册插件列表
 */
export function listPlugins(): AxiosPromise<DocPluginInfoVO[]> {
  return request({ url: '/docman/plugin/list', method: 'get' });
}

/**
 * 查询插件执行日志列表（分页）
 */
export function listPluginExecutions(query: DocPluginExecutionQuery): AxiosPromise<DocPluginExecutionVO[]> {
  return request({ url: '/docman/plugin/execution/list', method: 'get', params: query });
}
