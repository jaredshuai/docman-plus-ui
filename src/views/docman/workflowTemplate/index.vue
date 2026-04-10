<template>
  <div class="app-container" data-testid="workflow-template-page">
    <el-page-header @back="$router.back()">
      <template #content>流程模板配置</template>
    </el-page-header>

    <el-alert
      title="当前页面已支持结构化配置节点与事项。字段模式本阶段通过必填、完成规则和说明字段承载。"
      type="info"
      show-icon
      :closable="false"
      style="margin-top: 16px"
    />

    <el-row :gutter="10" class="mb8" style="margin-top: 16px">
      <el-col :span="6">
        <el-select v-model="queryProjectTypeCode" placeholder="按项目类型筛选" clearable style="width: 100%" @change="loadTemplates">
          <el-option v-for="item in typeList" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </el-col>
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['docman:process:bind']">新增模板</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="templateList" border>
      <el-table-column prop="code" label="编码" min-width="140" />
      <el-table-column prop="name" label="名称" min-width="180" />
      <el-table-column prop="projectTypeCode" label="项目类型" width="160" />
      <el-table-column prop="defaultFlag" label="默认" width="100">
        <template #default="{ row }">{{ row.defaultFlag ? '是' : '否' }}</template>
      </el-table-column>
      <el-table-column prop="nodes" label="节点数" width="100">
        <template #default="{ row }">{{ row.nodes?.length || 0 }}</template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.open" :title="dialog.title" width="1040px">
      <el-form :model="form" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="编码"><el-input v-model="form.code" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="项目类型">
              <el-select v-model="form.projectTypeCode" style="width: 100%">
                <el-option v-for="item in typeList" :key="item.code" :label="item.name" :value="item.code" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="默认模板"><el-switch v-model="form.defaultFlag" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="active" value="active" />
                <el-option label="inactive" value="inactive" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="说明"><el-input v-model="form.description" type="textarea" /></el-form-item>

        <el-alert v-if="pluginLoadError" :title="pluginLoadError" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
        <el-card shadow="never" style="margin-bottom: 16px">
          <template #header>可用插件</template>
          <el-empty v-if="!pluginList.length" description="暂无可用插件" />
          <el-space v-else wrap>
            <el-tooltip v-for="plugin in pluginList" :key="plugin.pluginId" :content="pluginTooltip(plugin)" placement="top">
              <el-tag>{{ plugin.pluginName }}</el-tag>
            </el-tooltip>
          </el-space>
        </el-card>

        <el-card shadow="never" style="margin-bottom: 16px">
          <template #header>字段模式参考</template>
          <el-table :data="FIELD_GROUP_REFERENCES" size="small" border>
            <el-table-column prop="label" label="字段组" min-width="160" />
            <el-table-column label="推荐字段" min-width="420" show-overflow-tooltip>
              <template #default="{ row }">
                {{ row.fields.join(', ') }}
              </template>
            </el-table-column>
            <el-table-column label="建议完成规则" min-width="180">
              <template #default="{ row }">
                <span>{{ row.completionRule || '-' }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <div class="node-toolbar">
          <span class="section-title">节点与事项配置</span>
          <el-button type="primary" plain icon="Plus" @click="handleAddNode">新增节点</el-button>
        </div>
        <el-empty v-if="!form.nodes?.length" description="暂无节点，请新增节点后配置事项" />
        <div v-else class="node-list">
          <el-card v-for="(node, nodeIndex) in form.nodes" :key="node.id ?? `node-${nodeIndex}`" class="node-card" shadow="never">
            <template #header>
              <div class="node-card__header">
                <span>节点 {{ nodeIndex + 1 }}</span>
                <el-space wrap>
                  <el-button type="primary" link @click="handleAddTask(nodeIndex)">新增事项</el-button>
                  <el-button type="danger" link @click="handleRemoveNode(nodeIndex)">删除节点</el-button>
                </el-space>
              </div>
            </template>

            <el-row :gutter="12">
              <el-col :span="6"
                ><el-form-item label="节点编码" label-width="80"><el-input v-model="node.nodeCode" /></el-form-item
              ></el-col>
              <el-col :span="6"
                ><el-form-item label="节点名称" label-width="80"><el-input v-model="node.nodeName" /></el-form-item
              ></el-col>
              <el-col :span="4"
                ><el-form-item label="排序" label-width="60"><el-input-number v-model="node.sortOrder" :min="0" style="width: 100%" /></el-form-item
              ></el-col>
              <el-col :span="4"
                ><el-form-item label="状态" label-width="60"
                  ><el-select v-model="node.status" style="width: 100%"
                    ><el-option label="active" value="active" /><el-option label="inactive" value="inactive" /></el-select></el-form-item
              ></el-col>
              <el-col :span="4"
                ><el-form-item label="说明" label-width="60"><el-input v-model="node.description" /></el-form-item
              ></el-col>
            </el-row>

            <el-table :data="node.tasks || []" border size="small">
              <el-table-column label="事项编码" min-width="130">
                <template #default="{ row }"><el-input v-model="row.taskCode" /></template>
              </el-table-column>
              <el-table-column label="事项名称" min-width="140">
                <template #default="{ row }"><el-input v-model="row.taskName" /></template>
              </el-table-column>
              <el-table-column label="类型" width="150">
                <template #default="{ row }">
                  <el-select v-model="row.taskType" style="width: 100%">
                    <el-option v-for="item in taskTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="必填" width="90" align="center">
                <template #default="{ row }"><el-switch v-model="row.requiredFlag" /></template>
              </el-table-column>
              <el-table-column label="排序" width="90">
                <template #default="{ row }"><el-input-number v-model="row.sortOrder" :min="0" style="width: 100%" /></template>
              </el-table-column>
              <el-table-column label="字段模式预设" min-width="170">
                <template #default="{ row }">
                  <el-select
                    v-if="getTaskPresets(row.taskType).length"
                    placeholder="选择预设"
                    style="width: 100%"
                    @change="(value) => handleApplyTaskPreset(row, String(value || ''))"
                  >
                    <el-option v-for="item in getTaskPresets(row.taskType)" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                  <span v-else class="plugin-placeholder">当前事项类型暂无预设</span>
                  <div v-if="resolveFieldGroupHint(row)" class="field-hint">{{ resolveFieldGroupHint(row) }}</div>
                </template>
              </el-table-column>
              <el-table-column label="完成规则 / 字段模式占位" min-width="180">
                <template #default="{ row }">
                  <el-select
                    v-model="row.completionRule"
                    filterable
                    allow-create
                    clearable
                    default-first-option
                    placeholder="选择或输入规则编码"
                    style="width: 100%"
                  >
                    <el-option v-for="item in getCompletionRuleOptions(row.taskType)" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="插件编码" min-width="170">
                <template #default="{ row }">
                  <el-select
                    v-if="row.taskType === 'plugin_run'"
                    v-model="row.pluginCodeList"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    style="width: 100%"
                  >
                    <el-option v-for="plugin in pluginList" :key="plugin.pluginId" :label="plugin.pluginName" :value="plugin.pluginId" />
                  </el-select>
                  <span v-else class="plugin-placeholder">仅插件事项可绑定插件</span>
                </template>
              </el-table-column>
              <el-table-column label="说明" min-width="160">
                <template #default="{ row }"
                  ><el-input v-model="row.description" :placeholder="getTaskDescriptionPlaceholder(row.taskType)"
                /></template>
              </el-table-column>
              <el-table-column label="状态" width="120">
                <template #default="{ row }">
                  <el-select v-model="row.status" style="width: 100%">
                    <el-option label="active" value="active" />
                    <el-option label="inactive" value="inactive" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" fixed="right">
                <template #default="{ $index }">
                  <el-button type="danger" link @click="handleRemoveTask(nodeIndex, $index)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialog.open = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { listProjectType } from '@/api/docman/projectType';
import { deleteWorkflowTemplate, listWorkflowTemplate, saveWorkflowTemplate } from '@/api/docman/workflowTemplate';
import { listPlugins } from '@/api/docman/plugin';
import type { DocPluginInfo, DocProjectType, DocWorkflowTemplate, DocWorkflowTemplateForm } from '@/api/docman/types';
import { handleApiError } from '@/utils/error';
import {
  applyTaskPreset,
  FIELD_GROUP_REFERENCES,
  cloneNodes,
  createEmptyNode,
  createEmptyTask,
  getCompletionRuleOptions,
  getFieldGroupReference,
  getTaskDescriptionPlaceholder,
  getTaskPresets,
  normalizeTemplateForm,
  serializeTemplateForm
} from './workflowTemplate.util';

const loading = ref(false);
const queryProjectTypeCode = ref('');
const typeList = ref<DocProjectType[]>([]);
const templateList = ref<DocWorkflowTemplate[]>([]);
const pluginList = ref<DocPluginInfo[]>([]);
const pluginLoadError = ref('');
const dialog = reactive({ open: false, title: '新增模板' });
const form = reactive<DocWorkflowTemplateForm>(normalizeTemplateForm());
const taskTypeOptions = [
  { label: '表单填写', value: 'form_fill' },
  { label: '插件执行', value: 'plugin_run' },
  { label: '复核确认', value: 'review_confirm' },
  { label: '经理调整', value: 'manager_adjust' }
];

async function loadProjectTypes() {
  const res = await listProjectType();
  typeList.value = res.data || [];
}

async function loadPlugins() {
  pluginLoadError.value = '';
  try {
    const res = await listPlugins();
    pluginList.value = res.data || [];
  } catch (error) {
    pluginList.value = [];
    pluginLoadError.value = handleApiError(error, '插件列表加载失败', { showMessage: false });
  }
}

async function loadTemplates() {
  loading.value = true;
  try {
    const res = await listWorkflowTemplate(queryProjectTypeCode.value || undefined);
    templateList.value = res.data || [];
  } catch (error) {
    handleApiError(error, '加载流程模板失败');
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  Object.assign(form, normalizeTemplateForm());
}

function handleAdd() {
  resetForm();
  dialog.title = '新增模板';
  dialog.open = true;
}

function handleEdit(row: DocWorkflowTemplate) {
  Object.assign(form, normalizeTemplateForm({ ...row, nodes: cloneNodes(row.nodes) }));
  dialog.title = '编辑模板';
  dialog.open = true;
}

function handleAddNode() {
  const nodes = form.nodes || [];
  nodes.push(createEmptyNode(nodes.length + 1));
  form.nodes = nodes;
}

function handleRemoveNode(nodeIndex: number) {
  form.nodes = (form.nodes || []).filter((_, index) => index !== nodeIndex);
}

function handleAddTask(nodeIndex: number) {
  const node = form.nodes?.[nodeIndex];
  if (!node) return;
  const tasks = node.tasks || [];
  tasks.push(createEmptyTask(tasks.length + 1));
  node.tasks = tasks;
}

function handleRemoveTask(nodeIndex: number, taskIndex: number) {
  const node = form.nodes?.[nodeIndex];
  if (!node) return;
  node.tasks = (node.tasks || []).filter((_, index) => index !== taskIndex);
}

function resolveFieldGroupHint(task: DocWorkflowTemplateForm['nodes'][number]['tasks'][number]) {
  if (!task) return '';
  const presetKey = (() => {
    switch (task.taskCode) {
      case 'project_info_fill':
        return 'project_info';
      case 'drawing_fill':
        return 'drawing_input';
      case 'visa_fill':
        return 'visa_input';
      case 'workload_fill':
        return 'workload_input';
      case 'estimate_run':
        return 'estimate_run';
      case 'manager_adjust':
        return 'balance_adjustment';
      case 'export_run':
        return 'export_text';
      default:
        return '';
    }
  })();
  return getFieldGroupReference(presetKey)?.label || '';
}

function handleApplyTaskPreset(task: DocWorkflowTemplateForm['nodes'][number]['tasks'][number], presetValue: string) {
  Object.assign(task, applyTaskPreset(task, presetValue));
}

async function handleSave() {
  try {
    await saveWorkflowTemplate(serializeTemplateForm(form));
    ElMessage.success('保存成功');
    dialog.open = false;
    await loadTemplates();
  } catch (error) {
    handleApiError(error, '保存流程模板失败，请检查节点JSON格式');
  }
}

async function handleDelete(row: DocWorkflowTemplate) {
  await ElMessageBox.confirm(`确认删除流程模板「${row.name}」？`, '提示', { type: 'warning' });
  try {
    await deleteWorkflowTemplate([row.id]);
    ElMessage.success('删除成功');
    await loadTemplates();
  } catch (error) {
    handleApiError(error, '删除流程模板失败');
  }
}

function pluginTooltip(plugin: DocPluginInfo) {
  return `${plugin.pluginType} | 输入${plugin.inputFields.length}个 | 输出${plugin.outputFields.length}个`;
}

onMounted(async () => {
  await loadProjectTypes();
  await loadPlugins();
  await loadTemplates();
});
</script>

<style scoped>
.node-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
}

.node-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.node-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.plugin-placeholder {
  color: #909399;
  font-size: 13px;
}

.field-hint {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
