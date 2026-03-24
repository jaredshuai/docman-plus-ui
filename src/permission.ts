import { to as tos } from 'await-to-js';
import router from './router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { isHttp, isPathMatch } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import { useUserStore } from '@/store/modules/user';
import { useSettingsStore } from '@/store/modules/settings';
import { usePermissionStore } from '@/store/modules/permission';
import { ElMessage } from 'element-plus/es';

NProgress.configure({ showSpinner: false });
const whiteList = ['/login', '/register', '/social-callback', '/register*', '/register/*'];

const isWhiteList = (path: string) => {
  return whiteList.some((pattern) => isPathMatch(pattern, path));
};

const resolveWorkspaceLanding = (path: string) => {
  const userStore = useUserStore();
  const isWorkspaceUser = userStore.roles.includes('docman_user') && !userStore.roles.includes('superadmin');
  if (isWorkspaceUser && (path === '/' || path === '/index')) {
    return '/workspace/home';
  }
  return '';
};

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title as string);
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' });
      NProgress.done();
    } else if (isWhiteList(to.path)) {
      next();
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true;
        // 判断当前用户是否已拉取完user_info信息
        const [err] = await tos(useUserStore().getInfo());
        if (err) {
          await useUserStore().logout();
          ElMessage.error(err);
          next({ path: '/' });
        } else {
          isRelogin.show = false;
          const accessRoutes = await usePermissionStore().generateRoutes();
          // 根据roles权限生成可访问的路由表
          accessRoutes.forEach((route) => {
            if (!isHttp(route.path)) {
              router.addRoute(route); // 动态添加可访问路由表
            }
          });
          const workspaceLanding = resolveWorkspaceLanding(to.path);
          // @ts-expect-error hack方法 确保addRoutes已完成
          next({
            path: workspaceLanding || to.path,
            replace: true,
            params: workspaceLanding ? undefined : to.params,
            query: workspaceLanding ? undefined : to.query,
            hash: workspaceLanding ? undefined : to.hash,
            name: workspaceLanding ? undefined : (to.name as string)
          }); // hack方法 确保addRoutes已完成
        }
      } else {
        const workspaceLanding = resolveWorkspaceLanding(to.path);
        if (workspaceLanding) {
          next({ path: workspaceLanding, replace: true });
        } else {
          next();
        }
      }
    }
  } else {
    // 没有token
    if (isWhiteList(to.path)) {
      // 在免登录白名单，直接进入
      next();
    } else {
      const redirect = encodeURIComponent(to.fullPath || '/');
      next(`/login?redirect=${redirect}`); // 否则全部重定向到登录页
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
