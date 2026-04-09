import request from '@/utils/request';
import type { RoleVO } from '@/api/system/role/types';
import type { UserForm, UserInfoVO, UserQuery, UserVO } from '@/api/system/user/types';
import type { DeptTreeVO } from '@/api/system/dept/types';
import type { PageResult } from './types';

export const ADMIN_ROLE_KEYS = ['superadmin', 'admin'];

export function listAdminRoles(): Promise<PageResult<RoleVO>> {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: { pageNum: 1, pageSize: 100, status: '0' }
  });
}

export function listAdminUsers(query: UserQuery): Promise<PageResult<UserVO>> {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  });
}

export function getAdminUser(userId?: string | number): Promise<UserInfoVO> {
  return request({
    url: '/system/user/' + (userId ?? ''),
    method: 'get'
  });
}

export function saveAdminUser(data: UserForm): Promise<void> {
  return request({
    url: '/system/user',
    method: data.userId ? 'put' : 'post',
    data
  });
}

export function changeAdminUserStatus(userId: string | number, status: string): Promise<void> {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: { userId, status }
  });
}

export function deleteAdminUser(userId: string | number): Promise<void> {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  });
}

export function getAdminDeptTree(): Promise<DeptTreeVO[]> {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  });
}
