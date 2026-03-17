<template>
  <div class="p-2">
    <el-page-header @back="$router.back()">
      <template #content>
        <span>归档详情</span>
        <el-tag v-if="projectId" type="info" size="small" style="margin-left: 8px">项目ID: {{ projectId }}</el-tag>
      </template>
    </el-page-header>

    <el-row :gutter="16" style="margin-top: 16px" v-loading="loading">
      <!-- 左侧：归档历史列表 -->
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>归档历史</template>
          <el-table :data="historyList" max-height="480" highlight-current-row @current-change="handleCurrentChange">
            <el-table-column prop="archiveVersion" label="版本" width="80" align="center">
              <template #default="{ row }">V{{ row.archiveVersion }}</template>
            </el-table-column>
            <el-table-column prop="archiveNo" label="归档编号" min-width="180" :show-overflow-tooltip="true" />
            <el-table-column prop="status" label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="archiveStatusType(row.status)" size="small">{{ archiveStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="completedAt" label="完成时间" min-width="160" />
          </el-table>
        </el-card>
      </el-col>

      <!-- 右侧：归档详情 -->
      <el-col :span="16">
        <el-card v-if="archive" shadow="hover">
          <template #header>归档信息</template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="归档编号">{{ archive.archiveNo }}</el-descriptions-item>
            <el-descriptions-item label="归档版本">V{{ archive.archiveVersion }}</el-descriptions-item>
            <el-descriptions-item label="归档路径">{{ archive.nasArchivePath }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="archiveStatusType(archive.status)">{{ archiveStatusLabel(archive.status) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="校验值" :span="2">{{ archive.snapshotChecksum || '-' }}</el-descriptions-item>
            <el-descriptions-item label="申请时间">{{ archive.requestedAt || archive.createTime }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ archive.completedAt || '-' }}</el-descriptions-item>
          </el-descriptions>

          <h4 style="margin-top: 24px; margin-bottom: 12px">归档清单</h4>
          <el-table border :data="archive.manifest || []">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="fileName" label="文件名" min-width="200" :show-overflow-tooltip="true" />
            <el-table-column prop="nasPath" label="存储路径" min-width="300" :show-overflow-tooltip="true" />
            <el-table-column prop="sourceType" label="来源" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.sourceType === 'plugin' ? 'primary' : 'info'" size="small">
                  {{ row.sourceType === 'plugin' ? '插件生成' : '手动上传' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="generatedAt" label="生成时间" width="180" />
          </el-table>
        </el-card>

        <el-card v-else shadow="hover">
          <el-empty description="暂无归档数据，请在左侧选择或先执行归档" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { getArchive, listArchiveHistory } from '@/api/docman/archive';
import { DocArchivePackageVO } from '@/api/docman/types';

const route = useRoute();

const projectId = ref(Number(route.query.projectId));
const archive = ref<DocArchivePackageVO | null>(null);
const historyList = ref<DocArchivePackageVO[]>([]);
const loading = ref(true);

/** 归档状态 tag 颜色映射 */
const archiveStatusType = (s: string): string => {
  const map: Record<string, string> = { requested: 'warning', generating: '', completed: 'success', failed: 'danger' };
  return map[s] || 'info';
};

/** 归档状态标签 */
const archiveStatusLabel = (s: string): string => {
  const map: Record<string, string> = { requested: '已申请', generating: '归档中', completed: '已完成', failed: '失败' };
  return map[s] || s;
};

/** 历史列表行点击切换 */
const handleCurrentChange = (row: DocArchivePackageVO | null) => {
  if (row) archive.value = row;
};

/** 加载归档数据 */
const loadArchive = async () => {
  loading.value = true;
  try {
    const [archiveRes, historyRes] = await Promise.all([getArchive(projectId.value), listArchiveHistory(projectId.value)]);
    archive.value = archiveRes.data;
    historyList.value = historyRes.data || [];
    if (!archive.value && historyList.value.length > 0) {
      archive.value = historyList.value[0];
    }
  } catch {
    archive.value = null;
    historyList.value = [];
  }
  loading.value = false;
};

onMounted(() => {
  loadArchive();
});
</script>
