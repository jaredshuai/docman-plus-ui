import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

function successToast(page: import('@playwright/test').Page, text: string) {
  return page.locator('.el-message__content').filter({ hasText: text }).last();
}

test.describe('P1 图纸下工作量真实流程', () => {
  test('可以在图纸页维护图纸下的工作量项', async ({ page }) => {
    const projectName = `pw-e2e-workload-project-${Date.now()}`;
    const drawingCode = `DWG-WI-${Date.now()}`;
    const workItemName = `杆路整治-${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.drawing}/${project.id}`);
      await expect(page.locator('[data-testid="drawing-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      await page.getByTestId('drawing-add-button').click();
      const drawingDialog = page.getByRole('dialog').filter({ hasText: '新建图纸' }).first();
      await expect(drawingDialog).toBeVisible({ timeout: 10000 });
      await drawingDialog.getByTestId('drawing-form-code').fill(drawingCode);
      await drawingDialog.getByTestId('drawing-form-order').fill('ORDER-001');
      await drawingDialog.getByTestId('drawing-form-content').fill('图纸下维护工作量');

      const saveDrawingResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing') && response.request().method() === 'POST';
      });
      await drawingDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await saveDrawingResponse).ok()).toBeTruthy();
      await expect(page.getByText('新增成功', { exact: true })).toBeVisible({ timeout: 10000 });

      const drawingTable = page.getByTestId('drawing-table');
      const drawingRow = drawingTable.locator('.el-table__row').filter({ hasText: drawingCode }).first();
      await expect(drawingRow).toBeVisible({ timeout: 15000 });
      await drawingRow.getByRole('button', { name: '工作量' }).click();

      const workItemDialog = page.getByTestId('drawing-workitem-dialog');
      await expect(workItemDialog).toBeVisible({ timeout: 10000 });
      await workItemDialog.getByRole('button', { name: '新增工作量项' }).click();

      const editorDialog = page.getByTestId('drawing-workitem-editor-dialog');
      await expect(editorDialog).toBeVisible({ timeout: 10000 });
      await editorDialog.getByTestId('drawing-workitem-name').fill(workItemName);
      await editorDialog.getByTestId('drawing-workitem-code').fill('GLZZ');
      await editorDialog.getByTestId('drawing-workitem-quantity').locator('input').first().fill('2');

      const saveWorkItemResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing/work-item') && response.request().method() === 'POST';
      });
      await editorDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await saveWorkItemResponse).ok()).toBeTruthy();
      await expect(successToast(page, '新增成功')).toBeVisible({ timeout: 10000 });
      await expect(workItemDialog.getByTestId('drawing-workitem-table')).toContainText(workItemName, { timeout: 15000 });

      await workItemDialog.getByRole('button', { name: '编辑' }).first().click();
      const editDialog = page.getByTestId('drawing-workitem-editor-dialog');
      await editDialog.getByTestId('drawing-workitem-name').fill(`${workItemName}-编辑`);

      const updateWorkItemResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing/work-item') && response.request().method() === 'POST';
      });
      await editDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await updateWorkItemResponse).ok()).toBeTruthy();
      await expect(successToast(page, '修改成功')).toBeVisible({ timeout: 10000 });
      await expect(workItemDialog.getByTestId('drawing-workitem-table')).toContainText(`${workItemName}-编辑`, { timeout: 15000 });

      const deleteWorkItemResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing/work-item/') && response.request().method() === 'DELETE';
      });
      await workItemDialog.getByRole('button', { name: '删除' }).first().click();
      const confirmDialog = page.locator('.el-message-box').last();
      await expect(confirmDialog).toBeVisible({ timeout: 10000 });
      await confirmDialog.getByRole('button', { name: '确定' }).click();
      expect((await deleteWorkItemResponse).ok()).toBeTruthy();
      await expect(successToast(page, '删除成功')).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
