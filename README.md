# あつまる (Atsumaru) 📊

> AI驱动的财务分析App - 让你的钱包更聪明

<div align="center">

**[日本語]** | 简体中文

[![iOS](https://img.shields.io/badge/iOS-App_Store-blue)](https://apps.apple.com)
[![Android](https://img.shields.io/badge/Android-Google_Play-green)](https://play.google.com)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

</div>

## ✨ 功能特点

### 🤖 AI智能分析
- 使用Claude 3.5 Sonnet进行OCR识别
- 自动提取PDF账单中的交易信息
- 智能分类消费类型（餐饮、购物、交通等）

### 💰 双模式分析
- **银行账户模式：** 收入/支出/储蓄率分析
- **信用卡模式：** 详细消费分类和节约建议

### 📈 趋势追踪
- 可视化图表展示财务趋势
- 最多6个月历史数据对比
- 本地存储，数据完全私密

### 🔒 隐私至上
- 零后端架构，无服务器
- 数据完全存储在本地
- 用户自带Claude API Key

## 🚀 快速开始

### 前置要求
- Node.js 18+
- npm或yarn
- Expo CLI

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/atsumaru-finance.git
cd atsumaru-finance

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 在手机上运行

1. 下载Expo Go App
   - [iOS](https://apps.apple.com/app/expo-go/id982107779)
   - [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. 扫描终端中的二维码

## 📱 使用方法

### 1. 配置API Key
首次启动时，需要配置Claude API Key：
1. 点击右上角⚙️设置按钮
2. 访问[Anthropic Console](https://console.anthropic.com/settings/keys)
3. 创建新的API Key
4. 复制并粘贴到App中

### 2. 上传账单
1. 选择账单类型（银行/信用卡）
2. 点击"PDFをアップロード"
3. 选择PDF文件
4. 等待AI分析完成

### 3. 查看趋势
1. 点击右上角📊历史按钮
2. 查看过去的分析记录
3. 浏览收入/支出/储蓄趋势图表

## 🛠️ 技术栈

- **前端框架：** React Native
- **开发工具：** Expo SDK 51
- **AI服务：** Anthropic Claude API
- **数据存储：** AsyncStorage
- **图表库：** react-native-chart-kit

## 📦 项目结构

```
FinanceAnalyzer/
├── App.js                 # 主应用代码
├── app.json              # Expo配置
├── eas.json              # EAS Build配置
├── package.json          # 依赖管理
├── assets/               # 图标和资源
├── PROJECT_SUMMARY.md    # 项目总结文档
└── README.md            # 本文件
```

## 🔧 打包发布

### iOS

```bash
# 打包
npx eas build --platform ios --profile production

# 提交到App Store
npx eas submit --platform ios
```

### Android

```bash
# 打包
npx eas build --platform android --profile production

# 提交到Google Play
npx eas submit --platform android
```

## 💡 为什么选择あつまる？

### ✅ 优势
- **零成本运营** - 用户自带API Key，开发者无需承担API费用
- **完全隐私** - 数据本地存储，不经过任何服务器
- **AI驱动** - 最先进的Claude模型，识别准确率高
- **数据锁定** - 历史数据积累带来用户粘性

### 💸 成本说明
- **App免费下载**
- **Claude API费用：** 约$0.01-0.02/次分析（用户自付）
- **无订阅费**
- **无隐藏费用**

## 📄 许可证

MIT License - 详见[LICENSE](LICENSE)文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📞 联系方式

- **开发者：** [@rsong](https://github.com/rsong)
- **问题反馈：** [Issues](https://github.com/rsong/atsumaru-finance/issues)
- **项目主页：** [GitHub](https://github.com/rsong/atsumaru-finance)

## 🙏 致谢

- [Anthropic](https://anthropic.com) - 提供强大的Claude API
- [Expo](https://expo.dev) - 简化React Native开发
- 所有贡献者和用户

---

<div align="center">

**用AI，让财务管理更简单** 💰✨

Made with ❤️ in Japan

</div>
