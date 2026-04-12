import type { DocProjectDrawingWorkItem, DocProjectNodeTaskRuntime } from '@/api/docman/types';

const ESTIMATE_TASK_CODE = 'estimate_run';
const EXPORT_TASK_CODE = 'export_run';
const PROJECT_INFO_TASK_CODE = 'project_info_fill';
const DRAWING_TASK_CODE = 'drawing_fill';
const VISA_TASK_CODE = 'visa_fill';
const WORKLOAD_TASK_CODE = 'workload_fill';
const MANAGER_ADJUST_TASK_CODE = 'manager_adjust';
const ESTIMATE_COMPLETION_RULE = 'estimate_snapshot_exists';

export function hasEstimateTask(tasks: DocProjectNodeTaskRuntime[] | undefined): boolean {
  return (tasks ?? []).some(
    (task) =>
      task.taskType === 'plugin_run' &&
      task.status !== 'completed' &&
      (task.completionRule === ESTIMATE_COMPLETION_RULE || task.taskCode === ESTIMATE_TASK_CODE)
  );
}

export function hasExportTask(tasks: DocProjectNodeTaskRuntime[] | undefined): boolean {
  return (tasks ?? []).some((task) => task.taskType === 'plugin_run' && task.status !== 'completed' && task.taskCode === EXPORT_TASK_CODE);
}

export function resolvePluginTaskLabel(task: Pick<DocProjectNodeTaskRuntime, 'taskType' | 'taskCode' | 'completionRule'>): string {
  if (task.taskType !== 'plugin_run') {
    if (task.taskCode === PROJECT_INFO_TASK_CODE) {
      return '去完善';
    }
    if (task.taskCode === DRAWING_TASK_CODE) {
      return '去录图纸';
    }
    if (task.taskCode === VISA_TASK_CODE) {
      return '去录签证';
    }
    if (task.taskCode === WORKLOAD_TASK_CODE) {
      return '去录图纸工作量';
    }
    if (task.taskCode === MANAGER_ADJUST_TASK_CODE) {
      return '去平料';
    }
    return '完成';
  }
  if (task.completionRule === ESTIMATE_COMPLETION_RULE || task.taskCode === ESTIMATE_TASK_CODE) {
    return '触发估算';
  }
  if (task.taskCode === EXPORT_TASK_CODE) {
    return '导出文本';
  }
  return '触发插件';
}

export function isRedirectTask(task: Pick<DocProjectNodeTaskRuntime, 'taskCode' | 'taskType'>): boolean {
  return (
    task.taskType !== 'plugin_run' &&
    [PROJECT_INFO_TASK_CODE, DRAWING_TASK_CODE, VISA_TASK_CODE, WORKLOAD_TASK_CODE, MANAGER_ADJUST_TASK_CODE].includes(task.taskCode || '')
  );
}

export interface WorkloadSummary {
  totalItems: number;
  includedItems: number;
  totalQuantity: number;
  latestDetailSummary: string;
}

export function summarizeWorkload(items: DocProjectDrawingWorkItem[] | undefined): WorkloadSummary {
  const safeItems = items ?? [];
  return {
    totalItems: safeItems.length,
    includedItems: safeItems.filter((item) => item.includeInEstimate !== false).length,
    totalQuantity: safeItems.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
    latestDetailSummary: safeItems
      .map((item) => item.workItemName || item.workItemCode)
      .filter(Boolean)
      .slice(0, 3)
      .join('、')
  };
}
