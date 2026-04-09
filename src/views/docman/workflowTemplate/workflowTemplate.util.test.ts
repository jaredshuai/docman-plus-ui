import { describe, expect, it } from 'vitest';
import {
  cloneNodes,
  createEmptyNode,
  createEmptyTask,
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
});
