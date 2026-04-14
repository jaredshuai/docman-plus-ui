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

      <el-dialog
        v-model="workItemDialog.visible"
        :title="workItemDialog.title"
        fullscreen
        append-to-body
        :close-on-click-modal="false"
        class="drawing-detail-dialog"
        data-testid="drawing-workitem-dialog"
        @closed="resetDrawingDetail"
      >
        <el-alert v-if="workItemLoadError" :title="workItemLoadError" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
        <div class="drawing-detail-shell">
          <div class="drawing-detail-header">
            <div class="drawing-detail-header__meta">
              <h3 class="drawing-detail-header__title">{{ drawingDetailTitle }}</h3>
              <p class="drawing-detail-header__subtitle">图纸详情完整覆盖当前列表层，工作量属于图纸详情的一部分。</p>
            </div>
            <el-space wrap>
              <el-button @click="workItemDialog.visible = false">返回图纸列表</el-button>
              <el-button plain @click="handleEditSelectedDrawing" v-hasPermi="['docman:project:edit']">修改图纸</el-button>
              <el-button type="danger" plain @click="handleDeleteSelectedDrawing" v-hasPermi="['docman:project:remove']">移除图纸</el-button>
            </el-space>
          </div>

          <el-card shadow="never" class="drawing-detail-card">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="图号">{{ selectedDrawing?.drawingCode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="订单流水号">{{ selectedDrawing?.orderSerialNo || '-' }}</el-descriptions-item>
              <el-descriptions-item label="计入项目">
                <el-tag :type="selectedDrawing?.includeInProject ? 'success' : 'info'" size="small">
                  {{ selectedDrawing?.includeInProject ? '是' : '否' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ selectedDrawing?.createTime || '-' }}</el-descriptions-item>
              <el-descriptions-item label="工作内容" :span="2">{{ selectedDrawing?.workContent || '-' }}</el-descriptions-item>
              <el-descriptions-item label="备注" :span="2">{{ selectedDrawing?.remark || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <el-card shadow="never" class="drawing-detail-card drawing-detail-card--fill">
            <template #header>
              <div class="drawing-detail-card__header">
                <div class="drawing-detail-card__title-group">
                  <span>图纸下工作量</span>
                  <span class="drawing-detail-card__tip">工作量必须依附当前图纸存在</span>
                </div>
                <el-link
                  type="primary"
                  :underline="false"
                  class="drawing-detail-card__action"
                  data-testid="drawing-workitem-add-row"
                  :disabled="workItemLoading"
                  @click="handleAppendWorkItemRow"
                  v-hasPermi="['docman:project:edit']"
                >
                  + 新增一行
                </el-link>
              </div>
            </template>
            <el-table
              v-loading="workItemLoading"
              :data="workItems"
              :row-key="(row) => row.localKey"
              border
              stripe
              height="100%"
              data-testid="drawing-workitem-table"
            >
              <el-table-column label="工作量名称" min-width="220">
                <template #default="{ row }">
                  <el-input
                    v-model="row.workItemName"
                    placeholder="请输入工作量名称"
                    style="width: 100%"
                    :disabled="row.saving || row.deleting"
                    data-testid="drawing-workitem-inline-name"
                  />
                </template>
              </el-table-column>
              <el-table-column label="编码" min-width="140">
                <template #default="{ row }">
                  <el-input
                    v-model="row.workItemCode"
                    placeholder="请输入编码"
                    style="width: 100%"
                    :disabled="row.saving || row.deleting"
                    data-testid="drawing-workitem-inline-code"
                  />
                </template>
              </el-table-column>
              <el-table-column label="分类" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.category" placeholder="请输入分类" style="width: 100%" :disabled="row.saving || row.deleting" />
                </template>
              </el-table-column>
              <el-table-column label="单位" width="110">
                <template #default="{ row }">
                  <el-input v-model="row.unit" placeholder="单位" style="width: 100%" :disabled="row.saving || row.deleting" />
                </template>
              </el-table-column>
              <el-table-column label="数量" width="150">
                <template #default="{ row }">
                  <el-input-number
                    v-model="row.quantity"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    style="width: 100%"
                    :disabled="row.saving || row.deleting"
                    data-testid="drawing-workitem-inline-quantity"
                  />
                </template>
              </el-table-column>
              <el-table-column label="计入估算" width="100" align="center">
                <template #default="{ row }">
                  <el-switch
                    v-model="row.includeInEstimate"
                    :disabled="row.saving || row.deleting"
                    data-testid="drawing-workitem-inline-estimate"
                  />
                </template>
              </el-table-column>
              <el-table-column label="备注" min-width="220">
                <template #default="{ row }">
                  <el-input v-model="row.remark" placeholder="请输入备注" style="width: 100%" :disabled="row.saving || row.deleting" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="170" align="center">
                <template #default="{ row }">
                  <el-space :size="12">
                    <el-link
                      type="primary"
                      :underline="false"
                      :disabled="row.saving || row.deleting"
                      data-testid="drawing-workitem-save-row"
                      @click="handleSaveWorkItem(row)"
                      v-hasPermi="['docman:project:edit']"
                    >
                      {{ row.saving ? '保存中...' : '保存' }}
                    </el-link>
                    <el-link
                      v-if="row.id == undefined"
                      type="danger"
                      :underline="false"
                      :disabled="row.saving || row.deleting"
                      data-testid="drawing-workitem-delete-row"
                      @click="handleDeleteWorkItem(row)"
                      v-hasPermi="['docman:project:edit']"
                    >
                      移除
                    </el-link>
                    <el-link
                      v-else
                      type="danger"
                      :underline="false"
                      :disabled="row.saving || row.deleting"
                      data-testid="drawing-workitem-delete-row"
                      @click="handleDeleteWorkItem(row)"
                      v-hasPermi="['docman:project:remove']"
                    >
                      {{ row.deleting ? '删除中...' : '删除' }}
                    </el-link>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
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
import type { DocProjectDrawing, DocProjectDrawingForm, DocProjectDrawingWorkItem, DocProjectDrawingWorkItemForm, DocmanId } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';
import { paginateRows, resolvePathProjectId } from '../inputLine/inputLine.util';

interface EditableDrawingWorkItem extends DocProjectDrawingWorkItemForm {
  localKey: string;
  saving: boolean;
  deleting: boolean;
}

const route = useRoute();
const router = useRouter();

const projectId = computed(() => resolvePathProjectId(route.params.projectId));
const hasProjectId = computed(() => Boolean(projectId.value));

const loading = ref(false);
const loadError = ref('');
const rows = ref<DocProjectDrawing[]>([]);
const total = ref(0);
const drawingFormRef = ref();
const workItems = ref<EditableDrawingWorkItem[]>([]);
const workItemLoading = ref(false);
const workItemLoadError = ref('');
const selectedDrawing = ref<DocProjectDrawing>();

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
const drawingDetailTitle = computed(() => {
  if (!selectedDrawing.value) {
    return '图纸详情';
  }
  return `图纸详情 / ${selectedDrawing.value.drawingCode || selectedDrawing.value.orderSerialNo || '未命名图纸'}`;
});
let workItemSeed = 0;

function createWorkItemLocalKey(id?: DocmanId) {
  if (id != undefined) {
    return `drawing-work-item-${id}`;
  }
  workItemSeed += 1;
  return `drawing-work-item-new-${workItemSeed}`;
}

function buildEditableWorkItem(item: Partial<DocProjectDrawingWorkItem> = {}): EditableDrawingWorkItem {
  return {
    localKey: createWorkItemLocalKey(item.id),
    id: item.id,
    projectId: item.projectId ?? projectId.value ?? '',
    drawingId: item.drawingId ?? workItemDialog.drawingId ?? '',
    workItemCode: item.workItemCode ?? '',
    workItemName: item.workItemName ?? '',
    category: item.category ?? '',
    unit: item.unit ?? '',
    quantity: item.quantity,
    includeInEstimate: item.includeInEstimate ?? true,
    remark: item.remark ?? '',
    saving: false,
    deleting: false
  };
}

function normalizeText(value?: string) {
  return value?.trim() || '';
}

function buildWorkItemPayload(row: EditableDrawingWorkItem): DocProjectDrawingWorkItemForm {
  return {
    id: row.id,
    projectId: projectId.value || '',
    drawingId: workItemDialog.drawingId || '',
    workItemCode: normalizeText(row.workItemCode),
    workItemName: normalizeText(row.workItemName),
    category: normalizeText(row.category),
    unit: normalizeText(row.unit),
    quantity: row.quantity,
    includeInEstimate: row.includeInEstimate ?? true,
    remark: normalizeText(row.remark)
  };
}

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
    syncSelectedDrawing();
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

function resetDrawingDetail() {
  selectedDrawing.value = undefined;
  workItemDialog.drawingId = undefined;
  workItemDialog.drawingCode = '';
  workItems.value = [];
  workItemLoadError.value = '';
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
    workItems.value = (res.data || []).map((item) => buildEditableWorkItem(item));
  } catch (error) {
    workItems.value = [];
    workItemLoadError.value = handleApiError(error, '图纸工作量加载失败');
  } finally {
    workItemLoading.value = false;
  }
}

async function handleManageWorkItems(row: DocProjectDrawing) {
  workItemDialog.visible = true;
  workItemDialog.title = '图纸详情';
  workItemDialog.drawingId = String(row.id || '');
  workItemDialog.drawingCode = row.drawingCode || row.orderSerialNo || '';
  selectedDrawing.value = { ...row };
  await loadWorkItems(workItemDialog.drawingId);
}

function handleEditSelectedDrawing() {
  if (!selectedDrawing.value) {
    return;
  }
  handleUpdate(selectedDrawing.value);
}

function handleAppendWorkItemRow() {
  if (!hasProjectId.value || !workItemDialog.drawingId) {
    return;
  }
  workItems.value = [...workItems.value, buildEditableWorkItem()];
}

async function handleSaveWorkItem(row: EditableDrawingWorkItem) {
  if (!hasProjectId.value || !workItemDialog.drawingId || row.saving) {
    return;
  }
  row.saving = true;
  try {
    const payload = buildWorkItemPayload(row);
    Object.assign(row, payload);
    const res = await saveDrawingWorkItem(payload);
    if (row.id == undefined && res.data != undefined) {
      row.id = res.data;
      row.localKey = createWorkItemLocalKey(res.data);
    }
    ElMessage.success(payload.id ? '修改成功' : '新增成功');
  } catch (error) {
    handleApiError(error, '工作量保存失败');
  } finally {
    row.saving = false;
  }
}

function removeLocalWorkItem(localKey: string) {
  workItems.value = workItems.value.filter((item) => item.localKey !== localKey);
}

function handleDeleteWorkItem(row: EditableDrawingWorkItem) {
  if (row.id == undefined) {
    removeLocalWorkItem(row.localKey);
    return;
  }
  if (!workItemDialog.drawingId || row.deleting) {
    return;
  }
  ElMessageBox.confirm('是否确认删除该工作量项？', '提示', { type: 'warning' })
    .then(async () => {
      row.deleting = true;
      try {
        await deleteDrawingWorkItems([row.id!]);
        ElMessage.success('删除成功');
        removeLocalWorkItem(row.localKey);
      } catch (error) {
        handleApiError(error, '工作量删除失败');
      } finally {
        row.deleting = false;
      }
    })
    .catch(() => undefined);
}

function handleDeleteSelectedDrawing() {
  handleDelete(selectedDrawing.value?.id, true);
}

function handleDelete(id?: number | string, closeDetail = false) {
  if (id == undefined) {
    return;
  }
  ElMessageBox.confirm('是否确认删除该图纸记录？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteProjectDrawing([id]);
        ElMessage.success('删除成功');
        if (closeDetail) {
          workItemDialog.visible = false;
        }
        await getList();
      } catch (error) {
        handleApiError(error, '图纸删除失败');
      }
    })
    .catch(() => undefined);
}

function syncSelectedDrawing() {
  if (!selectedDrawing.value) {
    return;
  }
  const latest = rows.value.find((row) => String(row.id) === String(selectedDrawing.value?.id));
  if (!latest) {
    resetDrawingDetail();
    return;
  }
  selectedDrawing.value = { ...latest };
  workItemDialog.drawingId = latest.id == undefined ? undefined : String(latest.id);
  workItemDialog.drawingCode = latest.drawingCode || latest.orderSerialNo || '';
}

onMounted(() => {
  reset();
  getList();
});
</script>

<style scoped>
.drawing-detail-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 132px);
}

.drawing-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.drawing-detail-header__meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drawing-detail-header__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.drawing-detail-header__subtitle {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

.drawing-detail-card {
  border: 1px solid #e2e8f0;
}

.drawing-detail-card--fill {
  flex: 1;
}

.drawing-detail-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.drawing-detail-card__title-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.drawing-detail-card__tip {
  color: #64748b;
  font-size: 13px;
}

.drawing-detail-card__action {
  font-size: 13px;
}

:deep(.drawing-detail-card--fill .el-card__body) {
  height: calc(100% - 57px);
  display: flex;
  flex-direction: column;
}

@media (max-width: 960px) {
  .drawing-detail-header,
  .drawing-detail-card__header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
