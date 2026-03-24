<template>
  <div class="app-container" data-testid="workspace-project-page">
    <el-form ref="queryRef" :model="queryParams" :inline="true" class="workspace-query">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter="loadProjects" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
          <el-option v-for="dict in doc_customer_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="全部" clearable>
          <el-option v-for="dict in doc_business_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="loadProjects">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-card shadow="never" class="workspace-tip">
      <span>这里只展示你参与的项目，进入后可继续查看文档、流程和归档信息。</span>
    </el-card>

    <div v-loading="loading">
      <el-empty v-if="projectList.length === 0" description="当前没有可访问的项目" />

      <el-row v-else :gutter="16">
        <el-col v-for="item in projectList" :key="item.id" :xs="24" :sm="12" :xl="8">
          <el-card shadow="hover" class="project-card">
            <template #header>
              <div class="project-card__header">
                <span class="project-card__title">{{ item.name }}</span>
                <el-tag size="small" :type="getStatusTagType(item.status)">
                  {{ getStatusLabel(item.status) }}
                </el-tag>
              </div>
            </template>

            <div class="project-card__body">
              <p>客户：{{ getCustomerTypeLabel(item.customerType) }}</p>
              <p>类型：{{ getBusinessTypeLabel(item.businessType) }}</p>
              <p>负责人：{{ item.ownerName || '-' }}</p>
              <p>文档分类：{{ item.documentCategory || '-' }}</p>
              <p class="project-card__remark">备注：{{ item.remark || '暂无备注' }}</p>
            </div>

            <template #footer>
              <div class="project-card__actions">
                <el-button link type="primary" @click="openDocuments(item.id)">文档中心</el-button>
                <el-button link type="warning" @click="openProcess(item.id)">流程</el-button>
                <el-button link type="info" @click="openArchive(item.id)">归档详情</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, onMounted, reactive, ref, toRefs, type ComponentInternalInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { listMyProject } from '@/api/docman/project';
import type { DocProject, DocProjectQuery } from '@/api/docman/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const router = useRouter();
const { doc_customer_type, doc_business_type, doc_project_status } = toRefs<any>(
  proxy?.useDict('doc_customer_type', 'doc_business_type', 'doc_project_status')
);

const queryRef = ref<ElFormInstance>();
const loading = ref(false);
const projectList = ref<DocProject[]>([]);

const queryParams = reactive<Partial<DocProjectQuery>>({
  name: '',
  customerType: '',
  businessType: ''
});

const resolveDictOption = (options: any, value?: string) => {
  if (!value) {
    return undefined;
  }
  return proxy?.selectDictLabel(options?.value, value) as { label?: string; cssClass?: string } | undefined;
};

const getStatusLabel = (value?: string) => resolveDictOption(doc_project_status, value)?.label || value || '-';

const getStatusTagType = (value?: string) => resolveDictOption(doc_project_status, value)?.cssClass || 'primary';

const getCustomerTypeLabel = (value?: string) => resolveDictOption(doc_customer_type, value)?.label || value || '-';

const getBusinessTypeLabel = (value?: string) => resolveDictOption(doc_business_type, value)?.label || value || '-';

const loadProjects = async () => {
  loading.value = true;
  try {
    const res = await listMyProject(queryParams);
    projectList.value = res.data || [];
  } catch (error) {
    ElMessage.error('项目数据加载失败');
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  queryRef.value?.resetFields();
  loadProjects();
};

const openDocuments = (projectId: number) => {
  router.push({ path: '/workspace/document', query: { projectId: String(projectId) } });
};

const openProcess = (projectId: number) => {
  router.push({ path: '/workspace/process', query: { projectId: String(projectId) } });
};

const openArchive = (projectId: number) => {
  router.push({ path: '/workspace/archive', query: { projectId: String(projectId) } });
};

onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.workspace-query {
  margin-bottom: 12px;
}

.workspace-tip {
  margin-bottom: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  border-color: #dbeafe;
  color: #1d4ed8;
}

.project-card {
  margin-bottom: 16px;
  height: 100%;
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.project-card__title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

.project-card__body {
  display: grid;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.project-card__remark {
  color: #6b7280;
  line-height: 1.6;
}

.project-card__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
