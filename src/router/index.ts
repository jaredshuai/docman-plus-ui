import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';
/* Layout */
import Layout from '@/layout/index.vue';

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true                 // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                  // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                  // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                  // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * permissions: ['a:a:a', 'b:b:b']  // 访问路由的菜单权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index.vue')
      }
    ]
  },
  {
    path: '/social-callback',
    hidden: true,
    component: () => import('@/layout/components/SocialCallback/index.vue')
  },
  {
    path: '/login',
    component: () => import('@/views/login.vue'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/register.vue'),
    hidden: true
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error/401.vue'),
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: '/index',
    children: [
      {
        path: '/index',
        component: () => import('@/views/index.vue'),
        name: 'Index',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    hidden: true,
    redirect: 'noredirect',
    children: [
      {
        path: 'profile',
        component: () => import('@/views/system/user/profile/index.vue'),
        name: 'Profile',
        meta: { title: '个人中心', icon: 'user' }
      }
    ]
  }
];

// 动态路由，基于用户权限动态去加载
export const dynamicRoutes: RouteRecordRaw[] = [
  {
    path: '/docman',
    component: Layout,
    hidden: true,
    redirect: '/docman/project',
    permissions: ['docman:project:list'],
    meta: { title: '文档管理', icon: 'documentation' },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/docman/dashboard/index.vue'),
        name: 'DocDashboard',
        meta: { title: '领导概览', noCache: true, activeMenu: '/docman/project', permissions: ['docman:project:list'] }
      },
      {
        path: 'workspace',
        component: () => import('@/views/docman/workspace/index.vue'),
        name: 'DocWorkspace',
        meta: { title: '项目工作台', noCache: true, activeMenu: '/docman/project', permissions: ['docman:project:query'] }
      },
      {
        path: 'balance',
        component: () => import('@/views/docman/balance/index.vue'),
        name: 'DocBalance',
        meta: { title: '项目经理平料', noCache: true, activeMenu: '/docman/project', permissions: ['docman:project:query'] }
      },
      {
        path: 'project-type',
        component: () => import('@/views/docman/projectType/index.vue'),
        name: 'DocProjectType',
        roles: ['superadmin'],
        meta: { title: '项目类型', noCache: true, activeMenu: '/docman/project', permissions: ['docman:project:list'] }
      },
      {
        path: 'workflow-template',
        component: () => import('@/views/docman/workflowTemplate/index.vue'),
        name: 'DocWorkflowTemplate',
        meta: { title: '流程模板', noCache: true, activeMenu: '/docman/project', permissions: ['docman:process:query'] }
      },
      {
        path: 'governance',
        component: () => import('@/views/docman/governance/index.vue'),
        name: 'DocGovernance',
        roles: ['superadmin'],
        meta: { title: '系统治理', noCache: true, activeMenu: '/docman/project' }
      },
      {
        path: 'member/:projectId',
        component: () => import('@/views/docman/member/index.vue'),
        name: 'DocMember',
        meta: { title: '成员管理', activeMenu: '/docman/project' }
      },
      {
        path: 'plugin/log',
        component: () => import('@/views/docman/plugin/index.vue'),
        name: 'DocPluginLog',
        meta: { title: '插件执行日志', noCache: true, activeMenu: '/docman/project', permissions: ['docman:plugin:list'] }
      },
      {
        path: 'nodedeadline',
        component: () => import('@/views/docman/nodedeadline/index.vue'),
        name: 'DocNodeDeadline',
        meta: { title: '节点时限管理', noCache: true, activeMenu: '/docman/project', permissions: ['docman:nodedeadline:query'] }
      },
      {
        path: 'admin',
        component: () => import('@/views/docman/admin/index.vue'),
        name: 'DocAdmin',
        roles: ['superadmin'],
        meta: { title: '管理员管理', noCache: true, activeMenu: '/docman/project' }
      },
      {
        path: 'drawing/:projectId',
        component: () => import('@/views/docman/drawing/index.vue'),
        name: 'DocDrawing',
        meta: { title: '图纸录入', activeMenu: '/docman/project' }
      },
      {
        path: 'visa/:projectId',
        component: () => import('@/views/docman/visa/index.vue'),
        name: 'DocVisa',
        meta: { title: '签证单', activeMenu: '/docman/project' }
      }
    ]
  }
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_CONTEXT_PATH),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  }
});

export default router;
