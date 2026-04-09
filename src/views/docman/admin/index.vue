<template>
  <div class="app-container" data-testid="docman-admin-page">
    <el-page-header @back="$router.back()">
      <template #content>管理员管理</template>
    </el-page-header>

    <el-alert v-if="!isSuperAdmin" title="仅超级管理员可管理管理员账号" type="warning" show-icon :closable="false" style="margin-top: 16px" />

    <template v-else>
      <el-alert
        title="该页面仅管理 admin / superadmin 相关账号。内置超级管理员账号只读保护。"
        type="info"
        show-icon
        :closable="false"
        style="margin-top: 16px"
      />

      <el-card style="margin-top: 16px">
        <template #header>管理员筛选</template>
        <el-form :inline="true">
          <el-form-item label="角色">
            <el-select v-model="query.roleId" clearable placeholder="全部管理员角色" style="width: 240px" @change="loadUsers">
              <el-option v-for="role in adminRoles" :key="role.roleId" :label="role.roleName" :value="role.roleId" />
            </el-select>
          </el-form-item>
          <el-form-item label="账号">
            <el-input v-model="query.userName" placeholder="输入账号搜索" clearable @keyup.enter="loadUsers" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Plus" @click="handleAdd">新增管理员</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card style="margin-top: 16px" v-loading="loading">
        <template #header>管理员账号</template>
        <el-table :data="userList">
          <el-table-column prop="userName" label="账号" min-width="140" />
          <el-table-column prop="nickName" label="昵称" min-width="140" />
          <el-table-column prop="deptName" label="部门" min-width="140" />
          <el-table-column label="角色" min-width="180">
            <template #default="{ row }">
              <el-space wrap>
                <el-tag v-for="role in row.roles || []" :key="role.roleId">{{ role.roleName }}</el-tag>
              </el-space>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '0' ? 'success' : 'danger'">{{ row.status === '0' ? '正常' : '停用' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="180" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :disabled="!canMutateAdminUser(row)" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="warning" :disabled="!canMutateAdminUser(row)" @click="handleToggleStatus(row)">
                {{ row.status === '0' ? '停用' : '启用' }}
              </el-button>
              <el-button link type="danger" :disabled="!canMutateAdminUser(row)" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-dialog v-model="dialog.open" :title="dialog.title" width="640px">
        <el-form :model="form" label-width="90px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="账号">
                <el-input v-model="form.userName" :disabled="Boolean(form.userId)" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="昵称">
                <el-input v-model="form.nickName" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="密码" v-if="!form.userId">
                <el-input v-model="form.password" type="password" show-password />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="状态">
                <el-radio-group v-model="form.status">
                  <el-radio value="0">正常</el-radio>
                  <el-radio value="1">停用</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="form.email" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机">
                <el-input v-model="form.phonenumber" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="部门">
            <el-tree-select
              v-model="form.deptId"
              :data="deptOptions"
              :props="{ value: 'id', label: 'label', children: 'children' } as any"
              value-key="id"
              check-strictly
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="form.roleIds" multiple style="width: 100%">
              <el-option v-for="role in mutableAdminRoles" :key="role.roleId" :label="role.roleName" :value="String(role.roleId)" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="dialog.open = false">取消</el-button>
          <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { RoleVO } from '@/api/system/role/types';
import type { DeptTreeVO } from '@/api/system/dept/types';
import type { UserForm, UserVO } from '@/api/system/user/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getAdminDeptTree,
  getAdminUser,
  listAdminRoles,
  listAdminUsers,
  saveAdminUser,
  changeAdminUserStatus,
  deleteAdminUser
} from '@/api/docman/admin';
import { useUserStore } from '@/store/modules/user';
import { handleApiError } from '@/utils/error';
import { canMutateAdminUser, filterAdminRoles, normalizeAdminForm } from './admin.util';

const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.roles.includes('superadmin'));

const loading = ref(false);
const saving = ref(false);
const adminRoles = ref<RoleVO[]>([]);
const userList = ref<UserVO[]>([]);
const deptOptions = ref<DeptTreeVO[]>([]);
const dialog = reactive({ open: false, title: '新增管理员' });
const query = reactive<{ roleId?: string | number; userName?: string }>({ roleId: undefined, userName: '' });
const form = reactive<UserForm>(normalizeAdminForm({}));
const mutableAdminRoles = computed(() => adminRoles.value.filter((role) => role.roleKey === 'admin'));

async function loadRoles() {
  const res = await listAdminRoles();
  adminRoles.value = filterAdminRoles(res.rows || []);
}

async function loadUsers() {
  if (!isSuperAdmin.value) {
    userList.value = [];
    return;
  }
  loading.value = true;
  try {
    const roleId = query.roleId || adminRoles.value[0]?.roleId;
    const res = await listAdminUsers({ pageNum: 1, pageSize: 100, roleId, userName: query.userName || '' });
    userList.value = res.rows || [];
  } catch (error) {
    handleApiError(error, '加载管理员账号失败');
  } finally {
    loading.value = false;
  }
}

async function loadDeptTree() {
  deptOptions.value = await getAdminDeptTree();
}

function resetForm() {
  Object.assign(form, normalizeAdminForm({ roleIds: mutableAdminRoles.value[0] ? [String(mutableAdminRoles.value[0].roleId)] : [] }));
}

function handleAdd() {
  resetForm();
  dialog.title = '新增管理员';
  dialog.open = true;
}

async function handleEdit(row: UserVO) {
  if (!canMutateAdminUser(row)) return;
  const data = await getAdminUser(row.userId);
  Object.assign(form, normalizeAdminForm({ ...data.user, roleIds: data.roleIds }));
  dialog.title = '修改管理员';
  dialog.open = true;
}

async function handleSave() {
  saving.value = true;
  try {
    await saveAdminUser(normalizeAdminForm(form));
    ElMessage.success('管理员保存成功');
    dialog.open = false;
    await loadUsers();
  } catch (error) {
    handleApiError(error, '管理员保存失败');
  } finally {
    saving.value = false;
  }
}

async function handleToggleStatus(row: UserVO) {
  if (!canMutateAdminUser(row)) return;
  const nextStatus = row.status === '0' ? '1' : '0';
  try {
    await changeAdminUserStatus(row.userId, nextStatus);
    ElMessage.success(nextStatus === '0' ? '启用成功' : '停用成功');
    await loadUsers();
  } catch (error) {
    handleApiError(error, '状态修改失败');
  }
}

async function handleDelete(row: UserVO) {
  if (!canMutateAdminUser(row)) return;
  await ElMessageBox.confirm(`确认删除管理员账号「${row.userName}」？`, '提示', { type: 'warning' });
  try {
    await deleteAdminUser(row.userId);
    ElMessage.success('删除成功');
    await loadUsers();
  } catch (error) {
    handleApiError(error, '删除管理员失败');
  }
}

onMounted(async () => {
  await loadRoles();
  await loadDeptTree();
  await loadUsers();
});
</script>
