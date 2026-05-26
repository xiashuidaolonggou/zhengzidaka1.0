import type { DayMap, DayStats, CheckIn } from '../types';

// ── 颜色层级（宣纸墨韵主题） ──

const LEVEL_THRESHOLDS = [0, 1, 2, 4, 7, 11];

export const LEVEL_COLORS_LIGHT = [
  '#EDE8DF', // L0 - 无打卡，几乎隐入宣纸底
  '#CFC9BD', // L1 - 1次
  '#A0988B', // L2 - 2-3次
  '#70685E', // L3 - 4-6次
  '#423B33', // L4 - 7-10次
  '#1C1915', // L5 - 11+次（浓墨）
];

export const LEVEL_COLORS_DARK = [
  '#2A2722',
  '#3D3832',
  '#5C544A',
  '#8B8070',
  '#C4B8A8',
  '#E8DED0',
];

/** 打卡次数 → 颜色层级 (0-5) */
export function countToLevel(count: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (count >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
}

/** 层级 → 色值 */
export function levelToColor(level: number, isDark: boolean): string {
  const palette = isDark ? LEVEL_COLORS_DARK : LEVEL_COLORS_LIGHT;
  return palette[Math.max(0, Math.min(level, palette.length - 1))];
}

// ── 日期网格计算 ──

/** 年份第 0 周从包含 1 月 1 日的周日开始，返回该周日的 Date */
function firstSundayOfYear(year: number): Date {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay(); // 0=Sun
  const d = new Date(jan1);
  d.setDate(d.getDate() - day);
  return d;
}

/** 根据网格坐标反推日期，超出年份范围返回 null */
export function getDateForCell(year: number, col: number, row: number): string | null {
  const sunday = firstSundayOfYear(year);
  const days = col * 7 + row;
  const d = new Date(sunday);
  d.setDate(d.getDate() + days);
  if (d.getFullYear() !== year) return null;
  return toDateKey(d);
}

// ── 工具 ──

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 某年共多少列（从第一周周日到最后一周周六） */
export function getWeeksInYear(year: number): number {
  const start = firstSundayOfYear(year);
  const end = new Date(year, 11, 31);
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000);
  return Math.ceil((days + 1) / 7);
}

/** 每月 1 号在网格中的列偏移，用于定位月份标签 */
export function getMonthLabels(year: number): { label: string; col: number }[] {
  const sunday = firstSundayOfYear(year);
  const months = [];
  for (let m = 0; m < 12; m++) {
    const first = new Date(year, m, 1);
    const days = Math.floor((first.getTime() - sunday.getTime()) / 86400000);
    const col = Math.floor(days / 7);
    months.push({ label: `${m + 1}月`, col });
  }
  return months;
}

// ── 数据聚合 ──

/** 从 checkIns 构建 DayMap：Key=日期字符串，Value=DayStats */
export function buildDayMap(checkIns: CheckIn[], year: number): DayMap {
  const map = new Map<string, DayStats>();
  const yearStart = new Date(year, 0, 1).getTime();
  const yearEnd = new Date(year + 1, 0, 1).getTime();

  for (const c of checkIns) {
    if (c.timestamp < yearStart || c.timestamp >= yearEnd) continue;
    const date = toDateKey(new Date(c.timestamp));
    const entry = map.get(date);
    if (entry) {
      entry.count++;
      if (!entry.goalIds.includes(c.goalId)) entry.goalIds.push(c.goalId);
    } else {
      map.set(date, { date, count: 1, goalIds: [c.goalId], level: 0 });
    }
  }

  for (const [, stats] of map) {
    stats.level = countToLevel(stats.count);
  }

  return map;
}
