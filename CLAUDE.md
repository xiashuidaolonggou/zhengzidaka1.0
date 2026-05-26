# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概况

正字打卡 — 基于 React Native + Expo SDK 54 的习惯追踪 App。纯本地存储（expo-sqlite），无需后端。支持三种计数方式：正字（5笔逐画动画）、四竖一横、五角星。

## 常用命令

```bash
npx expo start          # 启动开发服务器（局域网模式），扫码在 Expo Go 中运行
npx expo start --tunnel # tunnel 模式（中国地区不稳定，优先用局域网模式）
npx tsc --noEmit        # TypeScript 类型检查（唯一的质量验证手段）
```

## 版本约束（重要）

项目已降级到 Expo SDK 54 以匹配用户的 Expo Go（版本 1017756，仅支持 SDK 54）。

**依赖版本必须与 Expo Go 原生层严格对齐**，否则启动即崩溃。以下组合已验证：

| 包 | 版本 | 约束原因 |
|---|---|---|
| `react-native-reanimated` | `^4.1.1` | Expo Go SDK 54 内置 reanimated v4 原生代码，装 v3 JS 会崩溃 |
| `react-native-worklets` | `^0.5.1` | **必须**精确匹配 Expo Go 内置版本，不能升到 0.8.x |
| `react-native-gesture-handler` | `~2.28.0` | v2 API（`Gesture.Pan()`），不支持 v1 的 PanResponder |
| `react-native` | `0.81.5` | SDK 54 对应的 RN 版本 |
| `react` | `19.1.0` | 匹配 RN 0.81.5 的 React 版本 |

**babel.config.js** 只包含 `babel-preset-expo`，不要手动添加 `react-native-reanimated/plugin`——`babel-preset-expo` 会自动检测并注入，手动重复添加会导致 worklet 编译损坏。

## 技术栈

- Expo SDK 54 + React Native 0.81.5 + React 19.1.0 + TypeScript ~5.9.2 + Hermes
- 导航: @react-navigation/native v7（BottomTabs + NativeStack）
- 状态管理: React Context + useReducer（无第三方状态库）
- 本地存储: expo-sqlite ~16.0.10（SQLite 数据库 `tallycheckin.db`，启动时自动初始化 schema + 迁移旧 AsyncStorage 数据）
- 手势/动画: react-native-gesture-handler ~2.28 + react-native-reanimated ^4.1.1 + react-native-worklets ^0.5.1
- SVG: react-native-svg 15.12（正字笔画用 `react-native-reanimated` 原生驱动 `createAnimatedComponent(Path)` 不兼容，必须用 RN 的 `Animated` + JS driver）

## 架构

### 导航结构

```
App.tsx
  └─ GestureHandlerRootView（必须最外层，手势系统入口）
       └─ SafeAreaProvider
            └─ GoalProvider（Context）
                 └─ NavigationContainer
                      └─ BottomTabNavigator
                           ├─ Tab "目标" → GoalStack (NativeStack)
                           │    ├─ Home        → 目标列表 + 滑动操作 + 编辑模式
                           │    ├─ CreateGoal  → 表单：标题 + 描述 + 16色选择 + 计数方式
                           │    └─ GoalDetail  → 计数网格 + 打卡/撤销按钮
                           └─ Tab "统计" → StatsStack (NativeStack)
                                ├─ StatsList   → 原 StatsScreen：总次数/连续天数/迷你网格
                                │                header 右侧「热力图」按钮
                                └─ Heatmap     → 年度打卡热力图（GitHub 风格）
```

GoalDetailScreen 通过 `navigation.getParent()?.setOptions({ tabBarStyle })` 隐藏 Tab 栏。

### 数据模型

```typescript
type CountStyle = 'zheng' | 'tally' | 'star';

Goal {
  id: string; title: string; description: string;
  color: string; countStyle: CountStyle;
  pinned?: boolean; createdAt: number;
}

CheckIn { id: string; goalId: string; timestamp: number; }

// 热力图聚合类型
DayStats { date: string; count: number; goalIds: string[]; level: number; }
DayMap = Map<string, DayStats>;
```

### 数据流

```
GoalContext (useReducer + Context)
  ├─ 启动: ensureSchema() → migrateFromAsyncStorage() → loadFullState() → LOAD_STATE dispatch
  │         建表/迁移均幂等，迁移仅在 SQLite 为空时执行，不覆盖已有数据
  ├─ 每次 dispatch 后 useEffect 自动 saveFullState(state)
  │         事务内 DELETE ALL + INSERT ALL，一次写入保证原子性
  ├─ 批量操作 BATCH_DELETE_GOALS / BATCH_SET_PIN 一次 dispatch 完成，避免 N 次 re-render
  └─ 所有页面通过 useGoals() hook 消费（暴露 goals、checkIns、getCheckIns 等 11 个成员）
```

**连续天数计算**: 实际运行的是 `GoalContext.tsx` 中的私有函数 `calculateStreak(CheckIn[])`。`utils/tally.ts` 中有一个同名不同参的导出版本 `calculateStreak(number[])`，是死代码，修改算法时需对准位置。

### SQLite 数据层

```
src/db/
├── schema.ts     — DDL（goals 7列、checkins 3列、_migrations），SCHEMA_VERSION=1
├── database.ts   — getDatabase() 单例，ensureSchema() 幂等建表
├── repository.ts — loadFullState() / saveFullState() / isEmpty()
├── migrate.ts    — migrateFromAsyncStorage()：幂等一次性迁移，三层保护（isEmpty/loadState/try-catch）
└── index.ts      — barrel export
```

迁移后旧 AsyncStorage 数据保留作为备份（不删除）。

### GoalCard 滑动手势系统

`GoalCard.tsx` 是项目最复杂的组件。使用 **gesture-handler v2 Pan gesture + reanimated v4 worklets** 实现类似 iOS 邮件的滑动操作。

**Constants:**
- `LEFT_WIDTH = 72`（pin 按钮宽度）
- `RIGHT_WIDTH = 130`（folder + delete，每个 65px）
- `OVER_THRESHOLD = SCREEN_WIDTH * 0.35`（过滑动触发阈值）
- `SPRING_CONFIG = { damping: 15, stiffness: 170, mass: 0.5 }`

**Worklet 工具函数（运行在 UI 线程）:**
- `rubberBand(value, limit)` — 弹性阻尼，`sign * (limit + (1 - exp(-excess/100)) * 60)`
- `snapToClosest(tx, leftW, rightW, velocityX)` — 根据位置+速度决定吸附到左开/右开/关闭

**开关闭逻辑:**
- 右滑露出 pin 按钮（金/黄色，LEFT_WIDTH 宽）
- 左滑露出 folder（蓝色）+ delete（红色），共 RIGHT_WIDTH 宽
- `rowState` shared value: 0=关闭, 1=右开, -1=左开
- `isActive` prop 控制互斥锁：同一时间只能打开一张卡片

**过滑动 (overswipe):**
- 左滑超 35% 屏宽 → 自动删除（卡片高度塌陷动画 → `onSwipeDelete`）
- 右滑超 35% 屏宽 → 自动切换 pin 状态
- 过滑动使用 rubberBand 函数做弹性效果

**编辑模式禁用手势:**
- `editingSv` shared value 在 `onUpdate`/`onEnd` 开头检查，若为 true 直接 return
- 手势对象无需重建，切换零成本

### 多选/批量编辑模式

状态集中在 `HomeScreen.tsx`:
- `isEditing: boolean` — 是否处于编辑模式
- `selectedIds: Set<string>` — 选中集合，用 `new Set(prev)` 创建新引用触发渲染

**动画（GoalCard.tsx）:**
- `editProgress` shared value (0→1) 驱动 `paddingLeft` 从 `SPACING.md` 到 `SPACING.md + CHECKBOX_WIDTH`
- 勾选框绝对定位在左侧 padding 区域，`opacity` + `translateX` 淡入滑入
- `selectedSv` 驱动选中缩放弹性动画

**底部工具栏（EditToolbar.tsx）:**
- `translateY` + `opacity` 弹簧动画，适配 `useSafeAreaInsets`
- 三按钮：全部置顶 / 取消置顶 / 删除(n)
- 批量操作调用 `deleteGoals(ids)` / `setPins(ids, pinned)`，操作后自动退出编辑模式

**性能设计:**
- `GoalCard` 用 `React.memo` 包裹（注意：HomeScreen 的 handler 回调未用 `useCallback`，memo 效果有限）
- 批量 reducer action 一次 dispatch vs N 次单独 dispatch

### 年度热力图

`HeatmapScreen` 提供 GitHub Contributions 风格的年度打卡可视化。

**数据流:**
```
useGoals().checkIns → buildDayMap(checkIns, year) → DayMap → HeatmapGrid
                           │
                           └─ countToLevel(count) → 0-5 颜色层级
```

**组件树:**
```
HeatmapScreen（年份切换、年度总次数、选中日期详情）
  └─ HeatmapGrid（ScrollView 横向滚动、7行×~53列、月份/星期标签）
       ├─ HeatmapCell × N（React.memo + Pressable + reanimated 按压缩放）
       └─ HeatmapLegend（6 级墨色图例）
```

**颜色映射（宣纸墨韵）:**
```
L0: #EDE8DF (0次) → L1: #CFC9BD → L2: #A0988B → L3: #70685E → L4: #423B33 → L5: #1C1915 (11+次)
```

**核心文件:**
- `src/utils/heatmap.ts` — 日期网格计算、颜色映射、数据聚合（`buildDayMap`、`getDateForCell`、`getMonthLabels`）
- `src/components/HeatmapCell.tsx` — 单个单元格，React.memo 自定义比较函数（只比 level + isSelected）
- `src/components/HeatmapGrid.tsx` — 网格布局，7行星期标签 + 53列单元格 + 横向滚动
- `src/components/HeatmapLegend.tsx` — 6级色块图例
- `src/screens/HeatmapScreen.tsx` — 页面容器，年份切换（◀ ▶）、选中日期详情卡片

导航: 统计 Tab → header 右侧「热力图」→ `StatsStack` 内的 `Heatmap` 屏幕。

### 计数方式组件

三种计数方式对应三个 SVG 组件，由 `ZhengGrid` 根据 `countStyle` 分发：

| countStyle | 组件 | 颜色 | 视觉含义 |
|---|---|---|---|
| `'zheng'` | `ZhengChar` | 总计次数色 | 5 笔逐画动画 |
| `'tally'` | `TallyChar` | 总计次数色 | 四竖一横 |
| `'star'` | `StarChar` | 总计次数色 | 五角星 |

`CheckInButton` 独立于计数组件，有自己的脉冲呼吸动画和按压缩放动画。

### 正字 SVG（ZhengChar）

五笔坐标在 `STROKES` 数组，viewBox 0 0 100 100：

| 笔 | 路径 | 描述 |
|---|---|---|
| 1 | M 22 20 L 83 20 | 顶横 |
| 2 | M 50 20 L 50 85 | 右竖（中点贯穿） |
| 3 | M 50 52 L 78 52 | 中横 |
| 4 | M 28 39 L 28 85 | 左竖 |
| 5 | M 15 85 L 85 85 | 底横 |

动画用 stroke-dasharray + Animated.timing，最新一笔 300ms 入场。**不支持 native driver**（Animated 不支持 SVG 属性），必须用 JS driver。

### 撤销逻辑

`UNDO_CHECK_IN` reducer：过滤该 goalId 的所有 checkIn，按 timestamp 降序移除最新一条。

## 已知问题

**HomeScreen.tsx** — `handleDelete`、`handleSwipeDelete`、`handleLongPress` 未用 `useCallback`，导致 `GoalCard` 的 `React.memo` 完全失效（props 每次都变）。修复：包裹 `useCallback` 并确认 Context 的 `deleteGoal` 等方法也已稳定化。

## 注意事项

- 不依赖 @expo/vector-icons，图标用 emoji 替代
- 空状态用虚线矩形框占位；无打卡时显示一个空正字框（0 笔画）
- 删除目标会一并清除其所有打卡记录（SQLite FOREIGN KEY ON DELETE CASCADE）
- 滑动手势删除（过滑动）无二次确认弹窗，按钮删除和长按删除有 Alert 确认——这是有意的交互设计差异
- SQLite 读写失败静默处理（`catch {}`）。对本地优先 App 是可接受的折中，但长期建议加 `console.error`
- `Goal.pinned` 是可选字段（`pinned?: boolean`），消费方需处理 undefined
- `migrateFromAsyncStorage()` 仅在 SQLite 为空时执行一次，旧 AsyncStorage 数据保留不删
- `saveFullState()` 采用全量写入（DELETE ALL + INSERT ALL），数据集小（<1000条）时性能足够
- 中国地区使用 `expo start --tunnel` 常因 ngrok 被封而失败，优先用局域网模式 `expo start`
