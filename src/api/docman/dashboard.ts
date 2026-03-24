import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/** 概览数据 */
export interface DashboardOverview {
  totalProjects: number;
  activeProjects: number;
  totalDocuments: number;
  pendingDocuments: number;
  overdueNodes: number;
  pluginFailCount: number;
}

/** 项目进度 */
export interface ProjectProgress {
  projectId: number;
  projectName: string;
  totalNodes: number;
  completedNodes: number;
  progressRate: number;
  totalDocuments: number;
  pendingDocuments: number;
}

/** 超期预警 */
export interface DeadlineAlert {
  projectId: number;
  projectName: string;
  nodeCode: string;
  nodeName: string;
  deadline: string;
  remainDays: number;
  reminderCount: number;
}

/** 插件统计 */
export interface PluginStats {
  pluginId: string;
  pluginName: string;
  successCount: number;
  failCount: number;
  totalCount: number;
  avgCostMs: number;
}

/** 工作台待办摘要 */
export interface TodoSummary {
  myProjectCount: number;
  activeProjectCount: number;
  overdueNodeCount: number;
  waitingTaskCount: number;
  copiedTaskCount: number;
  finishedTaskCount: number;
}

/** 获取概览数据 */
export function getOverview(): AxiosPromise<DashboardOverview> {
  return request({ url: '/docman/dashboard/overview', method: 'get' });
}

/** 获取工作台待办摘要 */
export function getTodoSummary(): AxiosPromise<TodoSummary> {
  return request({ url: '/docman/dashboard/todo-summary', method: 'get' });
}

/** 获取项目进度 */
export function getProjectProgress(): AxiosPromise<ProjectProgress[]> {
  return request({ url: '/docman/dashboard/project-progress', method: 'get' });
}

/** 获取超期预警 */
export function getDeadlineAlert(): AxiosPromise<DeadlineAlert[]> {
  return request({ url: '/docman/dashboard/deadline-alert', method: 'get' });
}

/** 获取插件统计 */
export function getPluginStats(): AxiosPromise<PluginStats[]> {
  return request({ url: '/docman/dashboard/plugin-stats', method: 'get' });
}
