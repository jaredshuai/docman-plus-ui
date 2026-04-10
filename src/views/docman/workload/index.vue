<template>
  <div class="app-container" data-testid="workload-page">
    <el-page-header @back="router.back()">
      <template #content>工作量录入</template>
    </el-page-header>

    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" style="margin-top: 16px" />
    <el-alert
      v-else-if="!hasProjectId"
      title="缺少项目上下文，请从项目页进入工作量录入。"
      type="info"
      show-icon
      :closable="false"
      class="mb8"
      style="margin-top: 16px"
    />

    <template v-else>
      <el-row :gutter="10" class="mb8" style="margin-top: 16px">
        <el-col :span="1.5">
          <el-button type="primary" plain icon="Plus" data-testid="workload-add-button" @click="handleAdd" v-hasPermi="['docman:project:edit']">
            新建工作量记录
          </el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="pagedRows" border stripe :row-key="(row) => row.id" data-testid="workload-table">
        <el-table-column prop="estimatedPrice" label="预估价格" width="140" align="center" />
        <el-table-column label="是否启用" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enable ? 'success' : 'info'" size="small">
              {{ row.enable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工作量明细" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            {{ summarizeDetailNames(row.details) }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="180" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="handleUpdate(row)" v-hasPermi="['docman:project:edit']">编辑</el-button>
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

      <el-dialog v-model="dialog.visible" :title="dialog.title" width="820px" append-to-body data-testid="workload-dialog">
        <el-form ref="workloadFormRef" :model="form" label-width="100px" data-testid="workload-form">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="预估价格">
                <el-input-number
                  v-model="form.estimatedPrice"
                  :precision="2"
                  :min="0"
                  style="width: 100%"
                  data-testid="workload-form-estimated-price"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否启用">
                <el-switch v-model="form.enable" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" data-testid="workload-form-remark" />
          </el-form-item>
          <el-form-item label="工作量明细">
            <div class="workload-detail-panel">
              <el-button type="success" plain icon="Plus" @click="handleAddDetail">新增明细</el-button>
              <el-table :data="detailRows" border style="margin-top: 12px">
                <el-table-column label="工作量名称" min-width="180">
                  <template #default="{ row }">
                    <el-input v-model="row.name" placeholder="工作量名称" />
                  </template>
                </el-table-column>
                <el-table-column label="别名" min-width="140">
                  <template #default="{ row }">
                    <el-input v-model="row.alias" placeholder="别名" />
                  </template>
                </el-table-column>
                <el-table-column label="价格" width="140">
                  <template #default="{ row }">
                    <el-input-number v-model="row.price" :precision="2" :min="0" style="width: 100%" />
                  </template>
                </el-table-column>
                <el-table-column label="备注" min-width="180">
                  <template #default="{ row }">
                    <el-input v-model="row.remark" placeholder="备注" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" align="center">
                  <template #default="{ $index }">
                    <el-button type="danger" link @click="handleRemoveDetail($index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button type="primary" data-testid="workload-submit-button" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
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
import { deleteProjectAddRecord, listProjectAddRecords, saveProjectAddRecord } from '@/api/docman/addRecord';
import type { DocProjectAddRecord, DocProjectAddRecordDetailForm, DocProjectAddRecordForm } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';
import { paginateRows, resolvePathProjectId } from '../inputLine/inputLine.util';
import { createEmptyDetail, normalizeDetails, summarizeDetailNames } from './workload.util';

const route = useRoute();
const router = useRouter();

const projectId = computed(() => resolvePathProjectId(route.params.projectId));
const hasProjectId = computed(() => Boolean(projectId.value));

const records = ref<DocProjectAddRecord[]>([]);
const total = ref(0);
const loading = ref(false);
const loadError = ref('');
const workloadFormRef = ref();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

const initFormData: DocProjectAddRecordForm = {
  id: undefined,
  projectId: '',
  enable: true,
  estimatedPrice: undefined,
  remark: '',
  details: []
};

const form = reactive<DocProjectAddRecordForm>({ ...initFormData });
const detailRows = ref<DocProjectAddRecordDetailForm[]>([]);
const pagedRows = computed(() => paginateRows(records.value, queryParams.pageNum, queryParams.pageSize));

async function getList() {
  if (!hasProjectId.value) {
    records.value = [];
    total.value = 0;
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const res = await listProjectAddRecords(projectId.value!);
    records.value = res.data || [];
    total.value = records.value.length;
  } catch (error) {
    records.value = [];
    total.value = 0;
    loadError.value = handleApiError(error, '工作量记录加载失败');
  } finally {
    loading.value = false;
  }
}

function handlePageChange() {
  total.value = records.value.length;
}

function reset() {
  Object.assign(form, { ...initFormData, projectId: projectId.value || '' });
  detailRows.value = [createEmptyDetail(projectId.value || '')];
  workloadFormRef.value?.resetFields?.();
}

function handleAdd() {
  reset();
  dialog.visible = true;
  dialog.title = '新建工作量记录';
}

function handleUpdate(row: DocProjectAddRecord) {
  reset();
  Object.assign(form, {
    id: row.id,
    projectId: projectId.value || '',
    enable: row.enable ?? true,
    estimatedPrice: row.estimatedPrice,
    remark: row.remark || ''
  });
  detailRows.value = normalizeDetails(row.details, projectId.value || '');
  dialog.visible = true;
  dialog.title = '编辑工作量记录';
}

function cancel() {
  dialog.visible = false;
  reset();
}

function handleAddDetail() {
  detailRows.value.push(createEmptyDetail(projectId.value || ''));
}

function handleRemoveDetail(index: number) {
  if (detailRows.value.length === 1) {
    detailRows.value = [createEmptyDetail(projectId.value || '')];
    return;
  }
  detailRows.value.splice(index, 1);
}

async function submitForm() {
  if (!hasProjectId.value) {
    return;
  }
  try {
    await saveProjectAddRecord({
      ...form,
      projectId: projectId.value,
      details: detailRows.value.map((detail) => ({
        ...detail,
        projectId: projectId.value!,
        projectAddRecordId: form.id
      }))
    });
    ElMessage.success(form.id ? '修改成功' : '新增成功');
    dialog.visible = false;
    await getList();
  } catch (error) {
    handleApiError(error, '工作量保存失败');
  }
}

function handleDelete(id?: number) {
  if (id == undefined) {
    return;
  }
  ElMessageBox.confirm('是否确认删除该工作量记录？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        await deleteProjectAddRecord([id]);
        ElMessage.success('删除成功');
        await getList();
      } catch (error) {
        handleApiError(error, '工作量删除失败');
      }
    })
    .catch(() => undefined);
}

onMounted(() => {
  reset();
  getList();
});
</script>

<style scoped>
.workload-detail-panel {
  width: 100%;
}
</style>
