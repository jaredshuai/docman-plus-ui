<template>
  <div class="app-container" data-testid="plugin-page">
    <!-- 插件列表展示区 -->
    <el-row :gutter="20" v-if="pluginList.length > 0">
      <el-col :span="6" v-for="plugin in pluginList" :key="plugin.pluginId" style="margin-bottom: 20px">
        <el-card
          shadow="hover"
          :class="['plugin-card', { 'is-active': queryParams.pluginId === plugin.pluginId }]"
          @click="handlePluginClick(plugin.pluginId)"
        >
          <div class="plugin-header">
            <span class="plugin-name">{{ plugin.pluginName }}</span>
            <el-tag size="small">{{ plugin.pluginType }}</el-tag>
          </div>
          <div class="plugin-id">ID: {{ plugin.pluginId }}</div>
          <div class="plugin-desc" v-if="plugin.inputFields && plugin.inputFields.length > 0">输入字段数: {{ plugin.inputFields.length }}</div>
        </el-card>
      </el-col>
    </el-row>
    <el-empty v-else-if="!pluginLoading" description="暂无已注册插件" />

    <el-divider>执行日志</el-divider>

    <el-alert
      v-if="!hasProjectId"
      title="请先在项目管理中选择项目后再查看执行日志"
      type="info"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />

    <!-- 执行日志查询表格 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="项目" prop="projectId">
        <el-select v-model="queryParams.projectId" placeholder="请选择项目" clearable style="width: 200px">
          <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="插件ID" prop="pluginId">
        <el-input v-model="queryParams.pluginId" placeholder="请输入插件ID" clearable style="width: 200px" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option v-for="dict in doc_plugin_execution_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="logList" :row-key="(row) => row.id" data-testid="plugin-log-table">
      <el-table-column label="项目ID" align="center" prop="projectId" width="80" />
      <el-table-column label="节点编码" align="center" prop="nodeCode" />
      <el-table-column label="插件名称" align="center" prop="pluginName" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="doc_plugin_execution_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="耗时(ms)" align="center" prop="costMs" />
      <el-table-column label="生成文件数" align="center" prop="generatedFileCount" />
      <el-table-column label="执行时间" align="center" prop="createTime" width="180" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="View" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="warning" link size="small" icon="RefreshRight" v-hasPermi="['docman:plugin:trigger']" @click="handleTrigger(scope.row)"
            >触发</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 详情抽屉 -->
    <el-drawer title="日志详情" v-model="drawer.open" size="50%">
      <el-descriptions :column="1" border v-if="drawer.data">
        <el-descriptions-item label="错误信息">
          <span style="color: #f56c6c">{{ drawer.data.errorMessage || '无' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="请求快照">
          <pre class="json-box">{{ formatJson(drawer.data.requestSnapshot) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="结果快照">
          <pre class="json-box">{{ formatJson(drawer.data.resultSnapshot) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { listExecutionLogs, listPlugins, triggerExecution, type DocPluginExecutionLogQuery, type DocPluginExecutionLogVo } from '@/api/docman/plugin';
import { ElMessage, ElMessageBox } from 'element-plus';
import { listProject } from '@/api/docman/project';
import { DocProject, DocPluginInfo } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_plugin_execution_status } = toRefs<any>(proxy?.useDict('doc_plugin_execution_status'));

const route = useRoute();
const queryRef = ref<any>();
const logList = ref<DocPluginExecutionLogVo[]>([]);
const pluginList = ref<DocPluginInfo[]>([]);
const projectOptions = ref<DocProject[]>([]);
const loading = ref(false);
const pluginLoading = ref(true);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectId: undefined,
    pluginId: undefined,
    status: undefined
  } as any,
  drawer: {
    open: false,
    data: {} as Partial<DocPluginExecutionLogVo>
  }
});

const { queryParams, drawer } = toRefs(data);
const hasProjectId = computed(() => Number.isFinite(Number(queryParams.value.projectId)) && Number(queryParams.value.projectId) > 0);

/** 查询插件列表 */
async function getPluginList() {
  pluginLoading.value = true;
  try {
    const res = await listPlugins();
    pluginList.value = res.data;
  } catch (e) {
    ElMessage.error('获取插件列表失败');
  } finally {
    pluginLoading.value = false;
  }
}

/** 查询日志列表 */
async function getList() {
  if (!hasProjectId.value) {
    logList.value = [];
    total.value = 0;
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await listExecutionLogs(queryParams.value);
    logList.value = res.rows;
    total.value = res.total;
  } catch (e) {
    ElMessage.error('获取执行日志失败');
  } finally {
    loading.value = false;
  }
}

/** 查询项目下拉选项 */
async function getProjectOptions() {
  try {
    const res = await listProject({ pageNum: 1, pageSize: 100 }) as any;
    projectOptions.value = res.rows;
  } catch (e) {
    ElMessage.error('获取项目列表失败');
  }
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  queryRef.value?.resetFields();
  handleQuery();
}

/** 插件卡片点击 */
function handlePluginClick(pluginId: string) {
  if (queryParams.value.pluginId === pluginId) {
    queryParams.value.pluginId = undefined;
  } else {
    queryParams.value.pluginId = pluginId;
  }
  handleQuery();
}

/** 手动触发 */
const handleTrigger = async (row: DocPluginExecutionLogVo) => {
  await ElMessageBox.confirm(`确认对节点「${row.nodeCode}」重新触发插件执行？`, '提示', { type: 'warning' });
  try {
    await triggerExecution({ processInstanceId: row.processInstanceId, nodeCode: row.nodeCode });
    ElMessage.success('触发成功');
    getList();
  } catch {
    ElMessage.error('触发失败，请重试');
  }
};

/** 详情按钮操作 */
function handleDetail(row: DocPluginExecutionLogVo) {
  drawer.value.data = row;
  drawer.value.open = true;
}

/** 格式化JSON */
function formatJson(jsonStr: string | undefined) {
  if (!jsonStr) return '无';
  try {
    return JSON.stringify(JSON.parse(jsonStr), null, 2);
  } catch (e) {
    return jsonStr;
  }
}

onMounted(() => {
  const projectId = route.query.projectId;
  if (projectId) {
    queryParams.value.projectId = Number(projectId);
  }
  Promise.all([getProjectOptions(), getPluginList()]);
  // Only load logs if projectId is present (backend requires it)
  if (hasProjectId.value) {
    getList();
  } else {
    loading.value = false;
  }
});
</script>

<style scoped>
.plugin-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}
.plugin-card:hover {
  transform: translateY(-5px);
}
.plugin-card.is-active {
  border: 2px solid #409eff;
  background-color: #ecf5ff;
}
.plugin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.plugin-name {
  font-weight: bold;
  font-size: 16px;
}
.plugin-id {
  color: #909399;
  font-size: 12px;
  margin-bottom: 8px;
}
.plugin-desc {
  font-size: 13px;
  color: #606266;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.json-box {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
