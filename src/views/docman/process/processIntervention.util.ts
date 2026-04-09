import type { DocProcessConfig } from '@/api/docman/types';

export function canStartProcess(config?: DocProcessConfig | null): boolean {
  return Boolean(config && config.status === 'pending');
}

export function canTriggerPlugin(config?: DocProcessConfig | null): boolean {
  return Boolean(config?.instanceId && config?.status === 'running');
}

export function interventionRiskText(config?: DocProcessConfig | null): string {
  if (!config) {
    return '当前项目尚未绑定流程，不支持任何干预动作。';
  }
  if (config.status === 'pending') {
    return '流程尚未启动，建议先确认绑定定义后再启动。';
  }
  if (config.status === 'running') {
    return '仅建议在异常排障时手动触发插件，所有动作都会留下执行日志。';
  }
  return '流程已结束，若需要调整请先核对归档与执行日志。';
}
