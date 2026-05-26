# 正字打卡

基于 React Native + Expo 的习惯追踪 App，纯本地存储。灵感来自中国传统「画正字」计数法。

## 功能

- **三种计数方式** — 正字（5笔逐画动画）、四竖一横、五角星
- **滑动操作** — 左滑删除、右滑置顶，仿 iOS 邮件交互
- **批量编辑** — 多选、全选、批量置顶/删除
- **年度热力图** — GitHub Contributions 风格，墨韵配色
- **连续天数统计** — 自动计算每个目标的连续打卡天数
- **纯本地存储** — SQLite 持久化，无需注册、无后端

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React Native 0.81.5 + Expo SDK 54 |
| 语言 | TypeScript ~5.9.2 |
| 导航 | @react-navigation/native v7（Bottom Tabs + Native Stack） |
| 数据库 | expo-sqlite ~16 |
| 动画 | react-native-reanimated v4 + react-native-gesture-handler v2 |
| SVG | react-native-svg 15 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 手机安装 Expo Go，扫码运行
# 手机和电脑需在同一 WiFi，或使用 tunnel 模式：npx expo start --tunnel
```

## 项目结构

```
src/
├── context/        GoalContext — 全局状态（useReducer + Context）
├── components/     UI 组件（GoalCard, HeatmapCell, ZhengGrid 等）
├── screens/        页面（HomeScreen, GoalDetailScreen, HeatmapScreen 等）
├── db/             SQLite 数据层（schema, repository, migrate）
├── navigation/     导航配置（Tab + Stack）
├── utils/          工具函数（热力图计算等）
├── types/          TypeScript 类型定义
├── constants/      颜色、字号、间距常量
└── storage/        AsyncStorage（仅用于旧数据迁移）
```

## 截图

*开发中，待补充*
