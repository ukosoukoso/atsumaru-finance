# あつまる (Atsumaru) - 财务分析App项目总结

## 📋 项目概述

**项目名称：** あつまる (Atsumaru - 意为"汇总、聚集")
**类型：** iOS & Android 移动应用
**技术栈：** React Native + Expo
**目标市场：** 日本
**商业模式：** 免费App + 用户自带API Key + 广告收入

## 🎯 产品功能

### 核心功能
1. **PDF账单分析**
   - 银行账户明细分析（收入/支出/储蓄率）
   - 信用卡账单分析（分类消费/节约建议）
   - 支持多页PDF自动识别

2. **AI智能分析**
   - 使用Claude 3.5 Sonnet进行OCR和数据提取
   - 自动分类消费类型（餐饮、购物、交通等）
   - 生成个性化节约建议

3. **历史趋势追踪**
   - 本地保存所有分析历史
   - 可视化图表展示收入/支出/储蓄趋势
   - 最多显示6个月数据对比
   - **用户粘性设计：** 历史数据锁定用户，难以迁移到其他App

4. **零后端架构**
   - 用户自行提供Anthropic API Key
   - 数据完全本地存储（AsyncStorage）
   - 开发者零运营成本

## 🏗️ 技术架构

### 前端
- **框架：** React Native 0.74.5
- **开发工具：** Expo SDK 51
- **UI语言：** 日语

### 关键依赖
```json
{
  "@anthropic-ai/sdk": "latest",
  "@react-native-async-storage/async-storage": "latest",
  "expo-document-picker": "~12.0.0",
  "expo-file-system": "latest",
  "react-native-chart-kit": "latest",
  "react-native-svg": "latest"
}
```

### API集成
- **AI提供商：** Anthropic Claude API
- **模型：** claude-3-5-sonnet-20241022
- **调用方式：** 直接从App调用，无中间服务器

## 📱 应用配置

### iOS配置
```json
{
  "bundleIdentifier": "com.atsumaru.finance",
  "supportsTablet": true,
  "infoPlist": {
    "ITSAppUsesNonExemptEncryption": false
  }
}
```

### Android配置
```json
{
  "package": "com.atsumaru.finance",
  "adaptiveIcon": {
    "backgroundColor": "#667eea"
  }
}
```

### Expo项目ID
- **Project ID：** `22ee9541-4e5f-4910-9ec2-b190295701eb`
- **Slug：** `atsumaru-finance`

## 💰 商业模式

### 收入来源
1. **免费下载** - 降低用户获取成本
2. **用户自带API Key** - 零API成本
3. **广告收入** - 通过AdMob展示广告（待集成）

### 成本结构
- **开发者账号：**
  - Apple Developer: $99/年
  - Google Play: $25（一次性）
- **运营成本：** $0（无服务器）
- **EAS Build：** 免费版30次/月（足够）

## 🚀 发布流程

### 1. 打包命令
```bash
cd /Users/rsong/FinanceAnalyzer

# 同时打包iOS和Android
npx eas build --platform all --profile production

# 或分开打包
npx eas build --platform ios --profile production
npx eas build --platform android --profile production
```

### 2. 提交到商店
```bash
# 提交到App Store
npx eas submit --platform ios

# 提交到Google Play
npx eas submit --platform android
```

### 3. 所需准备
- ✅ Apple Developer账号（已有）
- ⬜ Google Play开发者账号（需注册）
- ⬜ App图标和截图
- ⬜ App Store描述文案（日语）
- ⬜ 隐私政策页面

## 📂 项目文件结构

```
/Users/rsong/FinanceAnalyzer/
├── App.js                 # 主应用代码（678行）
├── app.json              # Expo配置
├── eas.json              # EAS Build配置
├── package.json          # 依赖管理
├── assets/               # 图标和启动画面
└── PROJECT_SUMMARY.md    # 本文档
```

## 🔑 关键代码说明

### API Key管理
```javascript
const API_KEY_STORAGE = '@claude_api_key';
// 本地存储，用户首次启动时设置
```

### 历史数据存储
```javascript
const HISTORY_STORAGE = '@analysis_history';
// 保存格式：{id, date, type, data, month}
```

### PDF分析流程
1. 用户选择PDF → `expo-document-picker`
2. 转换为Base64 → `expo-file-system`
3. 发送到Claude API → `@anthropic-ai/sdk`
4. 解析JSON响应 → 生成分析报告
5. 保存到本地历史 → `AsyncStorage`

## ⚠️ 已知限制

1. **图表库兼容性**
   - 使用`react-native-chart-kit`可能在某些设备上需要额外配置

2. **Expo包体积**
   - App大小约50MB（Expo基础包）
   - 可接受但不是最优

3. **API配额**
   - 依赖用户自己的Claude API配额
   - 需要在App描述中说明清楚

## 🎨 UI/UX特点

- **主题色：** #667eea（紫蓝色）
- **语言：** 日语
- **设计风格：** 简洁现代
- **关键交互：**
  - 📊 历史按钮 - 查看趋势
  - ⚙️ 设置按钮 - 配置API Key
  - 🏦/💳 模式切换 - 银行/信用卡

## 📈 增长策略

### 用户获取
1. 日本本地论坛推广（Reddit Japan、5ch）
2. 社交媒体（Twitter/X日本区）
3. ASO优化（App Store关键词）

### 用户留存
- **数据锁定：** 历史数据存储在本地，迁移成本高
- **持续价值：** 趋势分析需要长期数据积累
- **免费使用：** 无订阅压力

## 🔄 后续迭代计划

### 短期（1-2个月）
- [ ] 集成AdMob广告
- [ ] 添加更多图表类型
- [ ] 支持导出PDF报告
- [ ] 添加预算设置功能

### 中期（3-6个月）
- [ ] 多语言支持（英语、中文）
- [ ] 云端备份（可选，收费功能）
- [ ] 家庭账户共享

### 长期（6个月+）
- [ ] AI财务顾问聊天功能
- [ ] 投资建议
- [ ] 信用卡推荐

## 🐛 开发过程中遇到的问题

### 1. 公司Mac权限问题
**问题：** `/var/folders/` 权限被限制
**解决：** 使用自定义TMPDIR
```bash
export TMPDIR=/Users/rsong/.tmp
```

### 2. 多页PDF分析
**问题：** 初始版本只分析第一页
**解决：** 使用Claude的document API处理完整PDF

### 3. 货币单位错误
**问题：** 显示金额不正确
**解决：** 修改AI prompt明确要求日元整数

## 📞 联系方式

- **开发者：** rsong
- **Expo账号：** @rsong
- **项目路径：** `/Users/rsong/FinanceAnalyzer`

## 📝 Git提交信息模板

### 首次提交
```
feat: 初始化あつまる财务分析App

- 实现PDF账单分析（银行+信用卡）
- 集成Claude AI进行智能识别
- 添加历史趋势追踪功能
- 零后端架构，用户自带API Key
- 支持iOS和Android

技术栈：React Native + Expo + Claude API
```

### 后续提交规范
```
feat: 添加新功能
fix: 修复bug
docs: 更新文档
style: UI调整
refactor: 代码重构
perf: 性能优化
```

## 🎯 成功指标

### 第一个月目标
- [ ] 100次下载
- [ ] 日活用户 > 20
- [ ] 平均使用次数 > 3次/用户

### 三个月目标
- [ ] 1000次下载
- [ ] 广告收入 > $100/月
- [ ] App Store评分 > 4.0

### 一年目标
- [ ] 10000+用户
- [ ] 盈亏平衡
- [ ] 考虑premium功能

## 📚 相关资源

- **Expo文档：** https://docs.expo.dev
- **Claude API文档：** https://docs.anthropic.com
- **React Native文档：** https://reactnative.dev
- **App Store审核指南：** https://developer.apple.com/app-store/review/guidelines/

---

**最后更新：** 2025-10-07
**版本：** 1.0.0
**状态：** 开发完成，准备打包发布
