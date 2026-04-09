import type { DashboardOverview, DeadlineAlert, ProjectProgress } from '@/api/docman/dashboard';

export interface LeaderDashboardMetrics {
  overallCompletionRate: number;
  avgProgressRate: number;
  focusedProjectCount: number;
  stableProjectCount: number;
}

export interface LeaderProjectSnapshot extends ProjectProgress {
  documentCompletionRate: number;
  attentionLevel: 'danger' | 'warning' | 'success';
  attentionText: string;
}

export function calcDocumentCompletionRate(totalDocuments = 0, pendingDocuments = 0): number {
  if (totalDocuments <= 0) {
    return 0;
  }
  const completedDocuments = Math.max(totalDocuments - pendingDocuments, 0);
  return Math.max(0, Math.min(100, Math.round((completedDocuments * 100) / totalDocuments)));
}

export function buildLeaderProjectSnapshots(projects: ProjectProgress[]): LeaderProjectSnapshot[] {
  return [...projects]
    .map((project) => {
      const documentCompletionRate = calcDocumentCompletionRate(project.totalDocuments, project.pendingDocuments);
      const attentionLevel =
        project.pendingDocuments > 0 && project.progressRate < 60
          ? 'danger'
          : project.pendingDocuments > 0 || project.progressRate < 80
            ? 'warning'
            : 'success';
      const attentionText =
        attentionLevel === 'danger'
          ? `待补 ${project.pendingDocuments} 份文档，流程推进偏慢`
          : attentionLevel === 'warning'
            ? project.pendingDocuments > 0
              ? `待补 ${project.pendingDocuments} 份文档`
              : '流程推进需要关注'
            : '推进稳定';

      return {
        ...project,
        documentCompletionRate,
        attentionLevel,
        attentionText
      };
    })
    .sort((left, right) => {
      const rank = { danger: 0, warning: 1, success: 2 };
      return (
        rank[left.attentionLevel] - rank[right.attentionLevel] ||
        right.pendingDocuments - left.pendingDocuments ||
        left.progressRate - right.progressRate ||
        left.projectName.localeCompare(right.projectName)
      );
    });
}

export function buildLeaderMetrics(overview: DashboardOverview, projects: ProjectProgress[]): LeaderDashboardMetrics {
  const snapshots = buildLeaderProjectSnapshots(projects);
  const focusedProjectCount = snapshots.filter((item) => item.attentionLevel !== 'success').length;
  const stableProjectCount = snapshots.length - focusedProjectCount;
  const avgProgressRate = snapshots.length === 0 ? 0 : Math.round(snapshots.reduce((sum, item) => sum + item.progressRate, 0) / snapshots.length);

  return {
    overallCompletionRate: calcDocumentCompletionRate(overview.totalDocuments, overview.pendingDocuments),
    avgProgressRate,
    focusedProjectCount,
    stableProjectCount
  };
}

export function pickLeaderFocusProjects(projects: ProjectProgress[], limit = 5): LeaderProjectSnapshot[] {
  return buildLeaderProjectSnapshots(projects)
    .filter((item) => item.attentionLevel !== 'success')
    .slice(0, limit);
}

export function pickLeaderDeadlineAlerts(alerts: DeadlineAlert[], limit = 6): DeadlineAlert[] {
  return [...alerts].sort((left, right) => left.remainDays - right.remainDays || left.projectName.localeCompare(right.projectName)).slice(0, limit);
}
