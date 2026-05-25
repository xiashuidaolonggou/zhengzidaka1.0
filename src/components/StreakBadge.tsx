import { View, Text, StyleSheet } from 'react-native';
import { FONT_SIZE, SPACING, BORDER_RADIUS, COLORS } from '../constants';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.dot}>●</Text>
      <Text style={styles.text}>连续 {streak} 天</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF0ED',
    paddingHorizontal: SPACING.md - 2,
    paddingVertical: SPACING.xs + 1,
    borderRadius: BORDER_RADIUS.round,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F5D5CE',
  },
  dot: {
    fontSize: 8,
    color: COLORS.accent,
    marginRight: 5,
  },
  text: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.accent,
    fontWeight: '600',
  },
});
