import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoals } from '../context/GoalContext';
import { ZhengGrid } from '../components/ZhengGrid';
import { CheckInButton } from '../components/CheckInButton';
import { StreakBadge } from '../components/StreakBadge';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '../constants';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GoalStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<GoalStackParamList, 'GoalDetail'>;

export function GoalDetailScreen({ route, navigation }: Props) {
  const { goalId } = route.params;
  const { goals, getCheckInCount, getStreak, checkIn, undoCheckIn } = useGoals();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const tabNav = navigation.getParent()?.getParent();
    if (tabNav) {
      tabNav.setOptions({ tabBarStyle: { display: 'none' as const } });
      return () => {
        tabNav.setOptions({
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: COLORS.border,
            display: 'flex' as const,
          },
        });
      };
    }
  }, [navigation]);

  const goal = goals.find((g) => g.id === goalId);

  if (!goal) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFound}>目标不存在</Text>
      </View>
    );
  }

  const count = getCheckInCount(goalId);
  const streak = getStreak(goalId);
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 目标信息区 */}
        <View style={styles.header}>
          <View style={[styles.colorDot, { backgroundColor: goal.color }]} />
          <Text style={styles.title}>{goal.title}</Text>
          {goal.description ? (
            <Text style={styles.description}>{goal.description}</Text>
          ) : null}
        </View>

        {/* 连续天数 + 日期 */}
        <View style={styles.metaRow}>
          <StreakBadge streak={streak} />
          <Text style={styles.today}>{today}</Text>
        </View>

        {/* 正字网格 — 视觉重心 */}
        <View style={styles.gridCard}>
          <ZhengGrid
            totalCount={count}
            charSize={60}
            columns={4}
            color={goal.color}
            animateNewest
            countStyle={goal.countStyle ?? 'zheng'}
          />
        </View>

        {/* 完成次数 */}
        <View style={styles.countRow}>
          <View style={styles.countLine} />
          <Text style={styles.countText}>
            共 <Text style={{ color: goal.color, fontWeight: '700' }}>{count}</Text> 次
          </Text>
          <View style={styles.countLine} />
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
        <Text
          style={[styles.undo, count === 0 && styles.undoDisabled]}
          onPress={count > 0 ? () => undoCheckIn(goalId) : undefined}
          suppressHighlighting
        >
          撤销
        </Text>
        <CheckInButton onPress={() => checkIn(goalId)} />
        <View style={{ width: 50 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  notFound: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  scroll: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  description: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs + 2,
    lineHeight: FONT_SIZE.md * 1.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: SPACING.xl,
  },
  today: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  gridCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
    elevation: 2,
    shadowColor: '#8B8378',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    alignItems: 'center',
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
    gap: SPACING.md,
  },
  countLine: {
    width: 24,
    height: 1,
    backgroundColor: COLORS.border,
  },
  countText: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  undo: {
    fontSize: FONT_SIZE.md,
    color: COLORS.accent,
    fontWeight: '500',
    width: 50,
    textAlign: 'center',
  },
  undoDisabled: {
    color: COLORS.emptyStroke,
  },
});
