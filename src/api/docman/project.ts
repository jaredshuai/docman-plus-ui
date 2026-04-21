import request from '@/utils/request';
import { DocProject, DocProjectQuery, DocProjectSubmitPayload, DocmanId, PageResult } from './types';

function normalizeProjectDate(value?: string): string | undefined {
  const text = String(value ?? '').trim();
  if (!text) {
    return undefined;
  }
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] || text;
}

function normalizeProject(project: DocProject): DocProject {
  return {
    ...project,
    telecomCode: project.telecomCode || project.dianxinCode,
    telecomProjectDate: normalizeProjectDate(project.telecomProjectDate || project.dianxinInitiationTime),
    planStartDate: normalizeProjectDate(project.planStartDate || project.startTime),
    planEndDate: normalizeProjectDate(project.planEndDate || project.endTime)
  };
}

export function listProject(query: DocProjectQuery): Promise<PageResult<DocProject>> {
  return request({ url: '/docman/project/list', method: 'get', params: query }).then((res: PageResult<DocProject>) => ({
    ...res,
    rows: (res.rows ?? []).map(normalizeProject)
  }));
}

export function listMyProject(query?: Partial<DocProjectQuery>): Promise<DocProject[]> {
  return request({ url: '/docman/project/my', method: 'get', params: query }).then((rows: DocProject[]) => (rows ?? []).map(normalizeProject));
}

export function getProject(id: DocmanId): Promise<DocProject> {
  return request({ url: '/docman/project/' + id, method: 'get' }).then((project: DocProject) => normalizeProject(project));
}

export function addProject(data: DocProjectSubmitPayload): Promise<void> {
  return request({ url: '/docman/project', method: 'post', data });
}

export function updateProject(data: DocProjectSubmitPayload): Promise<void> {
  return request({ url: '/docman/project', method: 'put', data });
}

export function delProject(ids: DocmanId[]): Promise<void> {
  return request({ url: '/docman/project/' + ids.join(','), method: 'delete' });
}
