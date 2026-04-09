import { expect, type Page } from '@playwright/test';
import { TEST_CLIENT_ID } from './auth';

const DOCMAN_E2E_API_BASE_URL = process.env.DOCMAN_E2E_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8080';

interface ApiEnvelope<T> {
  code: number;
  msg?: string;
  data: T;
}

interface UserInfoEnvelope {
  user: {
    userId: number;
  };
}

export interface ProjectSeed {
  id: string;
  name: string;
}

async function getAuthHeaders(page: Page): Promise<Record<string, string>> {
  const token = await page.evaluate(() => localStorage.getItem('Admin-Token'));
  expect(token).toBeTruthy();
  return {
    Authorization: `Bearer ${token}`,
    clientid: TEST_CLIENT_ID,
    'Content-Type': 'application/json'
  };
}

async function requestJson<T>(page: Page, path: string, options: { method?: 'GET' | 'POST' | 'DELETE'; data?: unknown } = {}): Promise<T> {
  const headers = await getAuthHeaders(page);
  const response = await page.request.fetch(`${DOCMAN_E2E_API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    data: options.data
  });
  expect(response.ok(), `${path} should return success HTTP status`).toBeTruthy();
  const body = (await response.json()) as ApiEnvelope<T>;
  expect(body.code, `${path} should return business success`).toBe(200);
  return body.data;
}

export async function getCurrentUserId(page: Page): Promise<number> {
  const data = await requestJson<UserInfoEnvelope>(page, '/system/user/getInfo');
  return data.user.userId;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function findProjectIdByName(page: Page, projectName: string): Promise<string> {
  const headers = await getAuthHeaders(page);
  const response = await page.request.fetch(
    `${DOCMAN_E2E_API_BASE_URL}/docman/project/list?pageNum=1&pageSize=20&name=${encodeURIComponent(projectName)}`,
    {
      method: 'GET',
      headers
    }
  );
  expect(response.ok(), 'project list should return success HTTP status').toBeTruthy();
  const raw = await response.text();
  const matcher = new RegExp(`"id":([0-9]+)[^{}]*"name":"${escapeRegExp(projectName)}"`, 'g');
  const match = matcher.exec(raw);
  expect(match, 'project list should contain created project').not.toBeNull();
  return match![1];
}

export async function createTempProject(page: Page, projectName: string): Promise<ProjectSeed> {
  const ownerId = await getCurrentUserId(page);
  const headers = await getAuthHeaders(page);
  const response = await page.request.fetch(`${DOCMAN_E2E_API_BASE_URL}/docman/project`, {
    method: 'POST',
    headers,
    data: {
      name: projectName,
      projectTypeCode: 'telecom',
      customerType: 'telecom',
      businessType: 'pipeline',
      documentCategory: 'e2e',
      remark: 'Playwright isolated project',
      ownerId
    }
  });
  expect(response.ok(), 'create project should return success HTTP status').toBeTruthy();
  const raw = await response.text();
  const createdIdMatch = raw.match(/"data"\s*:\s*"?([0-9]+)"?/);
  if (createdIdMatch) {
    return { id: createdIdMatch[1], name: projectName };
  }
  return { id: await findProjectIdByName(page, projectName), name: projectName };
}

export async function deleteProject(page: Page, projectId: string): Promise<void> {
  await requestJson<void>(page, `/docman/project/${projectId}`, { method: 'DELETE' });
}
