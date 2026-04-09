import type { DocDocumentRecord, DocProjectNodeTaskRuntime } from '@/api/docman/types';

export const ESTIMATE_PLUGIN_ID = 'telecom-estimate-mock';
export const EXPORT_PLUGIN_ID = 'telecom-export-text-mock';

export function hasPluginTask(tasks: DocProjectNodeTaskRuntime[] | undefined, pluginId: string): boolean {
  return (tasks ?? []).some((task) => task.taskType === 'plugin_run' && task.status !== 'completed' && (task.pluginCodes ?? '').includes(pluginId));
}

export function resolvePluginTaskLabel(task: Pick<DocProjectNodeTaskRuntime, 'taskType' | 'pluginCodes'>): string {
  if (task.taskType !== 'plugin_run') {
    return '完成';
  }
  if ((task.pluginCodes ?? '').includes(ESTIMATE_PLUGIN_ID)) {
    return '触发估算';
  }
  if ((task.pluginCodes ?? '').includes(EXPORT_PLUGIN_ID)) {
    return '导出文本';
  }
  return '触发插件';
}

export function findLatestGeneratedPluginArtifact(documents: DocDocumentRecord[] | undefined, pluginId: string): DocDocumentRecord | undefined {
  return [...(documents ?? [])]
    .filter((item) => item.pluginId === pluginId && item.status === 'generated')
    .sort((left, right) => resolveDocumentTimestamp(right) - resolveDocumentTimestamp(left) || right.id - left.id)[0];
}

function resolveDocumentTimestamp(item: DocDocumentRecord): number {
  const raw = item.generatedAt || item.createTime;
  const parsed = raw ? Date.parse(raw) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}
