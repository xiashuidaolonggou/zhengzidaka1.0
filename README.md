# 正字打卡 · TallyCheckIn

基于 React Native + Expo 的习惯追踪 App，纯本地存储。灵感来自中国传统「画正字」计数法。

A habit tracking app built with React Native + Expo. Pure local storage. Inspired by the traditional Chinese "正" tally mark counting method.

---

## 功能 · Features

| 功能 Feature | 说明 Description |
|---|---|
| 三种计数方式 Three counting styles | 正字（5笔逐画动画）、四竖一横、五角星 |
| 滑动操作 Swipe gestures | 左滑删除、右滑置顶，仿 iOS 邮件交互 |
| 批量编辑 Batch editing | 多选、全选、批量置顶/删除 |
| 年度热力图 Yearly heatmap | GitHub Contributions 风格，墨韵配色 |
| 连续天数统计 Streak tracking | 自动计算每个目标的连续打卡天数 |
| 纯本地存储 Local-first | SQLite 持久化，无需注册、无后端 |

## 技术栈 · Tech Stack

| 层 Layer | 技术 Tech |
|---|---|
| 框架 Framework | React Native 0.81.5 + Expo SDK 54 |
| 语言 Language | TypeScript ~5.9.2 |
| 导航 Navigation | @react-navigation/native v7（Bottom Tabs + Native Stack） |
| 数据库 Database | expo-sqlite ~16 |
| 动画 Animation | react-native-reanimated v4 + react-native-gesture-handler v2 |
| SVG | react-native-svg 15 |

## 快速开始 · Quick Start

```bash
# 安装依赖 / Install dependencies
npm install

# 启动开发服务器 / Start dev server
npx expo start

# 手机安装 Expo Go，扫码运行
# 同 WiFi 下直接扫码，或 npx expo start --tunnel 通过公网连接
# Install Expo Go on your phone and scan the QR code
```

## 项目结构 · Project Structure

```
src/
├── context/        全局状态 (useReducer + Context) · Global state
├── components/     UI 组件 · UI components (GoalCard, HeatmapCell, etc.)
├── screens/        页面 · Screens (Home, GoalDetail, Heatmap, etc.)
├── db/             SQLite 数据层 · Data layer (schema, repository, migrate)
├── navigation/     导航配置 · Navigation config (Tab + Stack)
├── utils/          工具函数 · Utility functions
├── types/          TypeScript 类型定义 · Type definitions
├── constants/      颜色、字号、间距 · Design tokens
└── storage/        AsyncStorage — 仅用于旧数据迁移 · legacy migration only
```

## 截图 · Screenshots

*开发中，待补充 · In development, coming soon*
