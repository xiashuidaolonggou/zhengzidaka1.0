import { View, StyleSheet } from 'react-native';
import { ZhengChar } from './ZhengChar';
import { TallyChar } from './TallyChar';
import { StarChar } from './StarChar';
import { strokesToZheng } from '../utils/tally';
import { SPACING } from '../constants';
import type { CountStyle } from '../types';

interface ZhengGridProps {
  totalCount: number;
  charSize?: number;
  columns?: number;
  color: string;
  animateNewest?: boolean;
  countStyle?: CountStyle;
}

export function ZhengGrid({
  totalCount,
  charSize = 60,
  columns = 5,
  color,
  animateNewest = false,
  countStyle = 'zheng',
}: ZhengGridProps) {
  const { fullChars, partialStrokes } = strokesToZheng(totalCount);

  const chars: number[] = [
    ...Array(fullChars).fill(5),
    ...(partialStrokes > 0 ? [partialStrokes] : []),
  ];

  if (chars.length === 0) {
    chars.push(0);
  }

  const gap = SPACING.sm + 1;
  const containerWidth = charSize * columns + gap * (columns - 1);

  const CharComponent =
    countStyle === 'tally' ? TallyChar :
    countStyle === 'star' ? StarChar :
    ZhengChar;

  return (
    <View style={[styles.grid, { width: containerWidth, gap }]}>
      {chars.map((strokes, index) => (
        <CharComponent
          key={index}
          filledStrokes={strokes}
          size={charSize}
          color={color}
          animateNewest={animateNewest && index === chars.length - 1}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
