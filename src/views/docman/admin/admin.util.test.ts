import { describe, expect, it } from 'vitest';
import type { RoleVO } from '@/api/system/role/types';
import { canMutateAdminUser, filterAdminRoles, normalizeAdminForm } from './admin.util';

describe('docman admin util', () => {
  it('filters only admin and superadmin roles', () => {
    const roles = [
      {
        roleId: 1,
        roleName: '超管',
        roleKey: 'superadmin',
        roleSort: 1,
        dataScope: '1',
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        status: '0',
        delFlag: '0',
        flag: false,
        admin: true
      },
      {
        roleId: 2,
        roleName: '管理员',
        roleKey: 'admin',
        roleSort: 2,
        dataScope: '1',
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        status: '0',
        delFlag: '0',
        flag: false,
        admin: true
      },
      {
        roleId: 3,
        roleName: '普通用户',
        roleKey: 'docman_user',
        roleSort: 3,
        dataScope: '1',
        menuCheckStrictly: true,
        deptCheckStrictly: true,
        status: '0',
        delFlag: '0',
        flag: false,
        admin: false
      }
    ] as RoleVO[];

    expect(filterAdminRoles(roles).map((item) => item.roleKey)).toEqual(['superadmin', 'admin']);
  });

  it('protects built-in super admin user and normalizes admin form', () => {
    expect(canMutateAdminUser({ userId: 1 } as any)).toBe(false);
    expect(canMutateAdminUser({ userId: 2 } as any)).toBe(true);
    expect(normalizeAdminForm({ userName: 'admin01', roleIds: ['2'] })).toEqual({
      userId: undefined,
      id: undefined,
      deptId: undefined,
      userName: 'admin01',
      nickName: '',
      password: '',
      phonenumber: '',
      email: '',
      sex: '2',
      status: '0',
      remark: '',
      postIds: [],
      roleIds: ['2']
    });
  });
});
