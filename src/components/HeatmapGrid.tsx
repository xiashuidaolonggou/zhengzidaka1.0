import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getDateForCell, getWeeksInYear, getMonthLabels, levelToColor } from '../utils/heatmap';
import { HeatmapCell } from './HeatmapCell';
import { HeatmapLegend } from './HeatmapLegend';
import type { DayMap } from '../types';
import { FONT_SIZE, COLORS } from '../constants';

const CELL_SIZE = 15;
const CELL_GAP = 2.5;
const LABEL_WIDTH = 22;

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

interface HeatmapGridProps {
  year: number;
  dayMap: DayMap;
  selectedDate: string | null;
  isDark: boolean;
  onSelectDate: (date: string | null) => void;
}

export function HeatmapGrid({ year, dayMap, selectedDate, isDark, onSelectDate }: HeatmapGridProps) {
  const weeks = getWeeksInYear(year);
  const monthLabels = getMonthLabels(year);
  const cellStep = CELL_SIZE + CELL_GAP * 2;

  const handlePress = (date: string) => {
    onSelectDate(selectedDate === date ? null : date);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View>
        {/* 月份标签行 */}
        <View style={[styles.monthRow, { width: weeks * cellStep + LABEL_WIDTH }]}>
          {monthLabels.map((m) => (
            <Text
              key={m.label}
              style={[
                styles.monthLabel,
                { left: LABEL_WIDTH + m.col * cellStep },
                isDark && styles.monthLabelDark,
              ]}
            >
              {m.label}
            </Text>
          ))}
        </View>

        {/* 7 行网格 */}
        {WEEKDAYS.map((label, row) => (
          <View key={row} style={styles.row}>
            {/* 星期标签 */}
            <View style={styles.weekdayLabel}>
              <Text style={[styles.weekdayText, isDark && styles.weekdayTextDark]}>
                {label}
              </Text>
            </View>

            {/* 该行所有单元格 */}
            {Array.from({ length: weeks }, (_, col) => {
              const date = getDateForCell(year, col, row);
              if (!date) {
                return (
                  <View
                    key={col}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      margin: CELL_GAP,
                    }}
                  />
                );
              }
              const stats = dayMap.get(date);
              return (
                <HeatmapCell
                  key={date}
                  date={date}
                  level={stats?.level ?? 0}
                  size={CELL_SIZE}
                  gap={CELL_GAP}
                  isSelected={selectedDate === date}
                  isDark={isDark}
                  onPress={handlePress}
                />
              );
            })}
          </View>
        ))}

        {/* 图例 */}
        <View style={styles.legendRow}>
          <HeatmapLegend isDark={isDark} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 4,
  },
  monthRow: {
    height: 22,
    position: 'relative',
  },
  monthLabel: {
    position: 'absolute',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
  },
  monthLabelDark: {
    color: '#8B8070',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weekdayLabel: {
    width: LABEL_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    height: CELL_SIZE + CELL_GAP * 2,
  },
  weekdayText: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  weekdayTextDark: {
    color: '#8B8070',
  },
  legendRow: {
    alignItems: 'flex-end',
    paddingRight: 4,
  },
});
