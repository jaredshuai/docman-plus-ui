import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

function successToast(page: import('@playwright/test').Page, text: string) {
  return page.locator('.el-message__content').filter({ hasText: text }).last();
}

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

    await page.getByTestId('project-search-name').fill(projectName);
    await page.getByTestId('project-search-submit').click();
    const projectTable = page.locator('[data-testid="project-table"]');
    await expect(projectTable).toContainText(projectName, { timeout: 15000 });
    const projectRow = projectTable.locator('.el-table__row').filter({ hasText: projectName }).first();
    await expect(projectRow).toBeVisible({ timeout: 15000 });
    await projectRow.getByRole('button', { name: '更多' }).click();
    await page.getByRole('menuitem', { name: '删除' }).click();

    const confirmDialog = page.locator('.el-message-box').last();
    await expect(confirmDialog).toBeVisible({ timeout: 10000 });
    await confirmDialog.getByRole('button', { name: '确定' }).click();

    await expect(page.getByText('删除成功', { exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('项目编辑中的图纸工作量录入应打开新增图纸弹窗', async ({ page }) => {
    const projectName = `pw-e2e-project-edit-drawing-${Date.now()}`;
    const drawingCode = `DWG-PROJECT-${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(DOCMAN_URLS.project);
      await expect(page.locator('[data-testid="project-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      await page.getByTestId('project-search-name').fill(projectName);
      await page.getByTestId('project-search-submit').click();

      const projectTable = page.locator('[data-testid="project-table"]');
      const projectRow = projectTable.locator('.el-table__row').filter({ hasText: projectName }).first();
      await expect(projectRow).toBeVisible({ timeout: 15000 });
      await projectRow.getByRole('button', { name: '编辑' }).click();

      const projectDialog = page.getByTestId('project-dialog');
      await expect(projectDialog).toBeVisible({ timeout: 10000 });

      await projectDialog.getByTestId('project-add-drawing-button').click();
      await expect(page).toHaveURL(DOCMAN_URLS.project);

      const drawingDialog = page.getByTestId('project-drawing-dialog');
      await expect(drawingDialog).toBeVisible({ timeout: 10000 });
      await expect(drawingDialog).toContainText('新增图纸');
      await drawingDialog.getByTestId('project-drawing-form-code').fill(drawingCode);
      await drawingDialog.getByTestId('project-drawing-form-order').fill('ORDER-PROJECT-001');
      await drawingDialog.getByTestId('project-drawing-form-content').fill('项目编辑弹窗内新增图纸');

      const saveDrawingResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing') && response.request().method() === 'POST';
      });
      await drawingDialog.getByTestId('project-drawing-submit-button').click();
      expect((await saveDrawingResponse).ok()).toBeTruthy();
      await expect(successToast(page, '图纸保存成功')).toBeVisible({ timeout: 10000 });
      await expect(drawingDialog).toBeHidden({ timeout: 10000 });
      await expect(projectDialog).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
