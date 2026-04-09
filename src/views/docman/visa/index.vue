<template>
  <div class="app-container" data-testid="visa-page">
    <el-page-header @back="router.back()">
      <template #content>签证单</template>
    </el-page-header>

    <el-row :gutter="10" class="mb8" style="margin-top: 16px">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" data-testid="visa-add-button" @click="handleAdd">新建签证单</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="visaList" border stripe :row-key="(row) => row.id" data-testid="visa-table">
      <el-table-column prop="reason" label="事由" min-width="180" />
      <el-table-column prop="date" label="日期" width="120" align="center" />
      <el-table-column prop="amount" label="金额" width="120" align="center" />
      <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button size="small" type="primary" plain @click="handleUpdate(row)">编辑</el-button>
          <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 新增或编辑签证单对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body data-testid="visa-dialog">
      <el-form ref="visaFormRef" :model="form" :rules="rules" label-width="100px" data-testid="visa-form">
        <el-form-item label="事由" prop="reason">
          <el-input v-model="form.reason" placeholder="请输入事由" data-testid="visa-form-reason" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" data-testid="visa-form-date" />
        </el-form-item>
        <el-form-item label="金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入金额" data-testid="visa-form-amount" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" data-testid="visa-form-remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" data-testid="visa-submit-button" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();

interface DocVisa {
  id?: number;
  reason: string;
  date: string;
  amount: string;
  remark: string;
  createTime: string;
}

const projectId = ref(Number(route.params.projectId));
const visaList = ref<DocVisa[]>([]);
const total = ref(0);
const loading = ref(true);
const visaFormRef = ref();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: Omit<DocVisa, 'id' | 'createTime'> & { id?: number } = {
  id: undefined,
  reason: '',
  date: '',
  amount: '',
  remark: ''
};

const form = reactive({ ...initFormData });

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

const rules = {
  reason: [{ required: true, message: '事由不能为空', trigger: 'blur' }],
  date: [{ required: true, message: '日期不能为空', trigger: 'change' }],
  amount: [{ required: true, message: '金额不能为空', trigger: 'blur' }]
};

/** 查询签证单列表 */
async function getList() {
  loading.value = true;
  try {
    // TODO: 调用签证单查询接口
    // const res = await listVisa(projectId.value, queryParams);
    // visaList.value = res.rows ?? [];
    // total.value = res.total ?? 0;

    // 模拟数据（接口对接后删除）
    visaList.value = [];
    total.value = 0;
  } catch (error) {
    visaList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

/** 新增按钮操作 */
function handleAdd() {
  Object.assign(form, initFormData);
  dialog.visible = true;
  dialog.title = '新建签证单';
}

/** 编辑按钮操作 */
function handleUpdate(row: DocVisa) {
  Object.assign(form, {
    id: row.id,
    reason: row.reason,
    date: row.date,
    amount: row.amount,
    remark: row.remark
  });
  dialog.visible = true;
  dialog.title = '编辑签证单';
}

/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  reset();
}

/** 重置表单 */
function reset() {
  Object.assign(form, initFormData);
  visaFormRef.value?.resetFields();
}

/** 提交按钮 */
function submitForm() {
  visaFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.id != undefined) {
          // TODO: 调用编辑接口
          ElMessage.success('修改成功');
        } else {
          // TODO: 调用新增接口
          ElMessage.success('新增成功');
        }
        dialog.visible = false;
        getList();
      } catch (error) {
        console.error(error);
        ElMessage.error('操作失败，请重试');
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(id: number | undefined) {
  if (id == undefined) return;
  ElMessageBox.confirm('是否确认删除该签证单？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        // TODO: 调用删除接口
        ElMessage.success('删除成功');
        getList();
      } catch (error) {
        console.error(error);
        ElMessage.error('删除失败，请重试');
      }
    })
    .catch(() => {});
}

onMounted(() => getList());
</script>
