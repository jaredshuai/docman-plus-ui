import { describe, expect, it } from 'vitest';
import {
  applyTaskPreset,
  cloneNodes,
  COMPLETION_RULE_OPTIONS,
  createEmptyNode,
  createEmptyTask,
  FIELD_GROUP_REFERENCES,
  getFieldGroupReference,
  getCompletionRuleOptions,
  getTaskDescriptionPlaceholder,
  getTaskPresets,
  joinPluginCodes,
  normalizeTemplateForm,
  serializeTemplateForm,
  splitPluginCodes
} from './workflowTemplate.util';

describe('workflowTemplate util', () => {
  it('creates default task and node shape', () => {
    expect(createEmptyTask()).toMatchObject({ taskType: 'form_fill', requiredFlag: true, status: 'active' });
    expect(createEmptyNode()).toMatchObject({ status: 'active', tasks: [] });
  });

  it('normalizes template form with deep-cloned nodes', () => {
    const form = normalizeTemplateForm({
      id: 1,
      code: 'telecom',
      name: '电信模板',
      nodes: [{ nodeCode: 'n1', nodeName: '节点1', tasks: [{ taskCode: 't1', taskName: '事项1', taskType: 'plugin_run', pluginCodes: 'a,b' }] }]
    });

    expect(form.projectTypeCode).toBe('telecom');
    expect(form.nodes?.[0].tasks?.[0].taskCode).toBe('t1');
    expect(form.nodes?.[0].tasks?.[0].pluginCodeList).toEqual(['a', 'b']);

    const cloned = cloneNodes(form.nodes);
    cloned[0].nodeCode = 'changed';
    expect(form.nodes?.[0].nodeCode).toBe('n1');
  });

  it('converts plugin codes between string and list', () => {
    expect(splitPluginCodes('a, b ,c')).toEqual(['a', 'b', 'c']);
    expect(joinPluginCodes(['a', ' b ', '', 'c'])).toBe('a,b,c');
  });

  it('serializes plugin code list back to pluginCodes string', () => {
    const payload = serializeTemplateForm({
      code: 'telecom',
      name: '模板',
      projectTypeCode: 'telecom',
      nodes: [
        {
          nodeCode: 'n1',
          nodeName: '节点1',
          tasks: [{ taskCode: 't1', taskName: '事项1', taskType: 'plugin_run', pluginCodeList: ['p1', 'p2'] }]
        }
      ]
    });

    expect(payload.nodes?.[0].tasks?.[0].pluginCodes).toBe('p1,p2');
    expect(payload.nodes?.[0].tasks?.[0].pluginCodeList).toBeUndefined();
  });

  it('provides completion-rule and task presets by task type', () => {
    expect(getCompletionRuleOptions('form_fill').map((item) => item.value)).toEqual(['project_basic_info_present', 'drawing_exists', 'visa_exists']);
    expect(getCompletionRuleOptions('plugin_run')).toEqual([COMPLETION_RULE_OPTIONS[3]]);
    expect(getCompletionRuleOptions('manager_adjust')).toEqual([COMPLETION_RULE_OPTIONS[4]]);
    expect(getTaskPresets('form_fill').map((item) => item.value)).toContain('workload_input');
    expect(getTaskPresets('plugin_run').map((item) => item.value)).toContain('estimate_run');
  });

  it('applies preset values and exposes contextual description placeholders', () => {
    const task = applyTaskPreset(createEmptyTask(), 'drawing_input');
    expect(task.taskCode).toBe('drawing_fill');
    expect(task.taskName).toBe('录入图纸信息');
    expect(task.completionRule).toBe('drawing_exists');
    expect(getTaskDescriptionPlaceholder('form_fill')).toContain('工作量线');
    expect(getTaskDescriptionPlaceholder('plugin_run')).toContain('插件');
  });

  it('exposes field-group references for admin guidance', () => {
    expect(FIELD_GROUP_REFERENCES.map((item) => item.value)).toContain('workload_input');
    expect(getFieldGroupReference('drawing_input')?.fields).toContain('drawingCode');
    expect(getFieldGroupReference('estimate_run')?.completionRule).toBe('estimate_snapshot_exists');
    expect(getFieldGroupReference('balance_adjustment')?.completionRule).toBe('balance_adjustment_exists');
  });
});
