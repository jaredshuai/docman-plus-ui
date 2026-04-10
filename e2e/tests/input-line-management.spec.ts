import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 图纸线与签证线真实流程', () => {
  test('可以在独立页面录入、编辑并删除图纸和签证', async ({ page }) => {
    const projectName = `pw-e2e-input-line-project-${Date.now()}`;
    const drawingCode = `DWG-${Date.now()}`;
    const drawingRemark = `drawing remark ${Date.now()}`;
    const visaReason = `visa reason ${Date.now()}`;
    const visaRemark = `visa remark ${Date.now()}`;

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.drawing}/${project.id}`);
      await expect(page.locator('[data-testid="drawing-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      await page.getByRole('button', { name: '新建图纸' }).click();
      const drawingDialog = page.getByRole('dialog').filter({ hasText: '新建图纸' }).first();
      await expect(drawingDialog).toBeVisible({ timeout: 10000 });
      await drawingDialog.getByTestId('drawing-form-code').fill(drawingCode);
      await drawingDialog.getByTestId('drawing-form-order').fill(`ORDER-${Date.now()}`);
      await drawingDialog.getByTestId('drawing-form-content').fill('独立图纸线录入验证');
      await drawingDialog.getByTestId('drawing-form-remark').fill(drawingRemark);

      const saveDrawingResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing') && response.request().method() === 'POST';
      });
      await drawingDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await saveDrawingResponse).ok()).toBeTruthy();
      await expect(page.getByText('新增成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.drawing}/${project.id}`);

      const drawingRow = page.locator('[data-testid="drawing-table"] .el-table__row').filter({ hasText: drawingCode }).first();
      await expect(drawingRow).toBeVisible({ timeout: 15000 });
      await drawingRow.getByRole('button', { name: '编辑' }).click();
      const editDrawingDialog = page.getByRole('dialog').filter({ hasText: '编辑图纸' }).first();
      await editDrawingDialog.getByTestId('drawing-form-remark').fill(`${drawingRemark}-edited`);
      const updateDrawingResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing') && response.request().method() === 'POST';
      });
      await editDrawingDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await updateDrawingResponse).ok()).toBeTruthy();
      await expect(page.getByText('修改成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.drawing}/${project.id}`);

      const deleteDrawingResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/drawing/') && response.request().method() === 'DELETE';
      });
      const refreshedDrawingRow = page.locator('[data-testid="drawing-table"] .el-table__row').filter({ hasText: drawingCode }).first();
      await refreshedDrawingRow.getByRole('button', { name: '删除' }).click();
      const drawingConfirm = page.locator('.el-message-box').last();
      await expect(drawingConfirm).toBeVisible({ timeout: 10000 });
      await drawingConfirm.getByRole('button', { name: '确定' }).click();
      expect((await deleteDrawingResponse).ok()).toBeTruthy();
      await expect(page.getByText('删除成功', { exact: true })).toBeVisible({ timeout: 10000 });

      await page.goto(`${DOCMAN_URLS.visa}/${project.id}`);
      await expect(page.locator('[data-testid="visa-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      await page.getByRole('button', { name: '新建签证单' }).click();
      const visaDialog = page.getByRole('dialog').filter({ hasText: '新建签证单' }).first();
      await expect(visaDialog).toBeVisible({ timeout: 10000 });
      await visaDialog.getByTestId('visa-form-reason').fill(visaReason);
      await visaDialog.getByTestId('visa-form-content-basis').fill('签证独立数据线真实回归');
      const visaDateInput = visaDialog.locator('input[placeholder="选择签证日期"]').first();
      await visaDateInput.fill('2026-04-09 00:00:00');
      await visaDialog.getByTestId('visa-form-remark').fill(visaRemark);

      const amountInput = visaDialog.locator('[data-testid="visa-form-amount"] input').first();
      await amountInput.fill('123.45');

      const saveVisaResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/visa') && response.request().method() === 'POST';
      });
      await visaDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await saveVisaResponse).ok()).toBeTruthy();
      await expect(page.getByText('新增成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.visa}/${project.id}`);

      const visaRow = page.locator('[data-testid="visa-table"] .el-table__row').filter({ hasText: visaReason }).first();
      await expect(visaRow).toBeVisible({ timeout: 15000 });
      await visaRow.getByRole('button', { name: '编辑' }).click();
      const editVisaDialog = page.getByRole('dialog').filter({ hasText: '编辑签证单' }).first();
      await editVisaDialog.getByTestId('visa-form-remark').fill(`${visaRemark}-edited`);
      const updateVisaResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/visa') && response.request().method() === 'POST';
      });
      await editVisaDialog.getByRole('button', { name: /确\s*定/ }).click();
      expect((await updateVisaResponse).ok()).toBeTruthy();
      await expect(page.getByText('修改成功', { exact: true })).toBeVisible({ timeout: 10000 });
      await page.goto(`${DOCMAN_URLS.visa}/${project.id}`);

      const deleteVisaResponse = page.waitForResponse((response) => {
        return response.url().includes('/docman/project/visa/') && response.request().method() === 'DELETE';
      });
      const refreshedVisaRow = page.locator('[data-testid="visa-table"] .el-table__row').filter({ hasText: visaReason }).first();
      await refreshedVisaRow.getByRole('button', { name: '删除' }).click();
      const visaConfirm = page.locator('.el-message-box').last();
      await expect(visaConfirm).toBeVisible({ timeout: 10000 });
      await visaConfirm.getByRole('button', { name: '确定' }).click();
      expect((await deleteVisaResponse).ok()).toBeTruthy();
      await expect(page.getByText('删除成功', { exact: true })).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
