import request from '@/utils/request';
import { DocProcessConfigVO } from './types';
import { AxiosPromise } from 'axios';

/**
 * 绑定流程定义到项目
 */
export function bindProcess(projectId: number, definitionId: number) {
  return request({ url: '/docman/process/bind', method: 'post', params: { projectId, definitionId } });
}

/**
 * 启动项目流程
 */
export function startProcess(projectId: number) {
  return request({ url: '/docman/process/start/' + projectId, method: 'post' });
}

/**
 * 查询项目流程配置
 */
export function getProcessConfig(projectId: number): AxiosPromise<DocProcessConfigVO> {
  return request({ url: '/docman/process/' + projectId, method: 'get' });
}
