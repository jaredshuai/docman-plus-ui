import { describe, expect, it } from 'vitest';
import type { DashboardOverview, DeadlineAlert, ProjectProgress } from '@/api/docman/dashboard';
import {
  buildLeaderMetrics,
  buildLeaderProjectSnapshots,
  calcDocumentCompletionRate,
  pickLeaderDeadlineAlerts,
  pickLeaderFocusProjects
} from './dashboard.util';

describe('docman dashboard util', () => {
  it('calculates document completion rate safely', () => {
    expect(calcDocumentCompletionRate(10, 2)).toBe(80);
    expect(calcDocumentCompletionRate(0, 0)).toBe(0);
    expect(calcDocumentCompletionRate(3, 5)).toBe(0);
  });

  it('builds leader project snapshots ordered by attention severity', () => {
    const projects: ProjectProgress[] = [
      { projectId: 1, projectName: 'A', totalNodes: 10, completedNodes: 9, progressRate: 90, totalDocuments: 10, pendingDocuments: 0 },
      { projectId: 2, projectName: 'B', totalNodes: 10, completedNodes: 3, progressRate: 30, totalDocuments: 8, pendingDocuments: 4 },
      { projectId: 3, projectName: 'C', totalNodes: 10, completedNodes: 6, progressRate: 60, totalDocuments: 5, pendingDocuments: 1 }
    ];

    const snapshots = buildLeaderProjectSnapshots(projects);
    expect(snapshots.map((item) => item.projectName)).toEqual(['B', 'C', 'A']);
    expect(snapshots[0].attentionLevel).toBe('danger');
    expect(snapshots[0].documentCompletionRate).toBe(50);
  });

  it('builds leader metrics and picks focus/deadline subsets', () => {
    const overview: DashboardOverview = {
      totalProjects: 3,
      activeProjects: 2,
      totalDocuments: 20,
      pendingDocuments: 5,
      overdueNodes: 2,
      pluginFailCount: 1
    };
    const projects: ProjectProgress[] = [
      { projectId: 1, projectName: 'A', totalNodes: 10, completedNodes: 8, progressRate: 80, totalDocuments: 10, pendingDocuments: 0 },
      { projectId: 2, projectName: 'B', totalNodes: 10, completedNodes: 4, progressRate: 40, totalDocuments: 5, pendingDocuments: 2 },
      { projectId: 3, projectName: 'C', totalNodes: 10, completedNodes: 7, progressRate: 70, totalDocuments: 5, pendingDocuments: 1 }
    ];
    const alerts: DeadlineAlert[] = [
      { projectId: 1, projectName: 'A', nodeCode: 'n1', nodeName: '节点1', deadline: '2026-04-10', remainDays: 5, reminderCount: 1 },
      { projectId: 2, projectName: 'B', nodeCode: 'n2', nodeName: '节点2', deadline: '2026-04-08', remainDays: -1, reminderCount: 2 },
      { projectId: 3, projectName: 'C', nodeCode: 'n3', nodeName: '节点3', deadline: '2026-04-09', remainDays: 0, reminderCount: 1 }
    ];

    expect(buildLeaderMetrics(overview, projects)).toEqual({
      overallCompletionRate: 75,
      avgProgressRate: 63,
      focusedProjectCount: 2,
      stableProjectCount: 1
    });
    expect(pickLeaderFocusProjects(projects).map((item) => item.projectName)).toEqual(['B', 'C']);
    expect(pickLeaderDeadlineAlerts(alerts).map((item) => item.projectName)).toEqual(['B', 'C', 'A']);
  });
});
