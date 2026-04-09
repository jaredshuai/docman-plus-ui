<template>
  <div class="app-container" data-testid="workspace-page">
    <el-page-header @back="$router.back()">
      <template #content>项目工作台</template>
    </el-page-header>

    <el-alert v-if="!hasProjectId" title="请先在项目管理中选择项目后再进入工作台" type="info" show-icon :closable="false" style="margin-top: 16px" />

    <template v-else>
      <el-alert v-if="loadError" :title="loadError" type="warning" show-icon :closable="false" class="mb8" style="margin-top: 16px" />

      <el-card v-loading="loading" style="margin-top: 16px">
        <template #header>项目概览</template>
        <el-descriptions v-if="workspace" :column="3" border>
          <el-descriptions-item label="项目名称">{{ workspace.projectName }}</el-descriptions-item>
          <el-descriptions-item label="项目类型">{{ workspace.projectTypeCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="运行状态">{{ workspace.runtimeStatus }}</el-descriptions-item>
          <el-descriptions-item label="当前节点">{{ workspace.currentNodeName }}</el-descriptions-item>
          <el-descriptions-item label="图纸数量">{{ workspace.drawingCount }}</el-descriptions-item>
          <el-descriptions-item label="签证数量">{{ workspace.visaCount }}</el-descriptions-item>
        </el-descriptions>

        <div class="mt16" v-if="workspace">
          <el-space wrap>
            <el-button type="primary" @click="drawingDialog.open = true" v-hasPermi="['docman:project:edit']">录入图纸</el-button>
            <el-button type="success" @click="visaDialog.open = true" v-hasPermi="['docman:project:edit']">录入签证</el-button>
            <el-button
              v-if="canTriggerEstimate"
              type="info"
              :loading="estimateLoading"
              @click="handleTriggerEstimate"
              v-hasPermi="['docman:project:edit']"
            >
              触发估算
            </el-button>
            <el-button
              v-if="canTriggerExport"
              type="primary"
              plain
              :loading="exportLoading"
              @click="handleTriggerExport"
              v-hasPermi="['docman:project:edit']"
            >
              导出文本
            </el-button>
            <el-button type="warning" @click="handleAdvance" v-hasPermi="['docman:project:edit']">推进节点</el-button>
            <el-button plain @click="handleOpenDocumentCenter" v-hasPermi="['docman:document:list']">文档中心</el-button>
          </el-space>
        </div>
      </el-card>

      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card>
            <template #header>当前节点事项</template>
            <el-table :data="workspace?.currentNodeTasks || []">
              <el-table-column prop="taskName" label="事项" min-width="160" />
              <el-table-column prop="taskType" label="类型" width="120" />
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'completed' ? 'success' : 'info'">
                    {{ row.status === 'completed' ? '已完成' : row.status === 'pending' ? '待处理' : row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140">
                <template #default="{ row }">
                  <el-button
                    v-if="row.taskType === 'plugin_run'"
                    size="small"
                    type="success"
                    :loading="taskActionLoadingId === row.id"
                    :disabled="row.status === 'completed'"
                    @click="handleTriggerTask(row.id)"
                    v-hasPermi="['docman:plugin:trigger']"
                  >
                    {{ resolvePluginTaskLabel(row) }}
                  </el-button>
                  <el-button
                    v-else
                    size="small"
                    type="primary"
                    :loading="taskActionLoadingId === row.id"
                    :disabled="row.status === 'completed'"
                    @click="handleCompleteTask(row.id)"
                    v-hasPermi="['docman:project:edit']"
                  >
                    完成
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>流程节点概览</template>
            <el-timeline>
              <el-timeline-item
                v-for="node in workspace?.nodes || []"
                :key="node.id"
                :type="node.nodeCode === workspace?.currentNodeCode ? 'primary' : 'info'"
                :hollow="node.nodeCode !== workspace?.currentNodeCode"
              >
                <div style="font-weight: 600">{{ node.nodeName }}</div>
                <div style="color: #64748b">{{ node.nodeCode }}</div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card>
            <template #header>最新估算结果</template>
            <template v-if="latestEstimateSnapshot">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="估算金额">
                  {{ latestEstimateSnapshot.estimateAmount ?? '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="估算状态">
                  {{ latestEstimateSnapshot.status || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="图纸口径">
                  {{ latestEstimateSnapshot.drawingCount ?? workspace?.drawingCount ?? '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="签证口径">
                  {{ latestEstimateSnapshot.visaCount ?? workspace?.visaCount ?? '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="生成时间" :span="2">
                  {{ latestEstimateSnapshot.createTime || '-' }}
                </el-descriptions-item>
              </el-descriptions>
              <el-alert
                v-if="latestEstimateSnapshot.summary"
                :title="latestEstimateSnapshot.summary"
                type="info"
                :closable="false"
                style="margin-top: 12px"
              />
            </template>
            <el-empty v-else description="暂无估算结果" />
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>最新文本产物</template>
            <template v-if="latestExportArtifact">
              <el-descriptions :column="2" border size="small">
                <el-descriptions-item label="文件名" :span="2">
                  {{ latestExportArtifact.fileName }}
                </el-descriptions-item>
                <el-descriptions-item label="状态">
                  {{ latestExportArtifact.status }}
                </el-descriptions-item>
                <el-descriptions-item label="生成时间">
                  {{ latestExportArtifact.generatedAt || latestExportArtifact.createTime || '-' }}
                </el-descriptions-item>
                <el-descriptions-item label="来源插件" :span="2">
                  {{ latestExportArtifact.pluginId || '-' }}
                </el-descriptions-item>
              </el-descriptions>
              <el-space style="margin-top: 12px" wrap>
                <el-button type="primary" plain @click="handleDownloadArtifact(latestExportArtifact.id)" v-hasPermi="['docman:document:download']">
                  下载产物
                </el-button>
                <el-button plain @click="handleOpenDocumentCenter" v-hasPermi="['docman:document:list']">查看全部产物</el-button>
              </el-space>
            </template>
            <el-empty v-else description="暂无文本产物" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" style="margin-top: 16px">
        <el-col :span="12">
          <el-card>
            <template #header>图纸录入</template>
            <el-table :data="drawings">
              <el-table-column prop="drawingCode" label="图号" min-width="120" />
              <el-table-column prop="orderSerialNo" label="订单流水号" min-width="140" />
              <el-table-column prop="workContent" label="工作内容" min-width="180" show-overflow-tooltip />
              <el-table-column prop="includeInProject" label="计入项目" width="100">
                <template #default="{ row }">{{ row.includeInProject ? '是' : '否' }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>签证录入</template>
            <el-table :data="visas">
              <el-table-column prop="reason" label="签证原因" min-width="160" show-overflow-tooltip />
              <el-table-column prop="amount" label="金额" width="120" />
              <el-table-column prop="visaDate" label="签证日期" width="160" />
              <el-table-column prop="includeInProject" label="计入项目" width="100">
                <template #default="{ row }">{{ row.includeInProject ? '是' : '否' }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-dialog v-model="drawingDialog.open" title="录入图纸" width="520px">
        <el-form :model="drawingForm" label-width="100px">
          <el-form-item label="图号">
            <el-input v-model="drawingForm.drawingCode" />
          </el-form-item>
          <el-form-item label="订单流水号">
            <el-input v-model="drawingForm.orderSerialNo" />
          </el-form-item>
          <el-form-item label="工作内容">
            <el-input v-model="drawingForm.workContent" type="textarea" />
          </el-form-item>
          <el-form-item label="计入项目">
            <el-switch v-model="drawingForm.includeInProject" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="drawingForm.remark" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="drawingDialog.open = false">取消</el-button>
          <el-button type="primary" @click="handleSaveDrawing">保存</el-button>
        </template>
      </el-dialog>

      <el-dialog v-model="visaDialog.open" title="录入签证" width="520px">
        <el-form :model="visaForm" label-width="100px">
          <el-form-item label="签证原因">
            <el-input v-model="visaForm.reason" />
          </el-form-item>
          <el-form-item label="内容依据">
            <el-input v-model="visaForm.contentBasis" type="textarea" />
          </el-form-item>
          <el-form-item label="金额">
            <el-input-number v-model="visaForm.amount" :precision="2" :min="0" style="width: 100%" />
          </el-form-item>
          <el-form-item label="签证日期">
            <el-date-picker v-model="visaForm.visaDate" type="date" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
          </el-form-item>
          <el-form-item label="计入项目">
            <el-switch v-model="visaForm.includeInProject" />
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="visaForm.remark" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="visaDialog.open = false">取消</el-button>
          <el-button type="primary" @click="handleSaveVisa">保存</el-button>
        </template>
      </el-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { handleApiError } from '@/utils/error';
import { useRouteProjectId } from '@/hooks/useRouteProjectId';
import {
  advanceProjectNode,
  completeProjectTask,
  getProjectWorkspace,
  triggerProjectEstimate,
  triggerProjectExport,
  triggerProjectTaskPlugins
} from '@/api/docman/workspace';
import { downloadDocument, listDocument } from '@/api/docman/document';
import { listProjectDrawings, saveProjectDrawing } from '@/api/docman/drawing';
import { listProjectVisas, saveProjectVisa } from '@/api/docman/visa';
import type {
  DocDocumentRecord,
  DocProjectDrawing,
  DocProjectDrawingForm,
  DocProjectVisa,
  DocProjectVisaForm,
  DocProjectWorkspace
} from '@/api/docman/types';
import { ESTIMATE_PLUGIN_ID, EXPORT_PLUGIN_ID, findLatestGeneratedPluginArtifact, hasPluginTask, resolvePluginTaskLabel } from './workspace.util';

const route = useRoute();
const router = useRouter();
const { projectId, hasProjectId } = useRouteProjectId(route);

const loading = ref(false);
const loadError = ref('');
const workspace = ref<DocProjectWorkspace>();
const drawings = ref<DocProjectDrawing[]>([]);
const visas = ref<DocProjectVisa[]>([]);
const documents = ref<DocDocumentRecord[]>([]);
const taskActionLoadingId = ref<number>();
const estimateLoading = ref(false);
const exportLoading = ref(false);

const drawingDialog = reactive({ open: false });
const visaDialog = reactive({ open: false });

const drawingForm = reactive<DocProjectDrawingForm>({
  projectId: 0,
  drawingCode: '',
  orderSerialNo: '',
  workContent: '',
  includeInProject: true,
  remark: ''
});

const visaForm = reactive<DocProjectVisaForm>({
  projectId: 0,
  reason: '',
  contentBasis: '',
  amount: 0,
  visaDate: '',
  includeInProject: true,
  remark: ''
});

const latestEstimateSnapshot = computed(() => workspace.value?.latestEstimateSnapshot);
const latestExportArtifact = computed(() => findLatestGeneratedPluginArtifact(documents.value, EXPORT_PLUGIN_ID));
const canTriggerEstimate = computed(() => hasPluginTask(workspace.value?.currentNodeTasks, ESTIMATE_PLUGIN_ID));
const canTriggerExport = computed(() => hasPluginTask(workspace.value?.currentNodeTasks, EXPORT_PLUGIN_ID));

async function loadAll() {
  if (!hasProjectId.value) {
    workspace.value = undefined;
    drawings.value = [];
    visas.value = [];
    documents.value = [];
    return;
  }
  loading.value = true;
  loadError.value = '';
  try {
    const [workspaceRes, drawingRes, visaRes, documentRes] = await Promise.all([
      getProjectWorkspace(projectId.value),
      listProjectDrawings(projectId.value),
      listProjectVisas(projectId.value),
      listDocument(projectId.value, { pageNum: 1, pageSize: 200 })
    ]);
    workspace.value = workspaceRes.data;
    drawings.value = drawingRes.data;
    visas.value = visaRes.data;
    documents.value = documentRes.rows || [];
  } catch (error) {
    loadError.value = handleApiError(error, '工作台加载失败');
  } finally {
    loading.value = false;
  }
}

async function handleCompleteTask(taskRuntimeId: number) {
  if (!hasProjectId.value) return;
  taskActionLoadingId.value = taskRuntimeId;
  try {
    await completeProjectTask(projectId.value, taskRuntimeId, {});
    ElMessage.success('事项已完成');
    await loadAll();
  } catch (error) {
    handleApiError(error, '事项完成失败');
  } finally {
    taskActionLoadingId.value = undefined;
  }
}

async function handleTriggerTask(taskId: number) {
  if (!hasProjectId.value) return;
  taskActionLoadingId.value = taskId;
  try {
    await triggerProjectTaskPlugins(projectId.value, taskId);
    ElMessage.success('插件执行成功');
    await loadAll();
  } catch (error) {
    handleApiError(error, '插件执行失败');
  } finally {
    taskActionLoadingId.value = undefined;
  }
}

async function handleAdvance() {
  if (!hasProjectId.value || !workspace.value) return;
  try {
    await advanceProjectNode(projectId.value, { currentNodeCode: workspace.value.currentNodeCode });
    ElMessage.success('节点推进成功');
    await loadAll();
  } catch (error) {
    handleApiError(error, '节点推进失败');
  }
}

async function handleTriggerEstimate() {
  if (!hasProjectId.value) return;
  estimateLoading.value = true;
  try {
    await triggerProjectEstimate(projectId.value);
    ElMessage.success('初步估算触发成功');
    await loadAll();
  } catch (error) {
    handleApiError(error, '初步估算触发失败');
  } finally {
    estimateLoading.value = false;
  }
}

async function handleTriggerExport() {
  if (!hasProjectId.value) return;
  exportLoading.value = true;
  try {
    await triggerProjectExport(projectId.value);
    ElMessage.success('文本导出触发成功');
    await loadAll();
  } catch (error) {
    handleApiError(error, '文本导出触发失败');
  } finally {
    exportLoading.value = false;
  }
}

function handleOpenDocumentCenter() {
  if (!hasProjectId.value) return;
  router.push({ path: '/docman/document', query: { projectId: String(projectId.value) } });
}

function handleDownloadArtifact(id?: number) {
  if (!id) return;
  downloadDocument(id);
}

async function handleSaveDrawing() {
  if (!hasProjectId.value) return;
  try {
    await saveProjectDrawing({ ...drawingForm, projectId: projectId.value });
    ElMessage.success('图纸保存成功');
    drawingDialog.open = false;
    Object.assign(drawingForm, { projectId: 0, drawingCode: '', orderSerialNo: '', workContent: '', includeInProject: true, remark: '' });
    await loadAll();
  } catch (error) {
    handleApiError(error, '图纸保存失败');
  }
}

async function handleSaveVisa() {
  if (!hasProjectId.value) return;
  try {
    await saveProjectVisa({ ...visaForm, projectId: projectId.value });
    ElMessage.success('签证保存成功');
    visaDialog.open = false;
    Object.assign(visaForm, { projectId: 0, reason: '', contentBasis: '', amount: 0, visaDate: '', includeInProject: true, remark: '' });
    await loadAll();
  } catch (error) {
    handleApiError(error, '签证保存失败');
  }
}

watch(
  projectId,
  () => {
    loadAll();
  },
  { immediate: true }
);
</script>
