import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../constants';
import Svg, { Path } from 'react-native-svg';

interface EmptyStateProps {
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {/* 空正字水墨感图标 */}
      <View style={styles.iconContainer}>
        <Svg width={80} height={80} viewBox="0 0 100 100">
          <Path
            d="M 10 10 L 90 10 L 90 90 L 10 90 Z"
            stroke={COLORS.emptyStroke}
            strokeWidth={1.5}
            strokeDasharray="10 6"
            fill="none"
          />
          <Path
            d="M 22 20 L 83 20 M 50 20 L 50 85 M 50 52 L 78 52 M 28 39 L 28 85 M 15 85 L 85 85"
            stroke={COLORS.emptyStroke}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
            opacity={0.3}
          />
        </Svg>
      </View>

      <Text style={styles.message}>{message}</Text>

      {actionLabel !== '' && (
        <Text style={styles.action} onPress={onAction}>
          {actionLabel}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.lg,
    opacity: 0.6,
  },
  message: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.lg * 1.6,
    marginBottom: SPACING.lg,
  },
  action: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.accent,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
  },
});
