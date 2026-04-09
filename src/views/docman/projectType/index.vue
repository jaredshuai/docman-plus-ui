<template>
  <div class="app-container" data-testid="project-type-page">
    <el-page-header @back="$router.back()">
      <template #content>项目类型配置</template>
    </el-page-header>

    <el-row :gutter="10" class="mb8" style="margin-top: 16px">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['docman:project:edit']">新增项目类型</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="typeList" border>
      <el-table-column prop="code" label="编码" min-width="140" />
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="customerType" label="客户类型" width="120" />
      <el-table-column prop="sortOrder" label="排序" width="90" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.open" :title="dialog.title" width="520px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="客户类型"><el-input v-model="form.customerType" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" /></el-form-item>
        <el-form-item label="状态"><el-input v-model="form.status" /></el-form-item>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.open = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { deleteProjectType, listProjectType, saveProjectType } from '@/api/docman/projectType';
import type { DocProjectType, DocProjectTypeForm } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';

const loading = ref(false);
const typeList = ref<DocProjectType[]>([]);
const dialog = reactive({ open: false, title: '新增项目类型' });
const form = reactive<DocProjectTypeForm>({ code: '', name: '', customerType: 'telecom', sortOrder: 1, status: 'active', description: '' });

async function loadTypes() {
  loading.value = true;
  try {
    const res = await listProjectType();
    typeList.value = res.data || [];
  } catch (error) {
    handleApiError(error, '加载项目类型失败');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, { id: undefined, code: '', name: '', customerType: 'telecom', sortOrder: 1, status: 'active', description: '' });
}

function handleAdd() {
  resetForm();
  dialog.title = '新增项目类型';
  dialog.open = true;
}

function handleEdit(row: DocProjectType) {
  Object.assign(form, row);
  dialog.title = '编辑项目类型';
  dialog.open = true;
}

async function handleSave() {
  try {
    await saveProjectType(form);
    ElMessage.success('保存成功');
    dialog.open = false;
    await loadTypes();
  } catch (error) {
    handleApiError(error, '保存项目类型失败');
  }
}

async function handleDelete(row: DocProjectType) {
  await ElMessageBox.confirm(`确认删除项目类型「${row.name}」？`, '提示', { type: 'warning' });
  try {
    await deleteProjectType([row.id]);
    ElMessage.success('删除成功');
    await loadTypes();
  } catch (error) {
    handleApiError(error, '删除项目类型失败');
  }
}

onMounted(loadTypes);
</script>
