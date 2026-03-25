<template>
  <div class="app-container" data-testid="process-page">
    <el-page-header @back="$router.back()">
      <template #content>流程编排</template>
    </el-page-header>

    <el-alert
      v-if="!hasProjectId"
      title="请先在项目管理中选择项目后再进入流程编排"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />

    <el-card style="margin-top: 16px">
      <template #header>流程配置</template>

      <el-form :inline="true" v-if="!processConfig">
        <el-form-item label="选择流程模板">
          <el-select v-model="selectedDefinitionId" placeholder="请选择流程模板">
            <el-option v-for="item in definitionList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleBind" v-hasPermi="['docman:process:bind']">绑定流程</el-button>
        </el-form-item>
      </el-form>

      <div v-else>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="流程状态">
            <el-tag :type="proxy?.selectDictLabel(doc_process_status.value, processConfig.status)?.cssClass || 'info'">
              {{ proxy?.selectDictLabel(doc_process_status.value, processConfig.status)?.label || processConfig.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="流程定义ID">{{ processConfig.definitionId }}</el-descriptions-item>
          <el-descriptions-item label="流程实例ID">{{ processConfig.instanceId || '未启动' }}</el-descriptions-item>
        </el-descriptions>

        <el-button
          type="primary"
          style="margin-top: 16px"
          v-if="processConfig.status === 'pending'"
          @click="handleStart"
          v-hasPermi="['docman:process:start']"
        >
          启动流程
        </el-button>

        <div style="margin-top: 24px">
          <iframe
            v-if="processConfig.instanceId"
            :src="`/warm-flow-ui/#/flow/instance?instanceId=${processConfig.instanceId}`"
            style="width: 100%; height: 600px; border: 1px solid #dcdfe6; border-radius: 4px"
            allowfullscreen
          />
          <el-empty v-else description="流程未启动，暂无可视化内容" style="margin-top: 24px" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { bindProcess, startProcess, getProcessConfig, listProcessDefinitions } from '@/api/docman/process';
import { ElMessage } from 'element-plus';
import { DocProcessConfig } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_process_status } = toRefs(proxy?.useDict('doc_process_status') ?? {});

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const hasProjectId = computed(() => Number.isFinite(projectId.value) && projectId.value > 0);
const processConfig = ref<DocProcessConfig | null>(null);
const selectedDefinitionId = ref<number>();
const definitionList = ref<Array<{ id: number; name: string }>>([]);
const loadError = ref('');

async function loadConfig() {
  if (!hasProjectId.value) {
    processConfig.value = null;
    return;
  }
  try {
    const res = await getProcessConfig(projectId.value);
    processConfig.value = res.data;
  } catch (e) {
    processConfig.value = null;
    loadError.value = handleApiError(e, '获取流程配置失败');
  }
}

async function loadDefinitions() {
  try {
    const res = await listProcessDefinitions();
    definitionList.value = res.data;
  } catch (e) {
    definitionList.value = [];
    handleApiError(e, '获取流程模板失败');
  }
}

async function handleBind() {
  if (!hasProjectId.value) {
    ElMessage.warning('请先在项目管理中选择项目');
    return;
  }
  if (!selectedDefinitionId.value) return;
  try {
    await bindProcess(projectId.value, selectedDefinitionId.value);
    ElMessage.success('绑定成功');
    loadConfig();
  } catch (e) {
    handleApiError(e, '绑定失败');
  }
}

async function handleStart() {
  if (!hasProjectId.value) {
    ElMessage.warning('请先在项目管理中选择项目');
    return;
  }
  try {
    await startProcess(projectId.value);
    ElMessage.success('流程已启动');
    loadConfig();
  } catch (e) {
    handleApiError(e, '启动失败');
  }
}

onMounted(() => {
  Promise.all([loadConfig(), loadDefinitions()]);
});
</script>
