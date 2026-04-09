import type { RoleVO } from '@/api/system/role/types';
import type { UserForm, UserVO } from '@/api/system/user/types';

export const ADMIN_ROLE_KEYS = ['superadmin', 'admin'];

export function filterAdminRoles(roles: RoleVO[]): RoleVO[] {
  return roles.filter((role) => ADMIN_ROLE_KEYS.includes(role.roleKey));
}

export function canMutateAdminUser(user: Pick<UserVO, 'userId'>): boolean {
  return String(user.userId) !== '1';
}

export function normalizeAdminForm(form: Partial<UserForm>): UserForm {
  return {
    userId: form.userId,
    id: form.id,
    deptId: form.deptId,
    userName: form.userName || '',
    nickName: form.nickName || '',
    password: form.password || '',
    phonenumber: form.phonenumber || '',
    email: form.email || '',
    sex: form.sex || '2',
    status: form.status || '0',
    remark: form.remark || '',
    postIds: form.postIds || [],
    roleIds: form.roleIds || []
  };
}
