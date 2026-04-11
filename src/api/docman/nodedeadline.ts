import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocmanId } from './types';

/** 节点时限配置 VO */
export interface NodeDurationVo {
  nodeId: number;
  nodeCode: string;
  nodeName: string;
  durationDays: number;
}

/** 节点截止日期 VO */
export interface NodeDeadlineVo {
  id: DocmanId;
  processInstanceId: DocmanId;
  projectId: DocmanId;
  projectName: string;
  nodeCode: string;
  nodeName: string;
  durationDays: number;
  deadline: string;
  reminderCount: number;
  lastRemindedAt: string;
}

/** 查询流程模板下所有节点（含 durationDays） */
export function listNodesByDefinition(definitionId: number): AxiosPromise<NodeDurationVo[]> {
  return request({ url: '/docman/node/deadline/nodes', method: 'get', params: { definitionId } });
}

/** 更新节点时限天数 */
export function updateNodeDuration(data: { nodeId: number; durationDays: number }): AxiosPromise<void> {
  return request({ url: '/docman/node/deadline/node-duration', method: 'put', data });
}

/** 查询项目截止日期列表 */
export function listNodeDeadlines(projectId: DocmanId): AxiosPromise<NodeDeadlineVo[]> {
  return request({ url: '/docman/node/deadline/list', method: 'get', params: { projectId } });
}

/** 修改截止日期 */
export function updateNodeDeadline(data: { id: DocmanId; deadline: string }): AxiosPromise<void> {
  return request({ url: '/docman/node/deadline', method: 'put', data });
}
