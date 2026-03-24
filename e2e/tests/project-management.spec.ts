import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';

test.describe('P1 项目管理真实流程', () => {
  test('可以新增并删除项目', async ({ page }) => {
    const projectName = `pw-e2e-project-${Date.now()}`;

    await login(page);
    await page.goto(DOCMAN_URLS.project);

    await expect(page.locator('[data-testid="project-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

    await page.getByRole('button', { name: '新增项目' }).click();
    const projectDialog = page.getByRole('dialog').filter({ hasText: '新增项目' }).first();
    await expect(projectDialog).toBeVisible({ timeout: 10000 });

    await projectDialog.getByRole('textbox', { name: '项目名称' }).fill(projectName);
    await projectDialog.getByRole('textbox', { name: '文档分类' }).fill('e2e');
    await projectDialog.getByRole('textbox', { name: '备注' }).fill('Playwright project lifecycle coverage');

    await projectDialog.getByRole('button', { name: /确\s*定/ }).click();
    await expect(page.getByText('新增成功', { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(projectDialog).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(8000);
    await page.goto(DOCMAN_URLS.project);
    await expect(page.locator('[data-testid="project-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

    const projectCard = page.locator('[data-testid="project-card"]').filter({ hasText: projectName }).first();
    await expect(projectCard).toBeVisible({ timeout: 15000 });
    await projectCard.getByRole('button', { name: '删除' }).click();

    const confirmDialog = page.locator('.el-message-box').last();
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: '确定' }).click();

    await expect(page.getByText('删除成功', { exact: true })).toBeVisible({ timeout: 10000 });
  });
});
