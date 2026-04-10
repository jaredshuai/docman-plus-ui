import { describe, expect, it } from 'vitest';
import type { DocProjectAddRecord, DocProjectNodeTaskRuntime } from '@/api/docman/types';
import { hasEstimateTask, hasExportTask, isRedirectTask, resolvePluginTaskLabel, summarizeWorkload } from './workspace.util';

describe('workspace util', () => {
  it('detects estimate task by completion rule or task code instead of plugin id', () => {
    const tasks: DocProjectNodeTaskRuntime[] = [
      {
        id: 1,
        projectId: 1,
        nodeCode: 'initial_estimate',
        taskCode: 'custom_estimate_plugin',
        taskType: 'plugin_run',
        completionRule: 'estimate_snapshot_exists',
        pluginCodes: 'telecom-estimate-v2',
        status: 'pending'
      },
      {
        id: 2,
        projectId: 1,
        nodeCode: 'export_text',
        taskCode: 'export_run',
        taskType: 'plugin_run',
        pluginCodes: 'telecom-export-text-v2',
        status: 'completed'
      }
    ];

    expect(hasEstimateTask(tasks)).toBe(true);
    expect(hasExportTask(tasks)).toBe(false);
  });

  it('detects export task by task code instead of plugin id', () => {
    const tasks: DocProjectNodeTaskRuntime[] = [
      {
        id: 3,
        projectId: 1,
        nodeCode: 'export_text',
        taskCode: 'export_run',
        taskType: 'plugin_run',
        pluginCodes: 'real-export-plugin',
        status: 'pending'
      }
    ];

    expect(hasExportTask(tasks)).toBe(true);
  });

  it('resolves task action label by task semantics', () => {
    expect(resolvePluginTaskLabel({ taskType: 'plugin_run', taskCode: 'estimate_run', completionRule: '' })).toBe('触发估算');
    expect(resolvePluginTaskLabel({ taskType: 'plugin_run', taskCode: 'custom_plugin', completionRule: 'estimate_snapshot_exists' })).toBe(
      '触发估算'
    );
    expect(resolvePluginTaskLabel({ taskType: 'plugin_run', taskCode: 'export_run', completionRule: '' })).toBe('导出文本');
    expect(resolvePluginTaskLabel({ taskType: 'form_fill', taskCode: 'drawing_fill', completionRule: 'drawing_exists' })).toBe('去录图纸');
    expect(resolvePluginTaskLabel({ taskType: 'form_fill', taskCode: 'visa_fill', completionRule: 'visa_exists' })).toBe('去录签证');
    expect(resolvePluginTaskLabel({ taskType: 'form_fill', taskCode: 'workload_fill', completionRule: 'workload_exists' })).toBe('去录入');
    expect(resolvePluginTaskLabel({ taskType: 'manager_adjust', taskCode: 'manager_adjust', completionRule: 'balance_adjustment_exists' })).toBe(
      '去平料'
    );
    expect(resolvePluginTaskLabel({ taskType: 'review_confirm', taskCode: 'project_info_confirm', completionRule: '' })).toBe('完成');
  });

  it('marks workload and manager adjust tasks as redirect actions', () => {
    expect(isRedirectTask({ taskType: 'form_fill', taskCode: 'drawing_fill' })).toBe(true);
    expect(isRedirectTask({ taskType: 'form_fill', taskCode: 'visa_fill' })).toBe(true);
    expect(isRedirectTask({ taskType: 'form_fill', taskCode: 'workload_fill' })).toBe(true);
    expect(isRedirectTask({ taskType: 'manager_adjust', taskCode: 'manager_adjust' })).toBe(true);
    expect(isRedirectTask({ taskType: 'review_confirm', taskCode: 'project_info_confirm' })).toBe(false);
    expect(isRedirectTask({ taskType: 'plugin_run', taskCode: 'estimate_run' })).toBe(false);
  });

  it('summarizes workload records for workspace overview', () => {
    const records: DocProjectAddRecord[] = [
      {
        id: 1,
        projectId: 1,
        enable: true,
        estimatedPrice: 120,
        details: [
          { projectId: 1, name: '杆路整治' },
          { projectId: 1, alias: '光缆布放' }
        ]
      },
      {
        id: 2,
        projectId: 1,
        enable: false,
        estimatedPrice: 80,
        details: []
      }
    ];

    expect(summarizeWorkload(records)).toEqual({
      totalRecords: 2,
      enabledRecords: 1,
      totalEstimatedPrice: 200,
      latestDetailSummary: '杆路整治、光缆布放'
    });
  });
});
