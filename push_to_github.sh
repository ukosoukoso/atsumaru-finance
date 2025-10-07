#!/bin/bash

# GitHub推送脚本
# 在 /Users/rsong/FinanceAnalyzer 目录下运行

cd /Users/rsong/FinanceAnalyzer

echo "=========================================="
echo "开始推送到GitHub..."
echo "=========================================="

# 配置git
echo "1. 配置git用户信息..."
git config user.email "songyuguang@gmail.com"
git config user.name "rsong"

# 添加所有文件
echo "2. 添加文件到暂存区..."
git add .

# 查看状态
echo "3. 查看文件状态..."
git status

# 创建提交
echo "4. 创建提交..."
git commit -m "feat: 初始化あつまる财务分析App

- 实现PDF账单分析（银行+信用卡）
- 集成Claude AI进行智能识别
- 添加历史趋势追踪功能
- 零后端架构，用户自带API Key
- 支持iOS和Android

技术栈：React Native + Expo + Claude API
目标市场：日本
商业模式：免费App + 用户自带API Key + 广告"

echo ""
echo "=========================================="
echo "✅ Git提交完成！"
echo "=========================================="
echo ""
echo "⚠️  下一步："
echo "1. 访问 https://github.com/new"
echo "2. 仓库名：atsumaru-finance"
echo "3. 描述：AI-powered financial analysis app for Japanese market"
echo "4. 选择 Public"
echo "5. 不要勾选 'Add a README file'"
echo "6. 点击 'Create repository'"
echo ""
echo "创建完成后，运行："
echo "git remote add origin https://github.com/YOUR_USERNAME/atsumaru-finance.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "=========================================="
