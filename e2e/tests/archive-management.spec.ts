import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { createTempProject, deleteProject } from '../helpers/docman';

test.describe('P1 归档真实流程', () => {
  test('可以发起项目归档并看到归档结果', async ({ page }) => {
    const projectName = `pw-e2e-archive-project-${Date.now()}`;
    const fileName = `pw-e2e-archive-${Date.now()}.txt`;
    const tempDir = path.join(os.tmpdir(), 'docman-playwright');
    const filePath = path.join(tempDir, fileName);

    await mkdir(tempDir, { recursive: true });
    await writeFile(filePath, `docman archive upload ${Date.now()}`, 'utf8');

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

      await page.goto(`${DOCMAN_URLS.archive}?projectId=${project.id}`);
      await expect(page.locator('[data-testid="archive-page"], .app-container').first()).toBeVisible({ timeout: 20000 });

      const archiveResponsePromise = page.waitForResponse((response) => {
        return response.url().includes(`/docman/archive/${project.id}`) && response.request().method() === 'POST';
      });
      await page.getByRole('button', { name: '发起归档' }).click();
      const confirmDialog = page.locator('.el-message-box').last();
      await expect(confirmDialog).toBeVisible({ timeout: 10000 });
      await confirmDialog.getByRole('button', { name: '确定' }).click();
      const archiveResponse = await archiveResponsePromise;
      expect(archiveResponse.ok()).toBeTruthy();

      await page.goto(`${DOCMAN_URLS.archive}?projectId=${project.id}`);
      await expect(page.getByText('归档基本信息', { exact: true })).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(/归档任务已发起|completed|已完成/).first()).toBeVisible({ timeout: 10000 });
      await expect(page.locator('.el-descriptions').first()).toContainText('V1');
      await expect(page.getByText('文件清单', { exact: true })).toBeVisible({ timeout: 10000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
