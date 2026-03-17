import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface DocProjectMember {
  id: number;
  projectId: number;
  userId: number;
  userName?: string;
  role: string;
  createTime: string;
}

export function listMembers(projectId: number): AxiosPromise<DocProjectMember[]> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'get' });
}

export function addMember(projectId: number, userId: number, role: string): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'post', data: { userId, role } });
}

export function removeMember(projectId: number, userId: number): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member/${userId}`, method: 'delete' });
}
