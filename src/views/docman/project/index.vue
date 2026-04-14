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

    <el-table v-loading="loading" :data="projectList" border stripe :row-key="(row) => row.id" data-testid="project-table">
      <el-table-column prop="name" label="项目名称" min-width="180" />
      <el-table-column label="客户类型" width="130">
        <template #default="{ row }">
          {{ resolveDictLabel(doc_customer_type, row.customerType, row.customerType || '-') }}
        </template>
      </el-table-column>
      <el-table-column label="业务类型" width="130">
        <template #default="{ row }">
          {{ resolveDictLabel(doc_business_type, row.businessType, row.businessType || '-') }}
        </template>
      </el-table-column>
      <el-table-column label="项目类型" width="140">
        <template #default="{ row }">
          {{ resolveProjectTypeName(row.projectTypeCode) }}
        </template>
      </el-table-column>
      <el-table-column prop="ownerName" label="负责人" width="120" />
      <el-table-column label="操作" align="center" width="320" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-hasPermi="['docman:project:edit']" size="small" type="primary" plain @click="handleUpdate(row)">编辑</el-button>
          <el-button v-hasPermi="['docman:project:query']" size="small" type="info" plain @click="handleDetail(row)">详情</el-button>
          <el-button size="small" @click="handleDocuments(row.id)" v-hasPermi="['docman:document:list']">文档中心</el-button>
          <el-dropdown @command="(command: string) => handleCommand(command, row)">
            <el-button size="small" type="info" plain> 更多<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="balance" v-hasPermi="['docman:project:query']">项目经理平料</el-dropdown-item>
                <el-dropdown-item command="drawing" v-hasPermi="['docman:project:query']">图纸/工作量录入</el-dropdown-item>
                <el-dropdown-item command="visa">签证单</el-dropdown-item>
                <el-dropdown-item command="archive" v-if="row.status === 'active'" v-hasPermi="['docman:archive:execute']">归档</el-dropdown-item>
                <el-dropdown-item command="process" v-hasPermi="['docman:process:query']">流程</el-dropdown-item>
                <el-dropdown-item command="member" v-hasPermi="['docman:project:query']">成员管理</el-dropdown-item>
                <el-dropdown-item command="log" v-hasPermi="['docman:plugin:list']">执行日志</el-dropdown-item>
                <el-dropdown-item command="archiveDetail" v-hasPermi="['docman:archive:query']">归档详情</el-dropdown-item>
                <el-dropdown-item command="delete" v-hasPermi="['docman:project:remove']" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改/详情项目配置对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="900px"
      append-to-body
      data-testid="project-dialog"
      @close="handleProjectDialogClose"
    >
      <el-form
        ref="projectFormRef"
        :model="form"
        :rules="dialogMode === 'edit' ? rules : undefined"
        label-width="110px"
        data-testid="project-form"
        :disabled="dialogMode === 'detail'"
      >
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="项目名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入项目名称" data-testid="project-form-name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="客户类型" prop="customerType">
              <el-select v-model="form.customerType" placeholder="请选择客户类型" style="width: 100%">
                <el-option v-for="dict in doc_customer_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="form.businessType" placeholder="请选择业务类型" style="width: 100%">
                <el-option v-for="dict in doc_business_type" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目类型" prop="projectTypeCode">
              <el-select v-model="form.projectTypeCode" placeholder="请选择项目类型" style="width: 100%">
                <el-option v-for="item in projectTypeList" :key="item.code" :label="item.name" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="文档分类" prop="documentCategory">
              <el-input v-model="form.documentCategory" placeholder="请输入文档分类" data-testid="project-form-document-category" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电信编号" prop="telecomCode">
              <el-input v-model="form.telecomCode" placeholder="请输入电信编号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="翔云编号" prop="xiangyunCode">
              <el-input v-model="form.xiangyunCode" placeholder="请输入翔云编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电信立项时间" prop="telecomProjectDate">
              <el-date-picker v-model="form.telecomProjectDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="计划开工时间" prop="planStartDate">
              <el-date-picker v-model="form.planStartDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划完工时间" prop="planEndDate">
              <el-date-picker v-model="form.planEndDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" data-testid="project-form-remark" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="form.id" class="quick-action-bar" style="margin: 16px 0; display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #ebeef5">
        <el-button type="primary" plain icon="Plus" data-testid="project-add-drawing-button" @click="handleAddDrawing">图纸/工作量录入</el-button>
        <el-button type="warning" plain icon="Plus" data-testid="project-add-visa-button" @click="handleAddVisa">新增签证单</el-button>
        <el-button type="info" plain icon="EditPen" @click="handleWorkspace(form.id!)">项目工作台</el-button>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <template v-if="dialogMode === 'edit'">
            <el-button
              type="primary"
              data-testid="project-submit-button"
              @click="submitForm"
              v-hasPermi="[form.id ? 'docman:project:edit' : 'docman:project:add']"
              >确 定</el-button
            >
            <el-button @click="cancel">取 消</el-button>
          </template>
          <template v-else>
            <el-button @click="cancel">关 闭</el-button>
          </template>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="drawingDialog.visible"
      title="新增图纸"
      width="520px"
      append-to-body
      data-testid="project-drawing-dialog"
      @closed="resetDrawingForm"
    >
      <el-form :model="drawingForm" label-width="100px" data-testid="project-drawing-form">
        <el-form-item label="图号">
          <el-input v-model="drawingForm.drawingCode" placeholder="请输入图号" data-testid="project-drawing-form-code" />
        </el-form-item>
        <el-form-item label="订单流水号">
          <el-input v-model="drawingForm.orderSerialNo" placeholder="请输入订单流水号" data-testid="project-drawing-form-order" />
        </el-form-item>
        <el-form-item label="工作内容">
          <el-input
            v-model="drawingForm.workContent"
            type="textarea"
            :rows="4"
            placeholder="请输入工作内容"
            data-testid="project-drawing-form-content"
          />
        </el-form-item>
        <el-form-item label="计入项目">
          <el-switch v-model="drawingForm.includeInProject" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="drawingForm.remark" type="textarea" :rows="3" placeholder="请输入备注内容" data-testid="project-drawing-form-remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="drawingDialog.visible = false">取消</el-button>
          <el-button type="primary" data-testid="project-drawing-submit-button" @click="submitDrawingForm">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="visaDialog.visible" title="新增签证单" width="520px" append-to-body data-testid="project-visa-dialog" @closed="resetVisaForm">
      <el-form :model="visaForm" label-width="100px" data-testid="project-visa-form">
        <el-form-item label="签证原因">
          <el-input v-model="visaForm.reason" placeholder="请输入签证原因" data-testid="project-visa-form-reason" />
        </el-form-item>
        <el-form-item label="内容依据">
          <el-input v-model="visaForm.contentBasis" type="textarea" :rows="4" placeholder="请输入内容依据" data-testid="project-visa-form-basis" />
        </el-form-item>
        <el-form-item label="金额">
          <el-input-number v-model="visaForm.amount" :precision="2" :min="0" style="width: 100%" data-testid="project-visa-form-amount" />
        </el-form-item>
        <el-form-item label="签证日期">
          <el-date-picker
            v-model="visaForm.visaDate"
            type="date"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
            data-testid="project-visa-form-date"
          />
        </el-form-item>
        <el-form-item label="计入项目">
          <el-switch v-model="visaForm.includeInProject" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="visaForm.remark" type="textarea" :rows="3" placeholder="请输入备注内容" data-testid="project-visa-form-remark" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visaDialog.visible = false">取消</el-button>
          <el-button type="primary" data-testid="project-visa-submit-button" @click="submitVisaForm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, toRefs, getCurrentInstance, ComponentInternalInstance, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { listProject, addProject, updateProject, delProject, getProject } from '@/api/docman/project';
import { saveProjectDrawing } from '@/api/docman/drawing';
import { saveProjectVisa } from '@/api/docman/visa';
import { archiveProject } from '@/api/docman/archive';
import { listProjectType } from '@/api/docman/projectType';
import { DocProject, DocProjectQuery, DocProjectForm, DocProjectDrawingForm, DocProjectVisaForm, DocmanId } from '@/api/docman/types';
import { getProjectWorkspace } from '@/api/docman/workspace';
import { useUserStore } from '@/store/modules/user';
import { handleApiError } from '@/utils/error';
import { resolveDictLabel } from '../docmanDict.util';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.roles.includes('superadmin'));

const { doc_customer_type, doc_business_type } = toRefs<any>(proxy?.useDict('doc_customer_type', 'doc_business_type'));

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
const drawingDialog = reactive({
  visible: false
});
const visaDialog = reactive({
  visible: false
});
const dialogMode = ref<'edit' | 'detail'>('edit');

const initFormData: DocProjectForm = {
  id: undefined,
  name: '',
  projectTypeCode: 'telecom',
  customerType: 'telecom',
  businessType: 'pipeline',
  documentCategory: '',
  telecomCode: '',
  xiangyunCode: '',
  telecomProjectDate: '',
  planStartDate: '',
  planEndDate: '',
  remark: ''
};
const initDrawingFormData: DocProjectDrawingForm = {
  projectId: '',
  drawingCode: '',
  orderSerialNo: '',
  workContent: '',
  includeInProject: true,
  remark: ''
};
const initVisaFormData: DocProjectVisaForm = {
  projectId: '',
  reason: '',
  contentBasis: '',
  amount: 0,
  visaDate: '',
  includeInProject: true,
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
const drawingForm = reactive<DocProjectDrawingForm>({ ...initDrawingFormData });
const visaForm = reactive<DocProjectVisaForm>({ ...initVisaFormData });

function resolveSafeOwnerId(): DocmanId | undefined {
  const ownerId = String(userStore.userId ?? '').trim();
  return /^\d+$/.test(ownerId) && ownerId !== '0' ? ownerId : undefined;
}

function resolveProjectTypeName(projectTypeCode?: string) {
  return projectTypeList.value.find((item) => item.code === projectTypeCode)?.name || projectTypeCode || '-';
}

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

function resetDrawingForm() {
  Object.assign(drawingForm, {
    ...initDrawingFormData,
    projectId: form.value.id || ''
  });
}

function resetVisaForm() {
  Object.assign(visaForm, {
    ...initVisaFormData,
    projectId: form.value.id || ''
  });
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  dialogMode.value = 'edit';
  dialog.visible = true;
  dialog.title = '新增项目';
}

/** 修改按钮操作 */
function handleUpdate(row: DocProject) {
  reset();
  dialogMode.value = 'edit';
  dialog.visible = true;
  dialog.title = '修改项目';
  Object.assign(form.value, {
    id: row.id,
    name: row.name,
    projectTypeCode: row.projectTypeCode,
    customerType: row.customerType,
    businessType: row.businessType,
    documentCategory: row.documentCategory,
    telecomCode: (row as any).telecomCode || '',
    xiangyunCode: (row as any).xiangyunCode || '',
    telecomProjectDate: (row as any).telecomProjectDate || '',
    planStartDate: (row as any).planStartDate || '',
    planEndDate: (row as any).planEndDate || '',
    remark: row.remark
  });
}

/** 详情按钮操作 */
async function handleDetail(row: DocProject) {
  try {
    await getProjectWorkspace(row.id);
    handleWorkspace(row.id);
  } catch (error) {
    handleApiError(error, '项目详情暂不可查看');
  }
}

/** 新增图纸按钮 */
function handleAddDrawing() {
  if (form.value.id) {
    resetDrawingForm();
    drawingDialog.visible = true;
  }
}

/** 新增签证单按钮 */
function handleAddVisa() {
  if (form.value.id) {
    resetVisaForm();
    visaDialog.visible = true;
  }
}

/** 取消按钮 */
function cancel() {
  dialog.visible = false;
  drawingDialog.visible = false;
  visaDialog.visible = false;
  reset();
  resetDrawingForm();
  resetVisaForm();
}

function handleProjectDialogClose() {
  drawingDialog.visible = false;
  visaDialog.visible = false;
  reset();
  resetDrawingForm();
  resetVisaForm();
}

async function submitDrawingForm() {
  if (!form.value.id) {
    return;
  }
  try {
    await saveProjectDrawing({
      ...drawingForm,
      projectId: form.value.id
    });
    proxy?.$modal.msgSuccess('图纸保存成功');
    drawingDialog.visible = false;
  } catch (error) {
    handleApiError(error, '图纸保存失败，请稍后重试');
  }
}

async function submitVisaForm() {
  if (!form.value.id) {
    return;
  }
  try {
    await saveProjectVisa({
      ...visaForm,
      projectId: form.value.id
    });
    proxy?.$modal.msgSuccess('签证保存成功');
    visaDialog.visible = false;
  } catch (error) {
    handleApiError(error, '签证保存失败，请稍后重试');
  }
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
          const ownerId = resolveSafeOwnerId();
          await addProject({
            ...form.value,
            ...(ownerId ? { ownerId } : {})
          } as DocProjectForm & { ownerId?: DocmanId });
          proxy?.$modal.msgSuccess('新增成功');
        }
        dialog.visible = false;
        drawingDialog.visible = false;
        visaDialog.visible = false;
        resetDrawingForm();
        resetVisaForm();
        getList();
      } catch (error) {
        handleApiError(error, '操作失败，请稍后重试');
      }
    }
  });
};

/** 删除按钮操作 */
function handleDelete(id: DocmanId) {
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

function handleDocuments(id: DocmanId) {
  router.push({ path: '/docman/document', query: { projectId: String(id) } });
}
function handleDrawing(id: DocmanId) {
  router.push(`/docman/drawing/${id}`);
}
function handleWorkspace(id: DocmanId) {
  router.push({ path: '/docman/workspace', query: { projectId: String(id) } });
}
function handleBalance(id: DocmanId) {
  router.push({ path: '/docman/balance', query: { projectId: String(id) } });
}
function handleProcess(id: DocmanId) {
  router.push({ path: '/docman/process', query: { projectId: String(id) } });
}

function handleMembers(id: DocmanId) {
  router.push(`/docman/member/${id}`);
}

function handleArchiveDetail(id: DocmanId) {
  router.push({ path: '/docman/archive', query: { projectId: String(id) } });
}

function handleCommand(command: string, row: DocProject) {
  switch (command) {
    case 'balance':
      handleBalance(row.id);
      break;
    case 'drawing':
      handleDrawing(row.id);
      break;
    case 'visa':
      router.push(`/docman/visa/${row.id}`);
      break;
    case 'process':
      handleProcess(row.id);
      break;
    case 'member':
      handleMembers(row.id);
      break;
    case 'log':
      router.push(`/docman/plugin/log?projectId=${row.id}`);
      break;
    case 'archive':
      handleArchive(row.id);
      break;
    case 'archiveDetail':
      handleArchiveDetail(row.id);
      break;
    case 'delete':
      handleDelete(row.id);
      break;
  }
}

/** 归档按钮操作 */
function handleArchive(id: DocmanId) {
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

async function tryOpenProjectEditorFromRoute() {
  const action = String(route.query.action || '');
  const projectId = String(route.query.projectId || '').trim();
  if (action !== 'edit' || !/^\d+$/.test(projectId) || projectId === '0') {
    return;
  }
  try {
    const project = await getProject(projectId);
    handleUpdate(project);
  } catch (error) {
    handleApiError(error, '项目信息加载失败，请稍后重试');
  } finally {
    router.replace({ path: '/docman/project', query: {} });
  }
}

onMounted(async () => {
  getList();
  try {
    const res = await listProjectType();
    projectTypeList.value = res.data || [];
  } catch {
    projectTypeList.value = [];
  }
  await tryOpenProjectEditorFromRoute();
});

watch(
  () => [route.query.action, route.query.projectId],
  () => {
    tryOpenProjectEditorFromRoute();
  }
);
</script>
