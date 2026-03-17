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
