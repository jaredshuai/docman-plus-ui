/**
 * Playwright 测试认证助手
 * 提供登录状态复用能力
 */

import { Page, BrowserContext } from '@playwright/test';

const APP_BASE_URL = process.env.DOCMAN_E2E_BASE_URL?.replace(/\/$/, '') ?? '';

function resolveAppUrl(path: string): string {
  return APP_BASE_URL ? `${APP_BASE_URL}${path}` : path;
}

/**
 * 测试账号配置
 */
export const TEST_ACCOUNT = {
  username: 'admin',
  password: 'admin123',
  tenantId: '000000'
};

export const TEST_CLIENT_ID = process.env.DOCMAN_E2E_CLIENT_ID ?? 'e5cd7e4891bf95d1d19206ce24a7b32e';

/**
 * 登录页面 URL
 */
export const LOGIN_URL = resolveAppUrl('/login');

/**
 * 首页 URL
 */
export const HOME_URL = resolveAppUrl('/');

/**
 * docman 各页面 URL
 */
export const DOCMAN_URLS = {
  dashboard: resolveAppUrl('/docman/dashboard'),
  project: resolveAppUrl('/docman/project'),
  document: resolveAppUrl('/docman/document'),
  process: resolveAppUrl('/docman/process'),
  archive: resolveAppUrl('/docman/archive'),
  plugin: resolveAppUrl('/docman/plugin'),
  member: resolveAppUrl('/docman/member'),
  nodeDeadline: resolveAppUrl('/docman/nodedeadline')
};

export const DEMO_PROJECT_ID = 910000000000000001;

/**
 * 执行登录操作
 * @param page Playwright Page 对象
 * @param username 用户名
 * @param password 密码
 */
export async function login(
  page: Page,
  username: string = TEST_ACCOUNT.username,
  password: string = TEST_ACCOUNT.password
): Promise<void> {
  await page.goto(LOGIN_URL);

  const loginFormCandidates = [
    '[data-testid="login-form"]',
    '.login-form'
  ];
  const usernameCandidates = [
    '[data-testid="username-input"] input',
    '[data-testid="username-input"]',
    'input[placeholder*="用户名"]',
    'input[placeholder*="账号"]'
  ];
  const passwordCandidates = [
    '[data-testid="password-input"] input',
    '[data-testid="password-input"]',
    'input[type="password"]'
  ];
  const loginButtonCandidates = [
    '[data-testid="login-button"]',
    'button:has-text("登")',
    'button[type="primary"]'
  ];

  await waitForAnyVisible(page, loginFormCandidates, 15000);
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => undefined);
  await assertCaptchaIsReady(page);

  const usernameInput = page.locator(usernameCandidates.join(', ')).first();
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });
  await usernameInput.clear();
  await usernameInput.fill(username);

  const passwordInput = page.locator(passwordCandidates.join(', ')).first();
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.clear();
  await passwordInput.fill(password);

  const loginButton = page.locator(loginButtonCandidates.join(', ')).first();
  await loginButton.waitFor({ state: 'visible', timeout: 10000 });
  await loginButton.click();

  // RuoYi 登录后通常是前端路由切换，不一定触发完整页面 load。
  // 这里优先等待主布局出现，再兜底校验已经离开 /login。
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login') || !!document.querySelector('.sidebar-container, .el-menu, [class*="sidebar"]'),
    { timeout: 30000 }
  );
  await page.waitForSelector('.sidebar-container, .el-menu, [class*="sidebar"]', { timeout: 15000 });
}

/**
 * 保存认证状态到文件
 * @param context Browser Context
 * @param path 存储路径
 */
export async function saveAuthState(context: BrowserContext, path: string): Promise<void> {
  await context.storageState({ path });
}

/**
 * 检查是否已登录
 * @param page Playwright Page 对象
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // 检查是否存在登录表单
    const loginForm = await page.$('[data-testid="login-form"]');
    return loginForm === null;
  } catch {
    return false;
  }
}

/**
 * 等待页面加载完成
 * @param page Playwright Page 对象
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

async function waitForAnyVisible(page: Page, selectors: string[], timeout: number): Promise<void> {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const selector of selectors) {
      const locator = page.locator(selector).first();
      if (await locator.count() > 0 && await locator.isVisible()) {
        return;
      }
    }
    await page.waitForTimeout(200);
  }
  throw new Error(`未找到可见元素: ${selectors.join(', ')}`);
}

async function assertCaptchaIsReady(page: Page): Promise<void> {
  const captchaInput = page.locator('input[placeholder*="验证码"]').first();
  if (await captchaInput.count() === 0) {
    return;
  }

  try {
    await page.waitForFunction(() => {
      const input = Array.from(document.querySelectorAll('input')).find((item) =>
        (item as HTMLInputElement).placeholder?.includes('验证码')
      ) as HTMLInputElement | undefined;
      if (!input) {
        return true;
      }
      const style = window.getComputedStyle(input);
      return style.display === 'none' || style.visibility === 'hidden' || input.offsetParent === null;
    }, { timeout: 5000 });
  } catch {
    throw new Error('登录页验证码仍然可见，请确认测试环境已关闭验证码或为测试补充验证码处理逻辑');
  }
}
