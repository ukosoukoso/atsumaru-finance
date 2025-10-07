# GitHub上传指南

## 步骤1：初始化Git仓库

```bash
cd /Users/rsong/FinanceAnalyzer

# 初始化git（如果还没有）
git init

# 查看状态
git status
```

## 步骤2：添加文件到暂存区

```bash
# 添加所有文件
git add .

# 或者选择性添加
git add App.js app.json eas.json package.json README.md PROJECT_SUMMARY.md
```

## 步骤3：创建首次提交

```bash
git commit -m "feat: 初始化あつまる财务分析App

- 实现PDF账单分析（银行+信用卡）
- 集成Claude AI进行智能识别
- 添加历史趋势追踪功能
- 零后端架构，用户自带API Key
- 支持iOS和Android

技术栈：React Native + Expo + Claude API
目标市场：日本
商业模式：免费App + 用户自带API Key + 广告"
```

## 步骤4：在GitHub创建新仓库

1. 访问 https://github.com/new
2. 仓库名称：`atsumaru-finance`
3. 描述：`AI-powered financial analysis app for Japanese market`
4. 选择 Public 或 Private
5. **不要** 勾选 "Initialize with README"（我们已经有了）
6. 点击 "Create repository"

## 步骤5：关联远程仓库

```bash
# 添加远程仓库（替换YOUR_USERNAME为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/atsumaru-finance.git

# 查看远程仓库
git remote -v
```

## 步骤6：推送到GitHub

```bash
# 推送主分支
git branch -M main
git push -u origin main
```

## 步骤7：添加仓库描述和标签

在GitHub仓库页面：

### 描述
```
AI-powered financial analysis app for Japanese market | 日本市场财务分析App
```

### 标签（Topics）
```
react-native
expo
ai
claude-api
finance
fintech
japan
mobile-app
ios
android
pdf-analysis
```

## 可选：创建GitHub Actions（自动化打包）

创建 `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run lint # 如果有的话
```

## 常用Git命令

### 查看状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
```

### 创建新分支
```bash
git checkout -b feature/new-feature
```

### 切换分支
```bash
git checkout main
```

### 合并分支
```bash
git merge feature/new-feature
```

### 拉取最新代码
```bash
git pull origin main
```

### 推送更新
```bash
git add .
git commit -m "描述你的更改"
git push origin main
```

## 提交信息规范

### 格式
```
<type>: <subject>

<body>
```

### Type类型
- **feat:** 新功能
- **fix:** Bug修复
- **docs:** 文档更新
- **style:** 代码格式调整
- **refactor:** 代码重构
- **perf:** 性能优化
- **test:** 测试相关
- **chore:** 构建/工具相关

### 示例
```bash
git commit -m "feat: 添加月度对比功能"
git commit -m "fix: 修复PDF多页识别问题"
git commit -m "docs: 更新README安装说明"
```

## 注意事项

⚠️ **不要提交的文件：**
- `node_modules/`
- `.env` 文件
- API Keys
- `.DS_Store`
- 构建产物（.ipa, .apk）

✅ **应该提交的文件：**
- 源代码 (`App.js`)
- 配置文件 (`app.json`, `eas.json`, `package.json`)
- 文档 (`README.md`, `PROJECT_SUMMARY.md`)
- 资源文件 (`assets/`)

## 后续维护

### 发布新版本
```bash
# 更新版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# 推送包括tag
git push origin main --tags
```

### 创建Release
1. 在GitHub仓库页面点击 "Releases"
2. 点击 "Draft a new release"
3. 选择tag或创建新tag（如 v1.0.0）
4. 填写标题和说明
5. 附加.ipa和.apk文件（可选）
6. 点击 "Publish release"

---

完成以上步骤后，你的项目就成功上传到GitHub了！🎉
