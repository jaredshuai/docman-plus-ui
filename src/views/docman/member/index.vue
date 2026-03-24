<template>
  <div class="p-4" data-testid="member-page">
    <el-card>
      <template #header>
        <div class="flex items-center justify-between">
          <span>项目成员管理</span>
          <el-button v-hasPermi="['docman:project:edit']" type="primary" @click="handleAdd">添加成员</el-button>
        </div>
      </template>

      <el-table :data="memberList" v-loading="loading" :row-key="(row) => row.id" data-testid="member-table">
        <el-table-column prop="userId" label="用户ID" width="120" />
        <el-table-column prop="roleType" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="proxy?.selectDictLabel(doc_member_role.value, row.roleType)?.cssClass || 'info'">
              {{ proxy?.selectDictLabel(doc_member_role.value, row.roleType)?.label || row.roleType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="加入时间" />
        <el-table-column label="操作" width="100">
          <template #default="{ row }">
            <el-button v-hasPermi="['docman:project:edit']" size="small" type="danger" plain @click="handleRemove(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加成员弹窗 -->
    <el-dialog v-model="dialogVisible" title="添加成员" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="用户ID" required>
          <el-input v-model.number="form.userId" placeholder="请输入用户ID" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="form.roleType">
            <el-option v-for="dict in doc_member_role" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button v-hasPermi="['docman:project:edit']" type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listMembers, addMember, removeMember, type DocProjectMember, type DocProjectMemberBo } from '@/api/docman/member';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_member_role } = toRefs(proxy?.useDict('doc_member_role') ?? {});

const route = useRoute();
const projectId = Number(route.params.projectId);

const loading = ref<boolean>(false);
const submitLoading = ref<boolean>(false);
const dialogVisible = ref<boolean>(false);
const memberList = ref<DocProjectMember[]>([]);
const form = ref<DocProjectMemberBo>({ userId: 0, roleType: 'viewer' });

const getList = async () => {
  loading.value = true;
  try {
    const res = await listMembers(projectId);
    memberList.value = res.data;
  } catch {
    ElMessage.error('获取成员列表失败');
  } finally {
    loading.value = false;
  }
};

const handleAdd = () => {
  form.value = { userId: 0, roleType: 'viewer' };
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  if (!form.value.userId) {
    ElMessage.warning('请输入用户ID');
    return;
  }
  submitLoading.value = true;
  try {
    await addMember(projectId, form.value);
    ElMessage.success('添加成功');
    dialogVisible.value = false;
    getList();
  } catch {
    ElMessage.error('添加失败');
  } finally {
    submitLoading.value = false;
  }
};

const handleRemove = async (row: DocProjectMember) => {
  await ElMessageBox.confirm(`确认移除用户 ${row.userId}？`, '提示', { type: 'warning' });
  try {
    await removeMember(projectId, row.userId);
    ElMessage.success('移除成功');
    getList();
  } catch {
    ElMessage.error('移除失败');
  }
};

onMounted(getList);
</script>
