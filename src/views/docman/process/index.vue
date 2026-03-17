<template>
  <div class="p-2">
    <el-page-header @back="$router.back()">
      <template #content>
        <span>流程编排</span>
        <el-tag v-if="projectId" type="info" size="small" style="margin-left: 8px">项目ID: {{ projectId }}</el-tag>
      </template>
    </el-page-header>

    <el-card shadow="hover" style="margin-top: 16px">
      <template #header>流程配置</template>

      <!-- 未绑定流程：显示绑定表单 -->
      <div v-if="!processConfig" v-loading="loading">
        <el-form :inline="true">
          <el-form-item label="选择流程模板">
            <el-select v-model="selectedDefinitionId" placeholder="请选择">
              <!-- TODO: 待对接 Warm-Flow 流程定义列表接口 -->
              <el-option label="管线施工流程" :value="1" />
              <el-option label="弱电施工流程" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button v-hasPermi="['docman:process:bind']" type="primary" plain icon="Link" @click="handleBind">绑定流程</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 已绑定流程：显示配置详情 -->
      <div v-else>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="流程状态">
            <el-tag :type="processStatusType(processConfig.status)">
              {{ processStatusLabel(processConfig.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="流程定义ID">{{ processConfig.definitionId }}</el-descriptions-item>
          <el-descriptions-item label="流程实例ID">{{ processConfig.instanceId || '未启动' }}</el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 16px">
          <el-button
            v-if="processConfig.status === 'pending'"
            v-hasPermi="['docman:process:start']"
            type="primary"
            plain
            icon="VideoPlay"
            @click="handleStart"
          >
            启动流程
          </el-button>
        </div>

        <!-- 流程可视化占位区域 -->
        <div
          style="
            margin-top: 24px;
            min-height: 400px;
            border: 1px dashed #dcdfe6;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #909399;
          "
        >
          流程可视化区域（待集成 Warm-Flow / LogicFlow）
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { bindProcess, startProcess, getProcessConfig } from '@/api/docman/process';
import { DocProcessConfigVO } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const route = useRoute();

const projectId = ref(Number(route.query.projectId));
const processConfig = ref<DocProcessConfigVO | null>(null);
const selectedDefinitionId = ref<number>();
const loading = ref(true);

/** 流程状态 tag 颜色映射 */
const processStatusType = (s: string): string => {
  const map: Record<string, string> = { pending: 'warning', running: 'success', completed: 'info' };
  return map[s] || 'info';
};

/** 流程状态标签 */
const processStatusLabel = (s: string): string => {
  const map: Record<string, string> = { pending: '待启动', running: '运行中', completed: '已完成' };
  return map[s] || s;
};

/** 加载流程配置 */
const loadConfig = async () => {
  loading.value = true;
  try {
    const { data } = await getProcessConfig(projectId.value);
    processConfig.value = data;
  } catch {
    processConfig.value = null;
  }
  loading.value = false;
};

/** 绑定流程 */
const handleBind = async () => {
  if (!selectedDefinitionId.value) {
    proxy?.$modal.msgWarning('请先选择流程模板');
    return;
  }
  await bindProcess(projectId.value, selectedDefinitionId.value);
  proxy?.$modal.msgSuccess('绑定成功');
  await loadConfig();
};

/** 启动流程 */
const handleStart = async () => {
  await proxy?.$modal.confirm('确认启动流程？启动后将按流程定义自动执行。');
  await startProcess(projectId.value);
  proxy?.$modal.msgSuccess('流程已启动');
  await loadConfig();
};

onMounted(() => {
  loadConfig();
});
</script>
