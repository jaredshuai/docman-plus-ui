<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>归档详情</template>
    </el-page-header>

    <el-card v-loading="loading" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>归档基本信息</span>
        </div>
      </template>

      <el-descriptions v-if="archiveInfo" :column="2" border>
        <el-descriptions-item label="归档编号">{{ archiveInfo.archiveNo }}</el-descriptions-item>
        <el-descriptions-item label="版本号">
          <el-tag size="small">V{{ archiveInfo.archiveVersion }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="归档状态">
          <el-tag :type="archiveInfo.status === 'completed' ? 'success' : 'warning'">
            {{ archiveInfo.status === 'completed' ? '已完成' : '归档中' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="归档时间">{{ archiveInfo.completedAt || archiveInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="归档路径" :span="2">{{ archiveInfo.nasArchivePath }}</el-descriptions-item>
        <el-descriptions-item label="校验和" :span="2">{{ archiveInfo.snapshotChecksum || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-empty v-else description="暂无归档记录" />
    </el-card>

    <el-card v-if="archiveInfo && archiveInfo.manifest" shadow="hover" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>文件清单</span>
        </div>
      </template>
      <el-table :data="archiveInfo.manifest" border stripe>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="path" label="路径" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getArchive } from '@/api/docman/archive';
import { DocArchivePackage } from '@/api/docman/types';
import { ElMessage } from 'element-plus';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const loading = ref(true);
const archiveInfo = ref<DocArchivePackage | null>(null);

/** 获取归档信息 */
const getArchiveInfo = async () => {
  if (!projectId.value) return;
  loading.value = true;
  try {
    const res = await getArchive(projectId.value);
    archiveInfo.value = res.data;
  } catch (error) {
    console.error('获取归档信息失败', error);
    ElMessage.error('获取归档信息失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getArchiveInfo();
});
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
