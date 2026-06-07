# AWS Amplify 部署指南

> 把 Douying AI Screenwriting 部署到 AWS Amplify 平台的完整步骤。

---

## 📋 部署前准备

### 1. AWS 账户
- 注册 AWS 账户：https://aws.amazon.com/
- 创建 IAM 用户（具有 Amplify 管理权限）

### 2. GitHub 账户
- 注册 GitHub：https://github.com/
- 创建一个新仓库（如 `douying-ai-screenwriting`）

### 3. 本地环境
- Node.js 18+
- Git
- AWS CLI（可选，用于本地调试）

---

## 🚀 部署流程（5 步）

### Step 1：初始化 Git 并推送到 GitHub

```bash
cd /Users/slt/Desktop/Trae P/writer

# 初始化 git（如未初始化）
git init
git add .
git commit -m "Initial commit - ready for Amplify deployment"

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/douying-ai-screenwriting.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

> ⚠️ **注意**：`.env`、`.env.local` 等敏感文件**不会被推送**（已在 `.gitignore` 中排除）

---

### Step 2：在 AWS Amplify 创建应用

1. 登录 AWS 控制台：https://console.aws.amazon.com/
2. 搜索 **AWS Amplify** → 点击进入
3. 点击 **"Create new app"** → **"Host web app"**
4. 选择 **GitHub** 作为源代码提供商
5. 点击 **"Connect to GitHub"** → 授权 AWS Amplify 访问你的 GitHub
6. 选择 **仓库**：`douying-ai-screenwriting`
7. 选择 **分支**：`main`
8. 点击 **"Next"**

---

### Step 3：配置构建设置

Amplify 会自动检测到 `amplify.yml` 文件，但你需要 **检查并确认**：

```yaml
# 关键配置（自动生成的 amplify.yml）
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --no-audit --prefer-offline
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
```

如果 Amplify 没有自动识别 `amplify.yml`，请手动选择 **"Edit"** 并粘贴项目根目录的 `amplify.yml` 内容。

---

### Step 4：配置环境变量（关键！）

在 **"Environment variables"** 部分，添加以下变量：

| 变量名 | 值 | 必填 | 说明 |
|--------|----|----|------|
| `DEEPSEEK_API_KEY` | `sk-xxxxxxxxx` | ✅ | DeepSeek API Key |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | `us-east-1_XXXXXX` | ⚠️ | 部署时启用 |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | `xxxxxxxxxx` | ⚠️ | 部署时启用 |
| `NEXT_PUBLIC_AWS_REGION` | `us-east-1` | ⚠️ | AWS 区域 |
| `DYNAMODB_TABLE_NAME` | `douyin-scripts` | ⚠️ | DynamoDB 表名 |
| `AWS_ACCESS_KEY_ID` | `AKIAXXXXX` | ⚠️ | IAM 角色 Access Key |
| `AWS_SECRET_ACCESS_KEY` | `xxxxxxxxxx` | ⚠️ | IAM 角色 Secret |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://...` | ❌ | Sentry 监控 |
| `NEXT_PUBLIC_WS_URL` | `wss://...` | ❌ | 协作 WebSocket |

> 💡 **第一阶段建议**：先只填 `DEEPSEEK_API_KEY`，其他用 mock 模式（应用已支持）
> 部署成功后再逐步启用 Cognito / DynamoDB

---

### Step 5：开始部署

1. 点击 **"Save and deploy"**
2. Amplify 会开始构建（首次约 3-5 分钟）
3. 等待构建完成，状态变为 ✅ **"Deploy complete"**
4. 访问 Amplify 分配的域名：`https://main.xxxxx.amplifyapp.com`

---

## 🔄 后续部署

每次 `git push` 到 `main` 分支，Amplify 会自动重新部署：

```bash
git add .
git commit -m "feat: 新增功能"
git push origin main
```

在 Amplify 控制台可查看构建日志、失败原因、部署历史。

---

## 🌐 自定义域名（可选）

### 1. 购买域名
- Route 53（AWS）
- 或其他域名服务商（阿里云、Cloudflare 等）

### 2. 在 Amplify 添加域名
- Amplify 控制台 → **Domain management** → **Add domain**
- 输入域名（如 `douying.app`）
- 按照提示配置 DNS 记录

### 3. 自动 HTTPS
- Amplify 自动通过 ACM（AWS Certificate Manager）签发免费 SSL 证书

---

## 🔐 Cognito 用户认证（可选启用）

### 1. 创建 Cognito User Pool

```bash
# 使用 AWS CLI
aws cognito-idp create-user-pool \
  --pool-name douying-users \
  --region us-east-1

aws cognito-idp create-user-pool-client \
  --user-pool-id us-east-1_XXXXXX \
  --client-name douying-web-client
```

或在控制台：**Cognito → User Pools → Create user pool**

### 2. 配置环境变量

回到 Amplify → **Environment variables**：
- `NEXT_PUBLIC_COGNITO_USER_POOL_ID`
- `NEXT_PUBLIC_COGNITO_CLIENT_ID`
- `NEXT_PUBLIC_AWS_REGION`

### 3. 重新部署

点击 **"Redeploy this version"** 即可。

---

## 🗄️ DynamoDB 数据持久化（可选启用）

### 1. 创建 DynamoDB 表

```bash
aws dynamodb create-table \
  --table-name douyin-scripts \
  --attribute-definitions \
      AttributeName=id,AttributeType=S \
  --key-schema \
      AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

### 2. 创建 IAM 角色

创建具有 DynamoDB 读写权限的 IAM 用户，获取 Access Key。

### 3. 配置 Amplify 环境变量

- `DYNAMODB_TABLE_NAME`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

> ⚠️ **生产环境建议**：使用 IAM Role 而非 Access Key（Amplify 支持 OIDC 角色）

---

## 🐛 常见问题

### 1. 构建失败：`Cannot find module`
- 检查 `package.json` 是否完整提交
- 确认 `amplify.yml` 使用 `npm ci`（而非 `npm install`）

### 2. API 路由 404
- Next.js 16 的 App Router API 路由在 Amplify SSR 模式下**正常工作**
- 检查 `app/api/*/route.ts` 文件是否完整

### 3. 环境变量未生效
- Amplify 的环境变量**只在构建时注入**
- 修改后必须**重新部署**才能生效

### 4. 部署成功但页面打不开
- 检查 Amplify 控制台的 **CloudWatch 日志**
- 查看 SSR 错误堆栈

---

## 📊 监控 & 日志

### CloudWatch Logs
- Amplify → App → **Monitoring** → **CloudWatch**
- 实时查看 SSR 请求日志、错误堆栈

### Sentry（推荐启用）
- 注册 Sentry：https://sentry.io/
- 创建 Next.js 项目
- 配置 `NEXT_PUBLIC_SENTRY_DSN` 环境变量
- 自动捕获前后端错误

---

## 💰 成本估算

| 服务 | 免费额度 | 超出费用 |
|------|---------|---------|
| Amplify Hosting | 1000 构建分钟 + 15GB 流量/月 | $0.01/构建分钟 + $0.15/GB |
| Lambda（SSR） | 100 万请求/月 | $0.20/100 万请求 |
| DynamoDB | 25 GB 存储 + 25 WCU/RCU | 按使用量 |
| Cognito | 50,000 MAU | $0.0055/MAU |

> 💡 **个人项目基本免费**（不超过免费额度）

---

## 📚 相关链接

- [AWS Amplify 官方文档](https://docs.amplify.aws/)
- [Next.js + Amplify 部署指南](https://docs.aws.amazon.com/amplify/latest/userguide/server-side-rendering-amplify.html)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)
- [Cognito 入门](https://docs.aws.amazon.com/cognito/latest/developerguide/)

---

## ✅ 部署完成检查清单

- [ ] GitHub 仓库已创建并推送
- [ ] AWS Amplify 应用已创建
- [ ] amplify.yml 已识别
- [ ] DEEPSEEK_API_KEY 已配置
- [ ] 构建状态：✅ Deploy complete
- [ ] 访问域名可正常打开
- [ ] 短剧生成功能正常
- [ ] （可选）Cognito 用户登录正常
- [ ] （可选）DynamoDB 数据持久化正常
- [ ] （可选）自定义域名配置
