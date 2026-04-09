import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 插件执行与日志', () => {
  test('手动触发当前流程插件后可以在日志页看到成功记录', async ({ page }) => {
    const projectName = `pw-e2e-plugin-project-${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.process}?projectId=${project.id}`);
      await expect(page.locator('[data-testid="process-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      const bindButton = page.getByRole('button', { name: '绑定流程' });
      if (await bindButton.count()) {
        await page.locator('[data-testid="process-page"] .el-card .el-select').first().click();
        await page.getByRole('option', { name: 'Docman Validation Flow' }).click();
        await bindButton.click();
        await expect(page.getByText('绑定成功', { exact: true })).toBeVisible({ timeout: 10000 });
      }

      const descriptions = page.locator('.el-descriptions').first();
      await expect(page.getByText('流程定义ID', { exact: true })).toBeVisible({ timeout: 10000 });

      if (await descriptions.getByText('未启动', { exact: true }).count()) {
        const startButton = page.getByRole('button', { name: '启动流程' });
        await expect(startButton).toBeVisible({ timeout: 10000 });
        await startButton.click();
        await expect(page.getByText('流程已启动', { exact: true })).toBeVisible({ timeout: 10000 });
        await expect(descriptions).not.toContainText('未启动');
      }

      const triggerButton = page.getByRole('button', { name: '手动触发当前流程插件' });
      await expect(triggerButton).toBeVisible({ timeout: 10000 });
      await triggerButton.click();
      await expect(page.getByText('当前流程插件已触发', { exact: true })).toBeVisible({ timeout: 10000 });

      await page.goto(`${DOCMAN_URLS.plugin}/log?projectId=${project.id}`);
      await expect(page.locator('[data-testid="plugin-page"], .app-container').first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('执行日志', { exact: true })).toBeVisible({ timeout: 10000 });

      const logTable = page.locator('[data-testid="plugin-log-table"]');
      await expect(logTable).toContainText('电信文本导出 Mock 插件', { timeout: 15000 });
      await expect(logTable).toContainText(/成功|success/);
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
