import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGoals } from '../context/GoalContext';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { buildDayMap } from '../utils/heatmap';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';

export function HeatmapScreen() {
  const { checkIns, goals } = useGoals();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const isDark = false; // 深色模式预留

  const dayMap = useMemo(() => buildDayMap(checkIns, year), [checkIns, year]);

  const selectedStats = selectedDate ? dayMap.get(selectedDate) : null;

  const yearTotal = useMemo(() => {
    let total = 0;
    for (const [, stats] of dayMap) {
      total += stats.count;
    }
    return total;
  }, [dayMap]);

  return (
    <View style={styles.container}>
      {/* 年份切换 */}
      <View style={styles.yearRow}>
        <TouchableOpacity onPress={() => setYear((y) => y - 1)} style={styles.yearBtn}>
          <Text style={styles.yearArrow}>◀</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}年</Text>
        <TouchableOpacity
          onPress={() => setYear((y) => y + 1)}
          style={styles.yearBtn}
          disabled={year >= currentYear}
        >
          <Text style={[styles.yearArrow, year >= currentYear && styles.yearArrowDisabled]}>
            ▶
          </Text>
        </TouchableOpacity>
        <View style={styles.totalBadge}>
          <Text style={styles.totalCount}>{yearTotal}</Text>
          <Text style={styles.totalLabel}>次打卡</Text>
        </View>
      </View>

      {/* 选中日期详情 */}
      {selectedStats && (
        <View style={styles.detailCard}>
          <Text style={styles.detailDate}>
            {selectedStats.date.slice(5)} · {selectedStats.count} 次打卡
          </Text>
          {selectedStats.goalIds.length > 0 && (
            <Text style={styles.detailGoals} numberOfLines={2}>
              {selectedStats.goalIds
                .map((id) => goals.find((g) => g.id === id)?.title)
                .filter(Boolean)
                .join(' / ')}
            </Text>
          )}
        </View>
      )}

      {/* 热力网格 */}
      <View style={styles.gridCard}>
        <HeatmapGrid
          year={year}
          dayMap={dayMap}
          selectedDate={selectedDate}
          isDark={isDark}
          onSelectDate={setSelectedDate}
        />
      </View>

      {/* 提示 */}
      <Text style={styles.hint}>点击格子查看详情 · 滑动查看更多月份</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  yearBtn: {
    padding: SPACING.sm,
  },
  yearArrow: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textPrimary,
  },
  yearArrowDisabled: {
    opacity: 0.25,
  },
  yearText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    minWidth: 80,
    textAlign: 'center',
  },
  totalBadge: {
    marginLeft: 'auto',
    alignItems: 'center',
  },
  totalCount: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.accentBlue,
  },
  totalLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  detailCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    elevation: 1,
    shadowColor: '#8B8378',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  detailDate: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailGoals: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  gridCard: {
    marginHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    elevation: 1,
    shadowColor: '#8B8378',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  hint: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
});
