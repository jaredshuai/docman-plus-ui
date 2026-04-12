import { expect, test } from '@playwright/test';
import { DOCMAN_URLS, login } from '../helpers/auth';
import { advanceProjectNode, completeProjectTask, createTempProject, deleteProject, getWorkspace, requestDocmanJson } from '../helpers/docman';

test.describe('P1 电信闭环运行时', () => {
  test('工作量线与项目经理平料线在工作台中按真实数据自动完成', async ({ page }) => {
    const projectName = `pw-e2e-mainline-${Date.now()}`;

    const gotoWorkspace = async (projectId: string) => {
      await page.goto(`${DOCMAN_URLS.workspace}?projectId=${projectId}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid="workspace-page"]')).toBeVisible({ timeout: 20000 });
    };

    await login(page);
    const project = await createTempProject(page, projectName);

    try {
      let workspace = await getWorkspace(page, project.id);

      const confirmTask = (workspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'project_info_confirm');
      expect(confirmTask, 'project_info_confirm should exist').toBeTruthy();
      await completeProjectTask(page, project.id, confirmTask.id);
      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      const drawingId = await requestDocmanJson<string | number>(page, '/docman/project/drawing', {
        method: 'POST',
        data: {
          projectId: project.id,
          drawingCode: `DWG-${Date.now()}`,
          orderSerialNo: 'ORDER-001',
          workContent: 'E2E 图纸线验证',
          includeInProject: true,
          remark: 'runtime-check'
        }
      });
      workspace = await getWorkspace(page, project.id);
      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      await requestDocmanJson(page, '/docman/project/visa', {
        method: 'POST',
        data: {
          projectId: project.id,
          reason: '签证原因',
          contentBasis: '签证依据',
          amount: 99.5,
          visaDate: '2026-04-10 00:00:00',
          includeInProject: true,
          remark: 'runtime-check'
        }
      });
      workspace = await getWorkspace(page, project.id);
      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      workspace = await getWorkspace(page, project.id);
      expect(workspace.currentNodeCode).toBe('workload_input');
      const workloadTask = (workspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'workload_fill');
      expect(workloadTask?.status).toBe('pending');

      await gotoWorkspace(project.id);
      await page.getByRole('button', { name: '去录图纸工作量' }).first().click();
      await page.waitForURL(new RegExp(`/docman/drawing/${project.id}$`), { timeout: 10000 });

      await requestDocmanJson(page, '/docman/project/drawing/work-item', {
        method: 'POST',
        data: {
          projectId: project.id,
          drawingId,
          workItemCode: `WI-${Date.now()}`,
          workItemName: '杆路整治',
          category: '施工',
          unit: '处',
          quantity: 2,
          includeInEstimate: true,
          remark: 'runtime-check'
        }
      });

      await expect
        .poll(async () => {
          const latestWorkspace = await getWorkspace(page, project.id);
          return {
            nodeCode: latestWorkspace.currentNodeCode,
            taskStatus: (latestWorkspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'workload_fill')?.status
          };
        })
        .toMatchObject({
          nodeCode: 'workload_input',
          taskStatus: 'completed'
        });

      workspace = await getWorkspace(page, project.id);

      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      workspace = await getWorkspace(page, project.id);
      expect(workspace.currentNodeCode).toBe('initial_estimate');
      await requestDocmanJson(page, `/docman/project/${project.id}/estimate/trigger`, { method: 'POST' });

      await expect
        .poll(async () => {
          const latestWorkspace = await getWorkspace(page, project.id);
          return (latestWorkspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'estimate_run')?.status;
        })
        .toBe('completed');

      workspace = await getWorkspace(page, project.id);

      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      workspace = await getWorkspace(page, project.id);
      expect(workspace.currentNodeCode).toBe('manager_balance');
      const managerAdjustTask = (workspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'manager_adjust');
      expect(managerAdjustTask?.status).toBe('pending');

      await gotoWorkspace(project.id);
      await page.getByRole('button', { name: '去平料' }).first().click();
      await page.waitForURL(new RegExp(`/docman/balance\\?projectId=${project.id}$`), { timeout: 10000 });

      await requestDocmanJson(page, `/docman/project/${project.id}/balance`, {
        method: 'POST',
        data: {
          projectId: project.id,
          materialPrice: 123.45,
          balanceRemark: 'runtime-check'
        }
      });

      await expect
        .poll(async () => {
          const latestWorkspace = await getWorkspace(page, project.id);
          return {
            nodeCode: latestWorkspace.currentNodeCode,
            taskStatus: (latestWorkspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'manager_adjust')?.status
          };
        })
        .toMatchObject({
          nodeCode: 'manager_balance',
          taskStatus: 'completed'
        });

      workspace = await getWorkspace(page, project.id);

      await advanceProjectNode(page, project.id, workspace.currentNodeCode);

      workspace = await getWorkspace(page, project.id);
      expect(workspace.currentNodeCode).toBe('export_text');
      const exportTask = (workspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'export_run');
      expect(exportTask?.status).toBe('pending');
      expect(workspace.exportTriggerReady).toBe(true);

      await gotoWorkspace(project.id);
      const exportButton = page.getByRole('button', { name: '导出文本' }).first();
      await expect(exportButton).toBeEnabled();
      await exportButton.click();

      await expect
        .poll(async () => {
          const latestWorkspace = await getWorkspace(page, project.id);
          return {
            taskStatus: (latestWorkspace.currentNodeTasks || []).find((task: any) => task.taskCode === 'export_run')?.status,
            artifactStatus: latestWorkspace.latestExportArtifact?.status,
            artifactName: latestWorkspace.latestExportArtifact?.fileName || ''
          };
        })
        .toMatchObject({
          taskStatus: 'completed',
          artifactStatus: 'generated'
        });

      workspace = await getWorkspace(page, project.id);
      expect(workspace.latestExportArtifact?.fileName).toContain('mock_export');

      await page.goto(`${DOCMAN_URLS.document}?projectId=${project.id}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid="document-page"]')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-testid="document-table"]')).toContainText(workspace.latestExportArtifact?.fileName || '', { timeout: 15000 });

      await page.goto(`${DOCMAN_URLS.plugin}/log?projectId=${project.id}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid="plugin-page"]')).toBeVisible({ timeout: 20000 });
      await expect(page.locator('[data-testid="plugin-log-table"]')).toContainText('export_text', { timeout: 15000 });
      await expect(page.locator('[data-testid="plugin-log-table"]')).toContainText('电信文本导出 Mock 插件', { timeout: 15000 });
    } finally {
      await deleteProject(page, project.id).catch(() => undefined);
    }
  });
});
