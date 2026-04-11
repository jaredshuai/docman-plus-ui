<template>
  <div class="app-container workspace-home" v-loading="loading" data-testid="workspace-home-page">
    <el-row :gutter="16" class="section-gap">
      <el-col v-for="card in summaryCards" :key="card.key" :xs="24" :sm="12" :lg="8">
        <el-card shadow="hover" class="summary-card">
          <div class="summary-card__body">
            <div class="summary-card__icon" :style="{ background: card.color }">
              <el-icon><component :is="card.icon" /></el-icon>
            </div>
            <div class="summary-card__content">
              <div class="summary-card__value">{{ card.value }}</div>
              <div class="summary-card__label">{{ card.label }}</div>
              <div class="summary-card__desc">{{ card.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section-gap">
      <el-col :xs="24" :lg="8">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-card__header">
              <span>快捷入口</span>
              <el-button link type="primary" @click="goToMyProjects">查看全部项目</el-button>
            </div>
          </template>
          <div class="quick-actions">
            <button class="quick-action" type="button" @click="router.push('/task/taskWaiting')">
              <span class="quick-action__title">我的待办</span>
              <span class="quick-action__desc">进入待处理任务列表</span>
            </button>
            <button class="quick-action" type="button" @click="router.push('/task/taskCopyList')">
              <span class="quick-action__title">抄送我的</span>
              <span class="quick-action__desc">查看抄送和提醒事项</span>
            </button>
            <button class="quick-action" type="button" @click="router.push('/task/myDocument')">
              <span class="quick-action__title">我发起的</span>
              <span class="quick-action__desc">跟踪自己发起的流程</span>
            </button>
            <button class="quick-action" type="button" @click="goToMyProjects">
              <span class="quick-action__title">我的项目</span>
              <span class="quick-action__desc">按项目进入文档和流程</span>
            </button>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="16">
        <el-card shadow="hover" class="panel-card">
          <template #header>
            <div class="panel-card__header">
              <span>我参与的项目</span>
              <span class="panel-card__hint">优先展示最近创建的项目</span>
            </div>
          </template>

          <el-empty v-if="projectPreviewList.length === 0" description="当前没有可进入的项目" />

          <div v-else class="project-grid">
            <div v-for="item in projectPreviewList" :key="item.id" class="project-card">
              <div class="project-card__top">
                <div class="project-card__title">{{ item.name }}</div>
                <el-tag size="small" :type="getStatusTagType(item.status)">
                  {{ getStatusLabel(item.status) }}
                </el-tag>
              </div>
              <div class="project-card__meta">
                <span>客户：{{ getCustomerTypeLabel(item.customerType) }}</span>
                <span>类型：{{ getBusinessTypeLabel(item.businessType) }}</span>
                <span>负责人：{{ item.ownerName || '-' }}</span>
              </div>
              <div class="project-card__actions">
                <el-button link type="primary" @click="openProjectDocuments(item.id)">文档中心</el-button>
                <el-button link type="warning" @click="openProjectProcess(item.id)">流程</el-button>
                <el-button link type="info" @click="openProjectArchive(item.id)">归档详情</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, ref, toRefs, type ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { Bell, CircleCheck, FolderOpened, Warning } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { getTodoSummary, type TodoSummary } from '@/api/docman/dashboard';
import { listMyProject } from '@/api/docman/project';
import type { DocProject, DocmanId } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';
import { resolveDictLabel, resolveDictTagType } from '../../docman/docmanDict.util';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_customer_type, doc_business_type, doc_project_status } = toRefs<any>(
  proxy?.useDict('doc_customer_type', 'doc_business_type', 'doc_project_status')
);

const loading = ref(false);
const summary = ref<TodoSummary>({
  myProjectCount: 0,
  activeProjectCount: 0,
  overdueNodeCount: 0,
  waitingTaskCount: 0,
  copiedTaskCount: 0,
  finishedTaskCount: 0
});
const projectList = ref<DocProject[]>([]);

const summaryCards = computed(() => [
  {
    key: 'projects',
    label: '我参与的项目',
    value: summary.value.myProjectCount,
    desc: `进行中 ${summary.value.activeProjectCount}`,
    color: '#2563eb',
    icon: FolderOpened
  },
  {
    key: 'waiting',
    label: '待办任务',
    value: summary.value.waitingTaskCount,
    desc: '优先处理当前审批',
    color: '#f59e0b',
    icon: Bell
  },
  {
    key: 'copied',
    label: '抄送提醒',
    value: summary.value.copiedTaskCount,
    desc: '同步关注流程进展',
    color: '#0f766e',
    icon: CircleCheck
  },
  {
    key: 'finished',
    label: '我的已办',
    value: summary.value.finishedTaskCount,
    desc: '回看最近处理记录',
    color: '#7c3aed',
    icon: CircleCheck
  },
  {
    key: 'overdue',
    label: '超期节点',
    value: summary.value.overdueNodeCount,
    desc: '项目内需要尽快跟进',
    color: '#dc2626',
    icon: Warning
  }
]);

const projectPreviewList = computed(() => projectList.value.slice(0, 4));

const getStatusLabel = (value?: string) => resolveDictLabel(doc_project_status.value, value, value || '-');

const getStatusTagType = (value?: string) => resolveDictTagType(doc_project_status.value, value, 'primary');

const getCustomerTypeLabel = (value?: string) => resolveDictLabel(doc_customer_type.value, value, value || '-');

const getBusinessTypeLabel = (value?: string) => resolveDictLabel(doc_business_type.value, value, value || '-');

const loadWorkspace = async () => {
  loading.value = true;
  try {
    const [summaryRes, projectRes] = await Promise.all([getTodoSummary(), listMyProject()]);
    summary.value = summaryRes.data;
    projectList.value = projectRes || [];
  } catch (error) {
    handleApiError(error, '工作台数据加载失败');
  } finally {
    loading.value = false;
  }
};

const goToMyProjects = () => {
  router.push('/workspace/project');
};

const openProjectDocuments = (projectId: DocmanId) => {
  router.push({ path: '/workspace/document', query: { projectId: String(projectId) } });
};

const openProjectProcess = (projectId: DocmanId) => {
  router.push({ path: '/workspace/process', query: { projectId: String(projectId) } });
};

const openProjectArchive = (projectId: DocmanId) => {
  router.push({ path: '/workspace/archive', query: { projectId: String(projectId) } });
};

onMounted(() => {
  loadWorkspace();
});
</script>

<style scoped>
.section-gap {
  margin-bottom: 16px;
}

.summary-card {
  border: 0;
  min-height: 138px;
}

.summary-card__body {
  display: flex;
  align-items: center;
  gap: 14px;
}

.summary-card__icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.summary-card__icon .el-icon {
  font-size: 24px;
}

.summary-card__value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
  color: #111827;
}

.summary-card__label {
  margin-top: 6px;
  font-size: 14px;
  color: #4b5563;
}

.summary-card__desc {
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.panel-card {
  min-height: 100%;
}

.panel-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.panel-card__hint {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.quick-action {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
  padding: 18px 16px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.quick-action:hover {
  transform: translateY(-1px);
  border-color: #cbd5e1;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.quick-action__title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.quick-action__desc {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #6b7280;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.project-card {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.project-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.project-card__title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  line-height: 1.5;
}

.project-card__meta {
  display: grid;
  gap: 6px;
  margin-top: 12px;
  font-size: 13px;
  color: #6b7280;
}

.project-card__actions {
  display: flex;
  gap: 12px;
  margin-top: 14px;
}

@media (max-width: 991px) {
  .quick-actions,
  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
