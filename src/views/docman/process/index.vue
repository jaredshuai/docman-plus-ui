<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>流程编排</template>
    </el-page-header>

    <el-card style="margin-top: 16px;">
      <template #header>流程配置</template>

      <el-form :inline="true" v-if="!processConfig">
        <el-form-item label="选择流程模板">
          <el-select v-model="selectedDefinitionId" placeholder="请选择">
            <!-- TODO: 动态加载 Warm-Flow 流程定义列表 -->
            <el-option label="管线施工流程" :value="1" />
            <el-option label="弱电施工流程" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleBind" v-hasPermi="['docman:process:bind']">绑定流程</el-button>
        </el-form-item>
      </el-form>

      <div v-else>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="流程状态">
            <el-tag :type="processConfig.status === 'running' ? 'success' : 'info'">
              {{ { pending: '待启动', running: '运行中', completed: '已完成' }[processConfig.status] || processConfig.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="流程定义ID">{{ processConfig.definitionId }}</el-descriptions-item>
          <el-descriptions-item label="流程实例ID">{{ processConfig.instanceId || '未启动' }}</el-descriptions-item>
        </el-descriptions>

        <el-button type="primary" style="margin-top: 16px;" v-if="processConfig.status === 'pending'" @click="handleStart" v-hasPermi="['docman:process:start']">
          启动流程
        </el-button>

        <!-- TODO: 集成 Warm-Flow 流程设计器或 LogicFlow 可视化 -->
        <div style="margin-top: 24px; min-height: 400px; border: 1px dashed #dcdfe6; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #909399;">
          流程可视化区域（待集成）
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { bindProcess, startProcess, getProcessConfig } from '@/api/docman/process';
import { ElMessage } from 'element-plus';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const processConfig = ref<any>(null);
const selectedDefinitionId = ref<number>();

function loadConfig() {
  getProcessConfig(projectId.value).then((res: any) => {
    processConfig.value = res.data;
  });
}
function handleBind() {
  if (!selectedDefinitionId.value) return;
  bindProcess(projectId.value, selectedDefinitionId.value).then(() => {
    ElMessage.success('绑定成功');
    loadConfig();
  });
}
function handleStart() {
  startProcess(projectId.value).then(() => {
    ElMessage.success('流程已启动');
    loadConfig();
  });
}

onMounted(() => loadConfig());
</script>
