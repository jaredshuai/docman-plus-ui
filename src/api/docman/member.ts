import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocmanId } from './types';

export interface DocProjectMember {
  id: DocmanId;
  projectId: DocmanId;
  userId: DocmanId;
  roleType: string;
  createTime: string;
}

export interface DocProjectMemberBo {
  userId: number;
  roleType: string;
}

export function listMembers(projectId: DocmanId): AxiosPromise<DocProjectMember[]> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'get' });
}

export function addMember(projectId: DocmanId, data: DocProjectMemberBo): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member`, method: 'post', data });
}

export function removeMember(projectId: DocmanId, userId: DocmanId): AxiosPromise<void> {
  return request({ url: `/docman/project/${projectId}/member/${userId}`, method: 'delete' });
}
