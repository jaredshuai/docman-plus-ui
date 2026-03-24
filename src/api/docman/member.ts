import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface DocProjectMember {
  id: number;
  projectId: number;
  userId: number;
  roleType: string;
  createTime: string;
}

export interface DocProjectMemberBo {
  userId: number;
  roleType: string;
}

export function listMembers(projectId: number): AxiosPromise<DocProjectMember[]> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'get' });
}

export function addMember(projectId: number, data: DocProjectMemberBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'post', data });
}

export function removeMember(projectId: number, userId: number): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member/${userId}`, method: 'delete' });
}
