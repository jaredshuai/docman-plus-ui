import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectBalanceAdjustment, DocProjectBalanceAdjustmentForm } from './types';

export function getProjectLatestBalance(projectId: string | number): AxiosPromise<DocProjectBalanceAdjustment> {
  return request({ url: `/docman/project/${projectId}/balance/latest`, method: 'get' });
}

export function saveProjectBalance(projectId: string | number, data: DocProjectBalanceAdjustmentForm): AxiosPromise<number> {
  return request({ url: `/docman/project/${projectId}/balance`, method: 'post', data });
}
