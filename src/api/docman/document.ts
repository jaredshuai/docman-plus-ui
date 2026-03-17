import request from '@/utils/request';
import { DocDocumentQuery, DocDocumentUploadForm, DocDocumentVO } from './types';
import { AxiosPromise } from 'axios';

/**
 * 查询文档列表（分页）
 */
export function listDocument(query: DocDocumentQuery): AxiosPromise<DocDocumentVO[]> {
  return request({ url: '/docman/document/list', method: 'get', params: query });
}

/**
 * 查询文档详情
 */
export function getDocument(id: number): AxiosPromise<DocDocumentVO> {
  return request({ url: '/docman/document/' + id, method: 'get' });
}

/**
 * 手动上传文档
 */
export function uploadDocument(data: DocDocumentUploadForm) {
  return request({ url: '/docman/document/upload', method: 'post', data });
}
