<template>
  <div class="app-container" data-testid="workload-item-page">
    <el-page-header @back="$router.back()">
      <template #content>工作量基础维护</template>
    </el-page-header>

    <el-card style="margin-top: 16px">
      <el-form :inline="true">
        <el-form-item label="工作量名称">
          <el-input v-model="query.keyword" placeholder="输入名称搜索" clearable @keyup.enter="loadItems" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="loadItems">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['docman:workload-item:edit']">新增工作量</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table v-loading="loading" :data="filteredItems" border style="margin-top: 16px">
      <el-table-column prop="itemName" label="工作量名称" min-width="180" fixed="left" show-overflow-tooltip />
      <el-table-column prop="technician" label="技工" width="100" />
      <el-table-column prop="technicianCoefficient" label="技工系数" width="110" />
      <el-table-column prop="generalWorker" label="普工" width="100" />
      <el-table-column prop="generalWorkerCoefficient" label="普工系数" width="110" />
      <el-table-column prop="machineShift" label="机械台班" width="110" />
      <el-table-column prop="machineShiftUnitPrice" label="机械台班单价" width="130" />
      <el-table-column prop="machineShiftCoefficient" label="机械台班系数" width="130" />
      <el-table-column prop="instrumentShift" label="仪器仪表台班" width="130" />
      <el-table-column prop="instrumentShiftUnitPrice" label="仪器仪表台班单价" width="150" />
      <el-table-column prop="instrumentShiftCoefficient" label="仪器仪表系数" width="130" />
      <el-table-column prop="materialQuantity" label="材料数量" width="110" />
      <el-table-column prop="materialUnitPrice" label="材料单价" width="110" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status === 'active' ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)" v-hasPermi="['docman:workload-item:edit']">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)" v-hasPermi="['docman:workload-item:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.open" :title="dialog.title" width="920px">
      <el-form :model="form" label-width="140px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="工作量名称" required>
              <el-input v-model="form.itemName" placeholder="请输入工作量名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio value="active">启用</el-radio>
                <el-radio value="inactive">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="技工">
              <el-input-number v-model="form.technician" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="技工系数">
              <el-input-number v-model="form.technicianCoefficient" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="普工">
              <el-input-number v-model="form.generalWorker" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="普工系数">
              <el-input-number v-model="form.generalWorkerCoefficient" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="机械台班">
              <el-input-number v-model="form.machineShift" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="机械台班单价">
              <el-input-number v-model="form.machineShiftUnitPrice" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="机械台班系数">
              <el-input-number v-model="form.machineShiftCoefficient" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="仪器仪表台班">
              <el-input-number v-model="form.instrumentShift" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仪器仪表台班单价">
              <el-input-number v-model="form.instrumentShiftUnitPrice" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="仪器仪表系数">
              <el-input-number v-model="form.instrumentShiftCoefficient" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="材料数量">
              <el-input-number v-model="form.materialQuantity" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="材料单价">
              <el-input-number v-model="form.materialUnitPrice" :min="0" :precision="5" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="排序">
              <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.open = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { deleteWorkloadItem, listWorkloadItem, saveWorkloadItem } from '@/api/docman/workloadItem';
import type { DocTelecomWorkloadItem, DocTelecomWorkloadItemForm } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';

const loading = ref(false);
const saving = ref(false);
const itemList = ref<DocTelecomWorkloadItem[]>([]);
const query = reactive({ keyword: '' });
const dialog = reactive({ open: false, title: '新增工作量' });
const form = reactive<DocTelecomWorkloadItemForm>(createDefaultForm());

const filteredItems = computed(() => {
  const keyword = query.keyword.trim();
  if (!keyword) {
    return itemList.value;
  }
  return itemList.value.filter((item) => item.itemName?.includes(keyword));
});

function createDefaultForm(): DocTelecomWorkloadItemForm {
  return {
    id: undefined,
    itemName: '',
    technician: 0,
    technicianCoefficient: 1,
    generalWorker: 0,
    generalWorkerCoefficient: 1,
    machineShift: 0,
    machineShiftUnitPrice: 0,
    machineShiftCoefficient: 1,
    instrumentShift: 0,
    instrumentShiftUnitPrice: 0,
    instrumentShiftCoefficient: 1,
    materialQuantity: 0,
    materialUnitPrice: 0,
    sortOrder: 0,
    status: 'active',
    description: ''
  };
}

async function loadItems() {
  loading.value = true;
  try {
    const res = await listWorkloadItem();
    itemList.value = res.data || [];
  } catch (error) {
    handleApiError(error, '加载工作量基础维护失败');
  } finally {
    loading.value = false;
  }
}

function resetQuery() {
  query.keyword = '';
  loadItems();
}

function resetForm() {
  Object.assign(form, createDefaultForm());
}

function handleAdd() {
  resetForm();
  dialog.title = '新增工作量';
  dialog.open = true;
}

function handleEdit(row: DocTelecomWorkloadItem) {
  Object.assign(form, createDefaultForm(), row);
  dialog.title = '编辑工作量';
  dialog.open = true;
}

async function handleSave() {
  if (!form.itemName?.trim()) {
    ElMessage.warning('请输入工作量名称');
    return;
  }
  saving.value = true;
  try {
    await saveWorkloadItem(form);
    ElMessage.success('保存成功');
    dialog.open = false;
    await loadItems();
  } catch (error) {
    handleApiError(error, '保存工作量失败');
  } finally {
    saving.value = false;
  }
}

async function handleDelete(row: DocTelecomWorkloadItem) {
  await ElMessageBox.confirm(`确认删除工作量「${row.itemName}」？`, '提示', { type: 'warning' });
  try {
    await deleteWorkloadItem([row.id]);
    ElMessage.success('删除成功');
    await loadItems();
  } catch (error) {
    handleApiError(error, '删除工作量失败');
  }
}

onMounted(loadItems);
</script>
