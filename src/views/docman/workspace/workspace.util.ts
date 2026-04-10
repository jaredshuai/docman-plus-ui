import type { DocProjectAddRecord, DocProjectNodeTaskRuntime } from '@/api/docman/types';

const ESTIMATE_TASK_CODE = 'estimate_run';
const EXPORT_TASK_CODE = 'export_run';
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

export interface WorkloadSummary {
  totalRecords: number;
  enabledRecords: number;
  totalEstimatedPrice: number;
  latestDetailSummary: string;
}

export function summarizeWorkload(records: DocProjectAddRecord[] | undefined): WorkloadSummary {
  const safeRecords = records ?? [];
  return {
    totalRecords: safeRecords.length,
    enabledRecords: safeRecords.filter((item) => item.enable !== false).length,
    totalEstimatedPrice: safeRecords.reduce((sum, item) => sum + Number(item.estimatedPrice ?? 0), 0),
    latestDetailSummary:
      safeRecords[0]?.details
        ?.map((detail) => detail.name || detail.alias)
        .filter(Boolean)
        .join('、') || ''
  };
}
