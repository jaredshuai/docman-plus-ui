<template>
  <div class="app-container" v-loading="loading" data-testid="dashboard-page">
    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="dashboard-row" />
    <!-- 第一行：概览数据卡片 -->
    <el-row :gutter="16" class="dashboard-row" data-testid="stat-cards-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" data-testid="stat-card-projects">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409eff">
              <el-icon><Folder /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalProjects }}</div>
              <div class="stat-label">项目总数</div>
              <div class="stat-sub">进行中 {{ overview.activeProjects }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" data-testid="stat-card-documents">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ overview.totalDocuments }}</div>
              <div class="stat-label">文档总数</div>
              <div class="stat-sub" :style="{ color: overview.pendingDocuments > 0 ? '#e6a23c' : '#909399' }">
                待处理 {{ overview.pendingDocuments }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" data-testid="stat-card-overdue">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: overview.overdueNodes > 0 ? '#f56c6c' : '#909399' }">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value" :style="{ color: overview.overdueNodes > 0 ? '#f56c6c' : '#606266' }">
                {{ overview.overdueNodes }}
              </div>
              <div class="stat-label">超期节点</div>
              <div class="stat-sub">需及时处理</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card" data-testid="stat-card-plugins">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: overview.pluginFailCount > 0 ? '#f56c6c' : '#67c23a' }">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value" :style="{ color: overview.pluginFailCount > 0 ? '#f56c6c' : '#67c23a' }">
                {{ overview.pluginFailCount }}
              </div>
              <div class="stat-label">插件失败(近7天)</div>
              <div class="stat-sub">执行异常</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：项目进度 + 超期预警 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :xs="24" :lg="14">
        <el-card shadow="hover" data-testid="project-progress-card">
          <template #header>
            <span style="font-weight: bold">项目进度</span>
          </template>
          <el-table :data="projectProgressList" border stripe max-height="320" :row-key="(row) => row.projectId">
            <el-table-column prop="projectName" label="项目名称" min-width="120" />
            <el-table-column label="文档" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.totalDocuments }}</span>
                <span v-if="row.pendingDocuments > 0" style="color: #e6a23c"> ({{ row.pendingDocuments }})</span>
              </template>
            </el-table-column>
            <el-table-column label="进度" min-width="200">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; gap: 8px">
                  <el-progress :percentage="row.progressRate" :stroke-width="12" :color="getProgressColor(row.progressRate)" style="flex: 1" />
                  <span style="min-width: 60px; text-align: right">{{ row.completedNodes }}/{{ row.totalNodes }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="10">
        <el-card shadow="hover" data-testid="deadline-alert-card">
          <template #header>
            <span style="font-weight: bold">即将超期节点</span>
          </template>
          <el-table :data="deadlineAlertList" border stripe max-height="320" :row-key="(row) => row.id">
            <el-table-column prop="projectName" label="项目" min-width="100" show-overflow-tooltip />
            <el-table-column prop="nodeName" label="节点" min-width="100" show-overflow-tooltip />
            <el-table-column prop="deadline" label="截止日期" width="110" align="center" />
            <el-table-column label="剩余" width="80" align="center">
              <template #default="{ row }">
                <span :style="{ color: getRemainColor(row.remainDays), fontWeight: 'bold' }"> {{ row.remainDays }}天 </span>
              </template>
            </el-table-column>
            <el-table-column prop="reminderCount" label="提醒次数" width="80" align="center" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：插件执行统计 -->
    <el-row :gutter="16" class="dashboard-row">
      <el-col :span="24">
        <el-card shadow="hover" data-testid="plugin-stats-card">
          <template #header>
            <span style="font-weight: bold">插件执行统计</span>
          </template>
          <el-table :data="pluginStatsList" border stripe :row-key="(row) => row.pluginId">
            <el-table-column prop="pluginName" label="插件名称" min-width="150" />
            <el-table-column label="执行次数" align="center">
              <template #default="{ row }">
                <span
                  >成功 <span style="color: #67c23a">{{ row.successCount }}</span></span
                >
                <span style="margin: 0 8px">/</span>
                <span
                  >失败 <span :style="{ color: row.failCount > 0 ? '#f56c6c' : '#909399' }">{{ row.failCount }}</span></span
                >
              </template>
            </el-table-column>
            <el-table-column label="成功率" width="150" align="center">
              <template #default="{ row }">
                <el-progress
                  :percentage="getSuccessRate(row)"
                  :stroke-width="10"
                  :color="getSuccessRate(row) > 80 ? '#67c23a' : getSuccessRate(row) > 50 ? '#e6a23c' : '#f56c6c'"
                />
              </template>
            </el-table-column>
            <el-table-column label="平均耗时" width="120" align="center">
              <template #default="{ row }">
                {{ row.avgCostMs ? row.avgCostMs.toFixed(0) + ' ms' : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Folder, Document, Warning, Cpu } from '@element-plus/icons-vue';
import {
  getOverview,
  getProjectProgress,
  getDeadlineAlert,
  getPluginStats,
  type DashboardOverview,
  type ProjectProgress,
  type DeadlineAlert,
  type PluginStats
} from '@/api/docman/dashboard';
import { handleApiError } from '@/utils/error';

const loading = ref(true);
const loadError = ref('');

const overview = ref<DashboardOverview>({
  totalProjects: 0,
  activeProjects: 0,
  totalDocuments: 0,
  pendingDocuments: 0,
  overdueNodes: 0,
  pluginFailCount: 0
});

const projectProgressList = ref<ProjectProgress[]>([]);
const deadlineAlertList = ref<DeadlineAlert[]>([]);
const pluginStatsList = ref<PluginStats[]>([]);

/** 加载数据 */
const loadDashboard = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const [overviewRes, progressRes, deadlineRes, pluginRes] = await Promise.all([
      getOverview(),
      getProjectProgress(),
      getDeadlineAlert(),
      getPluginStats()
    ]);
    overview.value = overviewRes.data;
    projectProgressList.value = progressRes.data || [];
    deadlineAlertList.value = deadlineRes.data || [];
    pluginStatsList.value = pluginRes.data || [];
  } catch (e) {
    loadError.value = handleApiError(e, '仪表盘数据加载失败');
  } finally {
    loading.value = false;
  }
};

/** 进度条颜色 */
const getProgressColor = (rate: number): string => {
  if (rate >= 80) return '#67c23a';
  if (rate >= 50) return '#409eff';
  return '#e6a23c';
};

/** 剩余天数颜色 */
const getRemainColor = (days: number): string => {
  if (days > 7) return '#67c23a';
  if (days >= 1) return '#e6a23c';
  return '#f56c6c';
};

/** 成功率 */
const getSuccessRate = (row: PluginStats): number => {
  if (row.totalCount === 0) return 0;
  return Math.round((row.successCount / row.totalCount) * 100);
};

onMounted(() => loadDashboard());
</script>

<style scoped>
.dashboard-row {
  margin-bottom: 16px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  font-size: 28px;
  color: #fff;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 2px;
}
</style>
