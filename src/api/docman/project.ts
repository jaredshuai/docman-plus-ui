import request from '@/utils/request';
import { DocProjectForm, DocProjectQuery, DocProjectVO } from './types';
import { AxiosPromise } from 'axios';

/**
 * 查询项目列表（分页）
 */
export function listProject(query: DocProjectQuery): AxiosPromise<DocProjectVO[]> {
  return request({ url: '/docman/project/list', method: 'get', params: query });
}

/**
 * 查询项目详情
 */
export function getProject(id: number): AxiosPromise<DocProjectVO> {
  return request({ url: '/docman/project/' + id, method: 'get' });
}

/**
 * 新增项目
 */
export function addProject(data: DocProjectForm) {
  return request({ url: '/docman/project', method: 'post', data });
}

/**
 * 修改项目
 */
export function updateProject(data: DocProjectForm) {
  return request({ url: '/docman/project', method: 'put', data });
}

/**
 * 删除项目（支持批量）
 */
export function delProject(ids: (number | string) | Array<number | string>) {
  return request({ url: '/docman/project/' + ids, method: 'delete' });
}
