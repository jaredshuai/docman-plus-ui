import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DocDocumentRecord, DocDocumentQuery, PageResult } from './types';

export function listDocument(projectId: number, query: DocDocumentQuery): AxiosPromise<PageResult<DocDocumentRecord>> {
  return request({ url: '/docman/document/list', method: 'get', params: { projectId, ...query } });
}

export function getDocument(id: number): AxiosPromise<DocDocumentRecord> {
  return request({ url: '/docman/document/' + id, method: 'get' });
}

export function uploadDocument(data: FormData): AxiosPromise<void> {
  return request({ url: '/docman/document/upload', method: 'post', data });
}
