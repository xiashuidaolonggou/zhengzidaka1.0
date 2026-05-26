import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { levelToColor } from '../utils/heatmap';

const SPRING = { damping: 15, stiffness: 170, mass: 0.5 };

interface HeatmapCellProps {
  date: string;
  level: number;
  size: number;
  gap: number;
  isSelected: boolean;
  isDark: boolean;
  onPress: (date: string) => void;
}

function HeatmapCellRaw({ date, level, size, gap, isSelected, isDark, onPress }: HeatmapCellProps) {
  const pressedSv = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressedSv.value }],
  }));

  const color = levelToColor(level, isDark);

  return (
    <Pressable
      onPressIn={() => { pressedSv.value = withSpring(0.7, SPRING); }}
      onPressOut={() => { pressedSv.value = withSpring(1, SPRING); }}
      onPress={() => onPress(date)}
      style={[
        styles.cell,
        {
          width: size,
          height: size,
          margin: gap,
          backgroundColor: color,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isDark ? '#E8DED0' : '#1C1915',
        },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]} />
    </Pressable>
  );
}

export const HeatmapCell = React.memo(HeatmapCellRaw, (prev, next) =>
  prev.level === next.level &&
  prev.isSelected === next.isSelected &&
  prev.size === next.size &&
  prev.isDark === next.isDark
);

const styles = StyleSheet.create({
  cell: {
    borderRadius: 3,
    overflow: 'hidden',
  },
});
