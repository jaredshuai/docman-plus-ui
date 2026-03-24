<template>
  <div class="app-container" data-testid="archive-page">
    <el-page-header @back="$router.back()">
      <template #content>归档详情</template>
    </el-page-header>

    <el-card v-loading="loading" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>归档基本信息</span>
          <div class="header-operations">
            <el-button v-hasPermi="['docman:archive:execute']" type="primary" :loading="archiveLoading" @click="handleArchive">发起归档</el-button>
            <el-button
              v-if="archiveInfo && archiveInfo.status === 'completed'"
              v-hasPermi="['docman:archive:download']"
              type="success"
              plain
              @click="handleDownload(archiveInfo.id)"
              >下载归档包</el-button
            >
          </div>
        </div>
      </template>

      <el-descriptions v-if="archiveInfo" :column="2" border>
        <el-descriptions-item label="归档编号">{{ archiveInfo.archiveNo }}</el-descriptions-item>
        <el-descriptions-item label="版本号">
          <el-tag size="small">V{{ archiveInfo.archiveVersion }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="归档状态">
          <dict-tag :options="doc_archive_status" :value="archiveInfo.status" />
        </el-descriptions-item>
        <el-descriptions-item label="归档时间">{{ archiveInfo.completedAt || archiveInfo.createTime }}</el-descriptions-item>
        <el-descriptions-item label="归档路径" :span="2">{{ archiveInfo.nasArchivePath }}</el-descriptions-item>
        <el-descriptions-item label="校验和" :span="2">{{ archiveInfo.snapshotChecksum || '-' }}</el-descriptions-item>
      </el-descriptions>

      <el-empty v-else description="暂无归档记录" />
    </el-card>

    <el-card v-if="archiveInfo && archiveInfo.manifest" shadow="hover" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>文件清单</span>
        </div>
      </template>
      <el-table :data="archiveInfo.manifest" border stripe :row-key="(row) => row.fileName">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileName" label="文件名" />
        <el-table-column prop="path" label="路径" show-overflow-tooltip />
      </el-table>
    </el-card>

    <el-collapse v-model="activeNames" @change="handleCollapseChange" style="margin-top: 20px">
      <el-collapse-item title="历史归档列表" name="history">
        <el-table v-loading="historyLoading" :data="historyList" border stripe :row-key="(row) => row.id">
          <el-table-column prop="archiveNo" label="归档编号" />
          <el-table-column prop="archiveVersion" label="版本" width="80" align="center">
            <template #default="scope">V{{ scope.row.archiveVersion }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120" align="center">
            <template #default="scope">
              <dict-tag :options="doc_archive_status" :value="scope.row.status" />
            </template>
          </el-table-column>
          <el-table-column prop="completedAt" label="完成时间" width="180" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button
                v-if="scope.row.status === 'completed'"
                v-hasPermi="['docman:archive:download']"
                type="primary"
                link
                @click="handleDownload(scope.row.id)"
                >下载</el-button
              >
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { getArchive, archiveProject, listArchive, downloadArchive } from '@/api/docman/archive';
import { DocArchivePackage } from '@/api/docman/types';
import { ElMessage, ElMessageBox } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { doc_archive_status } = toRefs<any>(proxy?.useDict('doc_archive_status'));

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const loading = ref(true);
const archiveLoading = ref(false);
const historyLoading = ref(false);
const archiveInfo = ref<DocArchivePackage | null>(null);
const historyList = ref<DocArchivePackage[]>([]);
const activeNames = ref<string[]>([]);

/** 获取归档信息 */
const getArchiveInfo = async () => {
  if (!projectId.value) return;
  loading.value = true;
  try {
    const res = await getArchive(projectId.value);
    archiveInfo.value = res.data;
  } catch (error) {
    console.error('获取归档信息失败', error);
  } finally {
    loading.value = false;
  }
};

/** 发起归档 */
const handleArchive = async () => {
  await ElMessageBox.confirm('是否确认归档该项目？归档后不可修改。', '系统提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  });

  archiveLoading.value = true;
  try {
    await archiveProject(projectId.value);
    ElMessage.success('归档任务已发起');
    getArchiveInfo();
    // 如果历史列表已展开，刷新之
    if (activeNames.value.includes('history')) {
      getHistoryList();
    }
  } catch (error) {
    console.error('发起归档失败', error);
  } finally {
    archiveLoading.value = false;
  }
};

/** 下载归档包 */
const handleDownload = (archiveId: number) => {
  downloadArchive(archiveId);
};

/** 获取历史列表 */
const getHistoryList = async () => {
  historyLoading.value = true;
  try {
    const res = await listArchive(projectId.value);
    historyList.value = res.data;
  } catch (error) {
    console.error('获取历史归档失败', error);
  } finally {
    historyLoading.value = false;
  }
};

/** 折叠面板变更 */
const handleCollapseChange = (names: any) => {
  if (names.includes('history')) {
    getHistoryList();
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
.header-operations {
  display: flex;
  gap: 10px;
}
</style>
