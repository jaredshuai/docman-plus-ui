<template>
  <div class="app-container" data-testid="drawing-page">
    <el-page-header @back="router.back()">
      <template #content>图纸录入</template>
    </el-page-header>

    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" style="margin-top: 16px" />
    <el-alert
      v-else-if="!hasProjectId"
      title="缺少项目上下文，请从项目页进入图纸录入。"
      type="info"
      show-icon
      :closable="false"
      class="mb8"
      style="margin-top: 16px"
    />

    <template v-else>
      <el-row :gutter="10" class="mb8" style="margin-top: 16px">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" data-testid="drawing-add-button" @click="handleAdd" v-hasPermi="['docman:project:edit']">
            新建图纸
          </el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="pagedRows" border stripe :row-key="(row) => row.id" data-testid="drawing-table">
        <el-table-column prop="drawingCode" label="图号" min-width="140" />
        <el-table-column prop="orderSerialNo" label="订单流水号" min-width="160" />
        <el-table-column prop="workContent" label="工作内容" min-width="220" show-overflow-tooltip />
        <el-table-column label="计入项目" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.includeInProject ? 'success' : 'info'" size="small">
              {{ row.includeInProject ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" align="center" width="220" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleUpdate(row)" v-hasPermi="['docman:project:edit']">编辑</el-button>
            <el-button size="small" type="success" plain @click="handleManageWorkItems(row)" v-hasPermi="['docman:project:edit']">工作量</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(row.id)" v-hasPermi="['docman:project:remove']">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handlePageChange"
      />

      <el-dialog v-model="dialog.visible" :title="dialog.title" width="520px" append-to-body data-testid="drawing-dialog">
        <el-form ref="drawingFormRef" :model="form" label-width="100px" data-testid="drawing-form">
          <el-form-item label="图号">
            <el-input v-model="form.drawingCode" placeholder="请输入图号" data-testid="drawing-form-code" />
          </el-form-item>
          <el-form-item label="订单流水号">
            <el-input v-model="form.orderSerialNo" placeholder="请输入订单流水号" data-testid="drawing-form-order" />
          </el-form-item>
          <el-form-item label="工作内容">
            <el-input v-model="form.workContent" type="textarea" :rows="4" placeholder="请输入工作内容" data-testid="drawing-form-content" />
          </el-form-item>
          <el-form-item label="计入项目">
            <el-switch v-model="form.includeInProject" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" data-testid="drawing-form-remark" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" data-testid="drawing-submit-button" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </template>
      </el-dialog>

      <el-dialog v-model="workItemDialog.visible" :title="workItemDialog.title" width="860px" append-to-body data-testid="drawing-workitem-dialog">
        <el-alert v-if="workItemLoadError" :title="workItemLoadError" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
        <el-space style="margin-bottom: 16px" wrap>
          <span>当前图纸：{{ workItemDialog.drawingCode || '-' }}</span>
          <el-button type="primary" plain @click="handleAddWorkItem" v-hasPermi="['docman:project:edit']">新增工作量项</el-button>
        </el-space>
        <el-table v-loading="workItemLoading" :data="workItems" border stripe data-testid="drawing-workitem-table">
          <el-table-column prop="workItemName" label="工作量名称" min-width="160" />
          <el-table-column prop="workItemCode" label="编码" min-width="120" />
          <el-table-column prop="category" label="分类" min-width="120" />
          <el-table-column prop="unit" label="单位" width="90" />
          <el-table-column prop="quantity" label="数量" width="110" />
          <el-table-column label="计入估算" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.includeInEstimate ? 'success' : 'info'" size="small">
                {{ row.includeInEstimate ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" plain @click="handleEditWorkItem(row)" v-hasPermi="['docman:project:edit']">编辑</el-button>
              <el-button size="small" type="danger" plain @click="handleDeleteWorkItem(row.id)" v-hasPermi="['docman:project:remove']"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-dialog>

      <el-dialog
        v-model="workItemEditor.visible"
        :title="workItemEditor.title"
        width="520px"
        append-to-body
        data-testid="drawing-workitem-editor-dialog"
      >
        <el-form ref="workItemFormRef" :model="workItemForm" label-width="100px" data-testid="drawing-workitem-form">
          <el-form-item label="工作量名称">
            <el-input v-model="workItemForm.workItemName" placeholder="请输入工作量名称" data-testid="drawing-workitem-name" />
          </el-form-item>
          <el-form-item label="工作量编码">
            <el-input v-model="workItemForm.workItemCode" placeholder="请输入工作量编码" data-testid="drawing-workitem-code" />
          </el-form-item>
          <el-form-item label="分类">
            <el-input v-model="workItemForm.category" placeholder="请输入分类" />
          </el-form-item>
          <el-form-item label="单位">
            <el-input v-model="workItemForm.unit" placeholder="请输入单位" />
          </el-form-item>
          <el-form-item label="数量">
            <el-input-number v-model="workItemForm.quantity" :min="0" :precision="2" style="width: 100%" data-testid="drawing-workitem-quantity" />
          </el-form-item>
          <el-form-item label="计入估算">
            <el-switch v-model="workItemForm.includeInEstimate" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="workItemForm.remark" type="textarea" :rows="3" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" @click="submitWorkItemForm">确 定</el-button>
            <el-button @click="cancelWorkItemEdit">取 消</el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteProjectDrawing, listProjectDrawings, saveProjectDrawing } from '@/api/docman/drawing';
import { deleteDrawingWorkItems, listDrawingWorkItems, saveDrawingWorkItem } from '@/api/docman/drawingWorkItem';
import type { DocProjectDrawing, DocProjectDrawingForm, DocProjectDrawingWorkItem, DocProjectDrawingWorkItemForm } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';
import { paginateRows, resolvePathProjectId } from '../inputLine/inputLine.util';

const route = useRoute();
const router = useRouter();

const projectId = computed(() => resolvePathProjectId(route.params.projectId));
const hasProjectId = computed(() => Boolean(projectId.value));

const loading = ref(false);
const loadError = ref('');
const rows = ref<DocProjectDrawing[]>([]);
const total = ref(0);
const drawingFormRef = ref();
const workItemFormRef = ref();
const workItems = ref<DocProjectDrawingWorkItem[]>([]);
const workItemLoading = ref(false);
const workItemLoadError = ref('');

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});
const workItemDialog = reactive<DialogOption & { drawingId?: string; drawingCode?: string }>({
  visible: false,
  title: '',
  drawingId: undefined,
  drawingCode: ''
});
const workItemEditor = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

const initFormData: DocProjectDrawingForm = {
  id: undefined,
  projectId: '',
  drawingCode: '',
  orderSerialNo: '',
  workContent: '',
  includeInProject: true,
  remark: ''
};

const form = reactive<DocProjectDrawingForm>({ ...initFormData });
const pagedRows = computed(() => paginateRows(rows.value, queryParams.pageNum, queryParams.pageSize));
const initWorkItemForm: DocProjectDrawingWorkItemForm = {
  id: undefined,
  projectId: '',
  drawingId: '',
  workItemCode: '',
  workItemName: '',
  category: '',
  unit: '',
  quantity: undefined,
  includeInEstimate: true,
  remark: ''
};
const workItemForm = reactive<DocProjectDrawingWorkItemForm>({ ...initWorkItemForm });

async function getList() {
  if (!hasProjectId.value) {
    rows.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const res = await listProjectDrawings(projectId.value!);
    rows.value = res.data || [];
    total.value = rows.value.length;
  } catch (error) {
    rows.value = [];
    total.value = 0;
    loadError.value = handleApiError(error, '图纸列表加载失败');
  } finally {
    loading.value = false;
  }
}

function handlePageChange() {
  total.value = rows.value.length;
}

function handleAdd() {
  reset();
  dialog.visible = true;
  dialog.title = '新建图纸';
}

function handleUpdate(row: DocProjectDrawing) {
  reset();
  Object.assign(form, {
    id: row.id,
    projectId: projectId.value || '',
    drawingCode: row.drawingCode || '',
    orderSerialNo: row.orderSerialNo || '',
    workContent: row.workContent || '',
    includeInProject: row.includeInProject ?? true,
    remark: row.remark || ''
  });
  dialog.visible = true;
  dialog.title = '编辑图纸';
}

function reset() {
  Object.assign(form, { ...initFormData, projectId: projectId.value || '' });
  drawingFormRef.value?.resetFields?.();
}

function cancel() {
  dialog.visible = false;
  reset();
}

function resetWorkItemForm() {
  Object.assign(workItemForm, {
    ...initWorkItemForm,
    projectId: projectId.value || '',
    drawingId: workItemDialog.drawingId || ''
  });
  workItemFormRef.value?.resetFields?.();
}

async function submitForm() {
  if (!hasProjectId.value) {
    return;
  }
  try {
    await saveProjectDrawing({ ...form, projectId: projectId.value });
    ElMessage.success(form.id ? '修改成功' : '新增成功');
    dialog.visible = false;
    await getList();
  } catch (error) {
    handleApiError(error, '图纸保存失败');
  }
}

async function loadWorkItems(drawingId?: string) {
  if (!hasProjectId.value || !drawingId) {
    workItems.value = [];
    return;
  }
  workItemLoading.value = true;
  workItemLoadError.value = '';
  try {
    const res = await listDrawingWorkItems(projectId.value!, drawingId);
    workItems.value = res.data || [];
  } catch (error) {
    workItems.value = [];
    workItemLoadError.value = handleApiError(error, '图纸工作量加载失败');
  } finally {
    workItemLoading.value = false;
  }
}

async function handleManageWorkItems(row: DocProjectDrawing) {
  workItemDialog.visible = true;
  workItemDialog.title = '维护图纸工作量';
  workItemDialog.drawingId = String(row.id || '');
  workItemDialog.drawingCode = row.drawingCode || row.orderSerialNo || '';
  await loadWorkItems(workItemDialog.drawingId);
}

function handleAddWorkItem() {
  resetWorkItemForm();
  workItemEditor.visible = true;
  workItemEditor.title = '新增工作量项';
}

function handleEditWorkItem(row: DocProjectDrawingWorkItem) {
  resetWorkItemForm();
  Object.assign(workItemForm, {
    id: row.id,
    projectId: projectId.value || '',
    drawingId: workItemDialog.drawingId || '',
    workItemCode: row.workItemCode || '',
    workItemName: row.workItemName || '',
    category: row.category || '',
    unit: row.unit || '',
    quantity: row.quantity,
    includeInEstimate: row.includeInEstimate ?? true,
    remark: row.remark || ''
  });
  workItemEditor.visible = true;
  workItemEditor.title = '编辑工作量项';
}

function cancelWorkItemEdit() {
  workItemEditor.visible = false;
  resetWorkItemForm();
}

async function submitWorkItemForm() {
  if (!hasProjectId.value || !workItemDialog.drawingId) {
    return;
  }
  try {
    await saveDrawingWorkItem({
      ...workItemForm,
      projectId: projectId.value!,
      drawingId: workItemDialog.drawingId
    });
    ElMessage.success(workItemForm.id ? '修改成功' : '新增成功');
    workItemEditor.visible = false;
    await loadWorkItems(workItemDialog.drawingId);
  } catch (error) {
    handleApiError(error, '工作量保存失败');
  }
}

function handleDeleteWorkItem(id?: number | string) {
  if (id == undefined || !workItemDialog.drawingId) {
    return;
  }
  ElMessageBox.confirm('是否确认删除该工作量项？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteDrawingWorkItems([id]);
        ElMessage.success('删除成功');
        await loadWorkItems(workItemDialog.drawingId);
      } catch (error) {
        handleApiError(error, '工作量删除失败');
      }
    })
    .catch(() => undefined);
}

function handleDelete(id?: number) {
  if (id == undefined) {
    return;
  }
  ElMessageBox.confirm('是否确认删除该图纸记录？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteProjectDrawing([id]);
        ElMessage.success('删除成功');
        await getList();
      } catch (error) {
        handleApiError(error, '图纸删除失败');
      }
    })
    .catch(() => undefined);
}

onMounted(() => {
  reset();
  getList();
});
</script>
