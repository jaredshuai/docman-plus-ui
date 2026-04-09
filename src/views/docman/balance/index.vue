<template>
  <div class="app-container" data-testid="balance-page">
    <el-page-header @back="$router.back()">
      <template #content>项目经理平料</template>
    </el-page-header>

    <el-alert
      v-if="!hasProjectId"
      title="请先在项目管理中选择项目后再进入项目经理页面"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />

    <template v-else>
      <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" style="margin-top: 16px" />

      <el-card v-loading="loading" style="margin-top: 16px">
        <template #header>项目概览</template>
        <el-descriptions v-if="workspace" :column="3" border>
          <el-descriptions-item label="项目名称">{{ workspace.projectName }}</el-descriptions-item>
          <el-descriptions-item label="当前节点">{{ workspace.currentNodeName }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">{{ workspace.runtimeStatus }}</el-descriptions-item>
          <el-descriptions-item label="图纸数量">{{ workspace.drawingCount }}</el-descriptions-item>
          <el-descriptions-item label="签证数量">{{ workspace.visaCount }}</el-descriptions-item>
          <el-descriptions-item label="项目类型">{{ workspace.projectTypeCode || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card>
            <template #header>最新估算结果</template>
            <template v-if="estimateSnapshot">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="估算金额">{{ estimateSnapshot.estimateAmount ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="估算状态">{{ estimateSnapshot.status || '-' }}</el-descriptions-item>
                <el-descriptions-item label="图纸口径">{{ estimateSnapshot.drawingCount ?? workspace?.drawingCount ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="签证口径">{{ estimateSnapshot.visaCount ?? workspace?.visaCount ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="生成时间" :span="2">{{ estimateSnapshot.createTime || '-' }}</el-descriptions-item>
              </el-descriptions>
              <el-alert v-if="estimateSnapshot.summary" :title="estimateSnapshot.summary" type="info" :closable="false" style="margin-top: 12px" />
            </template>
            <el-empty v-else description="暂无估算结果" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>最新平料记录</template>
            <template v-if="latestBalance">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="材料价格">{{ latestBalance.materialPrice ?? '-' }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ latestBalance.status || '-' }}</el-descriptions-item>
                <el-descriptions-item label="更新时间" :span="2">{{
                  latestBalance.updateTime || latestBalance.createTime || '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">{{ latestBalance.balanceRemark || '-' }}</el-descriptions-item>
              </el-descriptions>
            </template>
            <el-empty v-else description="暂无平料记录" />
          </el-card>
        </el-col>
      </el-row>

      <el-card style="margin-top: 16px">
        <template #header>平料录入</template>
        <el-form :model="balanceForm" label-width="110px" style="max-width: 560px">
          <el-form-item label="材料价格">
            <el-input-number v-model="balanceForm.materialPrice" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="平料备注">
            <el-input v-model="balanceForm.balanceRemark" type="textarea" :rows="4" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="saving" :disabled="!canSave" @click="handleSaveBalance" v-hasPermi="['docman:project:edit']">
              保存平料
            </el-button>
            <span v-if="!canSave" class="balance-tip">暂无估算结果，当前无法平料</span>
          </el-form-item>
        </el-form>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getProjectLatestBalance, saveProjectBalance } from '@/api/docman/balance';
import { getProjectLatestEstimate } from '@/api/docman/estimate';
import { getProjectWorkspace } from '@/api/docman/workspace';
import type { DocProjectBalanceAdjustment, DocProjectEstimateSnapshot, DocProjectWorkspace } from '@/api/docman/types';
import { useRouteProjectId } from '@/hooks/useRouteProjectId';
import { handleApiError } from '@/utils/error';
import { canSubmitBalance, createBalanceForm } from './balance.util';

const route = useRoute();
const { projectId, hasProjectId } = useRouteProjectId(route);

const loading = ref(false);
const saving = ref(false);
const loadError = ref('');
const workspace = ref<DocProjectWorkspace>();
const estimateSnapshot = ref<DocProjectEstimateSnapshot>();
const latestBalance = ref<DocProjectBalanceAdjustment>();

const balanceForm = reactive(createBalanceForm());
const canSave = computed(() => canSubmitBalance(estimateSnapshot.value));

async function loadAll() {
  if (!hasProjectId.value) {
    workspace.value = undefined;
    estimateSnapshot.value = undefined;
    latestBalance.value = undefined;
    Object.assign(balanceForm, createBalanceForm());
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const [workspaceRes, estimateRes, balanceRes] = await Promise.all([
      getProjectWorkspace(projectId.value),
      getProjectLatestEstimate(projectId.value).catch(() => ({ data: undefined })),
      getProjectLatestBalance(projectId.value).catch(() => ({ data: undefined }))
    ]);
    workspace.value = workspaceRes.data;
    estimateSnapshot.value = estimateRes.data;
    latestBalance.value = balanceRes.data;
    Object.assign(balanceForm, createBalanceForm(balanceRes.data));
  } catch (error) {
    loadError.value = handleApiError(error, '项目经理页面加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleSaveBalance() {
  if (!hasProjectId.value || !canSave.value) return;
  saving.value = true;
  try {
    await saveProjectBalance(projectId.value, {
      id: balanceForm.id,
      materialPrice: balanceForm.materialPrice,
      balanceRemark: balanceForm.balanceRemark
    });
    ElMessage.success('平料保存成功');
    await loadAll();
  } catch (error) {
    handleApiError(error, '平料保存失败');
  } finally {
    saving.value = false;
  }
}

watch(
  projectId,
  () => {
    loadAll();
  },
  { immediate: true }
);
</script>

<style scoped>
.balance-tip {
  margin-left: 12px;
  color: #909399;
  font-size: 13px;
}
</style>
