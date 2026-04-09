import { describe, expect, it } from 'vitest';
import { canStartProcess, canTriggerPlugin, interventionRiskText } from './processIntervention.util';

describe('processIntervention util', () => {
  it('detects available process actions by status', () => {
    expect(canStartProcess({ id: 1, projectId: 2, definitionId: 3, status: 'pending' })).toBe(true);
    expect(canStartProcess({ id: 1, projectId: 2, definitionId: 3, status: 'running' })).toBe(false);
    expect(canTriggerPlugin({ id: 1, projectId: 2, definitionId: 3, instanceId: 9, status: 'running' })).toBe(true);
    expect(canTriggerPlugin({ id: 1, projectId: 2, definitionId: 3, status: 'pending' })).toBe(false);
  });

  it('returns risk text by process state', () => {
    expect(interventionRiskText(null)).toContain('尚未绑定流程');
    expect(interventionRiskText({ id: 1, projectId: 2, definitionId: 3, status: 'pending' })).toContain('尚未启动');
    expect(interventionRiskText({ id: 1, projectId: 2, definitionId: 3, instanceId: 8, status: 'running' })).toContain('手动触发插件');
  });
});
