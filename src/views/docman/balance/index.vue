<template>
  <div class="app-container" data-testid="balance-page">
    <el-page-header @back="$router.back()">
      <template #content>项目经理平料</template>
    </el-page-header>

    <el-alert
      v-if="projectContextMessage"
      :title="projectContextMessage"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />

    <template v-else>
      <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" style="margin-top: 16px" />
      <el-alert
        v-else-if="workspaceWarning"
        :title="workspaceWarning"
        type="warning"
        show-icon
        :closable="false"
        class="mb8"
        style="margin-top: 16px"
      />

      <el-card v-loading="loading" style="margin-top: 16px">
        <template #header>项目概览</template>
        <el-descriptions v-if="projectDetail" :column="3" border>
          <el-descriptions-item label="项目名称">{{ projectDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="当前节点">{{ workspace?.currentNodeName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">{{ workspace?.runtimeStatus || '-' }}</el-descriptions-item>
          <el-descriptions-item label="图纸数量 / 计入口径">
            {{ drawingCountSummary }}
          </el-descriptions-item>
          <el-descriptions-item label="签证数量 / 计入口径">
            {{ visaCountSummary }}
          </el-descriptions-item>
          <el-descriptions-item label="项目类型">{{ projectDetail.projectTypeCode || workspace?.projectTypeCode || '-' }}</el-descriptions-item>
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
                <el-descriptions-item label="图纸口径">{{
                  estimateSnapshot.drawingCount ?? workspace?.includedDrawingCount ?? workspace?.drawingCount ?? '-'
                }}</el-descriptions-item>
                <el-descriptions-item label="签证口径">{{
                  estimateSnapshot.visaCount ?? workspace?.includedVisaCount ?? workspace?.visaCount ?? '-'
                }}</el-descriptions-item>
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
import { getProject } from '@/api/docman/project';
import { getProjectWorkspace } from '@/api/docman/workspace';
import type { DocProject, DocProjectBalanceAdjustment, DocProjectEstimateSnapshot, DocProjectWorkspace } from '@/api/docman/types';
import { useRouteProjectId } from '@/hooks/useRouteProjectId';
import { getErrorMessage, handleApiError } from '@/utils/error';
import { canSubmitBalance, createBalanceForm, formatScopedCount, isMissingProjectContextError } from './balance.util';

const route = useRoute();
const { projectId, hasProjectId } = useRouteProjectId(route);

const loading = ref(false);
const saving = ref(false);
const loadError = ref('');
const workspaceWarning = ref('');
const invalidProjectMessage = ref('');
const projectDetail = ref<DocProject>();
const workspace = ref<DocProjectWorkspace>();
const estimateSnapshot = ref<DocProjectEstimateSnapshot>();
const latestBalance = ref<DocProjectBalanceAdjustment>();

const balanceForm = reactive(createBalanceForm());
const canSave = computed(() => canSubmitBalance(estimateSnapshot.value));
const projectContextMessage = computed(() => invalidProjectMessage.value || (!hasProjectId.value ? '请先在项目管理中选择项目后再进入项目经理页面' : ''));
const drawingCountSummary = computed(() => formatScopedCount(workspace.value?.drawingCount, workspace.value?.includedDrawingCount));
const visaCountSummary = computed(() => formatScopedCount(workspace.value?.visaCount, workspace.value?.includedVisaCount));

async function loadAll() {
  if (!hasProjectId.value) {
    invalidProjectMessage.value = '';
    workspaceWarning.value = '';
    loadError.value = '';
    projectDetail.value = undefined;
    workspace.value = undefined;
    estimateSnapshot.value = undefined;
    latestBalance.value = undefined;
    Object.assign(balanceForm, createBalanceForm());
    return;
  }
  loading.value = true;
  loadError.value = '';
  workspaceWarning.value = '';
  invalidProjectMessage.value = '';
  try {
    projectDetail.value = await getProject(projectId.value);
    const [workspaceRes, estimateRes, balanceRes] = await Promise.all([
      getProjectWorkspace(projectId.value).catch((error) => {
        workspaceWarning.value = getErrorMessage(error) || '项目工作流信息暂不可用，不影响查看和录入平料';
        return { data: undefined };
      }),
      getProjectLatestEstimate(projectId.value).catch(() => ({ data: undefined })),
      getProjectLatestBalance(projectId.value).catch(() => ({ data: undefined }))
    ]);
    workspace.value = workspaceRes.data;
    estimateSnapshot.value = estimateRes.data;
    latestBalance.value = balanceRes.data;
    Object.assign(balanceForm, createBalanceForm(balanceRes.data));
  } catch (error) {
    const message = getErrorMessage(error);
    if (isMissingProjectContextError(message)) {
      invalidProjectMessage.value = '当前项目不存在或你已无权访问，请返回项目管理重新选择项目';
      projectDetail.value = undefined;
      workspace.value = undefined;
      estimateSnapshot.value = undefined;
      latestBalance.value = undefined;
      Object.assign(balanceForm, createBalanceForm());
      return;
    }
    loadError.value = handleApiError(error, '项目经理页面加载失败', {
      showMessage: false,
      preferErrorMessage: true
    });
  } finally {
    loading.value = false;
  }
}

async function handleSaveBalance() {
  if (!hasProjectId.value || !canSave.value) return;
  saving.value = true;
  try {
    await saveProjectBalance(projectId.value, {
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
