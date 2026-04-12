import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocProjectDrawingWorkItem, DocProjectDrawingWorkItemForm, DocmanId } from './types';

export function listDrawingWorkItems(projectId: DocmanId, drawingId: DocmanId): AxiosPromise<DocProjectDrawingWorkItem[]> {
  return request({ url: '/docman/project/drawing/work-item/list', method: 'get', params: { projectId, drawingId } });
}

export function listProjectDrawingWorkItems(projectId: DocmanId): AxiosPromise<DocProjectDrawingWorkItem[]> {
  return request({ url: '/docman/project/drawing/work-item/project-list', method: 'get', params: { projectId } });
}

export function saveDrawingWorkItem(data: DocProjectDrawingWorkItemForm): AxiosPromise<DocmanId> {
  return request({ url: '/docman/project/drawing/work-item', method: 'post', data });
}

export function deleteDrawingWorkItems(ids: DocmanId[]): AxiosPromise<void> {
  return request({ url: `/docman/project/drawing/work-item/${ids.join(',')}`, method: 'delete' });
}
