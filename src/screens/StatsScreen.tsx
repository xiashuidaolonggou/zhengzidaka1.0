import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useGoals } from '../context/GoalContext';
import { ZhengGrid } from '../components/ZhengGrid';
import { EmptyState } from '../components/EmptyState';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';

export function StatsScreen() {
  const { goals, getCheckInCount, getStreak } = useGoals();

  if (goals.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          message="还没有目标\n先去创建一个吧"
          actionLabel=""
          onAction={() => {}}
        />
      </View>
    );
  }

  const sorted = [...goals].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const count = getCheckInCount(item.id);
          const streak = getStreak(item.id);
          const daysSinceCreation = Math.max(
            1,
            Math.floor((Date.now() - item.createdAt) / 86400000) + 1
          );

          return (
            <View style={styles.card}>
              {/* 标题行 */}
              <View style={styles.titleRow}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>

              {/* 统计数字 */}
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statValue, { color: item.color }]}>{count}</Text>
                  <Text style={styles.statLabel}>总次数</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {streak > 0 ? streak : '—'}
                  </Text>
                  <Text style={styles.statLabel}>连续天数</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{daysSinceCreation}</Text>
                  <Text style={styles.statLabel}>创建天数</Text>
                </View>
              </View>

              {/* 迷你正字网格 */}
              <View style={styles.miniGrid}>
                <ZhengGrid totalCount={count} charSize={30} columns={8} color={item.color} countStyle={item.countStyle ?? 'zheng'} />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  list: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#8B8378',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm + 2,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 3,
  },
  miniGrid: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
  },
});
