import request from '@/utils/request';

export function listPlugins() {
  return request({ url: '/docman/plugin/list', method: 'get' });
}
