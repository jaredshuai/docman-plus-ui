import request from '@/utils/request';
import { DocDocumentRecord, DocDocumentQuery, DocViewerUrl, DocmanId, PageResult } from './types';
import download from '@/plugins/download';

export function listDocument(projectId: string | number, query: DocDocumentQuery): Promise<PageResult<DocDocumentRecord>> {
  return request({ url: '/docman/document/list', method: 'get', params: { projectId, ...query } });
}

export function getDocument(id: DocmanId): Promise<DocDocumentRecord> {
  return request({ url: '/docman/document/' + id, method: 'get' });
}

export function uploadDocument(data: FormData): Promise<void> {
  return request({ url: '/docman/document/upload', method: 'post', data });
}

export function downloadDocument(id: DocmanId): void {
  download.zip(`/docman/document/${id}/download`, `document_${id}.zip`);
}

export function deleteDocument(id: DocmanId): Promise<void> {
  return request({ url: `/docman/document/${id}`, method: 'delete' });
}

export function getDocumentViewerUrl(id: DocmanId): Promise<DocViewerUrl> {
  return request({ url: `/docman/document/${id}/viewer-url`, method: 'get' });
}
