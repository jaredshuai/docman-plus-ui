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
      <el-form-item label="项目类型" prop="projectTypeCode">
        <el-select v-model="queryParams.projectTypeCode" placeholder="全部" clearable>
          <el-option v-for="item in projectTypeList" :key="item.code" :label="item.name" :value="item.code" />
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
      <el-col :span="1.5">
        <el-button type="success" plain icon="DataAnalysis" @click="router.push('/docman/dashboard')" v-hasPermi="['docman:project:list']"
          >领导概览</el-button
        >
      </el-col>
      <el-col :span="1.5" v-if="isSuperAdmin">
        <el-button type="warning" plain icon="Setting" @click="router.push('/docman/project-type')">项目类型</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="SetUp" @click="router.push('/docman/workflow-template')" v-hasPermi="['docman:process:query']"
          >流程模板</el-button
        >
      </el-col>
      <el-col :span="1.5" v-if="isSuperAdmin">
        <el-button type="primary" plain icon="Operation" @click="router.push('/docman/governance')">系统治理</el-button>
      </el-col>
      <el-col :span="1.5" v-if="isSuperAdmin">
        <el-button type="danger" plain icon="User" @click="router.push('/docman/admin')">管理员管理</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-loading="loading" data-testid="project-list">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectList" :key="item.id">
        <el-card
          shadow="hover"
          class="project-card"
          style="margin-bottom: 16px; cursor: pointer"
          data-testid="project-card"
          :data-project-name="item.name"
          @click="handleDocuments(item.id)"
        >
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span style="font-weight: bold">{{ item.name }}</span>
              <el-tag :type="proxy?.selectDictLabel(doc_project_status.value, item.status)?.cssClass || 'primary'" size="small">
                {{ proxy?.selectDictLabel(doc_project_status.value, item.status)?.label || item.status }}
              </el-tag>
            </div>
          </template>
          <p>客户：{{ proxy?.selectDictLabel(doc_customer_type.value, item.customerType)?.label || item.customerType }}</p>
          <p>类型：{{ proxy?.selectDictLabel(doc_business_type.value, item.businessType)?.label || item.businessType }}</p>
          <p>项目类型：{{ item.projectTypeCode || '-' }}</p>
          <p>负责人：{{ item.ownerName }}</p>
          <template #footer>
            <el-button size="small" type="primary" @click.stop="handleWorkspace(item.id)" v-hasPermi="['docman:project:query']">工作台</el-button>
            <el-button size="small" type="success" plain @click.stop="handleBalance(item.id)" v-hasPermi="['docman:project:query']"
              >项目经理</el-button
            >
            <el-button size="small" @click.stop="handleDocuments(item.id)" v-hasPermi="['docman:document:list']">文档中心</el-button>
            <el-button size="small" type="warning" @click.stop="handleProcess(item.id)" v-hasPermi="['docman:process:query']">流程</el-button>
            <el-button v-hasPermi="['docman:project:query']" size="small" @click.stop="router.push(`/docman/member/${item.id}`)">成员管理</el-button>
            <el-button
              v-hasPermi="['docman:plugin:list']"
              size="small"
              type="info"
              plain
              @click.stop="router.push(`/docman/plugin/log?projectId=${item.id}`)"
              >执行日志</el-button
            >
            <el-button size="small" type="primary" plain @click.stop="handleUpdate(item)" v-hasPermi="['docman:project:edit']">编辑</el-button>
            <el-button
              size="small"
              type="success"
              v-if="item.status === 'active'"
              @click.stop="handleArchive(item.id)"
              v-hasPermi="['docman:archive:execute']"
              >归档</el-button
            >
            <el-button size="small" type="info" plain @click.stop="handleArchiveDetail(item.id)" v-hasPermi="['docman:archive:query']"
              >归档详情</el-button
            >
            <el-button
              size="small"
              type="danger"
              plain
              data-testid="project-delete-button"
              @click.stop="handleDelete(item.id)"
              v-hasPermi="['docman:project:remove']"
              >删除</el-button
            >
          </template>
        </el-card>
      </el-col>
    </el-row>

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
        <el-form-item label="项目类型" prop="projectTypeCode">
          <el-select v-model="form.projectTypeCode" placeholder="请选择项目类型" style="width: 100%">
            <el-option v-for="item in projectTypeList" :key="item.code" :label="item.name" :value="item.code" />
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
import { computed, ref, onMounted, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { listProject, addProject, updateProject, delProject } from '@/api/docman/project';
import { archiveProject } from '@/api/docman/archive';
import { listProjectType } from '@/api/docman/projectType';
import { DocProject, DocProjectQuery, DocProjectForm, PageResult } from '@/api/docman/types';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';
import { handleApiError } from '@/utils/error';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.roles.includes('superadmin'));

const { doc_customer_type, doc_business_type, doc_project_status } = toRefs<any>(
  proxy?.useDict('doc_customer_type', 'doc_business_type', 'doc_project_status')
);

const projectList = ref<DocProject[]>([]);
const total = ref(0);
const loading = ref(true);
const loadError = ref('');
const projectTypeList = ref<Array<{ code: string; name: string }>>([]);

const queryRef = ref<ElFormInstance>();
const projectFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: DocProjectForm = {
  id: undefined,
  name: '',
  projectTypeCode: 'telecom',
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
    projectTypeCode: '',
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
    projectTypeCode: row.projectTypeCode,
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
function handleWorkspace(id: number) {
  router.push({ path: '/docman/workspace', query: { projectId: String(id) } });
}
function handleBalance(id: number) {
  router.push({ path: '/docman/balance', query: { projectId: String(id) } });
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

onMounted(async () => {
  getList();
  try {
    const res = await listProjectType();
    projectTypeList.value = res.data || [];
  } catch {
    projectTypeList.value = [];
  }
});
</script>
