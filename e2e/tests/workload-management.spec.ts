import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 工作量线真实流程', () => {
  test('可以在独立页面录入、编辑并删除工作量记录', async ({ page }) => {
    const projectName = `pw-e2e-workload-project-${Date.now()}`;
    const recordRemark = `workload remark ${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.workload}/${project.id}`);
      await expect(page.locator('[data-testid="workload-page"], .app-container').first()).toBeVisible({ timeout: 20000 });
      const addButton = page.getByTestId('workload-add-button');
      await expect(addButton).toBeVisible({ timeout: 10000 });
      await addButton.click();
      const workloadDialog = page.getByRole('dialog').filter({ hasText: '新建工作量记录' }).first();
      await expect(workloadDialog).toBeVisible({ timeout: 10000 });

      const estimatedPriceInput = workloadDialog.getByTestId('workload-form-estimated-price').locator('input').first();
      await estimatedPriceInput.fill('456.78');
      await workloadDialog.getByTestId('workload-form-remark').fill(recordRemark);

      const detailTable = workloadDialog.locator('.workload-detail-panel .el-table').first();
      await detailTable.locator('input[placeholder="工作量名称"]').first().fill('工作量A');
      await detailTable.locator('input[placeholder="别名"]').first().fill('WL-A');
      await detailTable.locator('.el-input-number input').first().fill('88.66');
      await detailTable.locator('input[placeholder="备注"]').first().fill('detail remark');

      const saveResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/add-record') && response.request().method() === 'POST';
      });
      await workloadDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await saveResponse).ok()).toBeTruthy();
      await expect(page.getByText('新增成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.workload}/${project.id}`);

      const workloadTable = page.locator('[data-testid="workload-table"]');
      await expect(workloadTable).toContainText('WL-A', { timeout: 15000 });
      await workloadTable.getByRole('button', { name: '编辑' }).first().click();

      const editDialog = page.getByRole('dialog').filter({ hasText: '编辑工作量记录' }).first();
      await editDialog.getByTestId('workload-form-remark').fill(`${recordRemark}-edited`);
      const updateResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/add-record') && response.request().method() === 'POST';
      });
      await editDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await updateResponse).ok()).toBeTruthy();
      await expect(page.getByText('修改成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.workload}/${project.id}`);

      const deleteResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/add-record/') && response.request().method() === 'DELETE';
      });
      const refreshedWorkloadTable = page.locator('[data-testid="workload-table"]');
      await expect(refreshedWorkloadTable).toContainText('WL-A', { timeout: 15000 });
      await refreshedWorkloadTable.getByRole('button', { name: '删除' }).first().click();
      const confirmDialog = page.locator('.el-message-box').last();
      await expect(confirmDialog).toBeVisible({ timeout: 10000 });
      await confirmDialog.getByRole('button', { name: '确定' }).click();
      expect((await deleteResponse).ok()).toBeTruthy();
      await expect(page.getByText('删除成功', { exact: true })).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
