<template>
  <div class="app-container" data-testid="project-page">
    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" />
    <el-form :model="queryParams" ref="queryRef" :inline="true" data-testid="project-search-form">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入" clearable data-testid="project-search-name" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
          <el-option v-for="dict in doc_customer_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="全部" clearable>
          <el-option v-for="dict in doc_business_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" data-testid="project-search-submit" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" data-testid="project-add-button" @click="handleAdd" v-hasPermi="['docman:project:add']"
          >新增项目</el-button
        >
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="projectList" border stripe :row-key="(row) => row.id" data-testid="project-table">
      <el-table-column prop="name" label="项目名称" min-width="180" />
      <el-table-column label="客户名称" width="150">
        <template #default="{ row }">
          {{ proxy?.selectDictLabel(doc_customer_type.value, row.customerType)?.label || row.customerType }}
        </template>
      </el-table-column>
      <el-table-column label="项目类型" width="150">
        <template #default="{ row }">
          {{ proxy?.selectDictLabel(doc_business_type.value, row.businessType)?.label || row.businessType }}
        </template>
      </el-table-column>
      <el-table-column prop="ownerName" label="负责人" width="120" />
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-hasPermi="['docman:project:edit']" size="small" type="primary" plain @click="handleUpdate(row)">编辑</el-button>
          <el-button size="small" @click="handleDocuments(row.id)" v-hasPermi="['docman:document:list']">文档中心</el-button>
          <el-button
            size="small"
            type="success"
            v-if="row.status === 'active'"
            @click="handleArchive(row.id)"
            v-hasPermi="['docman:archive:execute']"
            >归档</el-button
          >
          <el-dropdown @command="(command: string) => handleCommand(command, row)">
            <el-button size="small" type="info" plain>
              更多<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="process" v-hasPermi="['docman:process:query']">流程</el-dropdown-item>
                <el-dropdown-item command="member" v-hasPermi="['docman:project:query']">成员管理</el-dropdown-item>
                <el-dropdown-item command="log" v-hasPermi="['docman:plugin:list']">执行日志</el-dropdown-item>
                <el-dropdown-item command="archive" v-hasPermi="['docman:archive:query']">归档详情</el-dropdown-item>
                <el-dropdown-item command="delete" v-hasPermi="['docman:project:remove']" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改项目配置对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body data-testid="project-dialog">
      <el-form ref="projectFormRef" :model="form" :rules="rules" label-width="100px" data-testid="project-form">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" data-testid="project-form-name" />
        </el-form-item>
        <el-form-item label="客户类型" prop="customerType">
          <el-select v-model="form.customerType" placeholder="请选择客户类型" style="width: 100%">
            <el-option v-for="dict in doc_customer_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="业务类型" prop="businessType">
          <el-select v-model="form.businessType" placeholder="请选择业务类型" style="width: 100%">
            <el-option v-for="dict in doc_business_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="文档分类" prop="documentCategory">
          <el-input v-model="form.documentCategory" placeholder="请输入文档分类" data-testid="project-form-document-category" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" data-testid="project-form-remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            data-testid="project-submit-button"
            @click="submitForm"
            v-hasPermi="[form.id ? 'docman:project:edit' : 'docman:project:add']"
            >确 定</el-button
          >
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { listProject, addProject, updateProject, delProject } from '@/api/docman/project';
import { archiveProject } from '@/api/docman/archive';
import { DocProject, DocProjectQuery, DocProjectForm, PageResult } from '@/api/docman/types';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { handleApiError } from '@/utils/error';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const userStore = useUserStore();

const { doc_customer_type, doc_business_type, doc_project_status } = toRefs<any>(
  proxy?.useDict('doc_customer_type', 'doc_business_type', 'doc_project_status')
);

const projectList = ref<DocProject[]>([]);
const total = ref(0);
const loading = ref(true);
const loadError = ref('');

const queryRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DocProjectForm = {
  id: undefined,
  name: '',
  customerType: 'telecom',
  businessType: 'pipeline',
  documentCategory: '',
  remark: ''
};

const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 12,
    name: '',
    customerType: '',
    businessType: ''
  } as DocProjectQuery,
  rules: {
    name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
    customerType: [{ required: true, message: '客户类型不能为空', trigger: 'change' }],
    businessType: [{ required: true, message: '业务类型不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询项目列表 */
const getList = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const res = await listProject(queryParams.value);
    projectList.value = res.rows ?? [];
    total.value = res.total ?? 0;
  } catch (error) {
    projectList.value = [];
    total.value = 0;
    loadError.value = handleApiError(error, '项目列表加载失败，请刷新后重试');
  } finally {
    loading.value = false;
  }
};

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields();
  handleQuery();
}

/** 重置操作表单 */
function reset() {
  form.value = { ...initFormData };
  projectFormRef.value?.resetFields();
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialog.visible = true;
  dialog.title = '新增项目';
}

/** 修改按钮操作 */
function handleUpdate(row: DocProject) {
  reset();
  dialog.visible = true;
  dialog.title = '修改项目';
  Object.assign(form.value, {
    id: row.id,
    name: row.name,
    customerType: row.customerType,
    businessType: row.businessType,
    documentCategory: row.documentCategory,
    remark: row.remark
  });
}

/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  reset();
}

/** 提交按钮 */
const submitForm = () => {
  projectFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.value.id != undefined) {
          await updateProject(form.value);
          proxy?.$modal.msgSuccess('修改成功');
        } else {
          const ownerId = Number(userStore.userId);
          await addProject({
            ...form.value,
            ...(Number.isFinite(ownerId) && ownerId > 0 ? { ownerId } : {})
          } as DocProjectForm & { ownerId?: number });
          proxy?.$modal.msgSuccess('新增成功');
        }
        dialog.visible = false;
        getList();
      } catch (error) {
        handleApiError(error, '操作失败，请稍后重试');
      }
    }
  });
};

/** 删除按钮操作 */
function handleDelete(id: number) {
  proxy?.$modal
    .confirm('是否确认删除该项目？')
    .then(async () => {
      try {
        await delProject([id]);
        proxy?.$modal.msgSuccess('删除成功');
        getList();
      } catch (error) {
        handleApiError(error, '删除失败，请稍后重试');
      }
    })
    .catch(() => {});
}

function handleDocuments(id: number) {
  router.push({ path: '/docman/document', query: { projectId: String(id) } });
}

function handleProcess(id: number) {
  router.push({ path: '/docman/process', query: { projectId: String(id) } });
}

function handleMembers(id: number) {
  router.push({ path: '/docman/member', query: { projectId: String(id) } });
}

function handleArchiveDetail(id: number) {
  router.push({ path: '/docman/archive', query: { projectId: String(id) } });
}

function handleCommand(command: string, row: DocProject) {
  switch (command) {
    case 'process':
      handleProcess(row.id);
      break;
    case 'member':
      router.push(`/docman/member/${row.id}`);
      break;
    case 'log':
      router.push(`/docman/plugin/log?projectId=${row.id}`);
      break;
    case 'archive':
      handleArchiveDetail(row.id);
      break;
    case 'delete':
      handleDelete(row.id);
      break;
  }
}

/** 归档按钮操作 */
function handleArchive(id: number) {
  proxy?.$modal
    .confirm('确认归档该项目？归档后不可修改。')
    .then(async () => {
      try {
        await archiveProject(id);
        proxy?.$modal.msgSuccess('归档成功');
        getList();
      } catch (error) {
        handleApiError(error, '归档失败，请稍后重试');
      }
    })
    .catch(() => {});
}

onMounted(() => getList());
</script>
