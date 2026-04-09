<template>
  <div class="app-container leader-dashboard" v-loading="loading" data-testid="dashboard-page">
    <el-alert
      title="领导概览为只读轻量视图，用于快速查看项目推进和文档完善度，不提供深度操作。"
      type="info"
      show-icon
      :closable="false"
      class="dashboard-row"
    />
    <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="dashboard-row" />

    <el-row :gutter="16" class="dashboard-row" data-testid="stat-cards-row">
      <el-col v-for="card in summaryCards" :key="card.key" :xs="24" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
              <div class="stat-sub">{{ card.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="dashboard-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" data-testid="project-progress-card">
          <template #header>
            <div class="panel-header">
              <span>项目级概览</span>
              <span class="panel-header__hint">按关注程度排序，仅展示只读信息</span>
            </div>
          </template>
          <el-table :data="projectSnapshots" border stripe max-height="420" :row-key="(row) => row.projectId">
            <el-table-column prop="projectName" label="项目名称" min-width="140" />
            <el-table-column label="流程推进" min-width="190">
              <template #default="{ row }">
                <div class="metric-cell">
                  <el-progress :percentage="row.progressRate" :stroke-width="10" :color="getProgressColor(row.progressRate)" style="flex: 1" />
                  <span class="metric-cell__suffix">{{ row.completedNodes }}/{{ row.totalNodes }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文档完善度" min-width="190">
              <template #default="{ row }">
                <div class="metric-cell">
                  <el-progress
                    :percentage="row.documentCompletionRate"
                    :stroke-width="10"
                    :color="getCompletionColor(row.documentCompletionRate)"
                    style="flex: 1"
                  />
                  <span class="metric-cell__suffix">{{ row.documentCompletionRate }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="待补文档" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.pendingDocuments > 0 ? 'warning' : 'success'" size="small">
                  {{ row.pendingDocuments }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="关注说明" min-width="200" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag :type="row.attentionLevel" effect="light" size="small">{{ attentionLabelMap[row.attentionLevel] }}</el-tag>
                <span class="attention-text">{{ row.attentionText }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="focus-card" data-testid="focus-project-card">
          <template #header>
            <div class="panel-header">
              <span>重点关注项目</span>
              <span class="panel-header__hint">优先看资料未齐或推进偏慢的项目</span>
            </div>
          </template>
          <el-empty v-if="focusProjects.length === 0" description="当前没有重点关注项目" />
          <div v-else class="focus-list">
            <div v-for="item in focusProjects" :key="item.projectId" class="focus-item">
              <div class="focus-item__top">
                <span class="focus-item__title">{{ item.projectName }}</span>
                <el-tag :type="item.attentionLevel" effect="light" size="small">{{ attentionLabelMap[item.attentionLevel] }}</el-tag>
              </div>
              <div class="focus-item__desc">{{ item.attentionText }}</div>
              <div class="focus-item__meta">
                <span>流程 {{ item.progressRate }}%</span>
                <span>文档 {{ item.documentCompletionRate }}%</span>
                <span>待补 {{ item.pendingDocuments }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="dashboard-row">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" data-testid="deadline-alert-card">
          <template #header>
            <div class="panel-header">
              <span>即将超期节点</span>
              <span class="panel-header__hint">默认仅展示最需要关注的 6 条</span>
            </div>
          </template>
          <el-table :data="deadlineDigest" border stripe max-height="320" :row-key="(row) => `${row.projectId}-${row.nodeCode}`">
            <el-table-column prop="projectName" label="项目" min-width="110" show-overflow-tooltip />
            <el-table-column prop="nodeName" label="节点" min-width="100" show-overflow-tooltip />
            <el-table-column label="剩余" width="88" align="center">
              <template #default="{ row }">
                <span :style="{ color: getRemainColor(row.remainDays), fontWeight: 'bold' }">{{ row.remainDays }}天</span>
              </template>
            </el-table-column>
            <el-table-column prop="reminderCount" label="提醒" width="80" align="center" />
          </el-table>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" data-testid="document-completion-card">
          <template #header>
            <div class="panel-header">
              <span>文档完善度分布</span>
              <span class="panel-header__hint">按项目文档完成度从低到高观察风险</span>
            </div>
          </template>
          <el-table :data="completionRanking" border stripe max-height="320" :row-key="(row) => row.projectId">
            <el-table-column prop="projectName" label="项目" min-width="140" show-overflow-tooltip />
            <el-table-column label="完善度" min-width="180">
              <template #default="{ row }">
                <div class="metric-cell">
                  <el-progress
                    :percentage="row.documentCompletionRate"
                    :stroke-width="10"
                    :color="getCompletionColor(row.documentCompletionRate)"
                    style="flex: 1"
                  />
                  <span class="metric-cell__suffix">{{ row.documentCompletionRate }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="文档" width="108" align="center">
              <template #default="{ row }">{{ row.totalDocuments - row.pendingDocuments }}/{{ row.totalDocuments }}</template>
            </el-table-column>
            <el-table-column label="待补" width="80" align="center">
              <template #default="{ row }">{{ row.pendingDocuments }}</template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CircleCheck, Document, FolderOpened, WarningFilled } from '@element-plus/icons-vue';
import {
  getOverview,
  getProjectProgress,
  getDeadlineAlert,
  type DashboardOverview,
  type DeadlineAlert,
  type ProjectProgress
} from '@/api/docman/dashboard';
import { handleApiError } from '@/utils/error';
import { buildLeaderMetrics, buildLeaderProjectSnapshots, pickLeaderDeadlineAlerts, pickLeaderFocusProjects } from './dashboard.util';

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

const metrics = computed(() => buildLeaderMetrics(overview.value, projectProgressList.value));
const projectSnapshots = computed(() => buildLeaderProjectSnapshots(projectProgressList.value));
const focusProjects = computed(() => pickLeaderFocusProjects(projectProgressList.value));
const deadlineDigest = computed(() => pickLeaderDeadlineAlerts(deadlineAlertList.value));
const completionRanking = computed(() =>
  [...projectSnapshots.value].sort(
    (left, right) =>
      left.documentCompletionRate - right.documentCompletionRate ||
      right.pendingDocuments - left.pendingDocuments ||
      left.projectName.localeCompare(right.projectName)
  )
);
const attentionLabelMap = {
  danger: '高关注',
  warning: '需关注',
  success: '稳定'
} as const;
const summaryCards = computed(() => [
  {
    key: 'project',
    label: '项目总览',
    value: overview.value.totalProjects,
    desc: `进行中 ${overview.value.activeProjects} 个`,
    color: '#2563eb',
    icon: FolderOpened
  },
  {
    key: 'document',
    label: '文档完善度',
    value: `${metrics.value.overallCompletionRate}%`,
    desc: `待补文档 ${overview.value.pendingDocuments} 份`,
    color: '#059669',
    icon: Document
  },
  {
    key: 'progress',
    label: '平均项目进度',
    value: `${metrics.value.avgProgressRate}%`,
    desc: `稳定 ${metrics.value.stableProjectCount} / 关注 ${metrics.value.focusedProjectCount}`,
    color: '#7c3aed',
    icon: CircleCheck
  },
  {
    key: 'risk',
    label: '风险提醒',
    value: overview.value.overdueNodes,
    desc: `插件异常 ${overview.value.pluginFailCount} 次（近7天）`,
    color: overview.value.overdueNodes > 0 ? '#dc2626' : '#f59e0b',
    icon: WarningFilled
  }
]);

/** 加载数据 */
const loadDashboard = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const [overviewRes, progressRes, deadlineRes] = await Promise.all([getOverview(), getProjectProgress(), getDeadlineAlert()]);
    overview.value = overviewRes.data;
    projectProgressList.value = progressRes.data || [];
    deadlineAlertList.value = deadlineRes.data || [];
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

/** 文档完善度颜色 */
const getCompletionColor = (rate: number): string => {
  if (rate >= 90) return '#67c23a';
  if (rate >= 70) return '#409eff';
  if (rate >= 40) return '#e6a23c';
  return '#f56c6c';
};

/** 剩余天数颜色 */
const getRemainColor = (days: number): string => {
  if (days > 7) return '#67c23a';
  if (days >= 1) return '#e6a23c';
  return '#f56c6c';
};

onMounted(() => loadDashboard());
</script>

<style scoped>
.leader-dashboard {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(5, 150, 105, 0.08), transparent 24%);
}

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

.panel-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.panel-header__hint {
  font-size: 12px;
  color: #909399;
  font-weight: 400;
}

.metric-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-cell__suffix {
  min-width: 56px;
  text-align: right;
  color: #606266;
  font-size: 12px;
}

.attention-text {
  margin-left: 8px;
  color: #606266;
}

.focus-card {
  height: 100%;
}

.focus-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.focus-item {
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.85);
}

.focus-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.focus-item__title {
  font-weight: 600;
  color: #303133;
}

.focus-item__desc {
  margin-top: 8px;
  color: #606266;
  line-height: 1.5;
}

.focus-item__meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}
</style>
