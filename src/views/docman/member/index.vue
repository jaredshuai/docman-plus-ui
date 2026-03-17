<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>项目成员管理</template>
    </el-page-header>

    <el-row :gutter="10" class="mb8" style="margin-top: 16px;">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['docman:member:add']">添加成员</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="memberList">
      <el-table-column label="用户ID" align="center" prop="userId" />
      <el-table-column label="用户名" align="center" prop="userName" />
      <el-table-column label="角色" align="center" prop="role">
        <template #default="{ row }">
          <el-tag :type="row.role === 'OWNER' ? 'danger' : 'info'">{{ row.role }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="加入时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button
            v-if="row.role !== 'OWNER'"
            v-hasPermi="['docman:member:remove']"
            size="small"
            type="danger"
            link
            icon="Delete"
            @click="handleDelete(row)"
          >移除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加成员对话框 -->
    <el-dialog v-model="dialog.open" :title="dialog.title" width="400px" append-to-body>
      <el-form ref="memberFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户ID" prop="userId">
          <el-input-number v-model="form.userId" :min="1" controls-position="right" placeholder="请输入用户ID" style="width: 100%" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="MEMBER" value="MEMBER" />
            <el-option label="OWNER" value="OWNER" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialog.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { listMembers, addMember, removeMember, DocProjectMember } from '@/api/docman/member';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const loading = ref(true);
const memberList = ref<DocProjectMember[]>([]);

const memberFormRef = ref<any>();
const dialog = reactive({
  open: false,
  title: '添加成员'
});

const form = reactive({
  userId: undefined as number | undefined,
  role: 'MEMBER'
});

const rules = {
  userId: [{ required: true, message: '用户ID不能为空', trigger: 'blur' }],
  role: [{ required: true, message: '角色不能为空', trigger: 'change' }]
};

/** 查询成员列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await listMembers(projectId.value);
    memberList.value = res.data;
  } finally {
    loading.value = false;
  }
};

/** 添加成员 */
function handleAdd() {
  form.userId = undefined;
  form.role = 'MEMBER';
  dialog.open = true;
}

/** 提交表单 */
function submitForm() {
  memberFormRef.value?.validate(async (valid: boolean) => {
    if (valid && form.userId) {
      await addMember(projectId.value, form.userId, form.role);
      ElMessage.success('添加成功');
      dialog.open = false;
      getList();
    }
  });
}

/** 移除成员 */
async function handleDelete(row: DocProjectMember) {
  try {
    await ElMessageBox.confirm(`确认移除成员「${row.userName || row.userId}」？`, '提示', {
      type: 'warning'
    });
    await removeMember(projectId.value, row.userId);
    ElMessage.success('移除成功');
    getList();
  } catch (error) {}
}

onMounted(() => getList());
</script>
