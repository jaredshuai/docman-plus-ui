import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectEstimateSnapshot } from './types';

export function getProjectLatestEstimate(projectId: string | number): AxiosPromise<DocProjectEstimateSnapshot> {
  return request({ url: `/docman/project/${projectId}/estimate/latest`, method: 'get' });
}
