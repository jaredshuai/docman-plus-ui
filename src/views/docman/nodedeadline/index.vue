<template>
  <div class="app-container" data-testid="node-deadline-page">
    <el-page-header @back="$router.back()">
      <template #content>节点时限管理</template>
    </el-page-header>

    <el-card shadow="hover" style="margin-top: 20px">
      <el-tabs v-model="activeTab">
        <!-- ==================== Tab 1：节点时限配置 ==================== -->
        <el-tab-pane label="节点时限配置" name="duration">
          <el-alert v-if="durationLoadError" :title="durationLoadError" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
          <el-form :inline="true" style="margin-bottom: 16px">
            <el-form-item label="流程模板">
              <el-select v-model="selectedDefinitionId" placeholder="请选择流程模板" @change="handleDefinitionChange">
                <el-option v-for="item in definitionList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table v-loading="durationLoading" :data="nodeList" border stripe :row-key="(row) => row.nodeId">
            <el-table-column prop="nodeName" label="节点名称" />
            <el-table-column prop="nodeCode" label="节点编码" />
            <el-table-column label="时限天数" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.durationDays > 0 ? 'primary' : 'info'">
                  {{ row.durationDays > 0 ? row.durationDays + ' 天' : '不限' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['docman:nodedeadline:edit']" type="primary" link @click="openDurationDialog(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- ==================== Tab 2：截止日期列表 ==================== -->
        <el-tab-pane label="截止日期列表" name="deadline">
          <el-alert v-if="deadlineLoadError" :title="deadlineLoadError" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
          <el-form :inline="true" style="margin-bottom: 16px">
            <el-form-item label="项目">
              <el-select v-model="selectedProjectId" filterable placeholder="请选择项目" @change="handleProjectChange">
                <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table v-loading="deadlineLoading" :data="deadlineList" border stripe :row-key="(row) => row.id">
            <el-table-column prop="nodeCode" label="节点编码" />
            <el-table-column prop="deadline" label="截止日期" width="160" align="center" />
            <el-table-column label="剩余天数" width="120" align="center">
              <template #default="{ row }">
                <span :style="{ color: remainColor(getRemainDays(row.deadline)), fontWeight: 'bold' }"> {{ getRemainDays(row.deadline) }} 天 </span>
              </template>
            </el-table-column>
            <el-table-column prop="reminderCount" label="已提醒次数" width="120" align="center" />
            <el-table-column prop="lastRemindedAt" label="最后提醒时间" width="180" align="center">
              <template #default="{ row }">{{ row.lastRemindedAt || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button v-hasPermi="['docman:nodedeadline:edit']" type="primary" link @click="openDeadlineDialog(row)">修改截止日期</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ==================== 编辑时限天数弹窗 ==================== -->
    <el-dialog v-model="durationDialogVisible" title="编辑节点时限" width="420px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="节点名称">
          <span>{{ durationForm.nodeName }}</span>
        </el-form-item>
        <el-form-item label="时限天数">
          <el-input-number v-model="durationForm.durationDays" :min="0" placeholder="0表示不限" />
          <span class="form-tip">设为0则不发截止提醒</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="durationDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="durationSaving" @click="handleSaveDuration">确 定</el-button>
      </template>
    </el-dialog>

    <!-- ==================== 修改截止日期弹窗 ==================== -->
    <el-dialog v-model="deadlineDialogVisible" title="修改截止日期" width="420px" append-to-body>
      <el-form label-width="100px">
        <el-form-item label="节点编码">
          <span>{{ deadlineForm.nodeCode }}</span>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="deadlineForm.deadline" type="date" value-format="YYYY-MM-DD" placeholder="选择截止日期" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="deadlineDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="deadlineSaving" @click="handleSaveDeadline">确 定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';
import { listProcessDefinitions } from '@/api/docman/process';
import { listProject } from '@/api/docman/project';
import {
  listNodesByDefinition,
  updateNodeDuration,
  listNodeDeadlines,
  updateNodeDeadline,
  type NodeDurationVo,
  type NodeDeadlineVo
} from '@/api/docman/nodedeadline';
import { handleApiError } from '@/utils/error';

/* ======================== 公共 ======================== */
const activeTab = ref('duration');

/* ======================== Tab 1：节点时限配置 ======================== */
const definitionList = ref<Array<{ id: number; name: string }>>([]);
const selectedDefinitionId = ref<number>();
const nodeList = ref<NodeDurationVo[]>([]);
const durationLoading = ref(false);
const durationLoadError = ref('');

const loadDefinitions = async () => {
  try {
    const res = await listProcessDefinitions();
    definitionList.value = res.data;
  } catch (e) {
    definitionList.value = [];
    handleApiError(e, '获取流程模板失败');
  }
};

const handleDefinitionChange = async (defId: number) => {
  if (!defId) return;
  durationLoading.value = true;
  durationLoadError.value = '';
  try {
    const res = await listNodesByDefinition(defId);
    nodeList.value = (res.data || []).map((n: NodeDurationVo) => ({
      ...n,
      durationDays: n.durationDays ?? 0
    }));
  } catch (e) {
    nodeList.value = [];
    durationLoadError.value = handleApiError(e, '获取节点列表失败');
  } finally {
    durationLoading.value = false;
  }
};

// 编辑弹窗
const durationDialogVisible = ref(false);
const durationSaving = ref(false);
const durationForm = ref<{ nodeId: number; nodeName: string; durationDays: number }>({
  nodeId: 0,
  nodeName: '',
  durationDays: 0
});

const openDurationDialog = (row: NodeDurationVo) => {
  durationForm.value = { nodeId: row.nodeId, nodeName: row.nodeName, durationDays: row.durationDays ?? 0 };
  durationDialogVisible.value = true;
};

const handleSaveDuration = async () => {
  durationSaving.value = true;
  try {
    await updateNodeDuration({ nodeId: durationForm.value.nodeId, durationDays: durationForm.value.durationDays });
    ElMessage.success('保存成功');
    durationDialogVisible.value = false;
    handleDefinitionChange(selectedDefinitionId.value!);
  } catch (e) {
    handleApiError(e, '保存失败，请重试');
  } finally {
    durationSaving.value = false;
  }
};

/* ======================== Tab 2：截止日期列表 ======================== */
const projectList = ref<Array<{ id: number; name: string }>>([]);
const selectedProjectId = ref<number>();
const deadlineList = ref<NodeDeadlineVo[]>([]);
const deadlineLoading = ref(false);
const deadlineLoadError = ref('');

const loadProjects = async () => {
  try {
    const res = (await listProject({ pageNum: 1, pageSize: 1000 } as any)) as any;
    projectList.value = (res?.rows || []).map((p: any) => ({ id: p.id, name: p.name }));
  } catch (e) {
    projectList.value = [];
    handleApiError(e, '获取项目列表失败');
  }
};

const handleProjectChange = async (projectId: number) => {
  if (!projectId) return;
  deadlineLoading.value = true;
  deadlineLoadError.value = '';
  try {
    const res = await listNodeDeadlines(projectId);
    deadlineList.value = res.data || [];
  } catch (e) {
    deadlineList.value = [];
    deadlineLoadError.value = handleApiError(e, '获取截止日期失败');
  } finally {
    deadlineLoading.value = false;
  }
};

const getRemainDays = (deadline: string): number => {
  return dayjs(deadline).diff(dayjs().startOf('day'), 'day');
};

const remainColor = (days: number): string => {
  if (days > 7) return '#67c23a';
  if (days >= 1) return '#e6a23c';
  return '#f56c6c';
};

// 修改截止日期弹窗
const deadlineDialogVisible = ref(false);
const deadlineSaving = ref(false);
const deadlineForm = ref<{ id: number; nodeCode: string; deadline: string }>({
  id: 0,
  nodeCode: '',
  deadline: ''
});

const openDeadlineDialog = (row: NodeDeadlineVo) => {
  deadlineForm.value = { id: row.id, nodeCode: row.nodeCode, deadline: row.deadline };
  deadlineDialogVisible.value = true;
};

const handleSaveDeadline = async () => {
  deadlineSaving.value = true;
  try {
    await updateNodeDeadline({ id: deadlineForm.value.id, deadline: deadlineForm.value.deadline });
    ElMessage.success('修改成功');
    deadlineDialogVisible.value = false;
    handleProjectChange(selectedProjectId.value!);
  } catch (e) {
    handleApiError(e, '修改截止日期失败，请重试');
  } finally {
    deadlineSaving.value = false;
  }
};

/* ======================== 初始化 ======================== */
onMounted(() => {
  loadDefinitions();
  loadProjects();
});
</script>

<style scoped>
.form-tip {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
