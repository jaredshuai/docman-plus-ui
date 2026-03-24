# E2E 测试说明

本项目使用 Playwright 进行端到端测试。

## 前置条件

1. **Node.js >= 20.15.0**
2. **后端服务运行**: Docker 联调环境已启动
   - 前端入口：`http://localhost:18080`
   - 后端网关：`http://localhost:18080/prod-api`
3. **测试账号**:
   - 用户名：`admin`
   - 密码：`admin123`
   - 验证码已关闭

## 安装依赖

```bash
# 安装项目依赖
npm install

# 安装 Playwright 浏览器
npx playwright install chromium
```

## 运行测试

```bash
# 运行所有 E2E 测试
npm run test:e2e

# 运行 smoke 测试
npm run test:e2e:smoke

# 以 UI 模式运行（推荐调试时使用）
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看测试报告
npm run test:e2e:report
```

## 测试用例

### P0 冒烟测试 (`e2e/tests/smoke.spec.ts`)

| 用例 | 说明 |
|------|------|
| 登录成功后跳转到首页 | 验证登录流程正常 |
| 仪表盘页面正常加载 | 验证四个统计卡片可见 |
| 仪表盘区域内容可见 | 验证项目进度、超期节点、插件统计区域 |
| 项目管理页面可打开 | 验证搜索表单和列表区域 |
| 文档中心页面可打开 | 验证文档表格存在 |
| 插件列表页面可打开 | 验证插件日志表格存在 |
| 流程编排页面可打开 | 验证页面可访问 |
| 归档管理页面可打开 | 验证页面可访问 |
| 成员管理页面可打开 | 验证项目成员管理页面可访问 |
| 节点时限管理页面可打开 | 验证节点截止与时限管理页面可访问 |

## 测试配置

配置文件：`playwright.config.ts`

- **baseURL**: `http://localhost:18080`
- **浏览器**: Chromium
- **失败时截图**: 启用
- **失败时保留视频**: 启用
- **失败时保留 trace**: 启用

## 测试报告

测试报告保存在 `e2e-report/` 目录下。

## 选择器规范

测试优先使用 `data-testid` 属性定位元素；如果当前联调环境运行的还是旧版 `dist`，测试会自动回退到兼容选择器：

```html
<!-- 推荐 -->
<el-form data-testid="login-form">
  <el-input data-testid="username-input" />
  <el-input data-testid="password-input" />
  <el-button data-testid="login-button" />
</el-form>
```

## 添加新测试

1. 在 `e2e/tests/` 目录下创建 `.spec.ts` 文件
2. 使用 `beforeEach` 进行登录
3. 为新增的页面元素添加 `data-testid` 属性
4. 运行测试验证

## 故障排查

### 登录失败

1. 检查后端服务是否启动
2. 检查 `http://localhost:18080` 是否可访问
3. 检查测试账号是否正确

### 页面加载超时

1. 检查网络请求是否正常
2. 检查后端 API 是否返回正确数据
3. 查看测试报告中的截图和 trace
