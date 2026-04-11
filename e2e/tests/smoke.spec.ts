import { test, expect } from '@playwright/test';
import { DEMO_PROJECT_ID, DOCMAN_URLS, login } from '../helpers/auth';

async function ensureDashboardReady(page: import('@playwright/test').Page): Promise<void> {
  const loadError = page.getByText('仪表盘数据加载失败', { exact: true });
  if (await loadError.count()) {
    await page.reload();
  }
  await expect(loadError).toHaveCount(0);
}

/**
 * P0 冒烟测试 - 登录
 */
test.describe('P0 登录测试', () => {
  test('登录成功后跳转到首页', async ({ page }) => {
    await login(page);

    const sidebar = page.locator('.sidebar-container, .el-menu, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 15000 });
  });
});

/**
 * P0 冒烟测试 - docman 各页面
 */
test.describe('P0 docman 页面测试', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('仪表盘页面正常加载', async ({ page }) => {
    await page.goto(DOCMAN_URLS.dashboard);

    const dashboard = page.locator('.app-container').first();
    const statCards = page.getByTestId('stat-cards-row');
    await expect(dashboard).toBeVisible({ timeout: 20000 });
    await ensureDashboardReady(page);

    await expect(page.getByText('领导概览为只读轻量视图', { exact: false })).toBeVisible({ timeout: 10000 });
    await expect(statCards.getByText('项目总览', { exact: true })).toBeVisible();
    await expect(statCards.getByText('文档完善度', { exact: true })).toBeVisible();
    await expect(statCards.getByText('平均项目进度', { exact: true })).toBeVisible();
    await expect(statCards.getByText('风险提醒', { exact: true })).toBeVisible();
    await expect(page.getByText('仪表盘数据加载失败', { exact: true })).toHaveCount(0);
  });

  test('仪表盘区域内容可见', async ({ page }) => {
    await page.goto(DOCMAN_URLS.dashboard);

    const dashboard = page.locator('.app-container').first();
    await expect(dashboard).toBeVisible({ timeout: 20000 });
    await ensureDashboardReady(page);

    await expect(page.getByText('项目级概览', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('重点关注项目', { exact: true })).toBeVisible();
    await expect(page.getByText('即将超期节点', { exact: true })).toBeVisible();
    await expect(page.getByText('文档完善度分布', { exact: true })).toBeVisible();
    await expect(page.getByText(/当前没有重点关注项目|高关注|需关注/).first()).toBeVisible();
  });

  test('项目管理页面可打开', async ({ page }) => {
    await page.goto(DOCMAN_URLS.project);

    const projectPage = page.locator('[data-testid="project-page"], .app-container').first();
    await expect(projectPage).toBeVisible({ timeout: 20000 });

    const searchForm = page.getByTestId('project-search-form');
    const projectTable = page.getByTestId('project-table');
    await expect(searchForm).toBeVisible({ timeout: 10000 });
    await expect(projectTable).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: '新增项目' })).toBeVisible();
    await expect(page.getByRole('button', { name: '领导概览' })).toBeVisible();
  });

  test('项目页可进入领导概览', async ({ page }) => {
    await page.goto(DOCMAN_URLS.project);

    await expect(page.locator('[data-testid="project-page"], .app-container').first()).toBeVisible({ timeout: 20000 });
    await page.getByRole('button', { name: '领导概览' }).click();
    await expect(page).toHaveURL(/\/docman\/dashboard/);
    await expect(page.getByText('项目级概览', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('文档中心页面可打开', async ({ page }) => {
    await page.goto(`${DOCMAN_URLS.document}?projectId=${DEMO_PROJECT_ID}`);

    await expect(page.locator('.app-container').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.el-table').first()).toBeVisible();
  });

  test('插件列表页面可打开', async ({ page }) => {
    await page.goto(`/docman/plugin/log?projectId=${DEMO_PROJECT_ID}`);

    const pluginPage = page.locator('.app-container').first();
    await expect(pluginPage).toBeVisible({ timeout: 20000 });

    await expect(page.locator('.el-divider', { hasText: '执行日志' })).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.el-table').first()).toBeVisible();
    const pluginCards = page.locator('.plugin-card');
    if ((await pluginCards.count()) > 0) {
      await expect(pluginCards.first()).toBeVisible();
    } else {
      await expect(page.getByText('暂无已注册插件', { exact: true })).toBeVisible();
    }
  });

  test('流程编排页面可打开', async ({ page }) => {
    await page.goto(`${DOCMAN_URLS.process}?projectId=${DEMO_PROJECT_ID}`);

    await expect(page.locator('.app-container').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('流程配置', { exact: true })).toBeVisible();
  });

  test('归档管理页面可打开', async ({ page }) => {
    await page.goto(`${DOCMAN_URLS.archive}?projectId=${DEMO_PROJECT_ID}`);

    await expect(page.locator('.app-container').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('归档基本信息', { exact: true })).toBeVisible();
  });

  test('成员管理页面可打开', async ({ page }) => {
    await page.goto(`${DOCMAN_URLS.member}/${DEMO_PROJECT_ID}`);

    await expect(page.locator('.el-card').first()).toBeVisible({ timeout: 20000 });
    await expect(page.locator('.el-table').first()).toBeVisible();
    await expect(page.getByText('项目成员管理', { exact: true })).toBeVisible();
  });

  test('节点时限管理页面可打开', async ({ page }) => {
    await page.goto(DOCMAN_URLS.nodeDeadline);

    await expect(page.locator('.app-container').first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('节点时限配置', { exact: true })).toBeVisible();
    await expect(page.getByText('截止日期列表', { exact: true })).toBeVisible();
  });
});
