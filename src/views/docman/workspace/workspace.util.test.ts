import { describe, expect, it } from 'vitest';
import type { DocDocumentRecord, DocProjectNodeTaskRuntime } from '@/api/docman/types';
import { ESTIMATE_PLUGIN_ID, EXPORT_PLUGIN_ID, findLatestGeneratedPluginArtifact, hasPluginTask, resolvePluginTaskLabel } from './workspace.util';

describe('workspace util', () => {
  it('finds latest generated export artifact', () => {
    const documents: DocDocumentRecord[] = [
      {
        id: 1,
        projectId: 1,
        sourceType: 'plugin',
        fileName: 'old.txt',
        nasPath: '/old',
        pluginId: EXPORT_PLUGIN_ID,
        status: 'generated',
        generatedAt: '2026-04-08 10:00:00'
      },
      {
        id: 2,
        projectId: 1,
        sourceType: 'plugin',
        fileName: 'new.txt',
        nasPath: '/new',
        pluginId: EXPORT_PLUGIN_ID,
        status: 'generated',
        generatedAt: '2026-04-08 11:00:00'
      },
      {
        id: 3,
        projectId: 1,
        sourceType: 'plugin',
        fileName: 'ignore.txt',
        nasPath: '/ignore',
        pluginId: EXPORT_PLUGIN_ID,
        status: 'obsolete',
        generatedAt: '2026-04-08 12:00:00'
      }
    ];

    expect(findLatestGeneratedPluginArtifact(documents, EXPORT_PLUGIN_ID)?.id).toBe(2);
  });

  it('detects pending plugin task by plugin id', () => {
    const tasks: DocProjectNodeTaskRuntime[] = [
      {
        id: 1,
        projectId: 1,
        nodeCode: 'initial_estimate',
        taskCode: 'estimate_run',
        taskType: 'plugin_run',
        pluginCodes: ESTIMATE_PLUGIN_ID,
        status: 'pending'
      },
      {
        id: 2,
        projectId: 1,
        nodeCode: 'export_text',
        taskCode: 'export_run',
        taskType: 'plugin_run',
        pluginCodes: EXPORT_PLUGIN_ID,
        status: 'completed'
      }
    ];

    expect(hasPluginTask(tasks, ESTIMATE_PLUGIN_ID)).toBe(true);
    expect(hasPluginTask(tasks, EXPORT_PLUGIN_ID)).toBe(false);
  });

  it('resolves task action label by plugin type', () => {
    expect(resolvePluginTaskLabel({ taskType: 'plugin_run', pluginCodes: ESTIMATE_PLUGIN_ID })).toBe('触发估算');
    expect(resolvePluginTaskLabel({ taskType: 'plugin_run', pluginCodes: EXPORT_PLUGIN_ID })).toBe('导出文本');
    expect(resolvePluginTaskLabel({ taskType: 'review_confirm', pluginCodes: '' })).toBe('完成');
  });
});
