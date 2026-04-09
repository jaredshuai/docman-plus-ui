import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { DocWorkflowTemplate, DocWorkflowTemplateForm } from './types';

export function listWorkflowTemplate(projectTypeCode?: string): AxiosPromise<DocWorkflowTemplate[]> {
  return request({ url: '/docman/workflow-template/list', method: 'get', params: { projectTypeCode } });
}

export function getWorkflowTemplate(id: number): AxiosPromise<DocWorkflowTemplate> {
  return request({ url: `/docman/workflow-template/${id}`, method: 'get' });
}

export function saveWorkflowTemplate(data: DocWorkflowTemplateForm): AxiosPromise<number> {
  return request({ url: '/docman/workflow-template', method: 'post', data });
}

export function deleteWorkflowTemplate(ids: number[]): AxiosPromise<void> {
  return request({ url: `/docman/workflow-template/${ids.join(',')}`, method: 'delete' });
}
