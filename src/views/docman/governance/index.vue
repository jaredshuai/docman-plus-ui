<template>
  <div class="app-container" data-testid="docman-governance-page">
    <el-alert
      title="系统治理仅面向超级管理员，所有变更都会直接影响 docman 字典与系统级规则。"
      type="warning"
      show-icon
      :closable="false"
      class="mb8"
    />
    <el-alert v-if="loadError" :title="loadError" type="error" show-icon :closable="false" class="mb8" />

    <el-row :gutter="16" class="mb16">
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__label">业务字典类型</div>
          <div class="summary-card__count">{{ summary.dictTypeCount }}</div>
          <div class="summary-card__desc">当前纳入治理的 `doc_*` 字典类型数量。</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__label">项目类型</div>
          <div class="summary-card__count">{{ summary.projectTypeCount }}</div>
          <div class="summary-card__desc">电信项目分类与客户类型映射。</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="summary-card">
          <div class="summary-card__label">流程模板</div>
          <div class="summary-card__count">{{ summary.workflowTemplateCount }}</div>
          <div class="summary-card__desc">项目闭环流程的节点、事项和插件绑定。</div>
        </el-card>
      </el-col>
    </el-row>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="业务字典" name="dict">
        <el-row :gutter="16">
          <el-col :xs="24" :lg="10">
            <el-card shadow="never">
              <template #header>
                <div class="governance-header">
                  <span>字典类型</span>
                  <div class="governance-actions">
                    <el-button type="primary" link @click="handleOpenTypeDialog()">新增类型</el-button>
                    <el-button link @click="handleRefreshCache">刷新缓存</el-button>
                  </div>
                </div>
              </template>

              <el-form :inline="true" :model="dictQuery" class="mb8">
                <el-form-item label="名称">
                  <el-input v-model="dictQuery.dictName" placeholder="筛选名称" clearable />
                </el-form-item>
                <el-form-item label="编码">
                  <el-input v-model="dictQuery.dictType" placeholder="筛选编码" clearable />
                </el-form-item>
              </el-form>

              <el-table
                v-loading="loading"
                :data="visibleDictTypes"
                highlight-current-row
                row-key="dictId"
                empty-text="暂无 docman 字典类型"
                @row-click="handleSelectType"
              >
                <el-table-column prop="dictName" label="名称" min-width="140" />
                <el-table-column prop="dictType" label="编码" min-width="160" />
                <el-table-column prop="remark" label="说明" min-width="160" show-overflow-tooltip />
                <el-table-column label="操作" width="130" fixed="right">
                  <template #default="{ row }">
                    <el-button link type="primary" @click.stop="handleOpenTypeDialog(row)">编辑</el-button>
                    <el-button link type="danger" @click.stop="handleDeleteType(row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-col>

          <el-col :xs="24" :lg="14">
            <el-card shadow="never">
              <template #header>
                <div class="governance-header">
                  <span>{{ selectedDictType ? `${selectedDictType.dictName} 字典项` : '字典项' }}</span>
                  <div class="governance-actions">
                    <el-button type="primary" link :disabled="!selectedDictType" @click="handleOpenDataDialog()">新增字典项</el-button>
                  </div>
                </div>
              </template>

              <el-empty v-if="!selectedDictType" description="请选择左侧字典类型" />
              <template v-else>
                <el-descriptions :column="2" border class="mb8">
                  <el-descriptions-item label="字典编码">{{ selectedDictType.dictType }}</el-descriptions-item>
                  <el-descriptions-item label="字典项数">{{ dictDataDescription }}</el-descriptions-item>
                  <el-descriptions-item label="说明" :span="2">{{ selectedDictType.remark || '-' }}</el-descriptions-item>
                </el-descriptions>

                <el-table v-loading="dataLoading" :data="dictDataList" row-key="dictCode" empty-text="当前字典暂无字典项">
                  <el-table-column prop="dictLabel" label="标签" min-width="130" />
                  <el-table-column prop="dictValue" label="键值" min-width="120" />
                  <el-table-column prop="dictSort" label="排序" width="80" />
                  <el-table-column label="表格样式" width="110">
                    <template #default="{ row }">
                      <el-tag :type="row.listClass || 'info'" size="small">{{ row.listClass || 'default' }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="cssClass" label="CSS Class" min-width="120" />
                  <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
                  <el-table-column label="操作" width="130" fixed="right">
                    <template #default="{ row }">
                      <el-button link type="primary" @click="handleOpenDataDialog(row)">编辑</el-button>
                      <el-button link type="danger" @click="handleDeleteData(row)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="关键规则" name="rules">
        <el-alert title="关键规则项仍复用已有 docman 页面，这里只做集中治理入口，不复制整页。" type="info" show-icon :closable="false" class="mb8" />
        <el-row :gutter="16">
          <el-col v-for="card in ruleCards" :key="card.key" :xs="24" :md="12">
            <el-card shadow="never" class="rule-card">
              <div class="rule-card__title">{{ card.title }}</div>
              <div class="rule-card__count">{{ card.count }}</div>
              <div class="rule-card__desc">{{ card.description }}</div>
              <el-button type="primary" plain @click="router.push(card.route)">{{ card.actionText }}</el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="typeDialog.visible" :title="typeDialog.title" width="520px" append-to-body>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="92px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictType">
          <el-input v-model="typeForm.dictType" :disabled="Boolean(typeForm.dictId)" placeholder="必须以 doc_ 开头" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitTypeForm">保存</el-button>
        <el-button @click="typeDialog.visible = false">取消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="dataDialog.visible" :title="dataDialog.title" width="560px" append-to-body>
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="92px">
        <el-form-item label="字典类型">
          <el-input :model-value="selectedDictType?.dictType || ''" disabled />
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="排序" prop="dictSort">
          <el-input-number v-model="dataForm.dictSort" :min="1" :max="999" />
        </el-form-item>
        <el-form-item label="表格样式" prop="listClass">
          <el-select v-model="dataForm.listClass" placeholder="默认" clearable style="width: 100%">
            <el-option v-for="item in listClassOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="CSS Class" prop="cssClass">
          <el-input v-model="dataForm.cssClass" placeholder="可选的 CSS 类" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitDataForm">保存</el-button>
        <el-button @click="dataDialog.visible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { DictDataForm, DictDataVO } from '@/api/system/dict/data/types';
import type { DictTypeForm, DictTypeVO } from '@/api/system/dict/type/types';
import { listProjectType } from '@/api/docman/projectType';
import { listWorkflowTemplate } from '@/api/docman/workflowTemplate';
import {
  deleteGovernanceDictData,
  deleteGovernanceDictType,
  listGovernanceDictData,
  listGovernanceDictTypes,
  refreshGovernanceDictCache,
  saveGovernanceDictData,
  saveGovernanceDictType
} from '@/api/docman/governance';
import { useDictStore } from '@/store/modules/dict';
import { handleApiError } from '@/utils/error';
import {
  buildGovernanceRuleCards,
  describeDictDataCount,
  filterDocmanDictTypes,
  normalizeDictDataForm,
  normalizeDictTypeForm
} from './governance.util';

const router = useRouter();
const dictStore = useDictStore();

const activeTab = ref('dict');
const loading = ref(false);
const dataLoading = ref(false);
const loadError = ref('');
const allDictTypes = ref<DictTypeVO[]>([]);
const dictDataList = ref<DictDataVO[]>([]);
const selectedDictType = ref<DictTypeVO>();

const typeFormRef = ref<ElFormInstance>();
const dataFormRef = ref<ElFormInstance>();

const dictQuery = reactive({
  dictName: '',
  dictType: ''
});

const summary = reactive({
  dictTypeCount: 0,
  projectTypeCount: 0,
  workflowTemplateCount: 0
});

const typeDialog = reactive({
  visible: false,
  title: '新增字典类型'
});

const dataDialog = reactive({
  visible: false,
  title: '新增字典项'
});

const typeForm = reactive<DictTypeForm>(normalizeDictTypeForm());
const dataForm = reactive<DictDataForm>(normalizeDictDataForm());

const typeRules = {
  dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
  dictType: [
    { required: true, message: '字典编码不能为空', trigger: 'blur' },
    { pattern: /^doc_[a-z0-9_]+$/, message: '字典编码必须以 doc_ 开头且只包含小写字母、数字、下划线', trigger: 'blur' }
  ]
};

const dataRules = {
  dictLabel: [{ required: true, message: '字典标签不能为空', trigger: 'blur' }],
  dictValue: [{ required: true, message: '字典键值不能为空', trigger: 'blur' }],
  dictSort: [{ required: true, message: '排序不能为空', trigger: 'change' }]
};

const listClassOptions = [
  { label: '默认', value: '' },
  { label: 'primary', value: 'primary' },
  { label: 'success', value: 'success' },
  { label: 'info', value: 'info' },
  { label: 'warning', value: 'warning' },
  { label: 'danger', value: 'danger' }
];

const visibleDictTypes = computed(() => filterDocmanDictTypes(allDictTypes.value, dictQuery));
const dictDataDescription = computed(() => describeDictDataCount(dictDataList.value));
const ruleCards = computed(() =>
  buildGovernanceRuleCards({
    projectTypeCount: summary.projectTypeCount,
    workflowTemplateCount: summary.workflowTemplateCount
  })
);

async function loadGovernanceOverview(targetDictType?: string) {
  loading.value = true;
  loadError.value = '';
  try {
    const [dictTypeRes, projectTypeRes, workflowTemplateRes] = await Promise.all([
      listGovernanceDictTypes(),
      listProjectType(),
      listWorkflowTemplate()
    ]);
    allDictTypes.value = dictTypeRes.rows || [];
    summary.dictTypeCount = filterDocmanDictTypes(dictTypeRes.rows || []).length;
    summary.projectTypeCount = projectTypeRes.data?.length || 0;
    summary.workflowTemplateCount = workflowTemplateRes.data?.length || 0;
    await syncSelectedType(targetDictType);
  } catch (error) {
    allDictTypes.value = [];
    dictDataList.value = [];
    selectedDictType.value = undefined;
    loadError.value = handleApiError(error, '系统治理信息加载失败，请稍后重试');
  } finally {
    loading.value = false;
  }
}

async function syncSelectedType(targetDictType?: string) {
  const filtered = filterDocmanDictTypes(allDictTypes.value);
  const nextType =
    filtered.find((item) => item.dictType === targetDictType) ||
    filtered.find((item) => item.dictType === selectedDictType.value?.dictType) ||
    filtered[0];
  selectedDictType.value = nextType;
  if (!nextType) {
    dictDataList.value = [];
    return;
  }
  await loadDictData(nextType.dictType);
}

async function loadDictData(dictType: string) {
  dataLoading.value = true;
  try {
    const res = await listGovernanceDictData({ dictType });
    dictDataList.value = res.rows || [];
  } catch (error) {
    dictDataList.value = [];
    ElMessage.error(handleApiError(error, '字典项加载失败，请稍后重试'));
  } finally {
    dataLoading.value = false;
  }
}

function handleSelectType(row: DictTypeVO) {
  selectedDictType.value = row;
  loadDictData(row.dictType);
}

function handleOpenTypeDialog(row?: DictTypeVO) {
  Object.assign(typeForm, normalizeDictTypeForm(row || {}));
  typeFormRef.value?.clearValidate();
  typeDialog.title = row?.dictId ? '编辑字典类型' : '新增字典类型';
  typeDialog.visible = true;
}

function handleOpenDataDialog(row?: DictDataVO) {
  if (!selectedDictType.value) {
    ElMessage.warning('请先选择一个字典类型');
    return;
  }
  Object.assign(dataForm, normalizeDictDataForm(selectedDictType.value.dictType, row || {}));
  dataFormRef.value?.clearValidate();
  dataDialog.title = row?.dictCode ? '编辑字典项' : '新增字典项';
  dataDialog.visible = true;
}

function submitTypeForm() {
  typeFormRef.value?.validate(async (valid) => {
    if (!valid) {
      return;
    }
    try {
      await saveGovernanceDictType({ ...typeForm });
      await refreshGovernanceDictCache();
      dictStore.cleanDict();
      ElMessage.success(typeForm.dictId ? '字典类型更新成功' : '字典类型新增成功');
      typeDialog.visible = false;
      await loadGovernanceOverview(typeForm.dictType);
    } catch (error) {
      ElMessage.error(handleApiError(error, '字典类型保存失败，请稍后重试'));
    }
  });
}

async function handleDeleteType(row: DictTypeVO) {
  try {
    await ElMessageBox.confirm(`确认删除字典类型“${row.dictName}”吗？`, '提示', { type: 'warning' });
    await deleteGovernanceDictType(row.dictId);
    await refreshGovernanceDictCache();
    dictStore.cleanDict();
    ElMessage.success('字典类型删除成功');
    await loadGovernanceOverview();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(handleApiError(error, '字典类型删除失败，请稍后重试'));
    }
  }
}

function submitDataForm() {
  dataFormRef.value?.validate(async (valid) => {
    if (!valid || !selectedDictType.value) {
      return;
    }
    try {
      await saveGovernanceDictData({
        ...dataForm,
        dictType: selectedDictType.value.dictType
      });
      dictStore.removeDict(selectedDictType.value.dictType);
      ElMessage.success(dataForm.dictCode ? '字典项更新成功' : '字典项新增成功');
      dataDialog.visible = false;
      await loadDictData(selectedDictType.value.dictType);
    } catch (error) {
      ElMessage.error(handleApiError(error, '字典项保存失败，请稍后重试'));
    }
  });
}

async function handleDeleteData(row: DictDataVO) {
  if (!selectedDictType.value) {
    return;
  }
  try {
    await ElMessageBox.confirm(`确认删除字典项“${row.dictLabel}”吗？`, '提示', { type: 'warning' });
    await deleteGovernanceDictData(row.dictCode);
    dictStore.removeDict(selectedDictType.value.dictType);
    ElMessage.success('字典项删除成功');
    await loadDictData(selectedDictType.value.dictType);
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(handleApiError(error, '字典项删除失败，请稍后重试'));
    }
  }
}

async function handleRefreshCache() {
  try {
    await refreshGovernanceDictCache();
    dictStore.cleanDict();
    ElMessage.success('字典缓存已刷新');
  } catch (error) {
    ElMessage.error(handleApiError(error, '字典缓存刷新失败，请稍后重试'));
  }
}

onMounted(() => {
  loadGovernanceOverview();
});
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}

.summary-card,
.rule-card {
  height: 100%;
}

.summary-card__label,
.rule-card__title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.summary-card__count,
.rule-card__count {
  margin: 12px 0 8px;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
}

.summary-card__desc,
.rule-card__desc {
  min-height: 40px;
  color: var(--el-text-color-secondary);
}

.rule-card__desc {
  margin-bottom: 16px;
}

.governance-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.governance-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
