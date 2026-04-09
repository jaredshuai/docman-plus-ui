import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 流程编排真实流程', () => {
  test('可以绑定并启动项目流程', async ({ page }) => {
    const projectName = `pw-e2e-process-project-${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.process}?projectId=${project.id}`);

      await expect(page.locator('[data-testid="process-page"], .app-container').first()).toBeVisible({ timeout: 20000 });
      await expect(page.getByText('流程配置', { exact: true })).toBeVisible();

      const bindButton = page.getByRole('button', { name: '绑定流程' });
      if (await bindButton.count()) {
        await page.locator('[data-testid="process-page"] .el-card .el-select').first().click();
        await page.getByRole('option', { name: 'Docman Validation Flow' }).click();
        await bindButton.click();
        await expect(page.getByText('绑定成功', { exact: true })).toBeVisible({ timeout: 10000 });
      }

      const descriptions = page.locator('.el-descriptions').first();
      await expect(page.getByText('流程定义ID', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(descriptions).toContainText(/pending|running|completed/);

      if (await descriptions.getByText('未启动', { exact: true }).count()) {
        const startButton = page.getByRole('button', { name: '启动流程' });
        await expect(startButton).toBeVisible({ timeout: 10000 });
        await startButton.click();
        await expect(page.getByText('流程已启动', { exact: true })).toBeVisible({ timeout: 10000 });
        await expect(descriptions).not.toContainText('未启动');
      }
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
