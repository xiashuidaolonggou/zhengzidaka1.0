// 16 种可选目标颜色（墨韵调色板 — 在暖纸底色上依然鲜明）
export const GOAL_COLORS = [
  '#4A7FB5', // 靛蓝
  '#4DAF7C', // 青绿
  '#7C6EB0', // 藤紫
  '#D4A843', // 赭黄
  '#E07B5E', // 暖橙
  '#C44B4B', // 朱砂
  '#3D3D3D', // 墨黑
  '#D4688C', // 胭脂
  '#5C9E8F', // 碧青
  '#6EA5C9', // 天蓝
  '#9B8E6B', // 艾绿
  '#8E6BB0', // 菫紫
  '#C4954B', // 金赭
  '#C47A7A', // 玫瑰棕
  '#7B8FA0', // 石蓝
  '#A0785C', // 茶褐
];

// 默认颜色
export const DEFAULT_COLOR = GOAL_COLORS[0];

// UI 用色 — 宣纸/墨韵主题
export const COLORS = {
  background: '#FAF5ED',     // 宣纸底
  surface: '#FFFBF5',        // 表层暖白
  textPrimary: '#1C1915',    // 浓墨
  textSecondary: '#8B8378',  // 淡墨灰
  border: '#E6DED3',         // 纸纹边线
  emptyStroke: '#D8CFC0',    // 空白正字边框
  accent: '#B8433F',         // 印章红（点缀用）
  accentBlue: '#4A7FB5',     // 靛蓝（主要交互色）
};
