<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>归档详情</template>
    </el-page-header>

    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="8">
        <el-card>
          <template #header>归档历史</template>
          <el-table :data="historyList" max-height="480" highlight-current-row @current-change="handleCurrentChange">
            <el-table-column prop="archiveVersion" label="版本" width="80" />
            <el-table-column prop="archiveNo" label="归档编号" min-width="180" show-overflow-tooltip />
            <el-table-column prop="completedAt" label="完成时间" min-width="160" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-descriptions v-if="archive" :column="2" border>
          <el-descriptions-item label="归档编号">{{ archive.archiveNo }}</el-descriptions-item>
          <el-descriptions-item label="归档版本">V{{ archive.archiveVersion }}</el-descriptions-item>
          <el-descriptions-item label="归档路径">{{ archive.nasArchivePath }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="success">{{ archive.status === 'completed' ? '已完成' : '生成中' }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="校验值" :span="2">{{ archive.snapshotChecksum }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ archive.requestedAt || archive.createTime }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ archive.completedAt || archive.createTime }}</el-descriptions-item>
        </el-descriptions>

        <h3 style="margin-top: 24px;">归档清单</h3>
        <el-table :data="archive?.manifest || []">
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="fileName" label="文件名" min-width="200" />
          <el-table-column prop="nasPath" label="存储路径" min-width="300" show-overflow-tooltip />
          <el-table-column prop="sourceType" label="来源" width="120">
            <template #default="{ row }">{{ row.sourceType === 'plugin' ? '插件生成' : '手动上传' }}</template>
          </el-table-column>
          <el-table-column prop="generatedAt" label="生成时间" width="180" />
        </el-table>
      </el-col>
    </el-row>
    </el-table>
    <el-empty v-if="!archive && historyList.length === 0" description="暂无归档数据" />
    <el-empty v-if="!archive" description="暂无归档数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getArchive, listArchiveHistory } from '@/api/docman/archive';
import { getArchive } from '@/api/docman/archive';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const historyList = ref<any[]>([]);

function handleCurrentChange(row: any) {
  if (row) archive.value = row;
}
const archive = ref<any>(null);

onMounted(() => {
  getArchive(projectId.value).then((res: any) => {
    archive.value = res.data;
  listArchiveHistory(projectId.value).then((res: any) => {
    historyList.value = res.data || [];
    if (!archive.value && historyList.value.length > 0) {
      archive.value = historyList.value[0];
    }
  });
  });
});
</script>
