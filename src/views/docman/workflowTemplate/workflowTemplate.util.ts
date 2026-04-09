import type { DocWorkflowNodeTaskForm, DocWorkflowTemplate, DocWorkflowTemplateForm, DocWorkflowTemplateNodeForm } from '@/api/docman/types';

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
