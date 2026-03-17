<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>文档中心</template>
    </el-page-header>

    <el-table v-loading="loading" :data="documentList" style="margin-top: 16px;">
      <el-table-column prop="fileName" label="文件名" min-width="200" />
      <el-table-column prop="sourceType" label="来源" width="120">
        <template #default="{ row }">
          <el-tag :type="row.sourceType === 'plugin' ? 'primary' : 'info'" size="small">
            {{ row.sourceType === 'plugin' ? '插件生成' : '手动上传' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nasPath" label="存储路径" min-width="250" show-overflow-tooltip />
      <el-table-column prop="generatedAt" label="生成时间" width="180" />
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { listDocument } from '@/api/docman/document';
import { DocDocumentRecord, DocDocumentQuery, PageResult } from '@/api/docman/types';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const documentList = ref<DocDocumentRecord[]>([]);
const total = ref(0);
const loading = ref(true);
const queryParams = ref<DocDocumentQuery>({ pageNum: 1, pageSize: 20 });

/** 查询文档列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDocument(projectId.value, queryParams.value);
  documentList.value = res.data.rows;
  total.value = res.data.total;
  loading.value = false;
};

function statusType(s: string) {
  return { pending: 'warning', generated: 'primary', archived: 'success' }[s] || 'info';
}

function statusLabel(s: string) {
  return { pending: '待生成', generated: '已生成', archived: '已归档' }[s] || s;
}

onMounted(() => getList());
</script>
