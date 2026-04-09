import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 文档中心真实流程', () => {
  test('可以上传并删除文档', async ({ page }) => {
    const fileName = `pw-e2e-document-${Date.now()}.txt`;
    const projectName = `pw-e2e-doc-project-${Date.now()}`;
    const tempDir = path.join(os.tmpdir(), 'docman-playwright');
    const filePath = path.join(tempDir, fileName);

    await mkdir(tempDir, { recursive: true });
    await writeFile(filePath, `docman playwright upload ${Date.now()}`, 'utf8');

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      await page.goto(`${DOCMAN_URLS.document}?projectId=${project.id}`);

      await expect(page.locator('[data-testid="document-page"], .app-container').first()).toBeVisible({ timeout: 20000 });
      await page.getByRole('button', { name: '上传文档' }).click();

      const uploadDialog = page.getByRole('dialog').filter({ hasText: '上传文档' }).first();
      await expect(uploadDialog).toBeVisible({ timeout: 10000 });

      await uploadDialog.locator('input[type="file"]').setInputFiles(filePath);
      const uploadResponsePromise = page.waitForResponse((response) => {
        return response.url().includes('/docman/document/upload') && response.request().method() === 'POST';
      });
      await uploadDialog.getByRole('button', { name: /确\s*定/ }).click();
      const uploadResponse = await uploadResponsePromise;
      expect(uploadResponse.ok()).toBeTruthy();

      await page.goto(`${DOCMAN_URLS.document}?projectId=${project.id}`);
      await expect(page.locator('[data-testid="document-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      const row = page.locator('.el-table__row').filter({ hasText: fileName }).first();
      await expect(row).toBeVisible({ timeout: 15000 });

      const deleteResponsePromise = page.waitForResponse((response) => {
        return response.url().includes('/docman/document/') && response.request().method() === 'DELETE';
      });
      await row.getByRole('button', { name: '删除' }).click();
      const confirmDialog = page.locator('.el-message-box').last();
      await expect(confirmDialog).toBeVisible({ timeout: 10000 });
      await confirmDialog.getByRole('button', { name: '确定' }).click();
      const deleteResponse = await deleteResponsePromise;
      expect(deleteResponse.ok()).toBeTruthy();

      await page.goto(`${DOCMAN_URLS.document}?projectId=${project.id}`);
      await expect(page.locator('.el-table__row').filter({ hasText: fileName }).first()).toContainText('obsolete');
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
