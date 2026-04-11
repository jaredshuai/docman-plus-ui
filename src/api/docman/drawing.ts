import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectDrawing, DocProjectDrawingForm, DocmanId } from './types';

export function listProjectDrawings(projectId: string | number): AxiosPromise<DocProjectDrawing[]> {
  return request({ url: '/docman/project/drawing/list', method: 'get', params: { projectId } });
}

export function getProjectDrawing(id: DocmanId): AxiosPromise<DocProjectDrawing> {
  return request({ url: `/docman/project/drawing/${id}`, method: 'get' });
}

export function saveProjectDrawing(data: DocProjectDrawingForm): AxiosPromise<number> {
  return request({ url: '/docman/project/drawing', method: 'post', data });
}

export function deleteProjectDrawing(ids: DocmanId[]): AxiosPromise<void> {
  return request({ url: `/docman/project/drawing/${ids.join(',')}`, method: 'delete' });
}
