import type { DocWorkflowNodeTaskForm, DocWorkflowTemplate, DocWorkflowTemplateForm, DocWorkflowTemplateNodeForm } from '@/api/docman/types';

export interface TaskOption {
  label: string;
  value: string;
}

export interface TaskPreset {
  label: string;
  value: string;
  taskCode: string;
  taskName: string;
  completionRule?: string;
  description?: string;
}

export interface FieldGroupReference {
  value: string;
  label: string;
  fields: string[];
  completionRule?: string;
}

export const COMPLETION_RULE_OPTIONS: TaskOption[] = [
  { label: '项目基础信息已具备', value: 'project_basic_info_present' },
  { label: '存在有效图纸', value: 'drawing_exists' },
  { label: '存在有效签证', value: 'visa_exists' },
  { label: '存在估算快照', value: 'estimate_snapshot_exists' }
];

export const FORM_FILL_PRESETS: TaskPreset[] = [
  {
    label: '项目信息录入',
    value: 'project_info',
    taskCode: 'project_info_fill',
    taskName: '完成项目信息',
    completionRule: 'project_basic_info_present',
    description: '项目基础信息字段组'
  },
  {
    label: '图纸录入',
    value: 'drawing_input',
    taskCode: 'drawing_fill',
    taskName: '录入图纸信息',
    completionRule: 'drawing_exists',
    description: '图纸线字段组'
  },
  {
    label: '签证录入',
    value: 'visa_input',
    taskCode: 'visa_fill',
    taskName: '录入签证信息',
    completionRule: 'visa_exists',
    description: '签证线字段组'
  },
  {
    label: '工作量录入',
    value: 'workload_input',
    taskCode: 'workload_fill',
    taskName: '录入工作量记录',
    description: '工作量线字段组'
  }
];

export const PLUGIN_RUN_PRESETS: TaskPreset[] = [
  {
    label: '初步估算',
    value: 'estimate_run',
    taskCode: 'estimate_run',
    taskName: '执行初步估算',
    completionRule: 'estimate_snapshot_exists',
    description: '估算插件执行事项'
  },
  {
    label: '文本导出',
    value: 'export_text',
    taskCode: 'export_run',
    taskName: '导出文本',
    description: '文本导出插件事项'
  }
];

export const FIELD_GROUP_REFERENCES: FieldGroupReference[] = [
  {
    value: 'project_info',
    label: '项目信息字段组',
    fields: [
      'name',
      'projectTypeCode',
      'customerType',
      'businessType',
      'documentCategory',
      'telecomCode',
      'xiangyunCode',
      'telecomProjectDate',
      'planStartDate',
      'planEndDate',
      'remark'
    ],
    completionRule: 'project_basic_info_present'
  },
  {
    value: 'drawing_input',
    label: '图纸线字段组',
    fields: ['drawingCode', 'orderSerialNo', 'workContent', 'includeInProject', 'remark'],
    completionRule: 'drawing_exists'
  },
  {
    value: 'visa_input',
    label: '签证线字段组',
    fields: ['reason', 'contentBasis', 'amount', 'visaDate', 'includeInProject', 'remark'],
    completionRule: 'visa_exists'
  },
  {
    value: 'workload_input',
    label: '工作量线字段组',
    fields: ['estimatedPrice', 'enable', 'remark', 'details.name', 'details.alias', 'details.price', 'details.remark']
  },
  {
    value: 'estimate_run',
    label: '估算插件口径',
    fields: ['drawingCount', 'visaCount', 'estimateAmount', 'summary'],
    completionRule: 'estimate_snapshot_exists'
  },
  {
    value: 'export_text',
    label: '文本导出口径',
    fields: ['archiveFolderName', 'generatedFiles', 'pluginCodes']
  }
];

export function createEmptyTask(sortOrder = 1): DocWorkflowNodeTaskForm {
  return {
    taskCode: '',
    taskName: '',
    taskType: 'form_fill',
    requiredFlag: true,
    sortOrder,
    completionRule: '',
    pluginCodes: '',
    pluginCodeList: [],
    description: '',
    status: 'active'
  };
}

export function createEmptyNode(sortOrder = 1): DocWorkflowTemplateNodeForm {
  return {
    nodeCode: '',
    nodeName: '',
    sortOrder,
    description: '',
    status: 'active',
    tasks: []
  };
}

export function normalizeTemplateForm(template?: Partial<DocWorkflowTemplate>): DocWorkflowTemplateForm {
  return {
    id: template?.id,
    code: template?.code || '',
    name: template?.name || '',
    projectTypeCode: template?.projectTypeCode || 'telecom',
    description: template?.description || '',
    defaultFlag: Boolean(template?.defaultFlag),
    sortOrder: template?.sortOrder ?? 1,
    status: template?.status || 'active',
    nodes: cloneNodes(template?.nodes)
  };
}

export function cloneNodes(nodes?: DocWorkflowTemplateNodeForm[]): DocWorkflowTemplateNodeForm[] {
  return (nodes || []).map((node) => ({
    id: node.id,
    nodeCode: node.nodeCode,
    nodeName: node.nodeName,
    sortOrder: node.sortOrder,
    description: node.description,
    status: node.status,
    tasks: (node.tasks || []).map((task) => ({
      id: task.id,
      taskCode: task.taskCode,
      taskName: task.taskName,
      taskType: task.taskType,
      requiredFlag: task.requiredFlag,
      sortOrder: task.sortOrder,
      completionRule: task.completionRule,
      pluginCodes: task.pluginCodes,
      pluginCodeList: splitPluginCodes(task.pluginCodes),
      description: task.description,
      status: task.status
    }))
  }));
}

export function splitPluginCodes(pluginCodes?: string): string[] {
  return (pluginCodes || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function joinPluginCodes(pluginCodeList?: string[]): string {
  return (pluginCodeList || [])
    .map((item) => item.trim())
    .filter(Boolean)
    .join(',');
}

export function getCompletionRuleOptions(taskType?: string): TaskOption[] {
  if (taskType === 'form_fill') {
    return COMPLETION_RULE_OPTIONS.filter((item) => item.value !== 'estimate_snapshot_exists');
  }
  if (taskType === 'plugin_run') {
    return COMPLETION_RULE_OPTIONS.filter((item) => item.value === 'estimate_snapshot_exists');
  }
  return COMPLETION_RULE_OPTIONS;
}

export function getTaskPresets(taskType?: string): TaskPreset[] {
  if (taskType === 'form_fill') {
    return FORM_FILL_PRESETS;
  }
  if (taskType === 'plugin_run') {
    return PLUGIN_RUN_PRESETS;
  }
  return [];
}

export function applyTaskPreset(task: DocWorkflowNodeTaskForm, presetValue?: string): DocWorkflowNodeTaskForm {
  if (!presetValue) {
    return task;
  }
  const preset = [...FORM_FILL_PRESETS, ...PLUGIN_RUN_PRESETS].find((item) => item.value === presetValue);
  if (!preset) {
    return task;
  }
  return {
    ...task,
    taskCode: preset.taskCode,
    taskName: preset.taskName,
    completionRule: preset.completionRule ?? task.completionRule ?? '',
    description: preset.description ?? task.description ?? ''
  };
}

export function getTaskDescriptionPlaceholder(taskType?: string): string {
  if (taskType === 'form_fill') {
    return '字段模式备注，如图纸线/签证线/工作量线';
  }
  if (taskType === 'plugin_run') {
    return '插件执行说明';
  }
  if (taskType === 'manager_adjust') {
    return '经理调整说明';
  }
  return '事项说明';
}

export function getFieldGroupReference(value?: string): FieldGroupReference | undefined {
  return FIELD_GROUP_REFERENCES.find((item) => item.value === value);
}

export function serializeTemplateForm(form: DocWorkflowTemplateForm): DocWorkflowTemplateForm {
  return {
    ...form,
    nodes: (form.nodes || []).map((node) => ({
      ...node,
      tasks: (node.tasks || []).map((task) => ({
        id: task.id,
        taskCode: task.taskCode,
        taskName: task.taskName,
        taskType: task.taskType,
        requiredFlag: task.requiredFlag,
        sortOrder: task.sortOrder,
        completionRule: task.completionRule,
        pluginCodes: joinPluginCodes(task.pluginCodeList),
        description: task.description,
        status: task.status
      }))
    }))
  };
}
