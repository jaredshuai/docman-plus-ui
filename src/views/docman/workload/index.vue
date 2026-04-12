<template>
  <div class="app-container" data-testid="workload-page">
    <el-page-header @back="router.back()">
      <template #content>工作量录入</template>
    </el-page-header>

    <el-alert title="工作量录入已并入图纸录入页，请在图纸下维护对应工作量。" type="info" show-icon :closable="false" style="margin-top: 16px" />

    <el-card style="margin-top: 16px">
      <template #header>入口调整说明</template>
      <div class="redirect-copy">
        <p>当前版本中，工作量必须依附图纸存在，不再作为项目级独立录入线维护。</p>
        <p>请进入图纸录入页，在具体图纸下新增、修改和删除工作量项。</p>
      </div>
      <el-space style="margin-top: 12px" wrap>
        <el-button type="primary" @click="handleOpenDrawing" v-hasPermi="['docman:project:query']">进入图纸/工作量录入</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resolvePathProjectId } from '../inputLine/inputLine.util';

const route = useRoute();
const router = useRouter();
const projectId = computed(() => resolvePathProjectId(route.params.projectId));

function handleOpenDrawing() {
  if (!projectId.value) {
    router.push('/docman/project');
    return;
  }
  router.push(`/docman/drawing/${projectId.value}`);
}
</script>

<style scoped>
.redirect-copy {
  color: #475569;
  line-height: 1.8;
}
</style>
